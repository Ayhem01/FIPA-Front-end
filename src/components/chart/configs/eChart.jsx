/*!
=========================================================
* Muse Ant Design Dashboard - v1.0.0
=========================================================
* Product Page: https://www.creative-tim.com/product/muse-ant-design-dashboard
* Copyright 2021 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/muse-ant-design-dashboard/blob/main/LICENSE.md)
* Coded by Creative Tim
=========================================================
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/
const eChart = {
  series: [
    {
      name: "التقارير",
      data: [/*450, 200, 100, 220, 500, 100, 400, 230, 200*/],
      color: "#bbb",
    },
  ],

  options: {
    chart: {
      type: "bar",
      width: "100%",
      height: "auto",
      direction: 'rtl', 

      toolbar: {
        show: true,
        export: {
          csv: {
            filename: undefined,
            columnDelimiter: ',',
            headerCategory: 'الاسم',
            headerValue: 'value',
            dateFormatter(timestamp) {
              return new Date(timestamp).toDateString()
            }
          },
          svg: {
            filename: undefined,
          },
          png: {
            filename: undefined,
          },
        },
      },
    },
    theme: {
      mode: 'light',
      palette: 'palette4',
      monochrome: {
        enabled: false,
        color: '#255aee',
        shadeTo: 'gray',
        shadeIntensity: 0.65
      },
    },
    title: {
      text: ""
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 5,
        distributed: true
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 1,
      colors: ["transparent"],
    },
    grid: {
      show: true,
      borderColor: "#ccc",
      strokeDashArray: 2,
    },
    xaxis: {
      type: 'category',
      categories: [
        /*
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
      */],
      labels: {
        show: false,
        align: "right",
        minWidth: 0,
        maxWidth: 100,
        rotate: 55, 
        style: {
          colors: 
            "#bbb",
        },
      },
      opposite : true,
    },
    yaxis: {
      labels: {
        show: true,
        align: "right",
        minWidth: 0,
        maxWidth: 160,
        style: {
          colors: 
            "#bbb",
        },
      },
    },
    legend: {
      show: true,
      labels: {
        colors: "#bbb",  // TEXT COLOR CAN BE CHANGED HERE
        useSeriesColors: false
      },
    },

    tooltip: {
      y: {
        formatter: function (val) {
          return val;//return "$ " + val + " thousands";
        },
      },
    },
    
  },
};

export default eChart;
