
const { productsData } = require('../repositories/productData');
// Extract product names (keys) from the JSON
const validProductNames = Object.keys(productsData["products"]);

class OrderValidator {
    static isValidOrder(order) {
        if (!order || typeof order !== 'object') {
            return { valid: false, message: "Invalid order format" };
        }

        const productValidation = this.validateProducts(order.products);
        if (!productValidation.valid) {
            return productValidation;
        }

        const dateValidation = this.validateDate(order.date);
        if (!dateValidation.valid) {
            return dateValidation;
        }

        const addressValidation = this.validateAddress(order.address);
        if (!addressValidation.valid) {
            return addressValidation;
        }

        const statusValidation = this.validateStatus(order.status);
        if (!statusValidation.valid) {
            return statusValidation;
        }

        return { valid: true, message: "Order is valid" };
    }

    static validateProducts(products) {
        if (!Array.isArray(products) || products.length === 0) {
            return { valid: false, message: "Order must contain at least one product" };
        }

        for (let product of products) {
            if (typeof product.name !== 'string' || product.name.trim() === '' || !validProductNames.includes(product.name)) {
                return { valid: false, message: `Invalid product name: ${product.name}` };
            }
            if (!Number.isInteger(product.quantity) || product.quantity <= 0) {
                return { valid: false, message: "Each product must have a positive quantity" };
            }
        }

        return { valid: true };
    }

    static validateDate(date) {
        if (!date || isNaN(new Date(date).getTime())) {
            return { valid: false, message: "Invalid date format" };
        }
        return { valid: true };
    }

    static validateAddress(address) {
        if (!address || typeof address !== 'object') {
            return { valid: false, message: "Address is required" };
        }

        const { street, country, city, zipCode } = address;
        if (![street, country, city, zipCode].every(field => typeof field === 'string' && field.trim() !== '')) {
            return { valid: false, message: "Address fields (street, country, city, zipCode) must be valid" };
        }

        return { valid: true };
    }

    static validateStatus(status) {
        const validStatuses = ["pending", "shipped", "delivered", "canceled"];
        if (!validStatuses.includes(status)) {
            return { valid: false, message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` };
        }
        return { valid: true };
    }

    static validateDateRange(startDate, endDate) {
        if (!startDate || !endDate) {
            return { valid: false, message: 'Both startDate and endDate are required' };
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start) || isNaN(end)) {
            return { valid: false, message: 'Invalid date format' };
        }

        return { valid: true, start, end };
    }
}

module.exports = OrderValidator;
