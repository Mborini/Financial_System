"use client";
import { useState, useEffect } from "react";

export default function EmployeeForm({ refetchcostsTypes, setOpen }) {
  const [salary, setsalary] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/employees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ salary, name }),
    });

    if (response.ok) {
      setsalary("");

      setName("");

      setOpen(false); // Close the drawer
      refetchcostsTypes(); // Refetch the table data
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
          اسم الموظف
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ادخل الاسم"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* salary field */}
      <div>
        <label
          htmlFor="ادخل الراتب"
          className="block text-sm font-medium text-gray-700"
        >
          الراتب
        </label>
        <input
          id="salary"
          type="text"
          value={salary}
          onChange={(e) => setsalary(e.target.value)}
          placeholder="Enter salary"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Type field */}

      {/* Submit button */}
      <div>
        <button
          type="submit"
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          ضافة موظف{" "}
        </button>
      </div>
    </form>
  );
}
