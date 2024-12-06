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
  return `${hours} ساعة ${minutes} دقيقة`;
};

// Function to calculate overtime pay
const calculateOvertimePay = (totalOvertimeHours, proratedSalary) => {
  const dailyWorkingHours = 10;
  const workingDaysPerMonth = 30; // Assuming 30 working days per month
  const totalWorkingHoursPerMonth = dailyWorkingHours * workingDaysPerMonth; // 240 hours per month
  const hourlyRate = proratedSalary / totalWorkingHoursPerMonth;

  // Overtime is paid at 1.25 times the regular hourly rate
  const overtimeRate = 1.25;
  const overtimePay = totalOvertimeHours * hourlyRate * overtimeRate;

  return parseFloat(overtimePay.toFixed(2)); // Return as a float with 2 decimal places
};

// Function to calculate excess vacations
const calculateNotAllowedVacations = (totalVacations) => {
  const maxAllowedVacations = 4;
  const excessVacations = totalVacations - maxAllowedVacations;

  if (excessVacations <= 0) {
    return 0;
  }

  return excessVacations;
};

// Function to calculate the cost of excess vacations
const calculateVacationCost = (totalVacations, proratedSalary) => {
  const maxAllowedVacations = 4;
  const workingDaysPerMonth = 30; // Assuming 30 working days in a month
  const dailySalary = proratedSalary / workingDaysPerMonth; // Calculate daily salary

  const excessVacations = totalVacations - maxAllowedVacations;

  if (excessVacations <= 0) {
    return 0;
  }

  return parseFloat((excessVacations * dailySalary).toFixed(2)); // Return as float with 2 decimal places
};

// Function to calculate the cost of non-working hours
const calculateNonWorkingHourCost = (totalNonWorkingHours, proratedSalary) => {
  const hourlyRate = proratedSalary / (10 * 30); // Assuming 10 hours per day for 30 days
  return parseFloat((totalNonWorkingHours * hourlyRate).toFixed(2)); // Cost of non-working hours
};

// Function to calculate remaining salary after subtracting vacation cost and adding overtime pay
const calculateRemainingSalary = (proratedSalary, vacationCost, nonWorkingHourCost, overtimePay , totalDeduction , totalStaffFood , totalWithdrawn) => {
  let adjustedRemainingSalary = proratedSalary - vacationCost - nonWorkingHourCost + overtimePay - totalDeduction - totalStaffFood - totalWithdrawn;
  return adjustedRemainingSalary < 0 ? adjustedRemainingSalary.toFixed(2) : adjustedRemainingSalary.toFixed(2); // If negative, set to 0
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
  const formatCurrency = (value) => {
    return parseFloat(value).toFixed(2); // Always returns 2 decimal places
  };
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
    <div className="container mx-auto mb-8 px-4">
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
      <div id="printTable" className='overflow-x-auto'>
        <table dir='rtl' className="min-w-full table-auto border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-1 py-1">اسم الموضف</th>
              <th className="border border-gray-300 px-1 py-1">الراتب الشهري </th>
              <th className="border border-gray-300 px-1 py-1">عدد ايام العمل</th>
              <th className="border border-gray-300 px-1 py-1">مجموع ساعات العمل الاضافية</th>
              <th className="border border-gray-300 px-1 py-1">مجموع ايام الاجازات</th>
              <th className="border border-gray-300 px-1 py-1">ايام الاجازات الزائدة</th>
              <th className="border border-gray-300 px-1 py-1">مكافأة العمل الاضافي </th>
              <th className="border border-gray-300 px-1 py-1">مجموع السحب </th>
              <th className="border border-gray-300 px-1 py-1">مجموع حساب وجبات الاكل </th>
              <th className="border border-gray-300 px-1 py-1">مجموع الخصومات </th>
              <th className="border border-gray-300 px-1 py-1">خصم الاجازات الزائدة </th>
              <th className="border border-gray-300 px-1 py-1">خصم الساعات غير العامل بها </th>
              <th className="border border-gray-300 px-1 py-1">الراتب المتبقي </th>
            </tr>
          </thead>
          <tbody>
            {costsTypes.map((costType) => {
              const overtimePay = calculateOvertimePay(costType.total_overtime_hours, costType.total_salary);
              const vacationCost = calculateVacationCost(costType.total_vacations, costType.total_salary);
              const nonWorkingHourCost = calculateNonWorkingHourCost(costType.total_non_working_hours, costType.total_salary);
              const adjustedRemainingSalary = calculateRemainingSalary(
                parseFloat(costType.prorated_salary),
                vacationCost,
                nonWorkingHourCost,
                overtimePay,
                costType.total_deduction ,// Adding total deduction here
                costType.total_staff_food,
                costType.total_withdrawn

              );

              return (
                <tr key={costType.employee_name} className="bg-white hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 text-center">{costType.employee_name}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{formatCurrency(costType.prorated_salary)} JOD</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{costType.total_working_days} يوم</td>
                  <td  className="border border-gray-300 px-4 py-2 text-center">{formatOvertimeHours(costType.total_overtime_hours)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{costType.total_vacations} يوم</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{calculateNotAllowedVacations(costType.total_vacations)} يوم</td>
                  <td className="border border-gray-700 bg-green-200 px-4 py-2 text-center">JOD {overtimePay}</td>
                  <td className="border border-gray-700 bg-red-200 px-4 py-2 text-center">JOD -{costType.total_withdrawn}</td>
                  <td className="border border-gray-700 bg-red-200 px-4 py-2 text-center">JOD -{costType.total_staff_food}</td>
                  <td className="border border-gray-700 bg-red-200 px-4 py-2 text-center">JOD -{costType.total_deduction}</td>
                  <td className="border border-gray-700 bg-red-200 px-4 py-2 text-center">JOD -{vacationCost}</td>
                  <td className="border border-gray-700 bg-red-200 px-4 py-2 text-center">JOD -{nonWorkingHourCost}</td>
                  <td className="border border-gray-700 bg-orange-200 px-4 py-2 text-center">JOD {adjustedRemainingSalary}</td>
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
