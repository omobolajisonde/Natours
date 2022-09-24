const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

// APP VARIABLES
const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '127.0.0.1';
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// Connecting our application with the cloud-hosted MongoDB server using mongoose ODM

async function main() {
  await mongoose.connect(DB);
  console.log('DB connection successful!!!');
}

main().catch((err) => console.log(err));

app.listen(PORT, HOST, () => {
  console.log(`Running on port ${PORT}...`);
});

// console.log(app.get('env')); // development
