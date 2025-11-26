import React, { useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, List, Tag, Progress, Button, Alert, Spin, 
  Space, Typography, Avatar, Grid, Empty
} from 'antd';
import { 
  CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, 
  PlusOutlined, TrophyOutlined, FireOutlined, TeamOutlined,
  PhoneOutlined, VideoCameraOutlined, MailOutlined, 
  FileTextOutlined, CheckSquareOutlined, BarChartOutlined,
  CalendarOutlined, BellOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getDashboardStats } from '../../features/taskSlice';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const TasksDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const screens = useBreakpoint();
  
  const { data, loading, error } = useSelector(state => state.tasks.dashboardStats);

  useEffect(() => {
    dispatch(getDashboardStats());
  }, [dispatch]);

  // Variants d'animation
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  // Données par défaut avec données de démonstration si vides
  const safeData = {
    total: data?.total || 0,
    completed: data?.completed || 0,
    inProgress: data?.inProgress || data?.in_progress || 0,
    overdue: data?.overdue || 0,
    notStarted: data?.notStarted || data?.not_started || 0,
    recentTasks: data?.recentTasks || data?.recent_tasks || [],
    byStatus: data?.byStatus || data?.by_status || [
      { status: 'completed', count: data?.completed || 0 },
      { status: 'in_progress', count: data?.inProgress || data?.in_progress || 0 },
      { status: 'not_started', count: data?.notStarted || data?.not_started || 0 },
      { status: 'waiting', count: data?.waiting || 0 },
      { status: 'deferred', count: data?.deferred || 0 }
    ].filter(item => item.count > 0),
    byType: data?.byType || data?.by_type || [
      { type: 'call', count: data?.callTasks || 0 },
      { type: 'meeting', count: data?.meetingTasks || 0 },
      { type: 'email_journal', count: data?.emailTasks || 0 },
      { type: 'note', count: data?.noteTasks || 0 },
      { type: 'todo', count: data?.todoTasks || 0 }
    ].filter(item => item.count > 0)
  };

  // Données de démonstration si aucune donnée n'est disponible
  if (safeData.total === 0 && !loading && !error) {
    safeData.total = 12;
    safeData.completed = 8;
    safeData.inProgress = 3;
    safeData.overdue = 1;
    safeData.notStarted = 0;
    
    safeData.byStatus = [
      { status: 'completed', count: 8 },
      { status: 'in_progress', count: 3 },
      { status: 'not_started', count: 0 },
      { status: 'waiting', count: 1 }
    ];
    
    safeData.byType = [
      { type: 'call', count: 4 },
      { type: 'meeting', count: 3 },
      { type: 'email_journal', count: 2 },
      { type: 'note', count: 2 },
      { type: 'todo', count: 1 }
    ];

    safeData.recentTasks = [
      {
        id: 1,
        title: "Appel client important",
        status: "in_progress",
        priority: "high",
        start: "2024-01-15"
      },
      {
        id: 2,
        title: "Réunion équipe projet",
        status: "completed",
        priority: "normal",
        start: "2024-01-14"
      },
      {
        id: 3,
        title: "Suivi prospect",
        status: "not_started",
        priority: "low",
        start: "2024-01-16"
      }
    ];
  }

  const getStatusTag = (status) => {
    const configs = {
      completed: { 
        color: 'success', 
        icon: <CheckCircleOutlined />, 
        text: 'Terminé',
        gradient: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)'
      },
      in_progress: { 
        color: 'processing', 
        icon: <ClockCircleOutlined />, 
        text: 'En cours',
        gradient: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)'
      },
      not_started: { 
        color: 'warning', 
        icon: <ExclamationCircleOutlined />, 
        text: 'Non commencé',
        gradient: 'linear-gradient(135deg, #fa8c16 0%, #ffa940 100%)'
      },
      deferred: { 
        color: 'purple', 
        icon: <CalendarOutlined />, 
        text: 'Reporté',
        gradient: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)'
      },
      waiting: { 
        color: 'cyan', 
        icon: <BellOutlined />, 
        text: 'En attente',
        gradient: 'linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)'
      }
    };

    const config = configs[status] || { 
      color: 'default', 
      text: 'Inconnu', 
      gradient: 'linear-gradient(135deg, #d9d9d9 0%, #f0f0f0 100%)',
      icon: <ExclamationCircleOutlined />
    };
    
    return (
      <Tag 
        color={config.color} 
        icon={config.icon}
        style={{
          background: config.gradient,
          border: 'none',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 500,
          padding: '4px 8px',
          color: 'white'
        }}
      >
        {config.text}
      </Tag>
    );
  };

  const getPriorityTag = (priority) => {
    const configs = {
      urgent: { 
        color: 'volcano', 
        icon: <FireOutlined />, 
        text: 'Urgente',
        gradient: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)'
      },
      high: { 
        color: 'red', 
        icon: <ExclamationCircleOutlined />, 
        text: 'Haute',
        gradient: 'linear-gradient(135deg, #f5222d 0%, #ff4d4f 100%)'
      },
      normal: { 
        color: 'orange', 
        text: 'Normale',
        gradient: 'linear-gradient(135deg, #fa8c16 0%, #ffa940 100%)'
      },
      low: { 
        color: 'green', 
        text: 'Basse',
        gradient: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)'
      }
    };

    const config = configs[priority] || { 
      color: 'default', 
      text: 'Standard', 
      gradient: 'linear-gradient(135deg, #d9d9d9 0%, #f0f0f0 100%)'
    };
    
    return (
      <Tag 
        color={config.color}
        icon={config.icon}
        style={{
          background: config.gradient,
          border: 'none',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 500,
          padding: '4px 8px',
          color: 'white'
        }}
      >
        {config.text}
      </Tag>
    );
  };

  const getTypeIcon = (type) => {
    const configs = {
      call: { icon: <PhoneOutlined />, color: '#1890ff', text: 'Appel' },
      meeting: { icon: <TeamOutlined />, color: '#52c41a', text: 'Réunion' },
      email_journal: { icon: <MailOutlined />, color: '#eb2f96', text: 'Email' },
      note: { icon: <FileTextOutlined />, color: '#722ed1', text: 'Note' },
      todo: { icon: <CheckSquareOutlined />, color: '#faad14', text: 'À faire' }
    };

    const config = configs[type] || { icon: <FileTextOutlined />, color: '#8c8c8c', text: 'Autre' };
    
    return (
      <Space>
        <Avatar 
          size="small" 
          icon={config.icon} 
          style={{ 
            background: config.color,
            border: 'none'
          }} 
        />
        <Text style={{ fontWeight: 500 }}>{config.text}</Text>
      </Space>
    );
  };

  const handleViewTask = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleAddTask = () => {
    navigate('/tasks/create');
  };

  // Debug: Log data pour vérifier la structure
  console.log('Dashboard data from store:', data);
  console.log('Safe data processed:', safeData);
  console.log('Loading state:', loading);
  console.log('Error state:', error);

  if (error) {
    return (
      <motion.div 
        className="modern-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ padding: '24px' }}
      >
        <Card
          style={{
            borderRadius: '16px',
            border: '1px solid #ffccc7',
            background: 'linear-gradient(135deg, #fff2f0 0%, #ffebe8 100%)'
          }}
          bodyStyle={{ padding: '32px' }}
        >
          <Alert 
            message="Erreur de chargement" 
            description={`Impossible de charger les statistiques: ${error}`} 
            type="error" 
            showIcon 
            style={{
              border: 'none',
              background: 'transparent'
            }}
          />
          <Button 
            type="primary" 
            onClick={() => dispatch(getDashboardStats())}
            style={{ marginTop: '16px' }}
          >
            Réessayer
          </Button>
        </Card>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div 
        className="modern-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ 
          padding: '24px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '60vh'
        }}
      >
        <Card
          style={{
            borderRadius: '16px',
            border: '1px solid #f0f0f0',
            textAlign: 'center'
          }}
          bodyStyle={{ padding: '48px' }}
        >
          <Spin size="large" />
          <Title level={4} style={{ marginTop: '16px', color: '#666' }}>
            Chargement des statistiques...
          </Title>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="modern-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ padding: '24px' }}
    >
      {/* En-tête moderne */}
      <motion.div
        className="modern-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="header-background"
          animate={{
            backgroundPosition: ['0px 0px', '60px 60px']
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        <div className="header-content">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}
          >
            <div>
              <Title level={1} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
                <BarChartOutlined style={{ marginRight: '16px' }} />
                Tableau de bord
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
                Vue d'ensemble de vos tâches et activités
              </Text>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={handleAddTask}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '12px',
                  fontWeight: 600,
                  backdropFilter: 'blur(10px)'
                }}
              >
                Ajouter une tâche
              </Button> */}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Cartes statistiques */}
      <motion.div variants={cardVariants} style={{ marginTop: '32px' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={6}>
            <motion.div whileHover={{ scale: 1.02, y: -4 }}>
              <Card
                className="stat-card"
                style={{
                  borderRadius: '16px',
                  border: '1px solid #f0f0f0',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                  overflow: 'hidden'
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: 500 }}>
                      TOTAL DES TÂCHES
                    </Text>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginTop: '8px' }}>
                      {safeData.total}
                    </div>
                  </div>
                  <Avatar 
                    size={56} 
                    icon={<TrophyOutlined />} 
                    style={{ 
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontSize: '24px'
                    }} 
                  />
                </div>
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <motion.div whileHover={{ scale: 1.02, y: -4 }}>
              <Card
                className="stat-card"
                style={{
                  borderRadius: '16px',
                  border: '1px solid #f0f0f0',
                  background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                  boxShadow: '0 8px 32px rgba(82, 196, 26, 0.3)',
                  overflow: 'hidden'
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: 500 }}>
                      TERMINÉES
                    </Text>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginTop: '8px' }}>
                      {safeData.completed}
                      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', marginLeft: '8px' }}>
                        / {safeData.total}
                      </Text>
                    </div>
                    <Progress 
                      percent={safeData.total > 0 ? Math.round((safeData.completed / safeData.total) * 100) : 0} 
                      strokeColor="rgba(255,255,255,0.8)"
                      trailColor="rgba(255,255,255,0.2)"
                      showInfo={false} 
                      strokeWidth={6}
                      style={{ marginTop: '12px' }}
                    />
                  </div>
                  <Avatar 
                    size={56} 
                    icon={<CheckCircleOutlined />} 
                    style={{ 
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontSize: '24px'
                    }} 
                  />
                </div>
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <motion.div whileHover={{ scale: 1.02, y: -4 }}>
              <Card
                className="stat-card"
                style={{
                  borderRadius: '16px',
                  border: '1px solid #f0f0f0',
                  background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                  boxShadow: '0 8px 32px rgba(24, 144, 255, 0.3)',
                  overflow: 'hidden'
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: 500 }}>
                      EN COURS
                    </Text>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginTop: '8px' }}>
                      {safeData.inProgress}
                      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', marginLeft: '8px' }}>
                        / {safeData.total}
                      </Text>
                    </div>
                    <Progress 
                      percent={safeData.total > 0 ? Math.round((safeData.inProgress / safeData.total) * 100) : 0} 
                      strokeColor="rgba(255,255,255,0.8)"
                      trailColor="rgba(255,255,255,0.2)"
                      showInfo={false} 
                      strokeWidth={6}
                      style={{ marginTop: '12px' }}
                    />
                  </div>
                  <Avatar 
                    size={56} 
                    icon={<ClockCircleOutlined />} 
                    style={{ 
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontSize: '24px'
                    }} 
                  />
                </div>
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <motion.div whileHover={{ scale: 1.02, y: -4 }}>
              <Card
                className="stat-card"
                style={{
                  borderRadius: '16px',
                  border: '1px solid #f0f0f0',
                  background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
                  boxShadow: '0 8px 32px rgba(255, 77, 79, 0.3)',
                  overflow: 'hidden'
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: 500 }}>
                      EN RETARD
                    </Text>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginTop: '8px' }}>
                      {safeData.overdue}
                      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', marginLeft: '8px' }}>
                        / {safeData.total}
                      </Text>
                    </div>
                    <Progress 
                      percent={safeData.total > 0 ? Math.round((safeData.overdue / safeData.total) * 100) : 0} 
                      strokeColor="rgba(255,255,255,0.8)"
                      trailColor="rgba(255,255,255,0.2)"
                      showInfo={false}
                      strokeWidth={6}
                      style={{ marginTop: '12px' }}
                    />
                  </div>
                  <Avatar 
                    size={56} 
                    icon={<ExclamationCircleOutlined />} 
                    style={{ 
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontSize: '24px'
                    }} 
                  />
                </div>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </motion.div>
      
      {/* Section détaillée */}
      <motion.div variants={cardVariants} style={{ marginTop: '32px' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <Avatar size="small" icon={<ClockCircleOutlined />} style={{ background: '#1890ff' }} />
                  <Text strong>Tâches récentes</Text>
                </Space>
              }
              className="modern-card"
              style={{
                borderRadius: '16px',
                border: '1px solid #f0f0f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
              bodyStyle={{ padding: '24px' }}
            >
              {safeData.recentTasks && safeData.recentTasks.length > 0 ? (
                <List
                  size="small"
                  dataSource={safeData.recentTasks}
                  renderItem={(item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <List.Item
                        style={{
                          padding: '16px',
                          borderRadius: '12px',
                          marginBottom: '8px',
                          background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)',
                          border: '1px solid #f0f0f0',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        className="task-item"
                        onClick={() => handleViewTask(item.id)}
                        actions={[
                          <Space key="status">
                            {getStatusTag(item.status)}
                            {item.priority && getPriorityTag(item.priority)}
                          </Space>
                        ]}
                      >
                        <List.Item.Meta
                          title={
                            <Text strong style={{ color: '#1a1a1a', fontSize: '14px' }}>
                              {item.title || item.name || 'Tâche sans titre'}
                            </Text>
                          }
                          description={
                            item.start && (
                              <Space>
                                <CalendarOutlined style={{ color: '#666' }} />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  Échéance: {moment(item.start).format('DD/MM/YYYY')}
                                </Text>
                              </Space>
                            )
                          }
                        />
                      </List.Item>
                    </motion.div>
                  )}
                />
              ) : (
                <Empty 
                  description="Aucune tâche récente"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ padding: '40px 0' }}
                />
              )}
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Card 
                  title={
                    <Space>
                      <Avatar size="small" icon={<BarChartOutlined />} style={{ background: '#52c41a' }} />
                      <Text strong>Répartition par statut</Text>
                    </Space>
                  }
                  className="modern-card"
                  style={{
                    borderRadius: '16px',
                    border: '1px solid #f0f0f0',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                  }}
                  bodyStyle={{ padding: '24px' }}
                >
                  {safeData.byStatus && safeData.byStatus.length > 0 ? (
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      {safeData.byStatus.map((item, index) => (
                        <motion.div
                          key={item.status}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            padding: '12px',
                            borderRadius: '8px',
                            background: '#fafafa'
                          }}
                        >
                          <div style={{ width: '140px', flexShrink: 0 }}>
                            {getStatusTag(item.status)}
                          </div>
                          <div style={{ flex: 1, marginLeft: '16px' }}>
                            <Progress 
                              percent={safeData.total > 0 ? Math.round((item.count / safeData.total) * 100) : 0} 
                              strokeColor={
                                item.status === 'completed' ? '#52c41a' :
                                item.status === 'in_progress' ? '#1890ff' :
                                item.status === 'not_started' ? '#fa8c16' : 
                                item.status === 'waiting' ? '#13c2c2' :
                                item.status === 'deferred' ? '#722ed1' : '#8c8c8c'
                              }
                              trailColor="#f0f0f0"
                              strokeWidth={8}
                              format={(percent) => (
                                <Text style={{ fontSize: '12px', fontWeight: 600 }}>
                                  {item.count}
                                </Text>
                              )}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </Space>
                  ) : (
                    <Empty 
                      description="Aucune donnée de statut"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      style={{ padding: '40px 0' }}
                    />
                  )}
                </Card>
              </Col>
              
              <Col xs={24}>
                <Card 
                  title={
                    <Space>
                      <Avatar size="small" icon={<TeamOutlined />} style={{ background: '#722ed1' }} />
                      <Text strong>Répartition par type</Text>
                    </Space>
                  }
                  className="modern-card"
                  style={{
                    borderRadius: '16px',
                    border: '1px solid #f0f0f0',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                  }}
                  bodyStyle={{ padding: '24px' }}
                >
                  {safeData.byType && safeData.byType.length > 0 ? (
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      {safeData.byType.map((item, index) => (
                        <motion.div
                          key={item.type}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            padding: '12px',
                            borderRadius: '8px',
                            background: '#fafafa'
                          }}
                        >
                          <div style={{ width: '140px', flexShrink: 0 }}>
                            {getTypeIcon(item.type)}
                          </div>
                          <div style={{ flex: 1, marginLeft: '16px' }}>
                            <Progress 
                              percent={safeData.total > 0 ? Math.round((item.count / safeData.total) * 100) : 0} 
                              strokeColor={
                                item.type === 'call' ? '#1890ff' :
                                item.type === 'meeting' ? '#52c41a' :
                                item.type === 'email_journal' ? '#eb2f96' :
                                item.type === 'note' ? '#722ed1' : '#faad14'
                              }
                              trailColor="#f0f0f0"
                              strokeWidth={8}
                              format={(percent) => (
                                <Text style={{ fontSize: '12px', fontWeight: 600 }}>
                                  {item.count}
                                </Text>
                              )}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </Space>
                  ) : (
                    <Empty 
                      description="Aucune donnée de type"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      style={{ padding: '40px 0' }}
                    />
                  )}
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </motion.div>

      {/* Styles CSS intégrés */}
      <style jsx>{`
        .modern-container {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
          padding: 0;
        }

        .modern-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 40px;
          margin-bottom: 0;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .header-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.1;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        .header-content {
          position: relative;
          z-index: 1;
        }

        .header-content h1 {
          margin: 0 !important;
          font-size: 32px !important;
        }

        .stat-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 48px rgba(0,0,0,0.15) !important;
        }

        .modern-card {
          transition: all 0.3s ease;
        }

        .modern-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
        }

        .task-item:hover {
          transform: translateX(4px) !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important;
          background: linear-gradient(135deg, #f0f2ff 0%, #e6f0ff 100%) !important;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .modern-container {
            padding: 16px !important;
          }

          .modern-header {
            padding: 24px;
            border-radius: 16px;
          }

          .header-content h1 {
            font-size: 24px !important;
          }

          .header-content > div > div {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px;
          }

          .stat-card .ant-card-body {
            padding: 20px !important;
          }

          .modern-card .ant-card-body {
            padding: 20px !important;
          }
        }

        @media (max-width: 576px) {
          .modern-container {
            padding: 12px !important;
          }

          .header-content h1 {
            font-size: 20px !important;
          }

          .stat-card .ant-card-body {
            padding: 16px !important;
          }

          .modern-card .ant-card-body {
            padding: 16px !important;
          }

          .stat-card div[style*="fontSize: '32px'"] {
            font-size: 24px !important;
          }
        }

        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .ant-card {
          animation: fadeInUp 0.5s ease-out;
        }

        .ant-list-item {
          animation: fadeInUp 0.3s ease-out;
        }

        /* Améliorations visuelles */
        .ant-progress-text {
          color: #666 !important;
          font-weight: 600 !important;
        }

        .ant-empty-description {
          color: #999 !important;
        }

        .ant-list-item-action {
          margin-left: 0 !important;
        }

        /* Focus et accessibilité */
        .task-item:focus,
        .stat-card:focus {
          outline: 2px solid #1890ff;
          outline-offset: 2px;
        }

        /* Effets de transition smooth */
        * {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
      `}</style>
    </motion.div>
  );
};

export default TasksDashboard;