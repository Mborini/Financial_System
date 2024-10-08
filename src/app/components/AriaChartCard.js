import { PolarArea } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, ArcElement, Title, Tooltip, Legend } from 'chart.js';

// Register necessary components for a Polar Area chart
ChartJS.register(RadialLinearScale, ArcElement, Title, Tooltip, Legend);

export default function PolarAreaChartCard({ title, data }) {
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  return (
    <div className="rounded-lg bg-white">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <PolarArea data={data} options={chartOptions} />
    </div>
  );
}
