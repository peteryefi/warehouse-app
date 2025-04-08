const OrderValidator = require('../utils/orderValidator');

class OrderController {
    
    constructor(orderRepository, productRepository) {
        this.orderRepo = orderRepository;
        this.productRepo = productRepository;
    }

    async getOrders(req, res) {
        try {
            const orders = this.orderRepo.getAllOrders();
            // Attach product details to each order
            for (let order of orders) {
                order.products = await this.productRepo.getProductsForOrder(order.products);
            }
            res.status(200).json(orders);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch orders' });
        }
    }

    async getOrderById(req, res) {
        try {
            const orderId = req.params.id;
            const order = this.orderRepo.getOrderById(orderId);
            // Attach product details to the order
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
            order.products = await this.productRepo.getProductsForOrder(order.products);
            res.status(200).json(order);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch order' });
        }
    }

    createOrder(req, res) {
        try {
            const newOrder = req.body;
            const createdOrder = this.orderRepo.createOrder(newOrder);
            res.status(201)
            .set('Location', `/api/orders/${createdOrder.id}`)
            .json(createdOrder);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    updateOrder(req, res) {
        try {
            const orderId = req.params.id;
            const updatedOrder = req.body;
            const result = this.orderRepo.updateOrder(orderId, updatedOrder);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    deleteOrder(req, res) {
        try {
            const orderId = req.params.id;
            const deletedOrder = this.orderRepo.deleteOrder(orderId);
            res.status(200).json({ message: 'Order deleted', order: deletedOrder });
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async getOrderProductsByDateRange(req, res) {
        try {
            const { startDate, endDate } = req.query;
        
            // Validate the input dates
            const validation = OrderValidator.validateDateRange(startDate, endDate);
            
            if (!validation.valid) {
                return res.status(400).json({ error: validation.message });
            }

            const { start, end } = validation;

            // Fetch all orders and filter them by date range
            const orders = this.orderRepo.getOrdersWithinDateRange(start, end);

            // Extract and count product items
            const productCounts = this.orderRepo.extractProductCountsFromOrders(orders);
            
            let expandedProducts = this.expandOrderProducts(productCounts);

            res.status(200).json({ products: expandedProducts });

        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch products for the date range' });
        }
    }

    expandOrderProducts(productCounts){
        // Send the response with the product counts
        let expandedProducts = {};

        for (const productName in productCounts) {
            const quantity = productCounts[productName];
        
            // Get the list of items for this product from the repository
            const items = this.productRepo.getProductItems(productName);
        
            items.forEach(item => {
                const totalItemQuantity = quantity; 
                expandedProducts[item] = totalItemQuantity;
            });

        }

        return expandedProducts;
    }
}

// Export the class itself, not an instance
module.exports = OrderController;
