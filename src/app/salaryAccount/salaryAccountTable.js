import React, { useEffect, useState } from 'react';
import { FaPrint } from 'react-icons/fa';

// Function to get the current month in 'YYYY-MM' format
const getCurrentMonth = () => {
  const now = new Date();
  return now.toISOString().slice(0, 7); // e.g., "2024-10"
};

// Helper function to format overtime hours from decimal to "X hours Y minutes"
const formatOvertimeHours = (decimalHours) => {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours} hours ${minutes} minutes`;
};

// Function to calculate overtime pay
const calculateOvertimePay = (totalOvertimeHours, totalSalary) => {
  const dailyWorkingHours = 8;
  const workingDaysPerMonth = 30; // Assuming 30 working days per month
  const totalWorkingHoursPerMonth = dailyWorkingHours * workingDaysPerMonth; // 240 hours per month
  const hourlyRate = totalSalary / totalWorkingHoursPerMonth;

  // Overtime is paid at 1.25 times the regular hourly rate
  const overtimeRate = 1.25;
  const overtimePay = totalOvertimeHours * hourlyRate * overtimeRate;

  return parseFloat(overtimePay.toFixed(2)); // Return as a float with 2 decimal places
};

// Function to calculate the not allowed vacations
const calculateNotAllowedVacations = (totalVacations) => {
  const maxAllowedVacations = 4;
  const excessVacations = totalVacations - maxAllowedVacations;

  // If there are no excess vacations, return 0
  if (excessVacations <= 0) {
    return 0;
  }

  return excessVacations;
};

// Function to calculate the cost of excess vacations
const calculateVacationCost = (totalVacations, totalSalary) => {
  const maxAllowedVacations = 4;
  const workingDaysPerMonth = 30; // Assuming 30 working days in a month
  const dailySalary = totalSalary / workingDaysPerMonth; // Calculate daily salary

  const excessVacations = totalVacations - maxAllowedVacations;

  // If there are no excess vacations, return 0
  if (excessVacations <= 0) {
    return 0;
  }

  // Otherwise, return the cost of the excess vacations
  return parseFloat((excessVacations * dailySalary).toFixed(2)); // Return as float with 2 decimal places
};

// Function to calculate remaining salary after subtracting vacation cost and adding overtime pay
const calculateRemainingSalary = (remainingSalary, vacationCost, overtimePay) => {
  let adjustedRemainingSalary = remainingSalary - vacationCost + overtimePay;
  return adjustedRemainingSalary < 0 ? 0 : adjustedRemainingSalary.toFixed(2); // If negative, set to 0
};

function SalaryAccountTable({ costsTypesUpdated, refetchCostsTypes }) {
  const [costsTypes, setCostsTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPeriod, setFilterPeriod] = useState(getCurrentMonth()); // Initialize filter with current month

  useEffect(() => {
    const fetchCostsTypes = async () => {
      try {
        const response = await fetch(`/api/salaryAccount?period=${filterPeriod}`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setCostsTypes(data); // Update state if it's an array
        } else {
          console.error('Expected an array but got:', data);
          setCostsTypes([]); // Set an empty array if the response is not as expected
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching salary account data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchCostsTypes();
  }, [costsTypesUpdated, filterPeriod]); // Refetch when period changes

  const handlePeriodChange = (e) => {
    setFilterPeriod(e.target.value); // Update the period based on user input
  };

  if (loading) {
    return <div className="text-center text-blue-600">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600">Error: {error}</div>;
  }
  const handlePrint = () => {
    const printContents = document.getElementById('printTable').outerHTML;
    const originalContents = document.body.innerHTML;

    // Replace body content with just the table for printing
    document.body.innerHTML = printContents;

    window.print(); // Trigger the print dialog

    // Restore original contents after printing
    document.body.innerHTML = originalContents;
    window.location.reload(); // Optional: reload the page to ensure state is restored
  };
  return (
    <div className="container mx-auto px-4">
      <div className="mb-4  flex justify-between">
      
        <input
          type="month"
          id="periodFilter"
          value={filterPeriod}
          onChange={handlePeriodChange}
          className="mt-1 block w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
         <button
          onClick={handlePrint}
          className="bg-blue-500 mt-2 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          <FaPrint className="inline-block " />
        </button>
      </div>
      <div id="printTable">

      <table className="min-w-full table-auto border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-1 py-1">Employee Name</th>
            <th className="border border-gray-300 px-1 py-1">Total Overtime Hours</th>
            <th className="border border-gray-300 px-1 py-1">Total Vacations</th>
            <th className="border border-gray-300 px-1 py-1">Not Allowed Vacations</th> {/* New column for not allowed vacations */}
            <th className="border border-gray-300 px-1 py-1">Salary</th>
            <th className="border border-gray-300 px-1 py-1">Overtime Pay</th>
            <th className="border border-gray-300 px-1 py-1">Total Withdrawn</th>
            <th className="border border-gray-300 px-1 py-1">Total Staff Food</th>
            <th className="border border-gray-300 px-1 py-1">Vacation Cost</th> {/* New column for vacation cost */}
            <th className="border border-gray-300 px-1 py-1">Remaining Salary</th> {/* New column for adjusted remaining salary */}
          </tr>
        </thead>
        <tbody>
          {costsTypes.map((costType) => {
            const overtimePay = calculateOvertimePay(costType.total_overtime_hours, costType.total_salary);
            const vacationCost = calculateVacationCost(costType.total_vacations, costType.total_salary);
            const adjustedRemainingSalary = calculateRemainingSalary(parseFloat(costType.remaining_salary), vacationCost, overtimePay);
            
            return (
              <tr key={costType.employee_name} className="bg-white hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 text-center">{costType.employee_name}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {formatOvertimeHours(costType.total_overtime_hours)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">{costType.total_vacations}</td>
                <td className="border border-gray-300  px-4 py-2 text-center">
                  {calculateNotAllowedVacations(costType.total_vacations)}
                </td> {/* Display calculated not allowed vacations */}
                <td className="border border-gray-700 bg-blue-300 px-4 py-2 text-center">JOD {costType.total_salary}</td>
                <td className="border border-gray-700  bg-green-200 px-4 py-2 text-center">
                JOD +{overtimePay}
                </td>
                <td className="border border-gray-700 px-4 bg-red-200 py-2 text-center">JOD -{costType.total_withdrawn}</td>
                <td className="border border-gray-700 px-4 bg-red-200 py-2 text-center">JOD -{costType.total_staff_food}</td>
                <td className="border border-gray-700 px-4 bg-red-200 py-2 text-center">
                JOD -{vacationCost}
                </td> {/* Display calculated vacation cost */}
                <td className="border border-gray-700 px-4 py-2 bg-orange-200 text-center">
                 JOD {adjustedRemainingSalary}
                </td> {/* Display adjusted remaining salary after subtracting vacation cost and adding overtime pay */}
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export default SalaryAccountTable;
