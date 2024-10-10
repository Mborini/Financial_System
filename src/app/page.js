"use client";
import { useState, useEffect } from "react";
import "./globals.css";
import DoughnutChartCard from "./components/ChartCard";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PolarAreaChartCard from "./components/AriaChartCard";
import LineChartCard from "./components/LineChartCard";
import BarChartCard from "./components/BarChartCard";
import { startOfMonth, endOfMonth } from "date-fns";

// Fetch Data from API (replace the URL with your actual API endpoints)
const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

export default function Home() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [costs, setCosts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [staffFood, setStaffFood] = useState([]); // New state for staff food
  const [costStartDate, setCostStartDate] = useState(startOfMonth(new Date()));
  const [costEndDate, setCostEndDate] = useState(endOfMonth(new Date()));

  const [salesDateRange, setSalesDateRange] = useState([
    startOfMonth(new Date()),
    endOfMonth(new Date()),
  ]);

  const [withdrawalDateRange, setWithdrawalDateRange] = useState([
    startOfMonth(new Date()),
    endOfMonth(new Date()),
  ]);
  const [costDateRange, setCostDateRange] = useState([
    startOfMonth(new Date()),
    endOfMonth(new Date()),
  ]);
  const [purchaseDateRange, setPurchaseDateRange] = useState([
    startOfMonth(new Date()),
    endOfMonth(new Date()),
  ]);
  // Fetch withdrawals, suppliers, costs, purchases, and sales when the component mounts
  useEffect(() => {
    fetchData("/api/withdrawals").then(setWithdrawals);
    fetchData("/api/suppliers").then(setSuppliers);
    fetchData("/api/employees").then(setEmployees);
    fetchData("/api/costs").then(setCosts);
    fetchData("/api/purchases").then(setPurchases);
    fetchData("/api/sales").then(setSales);
    fetchData("/api/stafffood").then(setStaffFood); // Fetch staff food data
  }, []);

  // Filter withdrawals, costs, and purchases based on individual date ranges
  const filterByDate = (data, startDate, endDate) => {
    return data.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  const filteredCosts = filterByDate(costs, costDateRange[0], costDateRange[1]);
  const filteredWithdrawals = filterByDate(
    withdrawals,
    withdrawalDateRange[0],
    withdrawalDateRange[1]
  );
  const filteredPurchases = filterByDate(
    purchases,
    purchaseDateRange[0],
    purchaseDateRange[1]
  );

  // Get current month and year
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Calculate total Withdrawals for the current month
  const withdrawalsForCurrentMonth = withdrawals.filter((withdrawal) => {
    const withdrawalDate = new Date(withdrawal.date);
    return (
      withdrawalDate.getMonth() === currentMonth &&
      withdrawalDate.getFullYear() === currentYear
    );
  });

  // Calculate total staff withdrawals cost for the current month
  const totalWithdrawalsForCurrentMonth = withdrawalsForCurrentMonth.reduce(
    (total, withdrawal) => {
      return total + parseFloat(withdrawal.amount); // Ensure amount is a valid number
    },
    0
  );

  // Calculate total staff food for the current month
  const staffFoodForCurrentMonth = staffFood.filter((entry) => {
    const entryDate = new Date(entry.date);
    return (
      entryDate.getMonth() === currentMonth &&
      entryDate.getFullYear() === currentYear
    );
  });

  // Calculate total staff food cost for the current month
  const totalStaffFoodForCurrentMonth = staffFoodForCurrentMonth.reduce(
    (total, entry) => {
      return total + parseFloat(entry.amount); // Ensure amount is a valid number
    },
    0
  );

  // Filter sales for the current month
  const salesForCurrentMonth = sales.filter((sale) => {
    const saleDate = new Date(sale.sale_date); // Assuming 'sale_date' field is available in sales data
    return (
      saleDate.getMonth() === currentMonth &&
      saleDate.getFullYear() === currentYear
    );
  });

  // Calculate total sales for the current month
  const totalSalesForCurrentMonth = salesForCurrentMonth.reduce(
    (total, sale) => {
      const cashAmount = parseFloat(sale.cash_amount) || 0; // Ensure cash_amount is a valid number, default to 0 if NaN
      const visaAmount = parseFloat(sale.visa_amount) || 0; // Ensure visa_amount is a valid number, default to 0 if NaN
      return total + cashAmount + visaAmount;
    },
    0
  ); // Initialize with 0

  // Calculate total purchases and remaining amount for the current month
  const purchasesForCurrentMonth = purchases.filter((purchase) => {
    const purchaseDate = new Date(purchase.date);
    return (
      purchaseDate.getMonth() === currentMonth &&
      purchaseDate.getFullYear() === currentYear
    );
  });

  const totalPurchasesForCurrentMonth = purchasesForCurrentMonth.reduce(
    (total, purchase) => {
      const amount = parseFloat(purchase.amount) || 0; // Ensure amount is valid
      const counts = parseFloat(purchase.counts) || 1; // Default counts to 1 if invalid

      if (isNaN(amount) || isNaN(counts)) {
        console.error(`Invalid purchase data: ${JSON.stringify(purchase)}`);
      }

      return total + amount * counts;
    },
    0
  );

  console.log("purchasesForCurrentMonth:", purchasesForCurrentMonth);

  // Calculate total remaining amount for the current month
  const totalRemainingAmountForCurrentMonth = purchasesForCurrentMonth.reduce(
    (total, purchase) => {
      const remainingAmount =
        parseFloat(purchase.remaining_amount) ||
        parseFloat(purchase.amount) - parseFloat(purchase.paid_amount) ||
        0;
      return total + remainingAmount;
    },
    0
  ); // Initialize with 0 to avoid undefined

  // Filter costs for the current month
  const costsForCurrentMonth = costs.filter((cost) => {
    const costDate = new Date(cost.date);
    return (
      costDate.getMonth() === currentMonth &&
      costDate.getFullYear() === currentYear
    );
  });

  // Calculate total costs for the current month
  const totalCostsForCurrentMonth = costsForCurrentMonth.reduce(
    (total, cost) => {
      return total + parseFloat(cost.amount); // Ensure amount is a valid number
    },
    0
  );

  // Helper function to group data by month and year
  const groupByMonth = (data) => {
    const groupedData = data.reduce((acc, item) => {
      const date = new Date(item.date);
      const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`; // Year-Month as key

      if (!acc[yearMonth]) {
        acc[yearMonth] = {
          totalAmount: 0,
          label: date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
          }),
        };
      }

      acc[yearMonth].totalAmount += parseFloat(item.amount);
      return acc;
    }, {});

    return Object.values(groupedData); // Return the aggregated data
  };

  // Use the groupByMonth function to group your withdrawals, costs, and purchases
  const withdrawalsByMonth = groupByMonth(filteredWithdrawals);
  const costsByMonth = groupByMonth(filteredCosts);
  const purchasesByMonth = groupByMonth(filteredPurchases);

  // Prepare the purchases data for the chart (monthly)
  const purchasesChartData = {
    labels: purchasesByMonth.map((purchase) => purchase.label),
    datasets: [
      {
        label: "Purchases",
        data: purchasesByMonth.map((purchase) => purchase.totalAmount),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };

  // Prepare the withdrawals data for the chart (monthly)
  const withdrawalsChartData = {
    labels: withdrawalsByMonth.map((withdrawal) => withdrawal.label),
    datasets: [
      {
        label: "Withdrawals",
        data: withdrawalsByMonth.map((withdrawal) => withdrawal.totalAmount),
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
      },
    ],
  };

  // Prepare the costs data for the chart (monthly)
  const costChartData = {
    labels: costsByMonth.map((cost) => cost.label),
    datasets: [
      {
        label: "Costs",
        data: costsByMonth.map((cost) => cost.totalAmount),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
      },
    ],
  };
  const groupSalesByMonth = (data) => {
    const groupedData = data.reduce((acc, sale) => {
      const date = new Date(sale.sale_date); // Assuming 'sale_date' field is available
      const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`; // Year-Month as key

      if (!acc[yearMonth]) {
        acc[yearMonth] = {
          totalAmount: 0,
          label: date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
          }),
        };
      }

      // Calculate total sales by adding cash_amount and visa_amount
      const cashAmount = parseFloat(sale.cash_amount) || 0;
      const visaAmount = parseFloat(sale.visa_amount) || 0;
      acc[yearMonth].totalAmount += cashAmount + visaAmount;

      return acc;
    }, {});

    return Object.values(groupedData); // Return the aggregated data
  };

  // Group sales data by month
  const salesByMonth = groupSalesByMonth(sales);

  // Prepare the sales data for the chart (monthly)
  const salesChartData = {
    labels: salesByMonth.map((sale) => sale.label),
    datasets: [
      {
        label: "Sales",
        data: salesByMonth.map((sale) => sale.totalAmount),
        borderColor: "rgba(153, 102, 255, 1)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
      },
    ],
  };
  // Group purchases by supplier
  const groupBySupplier = (data) => {
    const groupedData = data.reduce((acc, purchase) => {
      const supplier = purchase.supplier || "Unknown"; // Fallback to 'Unknown' if supplier is missing

      if (!acc[supplier]) {
        acc[supplier] = { totalAmount: 0, label: supplier };
      }

      acc[supplier].totalAmount += parseFloat(purchase.amount);
      return acc;
    }, {});

    return Object.values(groupedData); // Return the aggregated data
  };

  // Prepare the purchases data by supplier for the chart
  const purchasesBySupplier = groupBySupplier(purchases);
  const purchasesBySupplierChartData = {
    labels: purchasesBySupplier.map((purchase) => purchase.label),
    datasets: [
      {
        label: "Purchases by Supplier",
        data: purchasesBySupplier.map((purchase) => purchase.totalAmount),
        borderColor: "rgba(153, 102, 255, 1)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
      },
    ],
  };
  // Group purchases by payment status
  const groupByPaymentStatus = (data) => {
    const groupedData = data.reduce((acc, purchase) => {
      const status = purchase.payment_status || "Unknown"; // Fallback to 'Unknown' if status is missing

      if (!acc[status]) {
        acc[status] = 0;
      }

      acc[status] += 1;
      return acc;
    }, {});

    return Object.keys(groupedData).map((status) => ({
      label: status,
      value: groupedData[status],
    }));
  };

  // Prepare the payment status data for the chart
  const paymentStatusData = groupByPaymentStatus(purchases);
  const paymentStatusChartData = {
    labels: paymentStatusData.map((status) => status.label),
    datasets: [
      {
        label: "Payment Status",
        data: paymentStatusData.map((status) => status.value),
        backgroundColor: [
          "rgba(75, 192, 192, 0.2)",
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };
  // Group remaining amount by supplier
  const groupRemainingBySupplier = (data) => {
    const groupedData = data.reduce((acc, purchase) => {
      const supplier = purchase.supplier || "Unknown"; // Fallback to 'Unknown' if supplier is missing

      if (!acc[supplier]) {
        acc[supplier] = { totalRemaining: 0, label: supplier };
      }

      acc[supplier].totalRemaining += parseFloat(purchase.remaining_amount);
      return acc;
    }, {});

    return Object.values(groupedData); // Return the aggregated data
  };

  // Prepare the remaining amount data by supplier for the chart
  const remainingBySupplier = groupRemainingBySupplier(purchases);
  const remainingBySupplierChartData = {
    labels: remainingBySupplier.map((purchase) => purchase.label),
    datasets: [
      {
        label: "Remaining Amount by Supplier",
        data: remainingBySupplier.map((purchase) => purchase.totalRemaining),
        borderColor: "rgba(255, 159, 64, 1)",
        backgroundColor: "rgba(255, 159, 64, 0.2)",
      },
    ],
  };
  // Group costs and income by type
  const groupByType = (data) => {
    const groupedData = data.reduce((acc, item) => {
      const type = item.type || "Unknown";

      if (!acc[type]) {
        acc[type] = { totalAmount: 0, label: type };
      }

      acc[type].totalAmount += parseFloat(item.amount);
      return acc;
    }, {});

    return Object.values(groupedData); // Return the aggregated data
  };

  // Prepare the data by type for the chart
  const costsByType = groupByType(costs);
  const costsByTypeChartData = {
    labels: costsByType.map((item) => item.label),
    datasets: [
      {
        label: "Costs and Income by Type",
        data: costsByType.map((item) => item.totalAmount),
        borderColor: "rgba(255, 159, 64, 1)",
        backgroundColor: "rgba(255, 159, 64, 0.2)",
      },
    ],
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Summary Section */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Employees */}
        <div className="border p-4 shadow-lg rounded-lg bg-white text-center">
          <p className="text-base font-bold">Employees</p>
          <p className="text-xl">{employees.length}</p>
        </div>

        {/* Total Suppliers */}
        <div className="border p-4 shadow-lg rounded-lg bg-white text-center">
          <p className="text-base font-bold">Suppliers</p>
          <p className="text-xl">{suppliers.length}</p>
        </div>

        {/* Total Purchases for Current Month */}
        <div className="border p-4 shadow-lg rounded-lg bg-white text-center">
          <p className="text-base font-bold">Purchases</p>
          <p className="text-xl">
            JOD {totalPurchasesForCurrentMonth.toFixed(2)}
          </p>
        </div>

        {/* Total Sales for Current Month */}
        <div className="border p-4 shadow-lg rounded-lg bg-white text-center">
          <p className="text-base font-bold">Sales</p>
          <p className="text-xl">JOD {totalSalesForCurrentMonth.toFixed(2)}</p>
        </div>

        {/* Total Costs for Current Month */}
        <div className="border p-4 shadow-lg rounded-lg bg-white text-center">
          <p className="text-base font-bold">Costs</p>
          <p className="text-xl">JOD {totalCostsForCurrentMonth.toFixed(2)}</p>
        </div>

        {/* Total Remaining Amount for Current Month */}
        <div className="border p-4 shadow-lg rounded-lg bg-white text-center">
          <p className="text-base font-bold">Debit</p>
          <p className="text-xl">
            JOD {totalRemainingAmountForCurrentMonth.toFixed(2)}
          </p>
        </div>
        {/* Total Staff Food for Current Month */}
        <div className="border p-4 shadow-lg rounded-lg bg-white text-center">
          <p className="text-base font-bold">Staff Food</p>
          <p className="text-xl">
            JOD {totalStaffFoodForCurrentMonth.toFixed(2)}
          </p>
        </div>
        {/* Total Withdrawals for Current Month */}
        <div className="border p-4 shadow-lg rounded-lg bg-white text-center">
          <p className="text-base font-bold">Withdrawals</p>
          <p className="text-xl">
            JOD {totalWithdrawalsForCurrentMonth.toFixed(2)}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 mb-4 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {/* Costs and Income by Type Chart */}
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-bold mb-4">Costs and Income by Type</h2>
          <LineChartCard
            title="Costs and Income by Type"
            data={costsByTypeChartData}
          />
        </div>
        {/* Purchases by Supplier Chart */}
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-bold mb-4">Purchases by Supplier</h2>
          <BarChartCard
            title="Purchases by Supplier"
            data={purchasesBySupplierChartData}
          />
        </div>
      </div>
      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Purchases Chart */}
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-bold mb-4">Purchases</h2>
          <div className="flex items-center justify-between mb-4">
            <div className="w-full">
              <label className="block text-sm font-bold mb-2">Date Range</label>
              <DatePicker
                selected={purchaseDateRange[0]}
                onChange={(update) => setPurchaseDateRange(update)}
                startDate={purchaseDateRange[0]}
                endDate={purchaseDateRange[1]}
                selectsRange
                dateFormat="yyyy/MM/dd"
                className="border p-2 rounded-md w-full"
              />
            </div>
          </div>
          <DoughnutChartCard title="Purchases" data={purchasesChartData} />
        </div>

        {/* Withdrawals Chart */}
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-bold mb-4">Withdrawals</h2>
          <div className="flex items-center justify-between mb-4">
            <div className="w-full">
              <label className="block text-sm font-bold mb-2">Date Range</label>
              <DatePicker
                selected={withdrawalDateRange[0]}
                onChange={(update) => setWithdrawalDateRange(update)}
                startDate={withdrawalDateRange[0]}
                endDate={withdrawalDateRange[1]}
                selectsRange
                dateFormat="yyyy/MM/dd"
                className="border p-2 rounded-md w-full"
              />
            </div>
          </div>
          <DoughnutChartCard title="Withdrawals" data={withdrawalsChartData} />
        </div>

        {/* Sales Chart */}
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-bold mb-4">Sales</h2>
          <div className="flex items-center justify-between mb-4">
            <div className="w-full">
              <label className="block text-sm font-bold mb-2">Date Range</label>
              <DatePicker
                selected={salesDateRange[0]}
                onChange={(update) => setSalesDateRange(update)}
                startDate={salesDateRange[0]}
                endDate={salesDateRange[1]}
                selectsRange
                dateFormat="yyyy/MM/dd"
                className="border p-2 rounded-md w-full"
              />
            </div>
          </div>
          <DoughnutChartCard title="Sales" data={salesChartData} />
        </div>

        {/* Costs Chart */}
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-bold mb-4">Costs</h2>
          <div className="flex items-center justify-between mb-4">
            <div className="w-full">
              <label className="block text-sm font-bold mb-2">Date Range</label>
              <DatePicker
                selected={costDateRange[0]}
                onChange={(update) => setCostDateRange(update)}
                startDate={costDateRange[0]}
                endDate={costDateRange[1]}
                selectsRange
                dateFormat="yyyy/MM/dd"
                className="border p-2 rounded-md w-full"
              />
            </div>
          </div>
          <PolarAreaChartCard title="Costs" data={costChartData} />
        </div>
        {/* Payment Status Distribution Chart */}
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-bold lg:mb-24 mb-4">
            Payment Status Distribution
          </h2>
          <DoughnutChartCard
            title="Payment Status Distribution"
            data={paymentStatusChartData}
          />
        </div>

        {/* Remaining Amount by Supplier Chart */}
        <div className="p-4 col-span-3 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-bold mb-4">
            Remaining Amount by Supplier
          </h2>
          <LineChartCard
            title="Remaining Amount by Supplier"
            data={remainingBySupplierChartData}
          />
        </div>

        
      </div>
    </div>
  );
}
