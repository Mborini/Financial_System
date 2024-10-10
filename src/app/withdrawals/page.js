"use client";

import { useState, useCallback } from "react";
import AddDrawer from "../components/Drawers/add";
import { FaPlus } from "react-icons/fa";

import WithdrawalsTable from "./WithdrawalsTable";
import WithdrawalsForm from "./WithdrawalsForm";


export default function Withdrawals() {
  const [open, setOpen] = useState(false);
  const [costsTypesUpdated, setCostsTypesUpdated] = useState(false);

  const refetchCostsTypes = useCallback(() => {
    setCostsTypesUpdated((prev) => !prev);
  }, []);

  return (
    <div>
      <div className="flex justify-between mb-4 mx-12">
        <h1></h1>
        <h2 className="text-2xl font-semibold text-center my-4">Withdrawals Table</h2>
        <button onClick={() => setOpen(true)}>
          <FaPlus size={25} color="blue" />
        </button>
      </div>

      <WithdrawalsTable costsTypesUpdated={costsTypesUpdated} refetchCostsTypes={refetchCostsTypes} />

      <AddDrawer title="Add Withdrawal" open={open} setOpen={setOpen}>
        <WithdrawalsForm refetchCosts={refetchCostsTypes} setOpen={setOpen} />
      </AddDrawer>
    </div>
  );
}
