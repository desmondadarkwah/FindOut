const mongoose = require('mongoose');

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is not set. Create backend/.env and add your connection string.'
    );
  }

  console.log('Connecting to MongoDB...');

  // Registered before connect() so a failure during the initial handshake is
  // reported rather than swallowed.
  mongoose.connection.on('connected', () => console.log('MongoDB connected'));
  mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => console.log('MongoDB reconnected'));
  mongoose.connection.on('error', (err) =>
    console.error('MongoDB connection error:', err.message)
  );

  await mongoose.connect(process.env.MONGODB_URI, {
    // Fail in 10s rather than the 30s default, so a bad connection is obvious
    // quickly instead of looking like a hang.
    serverSelectionTimeoutMS: 10000,
  });

  /* Deliberately no try/catch.
     This previously caught the error and returned normally, so the caller's
     .then() ran and the HTTP server started listening with no database. Every
     request then sat in Mongoose's buffer for 10 seconds before failing, which
     surfaced as a flood of "buffering timed out" errors rather than the actual
     problem. Letting the error propagate lets server.js fail loudly instead. */
}

module.exports = connectDB;
