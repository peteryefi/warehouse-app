const fs = require('fs');
const path = require('path');
const OrderValidator = require('../utils/orderValidator');

class OrderRepository {
    constructor() {
        this.filePath = path.join(__dirname, '../database/orders.json');
        this.orders = this._loadOrders();
    }

    _loadOrders() {
       
        const data = fs.readFileSync(this.filePath, 'utf8');
        return JSON.parse(data).orders || [];
        
    }

    _saveOrders() {
        fs.writeFileSync(this.filePath, JSON.stringify({ orders: this.orders }, null, 2), 'utf8');
    }

    getAllOrders() {
        return this.orders;
    }

    getOrderById(orderId) {
        return this.orders.find(order => order.id === orderId) || null;
    }

    createOrder(order) {
        const validation = OrderValidator.isValidOrder(order);
        if (!validation.valid) {
            throw new Error(validation.message);
        }

        order.id = this._generateId();
        this.orders.push(order);
        this._saveOrders();
        return order;
    }

    updateOrder(orderId, updatedOrder) {
        const index = this.orders.findIndex(order => order.id === orderId);
        if (index === -1) {
            throw new Error('Order not found');
        }

        const validation = OrderValidator.isValidOrder(updatedOrder);
        if (!validation.valid) {
            throw new Error(validation.message);
        }

        updatedOrder.id = orderId;
        this.orders[index] = updatedOrder;
        this._saveOrders();
        return updatedOrder;
    }

    deleteOrder(orderId) {
        const index = this.orders.findIndex(order => order.id === orderId);
        if (index === -1) {
            throw new Error('Order not found');
        }

        const deletedOrder = this.orders.splice(index, 1);
        this._saveOrders();
        return deletedOrder[0];
    }

    getOrdersWithinDateRange(startDate, endDate){
        return this.orders.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate >= startDate && orderDate <= endDate;
        });
    }

    extractProductCountsFromOrders(orders) {
        const productItems = [];

        orders.forEach(order => {
            order.products.forEach(product => {
                for (let i = 0; i < product.quantity; i++) {
                    productItems.push(product.name);
                }
            });
        });
        return this.countProductQuantities(productItems);
    }

    countProductQuantities(productItems) {
        return productItems.reduce((acc, productName) => {
            acc[productName] = (acc[productName] || 0) + 1;
            return acc;
        }, {});
    }

    _generateId() {
        return `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    }
}

module.exports = OrderRepository;
