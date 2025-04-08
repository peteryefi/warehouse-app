const { productsData } = require('./productData');

class ProductRepository {
    constructor() {
        // Path to the products JSON file
       this.products = productsData;
    }

    // Read the products data from the file
    _getProducts() {
        try {
            return this.products
        } catch (error) {
            throw new Error('Error reading products data');
        }
    }

    // Get products for a specific order
    getProductsForOrder(orderProducts) {
        let productsData = this._getProducts();
        productsData = productsData["products"]
        let productsWithItems = [];
        orderProducts.forEach(orderProduct => {
            const productName = orderProduct.name;
            
            if (productsData[productName]) {
                productsWithItems.push({
                    name: productName,
                    quantity: orderProduct.quantity,
                    items: productsData[productName]
                });
            }
        });

        return productsWithItems;
    }

    getProductItems(productName) {
        return this.products["products"][productName] || [];
    }
}

module.exports = ProductRepository;
