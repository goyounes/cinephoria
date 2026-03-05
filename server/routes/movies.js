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
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import { respondWithJson } from '../utils/responses.js';




const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
upload.single('poster_img_file') // 'poster_img_file' is the field name in the form

router.get("/",
    tryCache('cache:movies:with_genres', CACHE_TTL.MOVIES),
    async (req, res) => {
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

    respondWithJson(res, movies);
    saveToCache(req, movies);
})

router.post("/",verifyEmployeeJWT ,upload.single('poster_img_file'),
    async (req, res) => {
    if (!req.body.title) {
        throw new BadRequestError("Missing movie title");
    }

    let imageName
    let imageUploaded = false

    try {

        imageName = req.body.title + randomImageName();
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

        respondWithJson(res, {
            message: "Movie added successfully to the database",
            imageName: imageName,
            movie: req.body,
            movieInsertResult: result,
        }, 201);
        // Clear movie list caches (new movie added)
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
        throw error;
    }
})

//Not used yet..
router.get("/latest",
    tryCache('cache:movies:latest', CACHE_TTL.MOVIES),
    async (req, res) => {
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
    respondWithJson(res, movies);
    saveToCache(req, movies);
})

router.get("/upcoming",
    tryCache('cache:movies:upcoming:all', CACHE_TTL.MOVIES),
    async (req, res) => {
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

    respondWithJson(res, movies);
    saveToCache(req, movies);
})

router.get("/upcoming/all",verifyEmployeeJWT,
    tryCache('cache:movies:upcoming:admin', CACHE_TTL.MOVIES),
    async (req, res) => {
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

    respondWithJson(res, movies);
    saveToCache(req, movies);
})


router.get("/genres",
    tryCache('cache:genres', CACHE_TTL.STATIC_DATA),
    async (req, res) => {
    const genres = await getGenres()
    respondWithJson(res, genres);
    saveToCache(req, genres);
})

router.get("/:id/screenings",
    (req, res, next) => tryCache(`cache:screenings:upcoming:${req.query.cinema_id || 'all'}:${req.params.id}`, CACHE_TTL.SCREENINGS)(req, res, next),
    async (req, res) => {
    const movie_id = req.params.id
    const cinema_id = req.query.cinema_id || null;

    const found = await checkMovieIdAdmin(movie_id) // check movie exists in the db
    if (!found) throw new NotFoundError("No movie with this id was found");

    const rawScreenings = await getUpcomingScreenings(cinema_id,movie_id )
    const screenings = CombineQualitiesIdNames(rawScreenings)
    respondWithJson(res, screenings);
    saveToCache(req, screenings);
})

router.get("/:id/screenings/all", verifyEmployeeJWT,
    (req, res, next) => tryCache(`cache:screenings:all:${req.query.cinema_id || 'all'}:${req.params.id}`, CACHE_TTL.SCREENINGS)(req, res, next),
    async (req, res) => {
    const movie_id = req.params.id
    const cinema_id = req.query.cinema_id || null;

    const found = await checkMovieIdAdmin(movie_id) // check movie exists in the db
    if (!found) throw new NotFoundError("No movie with this id was found");

    const rawScreenings = await getUpcomingAndPastScreeningsAdmin(cinema_id,movie_id )
    const screenings = CombineQualitiesIdNames(rawScreenings)
    respondWithJson(res, screenings);
    saveToCache(req, screenings);
})

// Movie resource managment links
router.get("/:id",
    (req, res, next) => tryCache(`cache:movie:${req.params.id}:with_genres`, CACHE_TTL.MOVIES)(req, res, next),
    async (req, res) => {
    const id = req.params.id
    console.log("accesing DB for movie with movie_id =",id)

    const rawMovie = await getOneMovieWithGenres(id) // either a reosurce obj or err obj
    if (!rawMovie) throw new NotFoundError("Movie not found");

    const movie =  CombineGenresIdNames([rawMovie])[0] //cheated by submiting an array to the function and then taking the one elment out

    const getObjectParams = {
        Bucket: bucketName,
        Key: movie.poster_img_name
    };
    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // URL expires in 1 hour
    movie.imageUrl =  url; // Add the URL to the movie object

    respondWithJson(res, movie);
    saveToCache(req, movie);
})

