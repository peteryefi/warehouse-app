const OrderValidator  = require('../utils/orderValidator');
const { productsData } = require('../repositories/productData');

// Mock the productsData
jest.mock('../repositories/productData', () => ({
    productsData: {
        products: {
            "Valentine Box": ["Red Roses Bouquet", "Box of chocolates"],
            "Birthday Box": ["Birthday cupcake", "Gift Card"]
        }
    }
}));

describe('OrderValidator', () => {
    const validOrder = {
        products: [
            { name: "Valentine Box", quantity: 2 }
        ],
        date: "2025-04-10",
        address: {
            street: "123 Main St",
            country: "USA",
            city: "New York",
            zipCode: "10001"
        },
        status: "pending"
    };

    describe('isValidOrder', () => {
        test('should validate a complete order', () => {
            const result = OrderValidator.isValidOrder(validOrder);
            expect(result).toEqual({ valid: true, message: "Order is valid" });
        });

        test('should reject non-object orders', () => {
            expect(OrderValidator.isValidOrder(null)).toEqual({
                valid: false,
                message: "Invalid order format"
            });
            expect(OrderValidator.isValidOrder("string")).toEqual({
                valid: false,
                message: "Invalid order format"
            });
        });

        test('should fail for orders without products', () => {
            const invalidOrder = { ...validOrder, date: "invalid" };
            const result = OrderValidator.isValidOrder(invalidOrder);
            expect(result).toEqual({ 
                valid: false, 
                message: "Invalid date format" 
            });
        });

        test('should fail for orders without valid date', () => {
            const invalidOrder = { ...validOrder, products: [] };
            const result = OrderValidator.isValidOrder(invalidOrder);
            expect(result).toEqual({
                valid: false,
                message: "Order must contain at least one product"
            });
        });

        test('should fail for orders without address', () => {
            const invalidOrder = { ...validOrder, address: {} };
            const result = OrderValidator.isValidOrder(invalidOrder);
            expect(result).toEqual({ 
                valid: false, 
                message: "Address fields (street, country, city, zipCode) must be valid" 
            });
        });

        test('should fail for orders with invalid status', () => {
            const invalidOrder = { ...validOrder, status: 'going' };
            const result = OrderValidator.isValidOrder(invalidOrder);
            expect(result).toEqual({ 
                valid: false, 
                message: 'Invalid status. Must be one of: pending, shipped, delivered, canceled' 
            });
        });

    });

    describe('validateProducts', () => {
        test('should validate products array', () => {
            const validProducts = [
                { name: "Birthday Box", quantity: 1 }
            ];
            expect(OrderValidator.validateProducts(validProducts)).toEqual({ valid: true });
        });

        test('should reject empty products array', () => {
            expect(OrderValidator.validateProducts([])).toEqual({
                valid: false,
                message: "Order must contain at least one product"
            });
        });

        test('should reject invalid product names', () => {
            const invalidProducts = [
                { name: "Nonexistent Product", quantity: 1 }
            ];
            expect(OrderValidator.validateProducts(invalidProducts)).toEqual({
                valid: false,
                message: "Invalid product name: Nonexistent Product"
            });
        });

        test('should reject invalid quantities', () => {
            const invalidProducts = [
                { name: "Valentine Box", quantity: 0 }
            ];
            expect(OrderValidator.validateProducts(invalidProducts)).toEqual({
                valid: false,
                message: "Each product must have a positive quantity"
            });
        });
    });

    describe('validateDate', () => {
        test('should validate correct date format', () => {
            expect(OrderValidator.validateDate("2025-04-10")).toEqual({ valid: true });
            expect(OrderValidator.validateDate(new Date().toISOString())).toEqual({ valid: true });
        });

        test('should reject invalid dates', () => {
            expect(OrderValidator.validateDate("not-a-date")).toEqual({
                valid: false,
                message: "Invalid date format"
            });
            expect(OrderValidator.validateDate(null)).toEqual({
                valid: false,
                message: "Invalid date format"
            });
        });
    });

    describe('validateAddress', () => {
        const validAddress = {
            street: "123 Main St",
            country: "USA",
            city: "New York",
            zipCode: "10001"
        };

        test('should validate complete address', () => {
            expect(OrderValidator.validateAddress(validAddress)).toEqual({ valid: true });
        });

        test('should reject missing address', () => {
            expect(OrderValidator.validateAddress(null)).toEqual({
                valid: false,
                message: "Address is required"
            });
        });

        test('should reject incomplete address', () => {
            const invalidAddress = { ...validAddress, street: "" };
            expect(OrderValidator.validateAddress(invalidAddress)).toEqual({
                valid: false,
                message: "Address fields (street, country, city, zipCode) must be valid"
            });
        });
    });

    describe('validateStatus', () => {
        test('should validate correct statuses', () => {
            expect(OrderValidator.validateStatus("pending")).toEqual({ valid: true });
        });
    });

    describe('validateDateRange', () => {
        test('should validate correct date range', () => {
            const result = OrderValidator.validateDateRange("2025-01-01", "2025-01-31");
            expect(result.valid).toBe(true);
            expect(result.start).toBeInstanceOf(Date);
            expect(result.end).toBeInstanceOf(Date);
        });

        test('should reject missing dates', () => {
            expect(OrderValidator.validateDateRange(null, "2025-01-01")).toEqual({
                valid: false,
                message: 'Both startDate and endDate are required'
            });
        });
        
        test('should reject invalid date formats', () => {
            expect(OrderValidator.validateDateRange("invalid", "2025-01-01")).toEqual({
                valid: false,
                message: 'Invalid date format'
            });
        });
    });
})