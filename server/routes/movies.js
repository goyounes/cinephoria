import { Router } from 'express';
const router = Router();

import axios from 'axios';
import multer from 'multer';
import crypto from 'crypto';

import { addMovie, getOneMovieWithGenres, getMoviesWithGenres } from '../controllers/movies.js';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex') ; // Generate a random name for the image

const bucketName = process.env.S3_BUCKET_NAME;
const bucketRegion = process.env.S3_BUCKET_REGION;
const accesKey = process.env.S3_BUCKET_ACCES_KEY;
const secretAcces_key = process.env.S3_BUCKET_SECRET_ACCES_KEY;
// console.log(bucketName, bucketRegion, accesKey, secretAcces_key);   

const s3 = new S3Client({
    credentials: {
        accessKeyId: accesKey,  
        secretAccessKey: secretAcces_key,
    },
    region: bucketRegion
})

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
upload.single('poster_img') // 'poster_img' is the field name in the form

const DB_API_URL = "http://localhost:5000/api/v1"

router.get("/",async (req,res,next) => {
    try {
        const movies = await getMoviesWithGenres()
        movies.forEach((movie) => {
            movie.poster_img = decodeBinaryToBase64(movie.poster_img);
        });
        res.status(200).json(movies)
    } catch (error) {
        next(error)
    }
})
// upload.single('file'), 
router.post("/", upload.single('poster_img'), async (req,res,next) => {
    try {
        console.log("req.body : ",req.body); 
        console.log("req.file : ",req.file); 
        console.log("req.file.buffer",req.file.buffer);
        const imageName = randomImageName();
        const params = {
            Bucket: bucketName,
            Key: imageName, 
            Body: req.file.buffer, 
            ContentType: req.file.mimetype, // e.g., 'image/png'
        }

        const command = new PutObjectCommand(params)

        await s3.send(command)

        // console.log(req.body); // other form fields
        // const movieData = {}
        // const response = await addMovie()
        res.status(200).json("s3 bucket upload successful, movie added to database");
    } catch (error) {
        next(error)
    }
})

router.get("/recent",async (req,res,next) => {
    try {
        const movies = await getMoviesAddedSince()
        movies.forEach((movie) => {
            movie.poster_img = decodeBinaryToBase64(movie.poster_img);
        });
        res.status(200).json(movies)
    } catch (error) {
        next(error)
    }
})

router.get("/:id",async (req,res,next) => {
    const id = req.params.id
    console.log("accesing API for movie with movie_id =",id)
    try {
        // const response = await axios.get(DB_API_URL + "/movies/" + id ,{headers:{'X-Requested-By': 'backend-server'}})
        const movie = await getOneMovieWithGenres(id) // either a reosurce obj or err obj
        if (!movie) {
            const err = new Error("Movie not found");
            err.status = 404;
            return next(err); 
        }
        movie.poster_img = decodeBinaryToBase64(movie.poster_img);
        res.status(200).json(movie)
    } catch (error) {
        next(error) // network request or re-thrown error
    }
})


export function decodeBinaryToBase64(data){
  if (!data) return null;
  const posterBuffer = Buffer.from(data);
  return posterBuffer.toString('base64');
}

export default router;