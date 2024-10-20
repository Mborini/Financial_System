import { useState, useEffect } from "react";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaEdit, FaPrint, FaTrash } from "react-icons/fa";
import ConfirmModal from "../components/Modals/confirmDelete";
import CashWithdrawalsForm from "./CashWithdrawalsForm";
import EditDrawer from "../components/Drawers/edit";
import ExportToExcel from "../components/ExportToExcel/ExportToExcel";

const RECORDS_PER_PAGE = 10;

export default function CashWithdrawalsTable({ cashWithdrawalsUpdated, refetchCashWithdrawals }) {
  const [cashWithdrawals, setCashWithdrawals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const [startDate, setStartDate] = useState(startOfMonth);
  const [endDate, setEndDate] = useState(endOfMonth);
  const [checkNumberSearch, setCheckNumberSearch] = useState(""); // State for check number search
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [selectedCashWithdrawal, setSelectedCashWithdrawal] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/employees");
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    const fetchCashWithdrawals = async () => {
      try {
        const response = await fetch("/api/cashWithdrawals");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "An unknown error occurred");
        }
        const data = await response.json();
        setCashWithdrawals(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchEmployees();
    fetchCashWithdrawals();
  }, [cashWithdrawalsUpdated]);

  const handlePrint = () => {
    const printContents = document.getElementById("printTable").outerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
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
  const customizeDataForExport = (data) => {
    return data.map((item) => {
      return {
        النوع: item.type,
        المبلغ: item.amount,
        "رقم الشيك": item.checkNumber || "-",
        "تاريخ السحب": format(new Date(item.date), "yyyy/MM/dd"),
        ملاحظات: item.notes,
      };
    });
  };

  const customizedData = customizeDataForExport(cashWithdrawals);
  const handleDelete = async (id) => {
    try {
      const response = await fetch("/api/cashWithdrawals", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        refetchCashWithdrawals();
      }
    } catch (error) {
      console.error("Error deleting cash withdrawal:", error);
    }
  };

  const handleDateChange = (update) => {
    const [start, end] = update;
    setStartDate(start);
    setEndDate(end);
  };

  const isDateValid = (date) => date instanceof Date && !isNaN(date);

  const filteredCashWithdrawals = Array.isArray(cashWithdrawals)
    ? cashWithdrawals.filter((withdrawal) => {
        const withdrawalDate = new Date(withdrawal.date);
        const isEmployeeMatch =
          selectedEmployee === "" || withdrawal.employee_id === selectedEmployee;
        const isDateInRange =
          (!startDate && !endDate) ||
          (isDateValid(startDate) ? withdrawalDate >= startDate : true) &&
          (isDateValid(endDate) ? withdrawalDate <= endDate : true);
        const isCheckNumberMatch =
          checkNumberSearch === "" || (withdrawal.checkNumber || "").includes(checkNumberSearch);

        return isEmployeeMatch && isDateInRange && isCheckNumberMatch;
      })
    : [];

  const totalAmount = filteredCashWithdrawals.reduce((sum, withdrawal) => sum + parseFloat(withdrawal.amount) || 0, 0);

  const indexOfLastWithdrawal = currentPage * RECORDS_PER_PAGE;
  const indexOfFirstWithdrawal = indexOfLastWithdrawal - RECORDS_PER_PAGE;
  const currentWithdrawals = filteredCashWithdrawals.slice(
    indexOfFirstWithdrawal,
    indexOfLastWithdrawal
  );

  const totalPages = Math.ceil(filteredCashWithdrawals.length / RECORDS_PER_PAGE);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleEditClick = (withdrawal) => {
    setSelectedCashWithdrawal(withdrawal);
    setOpen(true);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col md:flex-row justify-start items-center mb-4 gap-3 space-y-2 md:space-y-0">
          <DatePicker
            selected={startDate}
            onChange={handleDateChange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            isClearable
            className="w-full md:w-auto border border-gray-300 p-2 rounded"
            dateFormat="yyyy/MM/dd"
            placeholderText="اختر تاريخ النطاق"
          />
          <input
            type="text"
            value={checkNumberSearch}
            onChange={(e) => setCheckNumberSearch(e.target.value)}
            placeholder="ابحث عن رقم الشيك"
            className="border border-gray-300 p-2 rounded w-full md:w-auto"
          />
        </div>
        <div className="flex items-center gap-2">
        <ExportToExcel data={customizedData} fileName="مسحوبات نقدية" />

          <button
            onClick={handlePrint}
            className="w-full md:w-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded flex items-center justify-center"
          >
            <FaPrint className="inline-block mr-2 " />
          </button>
        </div>
      </div>

      {/* Summary Table */}
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full table-auto border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">إجمالي المبلغ</th>
              <th className="border border-gray-300 px-4 py-2">{totalAmount.toFixed(2)}</th>
            </tr>
          </thead>
        </table>
      </div>

      <div dir="rtl" className="overflow-x-auto">
        <table
          className="min-w-full table-auto border-collapse border border-gray-200"
          id="printTable"
        >
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">النوع</th>
              <th className="border border-gray-300 px-4 py-2">المبلغ</th>
              <th className="border border-gray-300 px-4 py-2">رقم الشيك</th>
              <th className="border border-gray-300 px-4 py-2">تاريخ السحب</th>
              <th className="border border-gray-300 px-4 py-2">ملاحظات</th>
              <th className="border border-gray-300 px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {currentWithdrawals.map((withdrawal) => (
              <tr key={withdrawal.id} className="bg-white hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {withdrawal.type}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {withdrawal.amount}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {withdrawal.checkNumber || "-"}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {format(new Date(withdrawal.date), "yyyy/MM/dd")}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {withdrawal.notes}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <button
                    className="text-orange-500 font-bold py-1 px-2 rounded ml-2"
                    onClick={() => handleEditClick(withdrawal)}
                  >
                    <FaEdit className="inline-block" />
                  </button>
                  <button
                    className="text-red-500 font-bold py-1 px-2 rounded ml-2"
                    onClick={() => confirmDelete(withdrawal)}
                  >
                    <FaTrash className="inline-block" />
                  </button>
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
          message={`هل أنت متأكد من حذف سحب نقدي ${recordToDelete?.amount} ؟`}
        />
      </div>
      <EditDrawer title="تعديل سحب نقدي" open={open} setOpen={setOpen}>
        <CashWithdrawalsForm 
          selectedCashWithdrawal={selectedCashWithdrawal} 
          refetchCashWithdrawals={refetchCashWithdrawals} 
          setOpen={setOpen}
        />
      </EditDrawer>

      <div className="flex justify-center my-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 mx-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          السابق
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => handlePageChange(i + 1)}
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
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 mx-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          التالي
        </button>
      </div>
    </div>
  );
}
