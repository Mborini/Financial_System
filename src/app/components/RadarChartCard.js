import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register necessary components for a Radar chart
ChartJS.register(RadialLinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function RadarChartCard({ title, data }) {
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
      <Radar data={data} options={chartOptions} />
    </div>
  );
}
