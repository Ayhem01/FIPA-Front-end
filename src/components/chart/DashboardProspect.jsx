import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  Row, Col, Spin, Alert, Card, Statistic, Table, Typography, 
  Button, Space, Input, Select, DatePicker, Tooltip, Badge,
  Progress, Avatar, Tag, Skeleton, Empty, Divider, Grid, Radio
} from "antd";
import {
  TrophyOutlined, ProjectOutlined, TeamOutlined, DollarOutlined,
  RiseOutlined, FallOutlined, EyeOutlined, ReloadOutlined,
  SearchOutlined, FilterOutlined, CalendarOutlined, ExportOutlined,
  ArrowUpOutlined, ArrowDownOutlined, PlusOutlined, SettingOutlined,
  ThunderboltOutlined, ClockCircleOutlined, CheckCircleOutlined,
  ExclamationCircleOutlined, SyncOutlined, FireOutlined,
  UserOutlined, ContactsOutlined, StarOutlined, CrownOutlined,
  LineChartOutlined, BarChartOutlined, AreaChartOutlined,
  PercentageOutlined, BarChartOutlined as BarChartFilled,
  UsergroupAddOutlined, GlobalOutlined, MoneyCollectOutlined,
  FunnelPlotOutlined, PieChartOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import ReactECharts from 'echarts-for-react';

import StatsChart from "./StatsChart";
import LineChart from "./lineChart";
import FunnelChart from "./FunnelChart";
import {
  fetchProspectsByStatus,
  fetchProspectsEvolutionMensuelle,
  // fetchProspectsPipelineProgression,
  fetchProspectsConversionRate,
  fetchProspectsByResponsable,
  fetchProspectsValueAnalysis,
  fetchProspectsConversionTimeAnalysis // Ajoutez cette ligne
} from "../../features/dashboardSlice";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;

// Composant de statistique animée
const AnimatedStatCard = ({ icon, title, value, prefix, suffix, trend, color, loading, delay = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!loading && value > 0) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [value, loading]);

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: delay * 0.1,
        ease: "easeOut"
      }
    },
    hover: {
      y: -5,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: {
        duration: 0.6,
        delay: delay * 0.1 + 0.2,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      style={{ height: '100%' }}
    >
      <Card 
        className="stat-card-modern"
        style={{
          height: '100%',
          background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`,
          border: `1px solid ${color}30`,
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <div className="stat-card-content">
          <div className="stat-header">
            <motion.div 
              className="stat-icon"
              variants={iconVariants}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                boxShadow: `0 4px 16px ${color}40`
              }}
            >
              {loading ? <SyncOutlined spin /> : icon}
            </motion.div>
            
            {trend && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay * 0.1 + 0.4 }}
                className="trend-indicator"
              >
                <Badge 
                  count={
                    <span style={{ 
                      color: trend > 0 ? '#52c41a' : '#ff4d4f',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      {trend > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                      {Math.abs(trend)}%
                    </span>
                  }
                  style={{
                    backgroundColor: trend > 0 ? '#52c41a15' : '#ff4d4f15',
                    border: `1px solid ${trend > 0 ? '#52c41a' : '#ff4d4f'}30`
                  }}
                />
              </motion.div>
            )}
          </div>

          <div className="stat-body">
            <Text type="secondary" style={{ fontSize: '14px', fontWeight: 500 }}>
              {title}
            </Text>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay * 0.1 + 0.3 }}
            >
              {loading ? (
                <Skeleton.Input style={{ width: 100, height: 32 }} active />
              ) : (
                <Title level={2} style={{ 
                  margin: '8px 0 0 0', 
                  color: color,
                  fontWeight: 700,
                  fontSize: '28px'
                }}>
                  {prefix}
                  <motion.span
                    key={displayValue}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {displayValue.toLocaleString()}
                  </motion.span>
                  {suffix}
                </Title>
              )}
            </motion.div>
          </div>
        </div>

        {/* Effet de brillance */}
        <motion.div
          className="shine-effect"
          style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            transform: 'skewX(-25deg)'
          }}
          animate={{
            left: ['100%', '200%']
          }}
          transition={{
            duration: 2,
            delay: delay * 0.1 + 1,
            ease: "easeInOut"
          }}
        />
      </Card>
    </motion.div>
  );
};

// Composant de graphique animé
const AnimatedChartCard = ({ title, children, loading, extra, delay = 0 }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        delay: delay * 0.1,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      style={{ height: '100%' }}
    >
      <Card
        className="chart-card-modern"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay * 0.1 + 0.2 }}
            >
              <div style={{
                width: '8px',
                height: '24px',
                borderRadius: '4px',
                background: 'linear-gradient(135deg, #1890ff, #096dd9)'
              }} />
            </motion.div>
            <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
              {title}
            </Title>
          </div>
        }
        extra={extra}
        style={{
          height: '100%',
          borderRadius: '16px',
          border: '1px solid #f0f0f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}
        bodyStyle={{ 
          padding: '24px',
          height: loading ? '300px' : 'auto'
        }}
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '250px'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  style={{ marginBottom: '16px' }}
                >
                  <SyncOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                </motion.div>
                <Text type="secondary">Chargement des données...</Text>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

const DashboardProspect = () => {
  const dispatch = useDispatch();
  const screens = useBreakpoint();
  const [refreshing, setRefreshing] = useState(false);
  const [evolutionChartType, setEvolutionChartType] = useState('line');
  const [conversionChartType, setConversionChartType] = useState('combination');

  const {
    prospectsByStatus,
    prospectsEvolutionMensuelle,
    // prospectsPipelineProgression,
    prospectsConversionRate,
    prospectsByResponsable,
    prospectsValueAnalysis,
    prospectsConversionTimeAnalysis
  } = useSelector((state) => state.dashboard);

  useEffect(() => {
    loadData();
  }, [dispatch]);

  // Ajout d'un useEffect pour déboguer les données
  useEffect(() => {
    if (prospectsByStatus.data) {
      console.log("DEBUG - prospectsByStatus.data:", prospectsByStatus.data);
      console.log("DEBUG - Type:", typeof prospectsByStatus.data);
      console.log("DEBUG - Is Array:", Array.isArray(prospectsByStatus.data));
      
      if (Array.isArray(prospectsByStatus.data) && prospectsByStatus.data.length > 0) {
        console.log("DEBUG - First item:", prospectsByStatus.data[0]);
        console.log("DEBUG - First item keys:", Object.keys(prospectsByStatus.data[0]));
      }
    }
  }, [prospectsByStatus.data]);

  const loadData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchProspectsByStatus()),
        dispatch(fetchProspectsEvolutionMensuelle()),
        // dispatch(fetchProspectsPipelineProgression()),
        dispatch(fetchProspectsConversionRate()),
        dispatch(fetchProspectsByResponsable()),
        dispatch(fetchProspectsValueAnalysis()),
        dispatch(fetchProspectsConversionTimeAnalysis())
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getConversionTimeAnalysisChartOption = () => {
  console.log("prospectsConversionTimeAnalysis.data:", prospectsConversionTimeAnalysis.data);
  
  if (!prospectsConversionTimeAnalysis.data || !Array.isArray(prospectsConversionTimeAnalysis.data) || prospectsConversionTimeAnalysis.data.length === 0) {
    return null;
  }

  const xAxisData = prospectsConversionTimeAnalysis.data.map(item => item.name);
  const avgDaysData = prospectsConversionTimeAnalysis.data.map(item => item.avg_days);
  const prospectsCountData = prospectsConversionTimeAnalysis.data.map(item => item.prospects_count);

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      },
      formatter: function(params) {
        let result = `<div style="margin: 0; padding: 8px; font-weight: bold;">${params[0].axisValue}</div>`;
        params.forEach(param => {
          if (param.seriesName === 'Temps Moyen (jours)') {
            result += `<div style="margin: 4px 0;">
              <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>
              ${param.seriesName}: ${param.value} jour(s)
            </div>`;
          } else {
            result += `<div style="margin: 4px 0;">
              <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>
              ${param.seriesName}: ${param.value} prospect(s)
            </div>`;
          }
        });
        return result;
      }
    },
    legend: {
      data: ['Temps Moyen (jours)', 'Nombre de Prospects'],
      top: 20
    },
    xAxis: [
      {
        type: 'category',
        data: xAxisData,
        axisPointer: {
          type: 'shadow'
        },
        axisLabel: {
          interval: 0,
          rotate: 45,
          fontSize: 10
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: 'Temps (jours)',
        position: 'left',
        axisLabel: {
          formatter: '{value} j'
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#f0f0f0'
          }
        }
      },
      {
        type: 'value',
        name: 'Nombre',
        position: 'right',
        axisLabel: {
          formatter: '{value}'
        }
      }
    ],
    grid: {
      top: 80,
      left: 80,
      right: 80,
      bottom: 120
    },
    series: [
      {
        name: 'Temps Moyen (jours)',
        type: 'bar',
        data: avgDaysData,
        itemStyle: {
          color: '#1890ff',
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: '#096dd9'
          }
        }
      },
      {
        name: 'Nombre de Prospects',
        type: 'line',
        yAxisIndex: 1,
        data: prospectsCountData,
        itemStyle: {
          color: '#52c41a'
        },
        lineStyle: {
          width: 3
        },
        symbol: 'circle',
        symbolSize: 8
      }
    ],
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  };
};

  // Configuration du graphique des prospects par statut - VERSION CORRIGÉE
  const getProspectsByStatusChartOption = () => {
    console.log("CHART - prospectsByStatus.data:", prospectsByStatus.data);
    
    if (!prospectsByStatus.data) {
      console.log("CHART - No data available");
      return null;
    }
    
    if (!Array.isArray(prospectsByStatus.data)) {
      console.log("CHART - Data is not an array:", typeof prospectsByStatus.data);
      return null;
    }
    
    if (prospectsByStatus.data.length === 0) {
      console.log("CHART - Data array is empty");
      return null;
    }

    // Validation et mapping sécurisés
    const data = prospectsByStatus.data
      .filter(item => item && typeof item === 'object') // Filtrer les éléments invalides
      .map((item, index) => {
        const mappedItem = {
          value: Number(item.value) || 0,
          name: String(item.name || item.label || `Statut ${index + 1}`),
          itemStyle: {
            color: item.color || '#1890ff'
          }
        };
        console.log("CHART - Mapped item:", mappedItem);
        return mappedItem;
      })
      .filter(item => item.value > 0 && item.name && item.name !== 'undefined'); // Double filtrage

    console.log("CHART - Final mapped data:", data);

    if (data.length === 0) {
      console.log("CHART - No valid data after mapping");
      return null;
    }

    // Vérification finale avant de créer l'option
    const legendData = data.map(item => item.name);
    console.log("CHART - Legend data:", legendData);

    return {
      tooltip: {
        trigger: 'item',
        formatter: function(params) {
          return `${params.seriesName}<br/>${params.name}: ${params.value} (${params.percent}%)`;
        }
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: legendData,
        textStyle: {
          fontSize: 12
        }
      },
      series: [
        {
          name: 'Prospects par Statut',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: data
        }
      ],
      animation: true,
      animationType: 'scale',
      animationDelay: (idx) => idx * 100
    };
  };

  // Configuration du graphique d'évolution mensuelle
  const getEvolutionChartOption = () => {
    console.log("prospectsEvolutionMensuelle.data:", prospectsEvolutionMensuelle.data);
    
    if (!prospectsEvolutionMensuelle.data || !Array.isArray(prospectsEvolutionMensuelle.data) || prospectsEvolutionMensuelle.data.length === 0) {
      return null;
    }

    const xAxisData = prospectsEvolutionMensuelle.data.map(item => item.period || item.name);
    const totalData = prospectsEvolutionMensuelle.data.map(item => item.total);
    const convertedData = prospectsEvolutionMensuelle.data.map(item => parseInt(item.converted) || 0);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        }
      },
      toolbox: {
        feature: {
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ['line', 'bar'] },
          restore: { show: true },
          saveAsImage: { show: true }
        }
      },
      legend: {
        data: ['Total', 'Convertis']
      },
      xAxis: [
        {
          type: 'category',
          data: xAxisData,
          axisPointer: {
            type: 'shadow'
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: 'Nombre',
          min: 0,
          axisLabel: {
            formatter: '{value}'
          }
        }
      ],
      series: [
        {
          name: 'Total',
          type: evolutionChartType,
          data: totalData,
          itemStyle: {
            color: '#1890ff'
          }
        },
        {
          name: 'Convertis',
          type: evolutionChartType,
          data: convertedData,
          itemStyle: {
            color: '#52c41a'
          }
        }
      ]
    };
  };

  // Configuration du graphique de taux de conversion
  const getConversionRateChartOption = () => {
    console.log("prospectsConversionRate.data:", prospectsConversionRate.data);
    
    if (!prospectsConversionRate.data || !prospectsConversionRate.data.monthly_trend) {
      return null;
    }

    const monthlyData = prospectsConversionRate.data.monthly_trend;
    const xAxisData = monthlyData.map(item => item.month);
    const totalData = monthlyData.map(item => item.total);
    const rateData = monthlyData.map(item => item.rate);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: ['Total Prospects', 'Taux de Conversion']
      },
      xAxis: [
        {
          type: 'category',
          data: xAxisData
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: 'Nombre',
          position: 'left'
        },
        {
          type: 'value',
          name: 'Taux (%)',
          position: 'right',
          axisLabel: {
            formatter: '{value}%'
          }
        }
      ],
      series: [
        {
          name: 'Total Prospects',
          type: 'bar',
          data: totalData,
          itemStyle: {
            color: '#1890ff'
          }
        },
        {
          name: 'Taux de Conversion',
          type: 'line',
          yAxisIndex: 1,
          data: rateData,
          itemStyle: {
            color: '#52c41a'
          }
        }
      ]
    };
  };

  // Calcul des statistiques de base
  const getBasicStats = () => {
    if (!prospectsConversionRate.data?.summary) {
      return {
        totalProspects: 0,
        converted: 0,
        lost: 0,
        qualified: 0,
        conversionRate: 0,
        lossRate: 0
      };
    }

    const summary = prospectsConversionRate.data.summary;
    return {
      totalProspects: summary.total_prospects || 0,
      converted: summary.converted || 0,
      lost: summary.lost || 0,
      qualified: summary.qualified || 0,
      conversionRate: summary.conversion_rate || 0,
      lossRate: summary.loss_rate || 0
    };
  };

  const stats = getBasicStats();

  // Configuration du tableau des responsables
  const responsableColumns = [
    {
      title: "Responsable",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar 
            size="small" 
            style={{ backgroundColor: '#1890ff' }}
            icon={<UserOutlined />}
          />
          <Text strong>{text}</Text>
        </div>
      ),
    },
    {
      title: "Total",
      dataIndex: "total_prospects",
      key: "total_prospects",
      sorter: (a, b) => a.total_prospects - b.total_prospects,
    },
    {
      title: "Convertis",
      dataIndex: "converted",
      key: "converted",
      render: (value) => (
        <Tag color="green">{parseInt(value) || 0}</Tag>
      ),
    },
    {
      title: "Taux",
      dataIndex: "conversion_rate",
      key: "conversion_rate",
      render: (rate) => (
        <Progress 
          percent={Math.round(rate)} 
          size="small" 
          format={percent => `${percent}%`}
          strokeColor={rate > 50 ? '#52c41a' : rate > 25 ? '#faad14' : '#ff4d4f'}
        />
      ),
      sorter: (a, b) => a.conversion_rate - b.conversion_rate,
    },
    {
      title: "Valeur Totale",
      dataIndex: "total_value",
      key: "total_value",
      render: (value) => (
        <Tag color="blue">{parseInt(value)?.toLocaleString()} €</Tag>
      ),
    }
  ];

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="dashboard-container-modern">
      {/* En-tête animé */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="dashboard-header"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '32px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <motion.div
          className="header-background"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }}
          animate={{
            backgroundPosition: ['0px 0px', '60px 60px']
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        <Row justify="space-between" align="middle" style={{ position: 'relative', zIndex: 1 }}>
          <Col>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Title level={1} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
                <UsergroupAddOutlined style={{ marginRight: '16px' }} />
                Tableau de Bord Prospects
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: '8px 0 0 0' }}>
                Analyse globale des prospects et performance commerciale
              </Paragraph>
            </motion.div>
          </Col>
          <Col>
            
          </Col>
        </Row>
      </motion.div>

      {/* Statistiques principales */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<UsergroupAddOutlined />}
            title="Total Prospects"
            value={stats.totalProspects}
            color="#1890ff"
            loading={prospectsConversionRate.loading}
            delay={0}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<CheckCircleOutlined />}
            title="Convertis"
            value={stats.converted}
            color="#52c41a"
            loading={prospectsConversionRate.loading}
            delay={1}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<StarOutlined />}
            title="Qualifiés"
            value={stats.qualified}
            color="#722ed1"
            loading={prospectsConversionRate.loading}
            delay={2}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<ExclamationCircleOutlined />}
            title="Perdus"
            value={stats.lost}
            color="#ff4d4f"
            loading={prospectsConversionRate.loading}
            delay={3}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<TrophyOutlined />}
            title="Taux Conversion"
            value={stats.conversionRate}
            suffix="%"
            color="#fa8c16"
            loading={prospectsConversionRate.loading}
            delay={4}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<MoneyCollectOutlined />}
            title="Valeur Potentielle"
            value={prospectsValueAnalysis.data?.summary?.total_value || 0}
            prefix="€"
            color="#13c2c2"
            loading={prospectsValueAnalysis.loading}
            delay={5}
          />
        </Col>
      </Row>

      {/* Graphiques principaux */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} lg={12}>
          <AnimatedChartCard
            title="Répartition par Statut"
            loading={prospectsByStatus.loading}
            delay={0}
            
          >
            {prospectsByStatus.error ? (
              <Alert 
                message="Erreur" 
                description={prospectsByStatus.error} 
                type="error" 
                showIcon 
              />
            ) : (() => {
              const chartOption = getProspectsByStatusChartOption();
              
              if (!chartOption) {
                return (
                  <Empty 
                    description="Aucune donnée de statut disponible" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                );
              }
              
              return (
                <ReactECharts
                  option={chartOption}
                  style={{ height: '400px' }}
                  opts={{ renderer: 'canvas' }}
                  onError={(error) => {
                    console.error('ECharts error:', error);
                  }}
                />
              );
            })()}
          </AnimatedChartCard>
        </Col>
         <Col xs={24} lg={12}>
          <AnimatedChartCard
            title="Analyse de Valeur"
            loading={prospectsValueAnalysis.loading}
            delay={1}
            
          >
            {prospectsValueAnalysis.error ? (
              <Alert
                message="Erreur"
                description={prospectsValueAnalysis.error}
                type="error"
                showIcon
              />
            ) : prospectsValueAnalysis.data?.ranges ? (
              <div>
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                  <Col span={8}>
                    <Statistic
                      title="Valeur Totale"
                      value={prospectsValueAnalysis.data.summary.total_value}
                      prefix="€"
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Valeur Moyenne"
                      value={prospectsValueAnalysis.data.summary.average_value}
                      prefix="€"
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Prospects avec Valeur"
                      value={prospectsValueAnalysis.data.summary.prospects_with_value}
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Col>
                </Row>
                
                <ReactECharts
                  option={{
                    tooltip: { trigger: 'item' },
                    series: [{
                      type: 'pie',
                      radius: ['40%', '70%'],
                      data: prospectsValueAnalysis.data.ranges.map((item, index) => ({
                        value: item.count,
                        name: item.range,
                        itemStyle: {
                          color: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'][index % 5]
                        }
                      }))
                    }]
                  }}
                  style={{ height: '300px' }}
                />
              </div>
            ) : (
              <Empty description="Aucune donnée d'analyse disponible" />
            )}
          </AnimatedChartCard>
        </Col>

        {/* <Col xs={24} lg={12}>
          <AnimatedChartCard
            title="Progression du Pipeline"
            loading={prospectsPipelineProgression.loading}
            delay={1}
            extra={
              <Button type="text" icon={<SettingOutlined />} size="small" />
            }
          >
            {prospectsPipelineProgression.error ? (
              <Alert 
                message="Erreur" 
                description={prospectsPipelineProgression.error} 
                type="error" 
                showIcon 
              />
            ) : Array.isArray(prospectsPipelineProgression.data) && prospectsPipelineProgression.data.length > 0 ? (
              <FunnelChart
                data={prospectsPipelineProgression.data.map(item => ({
                  stage_name: item.stage_name,
                  total_prospects: item.total_prospects,
                  completed_prospects: item.completed_prospects,
                  completion_rate: item.completion_rate
                }))}
                title="Pipeline Progression"
              />
            ) : (
              <Empty description="Aucune donnée de pipeline disponible" />
            )}
          </AnimatedChartCard>
        </Col> */}
      </Row>

      {/* Évolution mensuelle */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} lg={12}>
          <AnimatedChartCard
            title="Évolution Mensuelle des Prospects"
            loading={prospectsEvolutionMensuelle.loading}
            delay={0}
            extra={
              <Space>
                <Text strong style={{ color: '#666' }}>Type:</Text>
                <Radio.Group 
                  value={evolutionChartType} 
                  onChange={(e) => setEvolutionChartType(e.target.value)}
                  size="small"
                  style={{ marginLeft: 8 }}
                >
                  <Radio.Button value="line">
                    <LineChartOutlined />
                  </Radio.Button>
                  <Radio.Button value="bar">
                    <BarChartOutlined />
                  </Radio.Button>
                  {/* <Radio.Button value="area">
                    <AreaChartOutlined />
                  </Radio.Button> */}
                </Radio.Group>
              </Space>
            }
          >
            {prospectsEvolutionMensuelle.error ? (
              <Alert 
                message="Erreur" 
                description={prospectsEvolutionMensuelle.error} 
                type="error" 
                showIcon 
              />
            ) : getEvolutionChartOption() ? (
              <ReactECharts
                option={getEvolutionChartOption()}
                style={{ height: '400px' }}
                opts={{ renderer: 'canvas' }}
              />
            ) : (
              <Empty description="Aucune donnée d'évolution disponible" />
            )}
          </AnimatedChartCard>
        </Col>
         <Col xs={24} lg={12}>
          <AnimatedChartCard
            title="Taux de Conversion des Prospects"
            loading={prospectsConversionRate.loading}
            delay={0}
            extra={
              <Space>
                <Text strong style={{ color: '#666' }}>Vue:</Text>
                <Radio.Group 
                  value={conversionChartType} 
                  onChange={(e) => setConversionChartType(e.target.value)}
                  size="small"
                  style={{ marginLeft: 8 }}
                >
                  <Radio.Button value="combination">
                    <BarChartFilled />
                  </Radio.Button>
                  {/* <Radio.Button value="line">
                    <LineChartOutlined />
                  </Radio.Button>
                  <Radio.Button value="bar">
                    <BarChartOutlined />
                  </Radio.Button> */}
                </Radio.Group>
              </Space>
            }
          >
            {prospectsConversionRate.error ? (
              <Alert 
                message="Erreur" 
                description={prospectsConversionRate.error} 
                type="error" 
                showIcon 
              />
            ) : getConversionRateChartOption() ? (
              <ReactECharts
                option={getConversionRateChartOption()}
                style={{ height: '400px' }}
                opts={{ renderer: 'canvas' }}
              />
            ) : (
              <Empty description="Aucune donnée de conversion disponible" />
            )}
          </AnimatedChartCard>
        </Col>
        
      </Row>

     

      {/* Performance par responsable et analyse de valeur */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} lg={12}>
          <AnimatedChartCard
            title="Performance par Responsable"
            loading={prospectsByResponsable.loading}
            delay={0}
         
            
          >
            {prospectsByResponsable.error ? (
              <Alert
                message="Erreur"
                description={prospectsByResponsable.error}
                type="error"
                showIcon
              />
            ) : Array.isArray(prospectsByResponsable.data) && prospectsByResponsable.data.length > 0 ? (
              <Table
                dataSource={prospectsByResponsable.data}
                columns={responsableColumns}
                rowKey="name"
                pagination={{ 
                  pageSize: 5,
                  showSizeChanger: false,
                  showQuickJumper: true
                }}
                size="small"
                style={{ borderRadius: '8px', overflow: 'hidden' }}
              />
            ) : (
              <Empty description="Aucune donnée de performance disponible" />
            )}
          </AnimatedChartCard>
        </Col>
        <Col xs={24} lg={12}>
    <AnimatedChartCard
      title="Analyse du Temps de Conversion par Étape"
      loading={prospectsConversionTimeAnalysis.loading}
      delay={0}
      extra={
        <Space>
          <Text strong style={{ color: '#666' }}>
            Temps moyen de progression par étape du pipeline
          </Text>
        </Space>
      }
    >
      {prospectsConversionTimeAnalysis.error ? (
        <Alert 
          message="Erreur" 
          description={prospectsConversionTimeAnalysis.error} 
          type="error" 
          showIcon 
        />
      ) : getConversionTimeAnalysisChartOption() ? (
        <div>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Statistic
                title="Étapes Analysées"
                value={prospectsConversionTimeAnalysis.data?.length || 0}
                prefix={<FunnelPlotOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Temps Moyen Total"
                value={prospectsConversionTimeAnalysis.data?.reduce((sum, item) => sum + item.avg_days, 0)?.toFixed(1) || 0}
                suffix="jours"
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Total de convertis des étapes"
                value={prospectsConversionTimeAnalysis.data?.reduce((sum, item) => sum + item.prospects_count, 0) || 0}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Col>
          </Row>
          
          <ReactECharts
            option={getConversionTimeAnalysisChartOption()}
            style={{ height: '450px' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>
      ) : (
        <Empty description="Aucune donnée d'analyse de temps disponible" />
      )}
    </AnimatedChartCard>
  </Col>

       
      </Row>

      {/* Styles CSS intégrés */}
      <style jsx>{`
        .dashboard-container-modern {
          padding: 24px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
        }

        .stat-card-modern {
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .stat-card-modern:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
        }

        .stat-card-content {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .stat-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .chart-card-modern {
          transition: all 0.3s ease;
        }

        .chart-card-modern:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
        }

        .dashboard-header {
          position: relative;
        }

        .trend-indicator {
          padding: 4px 8px;
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        @media (max-width: 768px) {
          .dashboard-container-modern {
            padding: 16px;
          }
          
          .dashboard-header {
            padding: 20px !important;
            text-align: center;
          }
          
          .stat-card-modern {
            margin-bottom: 16px;
          }
        }

        @media (max-width: 576px) {
          .dashboard-header {
            border-radius: 12px !important;
          }
          
          .chart-card-modern {
            margin-bottom: 16px;
          }
        }

        /* Animations pour les éléments de chargement */
        @keyframes shimmer {
          0% { background-position: -468px 0; }
          100% { background-position: 468px 0; }
        }

        .loading-shimmer {
          animation: shimmer 1.5s ease-in-out infinite;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 400% 100%;
        }

        /* Effet de parallaxe pour le header */
        .header-background {
          background-attachment: fixed;
        }

        /* Styles pour les graphiques responsifs */
        .chart-container {
          width: 100%;
          height: 300px;
          min-height: 250px;
        }

        @media (max-width: 1200px) {
          .chart-container {
            height: 280px;
          }
        }

        @media (max-width: 768px) {
          .chart-container {
            height: 250px;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardProspect;