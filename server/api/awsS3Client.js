import { S3Client } from '@aws-sdk/client-s3';

const bucketRegion = process.env.S3_BUCKET_REGION;
const accesKey = process.env.S3_BUCKET_ACCES_KEY;
const secretAcces_key = process.env.S3_BUCKET_SECRET_ACCES_KEY;

export const s3 = new S3Client({
    credentials: {
        accessKeyId: accesKey,  
        secretAccessKey: secretAcces_key,
    },
    region: bucketRegion
})

export const bucketName = process.env.S3_BUCKET_NAME;