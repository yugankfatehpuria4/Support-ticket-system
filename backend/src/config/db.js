const mongoose = require('mongoose');

let cachedPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  if (!cachedPromise) {
    cachedPromise = mongoose.connect(uri).then((conn) => {
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return conn.connection;
    }).catch((err) => {
      cachedPromise = null;
      throw err;
    });
  }

  return cachedPromise;
};

module.exports = connectDB;
