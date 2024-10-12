import { useState, useEffect } from "react";

export default function EditWithdrawals({
  selectedCost,
  refetchCosts,
  setOpen,
}) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [employee, setEmployee] = useState("");
  const [salaryPeriod, setSalaryPeriod] = useState(""); // salary_period field
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Populate the form fields when selectedCost changes
  useEffect(() => {
    if (selectedCost) {
      setAmount(selectedCost.amount);
      setDate(selectedCost.date);
      setEmployee(selectedCost.employee_name);
      setSalaryPeriod(selectedCost.salary_period); // Populate salary period
    }
  }, [selectedCost]);

  // Fetch the employees when the component mounts
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/employees");
        const data = await response.json();
        setEmployees(data);
        setLoading(false);
      } catch (error) {
        setError("Failed to load employees.");
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/withdrawals", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        old_amount: selectedCost.amount,
        date,
        employee_id: employee, // employee_id sent here
        salary_period: salaryPeriod, // salary_period sent here
        id: selectedCost.id,
      }),
    });

    if (response.ok) {
      setAmount("");
      setDate("");
      setEmployee("");
      setSalaryPeriod(""); // Reset the salary period
      setOpen(false); // Close the drawer
      refetchCosts(); // Call refetch after successful submission
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Employee field */}
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
            employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))
          )}
        </select>
      </div>

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
          قيمة السحب
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

      {/* Salary Period (Month Picker) */}
      <div>
        <label
          htmlFor="salaryPeriod"
          className="block text-sm font-medium text-gray-700"
        >
          من حساب شهر
        </label>
        <input
          id="salaryPeriod"
          type="month"
          value={salaryPeriod}
          onChange={(e) => setSalaryPeriod(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Submit button */}
      <div>
        <button
          type="submit"
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-400 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          حفظ وتعديل{" "}
        </button>
      </div>
    </form>
  );
}
