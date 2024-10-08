
'use client';
import { useEffect, useState } from "react";

export default function StaffFoodForm({ selectedFood, refetchFood, setOpen }) {
    const [employeeId, setEmployeeId] = useState(""); // Now storing employee_id
    const [date, setDate] = useState("");
    const [note, setNote] = useState("");
    const [amount, setAmount] = useState("");
    const [employees, setEmployees] = useState([]);
  
    // Populate form fields when editing
    useEffect(() => {
      if (selectedFood) {
        setEmployeeId(selectedFood.employee_id); // Store employee_id
        setDate(selectedFood.date);
        setNote(selectedFood.note);
        setAmount(selectedFood.amount);
      }
    }, [selectedFood]);
  
    // Fetch employees for the dropdown
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
    }, []);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      // Ensure that employeeId is sent along with the other data
      const response = await fetch("/api/stafffood", {
        method: selectedFood ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedFood?.id,
          employee_id: employeeId,  // Send employee_id here
          date,
          note,
          amount,
        }),
      });
  
      if (response.ok) {
        // Reset form fields after successful submission
        setEmployeeId("");  // Reset employeeId after submission
        setDate("");
        setNote("");
        setAmount("");
        setOpen(false); // Close the drawer
        refetchFood(); // Refresh the table
      }
    };
  
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee Name Dropdown */}
        <div>
          <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
            Employee Name
          </label>
          <select
            id="employeeId"
            value={employeeId}  // Use employeeId in the dropdown
            onChange={(e) => setEmployeeId(e.target.value)}  // Update employeeId on selection
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Select employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}> {/* Pass employee.id */}
                {employee.name}  {/* Display employee name */}
              </option>
            ))}
          </select>
        </div>
  
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
  
        {/* Note field */}
        <div>
          <label htmlFor="note" className="block text-sm font-medium text-gray-700">
            Note
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
  
        {/* Amount field */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
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
  
        {/* Submit button */}
        <div>
          <button
            type="submit"
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {selectedFood ? "Edit Entry" : "Add Entry"}
          </button>
        </div>
      </form>
    );
  }
  