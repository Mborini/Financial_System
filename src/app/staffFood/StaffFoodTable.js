import React, { useState, useEffect } from "react";
import EditDrawer from "../components/Drawers/edit";
import StaffFoodForm from "./StaffFoodForm";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { startOfMonth, endOfMonth } from "date-fns";
import { FaEdit, FaPrint, FaTrashAlt } from "react-icons/fa";

export default function StaffFoodTable({ foodUpdated, refetchFood }) {
  const [staffFood, setStaffFood] = useState([]); // Initialize as an empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [foodPerPage] = useState(10);
  const [selectedFood, setSelectedFood] = useState(null);
  const [open, setOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(""); // Employee name filter
  const [dateRange, setDateRange] = useState([startOfMonth(new Date()), endOfMonth(new Date())]); // Default to current month
  const [startDate, endDate] = dateRange;

  // Fetch staff food entries
  useEffect(() => {
    const fetchStaffFood = async () => {
      try {
        const response = await fetch("/api/stafffood");
        const data = await response.json();

        // Ensure data is an array before setting it to state
        if (Array.isArray(data)) {
          setStaffFood(data);
        } else {
          console.error("Expected an array but got:", data);
          setStaffFood([]); // Set an empty array if data is not an array
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

    fetchStaffFood();
    fetchEmployees();
  }, [foodUpdated]);

  // Edit entry handler
  const handleEditClick = (food) => {
    setSelectedFood(food); // Set the selected entry for editing
    setOpen(true); // Open the drawer for editing
  };

  // Delete entry handler
  const handleDelete = async (id) => {
    try {
      const response = await fetch("/api/stafffood", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        refetchFood(); // Refetch the data after deletion
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  // Filter staff food entries by selected employee name and date range
  const filteredFood = Array.isArray(staffFood)
    ? staffFood.filter((food) => {
        const foodDate = new Date(food.date);
        const dateMatches = foodDate >= startDate && foodDate <= endDate;
        const employeeMatches = selectedEmployee ? food.employee_name === selectedEmployee : true;
        return dateMatches && employeeMatches;
      })
    : [];

  // Calculate the total amount for the filtered entries
  const totalAmount = filteredFood.reduce((sum, food) => sum + parseFloat(food.amount || 0), 0);

  // Pagination logic
  const indexOfLastFood = currentPage * foodPerPage;
  const indexOfFirstFood = indexOfLastFood - foodPerPage;
  const currentFood = filteredFood.slice(indexOfFirstFood, indexOfLastFood);

  const totalPages = Math.ceil(filteredFood.length / foodPerPage);

  // Page change handler
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <div className="text-center text-blue-600">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600">Error: {error}</div>;
  }
  const handlePrint = (e) => {
    e.preventDefault();
    const printContents = document.getElementById("printTable").outerHTML;
    const originalContents = document.body.innerHTML;

    // Replace body content with just the table for printing
    document.body.innerHTML = printContents;

    window.print(); // Trigger the print dialog

    // Restore original contents after printing
    document.body.innerHTML = originalContents;
    window.location.reload(); // Optional: reload the page to ensure state is restored
  };
  return (
    <div className="container mx-auto px-4">
      {/* Date Range and Employee Name Filter */}
      <div className="flex justify-between items-center my-4">
        {/* Date Range Filter */}
        <div className="flex items-center">
          <DatePicker
            selected={startDate}
            onChange={(update) => setDateRange(update)}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            isClearable
            className="border border-gray-300 p-2 rounded"
            dateFormat="yyyy/MM/dd"
          />
        </div>

        {/* Employee Name Filter */}
        <div className="flex items-center">
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="border border-gray-300 p-2 rounded"
          >
            <option value="">All Employees</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.name}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>
        <div>
        <button
          onClick={handlePrint}
          className="bg-blue-500 mt-2 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          <FaPrint className="inline-block " />
        </button>
      </div>
      </div>

      {/* Total Amount */}
      <div className="my-4">
        <h2 className="text-xl font-bold">Total Amount for Selected Period: {totalAmount.toFixed(2)}</h2>
      </div>
      <table id="printTable" className="min-w-full table-auto border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">Employee Name</th>
            <th className="border border-gray-300 px-4 py-2">Date</th>
            <th className="border border-gray-300 px-4 py-2">Note</th>
            <th className="border border-gray-300 px-4 py-2">Amount</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
  {currentFood.map((food) => (
    <tr key={food.id} className="bg-white hover:bg-gray-50">
      <td className="border border-gray-300 px-4 py-2 text-center">{food.employee_name}</td> {/* Use employee_name */}
      <td className="border border-gray-300 px-4 py-2 text-center">{new Date(food.date).toLocaleDateString()}</td>
      <td className="border border-gray-300 px-4 py-2 text-center">{food.note}</td>
      <td className="border border-gray-300 px-4 py-2 text-center">{food.amount}</td>
      <td className="border border-gray-300 px-4 py-2 text-center">
        <button
          className="  text-orange-500 font-bold py-1 px-2 rounded"
          onClick={() => handleEditClick(food)}
        >
          <FaEdit />
        </button>
        <button
          className=" text-red-700 font-bold py-1 px-2 rounded ml-2"
          onClick={() => handleDelete(food.id)}
        >
          <FaTrashAlt />
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
            className={`px-4 py-2 mx-1 rounded ${i + 1 === currentPage ? "bg-blue-500 text-white" : "bg-gray-300 hover:bg-gray-400"}`}
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

      {/* Edit Drawer */}
      <EditDrawer title="Edit Staff Food Entry" open={open} setOpen={setOpen}>
        <StaffFoodForm selectedFood={selectedFood} refetchFood={refetchFood} setOpen={setOpen} />
      </EditDrawer>
    </div>
  );
}
