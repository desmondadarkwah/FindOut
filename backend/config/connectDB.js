const mongoose = require('mongoose')

async function connectDB() {

  try {
    console.log('connection to mongodb....')

    await mongoose.connect(process.env.MONGODB_URI)

    mongoose.connection.on('connected', () => {
      console.log('connected to mongodb')
    });

    mongoose.connection.on('error', (err) => {
      console.log('mongodb connection error: ', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('disconnected from the mongodb')
    })

  } catch (error) {
    console.error('MongoDB connection error: ', error)
  }
}

module.exports = connectDB;