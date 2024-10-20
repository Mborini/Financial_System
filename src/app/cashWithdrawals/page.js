'use client';
import { useState, useCallback } from 'react';
import AddDrawer from '../components/Drawers/add';
import { FaPlus } from 'react-icons/fa';
import CashWithdrawalsTable from './CashWithdrawalsTable';
import CashWithdrawalsForm from './CashWithdrawalsForm';

export default function CashWithdrawals() {
  const [open, setOpen] = useState(false);
  const [cashWithdrawalsUpdated, setCashWithdrawalsUpdated] = useState(false);

  const refetchCashWithdrawals = useCallback(() => {
    setCashWithdrawalsUpdated((prev) => !prev);
  }, []);

  return (
    <div>
      <div className="flex justify-between mb-4 mx-12">
      <h2></h2>
        <h2 className="text-2xl font-semibold text-center my-4">
          سحوبات نقدية
        </h2>
        <button onClick={() => setOpen(true)}>
          <FaPlus size={25} color="blue" />
        </button>
      </div>

      <CashWithdrawalsTable 
        cashWithdrawalsUpdated={cashWithdrawalsUpdated} 
        refetchCashWithdrawals={refetchCashWithdrawals} 

      />
      
      <AddDrawer title="إضافة سحب نقدي" open={open} setOpen={setOpen}>
        <CashWithdrawalsForm refetchCashWithdrawals={refetchCashWithdrawals} setOpen={setOpen} />
      </AddDrawer>
    </div>
  );
}
