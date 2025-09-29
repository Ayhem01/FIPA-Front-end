import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

const InvestmentBySectorChart = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !Array.isArray(data) || data.length === 0) {
      console.warn("InvestmentBySectorChart: données invalides ou vides");
      return;
    }

    const chart = echarts.init(chartRef.current);

    const options = {
      title: {
        text: "Investment by Sector",
        left: "center",
        textStyle: {
          fontSize: 16,
          fontWeight: "bold",
        },
      },
      tooltip: {
        trigger: "item",
        formatter: "{b}: ${c}",
      },
      xAxis: {
        type: "category",
        data: data.map((item) => item.secteur), // Utiliser les noms des secteurs
        axisLabel: {
          rotate: 45,
          interval: 0,
        },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: "${value}",
        },
      },
      series: [
        {
          name: "Investment",
          type: "bar",
          data: data.map((item) => parseFloat(item.investment)), // Utiliser les valeurs d'investissement
          itemStyle: {
            color: "#52c41a",
          },
        },
      ],
    };

    chart.setOption(options);

    return () => {
      chart.dispose();
    };
  }, [data]);

  return (
    <div
      ref={chartRef}
      style={{
        width: "100%",
        height: "400px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      }}
    />
  );
};

export default InvestmentBySectorChart;