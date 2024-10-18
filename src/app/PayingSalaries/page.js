"use client";

import { useState, useCallback } from "react";

import AddDrawer from "../components/Drawers/add"; // Assuming you are using a drawer component for the form
import { FaPlus } from "react-icons/fa";
import PayingSalariesTable from "./PayingSalariesTable";
import PayingSalariesForm from "./PayingSalariesForm";

export default function PayingSalaries() {
  const [open, setOpen] = useState(false);
  const [salariesUpdated, setSalariesUpdated] = useState(false);

  // A callback to refetch the salary entries when an action is completed (add, edit, delete)
  const refetchSalaries = useCallback(() => {
    setSalariesUpdated((prev) => !prev);
  }, []);

  return (
    <div>
      {/* Header Section */}
      <div className="flex justify-between mb-4 mx-12">
        <h1></h1>
        <h1 className="text-2xl font-semibold text-center my-4">دفع الرواتب</h1>
        {/* Add Button */}
        <button onClick={() => setOpen(true)}>
          <FaPlus size={25} color="blue" />
        </button>
      </div>

      {/* Table Component */}
      <PayingSalariesTable
        salariesUpdated={salariesUpdated}
        refetchSalaries={refetchSalaries}
      />

      {/* Add Form Drawer */}
      <AddDrawer title="دفع راتب جديد" open={open} setOpen={setOpen}>
        <PayingSalariesForm refetchFood={refetchSalaries} setOpen={setOpen} />
      </AddDrawer>
    </div>
  );
}
