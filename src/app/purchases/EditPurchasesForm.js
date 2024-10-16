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
  const [checkField, setCheckField] = useState(false); // Checkbox for check payment
  const [checkNumber, setCheckNumber] = useState(""); // Check number input
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
      const formattedDate = new Date(selectedPurchase.date)
        .toISOString()
        .split("T")[0];
      setDate(formattedDate);
      setName(selectedPurchase.name);
      setSupplier(selectedPurchase.supplier);

      // If the selected purchase includes a check number, enable check field
      if (selectedPurchase.check_number) {
        setCheckField(true);
        setCheckNumber(selectedPurchase.check_number);
      }
    }
  }, [selectedPurchase]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate if paid amount is greater than total amount
    if (parseFloat(paidAmount) > parseFloat(amount)) {
      setValidationError("Paid amount cannot be greater than the total amount.");
      return;
    }

    // Ensure check number is entered if check payment is selected
    if (checkField && !checkNumber) {
      setValidationError("Check number is required if payment is made by check.");
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
        checkNumber: checkField ? checkNumber : null, // Include check number only if applicable
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
          اسم الصنف
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
          قيمة الفاتورة
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
          القيمة المدفوعة
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

      {/* Check field and check number */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="checkField"
          name="checkField"
          checked={checkField}
          onChange={() => setCheckField(!checkField)}
        />
        <label htmlFor="checkField" className="block text-sm font-medium text-gray-700">
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
            placeholder="Enter check number"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      )}

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

      {/* Submit button */}
      <div>
        <button
          type="submit"
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-400 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          حفظ وتعديل
        </button>
      </div>
    </form>
  );
}
