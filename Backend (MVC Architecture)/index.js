// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Import route handlers
const eventRoutes = require('./controllers/eventController'); // Adjust the path as needed
const userRoutes = require('./controllers/userController'); // Adjust the path as needed
const adminRoutes = require('./controllers/adminController'); // Adjust the path as needed
const officeAdminRoutes = require('./controllers/officeController'); // Adjust the path as needed


// Create Express app
const app = express();
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use('/events', express.static(path.join(__dirname, 'events')));
dotenv.config();

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.DB_CONNECT);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('DB Connected');
});

// Use route handlers
app.use('/', userRoutes); // Adjust the base URL as needed
app.use('/', adminRoutes); // Adjust the base URL as needed
app.use('/', eventRoutes); // Adjust the base URL as needed
app.use('/', officeAdminRoutes); // Adjust the base URL as needed

// Start server
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
