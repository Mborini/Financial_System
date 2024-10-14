import React, { useState, useEffect } from "react";
import { format, parseISO } from "date-fns"; // Import date-fns functions

function EditForm({ selectedSale, refetchSales, setOpen }) {
  const [cashAmount, setCashAmount] = useState("");
  const [visaAmount, setVisaAmount] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (selectedSale && selectedSale.id) {
      setCashAmount(selectedSale.cash_amount);
      setVisaAmount(selectedSale.visa_amount);

      // Format the date properly to YYYY-MM-DD for the date input field
      const formattedDate = format(parseISO(selectedSale.sale_date), "yyyy-MM-dd");
      setDate(formattedDate); // Set the formatted date to the input field value
    }
  }, [selectedSale]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Ensure that selectedSale exists and has a valid id
    if (!selectedSale || !selectedSale.id) {
      setError("No sale selected for editing.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/sales", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: selectedSale.id,
        cash_amount: cashAmount,
        visa_amount: visaAmount,
        sale_date: date,
      }),
    });

    if (response.ok) {setOpen(false);
        refetchSales();
    
    } else {
      setError("Failed to update sale. Please try again.");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date Picker */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          التاريخ
        </label>
        <input
          id="date"
          type="date"
          value={date} // Bind the formatted date to the input value
          onChange={(e) => setDate(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          disabled={loading} // Disable during loading
        />
      </div>

      {/* Cash Amount */}
      <div>
        <label htmlFor="cashAmount" className="block text-sm font-medium text-gray-700">
          قيمة الكاش
        </label>
        <input
          id="cashAmount"
          type="number"
          value={cashAmount}
          onChange={(e) => setCashAmount(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          disabled={loading} // Disable during loading
        />
      </div>

      {/* Visa Amount */}
      <div>
        <label htmlFor="visaAmount" className="block text-sm font-medium text-gray-700">
          قيمة الفيزا
        </label>
        <input
          id="visaAmount"
          type="number"
          value={visaAmount}
          onChange={(e) => setVisaAmount(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          disabled={loading} // Disable during loading
        />
      </div>

      {/* Submit button */}
      <div className="flex justify-between items-center">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600"
          disabled={loading}
        >
          {loading ? "جاري الحفظ..." : "حفظ وتعديل"}
        </button>
      </div>

    
    </form>
  );
}

export default EditForm;
