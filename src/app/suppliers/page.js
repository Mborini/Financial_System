"use client";

import { useState, useCallback } from "react";
import AddDrawer from "../components/Drawers/add";
import { FaPlus } from "react-icons/fa";
import SuppliersTable from "./SuppliersTable";
import SuppliersForm from "./SuppliersForm";


export default function Suppliers() {
  const [open, setOpen] = useState(false);
  const [costsTypesUpdated, setCostsTypesUpdated] = useState(false);

  const refetchCostsTypes = useCallback(() => {
    setCostsTypesUpdated((prev) => !prev);
  }, []);

  return (
    <div>
      <div className="flex justify-between mb-4 mx-12">
        <h1></h1>
        <h2 className="text-2xl font-semibold text-center my-4">الموردين</h2>
        <button onClick={() => setOpen(true)}>
          <FaPlus size={25} color="blue" />
        </button>
      </div>

      <SuppliersTable costsTypesUpdated={costsTypesUpdated} refetchCostsTypes={refetchCostsTypes} />

      <AddDrawer title="اضافة مورد جديد" open={open} setOpen={setOpen}>
        <SuppliersForm refetchcostsTypes={refetchCostsTypes} setOpen={setOpen} />
      </AddDrawer>
    </div>
  );
}
