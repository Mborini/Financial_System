import { useState } from "react";

export default function CheckOutForm({ selectedRecord, onSubmit, setOpenDrawer }) {
  const [dateTime, setDateTime] = useState(""); // Check-out DateTime state
  const [error, setError] = useState(""); // Error message state

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    const checkInDate = new Date(selectedRecord.check_in); // Get check-in date
    const checkOutDate = new Date(dateTime); // Convert selected check-out datetime

    // Validation: Check if check-out is later than check-in
    if (checkOutDate <= checkInDate) {
      setError("Check-out time must be later than the check-in time.");
      return;
    }

    // Proceed if the validation passes
    if (dateTime) {
      onSubmit(dateTime); // Pass the selected datetime value to the parent
    } else {
      console.error("DateTime is missing for check-out");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="datetime" className="block text-sm font-medium text-gray-700">
         وقت الخروج للموظف:
          {selectedRecord.name}
        </label>
        <input
          type="datetime-local"
          id="datetime"
          value={dateTime}
          onChange={(e) => {
            setDateTime(e.target.value); // Update check-out datetime state
            setError(""); // Clear error when user changes the input
          }}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>} {/* Display validation error */}

      <div>
        <button
          type="submit"
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-400 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
        حفظ و تسجيل وقت الخروج
        </button>
        <button
          type="button"
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 mt-4"
          onClick={() => setOpenDrawer(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
