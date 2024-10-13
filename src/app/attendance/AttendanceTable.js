import { useEffect, useState } from "react";
import AddDrawer from "../components/Drawers/add";
import CheckOutForm from "./CheckOutForm";
import { FaPrint } from "react-icons/fa";

// Utility function to format datetime
function formatDateTime(dateTime) {
  const date = new Date(dateTime);
  return date.toLocaleString(); // Formats to local date and time format
}

// Utility function to format hours and minutes correctly
function formatHoursAndMinutes(totalHours) {
  const hours = Math.floor(totalHours); // Get the integer part for hours
  const minutes = Math.round((totalHours % 1) * 60); // Get the remainder and convert to minutes
  return `${hours} hours, ${minutes} minutes`;
}

// Get the current date in YYYY-MM-DD format
function getCurrentDate() {
  const today = new Date();
  return today.toISOString().split("T")[0]; // Returns YYYY-MM-DD
}

export default function AttendanceTable({
  attendanceUpdated,
  refetchAttendance,
}) {
  const [attendance, setAttendance] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null); // Store record for check-out
  const [openDrawer, setOpenDrawer] = useState(false); // Control drawer visibility
  const [selectedDate, setSelectedDate] = useState(getCurrentDate()); // Filter date (default: current day)
  const [filteredAttendance, setFilteredAttendance] = useState([]); // Store filtered attendance

  // Fetch attendance data when the component mounts or attendanceUpdated changes
  useEffect(() => {
    const fetchAttendance = async () => {
      const response = await fetch("/api/attendance");
      const data = await response.json();
      setAttendance(data);
    };
    fetchAttendance();
  }, [attendanceUpdated]);

  // Filter attendance based on the selected date
  useEffect(() => {
    const filtered = attendance.filter((record) => {
      const checkInDate = new Date(record.check_in).toISOString().split("T")[0]; // Extract only the date
      return checkInDate === selectedDate; // Compare with selected date
    });
    setFilteredAttendance(filtered);
  }, [attendance, selectedDate]);

  // Handle Date Change
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleOpenDrawer = (record) => {
    if (record.employee_id) {
      setSelectedRecord(record); // Store the record with employee_id
      setOpenDrawer(true); // Open the drawer
    } else {
      console.error("employee_id is missing in the selected record");
    }
  };

  const handleDelete = async (id) => {
    const response = await fetch("/api/attendance", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      refetchAttendance();
    } else {
      console.error("Error deleting record");
    }
  };

  const handleCheckOutSubmit = async (dateTime) => {
    if (!selectedRecord || !selectedRecord.employee_id || !dateTime) {
      console.error("Missing data during check-out");
      return;
    }

    const response = await fetch("/api/attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        employee_id: selectedRecord.employee_id,
        action: "check_out",
        checkOutDateTime: dateTime, // Pass the datetime value
      }),
    });

    if (response.ok) {
      setOpenDrawer(false);
      refetchAttendance();
    } else {
      console.error("Error during check-out");
    }
  };

  const handlePrint = (e) => {
    e.preventDefault();
    const printContents = document.getElementById("printTable").outerHTML;
    const originalContents = document.body.innerHTML;

    // Replace body content with just the table for printing
    document.body.innerHTML = printContents;

    window.print(); // Trigger the print dialog

    // Restore original contents after printing
    document.body.innerHTML = originalContents;
    window.location.reload(); // Optional: reload the page to ensure state is restored
  };

  return (
    <div>
      <div className="container mx-auto px-4">
        <div className="mb-4 flex justify-between">
          <div>
            <label
              htmlFor="dateFilter"
              className="block text-sm font-medium text-gray-700"
            >
              Filter by Date
            </label>
            <input
              type="date"
              id="dateFilter"
              value={selectedDate}
              onChange={handleDateChange}
              className="mt-1 block w-25 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <button
              onClick={handlePrint}
              className="bg-blue-500 mt-2 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              <FaPrint className="inline-block" />
            </button>
          </div>
        </div>

        {/* Attendance Table */}
        <div dir="rtl" className="overflow-x-auto">
          <table
            id="printTable"
            className="min-w-full table-auto border-collapse border border-gray-200"
          >
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">اسم الموظف</th>
                <th className="border border-gray-300 px-4 py-2">وقت الحضور</th>
                <th className="border border-gray-300 px-4 py-2">
                  وقت الانصراف
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  ساعات العمل
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  ساعات العمل الاضافية
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  الساعات غير العامل بها
                </th>{" "}
                {/* Non-working hours */}
                <th className="border border-gray-300 px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((record) => {
                const standardHours = 10; // Standard working hours per shift
                const actualWorkHours = record.work_hours || 0; // Actual work hours

                const nonWorkingHours = Math.max(
                  0,
                  standardHours - actualWorkHours
                ); // Calculate non-working hours

                return (
                  <tr key={record.id} className="bg-white hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">
                      {record.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.check_in
                        ? formatDateTime(record.check_in)
                        : "---"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.check_out
                        ? formatDateTime(record.check_out)
                        : "---"}
                    </td>
                    <td dir="ltr" className="border border-gray-300 px-4 py-2">
                      {record.work_hours != null &&
                      !isNaN(Number(record.work_hours))
                        ? formatHoursAndMinutes(record.work_hours)
                        : "---"}
                    </td>
                    <td dir="ltr" className="border border-gray-300 px-4 py-2">
                      {record.overtime_hours != null &&
                      !isNaN(Number(record.overtime_hours))
                        ? formatHoursAndMinutes(record.overtime_hours)
                        : "---"}
                    </td>
                    <td
                      dir="ltr"
                      className="border border-gray-300 px-4 py-2 text-center"
                    >
                      {formatHoursAndMinutes(nonWorkingHours)}{" "}
                      {/* Display Non-Working Hours */}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {!record.check_out && (
                        <button
                          className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
                          onClick={() => handleOpenDrawer(record)}
                        >
                          اضافة وقت الانصراف
                        </button>
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.check_out && (
                        <button
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                          onClick={() => handleDelete(record.id)}
                        >
                          حذف{" "}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Drawer for check-out form */}
      <AddDrawer
        title="Check-out Time"
        open={openDrawer}
        setOpen={setOpenDrawer}
      >
        {selectedRecord && (
          <CheckOutForm
            selectedRecord={selectedRecord}
            onSubmit={handleCheckOutSubmit}
            setOpenDrawer={setOpenDrawer}
          />
        )}
      </AddDrawer>
    </div>
  );
}
