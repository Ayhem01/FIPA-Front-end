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
  UsergroupAddOutlined, GlobalOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import ReactECharts from 'echarts-for-react';

import MapChart from "./MapChart";
import {
  fetchInvitesByCountry,
  fetchInviteStats,
  fetchInvitesByStatus,
  fetchInvitesByPotentiel,
  fetchInvitesEvolution,
  fetchInvitesConversionRate,
  fetchInvitesByType
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
    if (!loading && value !== undefined) {
      const timer = setTimeout(() => {
        const animate = () => {
          const start = 0;
          const end = value;
          const duration = 1000;
          const startTime = Date.now();

          const updateValue = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.round(start + (end - start) * easeOutCubic);
            setDisplayValue(currentValue);

            if (progress < 1) {
              requestAnimationFrame(updateValue);
            }
          };

          updateValue();
        };

        animate();
      }, delay * 100);

      return () => clearTimeout(timer);
    }
  }, [value, loading, delay]);

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
        loading={loading}
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
const AnimatedChartCard = ({ title, children, loading, extra, delay = 0, style = {} }) => {
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
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
          overflow: 'hidden',
          ...style
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

const DashboardInvite = () => {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [evolutionChartType, setEvolutionChartType] = useState('line');
  const [conversionChartType, setConversionChartType] = useState('combination');
  const [typeChartType, setTypeChartType] = useState('pie');

  const {
    invitesByCountry,
    inviteStats,
    invitesByStatus,
    invitesByPotentiel,
    invitesEvolution,
    invitesConversionRate,
    invitesByType
  } = useSelector((state) => state.dashboard);

  const screens = useBreakpoint();

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const loadData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchInvitesByCountry()),
        dispatch(fetchInviteStats()),
        dispatch(fetchInvitesByStatus()),
        dispatch(fetchInvitesByPotentiel()),
        dispatch(fetchInvitesEvolution()),
        dispatch(fetchInvitesConversionRate()),
        dispatch(fetchInvitesByType())
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Configuration du graphique d'évolution des invites
  const getInvitesEvolutionChartOption = () => {
    if (!invitesEvolution.data || !Array.isArray(invitesEvolution.data) || invitesEvolution.data.length === 0) {
      return {
        title: {
          text: 'Aucune donnée disponible',
          left: 'center',
          top: 'center',
          textStyle: {
            color: '#999',
            fontSize: 14,
            fontWeight: 'normal'
          }
        }
      };
    }

    const cleanData = invitesEvolution.data
      .filter(item => item && item.date && item.value !== undefined)
      .map(item => ({
        name: item.name || item.date,
        value: Number(item.value) || 0,
        date: item.date
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    if (cleanData.length === 0) {
      return {
        title: {
          text: 'Aucune donnée valide',
          left: 'center',
          top: 'center',
          textStyle: {
            color: '#999',
            fontSize: 14,
            fontWeight: 'normal'
          }
        }
      };
    }

    const dates = cleanData.map(item => item.name);
    const values = cleanData.map(item => item.value);

    const baseOptions = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#777',
        borderWidth: 1,
        textStyle: {
          color: '#fff'
        },
        formatter: function(params) {
          const param = params[0];
          return `
            <div style="font-weight: bold; margin-bottom: 5px;">${param.name}</div>
            <div>Invitations: <strong>${param.value}</strong></div>
          `;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: {
          lineStyle: {
            color: '#ccc'
          }
        },
        axisLabel: {
          color: '#666',
          rotate: dates.length > 6 ? 45 : 0,
          interval: 0
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#ccc'
          }
        },
        axisLabel: {
          color: '#666',
          formatter: '{value}'
        },
        splitLine: {
          lineStyle: {
            color: '#f0f0f0',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: 'Invitations',
          type: evolutionChartType,
          data: values,
          smooth: evolutionChartType === 'line' || evolutionChartType === 'area',
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: {
            color: '#1890ff'
          },
          lineStyle: {
            width: 3,
            color: '#1890ff'
          },
          areaStyle: evolutionChartType === 'area' ? {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: 'rgba(24, 144, 255, 0.3)'
              }, {
                offset: 1, color: 'rgba(24, 144, 255, 0.05)'
              }]
            }
          } : undefined,
          barWidth: evolutionChartType === 'bar' ? '60%' : undefined,
          barCategoryGap: evolutionChartType === 'bar' ? '50%' : undefined
        }
      ],
      animation: true,
      animationDuration: 1000,
      animationEasing: 'cubicOut'
    };

    return baseOptions;
  };

  // Configuration du graphique de taux de conversion
  const getInvitesConversionRateChartOption = () => {
    if (!invitesConversionRate.data || !Array.isArray(invitesConversionRate.data) || invitesConversionRate.data.length === 0) {
      return {
        title: {
          text: 'Aucune donnée de conversion disponible',
          left: 'center',
          top: 'center',
          textStyle: {
            color: '#999',
            fontSize: 14,
            fontWeight: 'normal'
          }
        }
      };
    }

    const cleanData = invitesConversionRate.data
      .filter(item => item && item.date && item.taux !== undefined)
      .map(item => ({
        name: item.name || item.date,
        total: Number(item.total) || 0,
        convertis: Number(item.convertis) || 0,
        taux: Number(item.taux) || 0,
        date: item.date
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    if (cleanData.length === 0) {
      return {
        title: {
          text: 'Aucune donnée valide',
          left: 'center',
          top: 'center',
          textStyle: {
            color: '#999',
            fontSize: 14,
            fontWeight: 'normal'
          }
        }
      };
    }

    const dates = cleanData.map(item => item.name);
    const totals = cleanData.map(item => item.total);
    const convertis = cleanData.map(item => item.convertis);
    const taux = cleanData.map(item => item.taux);

    if (conversionChartType === 'combination') {
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
            let result = `<div style="font-weight: bold; margin-bottom: 5px;">${params[0].name}</div>`;
            params.forEach(param => {
              if (param.seriesName === 'Total Invités') {
                result += `<div>${param.seriesName}: <strong>${param.value}</strong></div>`;
              } else if (param.seriesName === 'Convertis') {
                result += `<div>${param.seriesName}: <strong>${param.value}</strong></div>`;
              } else if (param.seriesName === 'Taux de Conversion') {
                result += `<div>${param.seriesName}: <strong>${param.value}%</strong></div>`;
              }
            });
            return result;
          }
        },
        legend: {
          data: ['Total Invités', 'Convertis', 'Taux de Conversion'],
          top: 'top'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '15%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: dates,
            axisPointer: {
              type: 'shadow'
            },
            axisLabel: {
              color: '#666',
              rotate: dates.length > 6 ? 45 : 0,
              interval: 0
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: 'Nombre',
            min: 0,
            axisLabel: {
              formatter: '{value}',
              color: '#666'
            }
          },
          {
            type: 'value',
            name: 'Taux %',
            min: 0,
            max: 100,
            axisLabel: {
              formatter: '{value}%',
              color: '#666'
            }
          }
        ],
        series: [
          {
            name: 'Total Invités',
            type: 'bar',
            barWidth: '40%',
            data: totals,
            itemStyle: {
              color: '#1890ff'
            },
            emphasis: {
              focus: 'series'
            }
          },
          {
            name: 'Convertis',
            type: 'bar',
            barWidth: '40%',
            data: convertis,
            itemStyle: {
              color: '#52c41a'
            },
            emphasis: {
              focus: 'series'
            }
          },
          {
            name: 'Taux de Conversion',
            type: 'line',
            yAxisIndex: 1,
            data: taux,
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: {
              width: 3,
              color: '#fa8c16'
            },
            itemStyle: {
              color: '#fa8c16'
            },
            emphasis: {
              focus: 'series'
            }
          }
        ],
        animation: true,
        animationDuration: 1000
      };
    }

    if (conversionChartType === 'line') {
      return {
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            const dataItem = cleanData.find(item => item.name === params[0].name);
            return `
              <div style="font-weight: bold;">${params[0].name}</div>
              <div>Taux de Conversion: <strong>${params[0].value}%</strong></div>
              <div>Total: ${dataItem?.total || 0} | Convertis: ${dataItem?.convertis || 0}</div>
            `;
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: dates,
          axisLabel: {
            color: '#666',
            rotate: dates.length > 6 ? 45 : 0,
            interval: 0
          }
        },
        yAxis: {
          type: 'value',
          name: 'Taux de Conversion %',
          min: 0,
          max: 100,
          axisLabel: {
            formatter: '{value}%',
            color: '#666'
          }
        },
        series: [
          {
            name: 'Taux de Conversion',
            type: 'line',
            data: taux,
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              width: 3,
              color: '#fa8c16'
            },
            itemStyle: {
              color: '#fa8c16'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0, color: 'rgba(250, 140, 22, 0.3)'
                }, {
                  offset: 1, color: 'rgba(250, 140, 22, 0.05)'
                }]
              }
            }
          }
        ],
        animation: true,
        animationDuration: 1000
      };
    }

    if (conversionChartType === 'bar') {
      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function(params) {
            let result = `<div style="font-weight: bold;">${params[0].name}</div>`;
            const totalParam = params.find(p => p.seriesName === 'Total');
            const convertisParam = params.find(p => p.seriesName === 'Convertis');
            const taux = totalParam && convertisParam && totalParam.value > 0 ? 
              ((convertisParam.value / totalParam.value) * 100).toFixed(1) : 0;
            
            result += `<div>Total: <strong>${totalParam?.value || 0}</strong></div>`;
            result += `<div>Convertis: <strong>${convertisParam?.value || 0}</strong></div>`;
            result += `<div>Taux: <strong>${taux}%</strong></div>`;
            return result;
          }
        },
        legend: {
          data: ['Total', 'Convertis'],
          top: 'top'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: dates,
          axisLabel: {
            color: '#666',
            rotate: dates.length > 6 ? 45 : 0,
            interval: 0
          }
        },
        yAxis: {
          type: 'value',
          name: 'Nombre',
          axisLabel: {
            formatter: '{value}',
            color: '#666'
          }
        },
        series: [
          {
            name: 'Total',
            type: 'bar',
            stack: 'invites',
            data: totals,
            itemStyle: {
              color: '#1890ff'
            }
          },
          {
            name: 'Convertis',
            type: 'bar',
            stack: 'invites',
            data: convertis,
            itemStyle: {
              color: '#52c41a'
            }
          }
        ],
        animation: true,
        animationDuration: 1000
      };
    }
  };

  // Configuration du graphique par type d'invités
  const getInvitesByTypeChartOption = () => {
    if (!invitesByType.data || !Array.isArray(invitesByType.data) || invitesByType.data.length === 0) {
      return {
        title: {
          text: 'Aucune donnée de type disponible',
          left: 'center',
          top: 'center',
          textStyle: {
            color: '#999',
            fontSize: 14,
            fontWeight: 'normal'
          }
        }
      };
    }

    const cleanData = invitesByType.data
      .filter(item => item && item.name && item.value !== undefined)
      .map(item => ({
        name: item.name,
        value: Number(item.value) || 0,
        code: item.code
      }));

    if (cleanData.length === 0) {
      return {
        title: {
          text: 'Aucune donnée valide',
          left: 'center',
          top: 'center',
          textStyle: {
            color: '#999',
            fontSize: 14,
            fontWeight: 'normal'
          }
        }
      };
    }

    const typeColors = {
      'externe': '#1890ff',
      'interne': '#52c41a',
      'Externe': '#1890ff',
      'Interne': '#52c41a',
      'partenaire': '#722ed1',
      'Partenaire': '#722ed1',
      'vip': '#fa8c16',
      'VIP': '#fa8c16'
    };

    const data = cleanData.map(item => ({
      value: item.value,
      name: item.name,
      itemStyle: {
        color: typeColors[item.code] || typeColors[item.name] || '#1890ff'
      }
    }));

    if (typeChartType === 'pie') {
      return {
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            return `
              <div style="font-weight: bold;">${params.name}</div>
              <div>Nombre: ${params.value}</div>
              <div>Pourcentage: ${params.percent}%</div>
            `;
          }
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          data: data.map(item => item.name)
        },
        series: [
          {
            name: 'Types d\'invités',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['40%', '50%'],
            data: data,
            label: {
              show: true,
              formatter: '{b}: {c}',
              position: 'outside',
              textBorderColor: 'transparent'
            },
            labelLine: {
              show: true,
              length: 10,
              length2: 15
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              },
              label: {
                show: true,
                fontWeight: 'bold'
              }
            },
            itemStyle: {
              borderRadius: 8,
              borderColor: '#fff',
              borderWidth: 2
            }
          }
        ],
        animation: true,
        animationEasing: 'elasticOut',
        animationDelay: function(idx) {
          return idx * 100;
        }
      };
    }

    if (typeChartType === 'doughnut') {
      return {
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            return `
              <div style="font-weight: bold;">${params.name}</div>
              <div>Nombre: ${params.value}</div>
              <div>Pourcentage: ${params.percent}%</div>
            `;
          }
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          data: data.map(item => item.name)
        },
        series: [
          {
            name: 'Types d\'invités',
            type: 'pie',
            radius: ['30%', '70%'],
            center: ['40%', '50%'],
            data: data,
            label: {
              show: true,
              formatter: '{b}: {c}',
              position: 'outside'
            },
            labelLine: {
              show: true
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            itemStyle: {
              borderRadius: 8,
              borderColor: '#fff',
              borderWidth: 2
            }
          }
        ],
        animation: true
      };
    }

    if (typeChartType === 'bar') {
      const sortedData = [...data].sort((a, b) => b.value - a.value);
      
      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function(params) {
            const param = params[0];
            return `
              <div style="font-weight: bold;">${param.name}</div>
              <div>Nombre: <strong>${param.value}</strong></div>
            `;
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            color: '#666'
          }
        },
        yAxis: {
          type: 'category',
          data: sortedData.map(item => item.name),
          axisLabel: {
            color: '#666'
          }
        },
        series: [
          {
            name: 'Types d\'invités',
            type: 'bar',
            data: sortedData.map(item => ({
              value: item.value,
              itemStyle: {
                color: item.itemStyle.color
              }
            })),
            label: {
              show: true,
              position: 'right',
              formatter: '{c}',
              color: '#333'
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.3)'
              }
            }
          }
        ],
        animation: true,
        animationDuration: 1000
      };
    }
  };

  // Configuration du graphique en secteurs pour les statuts des invités
  const getInvitesByStatusChartOption = () => {
    if (!invitesByStatus.data || !Array.isArray(invitesByStatus.data) || invitesByStatus.data.length === 0) {
      return null;
    }

    const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];
    
    const data = invitesByStatus.data.map((item, index) => ({
      value: item.value || 0,
      name: item.name || item.status || item.statut || `Statut ${index + 1}`,
      itemStyle: {
        color: colors[index % colors.length]
      }
    }));

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: data.map(item => item.name)
      },
      series: [
        {
          name: 'Invités par Statut',
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

  // Configuration du graphique pour le potentiel des invites
  const getInvitesByPotentielChartOption = () => {
    if (!invitesByPotentiel.data || !Array.isArray(invitesByPotentiel.data) || invitesByPotentiel.data.length === 0) {
      return null;
    }

    const cleanData = invitesByPotentiel.data
      .filter(item => item && item.name && item.value !== undefined)
      .map(item => ({
        name: item.name || 'Non spécifié',
        value: Number(item.value) || 0
      }));

    if (cleanData.length === 0) return null;

    const potentielColors = {
      'Élevé': '#f5222d',
      'Haut': '#f5222d',
      'High': '#f5222d',
      'Moyen': '#fa8c16',
      'Medium': '#fa8c16',
      'Modéré': '#fa8c16',
      'Faible': '#52c41a',
      'Low': '#52c41a',
      'Bas': '#52c41a'
    };

    const data = cleanData.map(item => ({
      value: item.value,
      name: item.name,
      itemStyle: {
        color: potentielColors[item.name] || '#1890ff'
      }
    }));

    return {
      tooltip: {
        trigger: 'item',
        formatter: function(params) {
          return `
            <div style="font-weight: bold;">${params.name}</div>
            <div>Nombre d'invités: ${params.value}</div>
            <div>Pourcentage: ${params.percent}%</div>
          `;
        }
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        data: data.map(item => item.name),
        formatter: function(name) {
          const item = data.find(d => d.name === name);
          return `${name}: ${item.value}`;
        }
      },
      series: [
        {
          name: 'Invités par Potentiel',
          type: 'pie',
          radius: ['30%', '60%'],
          center: ['40%', '50%'],
          data: data,
          label: {
            show: true,
            formatter: '{b}: {c}',
            position: 'outside',
            textBorderColor: 'transparent'
          },
          labelLine: {
            show: true,
            length: 10,
            length2: 15
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            },
            label: {
              show: true,
              fontWeight: 'bold'
            }
          },
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2
          }
        }
      ],
      animation: true,
      animationEasing: 'elasticOut',
      animationDelay: function(idx) {
        return idx * 100;
      }
    };
  };

  // Statistiques d'évolution
  const getEvolutionStats = () => {
    if (!invitesEvolution.data || !Array.isArray(invitesEvolution.data) || invitesEvolution.data.length === 0) {
      return null;
    }

    const cleanData = invitesEvolution.data
      .filter(item => item && item.value !== undefined)
      .map(item => Number(item.value) || 0);

    if (cleanData.length === 0) return null;

    const currentValue = cleanData[cleanData.length - 1];
    const previousValue = cleanData.length > 1 ? cleanData[cleanData.length - 2] : 0;
    const total = cleanData.reduce((sum, value) => sum + value, 0);
    const average = total / cleanData.length;
    const maxValue = Math.max(...cleanData);
    const minValue = Math.min(...cleanData);

    const change = currentValue - previousValue;
    const percentageChange = previousValue !== 0 ? (change / previousValue) * 100 : 0;

    return {
      currentValue,
      previousValue,
      change,
      percentageChange,
      total,
      average: Math.round(average),
      maxValue,
      minValue,
      periodCount: cleanData.length
    };
  };

  // Statistiques de conversion
  const getConversionStats = () => {
    if (!invitesConversionRate.data || !Array.isArray(invitesConversionRate.data) || invitesConversionRate.data.length === 0) {
      return null;
    }

    const cleanData = invitesConversionRate.data
      .filter(item => item && item.taux !== undefined)
      .map(item => ({
        taux: Number(item.taux) || 0,
        total: Number(item.total) || 0,
        convertis: Number(item.convertis) || 0
      }));

    if (cleanData.length === 0) return null;

    const currentTaux = cleanData[cleanData.length - 1].taux;
    const previousTaux = cleanData.length > 1 ? cleanData[cleanData.length - 2].taux : 0;
    const averageTaux = cleanData.reduce((sum, item) => sum + item.taux, 0) / cleanData.length;
    const maxTaux = Math.max(...cleanData.map(item => item.taux));
    const minTaux = Math.min(...cleanData.map(item => item.taux));
    const totalInvites = cleanData.reduce((sum, item) => sum + item.total, 0);
    const totalConvertis = cleanData.reduce((sum, item) => sum + item.convertis, 0);
    const globalTaux = totalInvites > 0 ? (totalConvertis / totalInvites) * 100 : 0;

    const change = currentTaux - previousTaux;

    return {
      currentTaux,
      previousTaux,
      change,
      averageTaux: Math.round(averageTaux * 10) / 10,
      maxTaux,
      minTaux,
      globalTaux: Math.round(globalTaux * 10) / 10,
      totalInvites,
      totalConvertis,
      periodCount: cleanData.length
    };
  };

  // Statistiques pour les types d'invités
  const getTypeStats = () => {
    if (!invitesByType.data || !Array.isArray(invitesByType.data) || invitesByType.data.length === 0) {
      return null;
    }

    const cleanData = invitesByType.data
      .filter(item => item && item.value !== undefined)
      .map(item => ({
        name: item.name,
        value: Number(item.value) || 0,
        code: item.code
      }));

    if (cleanData.length === 0) return null;

    const total = cleanData.reduce((sum, item) => sum + item.value, 0);
    const mainType = cleanData.reduce((max, item) => item.value > max.value ? item : max, cleanData[0]);
    const minorType = cleanData.reduce((min, item) => item.value < min.value ? item : min, cleanData[0]);

    return {
      total,
      mainType,
      minorType,
      typeCount: cleanData.length,
      types: cleanData
    };
  };

  const evolutionStats = getEvolutionStats();
  const conversionStats = getConversionStats();
  const typeStats = getTypeStats();

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
                Tableau de Bord Invités
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: '8px 0 0 0' }}>
                Analyse globale des invitations et performances
              </Paragraph>
            </motion.div>
          </Col>
          <Col>
          
          </Col>
        </Row>
      </motion.div>

      {/* Statistiques principales */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={6}>
          <AnimatedStatCard
            icon={<UserOutlined />}
            title="Total Invités"
            value={inviteStats.data?.total || 0}
            color="#1890ff"
            loading={inviteStats.loading}
            delay={0}
          />
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <AnimatedStatCard
            icon={<CheckCircleOutlined />}
            title="Convertis"
            value={inviteStats.data?.convertis || 0}
            color="#52c41a"
            loading={inviteStats.loading}
            delay={1}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <AnimatedStatCard
            icon={<PlusOutlined />}
            title="Nouveaux ce mois"
            value={inviteStats.data?.ce_mois || 0}
            color="#722ed1"
            loading={inviteStats.loading}
            delay={2}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <AnimatedStatCard
            icon={<TrophyOutlined />}
            title="Taux de Conversion"
            value={inviteStats.data?.taux_conversion || 0}
            suffix="%"
            color="#fa8c16"
            loading={inviteStats.loading}
            delay={3}
          />
        </Col>
      </Row>
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        {/* Types d'Invités */}
        <Col xs={24} lg={8}>
          <AnimatedChartCard
            title="Répartition par Type"
            loading={invitesByType.loading}
            delay={3}
            extra={
              <Radio.Group 
                value={typeChartType} 
                onChange={(e) => setTypeChartType(e.target.value)}
                size="small"
              >
                <Radio.Button value="pie">
                  <UsergroupAddOutlined />
                </Radio.Button>
                <Radio.Button value="doughnut">
                  <GlobalOutlined />
                </Radio.Button>
                <Radio.Button value="bar">
                  <BarChartOutlined />
                </Radio.Button>
              </Radio.Group>
            }
          >
            {invitesByType.error ? (
              <Alert 
                message="Erreur" 
                description={invitesByType.error} 
                type="error" 
                showIcon 
              />
            ) : (
              <div>
                {typeStats && (
                  <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
                    <Col span={24}>
                      <Statistic
                        title="Type Principal"
                        value={typeStats.mainType?.value || 0}
                        suffix={typeStats.mainType?.name}
                        valueStyle={{ color: '#1890ff', fontSize: '18px' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Total"
                        value={typeStats.total}
                        valueStyle={{ color: '#52c41a', fontSize: '16px' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Types"
                        value={typeStats.typeCount}
                        valueStyle={{ color: '#722ed1', fontSize: '16px' }}
                      />
                    </Col>
                  </Row>
                )}
                
                <ReactECharts
                  option={getInvitesByTypeChartOption()}
                  style={{ height: '300px' }}
                  opts={{ renderer: 'canvas' }}
                />
              </div>
            )}
          </AnimatedChartCard>
        </Col>

        {/* Statuts des Invités */}
        <Col xs={24} lg={8}>
          <AnimatedChartCard
            title="Répartition par Statut"
            loading={invitesByStatus.loading}
            delay={4}
          >
            {invitesByStatus.error ? (
              <Alert 
                message="Erreur" 
                description={invitesByStatus.error} 
                type="error" 
                showIcon 
              />
            ) : getInvitesByStatusChartOption() ? (
              <ReactECharts
                option={getInvitesByStatusChartOption()}
                style={{ height: '400px' }}
                opts={{ renderer: 'canvas' }}
              />
            ) : (
              <Empty description="Aucune donnée de statut disponible" />
            )}
          </AnimatedChartCard>
        </Col>

        {/* Potentiel des Invités */}
        <Col xs={24} lg={8}>
          <AnimatedChartCard
            title="Répartition par Potentiel"
            loading={invitesByPotentiel.loading}
            delay={5}
            extra={
              <Tooltip title="Niveau de potentiel des invités">
                <CrownOutlined style={{ color: '#faad14' }} />
              </Tooltip>
            }
          >
            {invitesByPotentiel.error ? (
              <Alert 
                message="Erreur" 
                description={invitesByPotentiel.error} 
                type="error" 
                showIcon 
              />
            ) : getInvitesByPotentielChartOption() ? (
              <ReactECharts
                option={getInvitesByPotentielChartOption()}
                style={{ height: '400px' }}
                opts={{ renderer: 'canvas' }}
              />
            ) : (
              <Empty description="Aucune donnée de potentiel disponible" />
            )}
          </AnimatedChartCard>
        </Col>
      </Row>
       <Row gutter={[24, 24]}>
        {/* Carte géographique */}
        <Col xs={24} lg={12}>
          <AnimatedChartCard
            title="Invités par Pays"
            loading={invitesByCountry.loading}
            delay={6}
          >
            {invitesByCountry.error ? (
              <Alert 
                message="Erreur" 
                description={invitesByCountry.error} 
                type="error" 
                showIcon 
              />
            ) : Array.isArray(invitesByCountry.data) && invitesByCountry.data.length > 0 ? (
              <MapChart data={invitesByCountry.data} />
            ) : (
              <Empty description="Aucune donnée disponible" />
            )}
          </AnimatedChartCard>
        </Col>

        {/* Statistiques détaillées */}
        <Col xs={24} lg={12}>
         <AnimatedChartCard
  title="Détails des Statistiques"
  loading={inviteStats.loading}
  delay={7}
  
>
  {inviteStats.error ? (
    <Alert 
      message="Erreur" 
      description={inviteStats.error} 
      type="error" 
      showIcon 
    />
  ) : inviteStats.data ? (
    <div>
      {/* Statistiques principales en cartes */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8} lg={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card 
              size="small"
              style={{ 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #faad1415 0%, #faad1425 100%)',
                border: '1px solid #faad1430',
                borderRadius: '12px'
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <ClockCircleOutlined 
                  style={{ 
                    fontSize: 24, 
                    color: '#faad14',
                    padding: 8,
                    background: '#faad1420',
                    borderRadius: '50%'
                  }} 
                />
              </div>
              <Statistic
                title="En Pipeline"
                value={inviteStats.data.en_pipeline || 0}
                valueStyle={{ 
                  color: '#faad14', 
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}
                style={{ margin: 0 }}
              />
            </Card>
          </motion.div>
        </Col>
        
        <Col xs={12} sm={8} lg={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card 
              size="small"
              style={{ 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #f5222d15 0%, #f5222d25 100%)',
                border: '1px solid #f5222d30',
                borderRadius: '12px'
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <ExclamationCircleOutlined 
                  style={{ 
                    fontSize: 24, 
                    color: '#f5222d',
                    padding: 8,
                    background: '#f5222d20',
                    borderRadius: '50%'
                  }} 
                />
              </div>
              <Statistic
                title="Suivi Requis"
                value={inviteStats.data.suivi_requis || 0}
                valueStyle={{ 
                  color: '#f5222d', 
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}
                style={{ margin: 0 }}
              />
            </Card>
          </motion.div>
        </Col>
        
        <Col xs={12} sm={8} lg={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card 
              size="small"
              style={{ 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #13c2c215 0%, #13c2c225 100%)',
                border: '1px solid #13c2c230',
                borderRadius: '12px'
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <ContactsOutlined 
                  style={{ 
                    fontSize: 24, 
                    color: '#13c2c2',
                    padding: 8,
                    background: '#13c2c220',
                    borderRadius: '50%'
                  }} 
                />
              </div>
              <Statistic
                title="Aujourd'hui"
                value={inviteStats.data.aujourd_hui || 0}
                valueStyle={{ 
                  color: '#13c2c2', 
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}
                style={{ margin: 0 }}
              />
            </Card>
          </motion.div>
        </Col>
        
        <Col xs={12} sm={8} lg={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card 
              size="small"
              style={{ 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #1890ff15 0%, #1890ff25 100%)',
                border: '1px solid #1890ff30',
                borderRadius: '12px'
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <CalendarOutlined 
                  style={{ 
                    fontSize: 24, 
                    color: '#1890ff',
                    padding: 8,
                    background: '#1890ff20',
                    borderRadius: '50%'
                  }} 
                />
              </div>
              <Statistic
                title="Cette Semaine"
                value={inviteStats.data.cette_semaine || 0}
                valueStyle={{ 
                  color: '#1890ff', 
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}
                style={{ margin: 0 }}
              />
            </Card>
          </motion.div>
        </Col>

        <Col xs={12} sm={8} lg={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card 
              size="small"
              style={{ 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #eb2f9615 0%, #eb2f9625 100%)',
                border: '1px solid #eb2f9630',
                borderRadius: '12px'
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <SyncOutlined 
                  style={{ 
                    fontSize: 24, 
                    color: '#eb2f96',
                    padding: 8,
                    background: '#eb2f9620',
                    borderRadius: '50%'
                  }} 
                />
              </div>
              <Statistic
                title="Moyenne/Jour"
                value={inviteStats.data.moyenne_par_jour || 0}
                precision={1}
                valueStyle={{ 
                  color: '#eb2f96', 
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}
                style={{ margin: 0 }}
              />
            </Card>
          </motion.div>
        </Col>

        <Col xs={12} sm={8} lg={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card 
              size="small"
              style={{ 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #52c41a15 0%, #52c41a25 100%)',
                border: '1px solid #52c41a30',
                borderRadius: '12px'
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <PercentageOutlined 
                  style={{ 
                    fontSize: 24, 
                    color: '#52c41a',
                    padding: 8,
                    background: '#52c41a20',
                    borderRadius: '50%'
                  }} 
                />
              </div>
              <Statistic
                title="Conversion"
                value={inviteStats.data.taux_conversion || 0}
                precision={1}
                suffix="%"
                valueStyle={{ 
                  color: '#52c41a', 
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}
                style={{ margin: 0 }}
              />
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Résumé rapide */}
      <Divider style={{ margin: '16px 0' }} />
      
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Card 
              size="small"
              style={{ 
                background: 'linear-gradient(135deg, #f0f2f5 0%, #fafafa 100%)',
                border: '1px solid #e8e8e8',
                borderRadius: '8px'
              }}
            >
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={8}>
                  <Space>
                    <Avatar 
                      icon={<UserOutlined />} 
                      style={{ background: '#1890ff' }} 
                    />
                    <div>
                      <Text strong>Total Traité</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {(inviteStats.data.en_pipeline || 0) + 
                         (inviteStats.data.suivi_requis || 0) + 
                         (inviteStats.data.convertis || 0)} invités
                      </Text>
                    </div>
                  </Space>
                </Col>
                
                <Col xs={24} sm={12} md={8}>
                  <Space>
                    <Avatar 
                      icon={<FireOutlined />} 
                      style={{ background: '#fa8c16' }} 
                    />
                    <div>
                      <Text strong>Efficacité</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {inviteStats.data.taux_conversion || 0}% de conversion
                      </Text>
                    </div>
                  </Space>
                </Col>
                
                <Col xs={24} sm={12} md={8}>
                  <Space>
                    <Avatar 
                      icon={<ThunderboltOutlined />} 
                      style={{ background: '#52c41a' }} 
                    />
                    <div>
                      <Text strong>Performance</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {inviteStats.data.moyenne_par_jour || 0} par jour
                      </Text>
                    </div>
                  </Space>
                </Col>
              </Row>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </div>
  ) : (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <Empty 
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span style={{ color: '#999' }}>
            Aucune statistique disponible
          </span>
        }
      />
    </div>
  )}
</AnimatedChartCard>
        </Col>
      </Row>

      {/* Graphique d'évolution */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24}>
          <AnimatedChartCard
            title="Évolution des Invités dans le Temps"
            loading={invitesEvolution.loading}
            delay={1}
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
                  <Radio.Button value="area">
                    <AreaChartOutlined />
                  </Radio.Button>
                </Radio.Group>
              </Space>
            }
          >
            {invitesEvolution.error ? (
              <Alert 
                message="Erreur" 
                description={invitesEvolution.error} 
                type="error" 
                showIcon 
              />
            ) : (
              <div>
                {evolutionStats && (
                  <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title="Dernière période"
                        value={evolutionStats.currentValue}
                        valueStyle={{ 
                          color: evolutionStats.change >= 0 ? '#52c41a' : '#f5222d',
                          fontSize: '20px'
                        }}
                        prefix={evolutionStats.change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                        suffix={
                          <span style={{ fontSize: '12px', color: '#666' }}>
                            {evolutionStats.change >= 0 ? '+' : ''}{evolutionStats.change}
                          </span>
                        }
                      />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title="Évolution"
                        value={Math.abs(evolutionStats.percentageChange)}
                        precision={1}
                        suffix="%"
                        valueStyle={{ 
                          color: evolutionStats.percentageChange >= 0 ? '#52c41a' : '#f5222d',
                          fontSize: '20px'
                        }}
                      />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title="Moyenne"
                        value={evolutionStats.average}
                        valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                      />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title="Périodes"
                        value={evolutionStats.periodCount}
                        valueStyle={{ color: '#722ed1', fontSize: '20px' }}
                      />
                    </Col>
                  </Row>
                )}
                
                <ReactECharts
                  option={getInvitesEvolutionChartOption()}
                  style={{ height: '400px' }}
                  opts={{ renderer: 'canvas' }}
                />
              </div>
            )}
          </AnimatedChartCard>
        </Col>
      </Row>

      {/* Graphique de taux de conversion */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24}>
          <AnimatedChartCard
            title="Taux de Conversion des Invités"
            loading={invitesConversionRate.loading}
            delay={2}
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
                  <Radio.Button value="line">
                    <LineChartOutlined />
                  </Radio.Button>
                  <Radio.Button value="bar">
                    <BarChartOutlined />
                  </Radio.Button>
                </Radio.Group>
              </Space>
            }
          >
            {invitesConversionRate.error ? (
              <Alert 
                message="Erreur" 
                description={invitesConversionRate.error} 
                type="error" 
                showIcon 
              />
            ) : (
              <div>
                {conversionStats && (
                  <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title="Taux Actuel"
                        value={conversionStats.currentTaux}
                        precision={1}
                        suffix="%"
                        valueStyle={{ 
                          color: conversionStats.change >= 0 ? '#52c41a' : '#f5222d',
                          fontSize: '20px'
                        }}
                        prefix={conversionStats.change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                      />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title="Taux Global"
                        value={conversionStats.globalTaux}
                        precision={1}
                        suffix="%"
                        valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                        prefix={<PercentageOutlined />}
                      />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title="Total Convertis"
                        value={conversionStats.totalConvertis}
                        valueStyle={{ color: '#52c41a', fontSize: '20px' }}
                        prefix={<CheckCircleOutlined />}
                      />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title="Moyenne"
                        value={conversionStats.averageTaux}
                        precision={1}
                        suffix="%"
                        valueStyle={{ color: '#fa8c16', fontSize: '20px' }}
                      />
                    </Col>
                  </Row>
                )}
                
                <ReactECharts
                  option={getInvitesConversionRateChartOption()}
                  style={{ height: '400px' }}
                  opts={{ renderer: 'canvas' }}
                />
              </div>
            )}
          </AnimatedChartCard>
        </Col>
      </Row>

      

     

      {/* Styles CSS intégrés (identique à DashboardProjet) */}
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

export default DashboardInvite;            