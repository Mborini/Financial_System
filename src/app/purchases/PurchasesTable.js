import React, { useEffect, useState } from "react";
import { FaPrint, FaSpinner } from "react-icons/fa"; // Spinner for loading
import EditDrawer from "../components/Drawers/edit";
import EditPurchasesForm from "./EditPurchasesForm";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { startOfMonth, endOfMonth } from "date-fns";
import ConfirmModal from "../components/Modals/confirmDelete";
import { parseISO, isValid, format } from "date-fns";

function PurchasesTable({ costsUpdated, refetchCosts }) {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [purchasesPerPage] = useState(10);
  const [selectedPurchase, setSelectedPurchase] = useState(null); // Store the selected purchase for editing
  const [open, setOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null); // Track the record to delete
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
  const [isPrinting, setIsPrinting] = useState(false); // Add this line

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

    const matchesDateRange =
      !startDate || !endDate
        ? true
        : new Date(purchase.date) >= startDate &&
          new Date(purchase.date) <= endDate;

    return (
      matchesSupplier &&
      matchesPaymentStatus &&
      matchesSearchName &&
      matchesDateRange
    );
  });
  const totalAmount = filteredPurchases
    .reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0)
    .toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    });
  const totalPaidAmount = filteredPurchases
    .reduce((acc, curr) => acc + parseFloat(curr.paid_amount || 0), 0)
    .toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    });
  const totalRemainingAmount = filteredPurchases
    .reduce((acc, curr) => acc + parseFloat(curr.remaining_amount || 0), 0)
    .toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    });

  const paymentStatusCounts = {
    Paid: filteredPurchases.filter(
      (purchase) => purchase.payment_status === "Paid"
    ).length,
    Partial: filteredPurchases.filter(
      (purchase) => purchase.payment_status === "Partial"
    ).length,
    Debt: filteredPurchases.filter(
      (purchase) => purchase.payment_status === "Debt"
    ).length,
  };

  // Calculate the current records for the current page
  const indexOfLastPurchase = currentPage * purchasesPerPage;
  const indexOfFirstPurchase = indexOfLastPurchase - purchasesPerPage;
  const currentPurchases = isPrinting
    ? filteredPurchases // Display all purchases when printing
    : filteredPurchases.slice(
        (currentPage - 1) * purchasesPerPage,
        currentPage * purchasesPerPage
      );

  const statusTranslations = {
    Partial: "جزئي",
    Paid: "مدفوع",
    Debt: "دين",
  };
  // Get total pages
  const totalPages = Math.ceil(filteredPurchases.length / purchasesPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const handlePrint = (e) => {
    e.preventDefault();
    setIsPrinting(true); // Disable pagination for printing
    setTimeout(() => {
      window.print(); // Trigger the print dialog
      setIsPrinting(false); // Restore pagination after printing
    }, 500); // Small delay to ensure the table is rendered before printing
  };

  return (
    <div dir="rtl" className="container mx-auto px-4">
      <div className="container mx-auto px-4">
        {/* Filters Section */}
        <div className="mb-4 flex flex-col md:flex-row justify-between md:items-center">
          <div className="flex flex-col md:flex-row space-x-0 md:space-x-4 mb-4 md:mb-0 w-full md:w-auto">
            {/* Filter by Supplier */}
            <div className="mb-4 md:mb-0 ml-4 w-full md:w-auto">
              <select
                id="supplier-filter"
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="mt-1 block w-full  px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">اختر المورد</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.name}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Payment Status */}
            <div className="mb-4 md:mb-0 w-full md:w-auto">
              <select
                id="payment-status-filter"
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">حالة الفاتورة</option>
                {paymentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {statusTranslations[status] || status}
                  </option>
                ))}
              </select>
            </div>

            {/* Search by Name */}
            <div className="mb-4 md:mb-0 w-full md:w-auto">
              <input
                id="name-search"
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="بحث حسب اسم الصنف"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* Date Range Filter */}
            <div className="mb-4 md:mb-0 w-full md:w-auto">
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

          {/* Align the Print Button Responsively */}
          <div className="flex justify-end md:justify-start mt-4 md:mt-0">
            <button
              onClick={handlePrint}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              <FaPrint className="inline-block" />
            </button>
          </div>
        </div>

        {/* Summary Table */}
        <div dir="rtl" className="mb-4">
          <h2 className="font-bold mb-2">ملخص التصفية</h2>
          <div className="overflow-x-auto">
            {" "}
            {/* Ensures the table is scrollable on small screens */}
            <table
              dir="rtl"
              className="min-w-full table-auto border-collapse border border-gray-200"
            >
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    مجموع مبالغ المشتريات{" "}
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    مجموع المبلغ المدفوع
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    مجموع الذمم
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    عدد الفواتير المدفوعة
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    عدد الفواتير المدفوعة جزئياً
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    عدد الفوتير الذمم
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {totalAmount}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {totalPaidAmount}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {totalRemainingAmount}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {paymentStatusCounts.Paid}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {paymentStatusCounts.Partial}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {paymentStatusCounts.Debt}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Table Section */}
      {/* Table Section */}
      <div className="container mx-auto px-4">
        {/* Responsive Table Section */}
        <div className="overflow-x-auto ">
          {" "}
          {/* Set max height and enable vertical scrolling */}
          <table
            dir="rtl"
            id="printTable"
            className="min-w-full table-auto border-collapse border border-gray-200"
          >
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">اسم الصنف</th>
                <th className="border border-gray-300 px-4 py-2">
                  {" "}
                  القيمة الفاتورة
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  {" "}
                  القيمة المدفوعة
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  {" "}
                  القيمة المتبقية
                </th>
                <th className="border border-gray-300 px-4 py-2">حالة الدفع</th>
                <th className="border border-gray-300 px-4 py-2">المورد</th>
                <th className="border border-gray-300 px-4 py-2">رقم الشيك</th>
                <th className="border border-gray-300 px-4 py-2">التاريخ</th>
                <th className="border border-gray-300 px-4 py-2 no-print"></th>
              </tr>
            </thead>
            <tbody>
              {currentPurchases.map((purchase) => (
                <tr key={purchase.id} className="bg-white hover:bg-gray-50">
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
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {purchase.payment_status === "Partial"
                      ? "جزئي"
                      : purchase.payment_status === "Paid"
                      ? "مدفوع"
                      : "دين"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {purchase.supplier}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {purchase.check_number || "-"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {new Date(purchase.date).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center no-print">
                    <button
                      className="bg-orange-500 hover:bg-orange-600 ml-2 text-white font-bold py-1 px-2 rounded"
                      onClick={() => handleEditClick(purchase)}
                    >
                      تعديل
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2"
                      onClick={() => confirmDelete(purchase)}
                    >
                      حذف
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
            message={
              <>
                هل أنت متأكد من حذف فاتورة مشتريات {recordToDelete?.name} بتاريخ{" "}
                {recordToDelete?.amount ?? "unknown"}؟ <br />
                بقيمة{" "}
                {recordToDelete?.date
                  ? format(parseISO(recordToDelete.date), "yyyy-MM-dd")
                  : "unknown date"}
                ؟
              </>
            }
          />
        </div>

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
      </div>

      {/* Edit Drawer */}
      <EditDrawer title="تعديل فاتورة مشتريات" open={open} setOpen={setOpen}>
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
