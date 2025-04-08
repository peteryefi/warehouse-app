const fs = require('fs');
const path = require('path');

let productsData = { products: {} }; // Initialize with default structure

try {
    const filePath = path.join(__dirname, '../database/products.json');
    
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Skip parsing if file is empty
        if (fileContent.trim()) {
            const parsedData = JSON.parse(fileContent);
            
            // Ensure we always have the expected structure
            productsData = {
                products: parsedData.products || {}
            };
        }
    }
} catch (error) {
    console.error('Error loading products:', error.message);
    // Maintain the default empty structure on error
}

module.exports = { productsData };