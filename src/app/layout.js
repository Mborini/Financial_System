import "./globals.css";

export default function Layout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <ul className="flex justify-between p-4 bg-blue-500 text-white font-bold">
            <li>
              <a
                className="hover:text-yellow-300 transition-transform duration-300 ease-in-out transform hover:scale-105"
                href="/"
              >
                Dashboard
              </a>
            </li>
            <li>
              <a
                className="hover:text-yellow-300 transition-transform duration-300 ease-in-out transform hover:scale-105"
                href="/costs"
              >
                Costs
              </a>
            </li>
            <li>
              <a
                className="hover:text-yellow-300 transition-transform duration-300 ease-in-out transform hover:scale-105"
                href="/sales"
              >
                Sales
              </a>
            </li>
            <li>
              <a
                className="hover:text-yellow-300 transition-transform duration-300 ease-in-out transform hover:scale-105"
                href="/purchases"
              >
                Purchases
              </a>
            </li>
            <li>
              <a
                className="hover:text-yellow-300 transition-transform duration-300 ease-in-out transform hover:scale-105"
                href="/suppliers"
              >
                Suppliers
              </a>
            </li>
            <li>
              <a
                className="hover:text-yellow-300 transition-transform duration-300 ease-in-out transform hover:scale-105"
                href="/employees"
              >
                Employees
              </a>
            </li>
            <li>
              <a
                className="hover:text-yellow-300 transition-transform duration-300 ease-in-out transform hover:scale-105"
                href="/withdrawals"
              >
                Withdrawals
              </a>
            </li>
            <li>
              <a
                className="hover:text-yellow-300 transition-transform duration-300 ease-in-out transform hover:scale-105"
                href="/salaryAccount"
              >
                Salary Account
              </a>
            </li>
            <li>
              <a
                className="hover:text-yellow-300 transition-transform duration-300 ease-in-out transform hover:scale-105"
                href="/attendance"
              >
                Attendance
              </a>
            </li>
            <li>
              <a
                className="hover:text-yellow-300 transition-transform duration-300 ease-in-out transform hover:scale-105"
                href="/costsTypes"
              >
                Costs Types
              </a>
            </li>
            <li>
              <a
                className="hover:text-yellow-300 transition-transform duration-300 ease-in-out transform hover:scale-105"
                href="/overTime"
              >
                Over Time
              </a>
            </li>
            <li>
              <a
                className="hover:text-yellow-300 transition-transform duration-300 ease-in-out transform hover:scale-105"
                href="/staffFood"
              >
                Staff Food
              </a>
            </li>
            <li>
              <a
                className="hover:text-yellow-300 transition-transform duration-300 ease-in-out transform hover:scale-105"
                href="/Vacations"
              >
                Vacations
              </a>
            </li>
          </ul>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
