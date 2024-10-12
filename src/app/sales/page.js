"use client";

import { useState, useCallback } from "react";
import { FaPlus } from "react-icons/fa";
import SalesForm from "./SalesForm";
import AddDrawer from "../components/Drawers/add";
import SalesTable from "./SalesTable";

export default function Withdrawals() {
  const [open, setOpen] = useState(false);
  const [salesUpdated, setSalesUpdated] = useState(false);

  const refetchSales = useCallback(() => {
    setSalesUpdated((prev) => !prev); // Toggle to refetch sales
  }, []);

  return (
    <div>
      <div className="flex justify-between mb-4 mx-12">
        <h1></h1>
        <h2 className="text-2xl font-semibold text-center my-4">المبيعات اليومية</h2>
        <button onClick={() => setOpen(true)}>
          <FaPlus size={25} color="blue" />
        </button>
      </div>

      {/* Pass salesUpdated and refetchSales */}
      <SalesTable salesUpdated={salesUpdated} refetchSales={refetchSales} />

      <AddDrawer title="اضافة مبيعات " open={open} setOpen={setOpen}>
        <SalesForm refetchSales={refetchSales} setOpen={setOpen} />
      </AddDrawer>
    </div>
  );
}
