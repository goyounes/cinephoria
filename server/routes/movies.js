import { Router } from 'express';
const router = Router();

import multer from 'multer';
import { verifyAdminJWT, verifyEmployeeJWT, verifyUserJWT } from '../middleware/authMiddleware.js';

// Cache middleware imports
import { 
    tryCache,
    saveToCache,
    invalidateCache
} from '../middleware/cacheMiddleware.js';
import { CACHE_TTL } from '../middleware/cacheUtils.js';

import { addMovie,  getGenres, deleteMovie, updateMovie, 
    getOneMovieWithGenres, getMoviesWithGenres,
    getUpcomingMoviesWithGenres, getUpcomingMoviesWithGenresAdmin,  getLatestMovies,
    checkMovieIdAdmin,
    addReviewToMovie, getUserReviewForMovie} 
    from '../controllers/movies.js';
import { getUpcomingScreenings , getUpcomingAndPastScreeningsAdmin, getAllScreeningsAdmin} from '../controllers/screenings.js';
import {s3, bucketName} from "../api/awsS3Client.js"

import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';

import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import sharp from 'sharp'
import { randomImageName, CombineGenresIdNames, CombineQualitiesIdNames} from '../utils/index.js';




const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
upload.single('poster_img_file') // 'poster_img_file' is the field name in the form

router.get("/", 
    tryCache('cache:movies:with_genres', CACHE_TTL.MOVIES),
    async (req,res,next) => {
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
        saveToCache(req, movies);
    } catch (error) {
        return next(error)
    }
})

router.post("/",verifyEmployeeJWT ,upload.single('poster_img_file'), 
    async (req,res,next) => {
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
                length : `${req.body.length_hours|| "00"}:${req.body.length_minutes|| "00"}:${req.body.length_seconds|| "00"}`,
                genres : req.body.selectedGenres
        })

        res.status(201).json({
            message: "Movie added successfully to the database",
            imageName: imageName,
            movie: req.body,
            movieInsertResult: result,
        });
        invalidateCache('movies');

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
        return next(error); 
    }
})

//Not used yet..
router.get("/latest",
    tryCache('cache:movies:latest', CACHE_TTL.MOVIES),
    async (req,res,next) => {
    try {
        const rawMovies = await getLatestMovies()
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
        saveToCache(req, movies);
    } catch (error) {
        return next(error)
    }
})

router.get("/upcoming",
    tryCache('cache:movies:upcoming:all', CACHE_TTL.MOVIES),
    async (req,res,next) => {
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
        saveToCache(req, movies);
    } catch (error) {
        return next(error)
    }
})

router.get("/upcoming/all",verifyEmployeeJWT,
    tryCache('cache:movies:upcoming:admin', CACHE_TTL.MOVIES),
    async (req,res,next) => {
    try {
        const rawMovies = await getUpcomingMoviesWithGenresAdmin()
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
        saveToCache(req, movies);
    } catch (error) {
        return next(error)
    }
})


router.get("/genres",
    tryCache('cache:genres', CACHE_TTL.STATIC_DATA),
    async (req,res,next) => {
    try {
        const genres = await getGenres()
        res.status(200).json(genres)
        saveToCache(req, genres);
    }   catch (error) {
        return next(error)
    }
})

router.get("/:id/screenings",
    (req, res, next) => tryCache(`cache:screenings:upcoming:${req.query.cinema_id || 'all'}:${req.params.id}`, CACHE_TTL.SCREENINGS)(req, res, next),
    async (req,res,next) => {
    const movie_id = req.params.id
    const cinema_id = req.query.cinema_id || null; 
    try {
        const found = await checkMovieIdAdmin(movie_id) // check movie exists in the db 
        if (!found){
            const err = new Error("No movie with this id was found");
            err.status = 404;
            return next(err);
        }
        const rawScreenings = await getUpcomingScreenings(cinema_id,movie_id )
        const screenings = CombineQualitiesIdNames(rawScreenings)
        res.status(200).json(screenings)
        saveToCache(req, screenings);
    } catch (error) {
        return next(error)
    }
})

router.get("/:id/screenings/all", verifyEmployeeJWT,
    (req, res, next) => tryCache(`cache:screenings:all:${req.query.cinema_id || 'all'}:${req.params.id}`, CACHE_TTL.SCREENINGS)(req, res, next),
    async (req,res,next) => {
    const movie_id = req.params.id
    const cinema_id = req.query.cinema_id || null; 
    try {
        const found = await checkMovieIdAdmin(movie_id) // check movie exists in the db 
        if (!found){
            const err = new Error("No movie with this id was found");
            err.status = 404;
            return next(err);
        }
        const rawScreenings = await getUpcomingAndPastScreeningsAdmin(cinema_id,movie_id )
        const screenings = CombineQualitiesIdNames(rawScreenings)
        res.status(200).json(screenings)
        saveToCache(req, screenings);
    } catch (error) {
        return next(error)
    }
})

