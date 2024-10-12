"use client";

import { useState, useCallback, useEffect } from "react";
import AddDrawer from "../components/Drawers/add";
import { FaPlus } from "react-icons/fa";
import SalaryAccountTable from "./salaryAccountTable";

export default function SalaryAccount() {
  const [open, setOpen] = useState(false);
  const [costsSalaryAccount, setSalaryAccount] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(""); // Add state for selected period
  const [period, setPeriod] = useState(""); // The current period to filter data

  const refetchSalaryAccount = useCallback(() => {
    setSalaryAccount((prev) => !prev);
  }, []);

  // Fetch salary accounts based on selected period
  useEffect(() => {
    if (selectedPeriod) {
      setPeriod(selectedPeriod); // Update the period to trigger fetch
    }
  }, [selectedPeriod]);

  return (
    <div>
      <div className="flex justify-center mb-4 mx-12">
        
        <h2 className="text-2xl font-semibold text-center my-4">حساب الرواتب </h2>
       
      </div>

      {/* Add period filter */}
     

      {/* Pass the period to the SalaryAccountTable */}
      <SalaryAccountTable costsTypesUpdated={costsSalaryAccount} refetchCostsTypes={refetchSalaryAccount}  />

     
    </div>
  );
}
