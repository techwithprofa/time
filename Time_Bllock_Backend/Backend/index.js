require('dotenv').config(); // Load environment variables first

const express = require('express');
const bodyParser = require('body-parser'); // Or use express.json() / express.urlencoded()

// Import database query function (assuming db/index.js exists)
// const db = require('./db'); // We'll use this later in controllers

const app = express();
const PORT = process.env.API_PORT || 3000;

// Middleware
app.use(bodyParser.json()); // For parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Basic Route for testing
app.get('/', (req, res) => {
  res.send('Time Block API is running!');
});

// Later, we will mount our specific routers here
const groupRoutes = require('./routes/groupRoutes');
const timeBlockRoutes = require('./routes/timeBlockRoutes');
const timelineEntryRoutes = require('./routes/timelineEntryRoutes');
app.use('/api', groupRoutes);
app.use('/api', timeBlockRoutes);
app.use('/api/timeline-entries', timelineEntryRoutes);


// Global error handler (basic example)
app.use((err, req, res, next) => {
  console.error(err.stack); // Keep this for server-side logging
  // Check if the error has a status code and message, otherwise default
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  res.status(statusCode).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // The database connection test is now in db/index.js
  // If you want to ensure db is connected before server starts, you might need to adjust db/index.js
  // to export a connect function or use top-level await if your Node version supports it.
  // For now, the connection test in db/index.js runs independently.
});
