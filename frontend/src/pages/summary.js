import { useEffect, useState } from "react";
import { getOrderSummary } from "@/services/orderService";

export default function SummaryPage() {
  const [summary, setSummary] = useState({});
  const [startDate, setStartDate] = useState("2024-04-01");
  const [endDate, setEndDate] = useState("2024-04-02");

  // Function to fetch the order summary
  const fetchSummary = async () => {
    try {
      const data = await getOrderSummary(startDate, endDate);
      setSummary(data);
    } catch (error) {
      console.error("Failed to fetch summary", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Navbar Header */}
      <header className="bg-blue-600 text-white p-4 fixed top-0 left-0 w-full z-10">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Order Management: Order Summary</h1>
        </div>
      </header>

      {/* Content with margin-top to avoid overlap */}
      <div className="mt-20">
        {/* Date Inputs */}
        <div className="mb-4">
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded"
          />
          <label className="ml-4">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>

        {/* Order Summary Text */}
        <h2 className="text-xl font-semibold mb-4">
          Order Summary for {startDate} to {endDate}
        </h2>
        
        {/* Button to Trigger Fetch */}
        <div className="mb-4">
          <button
            onClick={fetchSummary}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Fetch Summary
          </button>
        </div>

        {/* Display Order Summary */}
        <ul className="mt-4">
          {Object.entries(summary).map(([product, count]) => (
            <li key={product}>{product}: {count}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
