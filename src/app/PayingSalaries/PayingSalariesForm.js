"use client";
import { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";

export default function PayingSalariesForm({
  selectedFood,
  refetchFood,
  setOpen,
}) {
  const getCurrentMonth = () => {
    const now = new Date();
    return now.toISOString().slice(0, 7); // e.g., "2024-10"
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0]; // e.g., "2024-10-18"
  };

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedDate, setSelectedDate] = useState(getCurrentMonth());
  const [PaidDate, setPaidDate] = useState(getCurrentDate()); // Set default to current date
  const [adjustedRemainingSalary, setAdjustedRemainingSalary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [amountToPay, setAmountToPay] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");


  // Fetch employee data when the component mounts
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/employees");
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setError("Failed to load employees.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Function to calculate adjusted salary based on employee and date
  const calculateSalary = async () => {
    if (selectedEmployee && selectedDate) {
      try {
        const response = await fetch(`/api/salaryAccount?period=${selectedDate}`);
        const data = await response.json();

        if (Array.isArray(data)) {
          const employeeData = data.find(
            (emp) => emp.employee_name === selectedEmployee
          );
          if (employeeData) {
            const vacationCost = calculateVacationCost(
              employeeData.total_vacations,
              employeeData.total_salary
            );
            const nonWorkingHourCost = calculateNonWorkingHourCost(
              employeeData.total_non_working_hours,
              employeeData.total_salary
            );
            const overtimePay = calculateOvertimePay(
              employeeData.total_overtime_hours,
              employeeData.total_salary
            );
            const adjustedSalary = calculateRemainingSalary(
              parseFloat(employeeData.prorated_salary),
              vacationCost,
              nonWorkingHourCost,
              overtimePay,
              employeeData.total_deduction,
              employeeData.total_staff_food,
              employeeData.total_withdrawn
            );
            setAdjustedRemainingSalary(adjustedSalary);
          } else {
            setAdjustedRemainingSalary(null);
          }
        }
      } catch (error) {
        console.error("Error fetching salary data:", error);
        setError("Failed to calculate salary.");
      }
    }
  };

  // Effect to calculate salary when employee or date changes
  useEffect(() => {
    calculateSalary();
  }, [selectedEmployee, selectedDate]); // Call calculateSalary when these values change

  // Helper functions (same as in SalaryAccountTable)
  const formatCurrency = (value) => {
    return parseFloat(value).toFixed(2); // Always returns 2 decimal places
  };

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

  const calculateNonWorkingHourCost = (
    totalNonWorkingHours,
    proratedSalary
  ) => {
    const hourlyRate = proratedSalary / (10 * 30); // Assuming 10 hours per day for 30 days
    return parseFloat((totalNonWorkingHours * hourlyRate).toFixed(2)); // Cost of non-working hours
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
  
    if (amountToPay < adjustedRemainingSalary) {
      try {
        const response = await fetch('/api/PayingSalaries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amountToPay,
            date: PaidDate,
            note: note,
            adjustedRemainingSalary: adjustedRemainingSalary,
            employeeId: selectedEmployeeId,
            finallRemining: adjustedRemainingSalary - amountToPay
          }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
        } else {
          refetchFood(); // Call the refetch function
          setOpen(false); // Close the form
          setMessage(" ")
        }
      } catch (error) {
        console.error("Error processing payment:", error);
      }
    } else {

        setMessage("المبلغ المدفوع أكبر من الراتب المتبقي");
        return ;
    }
  };
  
  
  
  const calculateRemainingSalary = (
    proratedSalary,
    vacationCost,
    nonWorkingHourCost,
    overtimePay,
    totalDeduction,
    totalStaffFood,
    totalWithdrawn
  ) => {
    let adjustedRemainingSalary =
      proratedSalary -
      vacationCost -
      nonWorkingHourCost +
      overtimePay -
      totalDeduction -
      totalStaffFood -
      totalWithdrawn;
    return adjustedRemainingSalary < 0
      ? adjustedRemainingSalary.toFixed(2)
      : adjustedRemainingSalary.toFixed(2); // If negative, set to 0
  };

  if (loading) {
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
      <form className="mb-4">
        <div className="flex justify-between mb-4">
          <select
            value={selectedEmployee}
            onChange={(e) => {
              const employeeId = e.target.options[e.target.selectedIndex].getAttribute("data-id");
              setSelectedEmployee(e.target.value);
              setSelectedEmployeeId(employeeId); // Update selected employee ID
            }}
            className="border border-gray-300 rounded-md p-2"
            required
          >
            <option value="">اخر الموظف</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.name} data-id={employee.id}> {/* Added data-id attribute */}
                {employee.name}
              </option>
            ))}
          </select>
          <input
            type="month"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-md p-2"
          />
        </div>
      </form>

      {adjustedRemainingSalary !== null ? (
        <>
          <form className="mt-4" onSubmit={handlePaymentSubmit}>
            <div className="mb-4">
              <label className="font-bold">اسم الموظف:</label>
              <input
                type="text"
                value={selectedEmployee}
                disabled
                className="border border-gray-300 rounded-md p-2 w-full"
              />
              <input
                type="number"
                value={selectedEmployeeId}
                disabled

                className="border border-gray-300 rounded-md p-2 w-full hidden"
              />
            </div>
            <div className="mb-4">
              <label className="font-bold">صافي راتب الموظف:</label>
              <input
                type="text"
                value={`${formatCurrency(adjustedRemainingSalary)} JOD`}
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
                type="number"
                value={amountToPay}
                onChange={(e) => setAmountToPay(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full"
                required
              />
            </div>
            {message && <div className="text-red-500 text-sm">{message}</div>}



            <div className="mb-4">
              <label className="font-bold">ملاحظات:</label>
              <textarea
                className="border border-gray-300 rounded-md p-2 w-full"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Pay Salary
            </button>
          </form>
        </>
      ) : (
        <div>لا يوجد راتب للموظف في هذا الشهر </div>
      )}
    </div>
  );
}
