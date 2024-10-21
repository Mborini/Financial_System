import { useEffect, useState } from "react";
import AddDrawer from "../components/Drawers/add";
import CheckOutForm from "./CheckOutForm";
import { FaPrint } from "react-icons/fa";
import ConfirmModal from "../components/Modals/confirmDelete";
import ConfirmAlertModal from "../components/Modals/confirmAlert";
import ExportToExcel from "../components/ExportToExcel/ExportToExcel";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(true);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [alertsData, setAlertsData] = useState([]); // New state for alerts

  // Fetch attendance data when the component mounts or attendanceUpdated changes
  useEffect(() => {
    fetchAlerts();
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
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const handleOpenDrawer = (record) => {
    if (record.employee_id) {
      setSelectedRecord(record); // Store the record with employee_id
      setOpenDrawer(true); // Open the drawer
    } else {
      console.error("employee_id is missing in the selected record");
    }
  };

  const confirmDelete = (record) => {
    setRecordToDelete(record);
    setIsModalOpen(true); // Open the confirmation modal
  };

  const handleDeleteConfirmed = async () => {
    if (!recordToDelete) return;

    const response = await fetch("/api/attendance", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: recordToDelete.id }),
    });

    if (response.ok) {
      refetchAttendance();
    } else {
      console.error("Error deleting record");
    }

    // Close modal and clear the selected record
    setIsModalOpen(false);
    setRecordToDelete(null);
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
  const fetchAlerts = async () => {
    const response = await fetch("/api/alerts");
    const data = await response.json();
    setAlertsData(data);
  };


  const alertsConfirmed = () => {
    setIsAlertModalOpen(false);
  };

  const customizeDataForExport = (data) => {
    return data.map((Att) => ({
      "اسم الموظف": Att.name,
      "وقت الحضور": Att.check_in
        ? formatDateTime(Att.check_in)
        : "---",
      "وقت الانصراف": Att.check_out
        ? formatDateTime(Att.check_out)
        : "---",
      "ساعات العمل": Att.work_hours != null &&
      !isNaN(Number(Att.work_hours))  
        ? formatHoursAndMinutes(Att.work_hours)
        : "---",
      "ساعات العمل الاضافية": Att.overtime_hours != null &&
      !isNaN(Number(Att.overtime_hours))
        ? formatHoursAndMinutes(Att.overtime_hours)
        : "---",
      "الساعات غير العامل بها": Att.work_hours != null &&
      !isNaN(Number(Att.work_hours))
        ? formatHoursAndMinutes(10 - Att.work_hours)
        : "---",



    }));
  };

  const customizedData = customizeDataForExport(filteredAttendance);
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
      {alertsData.length > 0 && (
      <ConfirmAlertModal
        isOpen={isAlertModalOpen}
        onConfirm={alertsConfirmed}
title="تنبيه"
body="يوجد موظفين لم يتم ادخال تاريخ الانصراف"
        //map on alertsData to display the message
        message={alertsData.map((alert) => (
          //list the name of the employees who didn't confirm their attendance
          //firmat date 
          <ul key={alert.id}>
            <li>{alert.name},{" "} تاريخ الحضور: {formatDate(alert.check_in)
            }</li>
          </ul>
        ))}
      />
    )}
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
          <div className="flex items-center gap-2">
          <ExportToExcel data={customizedData} fileName="الدوام" />

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
                <th className="border border-gray-300 px-4 py-2">
               الاجر مقابل ساعات العمل الاضافية 
                </th>{" "}

                {/* Non-working hours */}
                <th className="border border-gray-300 px-4 py-2"></th>
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
                    <td
                      dir="ltr"
                      className="border border-gray-300 px-4 py-2 text-center"  
                    >
                      {record.payment_amount != null &&
                      !isNaN(Number(record.payment_amount))
                        ? record.payment_amount
                        : "JOD 0.00"}
                     
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
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                        onClick={() => confirmDelete(record)}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <ConfirmModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleDeleteConfirmed}
            title="تأكيد الحذف"
            message={`هل انت متاكد من حذف حضور   ${recordToDelete?.name}؟`}
          />
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
