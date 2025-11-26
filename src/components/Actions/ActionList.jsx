import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Table, Card, Input, Button, Space, Tag, Row, Col, Select,
  DatePicker, Tooltip, Divider, Typography, Dropdown, Menu,
  Empty, Spin, Pagination, Radio, Badge, Avatar, Breadcrumb,
  Statistic, Alert, Grid
} from 'antd';
import {
  SearchOutlined, FilterOutlined, PlusOutlined, CalendarOutlined,
  EyeOutlined, EditOutlined, DeleteOutlined, DownloadOutlined,
  MoreOutlined, SortAscendingOutlined, ReloadOutlined, UserOutlined,
  GlobalOutlined, FileTextOutlined, InfoCircleOutlined, HomeOutlined,
  TeamOutlined, PlayCircleOutlined, SettingOutlined, PhoneOutlined,
  EnvironmentOutlined, CheckCircleOutlined, ClockCircleOutlined,
  ExclamationCircleOutlined, CloseCircleOutlined, SyncOutlined,
  FireOutlined, ThunderboltOutlined, ArrowUpOutlined, ArrowDownOutlined
} from '@ant-design/icons';
import { fetchActions, deleteAction } from '../../features/marketingSlice';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { useBreakpoint } = Grid;

// Composant de statistique animée similaire au dashboard
const AnimatedStatCard = ({ icon, title, value, color, loading, delay = 0, trend }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!loading && value > 0) {
      const duration = 1500;
      const steps = 30;
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
      y: -3,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
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
        bodyStyle={{ padding: '20px' }}
      >
        <div className="stat-card-content">
          <div className="stat-header">
            <motion.div 
              className="stat-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay * 0.1 + 0.2 }}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px',
                boxShadow: `0 4px 12px ${color}40`
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
            <Text type="secondary" style={{ fontSize: '13px', fontWeight: 500 }}>
              {title}
            </Text>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay * 0.1 + 0.3 }}
            >
              <Title level={3} style={{ 
                margin: '8px 0 0 0', 
                color: color,
                fontWeight: 700,
                fontSize: '24px'
              }}>
                <motion.span
                  key={displayValue}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {displayValue.toLocaleString()}
                </motion.span>
              </Title>
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

