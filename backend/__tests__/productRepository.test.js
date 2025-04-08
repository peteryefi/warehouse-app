const ProductRepository  = require('../repositories/product');
const { productsData } = require('../repositories/productData');

// Mock the productsData
jest.mock('../repositories/productData', () => ({
    productsData: {
        products: {
            "Valentine Box": ["Red Roses Bouquet", "Box of chocolates"],
            "Birthday Box": ["Birthday cupcake", "Gift Card", "Birthday card"],
            "Empty Box": []
        }
    }
}));

describe('ProductRepository', () => {
    let productRepo;

    beforeEach(() => {
        // Create a new instance before each test
        productRepo = new ProductRepository();
    });

    describe('constructor', () => {
        test('should initialize with products data', () => {
            expect(productRepo.products).toEqual({
                products: {
                    "Valentine Box": expect.any(Array),
                    "Birthday Box": expect.any(Array),
                    "Empty Box": expect.any(Array)
                }
            });
        });
    });

    describe('_getProducts', () => {
        test('should return products data', () => {
            const result = productRepo._getProducts();
            expect(result).toEqual(expect.objectContaining({
                products: expect.any(Object)
            }));
        });
    });

    describe('getProductsForOrder', () => {
        test('should return products with items for valid order', () => {
            const orderProducts = [
                { name: "Valentine Box", quantity: 2 },
                { name: "Birthday Box", quantity: 1 }
            ];

            const result = productRepo.getProductsForOrder(orderProducts);
            
            expect(result).toEqual([
                {
                    name: "Valentine Box",
                    quantity: 2,
                    items: ["Red Roses Bouquet", "Box of chocolates"]
                },
                {
                    name: "Birthday Box",
                    quantity: 1,
                    items: ["Birthday cupcake", "Gift Card", "Birthday card"]
                }
            ]);
        });

        test('should skip non-existent products', () => {
            const orderProducts = [
                { name: "Non-Existent Box", quantity: 1 },
                { name: "Valentine Box", quantity: 1 }
            ];

            const result = productRepo.getProductsForOrder(orderProducts);
            expect(result).toEqual([
                {
                    name: "Valentine Box",
                    quantity: 1,
                    items: ["Red Roses Bouquet", "Box of chocolates"]
                }
            ]);
        });

        test('should handle empty product items', () => {
            const orderProducts = [
                { name: "Empty Box", quantity: 1 }
            ];

            const result = productRepo.getProductsForOrder(orderProducts);
            expect(result).toEqual([
                {
                    name: "Empty Box",
                    quantity: 1,
                    items: []
                }
            ]);
        });

        test('should return empty array for empty order', () => {
            const result = productRepo.getProductsForOrder([]);
            expect(result).toEqual([]);
        });
    });

    describe('getProductItems', () => {
        test('should return items for existing product', () => {
            const result = productRepo.getProductItems("Valentine Box");
            expect(result).toEqual(["Red Roses Bouquet", "Box of chocolates"]);
        });

        test('should return empty array for non-existent product', () => {
            const result = productRepo.getProductItems("Non-Existent Box");
            expect(result).toEqual([]);
        });

        test('should return empty array for product with no items', () => {
            const result = productRepo.getProductItems("Empty Box");
            expect(result).toEqual([]);
        });
    });
});