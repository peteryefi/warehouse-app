const fs = require('fs');
const path = require('path');

describe('loadProductsData', () => {
    const mockData = {
        products: {
            "Valentine Box": ["Red Roses Bouquet", "Box of chocolates"],
            "Birthday Box": ["Birthday cupcake", "$100 Visa Gift Card", "Birthday card"]
        }
    };

    beforeEach(() => {
        // Reset all mocks and clear module cache
        jest.resetModules();
        jest.clearAllMocks();

        // Set up fresh mocks for each test
        jest.mock('fs', () => ({
            existsSync: jest.fn(),
            readFileSync: jest.fn(),
        }));

        jest.mock('path', () => ({
            join: jest.fn(() => '/mock/path/products.json'),
        }));
    });

    test('should load valid products data', () => {
        // 1. Set up mocks
        require('fs').existsSync.mockReturnValue(true);
        require('fs').readFileSync.mockReturnValue(JSON.stringify(mockData));

        // 2. Import the module AFTER setting up mocks
        const { productsData } = require('../repositories/productData');

        // 3. Verify the calls
        expect(require('fs').existsSync).toHaveBeenCalledWith('/mock/path/products.json');
        expect(require('fs').readFileSync).toHaveBeenCalledWith('/mock/path/products.json', 'utf8');

        // 4. Verify the data
        expect(productsData).toEqual(mockData);
    });

    test('should return undefined for non-existent product (Client Gift Box)', () => {
        require('fs').existsSync.mockReturnValue(true);
        require('fs').readFileSync.mockReturnValue(JSON.stringify(mockData));

        const { productsData } = require('../repositories/productData');

        expect(productsData.products).toBeDefined();
        expect(productsData.products["Client Gift Box"]).toBeUndefined();
    });

    test('should contain Birthday Box with correct items', () => {
        require('fs').existsSync.mockReturnValue(true);
        require('fs').readFileSync.mockReturnValue(JSON.stringify(mockData));

        const { productsData } = require('../repositories/productData');

        expect(productsData.products).toHaveProperty("Birthday Box");
        expect(productsData.products["Birthday Box"]).toEqual([
            "Birthday cupcake",
            "$100 Visa Gift Card",
            "Birthday card"
        ]);
    });

    test('should return an empty object when JSON format is invalid (not an object)', () => {
        require('fs').existsSync.mockReturnValue(true);
        require('fs').readFileSync.mockReturnValue('["Not an object"]');

        const { productsData } = require('../repositories/productData');

        expect(productsData).toEqual({"products": {}});
    });
    
});