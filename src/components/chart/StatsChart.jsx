import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

const StatsChart = ({ data, title, type = "pie" }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !Array.isArray(data) || data.length === 0) {
      console.warn("StatsChart: données invalides ou vides");
      return;
    }

    const chart = echarts.init(chartRef.current);

    const options = {
      title: {
        text: title,
        left: "center",
      },
      tooltip: {
        trigger: "item",
      },
      xAxis: type === "bar" ? { type: "category", data: data.map((item) => item.name) } : undefined, // Axe X pour les graphiques en barres
      yAxis: type === "bar" ? { type: "value" } : undefined, // Axe Y pour les graphiques en barres
      series: [
        {
          name: title,
          type: type,
          data: data.map((item) => ({
            name: item.name,
            value: item.value,
          })),
        },
      ],
    };

    chart.setOption(options);

    return () => {
      chart.dispose();
    };
  }, [data, title, type]);

  return <div ref={chartRef} style={{ width: "100%", height: "400px" }} />;
};

export default StatsChart;