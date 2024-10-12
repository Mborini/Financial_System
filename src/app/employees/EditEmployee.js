import { useState, useEffect } from "react";

export default function EditEmployee({ selectedCost, refetchCosts, setOpen }) {
 
  const [salary, setSalary] = useState("");

  const [name, setName] = useState("");

  
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 

  // Populate the form fields when the selectedCost changes
  useEffect(() => {
    if (selectedCost) {
   
      setSalary(selectedCost.salary);
    
      setName(selectedCost.name);
     
    }
  }, [selectedCost]);

  // Fetch the cost types when the component mounts
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await fetch("/api/employees");
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
    const response = await fetch("/api/employees", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        
        salary: salary, 
        
        name, 
       
        id: selectedCost.id 
      }),
    });

    if (response.ok) {
      // Reset form after successful submission
      
      setSalary("");
      
      setName("");
      

      // Close the drawer and refetch the table
      setOpen(false);  // Close the drawer
      refetchCosts();  // Call refetch after successful submission
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form fields */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          اسم الموظف
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ادخل اسم الموظف"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
          الراتب
        </label>
        <input
          id="salary"
          type="text"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          placeholder="ادخل راتب الموظف"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <button
          type="submit"
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
         حفظ و تعديل
        </button>
      </div>
    </form>
  );
}
