"use client";

import { useState, useCallback } from "react";
import AddDrawer from "../components/Drawers/add";
import { FaPlus } from "react-icons/fa";
import CostsTypesForm from './CostsTypesForm';
import CostsTypesTable from "./costsTypesTable";

export default function CostsTypes() {
  const [open, setOpen] = useState(false);
  const [costsTypesUpdated, setCostsTypesUpdated] = useState(false);

  const refetchCostsTypes = useCallback(() => {
    setCostsTypesUpdated((prev) => !prev);
  }, []);

  return (
    <div>
      <div className="flex justify-between mb-4 mx-12">
        <h1></h1>
        <h2 className="text-2xl font-semibold text-center my-4">إدارة أنواع الكلف التشغيلية</h2>
        <button onClick={() => setOpen(true)}>
          <FaPlus size={25} color="blue" />
        </button>
      </div>

      <CostsTypesTable costsTypesUpdated={costsTypesUpdated} refetchCostsTypes={refetchCostsTypes} />

      <AddDrawer title="اضافة نوع كلفة تشغيلية جديد" open={open} setOpen={setOpen}>
        <CostsTypesForm refetchcostsTypes={refetchCostsTypes} setOpen={setOpen} />
      </AddDrawer>
    </div>
  );
}
