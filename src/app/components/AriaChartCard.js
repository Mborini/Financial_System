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
        display: false,
        text: title,
      },
    },
  };

  return (
    <div className="rounded-lg bg-white">
      <PolarArea data={data} options={chartOptions} />
    </div>
  );
}
