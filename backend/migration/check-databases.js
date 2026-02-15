require('dotenv').config();
const mongoose = require('mongoose');

const checkDatabases = async () => {
  try {
    // Connect without specifying database name
    const baseUri = process.env.MONGODB_URI.split('?')[0]; // Remove query params
    const queryParams = process.env.MONGODB_URI.split('?')[1]; // Get query params
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(`${baseUri}?${queryParams}`);
    
    // List databases
    const admin = mongoose.connection.db.admin();
    const databases = await admin.listDatabases();
    
    console.log('\nAvailable databases:');
    databases.databases.forEach((db, index) => {
      console.log(`${index + 1}. ${db.name} (${db.sizeOnDisk} bytes)`);
    });
    
    // Also check collections in the current connection
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in current database:');
    collections.forEach((collection, index) => {
      console.log(`${index + 1}. ${collection.name}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\nConnection closed.');
    process.exit(0);
  }
};

checkDatabases();