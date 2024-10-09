"use client";
import { useState, useEffect } from "react";

export default function SalesForm({ refetchSales, setOpen }) {
  const [cashAmount, setCashAmount] = useState("");
  const [visaAmount, setVisaAmount] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const response = await fetch("/api/sales", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cash_amount: cashAmount, visa_amount: visaAmount, sale_date: date }),
    });

    if (response.ok) {
      // Reset form
      setCashAmount("");
      setVisaAmount("");
      setDate("");
      setOpen(false); // Close the drawer
      refetchSales(); // Refetch the table data
    } else {
      setError("Failed to add sale. Please try again.");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date Picker */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Date
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Cash Amount */}
      <div>
        <label htmlFor="cashAmount" className="block text-sm font-medium text-gray-700">
          Cash Amount
        </label>
        <input
          id="cashAmount"
          type="number"
          value={cashAmount}
          onChange={(e) => setCashAmount(e.target.value)}
          placeholder="Enter cash amount"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Visa Amount */}
      <div>
        <label htmlFor="visaAmount" className="block text-sm font-medium text-gray-700">
          Visa Amount
        </label>
        <input
          id="visaAmount"
          type="number"
          value={visaAmount}
          onChange={(e) => setVisaAmount(e.target.value)}
          placeholder="Enter visa amount"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Submit button */}
      <div>
        <button
          type="submit"
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={loading}
        >
          {loading ? "Processing ..." : "Add Sale"}
        </button>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>
    </form>
  );
}
