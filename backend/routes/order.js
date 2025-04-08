const express = require('express');
const OrderController = require('../controllers/order');
const OrderRepository = require('../repositories/order'); 
const ProductRepository = require('../repositories/product'); 

// Create an instance of the controller with the repository injected
const orderController = new OrderController(new OrderRepository(), new ProductRepository());

// Initialize the router
const router = express.Router();

// Define the routes and link them to controller methods
router.get('/orders/summary', (req, res) => orderController.getOrderProductsByDateRange(req, res));
router.get('/orders', (req, res) => orderController.getOrders(req, res));
router.get('/orders/:id', (req, res) => orderController.getOrderById(req, res)); 
router.post('/orders', (req, res) => orderController.createOrder(req, res)); 
router.put('/orders/:id', (req, res) => orderController.updateOrder(req, res)); 
router.delete('/orders/:id', (req, res) => orderController.deleteOrder(req, res)); 


module.exports = router;
