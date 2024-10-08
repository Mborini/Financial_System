'use client';
import { useState, useCallback } from 'react';
import VacationForm from './VacationForm';
import VacationsTable from './VacationsTable';
import AddDrawer from '../components/Drawers/add';
import { FaPlus } from 'react-icons/fa';

export default function VacationManagement() {
  const [open, setOpen] = useState(false);
  const [vacationsUpdated, setVacationsUpdated] = useState(false);

  const refetchVacations = useCallback(() => {
    setVacationsUpdated((prev) => !prev);
  }, []);

  return (
    <div>
      <div className="flex justify-between mb-4 mx-12">
        <h1></h1>
        <h2 className="text-2xl font-semibold text-center my-4">Vacation Management</h2>
        <button onClick={() => setOpen(true)}>
          <FaPlus size={25} color="blue" />
        </button>
      </div>

      <VacationsTable vacationsUpdated={vacationsUpdated} refetchVacations={refetchVacations} />

      <AddDrawer title="Add Vacation" open={open} setOpen={setOpen}>
        <VacationForm refetchVacations={refetchVacations} setOpen={setOpen} />
      </AddDrawer>
    </div>
  );
}