// Movie resource managment links
router.get("/:id",
    (req, res, next) => tryCache(`cache:movie:${req.params.id}:with_genres`, CACHE_TTL.MOVIES)(req, res, next),
    async (req,res,next) => {
    const id = req.params.id
    console.log("accesing DB for movie with movie_id =",id)
    try {
        const rawMovie = await getOneMovieWithGenres(id) // either a reosurce obj or err obj
        // console.log(movie)
        if (!rawMovie) {
            const err = new Error("Movie not found");
            err.status = 404;
            return next(err); 
        }
        const movie =  CombineGenresIdNames([rawMovie])[0] //cheated by submiting an array to the function and then taking the one elment out

        const getObjectParams = {
            Bucket: bucketName,
            Key: movie.poster_img_name
        };
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // URL expires in 1 hour
        movie.imageUrl =  url; // Add the URL to the movie object

        res.status(200).json(movie)
        saveToCache(req, movie);
    } catch (error) {
        return next(error) // network request or re-thrown error
    }
})

router.put("/:id", verifyEmployeeJWT ,upload.single('poster_img_file'),
    async (req,res,next) => {
    const id = req.params.id
    // console.log(req.body)
    if (!req.body.title) {
        const err = new Error("Missing movie title");
        err.status = 400;
        return next(err);
    }

    const found = await checkMovieIdAdmin(id) // check movie exists in the db 
    if (!found){
        const err = new Error("No movie with this id was found");
        err.status = 404;
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
                length : `${req.body.length_hours|| "00"}:${req.body.length_minutes|| "00"}:${req.body.length_seconds|| "00"}`,
                genres : req.body.selectedGenres
        })

        res.status(201).json({
            message: "Movie updated successfully to the database",
            imageName: imageName,
            movie: req.body,
            movieInsertResult: result,
        });
        invalidateCache('movies');

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
        return next(error); 
    }
})

router.delete("/:id", verifyEmployeeJWT,
    async (req,res,next) => {
    const id = req.params.id
    console.log("Deleting movie with movie_id =",id)
    try {
        const movie = await getOneMovieWithGenres(id)

        if (!movie) {
            const err = new Error("Movie not found");
            err.status = 404;
            return next(err); 
        }

        const deleteResult = await deleteMovie(id) 
        
        //Delete the image
        if (movie.poster_img_name) {
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
                return next(deleteError);
            }
        }

        res.status(200).json({message: "movie deleted succesfully"})
        invalidateCache('movies');
    } catch (error) {
        return next(error) // network request or re-thrown error
    }
})

router.get("/:id/reviews/me", verifyUserJWT, async (req, res, next) => {
    const movie_id = req.params.id;
    const userId = req.user.user_id; // Get from JWT token
    
    try {
        // Check if movie exists
        const movieExists = await checkMovieIdAdmin(movie_id);
        if (!movieExists) {
            const err = new Error("Movie not found");
            err.status = 404;
            return next(err);
        }
        
        const review = await getUserReviewForMovie(movie_id, userId);
        
        if (!review) {
            const err = new Error("Review not found");
            err.status = 404;
            return next(err);
        }
        
        res.status(200).json(review);
    } catch (error) {
        return next(error);
    }
});

router.post("/reviews", verifyUserJWT, async (req,res,next) => {
    // Use authenticated user's ID from JWT token, not from request body
    const user_id = req.user.user_id;
    const { movie_id, review, score } = req.body;   
    if (!movie_id || !score) {
        const err = new Error("Missing required fields: movie_id or score");
        err.status = 400;
        return next(err);
    }   
    try {
        const found = await checkMovieIdAdmin(movie_id) // check movie exists in the db 
        if (!found){
            const err = new Error("No movie with this id was found");
            err.status = 404;
            return next(err);
        }
        
        // Assuming you have a function to add a review
        const result = await addReviewToMovie(movie_id, user_id, score, review);
        
        if (!result) {
            const err = new Error("You can only review a movie after watching it");
            err.status = 400;
            return next(err);
        }

        res.status(201).json({
            message: "Review added successfully",
            review: result,
        });
    } catch (error) {
        next(new Error("Failed to add review: ",error.message));
        console.error(error)
    }
})
export default router;