import React, { useState, useEffect } from "react";
import EditDrawer from "../components/Drawers/edit";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { startOfMonth, endOfMonth } from "date-fns";
import { FaEdit, FaPrint, FaTrashAlt } from "react-icons/fa";
import ConfirmModal from "../components/Modals/confirmDelete";
import PayingSalariesForm from "./PayingSalariesForm";
import EditPayingSalariesForm from "./EditPayingSalariesForm";
import ExportToExcel from "../components/ExportToExcel/ExportToExcel";

export default function PayingSalariesTable({
  salariesUpdated,
  refetchSalaries,
}) {
  const [staffSalaries, setStaffSalaries] = useState([]); // Initialize as an empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [salariesPerPage] = useState(10);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [open, setOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(""); // Employee name filter
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null); // Track the record to delete
  const [dateRange, setDateRange] = useState([
    startOfMonth(new Date()),
    endOfMonth(new Date()),
  ]); // Default to current month
  const [startDate, endDate] = dateRange;
  const [isPrinting, setIsPrinting] = useState(false); // Added to disable pagination when printing

  // Fetch staff salary entries
  useEffect(() => {
    const fetchStaffSalaries = async () => {
      try {
        const response = await fetch("/api/PayingSalaries");
        const data = await response.json();

        // Ensure data is an array before setting it to state
        if (Array.isArray(data.data)) {
          setStaffSalaries(data.data);
        } else {
          console.error("Expected an array but got:", data.data);
          setStaffSalaries([]); // Set an empty array if data is not an array
        }

        setLoading(false);
      } catch (error) {
        setError("Error loading data");
        setLoading(false);
      }
    };

    // Fetch employees for the dropdown filter
    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/employees");
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchStaffSalaries();
    fetchEmployees();
  }, [salariesUpdated]);

  const handleEditClick = (salary) => {
    console.log("Editing salary:", salary);
    setSelectedSalary(salary);
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

  // Delete entry handler
  const handleDelete = async (id) => {
    try {
      const response = await fetch("/api/PayingSalaries", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        refetchSalaries(); // Refetch the data after deletion
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  // Filter staff salary entries by selected employee name and date range
  // Filter staff salary entries by selected employee name and date range
  const filteredSalaries = Array.isArray(staffSalaries)
    ? staffSalaries.filter((salary) => {
        const salaryDate = new Date(salary.date);
        const dateMatches =
          !startDate ||
          !endDate ||
          (salaryDate >= startDate && salaryDate <= endDate);
        const employeeMatches = selectedEmployee
          ? salary.employee_name === selectedEmployee
          : true;
        return dateMatches && employeeMatches;
      })
    : [];

  // Calculate the total amount for the filtered entries

  // Calculate the total amount for the filtered entries
  const totalAmount = filteredSalaries.reduce((sum, salary) => {
    const amount = parseFloat(salary.paid_amount || 0);
    if (isNaN(amount)) {
      console.warn("Invalid amount:", salary.paid_amount);
    }
    return sum + amount;
  }, 0);
  const totalFinalRemaining = filteredSalaries.reduce((sum, salary) => {
    const amount = parseFloat(salary.finall_remaining || 0);
    if (isNaN(amount)) {
      console.warn("Invalid amount:", salary.finall_remaining);
    }
    return sum + amount;
  }, 0);

  // Pagination logic
  const indexOfLastSalary = currentPage * salariesPerPage;
  const indexOfFirstSalary = indexOfLastSalary - salariesPerPage;
  const currentSalaries = isPrinting
    ? filteredSalaries // Disable pagination when printing
    : filteredSalaries.slice(indexOfFirstSalary, indexOfLastSalary);

  const totalPages = Math.ceil(filteredSalaries.length / salariesPerPage);
  const customizeDataForExport = (data) => {
    return data.map((item) => {
      return {
        "اسم الموظف": item.employee_name,
        التاريخ: new Date(item.date).toLocaleDateString(),
        "صافي الراتب": item.adjusted_remaining_salary,
        "المبلغ المدفوع": item.paid_amount,
        "الراتب المتبقي": item.finall_remaining,
        ملاحظات: item.note || "لا يوجد ملاحظات",
      };
    });
  };

  const customizedData = customizeDataForExport(currentSalaries);
  // Page change handler
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handlePrint = (e) => {
    e.preventDefault();
    setIsPrinting(true); // Disable pagination during print
    setTimeout(() => {
      window.print();
      setIsPrinting(false); // Restore pagination after print
    }, 500); // Small delay to ensure table renders fully
  };

  if (loading) {
    return <div className="text-center text-blue-600">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4">
      {/* Date Range and Employee Name Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start my-4">
        <div className="flex flex-col md:flex-row items-center my-4 w-full">
          <div className="flex justify-start items-center w-full">
            {/* Date Range Filter and Employee Name Filter */}
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
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="border border-gray-300 p-2 rounded w-full sm:w-auto"
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
        </div>

        <div className="w-25 flex items-start md:w-auto">
          <ExportToExcel data={customizedData} fileName={"تقرير الرواتب"} />

          <button
            onClick={handlePrint}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full md:w-auto"
          >
            <FaPrint className="inline-block" />
          </button>
        </div>
      </div>

      {/* Summary Table */}
      <div className="mb-4">
        <h2 className="font-bold mb-2">ملخص التصفية</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-center">
                  مجموع المبلغ المدفوع{" "}
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  مجموع مبالغ الرواتب مستحقة الدفع{" "}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {totalAmount.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {totalFinalRemaining.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div dir="rtl" id="printTable" className="overflow-x-auto">
        {/* Staff Salary Entries Table */}
        <table
          id="printTable"
          className="min-w-full table-auto border-collapse border border-gray-200"
        >
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">اسم الموظف</th>
              <th className="border border-gray-300 px-4 py-2">التاريخ</th>
              <th className="border border-gray-300 px-4 py-2">صافي الراتب </th>
              <th className="border border-gray-300 px-4 py-2">
                المبلغ المدفوع{" "}
              </th>
              <th className="border border-gray-300 px-4 py-2">
                الراتب المتبقي
              </th>
              <th className="border border-gray-300 px-4 py-2">رقم الشيك</th>
              <th className="border border-gray-300 px-4 py-2">ملاحظات</th>
              <th className="border border-gray-300 px-4 py-2 no-print"></th>
            </tr>
          </thead>
          <tbody>
            {currentSalaries.map((salary) => (
              <tr key={salary.id} className="bg-white hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {salary.employee_name}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {new Date(salary.date).toLocaleDateString()}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {salary.adjusted_remaining_salary}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {salary.paid_amount}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {salary.finall_remaining}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {salary.check_number || "لا يوجد رقم شيك"}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {salary.note || "لا يوجد ملاحظات"}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center no-print">
                  <div className="flex justify-center">
                    <button
                      className={`text-orange-400 font-bold py-1 px-2 rounded ${
                        salary.finall_remaining === 0
                          ? "cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                      disabled={salary.finall_remaining === 0}
                      onClick={() => handleEditClick(salary)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-700 font-bold py-1 px-2 rounded ml-2"
                      onClick={() => confirmDelete(salary)}
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
          message={`هل أنت متأكد من حذف راتب ${recordToDelete?.employee_name}؟`}
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
      <EditDrawer title="اضافة دفعة راتب" open={open} setOpen={setOpen}>
        <EditPayingSalariesForm
          selectedSalary={selectedSalary}
          refetchSalaries={refetchSalaries}
          setOpen={setOpen}
        />
      </EditDrawer>
    </div>
  );
}
