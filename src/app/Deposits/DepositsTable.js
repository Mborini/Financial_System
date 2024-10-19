import React, { useState, useEffect } from "react";
import EditDrawer from "../components/Drawers/edit";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { startOfMonth, endOfMonth } from "date-fns";
import { FaEdit, FaPrint, FaTrashAlt } from "react-icons/fa";
import ConfirmModal from "../components/Modals/confirmDelete";
import DepositForm from "./Depositform";

export default function DepositsTable({ depositsUpdated, refetchDeposits }) {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [depositsPerPage] = useState(10);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [open, setOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [dateRange, setDateRange] = useState([
    startOfMonth(new Date()),
    endOfMonth(new Date()),
  ]);
  const [startDate, endDate] = dateRange;
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const response = await fetch("/api/deposits");
        const data = await response.json();

        if (Array.isArray(data)) {
          setDeposits(data);
        } else {
          console.error("Expected an array but got:", data);
          setDeposits([]);
        }

        setLoading(false);
      } catch (error) {
        setError("Error loading data");
        setLoading(false);
      }
    };

    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/employees");
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchDeposits();
    fetchEmployees();
  }, [depositsUpdated]);

  const handleEditClick = (deposit) => {
    setSelectedDeposit(deposit);
    setOpen(true);
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

  const handleDelete = async (id) => {
    try {
      const response = await fetch("/api/deposits", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        refetchDeposits();
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  // Modify filteredDeposits to check for empty date range
  const filteredDeposits = Array.isArray(deposits)
    ? deposits.filter((deposit) => {
        const depositDate = new Date(deposit.date);
        const dateMatches = 
          (startDate && endDate) 
            ? depositDate >= startDate && depositDate <= endDate 
            : true; // If date range is empty, show all
        const employeeMatches = selectedEmployee
          ? deposit.employee_name === selectedEmployee
          : true;
        return dateMatches && employeeMatches;
      })
    : [];

  const totalAmount = filteredDeposits.reduce(
    (sum, deposit) => sum + parseFloat(deposit.amount || 0),
    0
  );

  const indexOfLastDeposit = currentPage * depositsPerPage;
  const indexOfFirstDeposit = indexOfLastDeposit - depositsPerPage;
  const currentDeposits = isPrinting
    ? filteredDeposits
    : filteredDeposits.slice(indexOfFirstDeposit, indexOfLastDeposit);

  const totalPages = Math.ceil(filteredDeposits.length / depositsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handlePrint = (e) => {
    e.preventDefault();
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  if (loading) {
    return <div className="text-center text-blue-600">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start my-4">
        <div className="flex flex-col md:flex-row items-center my-4 w-full">
          <div className="flex justify-start items-center w-full">
            <div className="flex flex-col sm:flex-row items-start w-full space-y-2 sm:space-y-0 sm:space-x-4">
              <DatePicker
                selected={startDate}
                onChange={(update) => setDateRange(update)}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                isClearable
                className="border border-gray-300 p-2 rounded w-full sm:w-auto"
                dateFormat="yyyy/MM/dd"
              />
            </div>
          </div>
        </div>

        <div className="w-25 flex items-start md:w-auto">
          <button
            onClick={handlePrint}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full md:w-auto"
          >
            <FaPrint className="inline-block" />
          </button>
        </div>
      </div>

      {/* Enhanced Summary Table */}
      <div className="mb-4">
        <h2 className="font-bold mb-2">ملخص التصفية</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-center">
                  مجموع قيمة الايداعات
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  عدد حركات الايداع
                </th>
               
               
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {totalAmount.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {filteredDeposits.length}
                </td>
              
                
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div dir="rtl" id="printTable" className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">التاريخ</th>
              <th className="border border-gray-300 px-4 py-2">القيمة</th>
              <th className="border border-gray-300 px-4 py-2">ملاحظات</th>
              <th className="border border-gray-300 px-4 py-2">مكان الايداع</th>
              <th className="border border-gray-300 px-4 py-2">ايداع باليد</th>
              <th className="border border-gray-300 px-4 py-2">المستلم</th>
              <th className="border border-gray-300 px-4 py-2 no-print"></th>
            </tr>
          </thead>
          <tbody>
            {currentDeposits.map((deposit) => (
              <tr key={deposit.id} className="bg-white hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {new Date(deposit.date).toLocaleDateString()}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {deposit.amount}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {deposit.note}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {deposit.place}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {deposit.is_hand_handing ? "نعم" : "لا"}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {deposit.name_handler ? deposit.name_handler : "الايداع بنكي"}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center no-print">
                  <div className="flex justify-center">
                    <button
                      className="text-orange-500 font-bold py-1 px-2 rounded"
                      onClick={() => handleEditClick(deposit)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-700 font-bold py-1 px-2 rounded ml-2"
                      onClick={() => confirmDelete(deposit)}
                    >
                      <FaTrashAlt />
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
          message={` هل أنت متأكد من حذف الايداع بتاريخ ${new Date( recordToDelete?.date).toLocaleDateString()} بقيمة ${recordToDelete?.amount}؟`}
        />
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

      {/* Edit Drawer */}
      <EditDrawer title="Edit Deposit Entry" open={open} setOpen={setOpen}>
        <DepositForm
          selectedDeposit={selectedDeposit}
          refetchDeposits={refetchDeposits}
          setOpen={setOpen}
        />
      </EditDrawer>
    </div>
  );
}
