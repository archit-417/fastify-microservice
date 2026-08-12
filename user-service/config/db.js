export const mongoConfig = {
  forceClose: true,
  url: process.env.MONGODB_URI,
  database: process.env.MONGODB_DB_NAME || 'user-service-db',
};
