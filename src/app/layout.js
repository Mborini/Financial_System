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
} from "react-icons/fa";
import "./globals.css";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

export default function Layout({ children }) {
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

  // // Handle scroll to change navbar opacity
  // useEffect(() => {
  //   const handleScroll = () => {
  //     const scrollY = window.scrollY;
  //     const newOpacity = Math.max(1 - scrollY / 300, 0.7); // Reduce opacity as user scrolls down
  //     setNavbarOpacity(newOpacity);
  //   };

  //   window.addEventListener("scroll", handleScroll);
  //   return () => {
  //     window.removeEventListener("scroll", handleScroll);
  //   };
  // }, []);

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

  const [dateTime, setDateTime] = useState("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      // Format the date as dd/mm/yyyy, hh:mm
      const formattedDateTime = `${String(now.getDate()).padStart(
        2,
        "0"
      )}/${String(now.getMonth() + 1).padStart(
        2,
        "0"
      )}/${now.getFullYear()}, ${String(now.getHours()).padStart(
        2,
        "0"
      )}:${String(now.getMinutes()).padStart(2, "0")}`;

      setDateTime(formattedDateTime);
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 60000);

    return () => clearInterval(timer); // Cleanup interval on unmount
  }, []);

  return (
    <html lang="en">
      <title>HotDog</title>
      <body className="flex">
        {/* Sidebar */}
        <header className="w-full z-1 flex justify-between bg-red-600 text-white py-4 px-6 fixed top-0 z-50">
          <div className="flex gap-3 items-center">
            <Image
              width={30}
              height={30}
              src="/logoHotDog.png"
              alt="MR. HOTDOG Logo"
            />
            <h1 className="text-xl font-bold">MR.Hotdog</h1>
          </div>
          <div className="flex items-center justify-around">
            <h1 className="text-xl font-bold">
              {" "}
              النــظــام المــــــــــــــالـي
            </h1>
          </div>

          <div className="flex gap-3 items-center">
            <div className="text-xl font-bold">{dateTime}</div>
          </div>
        </header>
        <nav
          dir="rtl"
          className=" h-screen w-18 fixed left-0 top-0  bg-red-600 transition-opacity duration-300"
          style={{ opacity: navbarOpacity }}
        >
          {/* Sidebar Navigation */}
          <ul className="flex flex-col p-4 text-sm mt-16 text-white font-bold items-start space-y-4">
            <li className=" text-orange-500 rounded-md p-2 bg-white  transition-transform duration-300 ease-in-out transform hover:scale-125">
              <a className="gap-1 flex items-center" href="/">
                <FaChartBar size={25} className="flex-shrink-0" />
              </a>
            </li>

            {/* Costs dropdown */}
            <li
              className="relative  text-red-500 rounded-md p-2  bg-white transition-transform duration-300 ease-in-out transform hover:scale-125"
              ref={costDropdownRef}
            >
              <button
                className="cursor-pointer gap-1 flex items-center "
                onClick={() => {
                  setIsCostDropdownOpen(!isCostDropdownOpen);
                  setIsDropdownOpen(false); // Close other dropdown
                }}
              >
                <FaHandHoldingUsd
                  size={25}
                  className="flex-shrink-0 cursor-pointer"
                />
              </button>
              {isCostDropdownOpen && (
                <ul className="absolute left-20 -mt-4 bg-red-600 text-black rounded-md p-2 w-60 shadow-lg space-y-2">
      {/* Arrow */}
      <div className="absolute top-2 -left-2">
        <span className="block w-4 h-4 bg-red-600 transform rotate-45" />
      </div>

      {/* Dropdown Items */}
      <li>
        <a
          className="gap-1 flex bg-white text-black rounded-md px-2 py-1 items-center"
          href="/costs"
          onClick={handleLinkClick}
        >
          <FaCog className="flex-shrink-0" />
          ادارة التكاليف {/* Manage Costs */}
        </a>
      </li>
      <li>
        <a
          className="gap-1 flex bg-white text-black rounded-md px-2 py-1 items-center"
          href="/costsTypes"
          onClick={handleLinkClick}
        >
          <FaListAlt className="flex-shrink-0" />
          ادراة انواع التكاليف {/* Manage Cost Types */}
        </a>
      </li>
    </ul>
              )}
</li>
            
            {/* Employees dropdown */}
            <li className="relative" ref={dropdownRef}>
              <button
                className="cursor-pointer gap-2 flex items-center bg-white text-gray-600 rounded-md p-2 hover:scale-125"
                onClick={() => {
                  setIsDropdownOpen(!isDropdownOpen);
                  setIsCostDropdownOpen(false); // Close other dropdown
                }}
              >
                <FaUsers size={25} className="flex-shrink-0" />
              </button>

              {isDropdownOpen && (
                <ul className="absolute left-20  -mt-12 bg-red-600  text-black rounded-md p-2 w-60 shadow-lg space-y-2 ">
                  <div className="absolute top-4 -left-2">
                    <span className="block w-10 h-10 bg-red-600 transform rotate-45" />
                  </div>
                  <li>
                    <a
                      className=" gap-2 flex bg-white rounded-md px-2 py-1 items-center transition-transform duration-300 ease-in-out transform hover:scale-105"
                      href="/attendance"
                      onClick={handleLinkClick}
                    >
                      <FaClock className="flex-shrink-0 text-lime-500 cursor-pointer" />
                      سجل الدوام اليومي{/* Attendance */}
                    </a>
                  </li>
                  <li>
                    <a
                      className=" gap-1 flex items-center  bg-white rounded-md px-2 py-1 transition-transform duration-300 ease-in-out transform hover:scale-105"
                      href="/PayingSalaries"
                    >
                      <FaMoneyCheckAlt className="flex-shrink-0 text-purple-800 cursor-pointer" />
                      دفع الرواتب {/*  */}
                    </a>
                  </li>
                  <li>
                    <a
                      className=" gap-2 flex items-center bg-white rounded-md px-2 py-1 transition-transform duration-300 ease-in-out transform hover:scale-105"
                      href="/employees"
                      onClick={handleLinkClick}
                    >
                      <FaUsers className="flex-shrink-0 text-blue-800 cursor-pointer" />
                      ادارة الموظفين {/* Employees */}
                    </a>
                  </li>
                  <li>
                    <a
                      className=" gap-2 flex items-center  bg-white rounded-md px-2 py-1 transition-transform duration-300 ease-in-out transform hover:scale-105"
                      href="/deductions"
                      onClick={handleLinkClick}
                    >
                      <FaWallet className="flex-shrink-0 text-amber-400  cursor-pointer" />
                      الخصومات على الرواتب{/* Deductions */}
                    </a>
                  </li>

                  <li>
                    <a
                      className=" gap-2 flex items-center bg-white rounded-md px-2 py-1 transition-transform duration-300 ease-in-out transform hover:scale-105"
                      href="/withdrawals"
                      onClick={handleLinkClick}
                    >
                      <FaMoneyBill className="flex-shrink-0 text-rose-500 cursor-pointer" />
                      السحوبات الشهرية من الرواتب{/* Withdrawals */}
                    </a>
                  </li>

                  <li>
                    <a
                      className=" gap-2 flex items-center bg-white rounded-md px-2 py-1 transition-transform duration-300 ease-in-out transform hover:scale-105"
                      href="/salaryAccount"
                      onClick={handleLinkClick}
                    >
                      <FaMoneyCheckAlt className="flex-shrink-0 text-orange-500 cursor-pointer" />
                      التقرير الشهري لحساب الرواتب {/* Salary Account */}
                    </a>
                  </li>

                  <li>
                    <a
                      className=" gap-2 flex items-center bg-white rounded-md px-2 py-1 transition-transform duration-300 ease-in-out transform hover:scale-105"
                      href="/overTime"
                      onClick={handleLinkClick}
                    >
                      <FaPlusCircle className="flex-shrink-0 text-green-700 cursor-pointer" />
                      تقرير العمل الإضافي {/* Over Time */}
                    </a>
                  </li>

                  <li>
                    <a
                      className=" gap-2 flex items-center bg-white rounded-md px-2 py-1 transition-transform duration-300 ease-in-out transform hover:scale-105"
                      href="/staffFood"
                      onClick={handleLinkClick}
                    >
                      <FaUtensils className="flex-shrink-0 text-fuchsia-700 cursor-pointer" />
                      وجبات الطعام {/* Staff Food */}
                    </a>
                  </li>

                  <li>
                    <a
                      className=" gap-2 flex items-center bg-white rounded-md px-2 py-1 transition-transform duration-300 ease-in-out transform hover:scale-105"
                      href="/Vacations"
                      onClick={handleLinkClick}
                    >
                      <FaPlaneDeparture className="flex-shrink-0 text-blue-600 cursor-pointer" />
                      الإجازات و العطل{/* Vacations */}
                    </a>
                  </li>
                </ul>
              )}
            </li>

            <li className=" text-yellow-500 rounded-md p-2 bg-white transition-transform duration-300 ease-in-out transform hover:scale-125">
              <a className="gap-1 flex items-center" href="/sales">
                <FaCoins size={25} className="flex-shrink-0" />
              </a>
            </li>

            <li className=" text-black rounded-md p-2 bg-white transition-transform duration-300 ease-in-out transform hover:scale-125">
              <a className="gap-1 flex items-center" href="/purchases">
                <FaShoppingCart size={25} className="flex-shrink-0" />
              </a>
            </li>

            <li className=" text-violet-600 rounded-md p-2 bg-white transition-transform duration-300 ease-in-out transform hover:scale-125">
              <a className="gap-1 flex items-center" href="/MonthlySummary">
                <FaBalanceScaleLeft size={25} className="flex-shrink-0" />
              </a>
            </li>

            <li className=" text-cyan-600 rounded-md p-2 bg-white transition-transform duration-300 ease-in-out transform hover:scale-125">
              <a className="gap-1 flex items-center" href="/suppliers">
                <FaTruck size={25} className="flex-shrink-0" />
              </a>
            </li>

            <li className=" text-green-700 rounded-md p-2 bg-white transition-transform duration-300 ease-in-out transform hover:scale-125">
              <a className="gap-1 flex items-center" href="/Deposits">
                <FaRegBuilding size={25} className="flex-shrink-0" />
              </a>
            </li>

            <li className=" text-lime-500 rounded-md p-2 bg-white transition-transform duration-300 ease-in-out transform hover:scale-125">
              <a className="gap-1 flex items-center" href="/cashWithdrawals">
                <FaCashRegister size={25} className="flex-shrink-0" />
              </a>
            </li>
          </ul>
        </nav>

        {/* Main content */}
        <main className="flex-1 mt-16 ml-16">{children}</main>
      </body>
    </html>
  );
}
