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
import ReactApexChart from "react-apexcharts";
import { Row, Col, Typography } from "antd";
import eChart from "./configs/eChart";
import { useEffect, useState } from "react";

function EChart({ groups, summary = true, title = "" }) {
  const { Title, Paragraph } = Typography;
  const [refresh, forceRefresh] = useState(0);
  const items = [
    {
      Title: "50",
      user: "المستخدمون",
    },
    {
      Title: "60%",
      user: "نسبة الإصلاح الجمليّة",
    },
    {
      Title: "772",
      user: "التقارير",
    },
    {
      Title: "82",
      user: "العناصر",
    },
  ];

  const [chartData, setChartData] = useState(eChart);

  const [chartData1, setChartData1] = useState(eChart);
  const [chartData2, setChartData2] = useState(eChart);
  const [chartData3, setChartData3] = useState(eChart);

  useEffect(() => {
    /*if(groups){
      const updatedChartData = { ...chartData }; 

      groups[0].organization ? 
        updatedChartData.options.xaxis.categories = groups.map((group) => group.organization)
      :
      groups[0].organization_category ? 
        updatedChartData.options.xaxis.categories = groups.map((group) => group.organization_category)
      :
        updatedChartData.options.xaxis.categories = groups.map((group) => group.type);



      updatedChartData.series[0].data = groups.map((group) => group.total);
      setChartData(updatedChartData);
      console.log(updatedChartData.options.xaxis.categories, updatedChartData.series[0].data);
    
    }*/

    /*
    // this code mixes charts because it's using same state ?
    if (groups) {
      const updatedChartData = { ...eChart }; // Clone the default chart data


      if (groups[0]?.organization) {
        updatedChartData.options.xaxis.categories = groups.map((group) => group.organization);
      } else if (groups[0]?.organization_category) {
        updatedChartData.options.xaxis.categories = groups.map((group) => group.organization_category);
      } else if (groups[0]?.type) {
        updatedChartData.options.xaxis.categories = groups.map((group) => group.type);
      }

      updatedChartData.series[0].data = groups.map((group) => group.total);
      setChartData(updatedChartData);
    }
    */

    if (groups) {
      console.log("Setting groups :", groups[0]?.label);
        const updatedChartData = { ...chartData };
        updatedChartData.options.xaxis.categories = groups.map((group) => group.label);
        updatedChartData.series[0].data = groups.map((group) => group.total);
        setChartData(updatedChartData);
    }

/*
    if (groups) {
      // Update chartData1
      if (groups[0]?.organization) {
        console.log("Setting groups organization:", groups[0]?.organization);
        const updatedChartData = { ...chartData1 };
        updatedChartData.options.xaxis.categories = groups.map((group) => group.organization);
        updatedChartData.series[0].data = groups.map((group) => group.total);
        setChartData1(updatedChartData);
      }else {
        // Reset chartData3 if the data type doesn't match
        setChartData1(eChart);
      }

      // Update chartData2
      if (groups[0]?.organization_category) {
        console.log("Setting groups organization_category:", groups[0]?.organization_category);

        const updatedChartData = { ...chartData2 };
        updatedChartData.options.xaxis.categories = groups.map((group) => group.organization_category);
        updatedChartData.series[0].data = groups.map((group) => group.total);
        setChartData2(updatedChartData);
      }else {
        // Reset chartData3 if the data type doesn't match
        setChartData2(eChart);
      }

      // Update chartData3
      if (groups[0]?.type) {
        console.log("Setting groups type:", groups[0]?.type);

        const updatedChartData = { ...chartData3 };
        updatedChartData.options.xaxis.categories = groups.map((group) => group.type);
        updatedChartData.series[0].data = groups.map((group) => group.total);
        setChartData3(updatedChartData);
      } else {
        // Reset chartData3 if the data type doesn't match
        setChartData3(eChart);
      }
    }*/


  }, [groups])

  return (
    <>
      <div id="chart">
      {
          groups && 
          <ReactApexChart
            key={Math.random()}
            className="bar-chart"
            options={chartData.options}
            series={chartData.series}
            type="bar"
            height={220}
          />
          
        }


        
        {/**
         * 
         * 
         
          (groups && groups[0]?.organization) &&
          <ReactApexChart
            key={Math.random()}
            className="bar-chart"
            options={chartData1.options}
            series={chartData1.series}
            type="bar"
            height={220}
          />
        }
        {
          (groups && groups[0]?.organization_category) &&
          <ReactApexChart
            key={Math.random()}
            className="bar-chart"
            options={chartData2.options}
            series={chartData2.series}
            type="bar"
            height={220}
          />
        }
        {
          (groups && groups[0]?.type) &&
          <ReactApexChart
            key={Math.random()}
            className="bar-chart"
            options={chartData3.options}
            series={chartData3.series}
            type="bar"
            height={220}
          />
          */
        }

      </div>

      <div className="chart-vistior">
        <Title level={5}>{title}</Title>
        {
          summary &&
          <>
            <Paragraph className="lastweek">
              من الأسبوع الماضي <span className="bnb2">+30%</span>
            </Paragraph>
            <Paragraph className="lastweek">
              لقد قمنا بإنشاء خيارات متعددة لك لتجميعها وتخصيصها في صفحات مثالية بالبكسل.
            </Paragraph>
            <Row gutter>
              {items.map((v, index) => (
                <Col xs={6} xl={6} sm={6} md={6} key={index}>
                  <div className="chart-visitor-count">
                    <Title level={4}>{v.Title}</Title>
                    <span>{v.user}</span>
                  </div>
                </Col>
              ))}
            </Row>
          </>
        }

      </div>
    </>
  );
}

export default EChart;
