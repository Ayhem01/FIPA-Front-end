import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

const MapChart = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !Array.isArray(data) || data.length === 0) {
      console.warn("MapChart: données invalides ou vides");
      return;
    }

    const chart = echarts.init(chartRef.current);

    fetch("/maps/world.json")
      .then((response) => response.json())
      .then((geoJson) => {
        echarts.registerMap("world", geoJson);

        const options = {
          title: {
            text: "Invites by Country",
            left: "center",
            textStyle: {
              fontSize: 16,
              fontWeight: "bold",
            },
          },
          tooltip: {
            trigger: "item",
            formatter: "{b}: {c}",
          },
          visualMap: {
            min: 0,
            max: Math.max(...data.map((item) => item.value)),
            left: "left",
            top: "bottom",
            text: ["High", "Low"],
            calculable: true,
            inRange: {
              color: ["#e0ffff", "#006edd"],
            },
          },
          series: [
            {
              name: "Invites",
              type: "map",
              map: "world",
              roam: true,
              data: data,
              emphasis: {
                itemStyle: {
                  areaColor: "#a1c4fd",
                  borderColor: "#fff",
                  borderWidth: 1,
                },
              },
            },
          ],
        };

        chart.setOption(options);
      })
      .catch((error) => console.error("Erreur lors du chargement de la carte :", error));

    return () => {
      chart.dispose();
    };
  }, [data]);

  return (
    <div
      ref={chartRef}
      style={{
        width: "100%",
        height: "500px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      }}
    />
  );
};

export default MapChart;