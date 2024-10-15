import React, { useEffect, useState } from 'react';
import EditDrawer from '../components/Drawers/edit';
import EditSuppliers from './EditSuppliers';
import ConfirmModal from '../components/Modals/confirmDelete';
import { FaEdit, FaTrash } from 'react-icons/fa';


function SuppliersTable({ costsTypesUpdated, refetchCostsTypes }) {
  const [costsTypes, setcostsTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [costsTypesPerPage] = useState(10);
  const [selectedCost, setSelectedCost] = useState(null);
  const [open, setOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null); // Track the record to delete

  // Fetch data when component mounts or costsTypesUpdated changes
  useEffect(() => {
    const fetchcostsTypes = async () => {
      try {
        const response = await fetch('/api/suppliers');
        const data = await response.json();
        setcostsTypes(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cost data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchcostsTypes();
  }, [costsTypesUpdated]);

  // Handle opening the drawer and setting the selected cost
  const handleEditClick = (cost) => {
    setSelectedCost(cost); // Set the selected cost for editing
    setOpen(true); // Open the drawer
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

 
  // Handle deletion of a cost
  const handleDelete = async (id) => {
    try {
      const response = await fetch('/api/suppliers', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        // Remove the deleted cost from the state
        setcostsTypes(costsTypes.filter((cost) => cost.id !== id));
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

  // Calculate the current records for the current page
  const indexOfLastCost = currentPage * costsTypesPerPage;
  const indexOfFirstCost = indexOfLastCost - costsTypesPerPage;
  const currentcostsTypes = costsTypes.slice(indexOfFirstCost, indexOfLastCost);

  // Get total pages
  const totalPages = Math.ceil(costsTypes.length / costsTypesPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto px-4">
      <table dir='rtl' className="min-w-full table-auto border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">اسم المورد</th>
            <th className="border border-gray-300 px-4 py-2">عنوان المورد</th>
            <th className="border border-gray-300 px-4 py-2">رقم الهاتف</th>
           
            <th className="border border-gray-300 px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {currentcostsTypes.map((costType) => (
            <tr key={costType.id} className="bg-white hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2 text-center">{costType.name}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">{costType.address}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">{costType.phonenumber}</td>
             
              <td className="border border-gray-300 px-4  py-2 text-center">
              <div className="flex gap-2 justify-center">
                <button
                        className=" text-orange-500 font-bold py-1 px1- rounded "
                        onClick={() => handleEditClick(costType)}
                >
                        <FaEdit className="inline-block"/>{" "}

                </button>
                <button
                  onClick={() => confirmDelete(costType)}
                  className=" text-red-500 font-bold py-1 px1- rounded "

                >
                  <FaTrash className="inline-block" />
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
          message={`هل أنت متأكد من حذف المورد ${recordToDelete?.name} ؟`}
        />
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

      <EditDrawer title="تعديل معلومات المورد" open={open} setOpen={setOpen}>
      <EditSuppliers selectedSupplier={selectedCost} refetchSuppliers={refetchCostsTypes} setOpen={setOpen} />
      </EditDrawer>
    </div>
  );
}

export default SuppliersTable;