router.put("/:id", verifyEmployeeJWT ,upload.single('poster_img_file'),
    async (req, res) => {
    const id = req.params.id
    if (!req.body.title) {
        throw new BadRequestError("Missing movie title");
    }

    const currentMovie = await getOneMovieWithGenres(id) // get current movie data for old image cleanup
    if (!currentMovie) throw new NotFoundError("No movie with this id was found");

    const oldImageName = currentMovie.poster_img_name; // Save old image name before any changes
    console.log("Old image name:", oldImageName);
    let imageName
    let imageUploaded = false

    try {

        if (!req.file) { // We dont do anything if there is no image uploaded
        }else{
            imageName =  req.body.title + randomImageName();
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

        respondWithJson(res, {
            message: "Movie updated successfully to the database",
            imageName: imageName,
            movie: req.body,
            movieInsertResult: result,
        }, 201);

        // Delete the old image after successful database update
        if (imageUploaded && imageName) {
            try {
                const deleteOldParams = {
                    Bucket: bucketName,
                    Key: oldImageName,
                };
                const deleteOldCommand = new DeleteObjectCommand(deleteOldParams);
                await s3.send(deleteOldCommand);
                console.log(`Deleted old image: ${oldImageName}`);
            } catch (deleteError) {
                console.error("Failed to delete old image from S3:", deleteError);
            }
        }

        // Clear movie list caches and specific movie cache
        invalidateCache('movies');
        invalidateCache(`movie:${id}:with_genres`);
        console.log(`Invalidated movies list cache and specific movie cache for ID: ${id}`);

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
        throw error;
    }
})

router.delete("/:id", verifyEmployeeJWT,
    async (req, res) => {
    const id = req.params.id
    console.log("Deleting movie with movie_id =",id)

    const movie = await getOneMovieWithGenres(id)
    if (!movie) throw new NotFoundError("Movie not found");

    const deleteResult = await deleteMovie(id)

    //Delete the image
    if (movie.poster_img_name) {
        const deleteParams = {
            Bucket: bucketName,
            Key: movie.poster_img_name,
        };
        const deleteCommand = new DeleteObjectCommand(deleteParams);
        await s3.send(deleteCommand);
        console.log(`Image  "${movie.poster_img_name}" deleted from S3`);
    }

    respondWithJson(res, {message: "movie deleted succesfully"});
    // Clear movie list caches and specific movie cache
    invalidateCache('movies');
    invalidateCache(`movie:${id}:with_genres`);
})

router.get("/:id/reviews/me", verifyUserJWT, async (req, res) => {
    const movie_id = req.params.id;
    const userId = req.user.user_id; // Get from JWT token

    // Check if movie exists
    const movieExists = await checkMovieIdAdmin(movie_id);
    if (!movieExists) throw new NotFoundError("Movie not found");

    const review = await getUserReviewForMovie(movie_id, userId);
    if (!review) throw new NotFoundError("Review not found");

    respondWithJson(res, review);
});

router.post("/reviews", verifyUserJWT, async (req, res) => {
    // Use authenticated user's ID from JWT token, not from request body
    const user_id = req.user.user_id;
    const { movie_id, review, score } = req.body;
    if (!movie_id || !score) {
        throw new BadRequestError("Missing required fields: movie_id or score");
    }

    const found = await checkMovieIdAdmin(movie_id) // check movie exists in the db
    if (!found) throw new NotFoundError("No movie with this id was found");

    const result = await addReviewToMovie(movie_id, user_id, score, review);

    if (!result) {
        throw new BadRequestError("You can only review a movie after watching it");
    }

    respondWithJson(res, {
        message: "Review added successfully",
        review: result,
    }, 201);
})
export default router;
