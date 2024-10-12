const express = require('express');
const logger = require('morgan');

const dataRouter = require('./routes/data');
const userRateLimiter = require('./middleware/userRateLimiter'); 


const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Apply User ID rate limiter to /data route
app.use('/data', userRateLimiter);

app.use('/data', dataRouter);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
