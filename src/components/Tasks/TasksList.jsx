import React, { useEffect, useState } from 'react';
import { 
  Table, Tag, Space, Button, Card, message, Select, Tabs, Alert, Spin, 
  Row, Col, Input, Avatar, Typography, Badge, Tooltip, Statistic, 
  Breadcrumb, Dropdown, Menu, Empty, DatePicker
} from 'antd';
import { 
  EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined, 
  CalendarOutlined, UserOutlined, FilterOutlined, ReloadOutlined, 
  ProjectOutlined, TeamOutlined, BranchesOutlined, LinkOutlined,
  SortAscendingOutlined, BellOutlined, CheckOutlined, ClockCircleOutlined,
  ExclamationCircleOutlined, HomeOutlined, MoreOutlined, DownloadOutlined,
  PhoneOutlined, MailOutlined, FileTextOutlined, CheckSquareOutlined,
  SyncOutlined, ArrowRightOutlined, ThunderboltOutlined, FireOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, deleteTask, resetTaskOperation } from '../../features/taskSlice';
import { getCurrentUser } from '../../features/userSlice';
import { motion, AnimatePresence } from 'framer-motion';

const { Option } = Select;
const { TabPane } = Tabs;
const { Search } = Input;
const { Text, Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;

// Composant de statistique animée
const AnimatedStatCard = ({ icon, title, value, color, loading, delay = 0 }) => {
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
            
            <Title level={4} style={{ 
              margin: '4px 0 0 0', 
              color: color,
              fontWeight: 700,
              fontSize: '20px'
            }}>
              {loading ? (
                <SyncOutlined spin />
              ) : (
                <motion.span
                  key={displayValue}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {displayValue}
                </motion.span>
              )}
            </Title>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const TasksList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items = [], pagination, loading, error } = useSelector(state => state.tasks.tasks);
  const { loading: operationLoading, success: operationSuccess } = useSelector(state => state.tasks.taskOperation);
  const currentUser = useSelector(state => state.user.user);
  const authLoading = useSelector(state => state.user.loading);

  const [filters, setFilters] = useState({
    search: '',
    status: undefined,
    priority: undefined,
    type: undefined,
    entity_type: undefined,
    pipeline_stage_id: undefined,
    sort_field: 'start',
    sort_direction: 'asc',
    per_page: 10,
    page: 1,
    date_range: null
  });

  const [activeTab, setActiveTab] = useState('created');
  const [operationTargetId, setOperationTargetId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.is_admin === true || currentUser.id === 1);
  const isResponsableFipa = currentUser && currentUser.role === 'responsable fipa';

  // Calcul des statistiques
  const getStats = () => {
    const total = items.length;
    const notStarted = items.filter(t => t.status === 'not_started').length;
    const inProgress = items.filter(t => t.status === 'in_progress').length;
    const completed = items.filter(t => t.status === 'completed').length;
    const overdue = items.filter(t => 
      t.status !== 'completed' && moment(t.start).isBefore(moment(), 'day')
    ).length;
    
    return { total, notStarted, inProgress, completed, overdue };
  };

  const stats = getStats();

  // Variants d'animation
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 }
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

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  // Fonction principale pour charger les tâches avec filtres
  const loadTasksWithFilters = (filtersToUse = filters) => {
    if (!currentUser) return;

    const apiFilters = { ...filtersToUse };

    // Gestion des onglets
    if (isAdmin) {
      if (activeTab === 'created_by_admin') {
        apiFilters.user_id = currentUser.id;
      } else if (activeTab === 'created_by_others') {
        apiFilters.user_id = undefined;
        apiFilters.assignee_id = undefined;
        apiFilters.user_or_assignee_id = undefined;
        apiFilters.exclude_user_id = currentUser.id;
      }
    } else {
      if (activeTab === 'created') {
        apiFilters.user_id = currentUser.id;
      } else if (activeTab === 'assigned') {
        apiFilters.assignee_id = currentUser.id;
        apiFilters.exclude_user_id = currentUser.id;
      }
    }

    // Traitement des filtres de date
    if (apiFilters.date_range && Array.isArray(apiFilters.date_range) && apiFilters.date_range.length === 2) {
      apiFilters.start_date = apiFilters.date_range[0].format('YYYY-MM-DD');
      apiFilters.end_date = apiFilters.date_range[1].format('YYYY-MM-DD');
      delete apiFilters.date_range;
    }

    // Supprimer les filtres vides
    Object.keys(apiFilters).forEach(key => {
      if (apiFilters[key] === undefined || apiFilters[key] === '' || apiFilters[key] === null) {
        delete apiFilters[key];
      }
    });

    console.log('Filtres API envoyés:', apiFilters);

    dispatch(fetchTasks(apiFilters)).unwrap().catch(() => {
      message.error('Impossible de charger les tâches');
    });
  };

  // Fonction loadTasks mise à jour
  const loadTasks = () => {
    loadTasksWithFilters();
  };

  // useEffect pour l'authentification
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!currentUser && token) {
      dispatch(getCurrentUser())
        .unwrap()
        .catch(() => message.error("Session expirée, veuillez vous reconnecter."));
    }
  }, [dispatch, currentUser]);

  // useEffect principal pour le chargement initial
  useEffect(() => {
    if (currentUser) {
      loadTasksWithFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, currentUser, isAdmin, activeTab]);

  // useEffect pour la pagination
  useEffect(() => {
    if (currentUser && (filters.page !== 1 || filters.per_page !== 10)) {
      loadTasksWithFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.per_page]);

  // useEffect pour les opérations réussies
  useEffect(() => {
    if (operationSuccess) {
      dispatch(resetTaskOperation());
      loadTasksWithFilters();
    }
  }, [operationSuccess, dispatch]);

  // useEffect pour la recherche en temps réel (optionnel)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentUser && filters.search !== '') {
        loadTasksWithFilters();
      }
    }, 500); // Délai de 500ms après la dernière frappe

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  const handleEditTask = (task) => navigate(`/tasks/edit/${task.id}`);
  const handleViewTask = (task) => navigate(`/tasks/${task.id}`);
  const handleAddTask = () => navigate('/tasks/create');

  const handleDeleteTask = (id) => {
    setOperationTargetId(id);
    dispatch(deleteTask(id))
      .unwrap()
      .then(() => message.success('Tâche supprimée'))
      .catch(() => message.error('Erreur lors de la suppression'))
      .finally(() => setOperationTargetId(null));
  };

  // Gestion des filtres mise à jour
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    
    // Déclencher le rechargement immédiatement
    setTimeout(() => {
      loadTasksWithFilters(newFilters);
    }, 0);
  };

  // Gestion du changement de table mise à jour
  const handleTableChange = (pagination, tableFilters, sorter) => {
    const newFilters = {
      ...filters,
      page: pagination.current,
      per_page: pagination.pageSize,
      sort_field: sorter.field || 'start',
      sort_direction: sorter.order === 'ascend' ? 'asc' : 'desc'
    };
    
    setFilters(newFilters);
    loadTasksWithFilters(newFilters);
  };
  
  // Gestion du changement d'onglet mise à jour
  const handleTabChange = (key) => {
    setActiveTab(key);
    const newFilters = { ...filters, page: 1 };
    setFilters(newFilters);
    
    setTimeout(() => {
      loadTasksWithFilters(newFilters);
    }, 100);
  };
  
  // Gestion de la recherche mise à jour
  const handleSearch = () => {
    const newFilters = { ...filters, page: 1 };
    setFilters(newFilters);
    loadTasksWithFilters(newFilters);
  };

  // Réinitialisation des filtres mise à jour
  const handleResetFilters = () => {
    const resetFilters = {
      search: '',
      status: undefined,
      priority: undefined,
      type: undefined,
      entity_type: undefined,
      pipeline_stage_id: undefined,
      sort_field: 'start',
      sort_direction: 'asc',
      per_page: 10,
      page: 1,
      date_range: null
    };
    
    setFilters(resetFilters);
    
    setTimeout(() => {
      loadTasksWithFilters(resetFilters);
    }, 0);
  };

  const handleBatchDelete = async () => {
    try {
      for (const id of selectedRowKeys) {
        await dispatch(deleteTask(id)).unwrap();
      }
      setSelectedRowKeys([]);
      message.success(`${selectedRowKeys.length} tâche(s) supprimée(s)`);
      loadTasksWithFilters();
    } catch (error) {
      message.error('Erreur lors de la suppression multiple');
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      not_started: { color: '#faad14', icon: <ClockCircleOutlined />, text: 'Non commencé' },
      in_progress: { color: '#1890ff', icon: <SyncOutlined />, text: 'En cours' },
      completed: { color: '#52c41a', icon: <CheckOutlined />, text: 'Terminé' },
      deferred: { color: '#722ed1', icon: <ExclamationCircleOutlined />, text: 'Reporté' },
      waiting: { color: '#13c2c2', icon: <ClockCircleOutlined />, text: 'En attente' }
    };
    
    const config = statusConfig[status] || { color: '#d9d9d9', icon: null, text: 'Inconnu' };
    return (
      <Tag 
        color={config.color} 
        icon={config.icon}
        style={{ 
          padding: '4px 12px', 
          fontSize: '12px', 
          fontWeight: 500,
          borderRadius: '16px',
          border: 'none'
        }}
      >
        {config.text}
      </Tag>
    );
  };

  const getPriorityTag = (priority) => {
    const priorityConfig = {
      low: { color: '#52c41a', icon: null, text: 'Basse' },
      normal: { color: '#1890ff', icon: null, text: 'Normale' },
      high: { color: '#fa8c16', icon: <FireOutlined />, text: 'Haute' },
      urgent: { color: '#ff4d4f', icon: <ThunderboltOutlined />, text: 'Urgente' }
    };
    
    const config = priorityConfig[priority] || { color: '#d9d9d9', icon: null, text: 'Standard' };
    return (
      <Tag 
        color={config.color} 
        icon={config.icon}
        style={{ 
          padding: '4px 12px', 
          fontSize: '12px', 
          fontWeight: 500,
          borderRadius: '16px',
          border: 'none'
        }}
      >
        {config.text}
      </Tag>
    );
  };
  
  const getEntityIcon = (entityType) => {
    const iconMap = {
      invite: <UserOutlined style={{ color: '#1890ff' }} />,
      prospect: <TeamOutlined style={{ color: '#52c41a' }} />,
      investor: <BellOutlined style={{ color: '#722ed1' }} />,
      projet: <ProjectOutlined style={{ color: '#fa8c16' }} />
    };
    return iconMap[entityType] || <LinkOutlined style={{ color: '#d9d9d9' }} />;
  };

  const getEntityLabel = (entityType) => {
    const labelMap = {
      invite: 'Invité',
      prospect: 'Prospect',
      investor: 'Investisseur',
      projet: 'Projet'
    };
    return labelMap[entityType] || entityType || 'N/A';
  };

  const getTypeIcon = (type) => {
    const iconMap = {
      call: <PhoneOutlined style={{ color: '#1890ff' }} />,
      meeting: <TeamOutlined style={{ color: '#52c41a' }} />,
      email_journal: <MailOutlined style={{ color: '#722ed1' }} />,
      note: <FileTextOutlined style={{ color: '#fa8c16' }} />,
      todo: <CheckSquareOutlined style={{ color: '#13c2c2' }} />
    };
    return iconMap[type] || <FileTextOutlined />;
  };

  const getTypeLabel = (type) => {
    const labelMap = {
      call: 'Appel',
      meeting: 'Réunion',
      email_journal: 'Email',
      note: 'Note',
      todo: 'À faire'
    };
    return labelMap[type] || type;
  };

  const columns = [
    {
      title: 'Tâche',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
      render: (text, record) => (
        <div className="task-title-cell">
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Link to={`/tasks/${record.id}`} className="task-title-link">
              <strong>{text}</strong>
            </Link>
          </motion.div>
          {record.description && (
            <Tooltip title={record.description}>
              <Text type="secondary" className="task-description">
                {record.description?.length > 50 ? `${record.description.slice(0, 50)}...` : record.description}
              </Text>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 140,
      render: (type) => (
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
          <Tag icon={getTypeIcon(type)} className="modern-tag">
            {getTypeLabel(type)}
          </Tag>
        </motion.div>
      )
    },
    {
      title: 'Priorité',
      dataIndex: 'priority',
      key: 'priority',
      width: 120,
      sorter: true,
      render: (priority) => (
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
          {getPriorityTag(priority)}
        </motion.div>
      )
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      sorter: true,
      render: (status) => (
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
          {getStatusTag(status)}
        </motion.div>
      )
    },
    {
      title: 'Échéance',
      dataIndex: 'start',
      key: 'start',
      width: 170,
      sorter: true,
      render: (start, record) => {
        const isOverdue = record.status !== 'completed' && moment(start).isBefore(moment(), 'day');
        
        return (
          <div className="date-cell">
            {start ? (
              <>
                <div className={`date-main ${isOverdue ? 'overdue' : ''}`}>
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  {moment(start).format('DD/MM/YYYY')}
                </div>
                <div className="date-time">
                  {record.all_day ? 'Toute la journée' : moment(start).format('HH:mm')}
                </div>
                {isOverdue && <Tag color="error" size="small">En retard</Tag>}
              </>
            ) : (
              <Text type="secondary">Non planifié</Text>
            )}
          </div>
        );
      }
    }
  ];

  // Ajouter conditionnellement les colonnes selon le rôle et l'onglet
  if (isAdmin) {
    if (activeTab === 'created_by_others') {
      columns.splice(5, 0, {
        title: 'Créé par',
        dataIndex: 'user',
        key: 'user',
        width: 150,
        render: (_, record) => (
          <div className="user-cell">
            <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
            <span className="user-name">{record.user?.name || 'Inconnu'}</span>
          </div>
        )
      });
    } else {
      columns.splice(5, 0, {
        title: 'Assigné à',
        dataIndex: 'assignee',
        key: 'assignee',
        width: 150,
        render: (assignee) => {
          if (!assignee) return <Text type="secondary">Non assigné</Text>;
          
          return (
            <div className="user-cell">
              <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#52c41a' }} />
              <span className="user-name">{assignee.name}</span>
            </div>
          );
        }
      });
    }
  } else {
    if (activeTab === 'assigned') {
      columns.splice(5, 0, {
        title: 'Créé par',
        dataIndex: 'user',
        key: 'user',
        width: 150,
        render: (_, record) => (
          <div className="user-cell">
            <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
            <span className="user-name">{record.user?.name || 'Inconnu'}</span>
          </div>
        )
      });
    }
  }

  // Actions
  if (!(isResponsableFipa && activeTab === 'assigned')) {
    columns.push({
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small" className="action-buttons">
          <Tooltip title="Voir les détails">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button 
                type="text" 
                icon={<EyeOutlined />} 
                onClick={() => handleViewTask(record)}
                className="modern-action-btn view-btn"
                size="small"
              />
            </motion.div>
          </Tooltip>
          
          {!(isAdmin && activeTab === 'created_by_others') && (
            <Tooltip title="Modifier">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  type="text" 
                  icon={<EditOutlined />} 
                  onClick={() => handleEditTask(record)}
                  className="modern-action-btn edit-btn"
                  size="small"
                />
              </motion.div>
            </Tooltip>
          )}
          
          <Tooltip title="Supprimer">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button 
                type="text" 
                icon={<DeleteOutlined />} 
                onClick={() => handleDeleteTask(record.id)}
                loading={operationLoading && record.id === operationTargetId}
                className="modern-action-btn delete-btn"
                size="small"
              />
            </motion.div>
          </Tooltip>
        </Space>
      )
    });
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  const actionMenu = (
    <Menu className="modern-dropdown-menu">
      <Menu.Item key="export" icon={<DownloadOutlined />}>
        Exporter les tâches
      </Menu.Item>
      <Menu.Item key="refresh" icon={<ReloadOutlined />} onClick={loadTasks}>
        Rafraîchir la liste
      </Menu.Item>
      {selectedRowKeys.length > 0 && (
        <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={handleBatchDelete}>
          Supprimer {selectedRowKeys.length} tâche(s)
        </Menu.Item>
      )}
    </Menu>
  );

  if (error) {
    return (
      <motion.div 
        className="modern-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Alert
          message="Erreur"
          description={`Impossible de charger les tâches: ${error}`}
          type="error"
          showIcon
          style={{ borderRadius: '12px' }}
        />
      </motion.div>
    );
  }

  if (!currentUser && authLoading) {
    return (
      <motion.div 
        className="modern-container loading-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{ marginBottom: '16px' }}
        >
          <SyncOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
        </motion.div>
        <Text type="secondary" style={{ fontSize: '16px' }}>
          Chargement des tâches...
        </Text>
      </motion.div>
    );
  }

  if (!currentUser && !authLoading) {
    return (
      <motion.div 
        className="modern-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Alert 
          message="Non connecté" 
          description="Veuillez vous reconnecter." 
          type="warning" 
          showIcon 
          style={{ borderRadius: '12px' }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="modern-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* En-tête moderne avec gradient */}
      <motion.div
        variants={headerVariants}
        className="modern-header"
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
          <div className="header-info">
            <motion.div 
              className="header-avatar"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.3 }}
            >
              <Avatar 
                icon={<ProjectOutlined />} 
                size={56} 
                style={{ 
                  backgroundColor: '#1890ff',
                  boxShadow: '0 4px 16px rgba(24, 144, 255, 0.3)'
                }} 
              />
            </motion.div>
            <div className="header-title">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Title level={1} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
                  {isAdmin ? 'Gestion des Tâches' : 'Mes Tâches'}
                </Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: '8px 0 0 0' }}>
                  Organisez et suivez toutes vos tâches
                </Paragraph>
              </motion.div>
            </div>
          </div>

          <motion.div 
            className="header-actions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Space wrap>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="large"
                  icon={<CalendarOutlined />}
                  onClick={() => navigate('/tasks/calendar')}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    borderRadius: '12px',
                    fontWeight: 600
                  }}
                >
                  Calendrier
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={handleAddTask}
                  style={{
                    background: 'white',
                    border: 'none',
                    color: '#667eea',
                    borderRadius: '12px',
                    fontWeight: 600,
                    boxShadow: '0 4px 16px rgba(255,255,255,0.3)'
                  }}
                >
                  Nouvelle tâche
                </Button>
              </motion.div>
            </Space>
          </motion.div>
        </div>
      </motion.div>

      {/* Statistiques */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<ProjectOutlined />}
            title="Total Tâches"
            value={stats.total}
            color="#1890ff"
            loading={loading}
            delay={0}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<CheckOutlined />}
            title="Terminées"
            value={stats.completed}
            color="#52c41a"
            loading={loading}
            delay={1}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<SyncOutlined />}
            title="En Cours"
            value={stats.inProgress}
            color="#1890ff"
            loading={loading}
            delay={2}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<ClockCircleOutlined />}
            title="Non Commencées"
            value={stats.notStarted}
            color="#faad14"
            loading={loading}
            delay={3}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<ExclamationCircleOutlined />}
            title="En Retard"
            value={stats.overdue}
            color="#ff4d4f"
            loading={loading}
            delay={4}
          />
        </Col>
      </Row>

      {/* Barre de recherche et filtres */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card 
          className="filters-card-modern"
          style={{
            borderRadius: '16px',
            border: '1px solid #f0f0f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            marginBottom: '24px'
          }}
          bodyStyle={{ padding: '20px' }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} lg={12}>
              <Search
                placeholder="Rechercher des tâches..."
                value={filters.search}
                onChange={e => setFilters({ ...filters, search: e.target.value })}
                onSearch={handleSearch}
                onPressEnter={handleSearch}
                style={{ width: '100%' }}
                allowClear
                size="large"
                className="modern-search"
              />
            </Col>
            <Col xs={24} lg={12}>
              <div className="toolbar-actions">
                <Space wrap>
                  <Button
                    type={showFilters ? "primary" : "default"}
                    icon={<FilterOutlined />}
                    onClick={() => setShowFilters(!showFilters)}
                    size="large"
                    className="modern-btn"
                  >
                    Filtres
                  </Button>
                  
                  <Dropdown overlay={actionMenu} trigger={['click']}>
                    <Button icon={<MoreOutlined />} size="large" className="modern-btn" />
                  </Dropdown>
                </Space>
              </div>
            </Col>
          </Row>
        </Card>
      </motion.div>

      {/* Onglets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card 
          className="modern-card"
          style={{
            borderRadius: '16px',
            border: '1px solid #f0f0f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            marginBottom: '16px'
          }}
          bodyStyle={{ padding: '0' }}
        >
          <Tabs 
            activeKey={activeTab} 
            onChange={handleTabChange} 
            className="modern-tabs"
            size="large"
          >
            {isAdmin ? (
              <>
                <TabPane 
                  tab={
                    <span>
                      <UserOutlined />
                      Mes tâches créées
                    </span>
                  } 
                  key="created_by_admin" 
                />
                <TabPane 
                  tab={
                    <span>
                      <TeamOutlined />
                      Tâches des autres
                    </span>
                  } 
                  key="created_by_others" 
                />
              </>
            ) : (
              <>
                <TabPane 
                  tab={
                    <span>
                      <UserOutlined />
                      Mes créations
                    </span>
                  } 
                  key="created" 
                />
                <TabPane 
                  tab={
                    <span>
                      <TeamOutlined />
                      Assignées à moi
                    </span>
                  } 
                  key="assigned" 
                />
              </>
            )}
          </Tabs>
        </Card>
      </motion.div>

      {/* Filtres avancés */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card 
              className="modern-card"
              style={{
                borderRadius: '16px',
                border: '1px solid #f0f0f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                marginBottom: '16px',
                background: 'linear-gradient(135deg, #f0f2ff 0%, #e6f7ff 100%)'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} lg={6}>
                  <div style={{ marginBottom: '8px' }}>
                    <Text strong style={{ color: '#666', fontSize: '12px' }}>STATUT</Text>
                  </div>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Filtrer par statut"
                    value={filters.status}
                    onChange={value => handleFilterChange('status', value)}
                    allowClear
                    size="large"
                    className="modern-select"
                  >
                    <Option value="not_started">Non commencé</Option>
                    <Option value="in_progress">En cours</Option>
                    <Option value="completed">Terminé</Option>
                    <Option value="waiting">En attente</Option>
                    <Option value="deferred">Reporté</Option>
                  </Select>
                </Col>
                
                <Col xs={24} sm={12} lg={6}>
                  <div style={{ marginBottom: '8px' }}>
                    <Text strong style={{ color: '#666', fontSize: '12px' }}>PRIORITÉ</Text>
                  </div>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Filtrer par priorité"
                    value={filters.priority}
                    onChange={value => handleFilterChange('priority', value)}
                    allowClear
                    size="large"
                    className="modern-select"
                  >
                    <Option value="low">Basse</Option>
                    <Option value="normal">Normale</Option>
                    <Option value="high">Haute</Option>
                    <Option value="urgent">Urgente</Option>
                  </Select>
                </Col>
                
                <Col xs={24} sm={12} lg={6}>
                  <div style={{ marginBottom: '8px' }}>
                    <Text strong style={{ color: '#666', fontSize: '12px' }}>TYPE</Text>
                  </div>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Type de tâche"
                    value={filters.type}
                    onChange={value => handleFilterChange('type', value)}
                    allowClear
                    size="large"
                    className="modern-select"
                  >
                    <Option value="call">Appel</Option>
                    <Option value="meeting">Réunion</Option>
                    <Option value="email_journal">Email</Option>
                    <Option value="note">Note</Option>
                    <Option value="todo">À faire</Option>
                  </Select>
                </Col>

                <Col xs={24} lg={6}>
                  <div style={{ marginBottom: '8px' }}>
                    <Text strong style={{ color: '#666', fontSize: '12px' }}>ACTIONS</Text>
                  </div>
                  <Button 
                    onClick={handleResetFilters} 
                    size="large"
                    className="modern-btn"
                    block
                  >
                    Réinitialiser
                  </Button>
                </Col>
              </Row>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenu principal */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Card 
          className="modern-card"
          style={{
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
                  height: '400px',
                  flexDirection: 'column'
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  style={{ marginBottom: '16px' }}
                >
                  <SyncOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                </motion.div>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  Chargement des tâches...
                </Text>
              </motion.div>
            ) : items.length > 0 ? (
              <motion.div
                key="table"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Table
                  rowSelection={rowSelection}
                  columns={columns}
                  dataSource={items.map(task => ({ ...task, key: task.id }))}
                  rowClassName={(record, index) => {
                    let className = `modern-table-row ${index % 2 === 0 ? 'even' : 'odd'}`;
                    if (record.status === 'completed') className += ' task-completed';
                    if (record.status !== 'completed' && moment(record.start).isBefore(moment(), 'day')) {
                      className += ' task-overdue';
                    }
                    return className;
                  }}
                  pagination={{
                    current: pagination?.current_page || 1,
                    pageSize: pagination?.per_page || 10,
                    total: pagination?.total || 0,
                   
                    className: "modern-pagination"
                  }}
                  onChange={handleTableChange}
                  bordered={false}
                  className="modern-table"
                  scroll={{ x: 1200 }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div className="empty-description">
                      <Text type="secondary" style={{ fontSize: '16px' }}>
                        Aucune tâche trouvée
                        {filters.search && ` pour la recherche "${filters.search}"`}
                      </Text>
                    </div>
                  }
                >
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={handleAddTask}
                    size="large"
                    style={{
                      background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      boxShadow: '0 4px 16px rgba(24, 144, 255, 0.3)'
                    }}
                  >
                    Créer votre première tâche
                  </Button>
                </Empty>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Actions de lot */}
      <AnimatePresence>
        {selectedRowKeys.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="batch-actions-container"
          >
            <Card className="batch-actions-card">
              <Row justify="space-between" align="middle">
                <Col>
                  <Space>
                    <Avatar 
                      size="small" 
                      style={{ backgroundColor: '#1890ff' }}
                      icon={<TeamOutlined />}
                    />
                    <Text strong>
                      {selectedRowKeys.length} tâche{selectedRowKeys.length > 1 ? 's' : ''} sélectionnée{selectedRowKeys.length > 1 ? 's' : ''}
                    </Text>
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <Button 
                      onClick={() => setSelectedRowKeys([])} 
                      className="modern-btn"
                    >
                      Annuler
                    </Button>
                    <Button 
                      type="primary" 
                      danger 
                      icon={<DeleteOutlined />}
                      onClick={handleBatchDelete}
                      className="modern-btn-danger"
                    >
                      Supprimer la sélection
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSS intégré */}
      <style jsx>{`
        .modern-container {
          padding: 24px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
        }

        .modern-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 32px;
          margin-bottom: 32px;
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
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .header-info {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .header-avatar {
          flex-shrink: 0;
        }

        .header-title h1 {
          margin: 0 !important;
          font-size: 32px !important;
        }

        .header-actions {
          flex-shrink: 0;
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

        .filters-card-modern,
        .modern-card {
          transition: all 0.3s ease;
        }

        .filters-card-modern:hover,
        .modern-card:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
        }

        .modern-search .ant-input {
          border-radius: 8px !important;
          border: 1px solid #d9d9d9 !important;
          transition: all 0.3s ease !important;
        }

        .modern-search .ant-input:focus {
          border-color: #1890ff !important;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
        }

        .toolbar-actions {
          display: flex;
          justify-content: flex-end;
          width: 100%;
        }

        .modern-btn {
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .modern-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .modern-select .ant-select-selector {
          border-radius: 8px !important;
          border: 1px solid #d9d9d9 !important;
          transition: all 0.3s ease !important;
        }

        .modern-select.ant-select-focused .ant-select-selector {
          border-color: #1890ff !important;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
        }

        .modern-tabs .ant-tabs-tab {
          padding: 16px 24px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .modern-tabs .ant-tabs-tab:hover {
          color: #1890ff;
        }

        .modern-tabs .ant-tabs-tab-active {
          color: #1890ff !important;
        }

        .modern-tabs .ant-tabs-ink-bar {
          background: #1890ff !important;
          height: 3px !important;
        }

        .modern-table {
          border-radius: 8px;
          overflow: hidden;
        }

        .modern-table .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%) !important;
          border-bottom: 2px solid #e8e8e8 !important;
          font-weight: 600 !important;
          color: #333 !important;
          padding: 16px !important;
        }

        .modern-table-row {
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .modern-table-row:hover {
          background: linear-gradient(135deg, #f0f2ff 0%, #e6f7ff 100%) !important;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .modern-table-row.even {
          background: rgba(250, 250, 250, 0.5);
        }

        .modern-table .ant-table-tbody > tr > td {
          padding: 16px !important;
          border-bottom: 1px solid #f0f0f0 !important;
          vertical-align: top;
        }

        .task-title-cell {
          max-width: 300px;
        }

        .task-title-link {
          color: #1890ff;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .task-title-link:hover {
          color: #40a9ff;
          text-decoration: underline;
        }

        .task-description {
          display: block;
          margin-top: 4px;
          font-size: 12px;
          line-height: 1.4;
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

        .date-cell {
          text-align: center;
        }

        .date-main {
          font-weight: 600;
          color: #333;
          margin-bottom: 2px;
        }

        .date-main.overdue {
          color: #ff4d4f;
        }

        .date-time {
          font-size: 11px;
          color: #8c8c8c;
          margin-bottom: 4px;
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .user-name {
          font-weight: 500;
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

        .task-completed {
          opacity: 0.7;
        }

        .task-completed td {
          background: #f9f9f9 !important;
          color: #8c8c8c;
        }

        .task-overdue {
          border-left: 3px solid #ff4d4f;
        }

        .batch-actions-container {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
        }

        .batch-actions-card {
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          border: 1px solid #f0f0f0;
          background: white;
          min-width: 400px;
        }

        .empty-description {
          padding: 20px 0;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .modern-pagination .ant-pagination-item {
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .modern-pagination .ant-pagination-item:hover {
          border-color: #1890ff;
          color: #1890ff;
        }

        .modern-pagination .ant-pagination-item-active {
          border-color: #1890ff;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .modern-container {
            padding: 16px;
          }

          .modern-header {
            padding: 20px;
            border-radius: 12px;
          }

          .header-content {
            flex-direction: column;
            gap: 20px;
          }

          .header-info {
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }

          .header-title h1 {
            font-size: 24px !important;
          }

          .header-actions {
            width: 100%;
          }

          .header-actions .ant-space {
            width: 100%;
            justify-content: center;
          }

          .toolbar-actions {
            justify-content: center;
          }

          .modern-table {
            font-size: 12px;
          }

          .batch-actions-card {
            min-width: 300px;
          }
        }

        @media (max-width: 576px) {
          .action-buttons {
            flex-direction: column;
            gap: 4px;
          }

          .task-title-cell {
            max-width: 200px;
          }

          .header-actions .ant-btn {
            width: 100%;
            margin-bottom: 8px;
          }

          .header-actions .ant-space {
            flex-direction: column;
            width: 100%;
          }
        }

        /* Animations */
        .ant-card {
          transition: all 0.3s ease;
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
      `}</style>
    </motion.div>
  );
};

export default TasksList;