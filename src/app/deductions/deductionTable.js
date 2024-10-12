import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { startOfMonth, endOfMonth } from 'date-fns';

export default function DeductionTable({ deductionsUpdated, refetchDeductions, setSelectedDeduction, setOpen }) {
  const [deductions, setDeductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deductionsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState([startOfMonth(new Date()), endOfMonth(new Date())]);
  const [startDate, endDate] = dateRange;

  useEffect(() => {
    const fetchDeductions = async () => {
      try {
        const response = await fetch('/api/deductions');
        const data = await response.json();
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
    try {
      const response = await fetch(`/api/deductions`, {
        method: 'DELETE',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deduction.id })
      });
      if (response.ok) {
        refetchDeductions();
      } else {
        console.error("Failed to delete deduction");
      }
    } catch (error) {
      console.error("Error deleting deduction:", error);
    }
  };

  const filteredDeductions = deductions.filter((deduction) => {
    const deductionDate = new Date(deduction.date);
    return deductionDate >= startDate && deductionDate <= endDate;
  });

  const indexOfLastDeduction = currentPage * deductionsPerPage;
  const indexOfFirstDeduction = indexOfLastDeduction - deductionsPerPage;
  const currentDeductions = filteredDeductions.slice(indexOfFirstDeduction, indexOfLastDeduction);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (deductions.length === 0) return <div>No deductions found.</div>;

  return (
    <div className="container mx-auto ">
      <div className="flex justify-center my-4">
        <DatePicker
          selected={startDate}
          onChange={(update) => setDateRange(update)}
          startDate={startDate}
          endDate={endDate}
          selectsRange
          isClearable
          placeholderText="Select a date range"
          className="border border-gray-300 p-2 rounded"
        />
      </div>
      <div className="overflow-x-auto">
        <table dir='rtl' className="min-w-full table-auto border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300  py-2">اسم الموضف</th>
              <th className="border border-gray-300  py-2">قيمة الخصم</th>
              <th className="border border-gray-300  py-2">نع الخصم</th>
              <th className="border border-gray-300  py-2">التاريخ</th>
              <th className="border border-gray-300  py-2"></th>
            </tr>
          </thead>
          <tbody>
            {currentDeductions.map((deduction) => (
              <tr key={deduction.id} className="bg-white hover:bg-gray-50">
                <td className="border border-gray-300  py-2 text-center">{deduction.employee_name}</td>
                <td className="border border-gray-300  py-2 text-center">{deduction.amount}</td>
                <td className="border border-gray-300  py-2 text-center">{deduction.deduction_type}</td>
                <td className="border border-gray-300  py-2 text-center">{new Date(deduction.date).toLocaleDateString()}</td>
                <td className="border border-gray-300  py-2 text-center">
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
    </div>
  );
}