// Composant de carte animée similaire au dashboard
const AnimatedContentCard = ({ title, children, loading, extra, delay = 0 }) => {
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
        className="content-card-modern"
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
        bodyStyle={{ padding: '24px' }}
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
                height: '200px'
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

const ActionList = () => {
  const dispatch = useDispatch();
  const screens = useBreakpoint();
  const { items: actionsData, loading } = useSelector((state) => state.marketing.actions || { items: [] });

    const currentUser = useSelector(state => state.user.user);
  const isAdmin = React.useMemo(() => {
    if (!currentUser) return false;
    const flag = [true, 1, '1', 'true'].includes(currentUser.is_admin);
    const roleStr = String(currentUser.role || '').toLowerCase();
    const roles = [
      roleStr,
      ...(Array.isArray(currentUser.roles_list) ? currentUser.roles_list : []),
      ...(Array.isArray(currentUser.role_names) ? currentUser.role_names : []),
      ...(Array.isArray(currentUser.roles) ? currentUser.roles.map(r => r?.name || r) : [])
    ].filter(Boolean).map(x => String(x).toLowerCase());
    return flag || roles.includes('admin');
  }, [currentUser]);

  // États pour la recherche, les filtres et la pagination
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    statut: '',
    periode: '',
    responsable_id: '',
    dateRange: null
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [sortParams, setSortParams] = useState({
    sort_by: 'date_debut',
    sort_direction: 'asc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Extraction des données paginées
  const actions = actionsData?.data || [];

  // Récupérer le total à partir de la réponse
  useEffect(() => {
    if (actionsData && actionsData.total) {
      setPagination(prev => ({
        ...prev,
        total: actionsData.total
      }));
    }
  }, [actionsData]);

  // Fetch actions avec les paramètres actuels
  const fetchActionsList = async () => {
    setRefreshing(true);
    try {
      const params = {
        page: pagination.current,
        per_page: pagination.pageSize,
        ...sortParams
      };

      // Ajouter les filtres de base
      if (filters.type) params.type = filters.type;
      if (filters.statut) params.statut = filters.statut;
      if (filters.responsable_id) params.responsable_id = filters.responsable_id;
      if (filters.periode) params.periode = filters.periode;
      if (searchText) params.nom = searchText;

      await dispatch(fetchActions(params));
    } finally {
      setRefreshing(false);
    }
  };

  // Charger les actions au montage et quand les paramètres changent
  useEffect(() => {
    fetchActionsList();
  }, [pagination.current, pagination.pageSize, sortParams, filters.type, filters.statut, filters.periode, filters.responsable_id]);

  // Gestion de la recherche
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchActionsList();
  };

  // Gestion des filtres
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Gestion de la suppression
  const handleDeleteAction = async (id) => {
    try {
      await dispatch(deleteAction(id)).unwrap();
      fetchActionsList();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  // Réinitialiser les filtres
  const clearFilters = () => {
    setFilters({
      type: '',
      statut: '',
      periode: '',
      responsable_id: '',
      dateRange: null
    });
    setSearchText('');
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Calcul des statistiques
  const getStats = () => {
    const total = actions.length;
    const planifiees = actions.filter(a => a.statut === 'planifiee').length;
    const terminees = actions.filter(a => a.statut === 'terminee').length;
    const avenir = actions.filter(a => moment(a.date_debut).isAfter(moment())).length;

    return { total, planifiees, terminees, avenir };
  };

  // Calculer les stats
  const stats = getStats();

  // Suppression groupée
  const handleBatchDelete = async () => {
    try {
      for (const id of selectedRowKeys) {
        await dispatch(deleteAction(id)).unwrap();
      }
      setSelectedRowKeys([]);
      fetchActionsList();
    } catch (error) {
      console.error('Erreur lors de la suppression multiple:', error);
    }
  };

  // Gestion du changement de page
  const handleTableChange = (pagination, filters, sorter) => {
    setPagination({
      ...pagination,
      current: pagination.current
    });

    if (sorter && sorter.field) {
      setSortParams({
        sort_by: sorter.field,
        sort_direction: sorter.order === 'ascend' ? 'asc' : 'desc'
      });
    }
  };

  // Utilitaires pour l'affichage
  const getStatusColor = (status) => {
    const statusMap = {
      'planifiee': 'processing',
      'terminee': 'success',
      'annulee': 'error',
      'reportee': 'warning',
    };
    return statusMap[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      'planifiee': <ClockCircleOutlined />,
      'terminee': <CheckCircleOutlined />,
      'annulee': <CloseCircleOutlined />,
      'reportee': <ExclamationCircleOutlined />,
    };
    return iconMap[status] || <InfoCircleOutlined />;
  };

  const getTypeIcon = (type) => {
    const typeIconMap = {
      'media': <PlayCircleOutlined />,
      'cte': <SettingOutlined />,
      'salon': <TeamOutlined />,
      'delegation': <UserOutlined />,
      'seminaire_jipays': <FileTextOutlined />,
      'demarchage_direct': <PhoneOutlined />,
      'salon_sectoriel': <GlobalOutlined />,
      'seminaire_jisecteur': <CalendarOutlined />,
      'visite_entreprise': <EnvironmentOutlined />,
    };
    return typeIconMap[type] || <FileTextOutlined />;
  };

  const getTypeColor = (type) => {
    const colorMap = {
      'media': '#1890ff',
      'cte': '#52c41a',
      'salon': '#722ed1',
      'delegation': '#fa8c16',
      'seminaire_jipays': '#13c2c2',
      'demarchage_direct': '#eb2f96',
      'salon_sectoriel': '#faad14',
      'seminaire_jisecteur': '#f5222d',
      'visite_entreprise': '#a0d911',
    };
    return colorMap[type] || '#666';
  };

  const formatType = (type) => {
    const typeLabels = {
      'media': 'Media',
      'cte': 'CTE',
      'salon': 'Salon',
      'delegation': 'Délégation',
      'seminaire_jipays': 'Séminaire',
      'demarchage_direct': 'Démarchage Direct',
      'salon_sectoriel': 'Salon Sectoriel',
      'seminaire_jisecteur': 'Séminaire Secteur',
      'visite_entreprise': 'Visite Entreprise',
    };
    return typeLabels[type] || type;
  };

  const formatStatus = (status) => {
    const statusLabels = {
      'planifiee': 'Planifiée',
      'terminee': 'Terminée',
      'annulee': 'Annulée',
      'reportee': 'Reportée',
    };
    return statusLabels[status] || status;
  };

  // Définition des colonnes du tableau
  const baseColumns = [
    {
      title: 'Action',
      dataIndex: 'nom',
      key: 'nom',
      sorter: true,
      render: (text, record) => (
        <div className="action-name-cell">
          <div className="action-main-info">
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Link to={`/actions/${record.id}`} className="action-name-link">
                <strong>{text}</strong>
              </Link>
            </motion.div>
            {record.description && (
              <Text type="secondary" className="action-description-preview">
                {record.description.length > 60
                  ? `${record.description.substring(0, 60)}...`
                  : record.description
                }
              </Text>
            )}
          </div>
          {record.description && (
            <Tooltip title={record.description} placement="topLeft">
              <InfoCircleOutlined className="action-info-icon" />
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      sorter: true,
      render: (type) => (
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
          <Tag
            icon={getTypeIcon(type)}
            color={getTypeColor(type)}
            className="modern-tag"
          >
            {formatType(type)}
          </Tag>
        </motion.div>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      sorter: true,
      render: (statut) => (
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
          <Badge
            status={getStatusColor(statut)}
            text={formatStatus(statut)}
            className="status-badge"
          />
        </motion.div>
      ),
    },
    {
      title: 'Date début',
      dataIndex: 'date_debut',
      key: 'date_debut',
      sorter: true,
      render: (date) => (
        <div className="date-cell">
          <div className="date-main">{date ? moment(date).format('DD/MM/YYYY') : '-'}</div>
          {date && (
            <Text type="secondary" className="date-relative">
              {moment(date).fromNow()}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Responsable',
      dataIndex: 'responsable',
      key: 'responsable',
      render: (responsable) => (
        responsable ? (
          <div className="responsable-cell">
            <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
            <span className="responsable-name">{responsable.name}</span>
          </div>
        ) : (
          <Text type="secondary">Non assigné</Text>
        )
      ),
    },
    {
      title: 'Lieu',
      dataIndex: 'lieu',
      key: 'lieu',
      render: (text, record) => {
        const location = [];
        if (text) location.push(text);
        if (record.ville) location.push(record.ville);
        if (record.pays) location.push(record.pays);

        return location.length ? (
          <div className="location-cell">
            <EnvironmentOutlined className="location-icon" />
            <span>{location.join(', ')}</span>
          </div>
        ) : (
          <Text type="secondary">-</Text>
        );
      },
    }
  ];
  const columns = React.useMemo(() => {
    if (!isAdmin) return baseColumns;
    return [
      ...baseColumns,
      {
        title: 'Actions',
        key: 'actions',
        width: 120,
        render: (_, record) => (
          <Space size="small" className="action-buttons">
            <Tooltip title="Voir les détails">
              <Link to={`/actions/${record.id}`}>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    className="modern-action-btn view-btn"
                    size="small"
                  />
                </motion.div>
              </Link>
            </Tooltip>
            <Tooltip title="Modifier">
              <Link to={`/actions/edit/${record.id}`}>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    className="modern-action-btn edit-btn"
                    size="small"
                  />
                </motion.div>
              </Link>
            </Tooltip>
            <Tooltip title="Supprimer">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteAction(record.id)}
                  className="modern-action-btn delete-btn"
                  size="small"
                />
              </motion.div>
            </Tooltip>
          </Space>
        ),
      }
    ];
  }, [isAdmin, baseColumns]);


  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  const actionMenu = (
    <Menu className="modern-dropdown-menu">
      {selectedRowKeys.length > 0 && (
        <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={handleBatchDelete}>
          Supprimer {selectedRowKeys.length} action(s)
        </Menu.Item>
      )}
    </Menu>
  );

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
 <div className="actions-container-modern">
      {/* En-tête principal */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="actions-header"
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
          <Col xs={24} lg={16}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              style={{ display: 'flex', alignItems: 'center', gap: '20px' }}
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <Avatar 
                  size={64} 
                  icon={<ThunderboltOutlined />}
                  style={{ 
                    background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                    fontSize: '28px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                  }} 
                />
              </motion.div>
              
               <div>
                <Title level={1} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
                  Actions Marketing
                </Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: '8px 0 0 0' }}>
                  Gérez toutes vos activités marketing et promotionnelles
                </Paragraph>
              </div>
            </motion.div>
          </Col>
          
          <Col xs={24} lg={8}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              style={{ 
                display: 'flex', 
                gap: '12px', 
                justifyContent: screens.lg ? 'flex-end' : 'flex-start',
                flexWrap: 'wrap',
                marginTop: screens.lg ? 0 : '16px'
              }}
            >
              {isAdmin && (
                <Link to="/actions/create">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)',
                      fontWeight: 500
                    }}
                  >
                    Nouvelle action
                  </Button>
                </Link>
              )}
            </motion.div>
          </Col>
        </Row>
      </motion.div>

      {/* Statistiques rapides */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={12} sm={6}>
          <AnimatedStatCard
            icon={<FileTextOutlined />}
            title="Total Actions"
            value={stats.total}
            color="#1890ff"
            delay={0}
          />
        </Col>
        <Col xs={12} sm={6}>
          <AnimatedStatCard
            icon={<ClockCircleOutlined />}
            title="Planifiées"
            value={stats.planifiees}
            color="#faad14"
            delay={1}
          />
        </Col>
        <Col xs={12} sm={6}>
          <AnimatedStatCard
            icon={<CheckCircleOutlined />}
            title="Terminées"
            value={stats.terminees}
            color="#52c41a"
            delay={2}
          />
        </Col>
        <Col xs={12} sm={6}>
          <AnimatedStatCard
            icon={<CalendarOutlined />}
            title="À venir"
            value={stats.avenir}
            color="#722ed1"
            delay={3}
          />
        </Col>
      </Row>

      {/* Barre d'outils */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatedContentCard
          title="Recherche et filtres"
          delay={0}
          extra={
            <Button
              type={showFilters ? "primary" : "default"}
              icon={<FilterOutlined />}
              onClick={() => setShowFilters(!showFilters)}
              style={{ borderRadius: '8px' }}
            >
              Filtres
            </Button>
          }
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} lg={18}>
              <Input.Search
                placeholder="Rechercher une action..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onSearch={handleSearch}
                style={{ width: '100%' }}
                allowClear
                size="large"
                className="modern-search"
              />
            </Col>
           
          </Row>

          {/* Filtres */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}
              >
                <Row gutter={[16, 16]} align="middle">
                  <Col xs={24} sm={12} lg={6}>
                    <Select
                      style={{ width: '100%' }}
                      placeholder="Filtrer par type"
                      value={filters.type || undefined}
                      onChange={(value) => handleFilterChange('type', value)}
                      allowClear
                      className="modern-select"
                    >
                      <Option value="media">
                        <Space>
                          <PlayCircleOutlined style={{ color: '#1890ff' }} />
                          Media
                        </Space>
                      </Option>
                      <Option value="cte">
                        <Space>
                          <SettingOutlined style={{ color: '#52c41a' }} />
                          CTE
                        </Space>
                      </Option>
                      <Option value="salon">
                        <Space>
                          <TeamOutlined style={{ color: '#722ed1' }} />
                          Salon
                        </Space>
                      </Option>
                      <Option value="delegation">
                        <Space>
                          <UserOutlined style={{ color: '#fa8c16' }} />
                          Délégation
                        </Space>
                      </Option>
                      <Option value="seminaire_jipays">
                        <Space>
                          <FileTextOutlined style={{ color: '#13c2c2' }} />
                          Séminaire
                        </Space>
                      </Option>
                      <Option value="demarchage_direct">
                        <Space>
                          <PhoneOutlined style={{ color: '#eb2f96' }} />
                          Démarchage Direct
                        </Space>
                      </Option>
                      <Option value="salon_sectoriel">
                        <Space>
                          <GlobalOutlined style={{ color: '#faad14' }} />
                          Salon Sectoriel
                        </Space>
                      </Option>
                      <Option value="seminaire_jisecteur">
                        <Space>
                          <FileTextOutlined style={{ color: '#f5222d' }} />
                          Séminaire Secteur
                        </Space>
                      </Option>
                      <Option value="visite_entreprise">
                        <Space>
                          <EnvironmentOutlined style={{ color: '#a0d911' }} />
                          Visite Entreprise
                        </Space>
                      </Option>
                    </Select>
                  </Col>

                  <Col xs={24} sm={12} lg={6}>
                    <Select
                      style={{ width: '100%' }}
                      placeholder="Filtrer par statut"
                      value={filters.statut || undefined}
                      onChange={(value) => handleFilterChange('statut', value)}
                      allowClear
                      className="modern-select"
                    >
                      <Option value="planifiee">
                        <Badge status="default" text="Planifiée" />
                      </Option>
                      <Option value="en_preparation">
                        <Badge status="processing" text="En préparation" />
                      </Option>
                      <Option value="confirmee">
                        <Badge status="warning" text="Confirmée" />
                      </Option>
                      <Option value="en_cours">
                        <Badge status="processing" text="En cours" />
                      </Option>
                      <Option value="terminee">
                        <Badge status="success" text="Terminée" />
                      </Option>
                      <Option value="annulee">
                        <Badge status="error" text="Annulée" />
                      </Option>
                    </Select>
                  </Col>

                  

                  <Col xs={24} sm={12} lg={6}>
                    <Button onClick={clearFilters} style={{ borderRadius: '8px' }} block>
                      Réinitialiser
                    </Button>
                  </Col>
                </Row>
              </motion.div>
            )}
          </AnimatePresence>
        </AnimatedContentCard>
      </motion.div>

      {/* Contenu principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ marginTop: '24px' }}
      >
        <AnimatedContentCard
          title="Liste des actions"
          delay={1}
          extra={
            selectedRowKeys.length > 0 && (
              <Space>
                <Text strong style={{ color: '#1890ff' }}>
                  {selectedRowKeys.length} sélectionnée(s)
                </Text>
                <Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleBatchDelete}
                  size="small"
                >
                  Supprimer
                </Button>
              </Space>
            )
          }
        >
          {loading || refreshing ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                style={{ marginBottom: '16px' }}
              >
                <SyncOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
              </motion.div>
              <Text type="secondary">Chargement des actions...</Text>
            </div>
          ) : actions.length > 0 ? (
            <>
              <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={actions.map(action => ({ ...action, key: action.id }))}
                rowClassName={(record, index) => `modern-table-row ${index % 2 === 0 ? 'even' : 'odd'}`}
                pagination={false}
                onChange={handleTableChange}
                bordered={false}
                className="modern-table"
                scroll={{ x: 1200 }}
              />

              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginTop: '24px',
                paddingTop: '24px',
                borderTop: '1px solid #f0f0f0'
              }}>
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  pageSizeOptions={['10', '20', '50', '100']}
                  onChange={(page, pageSize) => setPagination({ current: page, pageSize, total: pagination.total })}
                  // showSizeChanger
                  // showQuickJumper
                  // // showTotal={(total, range) => `${range[0]}-${range[1]} de ${total} actions`}
                  className="modern-pagination"
                />
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              style={{ textAlign: 'center', padding: '60px 0' }}
            >
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <Text type="secondary" style={{ fontSize: '16px' }}>
                      Aucune action trouvée
                      {searchText && ` pour la recherche "${searchText}"`}
                      {(filters.type || filters.statut || filters.periode) && " avec les filtres appliqués"}
                    </Text>
                  </div>
                }
              >
                <Link to="/actions/create">
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    size="large"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 500
                    }}
                  >
                    Créer votre première action
                  </Button>
                </Link>
              </Empty>
            </motion.div>
          )}
        </AnimatedContentCard>
      </motion.div>

      {/* CSS intégré */}
      <style jsx>{`
        .actions-container-modern {
          padding: 24px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
        }

        .actions-header {
          position: relative;
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
          margin-bottom: 12px;
        }

        .stat-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .content-card-modern {
          transition: all 0.3s ease;
          margin-bottom: 24px;
        }

        .content-card-modern:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
        }

        .modern-table {
          border-radius: 8px;
          overflow: hidden;
        }

        .modern-table .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
          border-bottom: 2px solid #e8e8e8;
          font-weight: 600;
          color: #333;
          padding: 16px;
        }

        .modern-table-row {
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .modern-table-row:hover {
          background: linear-gradient(135deg, #f0f2ff 0%, #e6f7ff 100%);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .modern-table-row.even {
          background: rgba(250, 250, 250, 0.5);
        }

        .modern-table .ant-table-tbody > tr > td {
          padding: 16px;
          border-bottom: 1px solid #f0f0f0;
          vertical-align: top;
        }

        .action-name-cell {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .action-main-info {
          flex: 1;
        }

        .action-name-link {
          color: #1890ff;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .action-name-link:hover {
          color: #40a9ff;
          text-decoration: underline;
        }

        .action-description-preview {
          display: block;
          margin-top: 4px;
          font-size: 12px;
          line-height: 1.4;
        }

        .action-info-icon {
          color: #8c8c8c;
          cursor: help;
          transition: color 0.3s ease;
        }

        .action-info-icon:hover {
          color: #1890ff;
        }

        .modern-tag {
          border-radius: 6px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border: none;
        }

        .status-badge {
          font-weight: 500;
        }

        .date-cell {
          text-align: center;
        }

        .date-main {
          font-weight: 600;
          color: #333;
        }

        .date-relative {
          display: block;
          font-size: 11px;
          margin-top: 2px;
        }

        .responsable-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .responsable-name {
          font-weight: 500;
        }

        .location-cell {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .location-icon {
          color: #fa8c16;
        }

        .action-buttons {
          display: flex;
          justify-content: center;
        }

        .modern-action-btn {
          border-radius: 6px;
          transition: all 0.3s ease;
          border: 1px solid transparent;
        }

        .view-btn:hover {
          background: #e6f7ff;
          border-color: #1890ff;
          color: #1890ff;
        }

        .edit-btn:hover {
          background: #f6ffed;
          border-color: #52c41a;
          color: #52c41a;
        }

        .delete-btn:hover {
          background: #fff2f0;
          border-color: #ff4d4f;
          color: #ff4d4f;
        }

        .modern-pagination .ant-pagination-item {
          border-radius: 6px;
          border: 1px solid #d9d9d9;
          transition: all 0.3s ease;
        }

        .modern-pagination .ant-pagination-item:hover {
          border-color: #1890ff;
          transform: translateY(-1px);
        }

        .modern-pagination .ant-pagination-item-active {
          border-color: #1890ff;
        }

        .modern-search .ant-input {
          border-radius: 8px;
          border: 1px solid #d9d9d9;
          transition: all 0.3s ease;
        }

        .modern-search .ant-input:focus {
          border-color: #1890ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }

        .modern-select .ant-select-selector {
          border-radius: 8px;
          border: 1px solid #d9d9d9;
          transition: all 0.3s ease;
        }

        .modern-select.ant-select-focused .ant-select-selector {
          border-color: #1890ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }

        .modern-dropdown-menu .ant-dropdown-menu-item {
          border-radius: 6px;
          margin: 2px 8px;
          transition: all 0.2s ease;
        }

        .modern-dropdown-menu .ant-dropdown-menu-item:hover {
          background: linear-gradient(135deg, #f0f2ff 0%, #e6f7ff 100%);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .actions-container-modern {
            padding: 16px;
          }

          .actions-header {
            padding: 24px !important;
            border-radius: 16px !important;
            text-align: center;
          }

          .stat-card-modern {
            margin-bottom: 16px;
          }

          .content-card-modern {
            margin-bottom: 16px;
          }

          .modern-table {
            font-size: 12px;
          }
        }

        @media (max-width: 576px) {
          .actions-header {
            padding: 20px !important;
            border-radius: 12px !important;
          }

          .action-name-cell {
            flex-direction: column;
            gap: 4px;
          }

          .action-buttons {
            flex-direction: column;
            gap: 4px;
          }
        }

        /* Animations */
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

        .ant-breadcrumb {
          font-weight: 500;
        }

        .ant-breadcrumb a {
          color: #666;
          transition: color 0.3s ease;
        }

        .ant-breadcrumb a:hover {
          color: #667eea;
        }

        .ant-empty {
          padding: 40px 20px;
        }

        .ant-empty-description {
          color: #999;
          font-size: 14px;
        }

        .ant-table-placeholder {
          background: transparent;
        }

        /* Animation pour les badges et tags */
        .ant-badge,
        .ant-tag {
          transition: all 0.3s ease;
        }

        .ant-badge:hover,
        .ant-tag:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default ActionList;