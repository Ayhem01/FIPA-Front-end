import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

const TreemapChart = ({ data, title }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !Array.isArray(data) || data.length === 0) {
      console.warn("TreemapChart: données invalides ou vides");
      return;
    }

    const chart = echarts.init(chartRef.current);

    // Fonction pour formater les tooltips
    const getTooltipFormatter = (info) => {
      const value = parseFloat(info.value).toLocaleString();
      const jobs = info.data.jobs || "N/A";
      const status = info.data.status || "N/A";
      return `
        <div class="tooltip-title">${echarts.format.encodeHTML(info.name)}</div>
        Investment: ${value} EUR<br>
        Jobs: ${jobs}<br>
        Status: ${status}
      `;
    };

    // Fonction pour configurer les niveaux
    const getLevelOption = () => [
      {
        color: [
          "#c23531",
          "#314656",
          "#61a0a8",
          "#dd8668",
          "#91c7ae",
          "#6e7074",
          "#bda29a",
          "#44525d",
          "#c4ccd3",
        ],
        itemStyle: {
          borderWidth: 3,
          gapWidth: 3,
        },
      },
      {
        colorAlpha: [0.5, 1],
        itemStyle: {
          gapWidth: 1,
        },
      },
    ];

    const options = {
      title: {
        text: title || "Hierarchical Projects by Sector",
        left: "center",
      },
      tooltip: {
        formatter: getTooltipFormatter,
      },
      series: [
        {
          type: "treemap",
          data: data,
          label: {
            position: "insideTopLeft",
            formatter: (params) => {
              const jobs = params.data.jobs || "N/A";
              const status = params.data.status || "N/A";
              return `${params.name}\nJobs: ${jobs}\nStatus: ${status}`;
            },
            rich: {
              name: {
                fontSize: 12,
                color: "#fff",
              },
              jobs: {
                fontSize: 10,
                color: "#fff",
              },
              status: {
                fontSize: 10,
                color: "#fff",
              },
            },
          },
          itemStyle: {
            borderColor: "black",
          },
          levels: getLevelOption(),
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

export default TreemapChart;