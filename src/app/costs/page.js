"use client";

import { useState, useCallback } from "react";
import CostForm from "./CostForm";
import CostTable from "./CostTable";
import AddDrawer from "../components/Drawers/add";
import { FaPlus } from "react-icons/fa";
export default function Costs() {
  const [open, setOpen] = useState(false);
  const [costsUpdated, setCostsUpdated] = useState(false); // Trigger re-fetching of table data

  // Define the refetchCosts function to toggle costsUpdated state
  const refetchCosts = useCallback(() => {
    setCostsUpdated((prev) => !prev);
  }, []);

  return (
    <div>
      <div className="flex justify-between mb-4 mx-12">
        <h1></h1>
        <h2 className="text-2xl font-semibold text-center my-4">Cost Table</h2>
        <button
          onClick={() => setOpen(true)}
          
        >
          <FaPlus size={25} color="blue"/>
        </button>
      </div>

      <CostTable costsUpdated={costsUpdated} refetchCosts={refetchCosts} />

      <AddDrawer title="Add Cost" open={open} setOpen={setOpen}>
        <CostForm refetchCosts={refetchCosts} setOpen={setOpen} />
      </AddDrawer>
    </div>
  );
}
