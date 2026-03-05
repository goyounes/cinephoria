import crypto from 'crypto';

const randomImageName = (bytes: number = 32): string => crypto.randomBytes(bytes).toString('hex'); // Generate a random name for the image

export default randomImageName;
