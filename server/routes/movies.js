import { Router } from 'express';
const router = Router();

import multer from 'multer';
import { verifyAdminJWT, verifyEmployeeJWT } from '../controllers/auth.js';

import { addMovie, getOneMovieWithGenres, getMoviesWithGenres, getGenres } from '../controllers/movies.js';

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import sharp from 'sharp'
import randomImageName from '../utils/randomImageName.js';


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

router.get("/",async (req,res,next) => {
    try {
        const movies = await getMoviesWithGenres()

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
        err.message = "Missing movie title"
        return next(err); 
    }

    let imageName
    let imageUploaded = false
    
    try {
        if (!req.file){
            imageName = "default_poster_img.webp"
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
            console.log("s3 bucket upload successful, movie added to database");
            imageUploaded = true
        }


        const result = await addMovie({
                title : req.body.title, 
                poster_img_name : imageName, 
                description :   req.body.description,
                age_rating : req.body.age_rating || 0, 
                is_team_pick : req.body.is_team_pick || 0, 
                score :  req.body.score || 0, 
                length : `${req.body.length_hours|| "00"}:${req.body.length_minutes|| "00"}:${req.body.length_seconds|| "00"}`, //,
        })

        // console.log(req.body); // other form fields
        // const movieData = {}
        res.status(201).json({
            message: "Movie added successfully",
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
        const movies = await getMoviesAddedSince()

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
        const movie = await getOneMovieWithGenres(id) // either a reosurce obj or err obj
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



export default router;