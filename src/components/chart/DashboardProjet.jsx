import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  Row, Col, Spin, Alert, Card, Statistic, Table, Typography, 
  Button, Space, Input, Select, DatePicker, Tooltip, Badge,
  Progress, Avatar, Tag, Skeleton, Empty, Divider, Grid
} from "antd";
import {
  TrophyOutlined, ProjectOutlined, TeamOutlined, DollarOutlined,
  RiseOutlined, FallOutlined, EyeOutlined, ReloadOutlined,
  SearchOutlined, FilterOutlined, CalendarOutlined, ExportOutlined,
  ArrowUpOutlined, ArrowDownOutlined, PlusOutlined, SettingOutlined,
  ThunderboltOutlined, ClockCircleOutlined, CheckCircleOutlined,
  ExclamationCircleOutlined, SyncOutlined, FireOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import TreemapChart from "./TreemapChart";
import StatsChart from "./StatsChart";
import MapChart from "./MapChart";
import InvestmentBySectorChart from "./InvestmentBySectorChart";
import LineChart from "./lineChart";
import FunnelChart from "./FunnelChart";
import HeatmapChart from "./HeatmapChart";
import MapChartTunisie from "./MapChartTunisie";

import {
  fetchProjectsByStatus,
  fetchActionsTreemapData,
  fetchInvitesByCountry,
  fetchTotalJobs,
  fetchInvestmentBySector,
  fetchTotalBlockedProjects,
  fetchTotalInProductionProjects,
  fetchTotalInProgressProjects,
  fetchTotalIdeaProjects,
  fetchDelayedProjects,
  fetchJobsBySector,
  fetchProjectsByMonth,
  fetchProjectsByYear,
  fetchHighInvestmentProjects,
  fetchHierarchicalProjectsBySector,
  fetchPipelineProgression,
  fetchInvestmentByRegion,
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

const DashboardProjet = () => {
  const dispatch = useDispatch();
  const screens = useBreakpoint();
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const {
    projectsByStatus,
    actionsTreemapData,
    invitesByCountry,
    totalJobs,
    investmentBySector,
    totalBlockedProjects,
    totalInProductionProjects,
    totalInProgressProjects,
    totalIdeaProjects,
    delayedProjects,
    jobsBySector,
    projectsByMonth,
    projectsByYear,
    highInvestmentProjects,
    hierarchicalProjectsBySector,
    pipelineProgression,
    investmentByRegion,
  } = useSelector((state) => state.dashboard);

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const loadData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchProjectsByStatus()),
        dispatch(fetchActionsTreemapData()),
        dispatch(fetchInvitesByCountry()),
        dispatch(fetchTotalJobs()),
        dispatch(fetchInvestmentBySector()),
        dispatch(fetchTotalBlockedProjects()),
        dispatch(fetchTotalInProductionProjects()),
        dispatch(fetchTotalInProgressProjects()),
        dispatch(fetchTotalIdeaProjects()),
        dispatch(fetchDelayedProjects()),
        dispatch(fetchJobsBySector()),
        dispatch(fetchProjectsByMonth()),
        dispatch(fetchProjectsByYear()),
        dispatch(fetchHighInvestmentProjects()),
        dispatch(fetchHierarchicalProjectsBySector()),
        dispatch(fetchPipelineProgression()),
        dispatch(fetchInvestmentByRegion()),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const tableColumns = [
    {
      title: "Nom du projet",
      dataIndex: "title",
      key: "name",
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar 
            size="small" 
            style={{ backgroundColor: '#1890ff' }}
            icon={<ProjectOutlined />}
          />
          <Text strong>{text}</Text>
        </div>
      ),
    },
    {
      title: "Investissement",
      dataIndex: "investment_amount",
      key: "investment_amount",
      render: (amount) => (
        <Tag color="green" style={{ fontWeight: 600 }}>
          {amount?.toLocaleString()} EUR
        </Tag>
      ),
      sorter: (a, b) => a.investment_amount - b.investment_amount,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: { showTitle: true },
      render: (text) => (
        <Tooltip title={text}>
          <Text type="secondary">{text}</Text>
        </Tooltip>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            size="small"
            style={{ color: '#1890ff' }}
          />
        </Space>
      ),
    },
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
                <FireOutlined style={{ marginRight: '16px' }} />
                Tableau de Bord Projets
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: '8px 0 0 0' }}>
                Vue d'ensemble des projets et investissements
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
            icon={<TeamOutlined />}
            title="Total Emplois"
            value={totalJobs.data?.total_jobs || 0}
            color="#1890ff"
            loading={totalJobs.loading}
            delay={0}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<ExclamationCircleOutlined />}
            title="Projets Bloqués"
            value={totalBlockedProjects.data?.total_blocked_projects || 0}
            color="#ff4d4f"
            loading={totalBlockedProjects.loading}
            delay={1}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<CheckCircleOutlined />}
            title="En Production"
            value={totalInProductionProjects.data?.total_in_production_projects || 0}
            color="#52c41a"
            loading={totalInProductionProjects.loading}
            delay={2}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<SyncOutlined />}
            title="En Cours"
            value={totalInProgressProjects.data?.total_in_progress_projects || 0}
            color="#1890ff"
            loading={totalInProgressProjects.loading}
            delay={3}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<ThunderboltOutlined />}
            title="Idées"
            value={totalIdeaProjects.data?.total_idea_projects || 0}
            color="#faad14"
            loading={totalIdeaProjects.loading}
            
            delay={4}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<ClockCircleOutlined />}
            title="En Retard"
            value={delayedProjects.data?.total_delayed_projects || 0}
            color="#ff4d4f"
            loading={delayedProjects.loading}
            
            delay={5}
          />
        </Col>
      </Row>

      {/* Graphiques principaux */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} lg={12}>
          <AnimatedChartCard
            title="Investissements par Secteur"
            loading={investmentBySector.loading}
            delay={0}
            extra={
              <Button type="text" icon={<SettingOutlined />} size="small" />
            }
          >
            {investmentBySector.error ? (
              <Alert 
                message="Erreur" 
                description={investmentBySector.error} 
                type="error" 
                showIcon 
              />
            ) : Array.isArray(investmentBySector.data) && investmentBySector.data.length > 0 ? (
              <InvestmentBySectorChart data={investmentBySector.data} />
            ) : (
              <Empty description="Aucune donnée disponible" />
            )}
          </AnimatedChartCard>
        </Col>

        <Col xs={24} lg={12}>
          <AnimatedChartCard
            title="Emplois par Secteur"
            loading={jobsBySector.loading}
            delay={1}
            extra={
              <Button type="text" icon={<SettingOutlined />} size="small" />
            }
          >
            {jobsBySector.error ? (
              <Alert 
                message="Erreur" 
                description={jobsBySector.error} 
                type="error" 
                showIcon 
              />
            ) : Array.isArray(jobsBySector.data) && jobsBySector.data.length > 0 ? (
              <StatsChart
                data={jobsBySector.data.map((item) => ({
                  name: item.sector, 
                  value: parseInt(item.jobs, 10), 
                }))}
                title="Jobs by Sector"
                type="bar" 
              />
            ) : (
              <Empty description="Aucune donnée disponible" />
            )}
          </AnimatedChartCard>
        </Col>
      </Row>

      {/* Deuxième ligne de graphiques */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} lg={12}>
          <AnimatedChartCard
            title="Projets par Statut"
            loading={projectsByStatus.loading}
            delay={0}
          >
            {projectsByStatus.error ? (
              <Alert 
                message="Erreur" 
                description={projectsByStatus.error} 
                type="error" 
                showIcon 
              />
            ) : Array.isArray(projectsByStatus.data) && projectsByStatus.data.length > 0 ? (
              <StatsChart
                data={projectsByStatus.data.map((item) => ({
                  name: item.status,
                  value: item.count,
                }))}
                title="Projects by Status"
                type="pie"
              />
            ) : (
              <Empty description="Aucune donnée disponible" />
            )}
          </AnimatedChartCard>
        </Col>

        <Col xs={24} lg={12}>
          <AnimatedChartCard
            title="Invités par Pays"
            loading={invitesByCountry.loading}
            delay={1}
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
      </Row>

      {/* Troisième ligne de graphiques */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} lg={12}>
          <AnimatedChartCard
            title="Projets par Mois"
            loading={projectsByMonth.loading}
            delay={0}
          >
            {projectsByMonth.error ? (
              <Alert 
                message="Erreur" 
                description={projectsByMonth.error} 
                type="error" 
                showIcon 
              />
            ) : Array.isArray(projectsByMonth.data) && projectsByMonth.data.length > 0 ? (
              <LineChart
                data={projectsByMonth.data.map((item) => ({
                  name: item.month || "Unknown",
                  value: item.projects,
                }))}
                title="Projects by Month"
              />
            ) : (
              <Empty description="Aucune donnée disponible" />
            )}
          </AnimatedChartCard>
        </Col>

        <Col xs={24} lg={12}>
          <AnimatedChartCard
            title="Projets par Année"
            loading={projectsByYear.loading}
            delay={1}
          >
            {projectsByYear.error ? (
              <Alert 
                message="Erreur" 
                description={projectsByYear.error} 
                type="error" 
                showIcon 
              />
            ) : Array.isArray(projectsByYear.data) && projectsByYear.data.length > 0 ? (
              <LineChart
                data={projectsByYear.data.map((item) => ({
                  name: item.year.toString(),
                  value: item.projects,
                }))}
                title="Projects by Year"
              />
            ) : (
              <Empty description="Aucune donnée disponible" />
            )}
          </AnimatedChartCard>
        </Col>
      </Row>

      {/* Quatrième ligne - Tableau et graphiques avancés */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} lg={12}>
          <AnimatedChartCard
            title="Projets à Fort Investissement"
            loading={highInvestmentProjects.loading}
            delay={0}
            extra={
              <Space>
                <Button type="text" icon={<ExportOutlined />} size="small" />
                <Button type="text" icon={<SettingOutlined />} size="small" />
              </Space>
            }
          >
            {highInvestmentProjects.error ? (
              <Alert
                message="Erreur"
                description={highInvestmentProjects.error}
                type="error"
                showIcon
              />
            ) : Array.isArray(highInvestmentProjects.data) && highInvestmentProjects.data.length > 0 ? (
              <Table
                dataSource={highInvestmentProjects.data}
                columns={tableColumns}
                rowKey="id"
                pagination={{ 
                  pageSize: 5,
                  showSizeChanger: false,
                  showQuickJumper: true
                }}
                size="small"
                style={{ borderRadius: '8px', overflow: 'hidden' }}
              />
            ) : (
              <Empty description="Aucune donnée disponible" />
            )}
          </AnimatedChartCard>
        </Col>

        <Col xs={24} lg={12}>
          <AnimatedChartCard
            title="Hiérarchie des Projets par Secteur"
            loading={hierarchicalProjectsBySector.loading}
            delay={1}
          >
            {hierarchicalProjectsBySector.error ? (
              <Alert
                message="Erreur"
                description={hierarchicalProjectsBySector.error}
                type="error"
                showIcon
              />
            ) : Array.isArray(hierarchicalProjectsBySector.data) && hierarchicalProjectsBySector.data.length > 0 ? (
              <TreemapChart
                data={hierarchicalProjectsBySector.data}
                title="Hierarchical Projects by Sector"
              />
            ) : (
              <Empty description="Aucune donnée disponible" />
            )}
          </AnimatedChartCard>
        </Col>
      </Row>

      {/* Cinquième ligne - Pipeline et carte */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <AnimatedChartCard
            title="Progression du Pipeline"
            loading={pipelineProgression.loading}
            delay={0}
          >
            {pipelineProgression.error ? (
              <Alert
                message="Erreur"
                description={pipelineProgression.error}
                type="error"
                showIcon
              />
            ) : Array.isArray(pipelineProgression.data) && pipelineProgression.data.length > 0 ? (
              <FunnelChart
                data={pipelineProgression.data}
                title="Pipeline Progression"
              />
            ) : (
              <Empty description="Aucune donnée disponible" />
            )}
          </AnimatedChartCard>
        </Col>

        <Col xs={24} lg={12}>
          <AnimatedChartCard
            title="Investissement par Région (Tunisie)"
            loading={investmentByRegion.loading}
            delay={1}
          >
            {investmentByRegion.error ? (
              <Alert
                message="Erreur"
                description={investmentByRegion.error}
                type="error"
                showIcon
              />
            ) : Array.isArray(investmentByRegion.data) && investmentByRegion.data.length > 0 ? (
              <MapChartTunisie
                data={investmentByRegion.data}
                title="Investment by Region"
              />
            ) : (
              <Empty description="Aucune donnée disponible" />
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

export default DashboardProjet;