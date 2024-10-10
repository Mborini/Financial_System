import React, { useEffect, useState } from 'react';
import EditDrawer from '../components/Drawers/edit';
import EditForm from './EditForm';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { FaPrint } from 'react-icons/fa';

function CostTable({ costsUpdated, refetchCosts }) {
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [costsPerPage] = useState(10);
  const [selectedCost, setSelectedCost] = useState(null);
  const [open, setOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false); // For disabling pagination when printing

  // New state for filtering
  const [nameFilter, setNameFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [types, setTypes] = useState([]);

  // Set default date range to the current month
  const [dateRange, setDateRange] = useState([
    startOfMonth(new Date()), // First day of the current month
    endOfMonth(new Date()),    // Last day of the current month
  ]);
  const [startDate, endDate] = dateRange;

  // Fetch data when component mounts or costsUpdated changes
  useEffect(() => {
    const fetchCosts = async () => {
      try {
        const response = await fetch('/api/costs');
        const data = await response.json();
        setCosts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cost data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    const fetchTypes = async () => {
      try {
        const response = await fetch('/api/costsTypes');
        const data = await response.json();
        setTypes(data);
      } catch (error) {
        console.error('Error fetching cost types:', error);
      }
    };

    fetchCosts();
    fetchTypes();
  }, [costsUpdated]);

  // Handle opening the drawer and setting the selected cost
  const handleEditClick = (cost) => {
    setSelectedCost(cost); // Set the selected cost for editing
    setOpen(true); // Open the drawer
  };

  // Handle deletion of a cost
  const handleDelete = async (id) => {
    try {
      const response = await fetch('/api/costs', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        // Remove the deleted cost from the state
        setCosts(costs.filter((cost) => cost.id !== id));
      } else {
        console.error('Error deleting cost');
      }
    } catch (error) {
      console.error('Error deleting cost:', error);
    }
  };

  if (loading) {
    return <div className="text-center text-blue-600">Loading...</div>; // Show loading message while data is being fetched
  }

  if (error) {
    return <div className="text-center text-red-600">Error: {error}</div>; // Show error message if there is any
  }

  // Filter costs by date range, name, and type
  const filteredCosts = costs.filter((cost) => {
    const matchesName = nameFilter ? cost.name.toLowerCase().includes(nameFilter.toLowerCase()) : true;
    const matchesType = typeFilter ? cost.type.toLowerCase() === typeFilter.toLowerCase() : true;
    const costDate = new Date(cost.date);
    const matchesDate = (!startDate || !endDate) ? true : (costDate >= startDate && costDate <= endDate);

    return matchesName && matchesType && matchesDate;
  });

  // Calculate the total amount for the filtered costs
  const totalCosts = filteredCosts.reduce((total, cost) => total + parseFloat(cost.amount), 0);

  // Calculate the current records for the current page
  const indexOfLastCost = currentPage * costsPerPage;
  const indexOfFirstCost = indexOfLastCost - costsPerPage;
  const currentCosts = isPrinting
    ? filteredCosts // Show all filtered costs when printing
    : filteredCosts.slice(indexOfFirstCost, indexOfLastCost);

  // Get total pages
  const totalPages = Math.ceil(filteredCosts.length / costsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handlePrint = (e) => {
    e.preventDefault();
    setIsPrinting(true); // Disable pagination when printing
    setTimeout(() => {
      window.print(); // Trigger the print dialog
      setIsPrinting(false); // Restore pagination after printing
    }, 500); // Small delay to ensure the table is rendered before printing
  };

  return (
    <div className="container mx-auto px-4">
      {/* Filters */}
      <div className="flex justify-between my-4">
        {/* Name Filter */}
        <input
          type="text"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          placeholder="Filter by name"
          className="border border-gray-300 p-2 rounded"
        />

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-gray-300 p-2 rounded"
        >
          <option value="">All Types</option>
          {types.map((t) => (
            <option key={t.id} value={t.name.toLowerCase()}>
              {t.name}
            </option>
          ))}
        </select>

        {/* Date Range Filter */}
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

        {/* Print Button */}
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
        <h2 className="font-bold mb-2">Cost Summary</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-center">Total Costs</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {totalCosts.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Table */}
      <table id='printTable' className="min-w-full table-auto border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Description</th>
            <th className="border border-gray-300 px-4 py-2">Amount</th>
            <th className="border border-gray-300 px-4 py-2">Type</th>
            <th className="border border-gray-300 px-4 py-2">Date</th>
            <th className="border border-gray-300 px-4 py-2 no-print">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentCosts.map((cost) => (
            <tr key={cost.id} className="bg-white hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2 text-center">{cost.name}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">{cost.description}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">{cost.amount}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">{cost.type}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">{format(new Date(cost.date), 'yyyy-MM-dd')}</td>
              <td className="border border-gray-300 px-4 py-2 text-center no-print">
                <button
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-2 rounded"
                  onClick={() => handleEditClick(cost)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2"
                  onClick={() => handleDelete(cost.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
      )}

      <EditDrawer title="Edit Cost" open={open} setOpen={setOpen}>
        <EditForm selectedCost={selectedCost} refetchCosts={refetchCosts} setOpen={setOpen} />
      </EditDrawer>
    </div>
  );
}

export default CostTable;
