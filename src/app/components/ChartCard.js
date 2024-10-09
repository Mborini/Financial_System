import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Title, Tooltip, Legend);

export default function DoughnutChartCard({ title, data }) {
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
    <div className="  rounded-lg bg-white">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <Doughnut data={data} options={chartOptions} />
    </div>
  );
}