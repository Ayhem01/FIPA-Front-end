import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Typography, Tag, Button, Space, Descriptions, 
  Timeline, Statistic, Avatar, Spin, message, Modal, Alert, Divider,
  Progress, Tooltip, Badge, Collapse, Skeleton, Empty, Grid
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined,
  UserOutlined, CalendarOutlined, ClockCircleOutlined, WarningOutlined,
  ThunderboltOutlined, ExclamationCircleOutlined, FlagOutlined,
  FileTextOutlined, TeamOutlined, AlertOutlined, InfoCircleOutlined,
  BankOutlined, PhoneOutlined, MailOutlined, IdcardOutlined,
  ApartmentOutlined, OrderedListOutlined, SyncOutlined, FireOutlined,
  SettingOutlined, ReloadOutlined, ArrowUpOutlined, ArrowDownOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fetchBlockageDetails, 
  deleteBlockage, 
  resolveBlockage, 
  escalateBlockage, 
  resetOperation 
} from '../../features/blockageSlice';
import BlockageForm from './BlockageForm';
import moment from 'moment';
import 'moment/locale/fr';

moment.locale('fr');

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { useBreakpoint } = Grid;

// Composant de statistique animée (réutilisé du dashboard)
const AnimatedStatCard = ({ icon, title, value, prefix, suffix, trend, color, loading, delay = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!loading && typeof value === 'number' && value > 0) {
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
    } else {
      setDisplayValue(value);
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
          height: '140px', // Hauteur fixe réduite
          background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`,
          border: `1px solid ${color}30`,
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative'
        }}
        bodyStyle={{ padding: '20px' }} // Padding réduit
      >
        <div className="stat-card-content">
          <div className="stat-header">
            <motion.div 
              className="stat-icon"
              variants={iconVariants}
              style={{
                width: '40px', // Taille réduite
                height: '40px',
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px', // Taille réduite
                boxShadow: `0 4px 16px ${color}40`
              }}
            >
              {loading ? <SyncOutlined spin /> : icon}
            </motion.div>
          </div>

          <div className="stat-body">
            <Text type="secondary" style={{ fontSize: '12px', fontWeight: 500 }}>
              {title}
            </Text>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay * 0.1 + 0.3 }}
            >
              {loading ? (
                <Skeleton.Input style={{ width: 80, height: 24 }} active />
              ) : (
                <Title level={4} style={{ 
                  margin: '4px 0 0 0', 
                  color: color,
                  fontWeight: 700,
                  fontSize: '18px' // Taille réduite
                }}>
                  {prefix}
                  <motion.span
                    key={displayValue}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
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

// Composant de carte animée (réutilisé du dashboard)
const AnimatedCard = ({ title, children, loading, extra, delay = 0, style = {}, compact = false }) => {
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
      style={{ height: compact ? 'auto' : '100%' }}
    >
      <Card
        className="chart-card-modern"
        title={
          title && (
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
          )
        }
        extra={extra}
        style={{
          height: compact ? 'auto' : 'fit-content',
          borderRadius: '16px',
          border: '1px solid #f0f0f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          ...style
        }}
        bodyStyle={{ 
          padding: compact ? '16px' : '20px', // Padding réduit
          height: loading ? '250px' : 'auto' // Hauteur réduite
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
                height: '200px' // Hauteur réduite
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

const BlockageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const screens = useBreakpoint();
  
  const { 
    selectedBlockage, 
    detailsLoading, 
    error, 
    operation 
  } = useSelector(state => state.blockages);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  // Charger les détails au montage
  useEffect(() => {
    if (id) {
      dispatch(fetchBlockageDetails(id));
    }
  }, [dispatch, id]);

  // Gestion des opérations
  useEffect(() => {
    if (operation.success) {
      switch (operation.type) {
        case 'delete':
          message.success('Blocage supprimé avec succès');
          navigate('/blockages');
          break;
        case 'resolve':
          message.success('Blocage résolu avec succès');
          dispatch(fetchBlockageDetails(id));
          break;
        case 'escalate':
          message.success('Blocage escaladé avec succès');
          dispatch(fetchBlockageDetails(id));
          break;
        case 'update':
          message.success('Blocage modifié avec succès');
          dispatch(fetchBlockageDetails(id));
          setEditModalVisible(false);
          break;
      }
      dispatch(resetOperation());
    } else if (operation.error) {
      message.error(`Erreur: ${operation.error}`);
      dispatch(resetOperation());
    }
  }, [operation, dispatch, id, navigate]);

  // Fonctions d'action
  const handleEdit = () => {
    setEditModalVisible(true);
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Supprimer ce blocage ?',
      content: 'Cette action est irréversible.',
      okText: 'Oui, supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => dispatch(deleteBlockage(id))
    });
  };

  const handleResolve = () => {
    Modal.confirm({
      title: 'Résoudre ce blocage ?',
      content: 'Cette action marquera le blocage comme résolu.',
      okText: 'Oui, résoudre',
      cancelText: 'Annuler',
      onOk: () => dispatch(resolveBlockage({ id }))
    });
  };

  const handleEscalate = () => {
    Modal.confirm({
      title: 'Escalader ce blocage ?',
      content: 'Cette action escalera le blocage vers un niveau supérieur.',
      okText: 'Oui, escalader',
      cancelText: 'Annuler',
      onOk: () => dispatch(escalateBlockage({ id, adminId: 1 }))
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchBlockageDetails(id));
      message.success('Données actualisées');
    } finally {
      setRefreshing(false);
    }
  };

  // Fonctions utilitaires
  const getStatusColor = (status) => {
    const colors = {
      actif: '#fa8c16',
      open: '#fa8c16',
      in_progress: '#1890ff',
      resolu: '#52c41a',
      resolved: '#52c41a',
      annule: '#ff4d4f',
      cancelled: '#ff4d4f'
    };
    return colors[status] || '#d9d9d9';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#52c41a',
      medium: '#fa8c16',
      high: '#ff4d4f',
      critical: '#722ed1'
    };
    return colors[priority] || '#d9d9d9';
  };

  const getTypeIcon = (type) => {
    const icons = {
      process: <FlagOutlined />,
      data: <FileTextOutlined />,
      technical: <AlertOutlined />,
      other: <ExclamationCircleOutlined />
    };
    return icons[type] || <ExclamationCircleOutlined />;
  };

  const getEntityIcon = (entityType) => {
    const icons = {
      investisseur: <BankOutlined />,
      prospect: <UserOutlined />,
      invite: <TeamOutlined />,
      projet: <ApartmentOutlined />
    };
    return icons[entityType] || <InfoCircleOutlined />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non défini';
    return moment(dateString).format('DD/MM/YYYY à HH:mm');
  };

  const formatAmount = (amount) => {
    if (!amount) return 'Non défini';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getTimelineItems = (blockage) => {
    const items = [];
    
    if (blockage.timeline.created) {
      items.push({
        color: '#1890ff',
        dot: <CalendarOutlined />,
        children: (
          <div>
            <Text strong style={{ fontSize: '13px' }}>Création du blocage</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>{formatDate(blockage.timeline.created)}</Text>
            {blockage.created_by_user && (
              <>
                <br />
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  Par: {blockage.created_by_user.name}
                </Text>
              </>
            )}
          </div>
        )
      });
    }

    if (blockage.timeline.escalated) {
      items.push({
        color: '#fa8c16',
        dot: <WarningOutlined />,
        children: (
          <div>
            <Text strong style={{ fontSize: '13px' }}>Escalade</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>{formatDate(blockage.timeline.escalated)}</Text>
          </div>
        )
      });
    }

    if (blockage.timeline.resolved) {
      items.push({
        color: '#52c41a',
        dot: <CheckCircleOutlined />,
        children: (
          <div>
            <Text strong style={{ fontSize: '13px' }}>Résolution</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>{formatDate(blockage.timeline.resolved)}</Text>
            {blockage.resolved_by_user && (
              <>
                <br />
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  Par: {blockage.resolved_by_user.name}
                </Text>
              </>
            )}
          </div>
        )
      });
    }

    return items;
  };

  if (detailsLoading) {
    return (
      <div className="dashboard-container-modern">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{ marginBottom: '16px' }}
            >
              <SyncOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            </motion.div>
            <Title level={3} style={{ color: '#1890ff' }}>
              Chargement des détails...
            </Title>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container-modern">
        <Alert
          message="Erreur"
          description={error}
          type="error"
          showIcon
          style={{ borderRadius: '12px' }}
          action={
            <Button size="small" onClick={() => navigate('/blockages')}>
              Retour à la liste
            </Button>
          }
        />
      </div>
    );
  }

  if (!selectedBlockage) {
    return (
      <div className="dashboard-container-modern">
        <Empty
          description="Blocage non trouvé"
          style={{
            padding: '80px 0',
            background: 'white',
            borderRadius: '16px',
            margin: '20px 0'
          }}
        >
          <Button type="primary" onClick={() => navigate('/blockages')}>
            Retour à la liste
          </Button>
        </Empty>
      </div>
    );
  }

  const blockage = selectedBlockage;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="dashboard-container-modern"
    >
      {/* Header avec animations */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="dashboard-header"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          padding: '24px', // Padding réduit
          marginBottom: '24px', // Margin réduite
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
              <Space style={{ marginBottom: '12px' }}>
                
              </Space>
              
              <Title level={2} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
                {getTypeIcon(blockage.blockage_type)} {blockage.name}
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: '4px 0 0 0' }}>
                Détails du blocage #{blockage.id}
                {blockage.is_escalated && (
                  <Badge 
                    status="error" 
                    text="Escaladé" 
                    style={{ 
                      marginLeft: 16,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)'
                    }}
                  />
                )}
              </Paragraph>
            </motion.div>
          </Col>
          
          <Col>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Space size="small">
                

                {['actif', 'open', 'in_progress'].includes(blockage.status) && (
                  <>
                    <Button 
                      size="small"
                      type="primary" 
                      icon={<CheckCircleOutlined />}
                      onClick={handleResolve}
                      style={{
                        backgroundColor: '#52c41a',
                        border: 'none'
                      }}
                    >
                      Résoudre
                    </Button>
                    
                    {!blockage.is_escalated && (
                      <Button 
                        size="small"
                        icon={<ThunderboltOutlined />}
                        onClick={handleEscalate}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          border: '1px solid rgba(255,255,255,0.3)',
                          color: 'white'
                        }}
                      >
                        Escalader
                      </Button>
                    )}
                  </>
                )}
                <Button 
                  icon={<ArrowLeftOutlined />} 
                  onClick={() => navigate('/blockages')}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white'
                  }}
                >
                  Retour
                </Button>
                
                <Button 
                  size="small"
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white'
                  }}
                >
                  Modifier
                </Button>
                
                <Button 
                  size="small"
                  danger 
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                  style={{
                    backgroundColor: 'rgba(255,77,79,0.3)',
                    border: '1px solid rgba(255,77,79,0.5)',
                    color: 'white'
                  }}
                >
                  Supprimer
                </Button>
              </Space>
            </motion.div>
          </Col>
        </Row>
      </motion.div>

      {/* Statistiques rapides */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <AnimatedStatCard
            icon={<CalendarOutlined />}
            title="Jours depuis création"
            value={blockage.metrics.days_since_creation}
            color="#1890ff"
            loading={false}
            delay={0}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <AnimatedStatCard
            icon={<ClockCircleOutlined />}
            title="Heures depuis création"
            value={blockage.metrics.hours_since_creation}
            color="#fa8c16"
            loading={false}
            delay={1}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <AnimatedStatCard
            icon={getTypeIcon(blockage.blockage_type)}
            title="Type de blocage"
            value={blockage.blockage_type}
            color={getPriorityColor(blockage.priority)}
            loading={false}
            delay={2}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <AnimatedStatCard
            icon={blockage.status === 'resolu' ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
            title="Statut actuel"
            value={blockage.status}
            color={getStatusColor(blockage.status)}
            loading={false}
            delay={3}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Informations principales */}
        <Col xs={24} lg={16}>
          {/* Informations générales du blocage */}
          <AnimatedCard 
            title="Informations du blocage" 
            delay={0}
            style={{ marginBottom: '16px' }}
            compact={true}
            
          >
            <Descriptions column={2} bordered size="small">
              {/* <Descriptions.Item label="ID" span={1}>
                <Badge count={blockage.id} style={{ backgroundColor: '#1890ff' }} />
              </Descriptions.Item> */}
              
              <Descriptions.Item label="Type" span={1}>
                <Tag color="blue" style={{ borderRadius: '6px', padding: '2px 8px', fontSize: '12px' }}>
                  {getTypeIcon(blockage.blockage_type)} {blockage.blockage_type}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Statut" span={1}>
                <Tag 
                  color={getStatusColor(blockage.status)} 
                  style={{ borderRadius: '6px', padding: '2px 8px', fontWeight: 600, fontSize: '12px' }}
                >
                  {blockage.status}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Priorité" span={1}>
                <Tag 
                  color={getPriorityColor(blockage.priority)}
                  style={{ borderRadius: '6px', padding: '2px 8px', fontWeight: 600, fontSize: '12px' }}
                >
                  {blockage.priority}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Bloquant" span={1}>
                <Tag color={blockage.is_blocking ? 'red' : 'green'} style={{ borderRadius: '6px', padding: '2px 8px', fontSize: '12px' }}>
                  {blockage.is_blocking ? 'Oui' : 'Non'}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Escaladé" span={1}>
                <Tag color={blockage.is_escalated ? 'red' : 'green'} style={{ borderRadius: '6px', padding: '2px 8px', fontSize: '12px' }}>
                  {blockage.is_escalated ? 'Oui' : 'Non'}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Description" span={2}>
                <Paragraph style={{ margin: 0, maxHeight: '60px', overflow: 'auto', fontSize: '13px' }}>
                  {blockage.description || 'Aucune description fournie'}
                </Paragraph>
              </Descriptions.Item>
            </Descriptions>
          </AnimatedCard>

          {/* Détails des entités liées */}
          <AnimatedCard 
            title="Entités liées" 
            delay={1}
            style={{ marginBottom: '16px' }}
            compact={true}
          >
            <Collapse 
              defaultActiveKey={['entity', 'stage']} 
              ghost
              size="small"
            >
              {/* Entité bloquée */}
              {blockage.blockable_details && (
                <Panel 
                  header={
                    <Space size="small">
                      {getEntityIcon(blockage.blockable_type)}
                      <Text strong style={{ fontSize: '13px' }}>
                        {blockage.blockable_type.charAt(0).toUpperCase() + blockage.blockable_type.slice(1)} 
                        #{blockage.blockable_id}
                      </Text>
                    </Space>
                  } 
                  key="entity"
                >
                  <Descriptions column={2} bordered size="small">
                    {/* <Descriptions.Item label="ID" span={1}>
                      <Badge count={blockage.blockable_details.id} style={{ backgroundColor: '#52c41a' }} />
                    </Descriptions.Item> */}
                    
                    <Descriptions.Item label="Statut" span={1}>
                      <Tag color={blockage.blockable_details.statut === 'actif' ? 'green' : 'orange'} size="small">
                        {blockage.blockable_details.statut}
                      </Tag>
                    </Descriptions.Item>

                    {blockage.blockable_details.nom && (
                      <Descriptions.Item label="Nom" span={1}>
                        <Space size="small">
                          <IdcardOutlined style={{ fontSize: '12px' }} />
                          <Text style={{ fontSize: '12px' }}>{blockage.blockable_details.nom}</Text>
                        </Space>
                      </Descriptions.Item>
                    )}

                    {blockage.blockable_details.prenom && (
                      <Descriptions.Item label="Prénom" span={1}>
                        <Text style={{ fontSize: '12px' }}>{blockage.blockable_details.prenom}</Text>
                      </Descriptions.Item>
                    )}

                    {blockage.blockable_details.email && (
                      <Descriptions.Item label="Email" span={blockage.blockable_details.prenom ? 1 : 2}>
                        <Space size="small">
                          <MailOutlined style={{ fontSize: '12px' }} />
                          <a href={`mailto:${blockage.blockable_details.email}`} style={{ fontSize: '12px' }}>
                            {blockage.blockable_details.email}
                          </a>
                        </Space>
                      </Descriptions.Item>
                    )}

                    {blockage.blockable_details.telephone && (
                      <Descriptions.Item label="Téléphone" span={1}>
                        <Space size="small">
                          <PhoneOutlined style={{ fontSize: '12px' }} />
                          <a href={`tel:${blockage.blockable_details.telephone}`} style={{ fontSize: '12px' }}>
                            {blockage.blockable_details.telephone}
                          </a>
                        </Space>
                      </Descriptions.Item>
                    )}

                    {blockage.blockable_details.type_investisseur && (
                      <Descriptions.Item label="Type d'investisseur" span={1}>
                        <Tag color="blue" size="small">{blockage.blockable_details.type_investisseur}</Tag>
                      </Descriptions.Item>
                    )}

                    {blockage.blockable_details.montant_disponible && (
                      <Descriptions.Item label="Montant disponible" span={1}>
                        <Text strong style={{ color: '#52c41a', fontSize: '12px' }}>
                          {formatAmount(blockage.blockable_details.montant_disponible)}
                        </Text>
                      </Descriptions.Item>
                    )}

                    <Descriptions.Item label="Créé le" span={2}>
                      <Space size="small">
                        <CalendarOutlined style={{ fontSize: '12px' }} />
                        <Text style={{ fontSize: '12px' }}>{formatDate(blockage.blockable_details.created_at)}</Text>
                      </Space>
                    </Descriptions.Item>
                  </Descriptions>
                </Panel>
              )}

              {/* Étape du pipeline */}
              {blockage.pipeline_stageable_details && (
                <Panel 
                  header={
                    <Space size="small">
                      <OrderedListOutlined />
                      <Text strong style={{ fontSize: '13px' }}>
                        Étape du pipeline #{blockage.pipeline_stageable_id}
                      </Text>
                    </Space>
                  } 
                  key="stage"
                >
                  <Descriptions column={2} bordered size="small">
                    {/* <Descriptions.Item label="ID" span={1}>
                      <Badge count={blockage.pipeline_stageable_details.id} style={{ backgroundColor: '#722ed1' }} />
                    </Descriptions.Item> */}
                    
                    <Descriptions.Item label="Ordre" span={1}>
                      <Badge count={blockage.pipeline_stageable_details.order} color="blue" />
                    </Descriptions.Item>

                    <Descriptions.Item label="Nom" span={2}>
                      <Text strong style={{ fontSize: '12px' }}>{blockage.pipeline_stageable_details.name}</Text>
                    </Descriptions.Item>

                    <Descriptions.Item label="Description" span={2}>
                      <Text style={{ fontSize: '12px' }}>{blockage.pipeline_stageable_details.description}</Text>
                    </Descriptions.Item>

                    {/* <Descriptions.Item label="Type" span={1}>
                      <Tag color="purple" size="small">
                        {blockage.pipeline_stageable_details.type}
                      </Tag>
                    </Descriptions.Item> */}

                    <Descriptions.Item label="Créé le" span={1}>
                      <Space size="small">
                        <CalendarOutlined style={{ fontSize: '12px' }} />
                        <Text style={{ fontSize: '12px' }}>{formatDate(blockage.pipeline_stageable_details.created_at)}</Text>
                      </Space>
                    </Descriptions.Item>
                  </Descriptions>
                </Panel>
              )}
            </Collapse>
          </AnimatedCard>

      
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          {/* Métriques supplémentaires */}
          {(blockage.metrics.time_to_resolution || blockage.metrics.time_to_escalation) && (
            <AnimatedCard 
              title="Métriques avancées" 
              delay={0}
              style={{ marginBottom: '16px' }}
              compact={true}
            >
              <Row gutter={[12, 12]}>
                {blockage.metrics.time_to_resolution && (
                  <Col span={24}>
                    <Statistic
                      title="Temps de résolution"
                      value={blockage.metrics.time_to_resolution}
                      suffix="heures"
                      prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                      valueStyle={{ color: '#52c41a', fontSize: '16px' }}
                    />
                  </Col>
                )}
                
                {blockage.metrics.time_to_escalation && (
                  <Col span={24}>
                    <Statistic
                      title="Temps d'escalade"
                      value={blockage.metrics.time_to_escalation}
                      suffix="heures"
                      prefix={<WarningOutlined style={{ color: '#fa8c16' }} />}
                      valueStyle={{ color: '#fa8c16', fontSize: '16px' }}
                    />
                  </Col>
                )}
              </Row>

              {blockage.metrics.is_overdue && (
                <Alert
                  message="Blocage en retard"
                  description="Ce blocage dépasse le délai habituel de résolution."
                  type="warning"
                  showIcon
                  size="small"
                  style={{ 
                    marginTop: '12px',
                    borderRadius: '6px'
                  }}
                />
              )}
            </AnimatedCard>
          )}

          {/* Dates importantes */}
          <AnimatedCard 
            title="Dates importantes" 
            delay={1}
            style={{ marginBottom: '16px' }}
            compact={true}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <div>
                <Text strong style={{ fontSize: '12px' }}>Créé le :</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  {formatDate(blockage.created_at)}
                </Text>
              </div>

              <Divider style={{ margin: '4px 0' }} />

              <div>
                <Text strong style={{ fontSize: '12px' }}>Dernière mise à jour :</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  {formatDate(blockage.updated_at)}
                </Text>
              </div>

              {blockage.escalated_at && (
                <>
                  <Divider style={{ margin: '4px 0' }} />
                  <div>
                    <Text strong style={{ fontSize: '12px' }}>Escaladé le :</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      {formatDate(blockage.escalated_at)}
                    </Text>
                  </div>
                </>
              )}

              {blockage.resolved_at && (
                <>
                  <Divider style={{ margin: '4px 0' }} />
                  <div>
                    <Text strong style={{ fontSize: '12px' }}>Résolu le :</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      {formatDate(blockage.resolved_at)}
                    </Text>
                  </div>
                </>
              )}
            </Space>
          </AnimatedCard>

          {/* Personnes impliquées */}
          <AnimatedCard 
            title="Personnes impliquées" 
            delay={2}
            compact={true}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              {blockage.created_by_user && (
                <div>
                  <Text strong style={{ fontSize: '12px' }}>Créé par :</Text>
                  <br />
                  <Space style={{ marginTop: '6px' }} size="small">
                    <Avatar 
                      icon={<UserOutlined />} 
                      style={{ backgroundColor: '#1890ff' }}
                      size="small"
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '12px' }}>{blockage.created_by_user.name}</div>
                      <Text type="secondary" style={{ fontSize: '10px' }}>
                        {blockage.created_by_user.email}
                      </Text>
                    </div>
                  </Space>
                </div>
              )}

              {blockage.assigned_user && (
                <>
                  <Divider style={{ margin: '8px 0' }} />
                  <div>
                    <Text strong style={{ fontSize: '12px' }}>Assigné à :</Text>
                    <br />
                    <Space style={{ marginTop: '6px' }} size="small">
                      <Avatar 
                        icon={<TeamOutlined />} 
                        style={{ backgroundColor: '#52c41a' }}
                        size="small"
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '12px' }}>{blockage.assigned_user.name}</div>
                        <Text type="secondary" style={{ fontSize: '10px' }}>
                          {blockage.assigned_user.email}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '9px' }}>
                          Assigné {blockage.assigned_user.assigned_since}
                        </Text>
                      </div>
                    </Space>
                  </div>
                </>
              )}

              {blockage.resolved_by_user && (
                <>
                  <Divider style={{ margin: '8px 0' }} />
                  <div>
                    <Text strong style={{ fontSize: '12px' }}>Résolu par :</Text>
                    <br />
                    <Space style={{ marginTop: '6px' }} size="small">
                      <Avatar 
                        icon={<CheckCircleOutlined />} 
                        style={{ backgroundColor: '#52c41a' }}
                        size="small"
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '12px' }}>{blockage.resolved_by_user.name}</div>
                        <Text type="secondary" style={{ fontSize: '10px' }}>
                          {blockage.resolved_by_user.email}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '9px' }}>
                          Le {formatDate(blockage.resolved_by_user.resolved_date)}
                        </Text>
                      </div>
                    </Space>
                  </div>
                </>
              )}
            </Space>
          </AnimatedCard>
        </Col>
      </Row>

      {/* Modal de modification */}
      <Modal
        title="Modifier le blocage"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
        maskClosable={false}
        style={{ 
          top: 20,
          borderRadius: '16px'
        }}
      >
        <BlockageForm
          blockage={blockage}
          onCancel={() => setEditModalVisible(false)}
          entityType={blockage.blockable_type}
          entityId={blockage.blockable_id}
          pipelineStageType={blockage.pipeline_stageable_type}
          pipelineStageId={blockage.pipeline_stageable_id}
        />
      </Modal>

      {/* Styles CSS intégrés */}
      <style jsx>{`
        .dashboard-container-modern {
          padding: 16px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
        }

        .stat-card-modern {
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .stat-card-modern:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(0,0,0,0.12) !important;
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
          margin-bottom: 12px;
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
          box-shadow: 0 6px 24px rgba(0,0,0,0.12) !important;
        }

        .dashboard-header {
          position: relative;
        }

        @media (max-width: 768px) {
          .dashboard-container-modern {
            padding: 12px;
          }
          
          .dashboard-header {
            padding: 16px !important;
            text-align: center;
          }
          
          .stat-card-modern {
            margin-bottom: 12px;
          }
        }

        @media (max-width: 576px) {
          .dashboard-header {
            border-radius: 12px !important;
          }
          
          .chart-card-modern {
            margin-bottom: 12px;
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
          border-radius: 4px;
        }

        /* Effet de parallaxe pour le header */
        .header-background {
          background-attachment: fixed;
        }

        /* Styles pour les descriptions */
        .ant-descriptions-bordered .ant-descriptions-item-label {
          background: linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%);
          font-weight: 600;
          font-size: 12px;
          padding: 8px 12px;
        }

        .ant-descriptions-bordered .ant-descriptions-item-content {
          background: white;
          font-size: 12px;
          padding: 8px 12px;
        }

        /* Styles pour les tags */
        .ant-tag {
          border: none;
          font-weight: 500;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        /* Styles pour les boutons */
        .ant-btn {
          border-radius: 6px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .ant-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 3px 8px rgba(0,0,0,0.15);
        }

        /* Timeline personnalisée */
        .ant-timeline-item-tail {
          border-left: 2px solid #f0f0f0;
        }

        .ant-timeline-item-head {
          border: 2px solid #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }

        /* Collapse personnalisé */
        .ant-collapse > .ant-collapse-item > .ant-collapse-header {
          padding: 8px 12px;
          font-size: 13px;
        }

        .ant-collapse-content > .ant-collapse-content-box {
          padding: 12px;
        }
      `}</style>
    </motion.div>
  );
};

export default BlockageDetails;