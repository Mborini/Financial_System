import React, { useEffect, useState } from "react";
import EditEmployee from "./EditEmployee";
import EditDrawer from "../components/Drawers/edit";
import ConfirmModal from "../components/Modals/confirmDelete";
import {
  FaEdit,
  FaTrash,
  FaTrashAlt,
  FaUserCheck,
  FaUserLock,
  FaUserSlash,
} from "react-icons/fa";
import ConfirmAlertModal from "../components/Modals/confirmAlert";

// Utility function to format dates to DD/MM/YYYY
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

function EmployeesTable({ costsTypesUpdated, refetchCostsTypes }) {
  const [costsTypes, setCostsTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [costsTypesPerPage] = useState(10);
  const [selectedCost, setSelectedCost] = useState(null);
  const [open, setOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null); // Track the record to delete
  const [modalType, setModalType] = useState(""); // Track whether it's a delete or disable modal
  const [alertMessage, setAlertMessage] = useState(null);
  // Fetch data when component mounts or costsTypesUpdated changes
  useEffect(() => {
    const fetchCostsTypes = async () => {
      try {
        const response = await fetch("/api/employees");
        const data = await response.json();
        setCostsTypes(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching cost data:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchCostsTypes();
  }, [costsTypesUpdated]);

  // Handle opening the drawer and setting the selected cost
  const handleEditClick = (cost) => {
    setSelectedCost(cost); // Set the selected cost for editing
    setOpen(true); // Open the drawer
  };

  // Handle showing the modal for deletion or disabling
  const showConfirmationModal = (employee, actionType) => {
    setRecordToDelete(employee);
    setModalType(actionType);
    setIsModalOpen(true); // Open confirmation modal
  };

  const handleConfirmDelete = async () => {
    if (!isContractEndDatePassed(recordToDelete.contract_end_date)) {
      setAlertMessage("لا يمكن حذف الموظف لأن تاريخ نهاية العقد لم يحن بعد");
      setIsModalOpen(false);

      return;
    }

    try {
      const response = await fetch("/api/employees", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: recordToDelete.id }),
      });

      if (response.ok) {
        // Update the list and close the modal after successful deletion
        setCostsTypes(
          costsTypes.filter((cost) => cost.id !== recordToDelete.id)
        );
        refetchCostsTypes();
        setIsModalOpen(false);
      } else {
        console.error("Error deleting employee");
        setAlertMessage("تعذر حذف الموظف. حدث خطأ ما.");
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      setAlertMessage("حدث خطأ أثناء محاولة الحذف. يرجى المحاولة لاحقاً.");
    }
  };

  const isContractEndDatePassed = (endDate) => {
    const contractEndDate = new Date(endDate);
    const currentDate = new Date();
    return contractEndDate <= currentDate;
  };

  // Confirm disabling the employee
  const handleConfirmDisable = async () => {
    try {
      const response = await fetch("/api/employees", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: recordToDelete.id, status: false }), // Set status to false to deactivate
      });

      if (response.ok) {
        refetchCostsTypes(); // Refetch the employees to reflect the change
      } else {
        console.error("Error disabling employee");
      }
    } catch (error) {
      console.error("Error disabling employee:", error);
    } finally {
      setIsModalOpen(false); // Close modal after action
    }
  };

  // Handle modal confirmation based on action type
  const handleConfirm = () => {
    if (modalType === "delete") {
      handleConfirmDelete();
    } else if (modalType === "disable") {
      handleConfirmDisable();
    }
  };

  if (loading) {
    return <div className="text-center text-blue-600">Loading...</div>; // Show loading message while data is being fetched
  }

  if (error) {
    return <div className="text-center text-red-600">Error: {error}</div>; // Show error message if there is any
  }

  // Calculate the current records for the current page
  const indexOfLastCost = currentPage * costsTypesPerPage;
  const indexOfFirstCost = indexOfLastCost - costsTypesPerPage;
  const currentCostsTypes = costsTypes.slice(indexOfFirstCost, indexOfLastCost);

  // Get total pages
  const totalPages = Math.ceil(costsTypes.length / costsTypesPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div dir="rtl" className="container mx-auto px-4  ">
      <div className="overflow-x-auto ">
        <table
          dir="rtl"
          className="min-w-full table-auto border-collapse border border-gray-200 "
        >
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">اسم الموظف</th>
              <th className="border border-gray-300 px-4 py-2">الراتب</th>
              <th className="border border-gray-300 px-4 py-2">
                تاريخ بداية العقد
              </th>
              <th className="border border-gray-300 px-4 py-2">
                تاريخ نهاية العقد
              </th>
              <th className="border border-gray-300 px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {currentCostsTypes.map((costType) => (
              <tr key={costType.id} className="bg-white hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {costType.name}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {costType.salary}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {formatDate(costType.contract_start_date)}
                </td>
                <td
                  className={`border border-gray-300 px-4 py-2 text-center ${
                    new Date(costType.contract_end_date) < new Date()
                      ? "text-red-500"
                      : ""
                  }`}
                >
                  {formatDate(costType.contract_end_date)}
                </td>

                <td className="border border-gray-300 px-4 py-2 text-center">
                  <div className="flex justify-center">
                    {/* Conditionally render the button based on the employee status */}
                    {costType.status ? (
                      <button
                        className="  ml-2 text-violet-500 font-bold py-1 px-2 rounded"
                        onClick={() =>
                          showConfirmationModal(costType, "disable")
                        }
                      >
                        <FaUserCheck title="انهاء خدمات" />{" "}
                      </button>
                    ) : (
                      <button
                        className=" text-gray-500 font-bold py-1 px-2 rounded ml-2 cursor-not-allowed"
                        disabled
                      >
                        <FaUserSlash title="منتهي الخدمة" />
                      </button>
                    )}
                    <button
                      className=" ml-2 text-orange-500 font-bold py-1 px-2 rounded"
                      onClick={() => handleEditClick(costType)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className=" text-red-500 font-bold py-1 px-2 rounded ml-2"
                      onClick={() => showConfirmationModal(costType, "delete")}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title={modalType === "delete" ? "تأكيد الحذف" : "تأكيد إنهاء الخدمة"}
        message={
          modalType === "delete"
            ? `هل أنت متأكد من حذف ${recordToDelete?.name}؟`
            : `هل أنت متأكد من انهاء خدمات ${recordToDelete?.name}؟ لن يظهر الموظف في القوائم بعد الآن.`
        }
      />
      {alertMessage && (
        <ConfirmAlertModal
          isOpen={!!alertMessage}
          onClose={() => setAlertMessage(null)}
          title="تنبيه"
          body="لا يمكن الحذف"
          message={alertMessage}
          onConfirm={() => setAlertMessage(null)} // Close the alert
        />
      )}
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

      <EditDrawer title="تعديل معلومات الموظف" open={open} setOpen={setOpen}>
        <EditEmployee
          selectedCost={selectedCost}
          refetchCosts={refetchCostsTypes}
          setOpen={setOpen}
        />
      </EditDrawer>
    </div>
  );
}

export default EmployeesTable;
