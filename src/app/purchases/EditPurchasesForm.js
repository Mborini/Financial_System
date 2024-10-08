"use client";
import { useState, useEffect } from "react";

export default function EditPurchasesForm({
  selectedPurchase,
  refetchCosts,
  setOpen,
}) {
  const [amount, setAmount] = useState("");
  const [paidAmount, setPaidAmount] = useState(""); // Added paid amount field
  const [date, setDate] = useState(""); // Ensure the date is stored correctly
  const [name, setName] = useState("");
  const [supplier, setSupplier] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(""); // Validation error for amounts

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch("/api/suppliers");
        const data = await response.json();
        setSuppliers(data);
        setLoading(false);
      } catch (error) {
        setError("Failed to load suppliers.");
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  // Pre-fill form with selected purchase data
  useEffect(() => {
    if (selectedPurchase) {
      setAmount(selectedPurchase.amount);
      setPaidAmount(selectedPurchase.paid_amount);

      // Convert the date to YYYY-MM-DD format for the date input field
      const formattedDate = new Date(selectedPurchase.date).toISOString().split("T")[0];
      setDate(formattedDate);

      setName(selectedPurchase.name);
      setSupplier(selectedPurchase.supplier);
    }
  }, [selectedPurchase]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: Paid Amount should not be greater than Amount
    if (parseFloat(paidAmount) > parseFloat(amount)) {
      setValidationError("Paid amount cannot be greater than the total amount.");
      return;
    }

    // Clear validation error if valid
    setValidationError("");

    // Determine payment status
    let paymentStatus = "Debt";
    if (parseFloat(paidAmount) >= parseFloat(amount)) {
      paymentStatus = "Paid";
    } else if (paidAmount > 0) {
      paymentStatus = "Partial";
    }

    const remainingAmount = amount - paidAmount; // Calculate remaining amount

    const response = await fetch("/api/purchases", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: selectedPurchase.id,
        amount,
        paidAmount, // Include paid amount
        remainingAmount, // Include remaining amount
        paymentStatus,
        date,
        name,
        supplier,
      }),
    });

    if (response.ok) {
      setAmount("");
      setPaidAmount("");
      setDate("");
      setName("");
      setSupplier("");
      setOpen(false); // Close the drawer
      refetchCosts(); // Refetch the table data
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name field */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Date Picker */}
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700"
        >
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

      {/* Amount field */}
      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700"
        >
          Amount
        </label>
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Paid Amount field */}
      <div>
        <label
          htmlFor="paidAmount"
          className="block text-sm font-medium text-gray-700"
        >
          Paid Amount
        </label>
        <input
          id="paidAmount"
          type="number"
          value={paidAmount}
          onChange={(e) => setPaidAmount(e.target.value)}
          placeholder="Enter paid amount"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Show validation error */}
      {validationError && (
        <p className="text-red-500 text-sm">{validationError}</p>
      )}

      {/* Supplier field */}
      <div>
        <label
          htmlFor="supplier"
          className="block text-sm font-medium text-gray-700"
        >
          Supplier
        </label>
        <select
          id="supplier"
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Select supplier</option>
          {loading ? (
            <option disabled>Loading...</option>
          ) : error ? (
            <option disabled>{error}</option>
          ) : (
            suppliers.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Submit button */}
      <div>
        <button
          type="submit"
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Update Purchase
        </button>
      </div>
    </form>
  );
}
