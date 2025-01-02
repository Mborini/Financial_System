"use client";

import { useState, useEffect } from "react";
import { FaMinusCircle, FaPlusCircle, FaPrint, FaSpinner, FaDownload } from "react-icons/fa";
import * as htmlToImage from 'html-to-image';

const MonthlySummary = () => {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [isDownloading, setIsDownloading] = useState(false); // State to track download process
  
  const fetchData = async () => {
    try {
      const response = await fetch(`/api/monthlySummary?period=${period}`);
      const result = await response.json();
      setData(result);
      console.log("Data fetched successfully:", result); // Logging fetched data
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  if (!data) {
    return <div className="flex justify-center mt-5">
      <FaSpinner className="animate-spin text-blue-600" size={30} />
    </div>;
  }

  const {
    totalSales,
    totalDeductions,
    totalStaffFood,
    totalPurchases,
    totalCosts,
    payingSalaries,
    totalVacationDeductions,
    totalNonWorkingHours,
    totalPaymentAmountForOverTime,
    totalSummary,
  } = data;

  const handleDateChange = (event) => {
    const selectedPeriod = event.target.value;
    setPeriod(selectedPeriod); // Update the period when the date is changed
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = () => {
    const summaryElement = document.querySelector('#monthly-summary');
    
    // Hide buttons and date picker with smooth transition
    setIsDownloading(true); // Trigger state change to hide elements

    htmlToImage.toPng(summaryElement)
      .then(function (dataUrl) {
        const link = document.createElement('a');
        link.download = `monthly_summary_${period}.png`;
        link.href = dataUrl;
        link.click();
      })
      .finally(() => {
        // Show buttons and date picker after the download
        setIsDownloading(false); // Reset the state to show the elements again
      })
      .catch(function (error) {
        console.error('Error generating image:', error);
        setIsDownloading(false); // Ensure state resets if there's an error
      });
  };

  const formatCurrency = (value) => {
    return typeof value === 'number' ? value.toFixed(2) : '0.00';
  };

  return (
    <div className="justify-around flex mx-24" id="monthly-summary">
      {/* Date Picker */}
      <div className={`mt-4 print-hidden ${isDownloading ? "hidden" : ""}`}>
        <input
          id="period"
          type="month"
          value={period}
          onChange={handleDateChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Print Summary Section */}
      <div className="max-w-md mx-auto mt-5 bg-white border w-96 border-gray-300 rounded-lg shadow-md p-4 print-summary">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">LECHE قهوة </h1>
          <p className="text-sm text-gray-600 mt-2">
            <strong>الملخص المالي لتاريخ : {period}</strong>
          </p>
        </div>
        <div className="space-y-4" dir="rtl">
          <div className="space-y-4" dir="rtl">
            <div className="flex justify-between">
              <span className="font-semibold flex items-center gap-1">
                <FaPlusCircle className="text-green-500" /> مجموع المبيعات :
              </span>
              <span className="font-medium text-green-500">
                ${formatCurrency(totalSales)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold flex items-center gap-1">
                <FaPlusCircle className="text-green-500" />
                مجموع الخصومات على الرواتب :
              </span>
              <span className="font-medium text-green-500">
                ${formatCurrency(totalDeductions)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold flex items-center gap-1">
                <FaPlusCircle className="text-green-500" />
                مجموع خصومات الإجازات :
              </span>
              <span className="font-medium text-green-500">
                ${formatCurrency(totalVacationDeductions)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold flex items-center gap-1">
                <FaPlusCircle className="text-green-500" />
                مجموع خصم الساعات غير العامل بها :
              </span>
              <span className="font-medium text-green-500">
                ${formatCurrency(totalNonWorkingHours)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold flex items-center gap-1">
                <FaPlusCircle className="text-green-500" />
                مجموع خصم وجبات طعام الموظفين :
              </span>
              <span className="font-medium text-green-500">
                ${formatCurrency(totalStaffFood)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold flex items-center gap-1">
                <FaMinusCircle className="text-red-500" />
                مجموع المشتريات :
              </span>
              <span className="font-medium text-red-500 ">
                ${formatCurrency(totalPurchases)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold flex items-center gap-1">
                <FaMinusCircle className="text-red-500" />
                مجموع التكاليف :
              </span>
              <span className="font-medium text-red-500">
                ${formatCurrency(totalCosts)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold flex items-center gap-1">
                <FaMinusCircle className="text-red-500" />
                مجموع المبلغ لساعات العمل الإضافية :
              </span>
              <span className="font-medium text-red-500">
                ${formatCurrency(totalPaymentAmountForOverTime)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold flex items-center gap-1">
                <FaMinusCircle className="text-red-500" />
                مجموع الرواتب المدفوعة :
              </span>
              <span className="font-medium text-red-500">
                ${formatCurrency(payingSalaries)}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-6 border-t pt-4 text-center" dir="rtl">
          <div className="flex justify-between font-semibold">
            <span>ملخص الايراد</span>
            <span
              className={totalSummary > 0 ? "text-green-500" : "text-red-500"}
            >
              ${formatCurrency(totalSummary)}
            </span>
          </div>
        </div>
      </div>

      {/* Print and Download Buttons */}
      <div className={`mt-4 px-12 print-hidden ${isDownloading ? "hidden" : ""}`}>
        <button
          onClick={handlePrint}
          className="bg-blue-500 mt-2 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded print-button"
        >
          <FaPrint className="inline-block" />
        </button>
        <button
          onClick={handleDownloadImage}
          className="bg-green-500 mt-2 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-4"
        >
          <FaDownload className="inline-block" />
        </button>
      </div>
    </div>
  );
};

export default MonthlySummary;
