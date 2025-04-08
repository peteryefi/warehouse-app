import { useEffect, useState } from "react";
import { getOrders } from "@/services/orderService";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null); // Track which order is expanded
  const [expandedAddressId, setExpandedAddressId] = useState(null); // Track which address is expanded

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      }
    }
    fetchOrders();
  }, []);

  // Toggle the visibility of order details
  const toggleAccordion = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Toggle the visibility of address details
  const toggleAddressAccordion = (orderId) => {
    setExpandedAddressId(expandedAddressId === orderId ? null : orderId);
  };

  return (
    <div className="container mx-auto p-4">
      {/* Navbar Header */}
      <header className="bg-blue-600 text-white p-4 fixed top-0 left-0 w-full z-10">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Warehouse Management: Orders</h1>
        </div>
      </header>

      {/* Content with margin-top to avoid overlap */}
      <div className="mt-20">
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="border p-4 rounded shadow">
              <h2 className="text-xl font-semibold">Order #{order.id}</h2>
              <p>Date: {order.date}</p>
              <p>Status: {order.status}</p>
              <button
                onClick={() => toggleAccordion(order.id)}
                className="mt-2 text-blue-600"
              >
                {expandedOrderId === order.id ? "Hide Details" : "Show Details"}
              </button>

              {/* Accordion for product details */}
              {expandedOrderId === order.id && (
                <div className="mt-4">
                  <h3 className="font-semibold">Products:</h3>
                  <ul>
                    {order.products.map((product, index) => (
                      <li key={index} className="mb-2">
                        <strong>{product.name}</strong> (x{product.quantity})
                        <ul className="ml-4">
                          {product.items.map((item, itemIndex) => (
                            <li key={itemIndex}>{item}</li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Accordion for address details */}
              <div className="mt-4 border-t pt-4">
                <h3 className="font-semibold">Address:</h3>
                <p>Name: {order.address.name}</p>
                <p>Email: {order.address.email}</p>
                <p>Street: {order.address.street}</p>
                <button
                  onClick={() => toggleAddressAccordion(order.id)}
                  className="mt-2 text-blue-600"
                >
                  {expandedAddressId === order.id ? "Hide Full Address" : "Show Full Address"}
                </button>

                {/* Full address accordion */}
                {expandedAddressId === order.id && (
                  <div className="mt-2">
                    <p>City: {order.address.city}</p>
                    <p>Country: {order.address.country}</p>
                    <p>Zip Code: {order.address.zipCode}</p>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
