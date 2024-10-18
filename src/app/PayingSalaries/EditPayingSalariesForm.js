"use client";
import { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";

export default function EditPayingSalariesForm({
  selectedSalary,
  refetchSalaries,
  setOpen,
}) {
  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split("T")[0]; // e.g., "2024-10-18"
  };

  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [PaidDate, setPaidDate] = useState(getCurrentDate()); // Set default to current date
  const [adjustedRemainingSalary, setAdjustedRemainingSalary] = useState(null);
  const [amountToPay, setAmountToPay] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect to load selected salary data
  useEffect(() => {
    if (selectedSalary) {
      setSelectedEmployee(selectedSalary.employee_name);
      setSelectedEmployeeId(selectedSalary.employee_id);
      setAdjustedRemainingSalary(selectedSalary.adjusted_remaining_salary);
      setAmountToPay(selectedSalary.paid_amount); // Set initial amount to pay
      setPaidDate(selectedSalary.date); // Set the paid date
    }
  }, [selectedSalary]);

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
if (amountToPay <= selectedSalary.finall_remaining) {
    try {
      const response = await fetch("/api/PayingSalaries", {
        method: "PUT", // Use PUT method for update
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountToPay,
          date: PaidDate,
          employeeId: selectedEmployeeId,
          finallRemining: selectedSalary.finall_remaining - amountToPay, // Update final remaining
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error updating salary:", errorData);
        setMessage("Error updating salary.");
      } else {
        refetchSalaries(); // Call the refetch function
        setOpen(false); // Close the form
      }
    } catch (error) {
      console.error("Error processing update:", error);
      setMessage("Error processing update.");
    }}
    else {
      setMessage("المبلغ المدفوع أكبر من الراتب المتبقي");
      return
    }
  };

  if (!loading) {
    return (
      <div className="text-center flex justify-center mt-24 ">
        <FaSpinner color="blue" size={24} className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto mb-8 px-4">
      <form className="mt-4" onSubmit={handleUpdateSubmit}>
        <div className="mb-4">
          <label className="font-bold">اسم الموظف:</label>
          <input
            type="text"
            value={selectedEmployee}
            disabled
            className="border border-gray-300 rounded-md p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="font-bold">راتب الموظف:</label>
          <input
            type="text"
            value={`${parseFloat(adjustedRemainingSalary).toFixed(2)} JOD`}
            disabled
            className="border border-gray-300 rounded-md p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="font-bold">الراتب المتبقي:</label>
          <input
            type="text"
            value={`${parseFloat(selectedSalary.finall_remaining).toFixed(2)} JOD`}
            disabled
            className="border border-gray-300 rounded-md p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="font-bold">تاريخ الدفع:</label>
          <input
            type="date"
            value={PaidDate}
            onChange={(e) => setPaidDate(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="font-bold">المبلغ:</label>
          <input
            type="text"
            value={parseFloat(selectedSalary.finall_remaining).toFixed(2)}
            onChange={(e) => setAmountToPay(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full"
            required
          />
        </div>
        {message && <div className="text-red-500 text-sm">{message}</div>}
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          تحديث الراتب
        </button>
      </form>
    </div>
  );
}
