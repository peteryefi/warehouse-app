import axios from 'axios';

const API_BASE_URL = "http://localhost:3000/api/orders";

export const getOrders = async () => {
    try {
        const response = await axios.get(API_BASE_URL);
        return response.data;
      } catch (error) {
        console.error("Error fetching orders:", error);
        throw error; 
      }
};

export const getOrderSummary = async (startDate, endDate) => {
  const response = await axios.get(`${API_BASE_URL}/summary`, {
    params: { startDate, endDate },
  });
  console.log(response);
  return response.data.products;
};
