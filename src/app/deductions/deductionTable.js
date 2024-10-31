import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { startOfMonth, endOfMonth } from "date-fns";
import { FaEdit, FaPrint, FaTrash } from "react-icons/fa";
import ConfirmModal from "../components/Modals/confirmDelete";
import ExportToExcel from "../components/ExportToExcel/ExportToExcel";

export default function DeductionTable({
  deductionsUpdated,
  refetchDeductions,
  setSelectedDeduction,
  setOpen,
}) {
  const [deductions, setDeductions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deductionsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null); // Track the record to delete
  // Initialize dateRange with the start and end of the current month
  const [dateRange, setDateRange] = useState([
    startOfMonth(new Date()),
    endOfMonth(new Date()),
  ]);
  const [startDate, endDate] = dateRange;

  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const fetchDeductions = async () => {
      try {
        const response = await fetch("/api/deductions");
        const data = await response.json();
        setDeductions(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/employees");
        const data = await response.json();
        setEmployees(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchDeductions();
    fetchEmployees();
  }, [deductionsUpdated]);
  const confirmDelete = (record) => {
    setRecordToDelete(record);
    setIsModalOpen(true);
  };
// Updated handleDeleteConfirmed function
const handleDeleteConfirmed = () => {
  if (recordToDelete) {
    handleDelete(recordToDelete); // Pass the entire record
    setIsModalOpen(false);
  }
};

// Updated handleDelete function
const handleDelete = async (deduction) => {
  try {
    const { id, employee_id, amount } = deduction; // Destructure required fields from the deduction object
    const response = await fetch(`/api/deductions`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, employee_id, amount }), // Send the required data
    });

    if (response.ok) {
      refetchDeductions();
    } else {
      const errorData = await response.json();
      console.error("Failed to delete deduction:", errorData.error);
    }
  } catch (error) {
    console.error("Error deleting deduction:", error);
  }
};

  // Filter deductions based on date range and employee name
  const filteredDeductions = deductions.filter((deduction) => {
    const deductionDate = new Date(deduction.date);
    const dateMatches =
      !startDate ||
      !endDate ||
      (deductionDate >= startDate && deductionDate <= endDate);
    const employeeMatches =
      selectedEmployee === "" || deduction.employee_name === selectedEmployee;
    return dateMatches && employeeMatches;
  });
  const totalAmount = filteredDeductions
    .reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0)
    .toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    });
  // Pagination logic
  const indexOfLastDeduction = currentPage * deductionsPerPage;
  const indexOfFirstDeduction = indexOfLastDeduction - deductionsPerPage;
  const currentDeductions = isPrinting
    ? filteredDeductions
    : filteredDeductions.slice(indexOfFirstDeduction, indexOfLastDeduction);

  const totalPages = Math.ceil(filteredDeductions.length / deductionsPerPage);
  const customizeDataForExport = (data) => {
    return data.map((deduction) => ({
      EmployeeName: deduction.employee_name,
      DeductionAmount: deduction.amount,
      DeductionType: deduction.deduction_type,
      Date: new Date(deduction.date).toLocaleDateString(), // Format date as needed
    }));
  };

  const customizedDeductions = customizeDataForExport(currentDeductions);
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrint = (e) => {
    e.preventDefault();
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  if (loading)
    return <div className="text-center text-blue-600">Loading...</div>;
  if (error)
    return <div className="text-center text-red-600">Error: {error}</div>;
  if (deductions.length === 0) return <div>No deductions found.</div>;

  return (
    <div className="container mx-auto px-4">
      <div className="mb-4 flex flex-col md:flex-row justify-between md:items-center">
        <div className="flex flex-col md:flex-row space-x-0 md:space-x-4 mb-4 md:mb-0 w-full">
          <div className="mb-4 md:mb-0 w-full md:w-auto">
            <DatePicker
              selected={startDate}
              onChange={(update) => {
                setDateRange(update);
              }}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              isClearable
              placeholderText="Select a date range"
              className="border border-gray-300 p-2 rounded"
            />
          </div>
          <div className=" md:mb-0 w-full md:w-auto">
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="border border-gray-300  p-2 rounded"
            >
              <option value="">All Employees</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.name}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-start md:justify-start gap-2 md:mt-0">
        <ExportToExcel data={customizedDeductions} fileName="خصومات الرواتب" />
          <button
            onClick={handlePrint}
            className="bg-blue-500  hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            <FaPrint className="inline-block mr-2" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <label
          htmlFor="
        "
        >
          ملخص التصفية
        </label>
        <table
          dir="rtl"
          className="min-w-full table-auto border-collapse border mb-4 mt-1 border-gray-200"
        >
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">
                مجموع الخصومات{" "}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white hover:bg-gray-50">
              <td className="border  border-gray-300 px-4 py-2 text-center">
                {totalAmount}
              </td>
            </tr>
          </tbody>
        </table>
        <table
          dir="rtl"
          className="min-w-full table-auto border-collapse border border-gray-200"
        >
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 py-2">اسم الموظف</th>
              <th className="border border-gray-300 py-2">قيمة الخصم</th>
              <th className="border border-gray-300 py-2">نوع الخصم</th>
              <th className="border border-gray-300 py-2">التاريخ</th>
              <th className="border border-gray-300 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {currentDeductions.map((deduction) => (
              <tr key={deduction.id} className="bg-white hover:bg-gray-50">
                <td className="border border-gray-300 py-2 text-center">
                  {deduction.employee_name}
                </td>
                <td className="border border-gray-300 py-2 text-center">
                  {deduction.amount}
                </td>
                <td className="border border-gray-300 py-2 text-center">
                  {deduction.deduction_type}
                </td>
                <td className="border border-gray-300 py-2 text-center">
                  {new Date(deduction.date).toLocaleDateString()}
                </td>
                <td className="border border-gray-300 py-2 text-center">
                  <div className="flex justify-center">
                    <button
                      className=" text-orange-500 font-bold py-1 px1- rounded "
                      onClick={() => {
                        setSelectedDeduction(deduction);
                        setOpen(true);
                      }}
                    >
                      <FaEdit />{" "}
                    </button>
                    <button
                      className=" text-red-500 font-bold py-1 px-1 rounded "
                      onClick={() => confirmDelete(deduction)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <ConfirmModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleDeleteConfirmed}
          title="تأكيد الحذف"
          message={`هل أنت متأكد من ازالة الخصم من راتب ${recordToDelete?.employee_name} و بمقدار ${recordToDelete?.amount} ؟`}
        />
      </div>

      {/* Pagination Controls */}
      {!isPrinting && (
        <div className="flex justify-center my-4">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 mx-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 mx-1 rounded ${
                i + 1 === currentPage
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 mx-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
