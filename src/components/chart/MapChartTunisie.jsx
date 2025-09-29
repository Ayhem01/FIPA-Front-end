import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

const MapChartTunisie = ({ data, title }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !Array.isArray(data) || data.length === 0) {
      console.warn("MapChart: données invalides ou vides");
      return;
    }

    const chart = echarts.init(chartRef.current);

    fetch("/maps/governorates.json") // Charger le fichier GeoJSON de la Tunisie
      .then((response) => response.json())
      .then((geoJson) => {
        echarts.registerMap("tunisia", geoJson); // Enregistrer la carte de la Tunisie

        const options = {
          title: {
            text: title || "Investment by Region",
            left: "center",
            textStyle: {
              fontSize: 16,
              fontWeight: "bold",
            },
          },
          tooltip: {
            trigger: "item",
            formatter: (params) => {
              const value = params.value ? params.value.toLocaleString() : "N/A";
              return `${params.name}: ${value} EUR`; // Afficher le nom du gouvernorat et l'investissement
            },
          },
          visualMap: {
            min: Math.min(...data.map((item) => parseFloat(item.investment))),
            max: Math.max(...data.map((item) => parseFloat(item.investment))),
            left: "left",
            top: "bottom",
            text: ["High", "Low"],
            calculable: true,
            inRange: {
              color: ["#e0ffff", "#006edd"], // Couleurs pour les valeurs faibles et élevées
            },
          },
          series: [
            {
              name: "Investment",
              type: "map",
              map: "tunisia", // Utiliser la carte de la Tunisie
              nameProperty: "gov_name_f",
              roam: true,
              data: data.map((item) => ({
                name: item.gov_name_f, // Nom du gouvernorat
                value: parseFloat(item.investment), // Montant de l'investissement
              })),
              emphasis: {
                itemStyle: {
                  areaColor: "#a1c4fd", // Couleur de surbrillance
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
  }, [data, title]);

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

export default MapChartTunisie;