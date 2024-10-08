import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Import the CSS for the date picker
import { FaPrint } from 'react-icons/fa';

export default function VacationsTable({ vacationsUpdated, refetchVacations }) {
  const [vacations, setVacations] = useState([]); // Initialize as an empty array
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(''); // String for dropdown values
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Fetch employees and vacations on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/employees');
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    const fetchVacations = async () => {
      try {
        const response = await fetch('/api/vacations');
        const data = await response.json();

        if (Array.isArray(data)) {
          setVacations(data); // Only set vacations if the data is an array
        } else {
          setVacations([]); // Fallback to an empty array if the response is not an array
        }

        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchEmployees();
    fetchVacations();
  }, [vacationsUpdated]);

  const handlePrint = () => {
    const printContents = document.getElementById('printTable').outerHTML;
    const originalContents = document.body.innerHTML;

    // Replace body content with just the table for printing
    document.body.innerHTML = printContents;

    window.print(); // Trigger the print dialog

    // Restore original contents after printing
    document.body.innerHTML = originalContents;
    window.location.reload(); // Optional: reload the page to ensure state is restored
  };
  const handleDelete = async (id) => {
    try {
      const response = await fetch('/api/vacations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        refetchVacations();
      }
    } catch (error) {
      console.error('Error deleting vacation:', error);
    }
  };

  const handleDateChange = (update) => {
    const [start, end] = update;
    setStartDate(start);
    setEndDate(end);
  };

  // Ensure that vacations is always an array
  const filteredVacations = Array.isArray(vacations)
    ? vacations.filter((vacation) => {
        const vacationDate = new Date(vacation.vacation_date);
        const isEmployeeMatch =
          selectedEmployee === '' || vacation.employee_name === selectedEmployee; // Match by employee name
        const isDateInRange =
          (!startDate || vacationDate >= startDate) &&
          (!endDate || vacationDate <= endDate);

        return isEmployeeMatch && isDateInRange;
      })
    : [];

  const vacationCount = filteredVacations.length; // Calculate the count of filtered vacations

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4">
      {/* Filters */}
      <div className="flex justify-between items-center mb-4">
        {/* Employee Dropdown */}
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All Employees</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.name}>
              {employee.name}
            </option>
          ))}
        </select>

        {/* Date Range Picker */}
        <div>
          <DatePicker
            selected={startDate}
            onChange={handleDateChange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            isClearable
            className="border border-gray-300 p-2 rounded"
            dateFormat="yyyy/MM/dd"
            placeholderText="Select date range"
          />
        </div>
        <button
          onClick={handlePrint}
          className="bg-blue-500 mt-2 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          <FaPrint className="inline-block " />
        </button>
      </div>

      {/* Vacation Count Label */}
      <div className="mb-4 text-xl font-semibold">
        {selectedEmployee
          ? `Total Vacations for ${selectedEmployee}: ${vacationCount}`
          : 'Please select an employee to see total vacations'}
      </div>

      {/* Vacations Table */}
      <table className="min-w-full table-auto border-collapse border border-gray-200" id='printTable'>
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">Employee Name</th>
            <th className="border border-gray-300 px-4 py-2">Vacation Date</th>
            <th className="border border-gray-300 px-4 py-2">Created At</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredVacations.map((vacation) => (
            <tr key={vacation.id} className="bg-white hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2 text-center">{vacation.employee_name}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {format(new Date(vacation.vacation_date), 'yyyy/MM/dd')}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {format(new Date(vacation.created_at), 'yyyy/MM/dd')}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2"
                  onClick={() => handleDelete(vacation.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
