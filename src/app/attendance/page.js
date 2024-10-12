"use client";

import { useState, useCallback } from "react";
import AddDrawer from "../components/Drawers/add"; // Assuming you have this drawer component already
import { FaPlus } from "react-icons/fa";
import AttendanceTable from "./AttendanceTable"; // The table that displays attendance records
import AttendanceForm from "./AttendanceForm"; // The form to check-in/check-out employees

export default function Attendance() {
  const [open, setOpen] = useState(false);
  const [attendanceUpdated, setAttendanceUpdated] = useState(false); // Trigger re-fetching of attendance data

  // Define the refetchAttendance function to toggle attendanceUpdated state
  const refetchAttendance = useCallback(() => {
    setAttendanceUpdated((prev) => !prev);
  }, []);

  return (
    <div>
      <div className="flex justify-between mb-4 mx-12">
        <h1></h1>
        <h2 className="text-2xl font-semibold text-center my-4">
          الدوام اليومي
        </h2>
        <button onClick={() => setOpen(true)}>
          <FaPlus size={25} color="blue" />
        </button>
      </div>

      {/* AttendanceTable will fetch and display attendance records */}
      <AttendanceTable
        attendanceUpdated={attendanceUpdated}
        refetchAttendance={refetchAttendance}
      />

      {/* AddDrawer opens a form to submit check-in/check-out */}
      <AddDrawer title="  تسجيل الحضور" open={open} setOpen={setOpen}>
        <AttendanceForm
          refetchAttendance={refetchAttendance}
          setOpen={setOpen}
        />
      </AddDrawer>
    </div>
  );
}
