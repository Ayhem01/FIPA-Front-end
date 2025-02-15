


const pieChart = {
series: [25, 15, 44, 55, 41, 17],
options: {
  chart: {
    width: '100%',
    type: 'pie',
  },
  labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  theme: {
    monochrome: {
      enabled: true
    }
  },
  fill: {
    type: 'gradient',
  },

  plotOptions: {
    pie: {
      dataLabels: {
        offset: -5
      },
      customScale: 1
    }
  },
  title: {
    text: ""
  },
  dataLabels: {
    formatter(val, opts) {
      const name = opts.w.globals.labels[opts.seriesIndex]
      return [name, val.toFixed(1) + '%']
    }
  },
  legend: {
    show: true,
    position: 'bottom'
  },

},


};

export default pieChart;