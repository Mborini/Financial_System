import { useState, useEffect } from "react";
import { format } from 'date-fns'; // Import format from date-fns

export default function EditForm({ selectedCost, refetchCosts, setOpen }) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [types, setTypes] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 

  // Populate the form fields when the selectedCost changes
  useEffect(() => {
    if (selectedCost) {
      setAmount(selectedCost.amount);
      setDescription(selectedCost.description);
      setDate(format(new Date(selectedCost.date), 'yyyy-MM-dd')); // Format the date for input[type="date"]
      setName(selectedCost.name);
      setType(selectedCost.type.toLowerCase()); 
    }
  }, [selectedCost]);

  // Fetch the cost types when the component mounts
  useEffect(() => {
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
  }, []); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/costs", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        amount, 
        description, 
        date, 
        name, 
        type: type.toLowerCase(), 
        id: selectedCost.id 
      }),
    });

    if (response.ok) {
      // Reset form after successful submission
      setAmount("");
      setDescription("");
      setDate("");
      setName("");
      setType("");

      // Close the drawer and refetch the table
      setOpen(false);  // Close the drawer
      refetchCosts();  // Refetch the table data
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form fields */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
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
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Date
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Amount
        </label>
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
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
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Type
        </label>
        <select
          id="type"
          value={type}  
          onChange={(e) => setType(e.target.value.toLowerCase())} 
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Select type</option>
          {loading ? (
            <option disabled>Loading...</option>
          ) : error ? (
            <option disabled>{error}</option>
          ) : (
            types.map((t) => (
              <option key={t.id} value={t.name.toLowerCase()}>
                {t.name}
              </option>
            ))
          )}
        </select>
      </div>

      <div>
        <button
          type="submit"
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Edit Cost
        </button>
      </div>
    </form>
  );
}
