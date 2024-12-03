import { useState } from "react";

export default function EmployeeForm({ refetchcostsTypes, setOpen }) {
  const [salary, setSalary] = useState("");
  const [name, setName] = useState("");
  const [contractStartDate, setContractStartDate] = useState("");
  const [contractEndDate, setContractEndDate] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        salary,
        name,
        contract_start_date: contractStartDate,
        contract_end_date: contractEndDate,
      }),
    });

    if (response.ok) {
      setOpen(false);
      refetchcostsTypes();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow-md rounded-md">
      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          اسم الموظف
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ادخل الاسم"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Salary Field */}
      <div>
        <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
          الراتب
        </label>
        <input
          id="salary"
          type="text"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          placeholder="ادخل الراتب"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Contract Start Date Field */}
      <div>
        <label htmlFor="contractStartDate" className="block text-sm font-medium text-gray-700">
          تاريخ بدء العقد
        </label>
        <input
          id="contractStartDate"
          type="date"
          value={contractStartDate}
          onChange={(e) => setContractStartDate(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Contract End Date Field */}
      <div>
        <label htmlFor="contractEndDate" className="block text-sm font-medium text-gray-700">
          تاريخ نهاية العقد
        </label>
        <input
          id="contractEndDate"
          type="date"
          value={contractEndDate}
          onChange={(e) => setContractEndDate(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="contractEndDate" className="block text-sm font-medium text-red-700">
* ملاحظة: سيتم اعتبار أول يوم للعمل هو اليوم الذي يلي تاريخ بدء سريان العقد    </label>
        
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          إضافة موظف
        </button>
      </div>
    </form>
  );
}
