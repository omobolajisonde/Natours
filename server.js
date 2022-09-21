const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

// APP VARIABLES
const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '127.0.0.1';

app.listen(PORT, HOST, () => {
  console.log(`Running on port ${PORT}...`);
});

// console.log(app.get('env')); // development
