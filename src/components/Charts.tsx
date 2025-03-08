import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  LineController,
  BarController
} from "chart.js";
import { ChartData, ChartOptions } from "chart.js";
import { Chart } from "react-chartjs-2";

// Register necessary Chart.js components
ChartJS.register(BarController, LineController, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

// Interface for dataset structure
interface ChartDataset {
  labels: string[]; // X-axis labels (Weeks)
  datasets: {
    label: string; // Dataset label
    data: number[]; // Dataset values
    backgroundColor?: string; // Background color for bars
    borderColor?: string; // Border color for lines
    borderWidth?: number; // Border width for lines
    type?: "line" | "bar"; // Specifies if the dataset is a line or bar
    yAxisID: "y" | "y1"; // Determines which Y-axis the dataset belongs to
  }[];
}

const ChartPage: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData<"bar" | "line"> | undefined>(undefined);  // State to store chart data

  useEffect(() => {
    fetchGoogleSheetData(); // Fetch data from Google Sheets when component mounts
  }, []);

  const fetchGoogleSheetData = async () => {
    try {
      // Fetching data from Google Sheets using the provided URL
      const response = await fetch(
        "https://docs.google.com/spreadsheets/d/1EgMU8-gBeUs5j898IZAHI4WOdXe-ewRw/gviz/tq?tqx=out:json&gid=262792430"
      );
      const text = await response.text();
      
      // Extract JSON from the Google Sheets response
      const json = JSON.parse(text.substring(47, text.length - 2));

      const rows = json.table.rows;
      const weeks: string[] = [];
      const gmDollars: number[] = [];
      const gmPercent: number[] = [];

      // Iterate over rows to extract required data
      rows.forEach((row: any, index: number) => {
        weeks.push(`W${index + 1}`); // Label weeks as W1, W2, W3...
        gmDollars.push(row.c[1].v); // Extract GM Dollars
        gmPercent.push(row.c[3].v * 100); // Extract GM % and convert to percentage
      });

      // Format data for Chart.js
      const formattedData: ChartDataset = {
        labels: weeks,
        datasets: [
          {
            label: "GM Dollars",
            data: gmDollars,
            backgroundColor: "rgba(54, 162, 235, 0.6)", // Blue bars
            yAxisID: "y", // Left Y-axis
          },
          {
            label: "GM %",
            data: gmPercent,
            borderColor: "orange",
            borderWidth: 2,
            type: "line", // Line chart
            yAxisID: "y1", // Right Y-axis
          },
        ],
      };

      setChartData(formattedData as ChartData<"bar" | "line">); // Update state with formatted data
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Chart options configuration
  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false, // Allows dynamic resizing
    scales: {
      x: {
        title: { display: true, text: "Weeks" }, // X-axis label
      },
      y: {
        beginAtZero: true,
        position: "left",
        title: { display: true, text: "GM Dollars ($)" }, // Left Y-axis label
      },
      y1: {
        beginAtZero: true,
        position: "right",
        title: { display: true, text: "GM %" }, // Right Y-axis label
        grid: { drawOnChartArea: false }, // Prevent overlapping grid lines
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "80%", backgroundColor: "white" }}>
      {chartData ? (
        <Chart type="bar" data={chartData} options={options as ChartOptions<"bar" | "line">} width="100%" /> // Render bar chart if data is available
      ) : (
        // Show loading text while data is being fetched
        <div style={{ height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          Loading...
        </div>
      )}
    </div>
  );
};

export default ChartPage;