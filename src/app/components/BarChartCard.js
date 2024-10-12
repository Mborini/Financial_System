import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register necessary components for a Bar chart
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function BarChartCard({ title, data }) {
  // Define a color palette with 12 colors and set opacity
  const colorPalette = [
    'rgba(255, 99, 132, 0.6)', // Red with 60% opacity
    'rgba(54, 162, 235, 0.6)', // Blue with 60% opacity
    'rgba(255, 206, 86, 0.6)',  // Yellow with 60% opacity
    'rgba(75, 192, 192, 0.6)',  // Cyan with 60% opacity
    'rgba(153, 102, 255, 0.6)', // Purple with 60% opacity
    'rgba(255, 159, 64, 0.6)',  // Orange with 60% opacity
    'rgba(255, 99, 132, 0.6)', // Repeat colors for more segments
    'rgba(54, 162, 235, 0.6)',
    'rgba(255, 206, 86, 0.6)',
    'rgba(75, 192, 192, 0.6)',
    'rgba(153, 102, 255, 0.6)',
    'rgba(255, 159, 64, 0.6)',
  ];

  // Modify the data object to include the backgroundColor and borderColor properties
  const modifiedData = {
    ...data,
    datasets: data.datasets.map((dataset) => ({
      ...dataset,
      backgroundColor: colorPalette,
      borderColor: colorPalette, // Set the border color to be the same as the background color
      borderWidth: 2, // Optional: Set the border width
    })),
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="rounded-lg bg-white">
      <Bar data={modifiedData} options={chartOptions} />
    </div>
  );
}
