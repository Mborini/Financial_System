"use client";

import {
  FaMoneyBill,
  FaShoppingCart,
  FaListAlt,
  FaTruck,
  FaUsers,
  FaWallet,
  FaClock,
  FaUtensils,
  FaPlaneDeparture,
  FaCog,
  FaChartBar,
  FaPlusCircle,
  FaMoneyCheckAlt,
  FaBuilding,
  FaCoins,
  FaFileArchive,
  FaHandHoldingUsd,
  FaCashRegister,
  FaBalanceScaleLeft,
  FaRegBuilding,
  FaChevronUp,
  FaChevronDown,
  FaMinus,
} from "react-icons/fa";
import "./globals.css";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FaBars, FaTimes } from "react-icons/fa";
export default function Layout({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => setIsOpen(!isOpen);
  const [isExpanded, setIsExpanded] = useState(false); // State for expanding/collapsing

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <html lang="en">
      <title>HotDog</title>
      <body className="flex">
        {/* Sidebar */}
        <div className="relative">
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
            <div dir="rtl" className="flex flex-col space-y-4 p-4 z-10 mt-16  ">
              <a
                href="/"
                className="text-white border-neutral-200 border rounded-lg hover:bg-gray-700 p-1"
              >
                الاحصائيات العامة
              </a>
              <div className="space-y-2">
                <button
                  className="flex items-center text-white  border-neutral-200 border rounded-lg hover:bg-gray-700 p-1  w-full"
                  onClick={toggleExpand}
                >
                  <span> ادارة التكاليف</span>
                  {isExpanded ? (
                    <FaChevronUp className="mr-2" />
                  ) : (
                    <FaChevronDown className="mr-2" />
                  )}
                </button>
                {isExpanded && (
                  <ul className="pr-4  space-y-4">
                  <li className="text-white flex items-center">
                  <FaMinus className="flex ml-2"/>                      <a
                        href="/costs"
                        className="text-white  border-neutral-200 border rounded-lg hover:bg-gray-700 p-1 mb-3"
                      >
                        التكاليف
                      </a>
                    </li>
                    <li className="text-white flex items-center">
                     <FaMinus className="flex ml-2"/> <a
                        href="/costsTypes"
                        className="text-white  border-neutral-200 border rounded-lg hover:bg-gray-700 p-1"
                      >
                        انواع التكاليف
                      </a>
                    </li>
                  </ul>
                )}
              </div>
              <div className="pl-1 space-y-4">
                <button
                  className="flex items-center text-white  border-neutral-200 border rounded-lg hover:bg-gray-700 p-1  w-full"
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
                        className="text-white  border-neutral-200 border rounded-lg hover:bg-gray-700 p-1 mb-3"
                      >
                        الدوام اليومي
                      </a>
                    </li>
                    <li>
                      <a
                        href="/PayingSalaries"
                        className="text-white  border-neutral-200 border rounded-lg hover:bg-gray-700 p-1"
                      >
                        دفع الرواتب {/*  */}
                      </a>
                    </li>
                    <li>
                      <a
                        href="/employees"
                        className="text-white  border-neutral-200 border rounded-lg hover:bg-gray-700 p-1"
                      >
                        ادارة الموظفين{/*  */}
                      </a>
                    </li>
                    <li>
                      <a
                        href="/deductions"
                        className="text-white  border-neutral-200 border rounded-lg hover:bg-gray-700 p-1"
                      >
                        الخصومات على الرواتب{" "}
                      </a>
                    </li>
                    <li>
                      <a
                        href="/withdrawals"
                        className="text-white  border-neutral-200 border rounded-lg hover:bg-gray-700 p-1"
                      >
                        السحوبات الشهرية من الرواتب{/*  */}
                      </a>
                    </li>
                    <li>
                      <a
                        href="/salaryAccount"
                        className="text-white  border-neutral-200 border rounded-lg hover:bg-gray-700 p-1"
                      >
                        التقرير الشهري لحساب الرواتب{" "}
                      </a>
                    </li>
                    <li>
                      <a
                        href="/overTime"
                        className="text-white  border-neutral-200 border rounded-lg hover:bg-gray-700 p-1"
                      >
                        تقرير العمل الإضافي {/* Over Time */}
                      </a>
                    </li>
                    <li>
                      <a
                        href="/staffFood"
                        className="text-white  border-neutral-200 border rounded-lg hover:bg-gray-700 p-1"
                      >
                        وجبات الطعام {/* Staff Food */}
                      </a>
                    </li>
                    <li>
                      <a
                        href="/Vacations"
                        className="text-white  border-neutral-200 border rounded-lg hover:bg-gray-700 p-1"
                      >
                        الإجازات و العطل{/* Vacations */}
                      </a>
                    </li>
                  </ul>
                )}
              </div>

              <a
                href="/sales"
                className="text-white  border-neutral-200 border rounded-lg hover:bg-gray-700 p-1"
              >
                المبيعات
              </a>
              <a
                href="/purchases"
                className="text-white  border-neutral-200 border rounded-lg hover:bg-gray-700 p-1"
              >
                المشتريات
              </a>
              <a
                href="/MonthlySummary"
                className="text-white  border-neutral-200 border rounded-lg hover:bg-gray-700 p-1"
              >
                التقرير الشهري
              </a>
              <a
                href="/suppliers"
                className="text-white  border-neutral-200 border rounded-lg hover:bg-gray-700 p-1"
              >
                الموردين
              </a>
              <a
                href="/Deposits"
                className="text-white  border-neutral-200 border rounded-lg hover:bg-gray-700 p-1"
              >
                الايداعات
              </a>
              <a
                href="/cashWithdrawals"
                className="text-white  border-neutral-200 border rounded-lg hover:bg-gray-700 p-1"
              >
                السحوبات النقدية
              </a>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 mt-16 ml-16">{children}</main>
      </body>
    </html>
  );
}
