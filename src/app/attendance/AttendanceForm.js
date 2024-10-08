"use client";
import { useState, useEffect } from "react";

export default function AttendanceForm({ refetchAttendance, setOpen }) {
  const [employeeId, setEmployeeId] = useState("");
  const [checkInDateTime, setCheckInDateTime] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch employee list to populate the dropdown
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

  const handleCheckIn = async (e) => {
    e.preventDefault();

    const response = await fetch("/api/attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        employee_id: employeeId,
        action: "check_in",
        checkInDateTime: checkInDateTime, // Send the picked datetime for check-in
      }),
    });

    if (response.ok) {
      setEmployeeId("");
      setCheckInDateTime("");
      setOpen(false); // Close the drawer
      refetchAttendance(); // Refetch the table data
    } else {
      const errorData = await response.json();
      console.error("Error adding attendance:", errorData);
    }
  };

  return (
    <form onSubmit={handleCheckIn} className="space-y-6">
      {/* Employee Dropdown */}
      <div>
        <label htmlFor="employee" className="block text-sm font-medium text-gray-700">
          Employee
        </label>
        <select
          id="employee"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Select employee</option>
          {loading ? (
            <option disabled>Loading...</option>
          ) : error ? (
            <option disabled>{error}</option>
          ) : (
            employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Check-in Date and Time Input */}
      <div>
        <label htmlFor="checkInDateTime" className="block text-sm font-medium text-gray-700">
          Check-in Date & Time
        </label>
        <input
          type="datetime-local"
          id="checkInDateTime"
          value={checkInDateTime}
          onChange={(e) => setCheckInDateTime(e.target.value)} // Ensure the datetime is captured correctly
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Check In
        </button>
      </div>
    </form>
  );
}
