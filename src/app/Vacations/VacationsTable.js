import { useState, useEffect } from "react";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import the CSS for the date picker
import { FaPrint, FaTrash } from "react-icons/fa";
import ConfirmModal from "../components/Modals/confirmDelete";

const RECORDS_PER_PAGE = 10;

export default function VacationsTable({ vacationsUpdated, refetchVacations }) {
  const [vacations, setVacations] = useState([]); // Initialize as an empty array
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(""); // String for dropdown values
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // For pagination
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null); // Track the record to delete

  // Fetch employees and vacations on component mount
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

    const fetchVacations = async () => {
      try {
        const response = await fetch("/api/vacations");
        const data = await response.json();

        if (Array.isArray(data)) {
          setVacations(data); // Only set vacations if the data is an array
        } else {
          setVacations([]); // Fallback to an empty array if the response is not an array
        }

        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchEmployees();
    fetchVacations();
  }, [vacationsUpdated]);

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

  const handleDelete = async (id) => {
    try {
      const response = await fetch("/api/vacations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        refetchVacations();
      }
    } catch (error) {
      console.error("Error deleting vacation:", error);
    }
  };

  const handleDateChange = (update) => {
    const [start, end] = update;
    setStartDate(start);
    setEndDate(end);
  };

  const filteredVacations = Array.isArray(vacations)
    ? vacations.filter((vacation) => {
        const vacationDate = new Date(vacation.vacation_date);
        const isEmployeeMatch =
          selectedEmployee === "" ||
          vacation.employee_name === selectedEmployee;
        const isDateInRange =
          (!startDate || vacationDate >= startDate) &&
          (!endDate || vacationDate <= endDate);

        return isEmployeeMatch && isDateInRange;
      })
    : [];

  // Pagination logic
  const indexOfLastVacation = currentPage * RECORDS_PER_PAGE;
  const indexOfFirstVacation = indexOfLastVacation - RECORDS_PER_PAGE;
  const currentVacations = filteredVacations.slice(
    indexOfFirstVacation,
    indexOfLastVacation
  );

  const totalPages = Math.ceil(filteredVacations.length / RECORDS_PER_PAGE);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4">
      <div className="  flex justify-between items-center mb-4">
        
          {/* Filters */}
          <div className="flex flex-col md:flex-row justify-start items-center mb-4 gap-3 space-y-2 md:space-y-0">
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Employees</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.name}>
                  {employee.name}
                </option>
              ))}
            </select>

            <div className="w-full md:w-auto">
              <DatePicker
                selected={startDate}
                onChange={handleDateChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                isClearable
                className="w-full md:w-auto border border-gray-300 p-2 rounded"
                dateFormat="yyyy/MM/dd"
                placeholderText="Select date range"
              />
            </div>
          </div>
          <div>
            <button
              onClick={handlePrint}
              className="w-full md:w-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
            >
              <FaPrint className="inline-block mr-2" />
            </button>
          </div>
        
      </div>
      {/* Vacations Table */}
      <div dir="rtl" className="overflow-x-auto">
        <table
          className="min-w-full table-auto border-collapse border border-gray-200"
          id="printTable"
        >
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">الموظف</th>
              <th className="border border-gray-300 px-4 py-2">
                تاريخ الاجازة
              </th>
              <th className="border border-gray-300 px-4 py-2">
                تاريخ الإضافة
              </th>
              <th className="border border-gray-300 px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {currentVacations.map((vacation) => (
              <tr key={vacation.id} className="bg-white hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {vacation.employee_name}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {format(new Date(vacation.vacation_date), "yyyy/MM/dd")}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {format(new Date(vacation.created_at), "yyyy/MM/dd")}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <button
                    className="text-red-500 font-bold py-1 px-2 rounded ml-2"
                    onClick={() => confirmDelete(vacation)}
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
          message={`هل أنت متأكد من حذف اجازة ${recordToDelete?.employee_name} ؟`}
        />
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center my-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 mx-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Previous
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
          Next
        </button>
      </div>
    </div>
  );
}
