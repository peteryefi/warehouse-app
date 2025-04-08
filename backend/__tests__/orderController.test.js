const OrderController = require('../controllers/order');
const OrderValidator = require('../utils/orderValidator');

// Mock dependencies
jest.mock('../utils/orderValidator');

describe('OrderController', () => {
    let controller;
    let mockOrderRepo;
    let mockProductRepo;
    let mockRequest;
    let mockResponse;

    beforeEach(() => {
        mockOrderRepo = {
            getAllOrders: jest.fn(),
            getOrderById: jest.fn(),
            createOrder: jest.fn(),
            updateOrder: jest.fn(),
            deleteOrder: jest.fn(),
            getOrdersWithinDateRange: jest.fn(),
            extractProductCountsFromOrders: jest.fn()
        };

        mockProductRepo = {
            getProductsForOrder: jest.fn(),
            getProductItems: jest.fn()
        };

        // Mock response object with Jest functions
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            set: jest.fn().mockReturnThis()
        };

        mockRequest = {
            params: {},
            body: {},
            query: {} 
        };

        // Initialize controller with mock repositories
        controller = new OrderController(mockOrderRepo, mockProductRepo);

        // Reset all mocks
        jest.clearAllMocks();
    });

    describe('getOrders', () => {
        test('should return orders with product details', async () => {
            // Setup mock data
            const mockOrders = [{
                id: 'order1',
                products: [{ name: 'Valentine Box', quantity: 2 }]
            }];
            const mockProductDetails = [{
                name: 'Valentine Box',
                quantity: 2,
                items: ['Roses', 'Chocolates']
            }];

            mockOrderRepo.getAllOrders.mockReturnValue(mockOrders);
            mockProductRepo.getProductsForOrder.mockResolvedValue(mockProductDetails);

            await controller.getOrders(mockRequest, mockResponse);

            expect(mockOrderRepo.getAllOrders).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith([{
                id: 'order1',
                products: mockProductDetails
            }]);
        });

        test('should handle errors', async () => {
            mockOrderRepo.getAllOrders.mockImplementation(() => {
                throw new Error('Database error');
            });

            await controller.getOrders(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to fetch orders' });
        });
    });

    describe('getOrderById', () => {
        test('should return order with product details', async () => {
            const mockOrder = {
                id: 'order1',
                products: [{ name: 'Birthday Box', quantity: 1 }]
            };
            const mockProductDetails = [{
                name: 'Birthday Box',
                quantity: 1,
                items: ['Cake', 'Card']
            }];

            mockRequest.params = { id: 'order1' };
            mockOrderRepo.getOrderById.mockReturnValue(mockOrder);
            mockProductRepo.getProductsForOrder.mockResolvedValue(mockProductDetails);

            await controller.getOrderById(mockRequest, mockResponse);

            expect(mockOrderRepo.getOrderById).toHaveBeenCalledWith('order1');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                id: 'order1',
                products: mockProductDetails
            });
        });

        test('should return 404 for non-existent order', async () => {
            mockRequest.params = { id: 'nonexistent' };
            mockOrderRepo.getOrderById.mockReturnValue(null);

            await controller.getOrderById(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Order not found' });
        });

        test('should return 500 for get order without id params', async () => {
            mockOrderRepo.getOrderById.mockReturnValue(null);

            await controller.getOrderById({}, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to fetch order' });
        });
    });

    describe('createOrder', () => {
        test('should create and return new order', () => {
            const newOrder = {
                products: [{ name: 'Valentine Box', quantity: 1 }],
                date: '2025-02-14'
            };
            const createdOrder = { ...newOrder, id: 'order123' };

            mockRequest.body = newOrder;
            mockOrderRepo.createOrder.mockReturnValue(createdOrder);

            controller.createOrder(mockRequest, mockResponse);

            expect(mockOrderRepo.createOrder).toHaveBeenCalledWith(newOrder);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.set).toHaveBeenCalledWith('Location', '/api/orders/order123');
            expect(mockResponse.json).toHaveBeenCalledWith(createdOrder);
        });

        test('should handle validation errors', () => {
            mockRequest.body = { invalid: 'order' };
            mockOrderRepo.createOrder.mockImplementation(() => {
                throw new Error('Invalid order');
            });

            controller.createOrder(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid order' });
        });
    });

    describe('updateOrder', () => {
        test('should update and return order', () => {
            const updatedOrder = {
                products: [{ name: 'Birthday Box', quantity: 2 }],
                status: 'completed'
            };

            mockRequest.params = { id: 'order1' };
            mockRequest.body = updatedOrder;
            mockOrderRepo.updateOrder.mockReturnValue({ id: 'order1', ...updatedOrder });

            controller.updateOrder(mockRequest, mockResponse);

            expect(mockOrderRepo.updateOrder).toHaveBeenCalledWith('order1', updatedOrder);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({ id: 'order1', ...updatedOrder });
        });

        test('should return 400 for update order without id params', async () => {
            mockOrderRepo.getOrderById.mockReturnValue(null);

            controller.updateOrder({}, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: "Cannot read properties of undefined (reading 'id')" });
        });
    });

    describe('deleteOrder', () => {
        test('should delete order and return success', () => {
            const deletedOrder = { id: 'order1' };

            mockRequest.params = { id: 'order1' };
            mockOrderRepo.deleteOrder.mockReturnValue(deletedOrder);

            controller.deleteOrder(mockRequest, mockResponse);

            expect(mockOrderRepo.deleteOrder).toHaveBeenCalledWith('order1');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Order deleted',
                order: deletedOrder
            });
        });

        test('should return 404 for delete order without id params', async () => {
            mockOrderRepo.getOrderById.mockReturnValue(null);

            controller.deleteOrder({}, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: "Cannot read properties of undefined (reading 'id')" });
        });
    });

    describe('getOrderProductsByDateRange', () => {
        test('should return product counts for date range', async () => {
            const mockOrders = [{
                id: 'order1',
                date: '2025-02-01',
                products: [{ name: 'Valentine Box', quantity: 2 }]
            }];
            const productCounts = { 'Valentine Box': 2 };
            const expandedProducts = { 'Roses': 2, 'Chocolates': 2 };

            mockRequest.query = {
                startDate: '2025-02-01',
                endDate: '2025-02-28'
            };
            OrderValidator.validateDateRange.mockReturnValue({
                valid: true,
                start: new Date('2025-02-01'),
                end: new Date('2025-02-28')
            });
            mockOrderRepo.getOrdersWithinDateRange.mockResolvedValue(mockOrders);
            mockOrderRepo.extractProductCountsFromOrders.mockReturnValue(productCounts);
            mockProductRepo.getProductItems.mockImplementation(name => {
                return name === 'Valentine Box' ? ['Roses', 'Chocolates'] : [];
            });

            await controller.getOrderProductsByDateRange(mockRequest, mockResponse);

            expect(OrderValidator.validateDateRange).toHaveBeenCalledWith('2025-02-01', '2025-02-28');
            expect(mockOrderRepo.getOrdersWithinDateRange).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                products: expandedProducts
            });
        });

        test('should handle invalid date range', async () => {
            mockRequest.query = {
                startDate: 'invalid',
                endDate: '2025-02-28'
            };
            OrderValidator.validateDateRange.mockReturnValue({
                valid: false,
                message: 'Invalid date format'
            });

            await controller.getOrderProductsByDateRange(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Invalid date format'
            });
        });

        test('should return 500 for data range fetch with no query param', async () => {
            mockOrderRepo.getOrderById.mockReturnValue(null);

            await controller.getOrderProductsByDateRange(null, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to fetch products for the date range' });
        
        });
    });

    describe('expandOrderProducts', () => {
        test('should expand product counts to individual items', () => {
            const productCounts = {
                'Valentine Box': 2,
                'Birthday Box': 1
            };

            mockProductRepo.getProductItems.mockImplementation(name => {
                return {
                    'Valentine Box': ['Roses', 'Chocolates'],
                    'Birthday Box': ['Cake', 'Card']
                }[name];
            });

            const result = controller.expandOrderProducts(productCounts);

            expect(result).toEqual({
                'Roses': 2,
                'Chocolates': 2,
                'Cake': 1,
                'Card': 1
            });
        });
    });

    describe('getOrders - Additional Cases', () => {
        test('should handle empty orders array', async () => {
            mockOrderRepo.getAllOrders.mockReturnValue([]);
            await controller.getOrders(mockRequest, mockResponse);
            
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith([]);
            expect(mockProductRepo.getProductsForOrder).not.toHaveBeenCalled();
        });

        test('should handle product repository error', async () => {
            const mockOrders = [{ id: 'order1', products: [{ name: 'Valentine Box', quantity: 1 }] }];
            mockOrderRepo.getAllOrders.mockReturnValue(mockOrders);
            mockProductRepo.getProductsForOrder.mockRejectedValue(new Error('Product error'));
            
            await controller.getOrders(mockRequest, mockResponse);
            
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to fetch orders' });
        });
    });
});