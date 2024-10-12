"use client";

import { useState, useCallback } from "react";
import StaffFoodTable from "./StaffFoodTable";
import StaffFoodForm from "./StaffFoodForm";
import AddDrawer from "../components/Drawers/add"; // Assuming you are using a drawer component for the form
import { FaPlus } from "react-icons/fa";

export default function StaffFoodPage() {
  const [open, setOpen] = useState(false);
  const [foodUpdated, setFoodUpdated] = useState(false);

  // A callback to refetch the food entries when an action is completed (add, edit, delete)
  const refetchFood = useCallback(() => {
    setFoodUpdated((prev) => !prev);
  }, []);

  return (
    <div>
      {/* Header Section */}
      <div className="flex justify-between mb-4 mx-12">
        <h1></h1>
        <h1 className="text-2xl font-semibold text-center my-4">وجبات الموظفين</h1>
        {/* Add Button */}
        <button onClick={() => setOpen(true)}>
          <FaPlus size={25} color="blue" />
        </button>
      </div>

      {/* Table Component */}
      <StaffFoodTable foodUpdated={foodUpdated} refetchFood={refetchFood} />

      {/* Add Form Drawer */}
      <AddDrawer title="اضافة وجبة جديدة"
       open={open} setOpen={setOpen}>
        <StaffFoodForm refetchFood={refetchFood} setOpen={setOpen} />
      </AddDrawer>
    </div>
  );
}
