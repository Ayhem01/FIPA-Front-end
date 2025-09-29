import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

const FunnelChart = ({ data, title }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !Array.isArray(data) || data.length === 0) {
      console.warn("FunnelChart: données invalides ou vides");
      return;
    }

    const chart = echarts.init(chartRef.current);

    const options = {
      title: {
        text: title || "Pipeline Progression",
        left: "center",
      },
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b} : {c}",
      },
      toolbox: {
        feature: {
          dataView: { readOnly: false },
          restore: {},
          saveAsImage: {},
        },
      },
      legend: {
        data: data.map((item) => item.name), // Générer automatiquement les légendes
        bottom: 10,
      },
      series: [
        {
          name: "Pipeline Progression",
          type: "funnel",
          left: "10%",
          top: 60,
          bottom: 60,
          width: "80%",
          min: 0,
          max: Math.max(...data.map((item) => item.value)), // Ajuster la valeur maximale
          minSize: "0%",
          maxSize: "100%",
          sort: "descending",
          gap: 2,
          label: {
            show: true,
            position: "inside",
            formatter: "{b}: {c}",
          },
          labelLine: {
            length: 10,
            lineStyle: {
              width: 1,
              type: "solid",
            },
          },
          itemStyle: {
            borderColor: "#fff",
            borderWidth: 1,
          },
          emphasis: {
            label: {
              fontSize: 20,
            },
          },
          data: data, // Utiliser les données passées au composant
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

export default FunnelChart;