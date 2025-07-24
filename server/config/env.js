import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  const result = dotenv.config({ path: './.env' });

  if (result.error) {
    console.warn('Warning: .env file not found or failed to load.');
  } else {
    console.log('Environment variables loaded successfully.');
  }
} else {
  console.log('Production mode detected — skipping .env loading');
  console.log("loaded PORT is", process.env.PORT)
}