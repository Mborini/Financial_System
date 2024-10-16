import { useState, useEffect } from "react";

export default function WithdrawalsForm({ refetchCosts, setOpen }) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [employee, setEmployee] = useState(""); // employee_id
  const [salaryPeriod, setSalaryPeriod] = useState(""); // salary_period field
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [checkField, setCheckField] = useState(false); // For check payment
  const [checkNumber, setCheckNumber] = useState(""); // For check number

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await fetch("/api/employees");
        const data = await response.json();
        setTypes(data);
        setLoading(false);
      } catch (error) {
        setError("Failed to load employees.");
        setLoading(false);
      }
    };
    fetchTypes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check number validation
    if (checkField && !checkNumber) {
      setError("Check number is required for check payments.");
      return;
    }

    const response = await fetch("/api/withdrawals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        date,
        employee_id: employee, 
        salary_period: salaryPeriod,
        check_number: checkField ? checkNumber : null, // Add check_number only if applicable
      }),
    });

    if (response.ok) {
      setAmount("");
      setDate("");
      setEmployee("");
      setSalaryPeriod(""); 
      setCheckField(false); 
      setCheckNumber(""); 
      setOpen(false); 
      refetchCosts(); 
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date Picker */}
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700"
        >
          التاريخ
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
          القيمة السحب
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

      {/* Employee dropdown */}
      <div>
        <label
          htmlFor="employee"
          className="block text-sm font-medium text-gray-700"
        >
          الموظف
        </label>
        <select
          id="employee"
          value={employee}
          onChange={(e) => setEmployee(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">اختر</option>
          {loading ? (
            <option disabled>Loading...</option>
          ) : error ? (
            <option disabled>{error}</option>
          ) : (
            types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Salary Period (Month Picker) */}
      <div>
        <label
          htmlFor="salaryPeriod"
          className="block text-sm font-medium text-gray-700"
        >
          من حساب شهر{" "}
        </label>
        <input
          id="salaryPeriod"
          type="month" 
          value={salaryPeriod}
          onChange={(e) => setSalaryPeriod(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Check field and check number */}
      <div className="flex items-center gap-2 justify-start">
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

      {/* Submit button */}
      <div>
        <button
          type="submit"
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          حفظ
        </button>
      </div>
    </form>
  );
}
