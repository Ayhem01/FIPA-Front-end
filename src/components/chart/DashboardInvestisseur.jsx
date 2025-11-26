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
  FunnelPlotOutlined, PieChartOutlined, BankOutlined
, SafetyCertificateOutlined,HourglassOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import ReactECharts from 'echarts-for-react';

import { fetchInvestorDashboard } from "../../features/dashboardSlice";

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

const DashboardInvestisseur = () => {
  const dispatch = useDispatch();
  const screens = useBreakpoint();
  const [refreshing, setRefreshing] = useState(false);
  const [statusChartType, setStatusChartType] = useState('pie');
  const [evolutionChartType, setEvolutionChartType] = useState('line');

  const { investorDashboard } = useSelector((state) => state.dashboard);

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const loadData = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchInvestorDashboard());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Configuration du graphique par statut
  const getStatusChartOption = () => {
    if (!investorDashboard.data?.charts?.status || !Array.isArray(investorDashboard.data.charts.status)) {
      return null;
    }

    const data = investorDashboard.data.charts.status.map((item, index) => ({
      value: item.value,
      name: item.name,
      itemStyle: {
        color: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'][index % 6]
      }
    }));

    if (statusChartType === 'pie') {
      return {
        tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
        legend: { orient: 'vertical', left: 'left' },
        series: [{
          name: 'Investisseurs par Statut',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          data: data
        }]
      };
    } else {
      return {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: data.map(item => item.name) },
        yAxis: { type: 'value' },
        series: [{
          name: 'Nombre',
          type: 'bar',
          data: data.map(item => ({ value: item.value, itemStyle: item.itemStyle }))
        }]
      };
    }
  };

  // Configuration du graphique d'évolution
  const getEvolutionChartOption = () => {
    if (!investorDashboard.data?.charts?.evolution || !Array.isArray(investorDashboard.data.charts.evolution)) {
      return null;
    }

    const evolutionData = investorDashboard.data.charts.evolution;
    const xAxisData = evolutionData.map(item => item.name);
    const totalData = evolutionData.map(item => item.total);
    const convertisData = evolutionData.map(item => item.convertis);
    const investmentData = evolutionData.map(item => item.total_investment);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      legend: { data: ['Total', 'Convertis', 'Investissements (€)'] },
      xAxis: { type: 'category', data: xAxisData },
      yAxis: [
        { type: 'value', name: 'Nombre' },
        { type: 'value', name: 'Montant (€)', position: 'right' }
      ],
      series: [
        {
          name: 'Total',
          type: evolutionChartType,
          data: totalData,
          itemStyle: { color: '#1890ff' }
        },
        {
          name: 'Convertis',
          type: evolutionChartType,
          data: convertisData,
          itemStyle: { color: '#52c41a' }
        },
        {
          name: 'Investissements (€)',
          type: 'line',
          yAxisIndex: 1,
          data: investmentData,
          itemStyle: { color: '#faad14' }
        }
      ]
    };
  };

  // Configuration du graphique pipeline
  const getPipelineChartOption = () => {
    if (!investorDashboard.data?.charts?.pipeline || !Array.isArray(investorDashboard.data.charts.pipeline)) {
      return null;
    }

    const pipelineData = investorDashboard.data.charts.pipeline;
    const data = pipelineData.map((item, index) => ({
      value: item.value,
      name: item.name,
      itemStyle: {
        color: ['#ff4757', '#ff6b81', '#a4b0be', '#5352ed', '#40739e', '#487eb0'][index % 6]
      }
    }));

    return {
      tooltip: {
        trigger: 'item',
        formatter: function(params) {
          return `${params.name}<br/>Investisseurs: ${params.value}`;
        }
      },
      series: [{
        name: 'Pipeline',
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 60,
        width: '80%',
        min: 0,
        max: Math.max(...data.map(item => item.value)),
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside'
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid'
          }
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        },
        emphasis: {
          label: {
            fontSize: 20
          }
        },
        data: data
      }]
    };
  };

  // Configuration du graphique d'analyse des investissements
  const getInvestmentAnalysisChartOption = () => {
    if (!investorDashboard.data?.charts?.investment_analysis || !Array.isArray(investorDashboard.data.charts.investment_analysis)) {
      return null;
    }

    const analysisData = investorDashboard.data.charts.investment_analysis;
    const data = analysisData.map((item, index) => ({
      value: item.value,
      name: item.name,
      itemStyle: {
        color: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'][index % 5]
      }
    }));

    return {
      tooltip: {
        trigger: 'item',
        formatter: function(params) {
          const item = analysisData[params.dataIndex];
          return `${params.name}<br/>
                  Investisseurs: ${params.value}<br/>
                  Valeur totale: ${item.total_value?.toLocaleString()} €<br/>
                  Convertis: ${item.convertis}<br/>
                  Taux: ${item.conversion_rate}%`;
        }
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [{
        name: 'Analyse Investissements',
        type: 'pie',
        radius: '50%',
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
  };

  // Configuration des colonnes pour le tableau des responsables
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
      dataIndex: "value",
      key: "value",
      sorter: (a, b) => a.value - b.value,
    },
    {
      title: "Convertis",
      dataIndex: "convertis",
      key: "convertis",
      render: (value) => (
        <Tag color="green">{value}</Tag>
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
        <Tag color="blue">{value?.toLocaleString()} €</Tag>
      ),
    }
  ];

  const stats = investorDashboard.data?.stats || {};

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
        <Row justify="space-between" align="middle" style={{ position: 'relative', zIndex: 1 }}>
          <Col>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Title level={1} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
                <BankOutlined style={{ marginRight: '16px' }} />
                Tableau de Bord Investisseurs
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: '8px 0 0 0' }}>
                Analyse complète des investisseurs et performance du pipeline
              </Paragraph>
            </motion.div>
          </Col>
          <Col>
            
          </Col>
        </Row>
      </motion.div>

      {/* Statistiques principales */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={3}>
          <AnimatedStatCard
            icon={<TeamOutlined />}
            title="Total Investisseurs"
            value={stats.total_investisseurs || 0}
            color="#1890ff"
            loading={investorDashboard.loading}
            delay={0}
          />
        </Col>
        <Col xs={24} sm={12} lg={3}>
          <AnimatedStatCard
            icon={<PlusOutlined />}
            title="Nouveau ce Mois"
            value={stats.nouveau_ce_mois || 0}
            color="#52c41a"
            loading={investorDashboard.loading}
            delay={1}
          />
        </Col>
        <Col xs={24} sm={12} lg={3}>
          <AnimatedStatCard
            icon={<CheckCircleOutlined />}
            title="Investis"
            value={stats.total_investi || 0}
            color="#722ed1"
            loading={investorDashboard.loading}
            delay={2}
          />
        </Col>
        <Col xs={24} sm={12} lg={3}>
          <AnimatedStatCard
            icon={<TrophyOutlined />}
            title="Taux Conversion"
            value={stats.taux_conversion || 0}
            suffix="%"
            color="#fa8c16"
            loading={investorDashboard.loading}
            delay={3}
          />
        </Col>
        <Col xs={24} sm={12} lg={3}>
          <AnimatedStatCard
            icon={<MoneyCollectOutlined />}
            title="Montant Total"
            value={stats.montant_total || 0}
            prefix="€"
            color="#13c2c2"
            loading={investorDashboard.loading}
            delay={4}
          />
        </Col>
        <Col xs={24} sm={12} lg={3}>
          <AnimatedStatCard
            icon={<SafetyCertificateOutlined />}
            title="Montant Signé"
            value={stats.montant_signe || 0}
            prefix="€"
            color="#eb2f96"
            loading={investorDashboard.loading}
            delay={5}
          />
        </Col>
        <Col xs={24} sm={12} lg={3}>
          <AnimatedStatCard
             icon={<HourglassOutlined />}
            title="Actifs Pipeline"
            value={stats.actifs_pipeline || 0}
            color="#f5222d"
            loading={investorDashboard.loading}
            delay={6}
          />
        </Col>
        <Col xs={24} sm={12} lg={3}>
          <AnimatedStatCard
            icon={<ClockCircleOutlined />}
            title="En Finalisation"
            value={stats.en_finalisation || 0}
            color="#faad14"
            loading={investorDashboard.loading}
            delay={7}
          />
        </Col>
      </Row>

      {/* Graphiques principaux */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} lg={12}>
          <AnimatedChartCard
            title="Répartition par Statut"
            loading={investorDashboard.loading}
            delay={0}
            extra={
              <Radio.Group 
                value={statusChartType} 
                onChange={(e) => setStatusChartType(e.target.value)}
                size="small"
              >
                <Radio.Button value="pie">
                  <PieChartOutlined />
                </Radio.Button>
                <Radio.Button value="bar">
                  <BarChartOutlined />
                </Radio.Button>
              </Radio.Group>
            }
          >
            {investorDashboard.error ? (
              <Alert 
                message="Erreur" 
                description={investorDashboard.error} 
                type="error" 
                showIcon 
              />
            ) : getStatusChartOption() ? (
              <ReactECharts
                option={getStatusChartOption()}
                style={{ height: '400px' }}
                opts={{ renderer: 'canvas' }}
              />
            ) : (
              <Empty description="Aucune donnée de statut disponible" />
            )}
          </AnimatedChartCard>
        </Col>

       
        <Col xs={24} lg={12}>
          <AnimatedChartCard
            title="Analyse des Investissements"
            loading={investorDashboard.loading}
            delay={0}
          >
            {investorDashboard.error ? (
              <Alert
                message="Erreur"
                description={investorDashboard.error}
                type="error"
                showIcon
              />
            ) : getInvestmentAnalysisChartOption() ? (
              <ReactECharts
                option={getInvestmentAnalysisChartOption()}
                style={{ height: '400px' }}
                opts={{ renderer: 'canvas' }}
              />
            ) : (
              <Empty description="Aucune donnée d'analyse disponible" />
            )}
          </AnimatedChartCard>
        </Col>
      </Row>

      {/* Évolution mensuelle */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24}>
          <AnimatedChartCard
            title="Évolution Mensuelle des Investisseurs"
            loading={investorDashboard.loading}
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
                  <Radio.Button value="area">
                    <AreaChartOutlined />
                  </Radio.Button>
                </Radio.Group>
              </Space>
            }
          >
            {investorDashboard.error ? (
              <Alert 
                message="Erreur" 
                description={investorDashboard.error} 
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
      </Row>

      {/* Analyse des investissements et performance par responsable */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        

        <Col xs={24} lg={12}>
          <AnimatedChartCard
            title="Performance par Responsable"
            loading={investorDashboard.loading}
            delay={1}
          >
            {investorDashboard.error ? (
              <Alert
                message="Erreur"
                description={investorDashboard.error}
                type="error"
                showIcon
              />
            ) : Array.isArray(investorDashboard.data?.charts?.responsables) && investorDashboard.data.charts.responsables.length > 0 ? (
              <Table
                dataSource={investorDashboard.data.charts.responsables}
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
            title="Pipeline d'Investissement"
            loading={investorDashboard.loading}
            delay={1}
          >
            {investorDashboard.error ? (
              <Alert 
                message="Erreur" 
                description={investorDashboard.error} 
                type="error" 
                showIcon 
              />
            ) : getPipelineChartOption() ? (
              <ReactECharts
                option={getPipelineChartOption()}
                style={{ height: '400px' }}
                opts={{ renderer: 'canvas' }}
              />
            ) : (
              <Empty description="Aucune donnée de pipeline disponible" />
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
      `}</style>
    </div>
  );
};

export default DashboardInvestisseur;