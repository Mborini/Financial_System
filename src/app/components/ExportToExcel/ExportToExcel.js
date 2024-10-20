// components/ExportToExcel.js
import React from 'react';
import { FaFileExcel } from 'react-icons/fa';
import * as XLSX from 'xlsx'; // Import XLSX

const ExportToExcel = ({ data ,fileName}) => {
  const handleExport = () => {
    const file_name = `${fileName}.xlsx`;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Deductions');

    // Save to file
    XLSX.writeFile(wb, file_name);
  };

  return (
    <button
      onClick={handleExport}
      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
    >
      <FaFileExcel className="inline-block mr-2" />
      
    </button>
  );
};

export default ExportToExcel;
