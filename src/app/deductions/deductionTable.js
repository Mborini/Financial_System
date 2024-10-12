import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { startOfMonth, endOfMonth } from "date-fns";

export default function DeductionTable({
  deductionsUpdated,
  refetchDeductions,
  setSelectedDeduction,
  setOpen,
}) {
  const [deductions, setDeductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deductionsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState([
    startOfMonth(new Date()),
    endOfMonth(new Date()),
  ]);
  const [startDate, endDate] = dateRange;

  useEffect(() => {
    const fetchDeductions = async () => {
      try {
        const response = await fetch("/api/deductions");
        const data = await response.json();
        console.log("Fetched Deductions Data:", data);
        setDeductions(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchDeductions();
  }, [deductionsUpdated]);

  const handleDelete = async (deduction) => {
    console.log("Attempting to delete deduction with:", {
      id: deduction.id,
      employee_id: deduction.employee_id,
      amount: deduction.amount,
    });

    try {
      const response = await fetch(`/api/deductions`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: deduction.id,
          employee_id: deduction.employee_id,
          amount: deduction.amount,
        }),
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

  // Filter deductions based on date range
  const filteredDeductions = deductions.filter((deduction) => {
    const deductionDate = new Date(deduction.date);
    return deductionDate >= startDate && deductionDate <= endDate;
  });

  // Pagination logic
  const indexOfLastDeduction = currentPage * deductionsPerPage;
  const indexOfFirstDeduction = indexOfLastDeduction - deductionsPerPage;
  const currentDeductions = filteredDeductions.slice(
    indexOfFirstDeduction,
    indexOfLastDeduction
  );

  const totalPages = Math.ceil(filteredDeductions.length / deductionsPerPage);

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

  if (loading) return <div className="text-center text-blue-600">Loading...</div>;
  if (error) return <div className="text-center text-red-600">Error: {error}</div>;
  if (deductions.length === 0) return <div>No deductions found.</div>;

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-center my-4">
        <DatePicker
          selected={startDate}
          onChange={(update) => {
            if (Array.isArray(update)) {
              setDateRange(update);
            }
          }}
          startDate={startDate}
          endDate={endDate}
          selectsRange
          isClearable
          placeholderText="Select a date range"
          className="border border-gray-300 p-2 rounded"
        />
      </div>
      <div className="overflow-x-auto">
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
                  <button
                    className="bg-orange-500 hover:bg-orange-600 ml-2 text-white font-bold py-1 px-2 rounded"
                    onClick={() => {
                      setSelectedDeduction(deduction);
                      setOpen(true);
                    }}
                  >
                    تعديل
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2"
                    onClick={() => handleDelete(deduction)}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      <div className="flex justify-center my-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`px-4 py-2 mx-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50`}
        >
          Prev
        </button>

        {/* Page Number Buttons */}
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
          className={`px-4 py-2 mx-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
