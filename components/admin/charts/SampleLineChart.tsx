// components/admin/charts/SampleLineChart.tsx
"use client"; // Chart.js client tarafında çalışır

import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SampleLineChartProps {
  chartData: ChartData<"line">;
  titleText?: string;
}

const SampleLineChart: React.FC<SampleLineChartProps> = ({
  chartData,
  titleText,
}) => {
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: !!titleText,
        text: titleText || "",
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  return <Line options={options} data={chartData} />;
};

export default SampleLineChart;
