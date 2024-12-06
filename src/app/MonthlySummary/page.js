"use client";
import { useState, useEffect } from "react";
import { FaMinusCircle, FaPlusCircle, FaPrint } from "react-icons/fa";

const MonthlySummary = () => {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState("2024-10"); // Example initial period

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/monthlySummary?period=${period}`);
      const result = await response.json();
      setData(result);
      
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]); // Fetch data whenever the period changes

  if (!data) {
    return <div>Loading...</div>;
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

  return (
    <div className="justify-around flex mx-24">
      {/* Date Picker */}
      <div className="mt-4 print-hidden">
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
          <h1 className="text-2xl font-bold">LECHE</h1>
          <p className="text-sm text-gray-600 mt-2">
            <strong>الملخص المالي لتاريخ : {period}</strong>
          </p>
        </div>

        <div className="space-y-4" dir="rtl">
          <div className="space-y-4" dir="rtl">
            <div className="flex justify-between">
              <span className="font-semibold flex  items-center gap-1">
                <FaPlusCircle className="text-green-500" /> مجموع المبيعات :
              </span>

              <span className="font-medium text-green-500">
                ${totalSales.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold flex items-center gap-1">
                <FaPlusCircle className="text-green-500" />
                مجموع الخصومات على الرواتب :
              </span>
              <span className="font-medium text-green-500">
                ${totalDeductions.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold flex items-center gap-1">
                <FaPlusCircle className="text-green-500" />
                مجموع خصومات الإجازات :
              </span>
              <span className="font-medium text-green-500">
                ${totalVacationDeductions.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold flex items-center gap-1">
                <FaPlusCircle className="text-green-500" />
                مجموع خصم الساعات غير العامل بها :
              </span>
              <span className="font-medium text-green-500">
                ${totalNonWorkingHours.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold flex items-center gap-1">
                <FaPlusCircle className="text-green-500" />
                مجموع خصم وجبات طعام الموظفين :
              </span>
              <span className="font-medium text-green-500">
                ${totalStaffFood.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold flex items-center gap-1">
                <FaMinusCircle className="text-red-500" />
                مجموع المشتريات :
              </span>
              <span className="font-medium text-red-500 ">
                ${totalPurchases.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold flex items-center gap-1">
                <FaMinusCircle className="text-red-500" />
                مجموع التكاليف :
              </span>
              <span className="font-medium text-red-500">
                ${totalCosts.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold flex items-center gap-1">
                <FaMinusCircle className="text-red-500" />
                مجموع المبلغ لساعات العمل الإضافية :
              </span>
              <span className="font-medium text-red-500">
                ${totalPaymentAmountForOverTime.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold flex items-center gap-1">
                <FaMinusCircle className="text-red-500" />
                مجموع الرواتب المدفوعة :
              </span>
              <span className="font-medium text-red-500">
                ${payingSalaries.toFixed(2)}
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
              ${totalSummary.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div className="mt-4 px-12 print-hidden">
        <button
          onClick={handlePrint}
          className="bg-blue-500 mt-2 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded print-button"
        >
          <FaPrint className="inline-block" />
        </button>
      </div>
    </div>
  );
};

export default MonthlySummary;
