"use client";
import { useState, useEffect } from "react";
import { FaPrint } from "react-icons/fa";
import ExportToExcel from "../components/ExportToExcel/ExportToExcel";

// Utility function to format hours and minutes correctly
function formatHoursAndMinutes(totalHours) {
  if (isNaN(totalHours) || totalHours === null || totalHours === undefined) {
    return "0 hours, 0 minutes"; // Return 0 if totalHours is invalid
  }

  const hours = Math.floor(totalHours); // Get the integer part for hours
  const minutes = Math.round((totalHours % 1) * 60); // Get the remainder and convert to minutes
  return `${hours} ساعة, ${minutes} دقيقة`;
}

// Helper function to get year and month as 'YYYY-MM'
function getYearMonth(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; // Pad month with 0 if necessary
}

export default function OvertimePage() {
  const [attendance, setAttendance] = useState([]); // Store attendance data
  const [monthlyOvertime, setMonthlyOvertime] = useState([]); // Store overtime by employee per month
  const [loading, setLoading] = useState(true); // Handle loading state
  const [employees, setEmployees] = useState([]); // Store employee list
  const [selectedEmployee, setSelectedEmployee] = useState(""); // Filter by selected employee
  const [selectedMonth, setSelectedMonth] = useState(""); // Filter by month and year

  useEffect(() => {
    // Fetch attendance data from the API
    const fetchAttendance = async () => {
      try {
        const response = await fetch("/api/attendance");
        const data = await response.json();
        console.log(data);
        setAttendance(data);
        calculateMonthlyOvertime(data); // Process the overtime records after fetching data
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
        setLoading(false);
      }
    };

    // Fetch employee data
    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/employees");
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      }
    };

    fetchAttendance();
    fetchEmployees();
  }, []);

  // Calculate the total overtime hours for each employee per month
  const calculateMonthlyOvertime = (attendanceData) => {
    const overtimeByMonth = {};

    attendanceData.forEach((record) => {
      if (record.overtime_hours && record.overtime_hours > 0) {
        const yearMonth = getYearMonth(record.check_out); // Group by year and month
        const employeeName = record.name;
        const employeeSalary = record.salary; // Assuming salary is included in attendance data

        // Initialize the structure if not already present
        if (!overtimeByMonth[employeeName]) {
          overtimeByMonth[employeeName] = {};
        }
        if (!overtimeByMonth[employeeName][yearMonth]) {
          overtimeByMonth[employeeName][yearMonth] = {
            totalOvertime: 0,
            salary: employeeSalary,
          };
        }

        // Add the overtime hours, ensuring it's a number
        overtimeByMonth[employeeName][yearMonth].totalOvertime +=
          Number(record.overtime_hours) || 0;
      }
    });

    setMonthlyOvertime(overtimeByMonth); // Set the grouped overtime data
  };

  const customizeDataForExport = (data) => {
    const customizedData = [];
    for (const [employee, months] of Object.entries(data)) {
      for (const [month, info] of Object.entries(months)) {
        const { totalOvertime, salary } = info;
        const overtimePayment = totalOvertime * (salary / 30) * 1.25; // Calculate overtime payment based on salary
        customizedData.push({
          "اسم الموظف": employee,
          للشهر: month,
          "عدد الساعات الإضافية": formatHoursAndMinutes(totalOvertime),
          الراتب: salary,
          "المدفوعات الإضافية": overtimePayment.toFixed(2), // Format to 2 decimal places
        });
      }
    }
    return customizedData;
  };

  const customizedData = customizeDataForExport(monthlyOvertime);
  // Handle employee filter change
  const handleEmployeeChange = (e) => {
    setSelectedEmployee(e.target.value);
  };

  // Handle month filter change
  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value); // Selected month will be in 'YYYY-MM' format
  };
  const handlePrint = (e) => {
    e.preventDefault();
    const printContents = document.getElementById("printTable").outerHTML;
    const originalContents = document.body.innerHTML;

    // Replace body content with just the table for printing
    document.body.innerHTML = printContents;

    window.print(); // Trigger the print dialog

    // Restore original contents after printing
    document.body.innerHTML = originalContents;
    window.location.reload(); // Optional: reload the page to ensure state is restored
  };
  // Filter the records based on the selected employee and month
  const filteredOvertime = Object.entries(monthlyOvertime)
    .filter(([employee]) => {
      // Filter by employee
      return selectedEmployee ? employee === selectedEmployee : true;
    })
    .map(([employee, months]) => {
      const filteredMonths = Object.entries(months).filter(([month]) => {
        // Filter by month (in 'YYYY-MM' format)
        return selectedMonth ? month === selectedMonth : true;
      });

      return [employee, Object.fromEntries(filteredMonths)];
    })
    .filter(([, months]) => Object.keys(months).length > 0); // Filter out empty months

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center text-2xl font-semibold mb-4">
        <h2 className="text-2xl font-semibold mb-4">تقرير الساعات الإضافية </h2>
      </div>

      <div className="flex justify-between">
        <div className="flex space-x-4 mb-6">
          {/* Employee Filter */}
          <div>
            <select
              id="employeeFilter"
              value={selectedEmployee}
              onChange={handleEmployeeChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">اختر</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.name}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div>
            <input
              type="month"
              id="monthFilter"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="flex mb-6 gap-2">
          <ExportToExcel
            data={customizedData}
            fileName="تقرير العمل الاضافي "
          />

          <button
            onClick={handlePrint}
            className="bg-blue-500 mt-2 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            <FaPrint className="inline-block " />
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filteredOvertime.length === 0 ? (
        <p>No overtime records found.</p>
      ) : (
        <div id="printTable">
          <div dir="rtl" className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">
                    اسم الموظف
                  </th>
                  <th className="border border-gray-300 px-4 py-2">للشهر</th>
                  <th className="border border-gray-300 px-4 py-2">
                    عدد الساعات الإضافية
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    راتب الموظف
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    المدفوعات الإضافية
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOvertime.map(([employee, months]) => {
                  return Object.entries(months).map(
                    ([month, { totalOvertime, salary }]) => {
                      const overtimePayment =
                        totalOvertime * (Number(salary) / 30) * 1.25; // Calculate overtime payment based on salary

                      return (
                        <tr
                          key={`${employee}-${month}`}
                          className="bg-white hover:bg-gray-50"
                        >
                          <td className="border border-gray-300 px-4 py-2">
                            {employee}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {month}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {formatHoursAndMinutes(totalOvertime)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {Number(salary).toFixed(2) || "N/A"}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {overtimePayment.toFixed(2)}
                          </td>
                        </tr>
                      );
                    }
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
