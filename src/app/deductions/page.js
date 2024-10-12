
'use client'
import { useState, useCallback } from "react";
import AddDrawer from "../components/Drawers/add";
import { FaPlus } from "react-icons/fa";
import DeductionTable from "./deductionTable";
import DeductionForm from "./deductionForm";

export default function Deductions() {
  const [open, setOpen] = useState(false);
  const [deductionsUpdated, setDeductionsUpdated] = useState(false);
  const [selectedDeduction, setSelectedDeduction] = useState(null); // Manage selected deduction

  const refetchDeductions = useCallback(() => {
    setDeductionsUpdated((prev) => !prev);
  }, []);

  return (
    <div>
      <div className="flex justify-between mb-4 mx-12">
        <h2 className="text-2xl font-semibold text-center my-4">Deductions Table</h2>
        <button onClick={() => { setOpen(true); setSelectedDeduction(null); }}>
          <FaPlus size={25} color="blue" />
        </button>
      </div>

      {/* Pass deductionsUpdated, refetchDeductions, and setSelectedDeduction */}
      <DeductionTable
        deductionsUpdated={deductionsUpdated}
        refetchDeductions={refetchDeductions}
        setSelectedDeduction={setSelectedDeduction}
        setOpen={setOpen} // Open the form drawer when editing
      />

      <AddDrawer title={selectedDeduction ? "Edit Deduction" : "Add Deduction"} open={open} setOpen={setOpen}>
        <DeductionForm
          refetchDeductions={refetchDeductions}
          setOpen={setOpen}
          selectedDeduction={selectedDeduction} // Pass the selected deduction for editing
        />
      </AddDrawer>
    </div>
  );
}
