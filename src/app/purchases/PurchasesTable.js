import React, { useEffect, useState } from "react";
import { FaPrint, FaSpinner } from "react-icons/fa"; // Spinner for loading
import EditDrawer from "../components/Drawers/edit";
import EditPurchasesForm from "./EditPurchasesForm";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { startOfMonth, endOfMonth } from "date-fns";

function PurchasesTable({ costsUpdated, refetchCosts }) {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [purchasesPerPage] = useState(10);
  const [selectedPurchase, setSelectedPurchase] = useState(null); // Store the selected purchase for editing
  const [open, setOpen] = useState(false);

  // Date range state with the default to the current month
  const [dateRange, setDateRange] = useState([
    startOfMonth(new Date()), // Start of the current month
    endOfMonth(new Date()), // End of the current month
  ]);
  const [startDate, endDate] = dateRange;

  const [suppliers, setSuppliers] = useState([]);
  const [paymentStatuses] = useState(["Paid", "Partial", "Debt"]); // Payment statuses
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");
  const [searchName, setSearchName] = useState(""); // Search input for name

  // Fetch data when component mounts or costsUpdated changes
  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setLoading(true); // Start loading
        const response = await fetch("/api/purchases");
        const data = await response.json();
        setPurchases(data);
        setLoading(false); // Stop loading
      } catch (error) {
        console.error("Error fetching purchases data:", error);
        setError("Failed to fetch data. Please try again.");
        setLoading(false); // Stop loading
      }
    };

    const fetchSuppliers = async () => {
      try {
        const response = await fetch("/api/suppliers");
        const data = await response.json();
        setSuppliers(data);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        setError("Failed to fetch suppliers.");
      }
    };

    fetchPurchases();
    fetchSuppliers();
  }, [costsUpdated]);

  // Handle opening the drawer and setting the selected purchase
  const handleEditClick = (purchase) => {
    setSelectedPurchase(purchase); // Set the selected purchase for editing
    setOpen(true); // Open the drawer
  };

  // Handle deletion of a purchase
  const handleDelete = async (id) => {
    try {
      const response = await fetch("/api/purchases", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        // Remove the deleted purchase from the state
        setPurchases(purchases.filter((purchase) => purchase.id !== id));
      } else {
        console.error("Error deleting purchase");
      }
    } catch (error) {
      console.error("Error deleting purchase:", error);
    }
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

  // Handle filtering logic
  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSupplier = selectedSupplier
      ? purchase.supplier === selectedSupplier
      : true;
    const matchesPaymentStatus = selectedPaymentStatus
      ? purchase.payment_status === selectedPaymentStatus
      : true;
    const matchesSearchName = purchase.name
      .toLowerCase()
      .includes(searchName.toLowerCase());

    return matchesSupplier && matchesPaymentStatus && matchesSearchName;
  });

  // Calculate the current records for the current page
  const indexOfLastPurchase = currentPage * purchasesPerPage;
  const indexOfFirstPurchase = indexOfLastPurchase - purchasesPerPage;
  const currentPurchases = filteredPurchases.slice(
    indexOfFirstPurchase,
    indexOfLastPurchase
  );

  // Get total pages
  const totalPages = Math.ceil(filteredPurchases.length / purchasesPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
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
      {/* Filters Section */}
      <div className="mb-4 flex justify-between">
        <div className="flex space-x-4 mb-4">
          {/* Filter by Supplier */}
          <div>
            <label
              htmlFor="supplier-filter"
              className="block text-sm font-medium text-gray-700"
            >
              Filter by Supplier
            </label>
            <select
              id="supplier-filter"
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All Suppliers</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.name}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Payment Status */}
          <div>
            <label
              htmlFor="payment-status-filter"
              className="block text-sm font-medium text-gray-700"
            >
              Filter by Payment Status
            </label>
            <select
              id="payment-status-filter"
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All Payment Statuses</option>
              {paymentStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Search by Name */}
          <div>
            <label
              htmlFor="name-search"
              className="block text-sm font-medium text-gray-700"
            >
              Search by Name
            </label>
            <input
              id="name-search"
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Search by name"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Date Range Filter */}
          <div>
            <label
              htmlFor="name-search"
              className="block text-sm font-medium text-gray-700"
            >
              Search by Date
            </label>

            <DatePicker
              selected={startDate}
              onChange={(update) => setDateRange(update)}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              isClearable
              placeholderText="Select a date range"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
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
<br/>
      <h1>total of  .....
              
      </h1>
      {/* Table Section */}
      <table
        id="printTable"
        className="min-w-full table-auto border-collapse border border-gray-200"
      >
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">ID</th>
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Amount</th>
            <th className="border border-gray-300 px-4 py-2">Paid Amount</th>
            <th className="border border-gray-300 px-4 py-2">
              Remaining Amount
            </th>{" "}
            {/* Add remaining amount column */}
            <th className="border border-gray-300 px-4 py-2">Payment Status</th>
            <th className="border border-gray-300 px-4 py-2">Supplier</th>
            <th className="border border-gray-300 px-4 py-2">Date</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentPurchases.map((purchase) => (
            <tr key={purchase.id} className="bg-white hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2 text-center">
                {purchase.id}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {purchase.name}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {purchase.amount}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {purchase.paid_amount}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {purchase.remaining_amount}
              </td>{" "}
              {/* Display remaining amount */}
              <td className="border border-gray-300 px-4 py-2 text-center">
                {purchase.payment_status}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {purchase.supplier}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {new Date(purchase.date).toLocaleDateString()}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <button
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-2 rounded"
                  onClick={() => handleEditClick(purchase)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2"
                  onClick={() => handleDelete(purchase.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Section */}
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

      {/* Edit Drawer */}
      <EditDrawer title="Edit Purchase" open={open} setOpen={setOpen}>
        <EditPurchasesForm
          selectedPurchase={selectedPurchase}
          refetchCosts={refetchCosts}
          setOpen={setOpen}
        />
      </EditDrawer>
    </div>
  );
}

export default PurchasesTable;
