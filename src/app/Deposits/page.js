"use client";

import { useState, useCallback } from "react";
import AddDrawer from "../components/Drawers/add";
import { FaPlus } from "react-icons/fa";
import DepositsTable from "./DepositsTable";
import DepositForm from "./Depositform";

export default function StaffFoodPage() {
  const [open, setOpen] = useState(false);
  const [depositsUpdated, setDepositsUpdated] = useState(false);

  const refetchDeposits = useCallback(() => {
    setDepositsUpdated((prev) => !prev);
  }, []);

  return (
    <div>
      <div className="flex justify-between mb-4 mx-12">
        <h1></h1>
        <h1 className="text-2xl font-semibold text-center my-4">الايداعات البنكية</h1>
        <button onClick={() => setOpen(true)}>
          <FaPlus size={25} color="blue" />
        </button>
      </div>

      <DepositsTable depositsUpdated={depositsUpdated} refetchDeposits={refetchDeposits} />

      <AddDrawer title="إضافة معلومات عملية جديد" open={open} setOpen={setOpen}>
        <DepositForm refetchDeposits={refetchDeposits} setOpen={setOpen} />
      </AddDrawer>
    </div>
  );
}
