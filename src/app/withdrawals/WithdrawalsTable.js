import React, { useEffect, useState } from 'react';
import EditDrawer from '../components/Drawers/edit';
import Editwithdrawals from './Editwithdrawals';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { startOfMonth, endOfMonth } from 'date-fns';

function WithdrawalsTable({ costsTypesUpdated, refetchCostsTypes }) {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [withdrawalsPerPage] = useState(10);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [open, setOpen] = useState(false);

  // Date range state with the default to the current month
  const [dateRange, setDateRange] = useState([
    startOfMonth(new Date()), // Start of the current month
    endOfMonth(new Date()),   // End of the current month
  ]);
  const [startDate, endDate] = dateRange;

  // Fetch data when component mounts or costsTypesUpdated changes
  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const response = await fetch('/api/withdrawals');
        const data = await response.json();

        if (Array.isArray(data)) {
          setWithdrawals(data);
        } else {
          console.error('Expected an array but got:', data);
          setWithdrawals([]);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching withdrawal data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchWithdrawals();
  }, [costsTypesUpdated]);

  // Handle opening the drawer and setting the selected withdrawal
  const handleEditClick = (withdrawal) => {
    setSelectedWithdrawal(withdrawal); // Set the selected withdrawal for editing
    setOpen(true); // Open the drawer
  };

  // Handle deletion of a withdrawal
  const handleDelete = async (withdrawal) => {
    console.log('Withdrawal object in handleDelete:', withdrawal);

    try {
      const response = await fetch('/api/withdrawals', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: withdrawal.id,
          employee_id: withdrawal.employee_id,
          amount: withdrawal.amount,
        }),
      });

      if (response.ok) {
        console.log('Deleted successfully');
        refetchCostsTypes(); // Refetch the table after deletion
      } else {
        console.error('Error deleting withdrawal');
      }
    } catch (error) {
      console.error('Error deleting withdrawal:', error);
    }
  };

  // Filter withdrawals by the selected date range
  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    if (!startDate || !endDate) return true;
    const withdrawalDate = new Date(withdrawal.date);
    return withdrawalDate >= startDate && withdrawalDate <= endDate;
  });

  // Calculate the current records for the current page
  const indexOfLastWithdrawal = currentPage * withdrawalsPerPage;
  const indexOfFirstWithdrawal = indexOfLastWithdrawal - withdrawalsPerPage;
  const currentWithdrawals = filteredWithdrawals.slice(indexOfFirstWithdrawal, indexOfLastWithdrawal);

  // Get total pages
  const totalPages = Math.ceil(filteredWithdrawals.length / withdrawalsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <div className="text-center text-blue-600">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600">Error: {error}</div>;
  }

  if (withdrawals.length === 0 && !loading) {
    return <div className="text-center">No withdrawals found.</div>;
  }

  return (
    <div className="container mx-auto px-4">
      {/* Date Range Filter */}
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

      <table dir='rtl' className="min-w-full table-auto border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">اسم الموظف</th>
            <th className="border border-gray-300 px-4 py-2">القيمة</th>
            <th className="border border-gray-300 px-4 py-2">التاريخ</th>
            <th className="border border-gray-300 px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {currentWithdrawals.map((withdrawal) => (
            <tr key={withdrawal.id} className="bg-white hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2 text-center">{withdrawal.employee_name}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">{withdrawal.amount}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">{new Date(withdrawal.date).toLocaleDateString()}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <button
                  className="bg-orange-500 hover:bg-orange-600 ml-2 text-white font-bold py-1 px-2 rounded"
                  onClick={() => handleEditClick(withdrawal)}
                >
                  تعديل
                </button>
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2"
                  onClick={() => handleDelete(withdrawal)}
                >
                  حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-center my-4">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 mx-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => paginate(i + 1)}
            className={`px-4 py-2 mx-1 rounded ${i + 1 === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-300 hover:bg-gray-400'}`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 mx-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Uncomment and edit the drawer for editing functionality */}
      <EditDrawer title="تعديل سحوبات من الراتب" open={open} setOpen={setOpen}>
        <Editwithdrawals selectedCost={selectedWithdrawal} refetchCosts={refetchCostsTypes} setOpen={setOpen} />
      </EditDrawer>
    </div>
  );
}

export default WithdrawalsTable;
