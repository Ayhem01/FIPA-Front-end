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
const barChart = {
    series: [
      {
        name: "التقارير",
        data: [/*450, 200, 100, 220, 500, 100, 400, 230, 200*/],
        color: "#fff",
      },
    ],
  
    options: {
      chart: {
        type: "bar",
        width: "100%",
        height: "100%",
        style: {
            direction: 'rtl'
        },

        toolbar: {
          show: true,
        },
      },
      title: {
        text: ""
      },
      plotOptions: {
        bar: {
          horizontal: true,
          columnWidth: "55%",
          borderRadius: 5,
          distributed: true
        },
      },
      dataLabels: {
        enabled: true,
        //textAnchor : 'end',
        //offsetX: 0,

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
          show: true,
          align: "right",
          minWidth: 0,
          maxWidth: 160,
          style: {
            colors: [
              "#000",
              "#fff",
              "#fff",
              "#fff",
              "#fff",
              "#fff",
              "#fff",
              "#fff",
              "#fff",
              "#fff",
            ],
          },
        },
      },
      yaxis: {
        opposite: true,
        labels: {
          show: true,
          align: "right",
          minWidth: 0,
          maxWidth: 160,
          style: {
            /*colors: [
              "#000",
              "#fff",
              "#fff",
              "#fff",
              "#fff",
              "#fff",
              "#fff",
              "#fff",
              "#fff",
              "#fff",
            ],*/
          },
          
        },
        reversed: true
      },
  
      tooltip: {
        y: {
          formatter: function (val) {
            return val;//return "$ " + val + " thousands";
          },
        },
      },
      export: {
        csv: {
          filename: undefined,
          columnDelimiter: ',',
          headerCategory: 'category',
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
  };
  
  export default barChart;
  