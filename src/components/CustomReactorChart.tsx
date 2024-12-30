import { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";

interface TemperatureChartProps {
  temperatureHistory: number[];
}

export function CustomReactorChart({
  temperatureHistory,
}: TemperatureChartProps) {
  const ctx = useRef(null); // Reference to the canvas element
  const chartInstance = useRef<Chart | null>(null); // Store the Chart.js instance

  // Initialize and update the chart
  useEffect(() => {
    if (ctx.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy(); // Destroy previous chart instance to avoid duplicates
      }

      chartInstance.current = new Chart(ctx.current, {
        type: "line",
        data: {
          labels: temperatureHistory.map((_, index) => `${index * 2}s`), // x-axis labels
          datasets: [
            {
              label: "Temperature",
              data: temperatureHistory,
            },
          ],
        },
        options: {
          animation: {
            duration: 0, // Disable animation for real-time updates
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Time (s)",
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Temperature",
              },
            },
          },
        },
      });
    }
  }, [temperatureHistory]); // Update chart when temperatureHistory changes

  return <canvas ref={ctx}></canvas>;
}
