import { useState, useEffect } from "react";

export default function EditSuppliers({
  selectedSupplier,
  refetchSuppliers,
  setOpen,
}) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phonenumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Populate the form fields when the selectedSupplier changes
  useEffect(() => {
    if (selectedSupplier) {
      setName(selectedSupplier.name);
      setAddress(selectedSupplier.address);
      setPhoneNumber(selectedSupplier.phonenumber);
    }
  }, [selectedSupplier]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/suppliers", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: selectedSupplier.id,
        name,
        address,
        phonenumber,
      }),
    });

    if (response.ok) {
      // Reset form after successful submission
      setName("");
      setAddress("");
      setPhoneNumber("");

      // Close the drawer and refetch the table
      setOpen(false); // Close the drawer
      refetchSuppliers(); // Call refetch after successful submission
    } else {
      setError("Failed to update supplier.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name field */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          اسم المورد
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter supplier name"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Address field */}
      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700"
        >
          عنوان المورد
        </label>
        <input
          id="address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter supplier address"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Phone number field */}
      <div>
        <label
          htmlFor="phonenumber"
          className="block text-sm font-medium text-gray-700"
        >
          رقم الهاتف{" "}
        </label>
        <input
          id="phonenumber"
          type="text"
          value={phonenumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Enter supplier phone number"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Submit button */}
      <div>
        <button
          type="submit"
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          حفظ وتعديل
        </button>
      </div>

      {/* Error display */}
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </form>
  );
}
