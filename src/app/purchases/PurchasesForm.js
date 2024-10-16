"use client";
import { useState, useEffect } from "react";

export default function PurchasesForm({ refetchCosts, setOpen }) {
  const [amount, setAmount] = useState("");
  const [paidAmount, setPaidAmount] = useState(""); // Added paid amount field
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [supplier, setSupplier] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(""); // Validation error for amounts
  const [checkField, setCheckField] = useState(false);
  const [checkNumber, setCheckNumber] = useState(""); // Add state for check number

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (checkField && !checkNumber) {
      setValidationError("Check number is required for check payments.");
      return;
    }
    // Validation: Paid Amount should not be greater than Amount
    if (parseFloat(paidAmount) > parseFloat(amount)) {
      setValidationError(
        "Paid amount cannot be greater than the total amount."
      );
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
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        paidAmount,
        remainingAmount, // Send remaining amount
        paymentStatus,
        date,
        name,
        supplier,
        checkNumber,
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
      // Reset check field and check number 
      setCheckField(false);
      setCheckNumber("");

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
          اسم الصنف
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ادخل اسم الصنف"
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
          تاريخ الشراء
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
          القيمة الفاتورة
        </label>
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="ادخل قيمة الفاتورة"
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
          القيمة المدفوعة
        </label>
        <input
          id="paidAmount"
          type="number"
          value={paidAmount}
          onChange={(e) => setPaidAmount(e.target.value)}
          placeholder="ادخل القيمة المدفوعة"
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
          المورد
        </label>
        <select
          id="supplier"
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">اختر</option>
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
      <div className="flex items-center gap-2 justify-start">
        <input
          type="checkbox"
          id="checkField"
          name="checkField"
          checked={checkField}
          onChange={() => setCheckField(!checkField)} // Properly toggle the checkbox value
        />
        <label
          htmlFor="checkField"
          className="block text-sm font-medium text-gray-700"
        >
          هل الدفع بشيك؟
        </label>
      </div>
      {checkField && (
        <div>
          <label
            htmlFor="checkNumber"
            className="block text-sm font-medium text-gray-700"
          >
            رقم الشيك
          </label>
          <input
            id="checkNumber"
            type="text"
            value={checkNumber}
            onChange={(e) => setCheckNumber(e.target.value)}
            placeholder="ادخل رقم الشيك"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      )}
      {/* Submit button */}
      <div>
        <button
          type="submit"
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          اضافة فاتورة
        </button>
      </div>
    </form>
  );
}
