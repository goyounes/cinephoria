import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  const result = dotenv.config({ path: './.env', quiet: process.env.NODE_ENV === 'test' });

  if (result.error && process.env.NODE_ENV !== 'test') {
    console.warn('Warning: .env file not found or failed to load.');
  } else if (process.env.NODE_ENV !== 'test') {
    console.log('Environment variables loaded successfully.');
  }
} else {
  console.log('Production mode detected — skipping .env loading'," | loaded PORT is", process.env.PORT);
}