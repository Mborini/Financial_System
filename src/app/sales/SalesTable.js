import React, { useEffect, useState } from "react";
import { FaPrint, FaSpinner } from "react-icons/fa";
import { parseISO, isValid, format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { startOfMonth, endOfMonth } from "date-fns";
import EditDrawer from "../components/Drawers/edit";
import EditForm from "../sales/EditForm";
import ConfirmModal from "../components/Modals/confirmDelete";

function SalesTable({ salesUpdated, refetchSales }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [salesPerPage] = useState(10);
  const [selectedSale, setSelectedSale] = useState(null);
  const [open, setOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null); // Track the record to delete

  const [dateRange, setDateRange] = useState([
    startOfMonth(new Date()),
    endOfMonth(new Date()),
  ]);
  const [startDate, endDate] = dateRange;

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/sales");
        const data = await response.json();
        setSales(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching sales data:", error);
        setError("Failed to fetch data. Please try again.");
        setLoading(false);
      }
    };

    fetchSales();
  }, [salesUpdated]);

  const handleEditClick = (sale) => {
    if (sale && sale.id) {
      setSelectedSale(sale);
      setOpen(true);
    } else {
      setError("No sale selected for editing.");
    }
  };

  const confirmDelete = (record) => {
    setRecordToDelete(record);
    setIsModalOpen(true); // Open the confirmation modal
  };

  const handleDeleteConfirmed = () => {
    if (recordToDelete && recordToDelete.id) {
      handleDelete(recordToDelete.id); // Delete the record after confirmation
      setIsModalOpen(false); // Close the modal after deletion
    }
  };

  const handleDelete = async (id) => {
    const originalSales = [...sales]; // Keep a copy of the original sales
    setSales(sales.filter((sale) => sale.id !== id)); // Optimistically update UI

    try {
      const response = await fetch("/api/sales", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        setSales(originalSales); // Revert state if delete fails
        console.error("Error deleting sale");
      } else {
        // Adjust pagination if needed
        if (sales.length - 1 < (currentPage - 1) * salesPerPage) {
          setCurrentPage((prev) => Math.max(prev - 1, 1));
        }
      }
    } catch (error) {
      setSales(originalSales); // Revert state on error
      console.error("Error deleting sale:", error);
    }
  };

  const handlePrint = (e) => {
    e.preventDefault();
    const printContents = document.getElementById("printTable").outerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex justify-center">
        <FaSpinner className="animate-spin text-blue-600" size={30} />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600">Error: {error}</div>;
  }

  const filteredSales = sales.filter((sale) => {
    if (!startDate || !endDate) return true;
    const saleDate = parseISO(sale.sale_date);
    if (!isValid(saleDate)) return false;
    return saleDate >= startDate && saleDate <= endDate;
  });

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

  const indexOfLastSale = currentPage * salesPerPage;
  const indexOfFirstSale = indexOfLastSale - salesPerPage;
  const currentSales = filteredSales.slice(indexOfFirstSale, indexOfLastSale);
  const totalPages = Math.ceil(filteredSales.length / salesPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div dir="rtl" id="printTable" className="container mx-auto px-4">
      <div className="flex justify-between my-4">
        <DatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={(update) => setDateRange(update)}
          isClearable
          placeholderText="Select a date range"
          className="border border-gray-300 p-2 rounded"
        />
        <div>
          <button
            onClick={handlePrint}
            className="bg-blue-500 mt-2 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            <FaPrint className="inline-block" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="font-bold mb-2">ملخص التصفية</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-center">
                  مجموع الكاش
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  مجموع الفيزا
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  المجموع الكلي
                </th>
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

      <table className="min-w-full table-auto border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">المجموع الكلي</th>
            <th className="border border-gray-300 px-4 py-2">الفيزا</th>
            <th className="border border-gray-300 px-4 py-2">الكاش</th>
            <th className="border border-gray-300 px-4 py-2">التاريخ</th>
            <th className="border border-gray-300 px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {currentSales.map((sale) => (
            <tr key={sale.id} className="bg-white hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2 text-center">
                {parseFloat(sale.total).toFixed(2)}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {parseFloat(sale.visa_amount).toFixed(2)}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {parseFloat(sale.cash_amount).toFixed(2)}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {format(parseISO(sale.sale_date), "yyyy-MM-dd")}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <button
                  onClick={() => handleEditClick(sale)}
                  className="bg-orange-500 hover:bg-orange-600 ml-2 text-white font-bold py-1 px-2 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => confirmDelete(sale)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2"
                >
                  Delete
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
        message={`هل أنت متأكد من حذف المبيعات البالغة ${recordToDelete?.total ?? "unknown"} بتاريخ ${recordToDelete?.sale_date ? format(parseISO(recordToDelete.sale_date), "yyyy-MM-dd") : "unknown date"}`}
        />

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
      {selectedSale && (
        <EditDrawer title="تعديل مبيعات يومية " open={open} setOpen={setOpen}>
          <EditForm selectedSale={selectedSale} setOpen={setOpen} refetchSales={refetchSales} />
        </EditDrawer>
      )}
    </div>
  );
}

export default SalesTable;
