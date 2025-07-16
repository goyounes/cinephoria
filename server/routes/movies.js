import { Router } from 'express';
const router = Router();

import multer from 'multer';
import { verifyAdminJWT, verifyEmployeeJWT } from '../controllers/auth.js';

import { addMovie, getOneMovieWithGenres, getMoviesWithGenres, getGenres, deleteMovie, updateMovie, getUpcomingMovies, getUpcomingMoviesWithGenres } from '../controllers/movies.js';
import { getUpcomingScreenings , getAllScreenings} from '../controllers/screenings.js';

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import sharp from 'sharp'
import randomImageName from '../utils/randomImageName.js';
import { CombineGenresIdNames } from '../utils/index.js';


const bucketName = process.env.S3_BUCKET_NAME;
const bucketRegion = process.env.S3_BUCKET_REGION;
const accesKey = process.env.S3_BUCKET_ACCES_KEY;
const secretAcces_key = process.env.S3_BUCKET_SECRET_ACCES_KEY;

const s3 = new S3Client({
    credentials: {
        accessKeyId: accesKey,  
        secretAccessKey: secretAcces_key,
    },
    region: bucketRegion
})

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
upload.single('poster_img_file') // 'poster_img_file' is the field name in the form

router.get("/", async (req,res,next) => {
    try {
        const rawMovies = await getMoviesWithGenres()
        const movies = CombineGenresIdNames(rawMovies)
        for (const movie of movies){
            const getObjectParams = {
                Bucket: bucketName,
                Key: movie.poster_img_name
            };
            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // URL expires in 1 hour
            movie.imageUrl =  url; // Add the URL to the movie object
        };

        res.status(200).json(movies)
    } catch (error) {
        next(error)
    }
})

router.post("/",verifyEmployeeJWT ,upload.single('poster_img_file'), async (req,res,next) => {
    if (!req.body.title) {
        const err = new Error("Missing movie title");
        err.status = 400;
        return next(err); 
    }

    let imageName
    let imageUploaded = false
    
    try {

        imageName = randomImageName(); 
        if (!req.file) {
            const copyParams = {
                Bucket: bucketName,
                CopySource: `${bucketName}/default_poster_img.webp`, 
                Key: imageName, 
                ContentType: 'image/webp',
                MetadataDirective: 'REPLACE', 
            };
            const copyCommand = new CopyObjectCommand(copyParams);
            await s3.send(copyCommand);
            console.log(`Copied default image to S3 as "${imageName} successfully"`);
        }else{
            const resizedImageBuffer = await sharp(req.file.buffer)
                .resize(225, 300)
                .toFormat('webp')
                .toBuffer();

            const params = {
                Bucket: bucketName,
                Key: imageName, 
                Body: resizedImageBuffer, 
                ContentType: req.file.mimetype, // e.g., 'image/png'
            }
            const command = new PutObjectCommand(params)

            await s3.send(command)
            console.log("s3 bucket upload successful");
        }
        imageUploaded = true

        const result = await addMovie({
                title : req.body.title, 
                poster_img_name : imageName, 
                description :   req.body.description,
                age_rating : req.body.age_rating || 0, 
                is_team_pick : req.body.is_team_pick || 0, 
                score :  req.body.score || 0, 
                length : `${req.body.length_hours|| "00"}:${req.body.length_minutes|| "00"}:${req.body.length_seconds|| "00"}`,
                genres : req.body.selectedGenres
        })

        res.status(201).json({
            message: "Movie added successfully to the database",
            imageName: imageName,
            movie: req.body,
            movieInsertResult: result,
        });

    } catch (error) {
        //delete the image if the add movie operation fails
        console.error("Error during movie upload process:", error);

        if (imageUploaded && imageName && imageName !== "default_poster_img.webp") {
            try {
                const deleteParams = {
                    Bucket: bucketName,
                    Key: imageName,
                };
                const deleteCommand = new DeleteObjectCommand(deleteParams);
                await s3.send(deleteCommand);
                console.log(`Rolled back image upload: ${imageName} deleted from S3`);
            } catch (deleteError) {
                console.error("Failed to delete image from S3 after operation failure:", deleteError);
            }
        }
        next(error); 
    }
})

router.get("/recent",async (req,res,next) => {
    try {
        const rawMovies = await getMoviesAddedSince()
        const movies = CombineGenresIdNames(rawMovies)
        for (const movie of movies){
            const getObjectParams = {
                Bucket: bucketName,
                Key: movie.poster_img_name
            };
            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // URL expires in 1 hour
            movie.imageUrl =  url; // Add the URL to the movie object
        };

        res.status(200).json(movies)
    } catch (error) {
        next(error)
    }
})

router.get("/upcoming",async (req,res,next) => {
    try {
        const rawMovies = await getUpcomingMoviesWithGenres()
        const movies = CombineGenresIdNames(rawMovies)
        for (const movie of movies){
            const getObjectParams = {
                Bucket: bucketName,
                Key: movie.poster_img_name
            };
            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // URL expires in 1 hour
            movie.imageUrl =  url; // Add the URL to the movie object
        };

        res.status(200).json(movies)
    } catch (error) {
        next(error)
    }
})

router.get("/genres",async (req,res,next) => {
    try {
        const genres = await getGenres()
        res.status(200).json(genres)
    }   catch (error) {
        next(error)
    }
})

