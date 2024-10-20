import { useState, useEffect } from "react";

export default function CashWithdrawalsForm({ refetchCashWithdrawals, selectedCashWithdrawal, setOpen }) {
  const [withdrawalType, setWithdrawalType] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isCheckPayment, setIsCheckPayment] = useState(false); // State for checkbox
  const [checkNumber, setCheckNumber] = useState(""); // State for check number
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/employees");
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();

    // Set form fields if editing
    if (selectedCashWithdrawal) {
      setWithdrawalType(selectedCashWithdrawal.type);
      setAmount(selectedCashWithdrawal.amount);
      setDate(selectedCashWithdrawal.date.split("T")[0]); // Convert to YYYY-MM-DD
      setNotes(selectedCashWithdrawal.notes);
      setIsCheckPayment(selectedCashWithdrawal.checkNumber ? true : false); // Set checkbox state
      setCheckNumber(selectedCashWithdrawal.checkNumber || ""); // Set check number if available
    }
  }, [selectedCashWithdrawal]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("/api/cashWithdrawals", {
      method: selectedCashWithdrawal ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: withdrawalType,
        amount,
        date,
        notes,
        checkNumber: isCheckPayment ? checkNumber : null, // Include check number if applicable
        id: selectedCashWithdrawal ? selectedCashWithdrawal.id : undefined,
      }),
    });

    if (response.ok) {
      setWithdrawalType("");
      setAmount("");
      setDate("");
      setNotes("");
      setIsCheckPayment(false); // Reset checkbox state
      setCheckNumber(""); // Reset check number
      refetchCashWithdrawals();
      setOpen(false);
    }
  };

  if (error) return <div>{error}</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="withdrawalType" className="block text-sm font-medium text-gray-700">
          نوع السحب
        </label>
        <select
          id="withdrawalType"
          value={withdrawalType}
          //set the text of option 
          onChange={(e) => setWithdrawalType(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        >
          <option value="" disabled>Select withdrawal type</option>
          <option value="تسديد فواتير ذمم سابقة">تسديد فواتير ذمم سابقة</option>
          <option value="اغلاق حساب موظف باثر رجعي">اغلاق حساب موظف باثر رجعي</option>
          <option value="سحب نقدي - ملّاكين">سحب نقدي - ملّاكين</option>
          <option value="اخرى">اخرى</option>
        </select>
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          المبلغ
        </label>
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          تاريخ السحب
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          ملاحظات
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        ></textarea>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isCheckPayment"
          checked={isCheckPayment}
          onChange={() => setIsCheckPayment(!isCheckPayment)}
          className="mr-2"
        />
        <label htmlFor="isCheckPayment" className="text-sm font-medium text-gray-700">
          هل تم الدفع بشيك
        </label>
      </div>

      {isCheckPayment && (
        <div>
          <label htmlFor="checkNumber" className="block text-sm font-medium text-gray-700">
            رقم الشيك
          </label>
          <input
            id="checkNumber"
            type="text"
            value={checkNumber}
            onChange={(e) => setCheckNumber(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
      )}

      <div>
        <button
          type="submit"
          className={`w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${selectedCashWithdrawal ? 'bg-orange-500 hover:bg-orange-600' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${selectedCashWithdrawal ? 'orange-500' : 'indigo-500'}`}
        >
          {selectedCashWithdrawal ? "تحديث سحب نقدي" : "إضافة سحب نقدي"}
        </button>
      </div>
    </form>
  );
}
