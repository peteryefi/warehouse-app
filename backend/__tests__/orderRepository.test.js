const fs = require('fs');
const path = require('path');
const OrderRepository = require('../repositories/order');
const OrderValidator = require('../utils/orderValidator');

jest.mock('fs');
jest.mock('../utils/orderValidator');

describe('OrderRepository', () => {
    let orderRepo;
    let mockOrders;

    beforeEach(() => {
        mockOrders = [
            { id: 'order_1743874307448_850', date: '2024-04-01', products: [{ name: 'Red Roses Bouquet', quantity: 2 }], address: { street: '123 St', country: 'Canada', city: 'Montreal', zipCode: 'H1N 2E5' }, status: 'pending' },
            { id: 'order_1743874307448_852', date: '2024-04-02', products: [{ name: 'Birthday cupcake', quantity: 1 }], address: { street: '456 St', country: 'Canada', city: 'Toronto', zipCode: 'G1N 3D3' }, status: 'shipped' }
        ];
        fs.readFileSync.mockReturnValue(JSON.stringify({ orders: mockOrders }));
        orderRepo = new OrderRepository();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should load orders from file on initialization', () => {
        expect(orderRepo.orders).toEqual(mockOrders);
    });

   test('should return all orders', () => {
        expect(orderRepo.getAllOrders()).toEqual(mockOrders);
    });

    test('should return an order by ID', () => {
        expect(orderRepo.getOrderById('order_1743874307448_850')).toEqual(mockOrders[0]);
        expect(orderRepo.getOrderById('order_3')).toBeNull();
    });

    test('should create a new order', () => {
        const newOrder = {
            date: '2024-04-03',
            products: [{ name: 'Client Gift Box', quantity: 3 }],
            address: { street: 'Kwame Nkrumah Street', country: 'Ghana', city: 'Accra', zipCode: 'BMS 189' },
            status: 'pending'
        };

        OrderValidator.isValidOrder.mockReturnValue({ valid: true });
        const createdOrder = orderRepo.createOrder(newOrder);

        expect(createdOrder).toMatchObject(newOrder);
        expect(orderRepo.orders.length).toBe(3);
        expect(fs.writeFileSync).toHaveBeenCalled();
    });


    test('should throw an error when creating an invalid order', () => {
        OrderValidator.isValidOrder.mockReturnValue({ valid: false, message: 'Invalid order' });
        expect(() => orderRepo.createOrder({})).toThrow('Invalid order');
    });

    test('should update an existing order', () => {
        const updatedOrder = {
            date: '2024-04-01',
            products: [{ name: 'Wedding Present', quantity: 4 }],
            address: { street: 'Independence Avenue', country: 'Ghana', city: 'Accra', zipCode: '10001' },
            status: 'delivered'
        };
        OrderValidator.isValidOrder.mockReturnValue({ valid: true });
        const result = orderRepo.updateOrder('order_1743874307448_850', updatedOrder);

        expect(result).toMatchObject(updatedOrder);
        expect(orderRepo.orders[0]).toMatchObject(updatedOrder);
        expect(fs.writeFileSync).toHaveBeenCalled();
    });

    test('should throw an error when updating a non-existent order', () => {
        expect(() => orderRepo.updateOrder('order_2483', {})).toThrow('Order not found');
    });

    test('should delete an order by ID', () => {
        const deletedOrder = orderRepo.deleteOrder('order_1743874307448_852');
        expect(deletedOrder.id).toBe('order_1743874307448_852');
        expect(orderRepo.orders.length).toBe(1);
        expect(fs.writeFileSync).toHaveBeenCalled();
    });

    test('should throw an error when deleting a non-existent order', () => {
        expect(() => orderRepo.deleteOrder('order_99111')).toThrow('Order not found');
    });

    test('should filter orders within a date range', () => {
        const filteredOrders = orderRepo.getOrdersWithinDateRange(new Date('2024-04-01'), new Date('2024-04-02'));
        expect(filteredOrders.length).toBe(2);
    });

    test('should extract product counts from orders', () => {
        const productCounts = orderRepo.extractProductCountsFromOrders(mockOrders);
        expect(productCounts).toEqual({ 'Red Roses Bouquet': 2, 'Birthday cupcake': 1 });
    });
});
