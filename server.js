const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Handling *uncaught exceptions*
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('Uncaught Exception! shutting down...');
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

// APP VARIABLES
const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '127.0.0.1';
const DB = process.env.DATABASE; // local DB server
// const DB = process.env.DATABASE.replace(
//   '<PASSWORD>',
//   process.env.DATABASE_PASSWORD
// ); // connecting to ATLAS DB server

// Connecting our application with the cloud-hosted MongoDB server using mongoose ODM

async function main() {
  await mongoose.connect(DB);
  console.log('DB connection successful!!!');
}

main();

const server = app.listen(PORT, HOST, () => {
  console.log(`Running on port ${PORT}...`);
});

// Handling *unhandled promise rejections*
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled Rejection! shutting down...');
  server.close(() => {
    process.exit(1);
  });
});

// console.log(app.get('env')); // development
// console.log(arguments); // show the require, exports, module, __filename and __dirname arguments passed to the IIFE at run time
