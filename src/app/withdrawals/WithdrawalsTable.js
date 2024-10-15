import React, { useEffect, useState } from "react";
import EditDrawer from "../components/Drawers/edit";
import Editwithdrawals from "./Editwithdrawals";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { startOfMonth, endOfMonth } from "date-fns";
import { FaEdit, FaPrint, FaTrash } from "react-icons/fa";
import ConfirmModal from "../components/Modals/confirmDelete";

function WithdrawalsTable({ costsTypesUpdated, refetchCostsTypes }) {
  const [withdrawals, setWithdrawals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [withdrawalsPerPage] = useState(10);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [open, setOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null); // Track the record to delete

  // Date range state with the default to the current month
  const [dateRange, setDateRange] = useState([
    startOfMonth(new Date()), // Start of the current month
    endOfMonth(new Date()), // End of the current month
  ]);
  const [startDate, endDate] = dateRange;

  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);

  // Fetch data when component mounts or costsTypesUpdated changes
  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const response = await fetch("/api/withdrawals");
        const data = await response.json();

        if (Array.isArray(data)) {
          setWithdrawals(data);
        } else {
          console.error("Expected an array but got:", data);
          setWithdrawals([]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching withdrawal data:", error);
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

    fetchWithdrawals();
    fetchEmployees();
  }, [costsTypesUpdated]);

  // Handle opening the drawer and setting the selected withdrawal
  const handleEditClick = (withdrawal) => {
    setSelectedWithdrawal(withdrawal); // Set the selected withdrawal for editing
    setOpen(true); // Open the drawer
  };

  const confirmDelete = (record) => {
    setRecordToDelete(record);
    setIsModalOpen(true);
  };

  const handleDeleteConfirmed = () => {
    if (recordToDelete && recordToDelete.id) {
      handleDelete(recordToDelete.id);
      setIsModalOpen(false);
    }
  };

  // Handle deletion of a withdrawal
  const handleDelete = async (withdrawal) => {
    try {
      const response = await fetch("/api/withdrawals", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: withdrawal.id,
          employee_id: withdrawal.employee_id,
          amount: withdrawal.amount,
        }),
      });

      if (response.ok) {
        console.log("Deleted successfully");
        refetchCostsTypes(); // Refetch the table after deletion
      } else {
        console.error("Error deleting withdrawal");
      }
    } catch (error) {
      console.error("Error deleting withdrawal:", error);
    }
  };

  // Filter withdrawals by the selected date range and employee name
  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    const withdrawalDate = new Date(withdrawal.date);
    const dateMatches =
      !startDate ||
      !endDate ||
      (withdrawalDate >= startDate && withdrawalDate <= endDate);
    const employeeMatches =
      selectedEmployee === "" || withdrawal.employee_name === selectedEmployee;
    return dateMatches && employeeMatches;
  });

  // Calculate the current records for the current page
  const indexOfLastWithdrawal = currentPage * withdrawalsPerPage;
  const indexOfFirstWithdrawal = indexOfLastWithdrawal - withdrawalsPerPage;
  const currentWithdrawals = isPrinting
    ? filteredWithdrawals // Print all filtered data
    : filteredWithdrawals.slice(indexOfFirstWithdrawal, indexOfLastWithdrawal);

  // Get total pages
  const totalPages = Math.ceil(filteredWithdrawals.length / withdrawalsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle print
  const handlePrint = (e) => {
    e.preventDefault();
    setIsPrinting(true); // Disable pagination for printing
    setTimeout(() => {
      window.print();
      setIsPrinting(false); // Restore pagination after printing
    }, 500);
  };



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
      {/* Date Range and Employee Name Filter */}
      <div className="lg:flex justify-between items-center my-4">
        {/* Left Section: Date Picker and Employee Filter */}
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 items-start lg:items-center w-full">
          <DatePicker
            selected={startDate}
            onChange={(update) => setDateRange(update)}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            isClearable
            placeholderText="Select a date range"
            className="border border-gray-300 p-2 rounded w-full lg:w-auto"
          />
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="border border-gray-300 p-2 rounded w-50 lg:w-auto"
          >
            <option value="">All Employees</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.name}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>

        {/* Right Section: Print Button */}
        <button
          onClick={handlePrint}
          className="mt-4 flex lg:mt-0 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          <FaPrint className="inline-block mr-2 felx text-center" />
        </button>
      </div>
<div className="overflow-x-auto">
      <table  
        dir="rtl"
        className="min-w-full table-auto border-collapse border border-gray-200"
      >
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
              <td className="border  border-gray-300 px-4 py-2 text-center">
                {withdrawal.employee_name}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {withdrawal.amount}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {new Date(withdrawal.date).toLocaleDateString()}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <div className="flex justify-center">
                <button
                  className="   text-orange-500 font-bold py-1 px-2 rounded"
                  onClick={() => handleEditClick(withdrawal)}
                >
                  <FaEdit />{" "}
                </button>
                <button
                  className="  text-red-500 font-bold py-1 px-2 rounded ml-2"
                  onClick={() => confirmDelete(withdrawal)}
                >
                  <FaTrash />{" "}
                </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
</div>
      {/* Pagination */}
      {!isPrinting && (
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
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 mx-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDeleteConfirmed}
        title="تأكيد الحذف"
        message={`هل تريد بالتأكيد حذف قيمة السحب بقيمة : ${recordToDelete?.amount} للموظف : ${recordToDelete?.employee_name}؟`}
      />

      {/* Edit Drawer */}
      <EditDrawer title="تعديل سحوبات من الراتب" open={open} setOpen={setOpen}>
        <Editwithdrawals
          selectedCost={selectedWithdrawal}
          refetchCosts={refetchCostsTypes}
          setOpen={setOpen}
        />
      </EditDrawer>
    </div>
  );
}

export default WithdrawalsTable;
