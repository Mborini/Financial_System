import { useState, useEffect } from "react";

export default function EditCostTypesForm({
  selectedCost,
  refetchCosts,
  setOpen,
}) {
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [supplier, setSupplier] = useState(""); // This will store the selected supplier
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch("/api/suppliers");
        const data = await response.json();
        if (data && Array.isArray(data)) {
          setSuppliers(data);
        } else {
          setError("Failed to load suppliers.");
        }
        setLoading(false);
      } catch (error) {
        setError("Failed to load suppliers.");
        setLoading(false);
      }
    };
    fetchSuppliers();
 
    if (selectedCost) {
      setDescription(selectedCost.description);
      setName(selectedCost.name);
      setSupplier(selectedCost.supplier); // Ensure this matches the supplier's id
    }
 
  // Fetch the cost types when the component mounts
  
    const fetchTypes = async () => {
      try {
        const response = await fetch("/api/costsTypes");
        const data = await response.json();
        setTypes(data);
        setLoading(false);
      } catch (error) {
        setError("Failed to load cost types.");
        setLoading(false);
      }
    };

    fetchTypes();
  
 }, [selectedCost]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/costsTypes", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description,
        name,
        id: selectedCost.id,
        supplier, // sending selected supplier
      }),
    });

    if (response.ok) {
      // Reset form after successful submission
      setDescription("");
      setName("");
      setSupplier(""); // Reset supplier selection

      // Close the drawer and refetch the table
      setOpen(false); // Close the drawer
      refetchCosts(); // Call refetch after successful submission
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form fields */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          اسم النوع
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="supplier"
          className="block text-sm font-medium text-gray-700"
        >
          المورد
        </label>
        <select
          value={supplier} // This ensures the selected supplier is shown in the dropdown
          onChange={(e) => setSupplier(e.target.value)} // Handle change
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Select Supplier</option>
          {suppliers.map((supplierItem) => (
            <option key={supplierItem.id} value={supplierItem.id}>
              {supplierItem.name} {/* Adjust based on the data structure */}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          الوصف
        </label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <button
          type="submit"
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white  bg-orange-400 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          حفظ و تعديل
        </button>
      </div>
    </form>
  );
}
