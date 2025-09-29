import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

const HeatmapChart = ({ data, title }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !Array.isArray(data) || data.length === 0) {
      console.warn("HeatmapChart: données invalides ou vides");
      return;
    }

    const chart = echarts.init(chartRef.current);

    // Préparer les données pour la Heatmap
    const regions = data.map((item) => item.region);
    const investments = data.map((item) => parseFloat(item.investment));

    const options = {
      title: {
        text: title || "Investment by Region",
        left: "center",
      },
      tooltip: {
        trigger: "item",
        formatter: (info) => {
          return `${info.name}<br>Investment: ${info.value.toLocaleString()} EUR`;
        },
      },
      xAxis: {
        type: "category",
        data: regions,
        name: "Regions",
        nameLocation: "middle",
        nameGap: 30,
      },
      yAxis: {
        type: "category",
        data: ["Investment"], // Ajout d'une catégorie pour l'axe Y
        name: "Investment",
        nameLocation: "middle",
        nameGap: 50,
      },
      visualMap: {
        min: Math.min(...investments),
        max: Math.max(...investments),
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: "10%",
      },
      series: [
        {
          type: "heatmap",
          data: data.map((item) => [item.region, "Investment", parseFloat(item.investment)]), // Ajout de "Investment" pour l'axe Y
          label: {
            show: true,
            formatter: "{b}: {c}",
          },
          itemStyle: {
            borderColor: "#fff",
            borderWidth: 1,
          },
        },
      ],
    };

    chart.setOption(options);

    return () => {
      chart.dispose();
    };
  }, [data, title]);

  return <div ref={chartRef} style={{ width: "100%", height: "500px" }} />;
};

export default HeatmapChart;