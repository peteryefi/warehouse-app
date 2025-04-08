// app.js (Main server file)
const express = require('express');
const bodyParser = require('body-parser');
const orderRoutes = require('./routes/order'); 
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const cors = require("cors");

const app = express();

//allow all origins (for development purposes)
app.use(cors());

const swaggerDocument = YAML.load(path.join(__dirname, 'openapi.yaml'));

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Use the routes for handling orders
app.use('/api', orderRoutes); // Prefix '/api' to the routes

// Start the server
const PORT = process.env.PORT || 3000;
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Swagger UI available at http://localhost:3000/api-docs');
  });
