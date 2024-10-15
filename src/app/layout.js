"use client";

import {
  FaChartArea,
  FaRegEdit,
  FaMoneyBill,
  FaShoppingCart,
  FaListAlt,
  FaTruck,
  FaUsers,
  FaWallet,
  FaClock,
  FaUtensils,
  FaPlaneDeparture,
  FaListUl,
  FaCog,
  FaChartBar,
} from "react-icons/fa";
import NavDrawer from "./components/Drawers/NavDrawer";
import "./globals.css";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

export default function Layout({ children }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCostDropdownOpen, setIsCostDropdownOpen] = useState(false);
  const [navbarOpacity, setNavbarOpacity] = useState(1);
  const dropdownRef = useRef(null);
  const costDropdownRef = useRef(null);
  const [isEmployeesDropdownOpen, setIsEmployeesDropdownOpen] = useState(false);
  const employeesDropdownRef = useRef(null);

  // Handle click outside to close the dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        costDropdownRef.current &&
        !costDropdownRef.current.contains(event.target) &&
        employeesDropdownRef.current &&
        !employeesDropdownRef.current.contains(event.target)
      ) {
        setIsCostDropdownOpen(false);
        setIsEmployeesDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle scroll to change navbar opacity
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const newOpacity = Math.max(1 - scrollY / 300, 0.7); // Reduce opacity as user scrolls down
      setNavbarOpacity(newOpacity);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
 // Handle toggling the Costs dropdown
 const toggleCostDropdown = () => {
  setIsCostDropdownOpen(!isCostDropdownOpen);
  setIsEmployeesDropdownOpen(false); // Close Employees dropdown when Costs is opened
};

// Handle toggling the Employees dropdown
const toggleEmployeesDropdown = () => {
  setIsEmployeesDropdownOpen(!isEmployeesDropdownOpen);
  setIsCostDropdownOpen(false); // Close Costs dropdown when Employees is opened
};
  // Handle closing dropdown after clicking a link
  const handleLinkClick = () => {
    setIsDropdownOpen(false);
    setIsCostDropdownOpen(false);
  };

  return (
    <html lang="en">
      <body>
        {/* Navigation Bar */}
        <nav
          dir="rtl"
          className="sticky top-0 z-50 bg-indigo-600 relative transition-opacity duration-300"
          style={{ opacity: navbarOpacity }}
        >
          {/* Mobile Navigation */}
          <div className="p-4 bg-blue-500 text-white font-bold flex justify-between items-center md:hidden">
            <button
              className="text-white hover:text-yellow-300"
              onClick={() => setIsDrawerOpen(true)}
            >
              <div>
                <FaListUl className="" size={20} />
              </div>
            </button>{" "}
            <div className="flex gap-2 items-center">
              <h1>MR. HOTDOG</h1>
              <Image width={25} height={25} src="/logoHotDog.jpg" />
            </div>
          </div>

          <NavDrawer  open={isDrawerOpen} setOpen={setIsDrawerOpen} title="التنقل">
      <ul className="space-y-4">
        <li>
          <a href="/" className="hover:text-yellow-300">
            الاحصائيات {/* Dashboard */}
          </a>
        </li>

        {/* Costs Dropdown */}
        <li ref={costDropdownRef} className="relative">
          <button
            onClick={toggleCostDropdown}
            className="hover:text-yellow-300 flex w-full text-left"
          >
            الكلف التشغيلية {/* Costs */}
          </button>
          {isCostDropdownOpen && (
            <ul className="space-y-2 ml-4">
              <li>
                <a href="/costs" className="hover:text-yellow-300">
                  ادارة التشغيلية {/* Costs */}
                </a>
              </li>
              <li>
                <a href="/costsTypes" className="hover:text-yellow-300">
                  أنواع الكلف {/* Cost Types */}
                </a>
              </li>
            </ul>
          )}
        </li>

        <li>
          <a href="/sales" className="hover:text-yellow-300">
            المبيعات اليومية {/* Sales */}
          </a>
        </li>

        <li>
          <a href="/purchases" className="hover:text-yellow-300">
            فواتير المشتريات {/* Purchases */}
          </a>
        </li>

        <li>
          <a href="/suppliers" className="hover:text-yellow-300">
            ادارة الموردين {/* Suppliers */}
          </a>
        </li>

        {/* Employees Dropdown */}
        <li ref={employeesDropdownRef} className="relative">
          <button
            onClick={toggleEmployeesDropdown}
            className="hover:text-yellow-300 flex w-full text-left"
          >
            ادارة الموظفين و الحسابات {/* Employees */}
          </button> 
          {isEmployeesDropdownOpen && (
            <ul className="space-y-2 ml-4">
              <li>
                <a href="/employees" className="hover:text-yellow-300">
                  الموظفين {/* Employees */}
                </a>
              </li>
              <li>
                <a href="/deductions" className="hover:text-yellow-300">
                  الخصومات {/* Deductions */}
                </a>
              </li>
              <li>
                <a href="/withdrawals" className="hover:text-yellow-300">
                  السحوبات {/* Withdrawals */}
                </a>
              </li>
              <li>
                <a href="/salaryAccount" className="hover:text-yellow-300">
                  حساب الرواتب {/* Salary Account */}
                </a>
              </li>
              <li>
                <a href="/attendance" className="hover:text-yellow-300">
                  الدوام اليومي {/* Attendance */}
                </a>
              </li>
              <li>
                <a href="/overTime" className="hover:text-yellow-300">
                   تقرير العمل الإضافي {/* Over Time */}
                </a>
              </li>
              <li>
                <a href="/staffFood" className="hover:text-yellow-300">
                  الوجبات {/* Staff Food */}
                </a>
              </li>
              <li>
                <a href="/Vacations" className="hover:text-yellow-300">
                  الإجازات {/* Vacations */}
                </a>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </NavDrawer>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex justify-around p-4 bg-blue-500 text-white font-bold items-center space-x-4">
            <li>
              <a
                className="hover:text-yellow-300 gap-1 flex items-center transition-transform duration-300 ease-in-out transform hover:scale-105"
                href="/"
              >
                <FaChartBar className="flex-shrink-0" /> الاحصائيات{" "}
                {/* Dashboard */}
              </a>
            </li>

            {/* Costs dropdown */}
            <li className="relative" ref={costDropdownRef}>
              <button
                className="cursor-pointer hover:text-yellow-300 gap-1 flex items-center transition-transform duration-300 ease-in-out transform"
                onClick={() => {
                  setIsCostDropdownOpen(!isCostDropdownOpen);
                  setIsDropdownOpen(false); // Close other dropdown
                }}
              >
                <FaCog className="flex-shrink-0 hover:text-yellow-300 cursor-pointer" />
               ادارة الكلف التشغيلية{/* Costs */}
              </button>

              {isCostDropdownOpen && (
                <ul className="absolute left-0 mt-2 bg-white text-black rounded-md p-2 w-40 shadow-lg space-y-2 z-10">
                  <li>
                    <a
                      className="hover:text-yellow-300 gap-1 flex items-center transition-transform duration-300 ease-in-out transform hover:scale-105"
                      href="/costs"
                      onClick={handleLinkClick}
                    >
                      <FaCog className="flex-shrink-0 hover:text-yellow-300 cursor-pointer" />
                      الكلف التشغيلية{/* Costs */}
                    </a>
                  </li>
                  <li>
                    <a
                      className="hover:text-yellow-300 gap-1 flex items-center transition-transform duration-300 ease-in-out transform hover:scale-105"
                      href="/costsTypes"
                      onClick={handleLinkClick}
                    >
                      <FaListAlt className="flex-shrink-0 hover:text-yellow-300 cursor-pointer" />
                      أنواع الكلف {/* Cost Types */}
                    </a>
                  </li>
                </ul>
              )}
            </li>

            <li>
              <a
                className="hover:text-yellow-300 gap-1 flex items-center transition-transform duration-300 ease-in-out transform hover:scale-105"
                href="/sales"
              >
                <FaMoneyBill className="flex-shrink-0 hover:text-yellow-300 cursor-pointer" />
                المبيعات اليومية{/* Sales */}
              </a>
            </li>

            <li>
              <a
                className="hover:text-yellow-300 gap-1 flex items-center transition-transform duration-300 ease-in-out transform hover:scale-105"
                href="/purchases"
              >
                <FaShoppingCart className="flex-shrink-0 hover:text-yellow-300 cursor-pointer" />
              فواتير المشتريات {/* Purchases */}
              </a>
            </li>

            <li>
              <a
                className="hover:text-yellow-300 gap-1 flex items-center transition-transform duration-300 ease-in-out transform hover:scale-105"
                href="/suppliers"
              >
                <FaTruck className="flex-shrink-0 hover:text-yellow-300 cursor-pointer" />
              ادارة الموردين {/* Suppliers */}
              </a>
            </li>

            {/* Employees dropdown */}
            <li className="relative" ref={dropdownRef}>
              <button
                className="cursor-pointer hover:text-yellow-300 gap-1 flex items-center transition-transform duration-300 ease-in-out transform"
                onClick={() => {
                  setIsDropdownOpen(!isDropdownOpen);
                  setIsCostDropdownOpen(false); // Close other dropdown
                }}
              >
                <FaUsers className="flex-shrink-0 hover:text-yellow-300 cursor-pointer" />
              ادارة الموظفين و الحسابات{/* Employees */}
              </button>

              {isDropdownOpen && (
                <ul className="absolute left-0 mt-2 bg-white text-black rounded-md p-2 w-40 shadow-lg space-y-2 z-10">
                  <li>
                    <a
                      className="hover:text-yellow-300 gap-1 flex items-center transition-transform duration-300 ease-in-out transform hover:scale-105"
                      href="/employees"
                      onClick={handleLinkClick}
                    >
                      <FaUsers className="flex-shrink-0 hover:text-yellow-300 cursor-pointer" />
                      الموظفين {/* Employees */}
                    </a>
                  </li>

                  <li>
                    <a
                      className="hover:text-yellow-300 gap-1 flex items-center transition-transform duration-300 ease-in-out transform hover:scale-105"
                      href="/deductions"
                      onClick={handleLinkClick}
                    >
                      <FaWallet className="flex-shrink-0 hover:text-yellow-300 cursor-pointer" />
                      الخصومات {/* Deductions */}
                    </a>
                  </li>

                  <li>
                    <a
                      className="hover:text-yellow-300 gap-1 flex items-center transition-transform duration-300 ease-in-out transform hover:scale-105"
                      href="/withdrawals"
                      onClick={handleLinkClick}
                    >
                      <FaMoneyBill className="flex-shrink-0 hover:text-yellow-300 cursor-pointer" />
                      السحوبات {/* Withdrawals */}
                    </a>
                  </li>

                  <li>
                    <a
                      className="hover:text-yellow-300 gap-1 flex items-center transition-transform duration-300 ease-in-out transform hover:scale-105"
                      href="/salaryAccount"
                      onClick={handleLinkClick}
                    >
                      <FaWallet className="flex-shrink-0 hover:text-yellow-300 cursor-pointer" />
                      حساب الرواتب {/* Salary Account */}
                    </a>
                  </li>

                  <li>
                    <a
                      className="hover:text-yellow-300 gap-1 flex items-center transition-transform duration-300 ease-in-out transform hover:scale-105"
                      href="/attendance"
                      onClick={handleLinkClick}
                    >
                      <FaClock className="flex-shrink-0 hover:text-yellow-300 cursor-pointer" />
                     الدوام اليومي{/* Attendance */}
                    </a>
                  </li>

                  <li>
                    <a
                      className="hover:text-yellow-300 gap-1 flex items-center transition-transform duration-300 ease-in-out transform hover:scale-105"
                      href="/overTime"
                      onClick={handleLinkClick}
                    >
                      <FaClock  className="flex-shrink-0 hover:text-yellow-300 cursor-pointer" />
                    تقرير  العمل الإضافي {/* Over Time */}
                    </a>
                  </li>

                  <li>
                    <a
                      className="hover:text-yellow-300 gap-1 flex items-center transition-transform duration-300 ease-in-out transform hover:scale-105"
                      href="/staffFood"
                      onClick={handleLinkClick}
                    >
                      <FaUtensils className="flex-shrink-0 hover:text-yellow-300 cursor-pointer" />
                     الوجبات  {/* Staff Food */}
                    </a>
                  </li>

                  <li>
                    <a
                      className="hover:text-yellow-300 gap-1 flex items-center transition-transform duration-300 ease-in-out transform hover:scale-105"
                      href="/Vacations"
                      onClick={handleLinkClick}
                    >
                      <FaPlaneDeparture className="flex-shrink-0 hover:text-yellow-300 cursor-pointer" />
                      الإجازات {/* Vacations */}
                    </a>
                  </li>
                </ul>
              )}
            </li>
            <li className=" bg-blue-500 text-white font-bold hidden md:flex justify-center items-center md:justify-between">
              <div className="flex gap-3 items-center">
                <h1 className="text-lg">MR. HOTDOG</h1>{" "}
                <Image
                  width={30}
                  height={30}
                  src="/logoHotDog.jpg"
                  alt="MR. HOTDOG Logo"
                />
              </div>
            </li>
          </ul>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
