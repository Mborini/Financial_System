"use client";

import { FaList, FaListUl } from "react-icons/fa";
import NavDrawer from "./components/Drawers/NavDrawer";
import "./globals.css";
import { useState } from "react";
import Image from "next/image";

export default function Layout({ children }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <html lang="en" dir="rtl">
      {" "}
      {/* Setting the whole page to RTL */}
      <body>
        <nav className="relative">
          {/* Mobile Navigation */}
          <div className="p-4 bg-blue-500 text-white font-bold flex justify-between items-center md:hidden">
            <button
              className="text-white hover:text-yellow-300"
              onClick={() => setIsDrawerOpen(true)}
            >
              <FaListUl />
            </button>{" "}
            <Image width={25} height={25} src="/logoHotDog.jpg" />
          </div>

          {/* Drawer for mobile */}
          <NavDrawer
            title="التنقل"
            open={isDrawerOpen}
            setOpen={setIsDrawerOpen}
          >
            <ul className="space-y-4">
              <li>
                <a href="/" className="hover:text-yellow-300">
                  لوحة القيادة {/* Dashboard */}
                </a>
              </li>
              <li>
                <a href="/costs" className="hover:text-yellow-300">
                  التكاليف {/* Costs */}
                </a>
              </li>
              <li>
                <a href="/sales" className="hover:text-yellow-300">
                  المبيعات {/* Sales */}
                </a>
              </li>
              <li>
                <a href="/purchases" className="hover:text-yellow-300">
                  المشتريات {/* Purchases */}
                </a>
              </li>
              <li>
                <a href="/suppliers" className="hover:text-yellow-300">
                  الموردون {/* Suppliers */}
                </a>
              </li>
              <li>
                <a href="/employees" className="hover:text-yellow-300">
                  الموظفين {/* Employees */}
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
                  الحضور {/* Attendance */}
                </a>
              </li>
              <li>
                <a href="/costsTypes" className="hover:text-yellow-300">
                  أنواع التكاليف {/* Costs Types */}
                </a>
              </li>
              <li>
                <a href="/overTime" className="hover:text-yellow-300">
                  العمل الإضافي {/* Over Time */}
                </a>
              </li>
              <li>
                <a href="/staffFood" className="hover:text-yellow-300">
                  طعام الموظفين {/* Staff Food */}
                </a>
              </li>
              <li>
                <a href="/Vacations" className="hover:text-yellow-300">
                  الإجازات {/* Vacations */}
                </a>
              </li>
            </ul>
          </NavDrawer>

          <ul className="hidden md:flex justify-between p-4 bg-blue-500 text-white font-bold space-x-4">
            <li>
              <a
                className="hover:text-yellow-300 transition-transform duration-300 ease-in-out transform hover:scale-105"
                href="/"
              >
                لوحة القيادة {/* Dashboard */}
              </a>
            </li>
            <li>
              <a
                className="hover:text-yellow-300 transition-transform duration-300 ease-in-out transform hover:scale-105"
                href="/costs"
              >
                التكاليف {/* Costs */}
              </a>
            </li>
            <li>
              <a
                className="hover:text-yellow-300 transition-transform duration-300 ease-in-out transform hover:scale-105"
                href="/sales"
              >
                المبيعات {/* Sales */}
              </a>
            </li>
            <li>
              <a
                className="hover:text-yellow-300 transition-transform duration-300 ease-in-out transform hover:scale-105"
                href="/purchases"
              >
                المشتريات {/* Purchases */}
              </a>
            </li>
            <li>
              <a
                className="hover:text-yellow-300 transition-transform duration-300 ease-in-out transform hover:scale-105"
                href="/suppliers"
              >
                الموردون {/* Suppliers */}
              </a>
            </li>
            <li>
              <a
                className="hover:text-yellow-300 transition-transform duration-300 ease-in-out transform hover:scale-105"
                href="/employees"
              >
                الموظفين {/* Employees */}
              </a>
            </li>
            <li>
              <a
                className="hover:text-yellow-300 transition-transform duration-300 ease-in-out transform hover:scale-105"
                href="/withdrawals"
              >
                السحوبات {/* Withdrawals */}
              </a>
            </li>
            <li>
              <a
                className="hover:text-yellow-300 transition-transform duration-300 ease-in-out transform hover:scale-105"
                href="/salaryAccount"
              >
                حساب الرواتب {/* Salary Account */}
              </a>
            </li>
            <li>
              <a
                className="hover:text-yellow-300 transition-transform duration-300 ease-in-out transform hover:scale-105"
                href="/attendance"
              >
                الحضور {/* Attendance */}
              </a>
            </li>
            <li>
              <a
                className="hover:text-yellow-300 transition-transform duration-300 ease-in-out transform hover:scale-105"
                href="/costsTypes"
              >
                أنواع التكاليف {/* Costs Types */}
              </a>
            </li>
            <li>
              <a
                className="hover:text-yellow-300 transition-transform duration-300 ease-in-out transform hover:scale-105"
                href="/overTime"
              >
                العمل الإضافي {/* Over Time */}
              </a>
            </li>
            <li>
              <a
                className="hover:text-yellow-300 transition-transform duration-300 ease-in-out transform hover:scale-105"
                href="/staffFood"
              >
                طعام الموظفين {/* Staff Food */}
              </a>
            </li>
            <li>
              <a
                className="hover:text-yellow-300 transition-transform duration-300 ease-in-out transform hover:scale-105"
                href="/Vacations"
              >
                الإجازات {/* Vacations */}
              </a>
            </li>
          </ul>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
