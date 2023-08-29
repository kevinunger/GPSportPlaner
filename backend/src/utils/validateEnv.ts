import dotenv from 'dotenv';

dotenv.config();

export function validateEnvVariables(): void {
  const requiredEnvVars: string[] = [
    'PORT',
    'MONGO_USER',
    'MONGO_PASSWORD',
    'MONGO_HOST',
    'MONGO_DB',
    'CORS_ORIGIN',
    'JWT_SECRET',
  ];

  for (const key of requiredEnvVars) {
    const value = process.env[key];

    if (!value) {
      throw new Error(`Missing environment variable: ${key}`);
    }

    if (key === 'PORT') {
      const port = parseInt(value, 10);

      if (isNaN(port)) {
        throw new Error('.ENV ERROR: PORT must be a number');
      }
    } else {
      if (typeof value !== 'string') {
        throw new Error(`.ENV ERROR: ${key} must be a string`);
      }
    }
  }
}
