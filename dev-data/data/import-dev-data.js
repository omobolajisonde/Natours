const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Tour = require('./../../models/toursModel');

dotenv.config({ path: './../../config.env' });

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

// READ JSON FILE

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// IMPORT DATA INTO DB
const importData = async function () {
  try {
    await Tour.create(tours);
    console.log('Data successfully uploaded!');
  } catch (error) {
    console.log(error);
  } finally {
    process.exit();
  }
};

// OFFLOAD DATA FROM COLLECTION
const offloadData = async function () {
  try {
    await Tour.deleteMany({});
    console.log('Data successfully offloaded!');
  } catch (error) {
    console.log(error);
  } finally {
    process.exit();
  }
};

// RUNS THE importData FUNCTION, if process.argv[3] equals "--import"
process.argv[2] === '--import' && importData();

// RUNS THE offloadData FUNCTION, if process.argv[3] equals "--offload"
process.argv[2] === '--offload' && offloadData();

// console.log(process.argv);
