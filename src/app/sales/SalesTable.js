import React, { useEffect, useState } from "react";
import { FaPrint, FaSpinner } from "react-icons/fa"; // Spinner for loading
import { parseISO, isValid, format } from "date-fns"; // Added isValid for date validation
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { startOfMonth, endOfMonth } from "date-fns";

function SalesTable({ costsUpdated, refetchCosts }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [salesPerPage] = useState(10);
  const [selectedSale, setSelectedSale] = useState(null);
  const [open, setOpen] = useState(false);

  // Date range state with the default to the current month
  const [dateRange, setDateRange] = useState([
    startOfMonth(new Date()),
    endOfMonth(new Date()),
  ]);
  const [startDate, endDate] = dateRange;

  // Fetch data when component mounts or costsUpdated changes
  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true); // Start loading
        const response = await fetch("/api/sales");
        const data = await response.json();
        setSales(data);
        setLoading(false); // Stop loading
      } catch (error) {
        console.error("Error fetching sales data:", error);
        setError("Failed to fetch data. Please try again.");
        setLoading(false); // Stop loading
      }
    };

    fetchSales();
  }, [costsUpdated]);

  // Handle opening the drawer and setting the selected sale
  const handleEditClick = (sale) => {
    setSelectedSale(sale); // Set the selected sale for editing
    setOpen(true); // Open the drawer
  };

  // Handle deletion of a sale
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sale?")) {
      try {
        const response = await fetch("/api/sales", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        });

        if (response.ok) {
          // Remove the deleted sale from the state
          setSales(sales.filter((sale) => sale.id !== id));
          if (sales.length - 1 < (currentPage - 1) * salesPerPage) {
            // If the page becomes empty after deletion, go back to the previous page
            setCurrentPage(currentPage - 1);
          }
        } else {
          console.error("Error deleting sale");
        }
      } catch (error) {
        console.error("Error deleting sale:", error);
      }
    }
  };

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

  if (loading) {
    return (
      <div className="flex justify-center">
        <FaSpinner className="animate-spin text-blue-600" size={30} />
      </div>
    ); // Show spinner while loading
  }

  if (error) {
    return <div className="text-center text-red-600">Error: {error}</div>; // Show error message if there's any
  }

  // Filter sales by the selected date range
  const filteredSales = sales.filter((sale) => {
    if (!startDate || !endDate) return true;

    // Parse the sale date and check if it's valid
    const saleDate = parseISO(sale.sale_date);
    if (!isValid(saleDate)) return false; // Skip invalid dates

    // Compare the parsed sale date with the selected date range
    return saleDate >= startDate && saleDate <= endDate;
  });

  // Calculate the total cash, visa, and total sales from the filtered sales
  const totalCash = filteredSales.reduce(
    (sum, sale) => sum + parseFloat(sale.cash_amount || 0),
    0
  );
  const totalVisa = filteredSales.reduce(
    (sum, sale) => sum + parseFloat(sale.visa_amount || 0),
    0
  );
  const totalSales = filteredSales.reduce(
    (sum, sale) => sum + parseFloat(sale.total || 0),
    0
  );

  // Calculate the current records for the current page
  const indexOfLastSale = currentPage * salesPerPage;
  const indexOfFirstSale = indexOfLastSale - salesPerPage;
  const currentSales = filteredSales.slice(indexOfFirstSale, indexOfLastSale);

  // Get total pages
  const totalPages = Math.ceil(filteredSales.length / salesPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div  id="printTable" className="container mx-auto px-4 ">
      {/* Date Range Filter */}
      <div className="flex justify-between my-4">
        <DatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={(update) => setDateRange(update)} // Correctly set date range
          isClearable
          placeholderText="Select a date range"
          className="border border-gray-300 p-2 rounded"
        />
        <div>
          <button
            onClick={handlePrint}
            className="bg-blue-500 mt-2 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            <FaPrint className="inline-block " />
          </button>
        </div>
      </div>

      {/* Summary Table */}
      <div className="mb-4">
        <h2 className="font-bold mb-2">Sales Summary</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-center">Total Cash</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Total Visa</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Total Sales</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {totalCash.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {totalVisa.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {totalSales.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales Table */}
      <table
       
        className="min-w-full table-auto border-collapse border border-gray-200"
      >
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">Date</th>
            <th className="border border-gray-300 px-4 py-2">Cash</th>
            <th className="border border-gray-300 px-4 py-2">Visa</th>
            <th className="border border-gray-300 px-4 py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {currentSales.map((sale) => (
            <tr key={sale.id} className="bg-white hover:bg-gray-50">
              
              <td className="border border-gray-300 px-4 py-2 text-center">
                {format(parseISO(sale.sale_date), "yyyy-MM-dd")}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {parseFloat(sale.cash_amount).toFixed(2)}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {parseFloat(sale.visa_amount).toFixed(2)}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {parseFloat(sale.total).toFixed(2)}
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
    </div>
  );
}

export default SalesTable;
