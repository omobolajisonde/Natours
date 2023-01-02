const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');

dotenv.config({ path: './../../config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// Connecting our application with the cloud-hosted MongoDB server using mongoose ODM

function main() {
  mongoose.connect(DB);
  console.log('DB connection successful!!!');
}

main();

mongoose.connection.on('connected', () => {
  // READ JSON FILE

  const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
  const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
  const reviews = JSON.parse(
    fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
  );

  // IMPORT DATA INTO DB
  const importData = async function () {
    try {
      await Tour.create(tours);
      await User.create(users, { validateBeforeSave: false });
      await Review.create(reviews);
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
      await User.deleteMany({});
      await Review.deleteMany({});
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
});

mongoose.connection.on('error', () => {
  console.log('Something went wrong while connnecting to MongoDB');
});
