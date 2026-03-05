import { S3Client } from '@aws-sdk/client-s3';

const bucketRegion = process.env.S3_BUCKET_REGION;
const accesKey = process.env.S3_BUCKET_ACCES_KEY;
const secretAcces_key = process.env.S3_BUCKET_SECRET_ACCES_KEY;

if (!bucketRegion || !accesKey || !secretAcces_key) {
    throw new Error('Missing required S3 environment variables: S3_BUCKET_REGION, S3_BUCKET_ACCES_KEY, S3_BUCKET_SECRET_ACCES_KEY');
}

export const s3 = new S3Client({
    credentials: {
        accessKeyId: accesKey,
        secretAccessKey: secretAcces_key,
    },
    region: bucketRegion
});

const bucketNameEnv = process.env.S3_BUCKET_NAME;
if (!bucketNameEnv) {
    throw new Error('Missing required S3 environment variable: S3_BUCKET_NAME');
}

export const bucketName: string = bucketNameEnv;
