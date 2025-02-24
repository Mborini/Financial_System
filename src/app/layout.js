"use client";

import {
  
  FaChevronUp,
  FaChevronDown,
 
} from "react-icons/fa";
import "./globals.css";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FaBars, FaTimes } from "react-icons/fa";
import { usePathname } from "next/navigation";
import CheckPassword from "./checkpassword";

export default function Layout({ children }) {
  const pathname = usePathname();
 
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => setIsOpen(!isOpen);
  const [isExpandedCosts, setIsExpandedCosts] = useState(false); // State for expanding/collapsing
  const [isExpanded, setIsExpanded] = useState(false); // State for expanding/collapsing
  const toggleExpandCosts = () => setIsExpandedCosts(!isExpandedCosts);
  const toggleExpand = () => setIsExpanded(!isExpanded);
  const originalSizeMB = 500; // الحجم الأصلي لقاعدة البيانات
  const [DbSize, setDbSize] = useState("0 kB"); // القيمة الافتراضية
  const [sizeInMB, setSizeInMB] = useState(0); // الحجم المحول إلى MB
  const [percentage, setPercentage] = useState(0); // النسبة المئوية

  useEffect(() => {
    const fetchDbSize = async () => {
      try {
        const response = await fetch("/api/dbSize");
        const data = await response.json();
        console.log("API Response:", data);
        const x = data[0].pg_size_pretty;
        // تحديث حالة DbSize بالبيانات الجديدة
        setDbSize(x); // افترض أن API يعيد حجمًا مثل "10232 kB"

        // تحويل الحجم من kB إلى MB
        const sizeInKB = parseInt(x, 10); // استخراج الرقم من النص
        const calculatedSizeInMB = sizeInKB / 1024; // التحويل إلى MB

        // حساب النسبة المئوية
        const calculatedPercentage = (
          (calculatedSizeInMB / originalSizeMB) *
          100
        ).toFixed(2);

        // تحديث الحالات
        setSizeInMB(calculatedSizeInMB);
        setPercentage(calculatedPercentage);
      } catch (error) {
        console.error("Error fetching DbSize:", error);
      }
    };

    fetchDbSize();
  }, []); // [] يعني أن useEffect سيعمل مرة واحدة عند التحميل
  if (pathname === "/") { 
return (
    <html lang="en">
      <title>Financial Management System</title>
      <body className="flex">

  
    <main className="flex-1 mt-16 ">
      {children}
    </main>
    </body>
  </html>)
  }
  return (
    <html lang="en">
      <title>Financial Management System</title>
      <body className="">
        {/* Sidebar */}
        <div className="relative z-10">
          {/* Navbar */}
          <nav className="bg-gray-800 p-4 fixed w-full z-10 top-0 left-0 shadow-md">
            <div className="flex items-center justify-between">
              <div className="text-white font-bold text-xl">
                نظام الادارة المالية
              </div>

              <div className="">
                <button onClick={toggleDrawer}>
                  <FaBars className="text-white text-2xl" />
                </button>
              </div>
            </div>
          </nav>

          {/* Drawer for mobile */}
          <div
            className={`fixed top-5 right-0 w-72 h-full  overflow-y-auto bg-gray-800 text-white transform transition-transform duration-300 ${
              isOpen ? "translate-x-0" : "translate-x-full"
            }`}
          > 
            <div dir="rtl" className="flex flex-col space-y-4 p-4 z-10 mt-14  ">              <a
                href="/statistics"
                className="flex items-center justify-between text-white bg-gray-700 rounded-lg px-4 py-2 w-full transition-colors duration-200 hover:bg-gray-600 hover:border-gray-500"
                >
                الاحصائيات العامة
              </a>
              <div className="space-y-2">
                <button
                  className="flex items-center justify-between text-white bg-gray-700 rounded-lg px-4 py-2 w-full transition-colors duration-200 hover:bg-gray-600 hover:border-gray-500"
                  onClick={toggleExpandCosts}
                >
                  <span>إدارة التكاليف</span>
                  {isExpandedCosts ? (
                    <FaChevronUp className="text-gray-400" />
                  ) : (
                    <FaChevronDown className="text-gray-400" />
                  )}
                </button>

                {isExpandedCosts && (
                  <ul className="pr-4 space-y-2">
                    <li className="flex items-center text-white">
                      <a
                        href="/costs"
                        className="text-white bg-gray-700  rounded-lg px-2 py-1 transition-colors duration-200 hover:bg-gray-600 hover:border-gray-500"
                      >
                        التكاليف
                      </a>
                    </li>
                    <li className="flex items-center text-white">
                      <a
                        href="/costsTypes"
                        className="text-white bg-gray-700  rounded-lg px-2 py-1 transition-colors duration-200 hover:bg-gray-600 hover:border-gray-500"
                      >
                        انواع التكاليف
                      </a>
                    </li>
                  </ul>
                )}
              </div>
              <div className="pl-1 space-y-4">
                <button
                  className="flex items-center justify-between text-white bg-gray-700 rounded-lg px-4 py-2 w-full transition-colors duration-200 hover:bg-gray-600 hover:border-gray-500"
                  onClick={toggleExpand}
                >
                  الموظفين{" "}
                  {isExpanded ? (
                    <FaChevronUp className="mr-2" />
                  ) : (
                    <FaChevronDown className="mr-2" />
                  )}
                </button>
                {isExpanded && (
                  <ul className="pr-4  space-y-4">
                    <li>
                      <a
                        href="/attendance"
                        className="text-white bg-gray-700  rounded-lg px-2 py-1 transition-colors duration-200 hover:bg-gray-600 hover:border-gray-500"
                        >
                        الدوام اليومي
                      </a>
                    </li>
                    <li>
                      <a
                        href="/PayingSalaries"
                        className="text-white bg-gray-700  rounded-lg px-2 py-1 transition-colors duration-200 hover:bg-gray-600 hover:border-gray-500"
                      >
                        دفع الرواتب {/*  */}
                      </a>
                    </li>
                    <li>
                      <a
                        href="/employees"
                        className="text-white bg-gray-700  rounded-lg px-2 py-1 transition-colors duration-200 hover:bg-gray-600 hover:border-gray-500"
                      >
                        ادارة الموظفين{/*  */}
                      </a>
                    </li>
                    <li>
                      <a
                        href="/deductions"
                        className="text-white bg-gray-700  rounded-lg px-2 py-1 transition-colors duration-200 hover:bg-gray-600 hover:border-gray-500"
                      >
                        الخصومات على الرواتب{" "}
                      </a>
                    </li>
                    <li>
                      <a
                        href="/withdrawals"
                        className="text-white bg-gray-700  rounded-lg px-2 py-1 transition-colors duration-200 hover:bg-gray-600 hover:border-gray-500"
                      >
                        السحوبات الشهرية من الرواتب{/*  */}
                      </a>
                    </li>
                    <li>
                      <a
                        href="/salaryAccount"
                        className="text-white bg-gray-700  rounded-lg px-2 py-1 transition-colors duration-200 hover:bg-gray-600 hover:border-gray-500"
                      >
                        التقرير الشهري لحساب الرواتب{" "}
                      </a>
                    </li>
                    <li>
                      <a
                        href="/overTime"
                        className="text-white bg-gray-700  rounded-lg px-2 py-1 transition-colors duration-200 hover:bg-gray-600 hover:border-gray-500"
                      >
                        تقرير العمل الإضافي {/* Over Time */}
                      </a>
                    </li>
                    <li>
                      <a
                        href="/staffFood"
                        className="text-white bg-gray-700  rounded-lg px-2 py-1 transition-colors duration-200 hover:bg-gray-600 hover:border-gray-500"
                      >
                        وجبات الطعام {/* Staff Food */}
                      </a>
                    </li>
                    <li>
                      <a
                        href="/Vacations"
                        className="text-white bg-gray-700  rounded-lg px-2 py-1 transition-colors duration-200 hover:bg-gray-600 hover:border-gray-500"
                      >
                        الإجازات و العطل{/* Vacations */}
                      </a>
                    </li>
                  </ul>
                )}
              </div>
              <a
                href="/sales"
                className="flex items-center justify-between text-white bg-gray-700 rounded-lg px-4 py-2 w-full transition-colors duration-200 hover:bg-gray-600 hover:border-gray-500"
              >
                المبيعات
              </a>
              <a
                href="/purchases"
                className="flex items-center justify-between text-white bg-gray-700 rounded-lg px-4 py-2 w-full transition-colors duration-200 hover:bg-gray-600 hover:border-gray-500"
              >
                المشتريات
              </a>
              <a
                href="/MonthlySummary"
                className="flex items-center justify-between text-white bg-gray-700 rounded-lg px-4 py-2 w-full transition-colors duration-200 hover:bg-gray-600 hover:border-gray-500"
              >
                التقرير الشهري
              </a>
              <a
                href="/suppliers"
                className="flex items-center justify-between text-white bg-gray-700 rounded-lg px-4 py-2 w-full transition-colors duration-200 hover:bg-gray-600 hover:border-gray-500"
              >
                الموردين
              </a>
              <a
                href="/Deposits"
                className="flex items-center justify-between text-white bg-gray-700 rounded-lg px-4 py-2 w-full transition-colors duration-200 hover:bg-gray-600 hover:border-gray-500"
              >
                الايداعات
              </a>
              <a
                href="/cashWithdrawals"
                className="flex items-center justify-between text-white bg-gray-700 rounded-lg px-4 py-2 w-full transition-colors duration-200 hover:bg-gray-600 hover:border-gray-500"
              >
                السحوبات النقدية
              </a>
            </div>
            <div className="absolute  p-4">
              DB Storage: {sizeInMB.toFixed(2)} MB From {originalSizeMB} MB (
              {percentage}%)
            </div>
          </div>
        </div>
<>
<CheckPassword /> Check the password cookie on every page

</>
        {/* Main content */}
        <main className="flex-1 mt-16 ">{children}</main>
      </body>
    </html>
  );
}