router.get("/:id",async (req,res,next) => {
    const id = req.params.id
    console.log("accesing DB for movie with movie_id =",id)
    try {
        const rawMovie = await getOneMovieWithGenres(id) // either a reosurce obj or err obj
        const movie =  CombineGenresIdNames([rawMovie])[0] //cheated by submiting an array to the function and then taking the one elment out
        // console.log(movie)
        if (!movie) {
            const err = new Error("Movie not found");
            err.status = 404;
            return next(err); 
        }

        const getObjectParams = {
            Bucket: bucketName,
            Key: movie.poster_img_name
        };
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // URL expires in 1 hour
        movie.imageUrl =  url; // Add the URL to the movie object

        res.status(200).json(movie)
    } catch (error) {
        next(error) // network request or re-thrown error
    }
})

router.put("/:id", verifyEmployeeJWT ,upload.single('poster_img_file'),async (req,res,next) => {
    const id = req.params.id
    // console.log(req.body)
    if (!req.body.title) {
        const err = new Error("Missing movie title");
        err.status = 400;
        return next(err);
    }

    let imageName
    let imageUploaded = false
    
    try {

        if (!req.file) { // We dont do anything if there is no image uploaded
            // console log error here
            // const copyParams = {
            //     Bucket: bucketName,
            //     CopySource: `${bucketName}/default_poster_img.webp`, 
            //     Key: imageName, 
            //     ContentType: 'image/webp',
            //     MetadataDirective: 'REPLACE', 
            // };
            // const copyCommand = new CopyObjectCommand(copyParams);
            // await s3.send(copyCommand);
            // console.log(`Copied default image to S3 as "${imageName} successfully"`);
        }else{
            imageName = randomImageName(); 
            const resizedImageBuffer = await sharp(req.file.buffer)
                .resize(225, 300)
                .toFormat('webp')
                .toBuffer();

            const params = {
                Bucket: bucketName,
                Key: imageName, 
                Body: resizedImageBuffer, 
                ContentType: req.file.mimetype, // e.g., 'image/png'
            }
            const command = new PutObjectCommand(params)

            await s3.send(command)
            console.log("s3 bucket upload successful");
        }
        imageUploaded = true

        const result = await updateMovie(id,{
                title : req.body.title, 
                poster_img_name : imageName || "", //empty string if we didnt define imageName which is the case when we don't find any file to upload...
                description :   req.body.description,
                age_rating : req.body.age_rating || 0, 
                is_team_pick : req.body.is_team_pick || 0, 
                score :  req.body.score || 0, 
                length : `${req.body.length_hours|| "00"}:${req.body.length_minutes|| "00"}:${req.body.length_seconds|| "00"}`,
                genres : req.body.selectedGenres
        })

        res.status(201).json({
            message: "Movie added successfully to the database",
            imageName: imageName,
            movie: req.body,
            movieInsertResult: result,
        });

    } catch (error) {
        //delete the image if the add movie operation fails
        console.error("Error during movie upload process:", error);

        if (imageUploaded && imageName && imageName !== "default_poster_img.webp") {
            try {
                const deleteParams = {
                    Bucket: bucketName,
                    Key: imageName,
                };
                const deleteCommand = new DeleteObjectCommand(deleteParams);
                await s3.send(deleteCommand);
                console.log(`Rolled back image upload: ${imageName} deleted from S3`);
            } catch (deleteError) {
                console.error("Failed to delete image from S3 after operation failure:", deleteError);
            }
        }
        next(error); 
    }
})


router.delete("/:id", verifyEmployeeJWT, async (req,res,next) => {
    const id = req.params.id
    console.log("Deleting movie with movie_id =",id)
    try {
        const movie = await getOneMovieWithGenres(id)
        const deleteResult = await deleteMovie(id) // either a reosurce obj or err obj

        if (!movie) {
            const err = new Error("Movie not found");
            err.status = 404;
            return next(err); 
        }
        
        //Delete the image
        console.log(movie)
        if (movie.poster_img_name && movie.poster_img_name !== "c6074c236342ced850b3a42d6c9eec462614c506952cc6134c29a369a9bbc6aa") { //default Image used
            try {
                const deleteParams = {
                    Bucket: bucketName,
                    Key: movie.poster_img_name,
                };
                const deleteCommand = new DeleteObjectCommand(deleteParams);
                await s3.send(deleteCommand);
                console.log(`Image  "${movie.poster_img_name}" deleted from S3`);
            } catch (deleteError) {
                console.error("Failed to delete image from S3:", deleteError);
                next(deleteError);
            }
        }

        res.status(204).json({message: "movie deleted succesfully"})
    } catch (error) {
        next(error) // network request or re-thrown error
    }
})

router.get("/:id/screenings", async (req,res,next) => {
    const movie_id = req.params.id
    try {
        const screenings = await getUpcomingScreenings(null,movie_id )
        console.log("screenigs =>",screenings)
        res.status(200).json(screenings)
    } catch (error) {
        next(error)
    }
})

router.get("/:id/screenings/all", verifyEmployeeJWT, async (req,res,next) => {
    const movie_id = req.params.id
    try {
        const screenings = await getAllScreenings(null,movie_id )
        console.log("screenigs =>",screenings)
        res.status(200).json(screenings)
    } catch (error) {
        next(error)
    }
})


export default router;