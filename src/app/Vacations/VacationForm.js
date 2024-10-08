import { useState, useEffect } from 'react';

export default function VacationForm({ refetchVacations, setOpen }) {
  const [vacationDate, setVacationDate] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch employees when the component mounts
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/employees');
        const data = await response.json();
        setEmployees(data);
        setLoading(false);
      } catch (error) {
        setError('Error fetching employees');
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('/api/vacations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ employee_id: employeeId, vacation_date: vacationDate }),
    });

    if (response.ok) {
      setVacationDate('');
      setEmployeeId('');
      setOpen(false); // Close the drawer
      refetchVacations(); // Refetch the vacation data
    }
  };

  if (loading) {
    return <div>Loading employees...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Employee Dropdown */}
      <div>
        <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
          Select Employee
        </label>
        <select
          id="employeeId"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        >
          <option value="">Select an employee</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name}
            </option>
          ))}
        </select>
      </div>

      {/* Vacation Date field */}
      <div>
        <label htmlFor="vacationDate" className="block text-sm font-medium text-gray-700">
          Vacation Date
        </label>
        <input
          id="vacationDate"
          type="date"
          value={vacationDate}
          onChange={(e) => setVacationDate(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
      </div>

      {/* Submit button */}
      <div>
        <button
          type="submit"
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600"
        >
          Add Vacation
        </button>
      </div>
    </form>
  );
}
