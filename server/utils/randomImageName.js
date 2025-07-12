import crypto from 'crypto';

const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex') ; // Generate a random name for the image

export default randomImageName;