import React, { useEffect, useState, useMemo } from 'react';
import {
  Table, Button, Space, Tag, Badge, Input, Select, DatePicker, Tabs,
  Avatar, Typography, message, Tooltip, Dropdown, Menu, Row, Col,
  Card, Empty, Statistic, Modal, Grid
} from 'antd';
import {
  PlusOutlined, FilterOutlined, ReloadOutlined, EllipsisOutlined,
  ProjectOutlined, SearchOutlined, CalendarOutlined, UserOutlined,
  EyeOutlined, EditOutlined, DeleteOutlined, CheckOutlined, ClockCircleOutlined,
  SyncOutlined, ExclamationCircleOutlined, ThunderboltOutlined, FireOutlined,
  CheckCircleOutlined, RocketOutlined, TeamOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getMyTasks, deleteTask, fetchTasks } from '../../features/taskSlice';
import { getCurrentUser } from '../../features/userSlice';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';

const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;
const { useBreakpoint } = Grid;

// Composant de statistique animée (identique à TasksList)
const AnimatedStatCard = ({ icon, title, value, color, loading, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card
        loading={loading}
        className="stat-card-modern"
        style={{
          borderRadius: '16px',
          border: '1px solid #f0f0f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          height: '100%'
        }}
        bodyStyle={{ padding: '20px' }}
      >
        <div className="stat-card-content">
          <div className="stat-header">
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${color}15 0%, ${color}30 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24
            }}>
              {React.cloneElement(icon, { style: { color } })}
            </div>
          </div>
          <div className="stat-body">
            <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 600 }}>
              {title}
            </Text>
            <Title level={2} style={{ margin: '8px 0 0 0', color }}>
              {value}
            </Title>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const MyTasks = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const screens = useBreakpoint();

  // User & tâches
  const currentUser = useSelector(state => state.user.user);
  const authLoading = useSelector(state => state.user.loading);


  // myTasks slice (pour non-admin)
  const myTasksSlice = useSelector(state => state.tasks.myTasks);
  // tasks slice (pour admin)
  const allTasksSlice = useSelector(state => state.tasks.tasks);

  const isAdmin = useMemo(() => {
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

    const rawItems = isAdmin ? (allTasksSlice.items || []) : (myTasksSlice.items || []);

  const items = useMemo(() => {
    if (!currentUser) return [];
    // Même pour admin: filtrer user_id === currentUser.id OU assignee_id === currentUser.id
    return rawItems.filter(task => 
      task.user_id === currentUser.id || task.assignee_id === currentUser.id
    );
  }, [rawItems, currentUser]);

  const pagination = isAdmin ? allTasksSlice.pagination : myTasksSlice.pagination;
  const loading = isAdmin ? allTasksSlice.loading : myTasksSlice.loading;
  const error = isAdmin ? allTasksSlice.error : myTasksSlice.error;

  // Filtres
  const [filters, setFilters] = useState({
    search: '',
    status: undefined,
    priority: undefined,
    type: undefined,
    date_range: null,
    per_page: 10,
    page: 1,
    sort_field: 'start',
    sort_direction: 'asc'
  });

  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Charger currentUser si absent
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!currentUser && token && !authLoading) {
      dispatch(getCurrentUser()).catch(() => message.error('Session expirée'));
    }
  }, [currentUser, authLoading, dispatch]);

  // Auto augmenter per_page pour admin
  useEffect(() => {
    if (currentUser && isAdmin && filters.per_page === 10) {
      const nf = { ...filters, per_page: 50, page: 1 };
      setFilters(nf);
      loadTasks(nf);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, currentUser]);

  // Charger tâches sur changement de pagination/onglet
  useEffect(() => {
    if (currentUser) {
      loadTasks(filters);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.per_page, activeTab, currentUser]);

  // Recherche debounce
  useEffect(() => {
    const t = setTimeout(() => {
      if (currentUser) loadTasks(filters);
    }, 500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.status, filters.priority, filters.type, filters.date_range]);

  const loadTasks = (f = filters) => {
    if (!currentUser) return;
    const apiFilters = { ...f };

    // Onglets
    if (activeTab !== 'all') {
      apiFilters.status = activeTab;
    }

    if (apiFilters.date_range && apiFilters.date_range.length === 2) {
      apiFilters.start_date = apiFilters.date_range[0].format('YYYY-MM-DD');
      apiFilters.end_date = apiFilters.date_range[1].format('YYYY-MM-DD');
      delete apiFilters.date_range;
    }

    Object.keys(apiFilters).forEach(k => {
      if (apiFilters[k] === undefined || apiFilters[k] === '' || apiFilters[k] === null) delete apiFilters[k];
    });

    if (isAdmin) {
      dispatch(fetchTasks(apiFilters)).catch(() => message.error('Erreur chargement tâches'));
    } else {
      dispatch(getMyTasks(apiFilters)).catch(() => message.error('Erreur chargement tâches'));
    }
  };

  const handleResetFilters = () => {
    const reset = {
      search: '',
      status: undefined,
      priority: undefined,
      type: undefined,
      date_range: null,
      per_page: filters.per_page,
      page: 1,
      sort_field: 'start',
      sort_direction: 'asc'
    };
    setFilters(reset);
    setTimeout(() => loadTasks(reset), 0);
  };

  const handleTableChange = (pag, _filt, sorter) => {
    const nf = {
      ...filters,
      page: pag.current,
      per_page: pag.pageSize,
      sort_field: sorter.field || 'start',
      sort_direction: sorter.order === 'ascend' ? 'asc' : 'desc'
    };
    setFilters(nf);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    const nf = { ...filters, page: 1 };
    setFilters(nf);
  };

  const handleDeleteTask = (id) => {
    Modal.confirm({
      title: 'Supprimer cette tâche ?',
      content: 'Cette action est irréversible.',
      okText: 'Oui, supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          await dispatch(deleteTask(id)).unwrap();
          message.success('Tâche supprimée');
          loadTasks();
        } catch {
          message.error('Suppression échouée');
        }
      }
    });
  };

  // Tags / rendu
  const renderStatusTag = (status) => {
    const map = {
      completed: { color: 'green', icon: <CheckOutlined />, text: 'Terminé' },
      in_progress: { color: 'blue', icon: <SyncOutlined spin />, text: 'En cours' },
      waiting: { color: 'orange', icon: <ClockCircleOutlined />, text: 'En attente' },
      deferred: { color: 'purple', icon: <ExclamationCircleOutlined />, text: 'Reporté' },
      not_started: { color: 'default', icon: <ClockCircleOutlined />, text: 'Non commencé' }
    };
    const cfg = map[status] || map.not_started;
    return (
      <Tag
        color={cfg.color}
        style={{ borderRadius: 16, padding: '4px 12px', fontSize: 12, fontWeight: 500 }}
        icon={cfg.icon}
      >
        {cfg.text}
      </Tag>
    );
  };

  const renderPriorityBadge = (p) => {
    const map = {
      urgent: { status: 'error', text: 'Urgente', icon: <ThunderboltOutlined style={{ color: '#ff4d4f' }} /> },
      high: { status: 'warning', text: 'Haute', icon: <FireOutlined style={{ color: '#fa8c16' }} /> },
      normal: { status: 'processing', text: 'Normale', icon: null },
      low: { status: 'default', text: 'Basse', icon: null }
    };
    const cfg = map[p] || map.normal;
    return (
      <Space size={4}>
        {cfg.icon}
        <Badge status={cfg.status} text={cfg.text} />
      </Space>
    );
  };

  const renderTypeTag = (type) => {
    const map = {
      call: { color: '#1890ff', icon: '📞', text: 'Appel' },
      meeting: { color: '#722ed1', icon: '👥', text: 'Réunion' },
      note: { color: '#faad14', icon: '📝', text: 'Note' },
      todo: { color: '#52c41a', icon: '✓', text: 'À faire' },
      email_journal: { color: '#13c2c2', icon: '✉️', text: 'Email' }
    };
    const cfg = map[type] || { color: '#d9d9d9', icon: '📋', text: type };
    return (
      <Tag color={cfg.color} style={{ borderRadius: 12, fontSize: 11 }}>
        {cfg.icon} {cfg.text}
      </Tag>
    );
  };

  // Colonnes
   const columns = [
    {
      title: 'Tâche',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      sorter: true,
      render: (text, record) => (
        <div>
          <Tooltip title={record.description || text}>
            <Button
              type="link"
              style={{ padding: 0, fontWeight: 600, textAlign: 'left', whiteSpace: 'normal' }}
              onClick={() => navigate(`/tasks/${record.id}`)}
            >
              {text}
            </Button>
          </Tooltip>
          <div style={{ marginTop: 6 }}>
            <Space size={4} wrap>
              {record.type && renderTypeTag(record.type)}
              {record.priority && renderPriorityBadge(record.priority)}
            </Space>
          </div>
        </div>
      )
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      sorter: true,
      render: (s) => renderStatusTag(s)
    },
    {
      title: 'Dates',
      dataIndex: 'start',
      key: 'dates',
      width: 200,
      sorter: true,
      render: (_, r) => (
        <Space direction="vertical" size={2}>
          {r.start && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              <CalendarOutlined /> Début: {moment(r.start).format('DD/MM/YYYY')}
            </Text>
          )}
          {r.end && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              <CalendarOutlined /> Fin: {moment(r.end).format('DD/MM/YYYY')}
            </Text>
          )}
        </Space>
      )
    },
    // Colonne dynamique: afficher "Créé par" si je suis assigné, sinon "Assigné à"
    {
      title: 'Créé par / Assigné à',
      key: 'user_info',
      width: 200,
      render: (_, record) => {
        // Si je suis assigné et il y a un créateur
        if (record.assignee_id === currentUser?.id && record.user) {
          return (
            <Space>
              <Avatar size="small" style={{ backgroundColor: '#52c41a' }}>
                {record.user.name.charAt(0).toUpperCase()}
              </Avatar>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 500 }}>{record.user.name}</Text>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>Créateur</div>
              </div>
            </Space>
          );
        }
        // Sinon afficher l'assigné
        if (record.assignee) {
          return (
            <Space>
              <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
                {record.assignee.name.charAt(0).toUpperCase()}
              </Avatar>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 500 }}>{record.assignee.name}</Text>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>Assigné</div>
              </div>
            </Space>
          );
        }
        return <Text type="secondary">Non assigné</Text>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      fixed: 'right',
      render: (_, r) => (
        <Space size="small">
          <Tooltip title="Voir">
            <Button
              icon={<EyeOutlined />}
              size="small"
              style={{ borderRadius: 8 }}
              onClick={() => navigate(`/tasks/${r.id}`)}
            />
          </Tooltip>
          <Tooltip title="Modifier">
            <Button
              icon={<EditOutlined />}
              size="small"
              style={{ borderRadius: 8 }}
              onClick={() => navigate(`/tasks/${r.id}/edit`)}
            />
          </Tooltip>
          <Tooltip title="Supprimer">
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
              style={{ borderRadius: 8 }}
              onClick={() => handleDeleteTask(r.id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];


  // Statistiques
  const stats = useMemo(() => {
    const total = items.length;
    return {
      total,
      completed: items.filter(t => t.status === 'completed').length,
      inProgress: items.filter(t => t.status === 'in_progress').length,
      notStarted: items.filter(t => t.status === 'not_started').length,
      overdue: items.filter(t =>
        t.status !== 'completed' && t.start && moment(t.start).isBefore(moment(), 'day')
      ).length
    };
  }, [items]);

  // Row selection batch
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys)
  };

  const handleBatchDelete = () => {
    Modal.confirm({
      title: `Supprimer ${selectedRowKeys.length} tâche(s) ?`,
      content: 'Cette action est irréversible.',
      okText: 'Oui, supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          for (const id of selectedRowKeys) {
            await dispatch(deleteTask(id)).unwrap();
          }
          message.success(`${selectedRowKeys.length} tâche(s) supprimée(s)`);
          setSelectedRowKeys([]);
          loadTasks();
        } catch {
          message.error('Erreur suppression multiple');
        }
      }
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Card><Text type="danger">Erreur: {error}</Text></Card>
      </div>
    );
  }

  return (
    <motion.div
      className="dashboard-container-modern"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ padding: 24, minHeight: '100vh', background: 'linear-gradient(135deg,#f5f7fa 0%,#c3cfe2 100%)' }}
    >
      {/* Header avec gradient identique à TasksList */}
      <motion.div
        variants={headerVariants}
        className="dashboard-header"
        style={{
          background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
          borderRadius: 20,
          padding: 32,
          marginBottom: 32,
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
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
          }}
          animate={{ backgroundPosition: ['0px 0px', '60px 60px'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <Row justify="space-between" align="middle" style={{ position: 'relative', zIndex: 1 }}>
          <Col xs={24} lg={12}>
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Title level={1} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
                <ProjectOutlined style={{ marginRight: 16 }} />
                Mes Tâches (Admin)
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, margin: '8px 0 0 0' }}>
                Tâches que vous avez créées ou qui vous sont assignées
                <Badge
                  count={stats.total}
                  style={{
                    marginLeft: 16,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}
                />
              </Paragraph>
            </motion.div>
          </Col>
          <Col xs={24} lg={12} style={{ textAlign: screens.xs ? 'left' : 'right', marginTop: screens.xs ? 20 : 0 }}>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Space wrap>
                <Button
                  size="large"
                  icon={<CalendarOutlined />}
                  onClick={() => navigate('/tasks/calendar')}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    borderRadius: 12,
                    fontWeight: 600
                  }}
                >
                  Calendrier
                </Button>
              </Space>
            </motion.div>
          </Col>
        </Row>
      </motion.div>

      {/* Statistiques identiques à TasksList */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={12} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<ProjectOutlined />}
            title="Total Tâches"
            value={stats.total}
            color="#1890ff"
            loading={loading}
            delay={0}
          />
        </Col>
        <Col xs={12} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<CheckCircleOutlined />}
            title="Terminées"
            value={stats.completed}
            color="#52c41a"
            loading={loading}
            delay={0.1}
          />
        </Col>
        <Col xs={12} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<SyncOutlined />}
            title="En cours"
            value={stats.inProgress}
            color="#1890ff"
            loading={loading}
            delay={0.2}
          />
        </Col>
        <Col xs={12} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<ClockCircleOutlined />}
            title="Non commencées"
            value={stats.notStarted}
            color="#faad14"
            loading={loading}
            delay={0.3}
          />
        </Col>
        <Col xs={12} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<ExclamationCircleOutlined />}
            title="En retard"
            value={stats.overdue}
            color="#ff4d4f"
            loading={loading}
            delay={0.4}
          />
        </Col>
      </Row>

      {/* Barre de recherche et actions */}
      <Card
        style={{
          borderRadius: 16,
          border: '1px solid #f0f0f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          marginBottom: 24
        }}
        bodyStyle={{ padding: 20 }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={24} lg={12}>
            <Search
              placeholder="Rechercher une tâche..."
              value={filters.search}
              allowClear
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              onSearch={() => loadTasks(filters)}
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col xs={24} sm={24} lg={12} style={{ textAlign: screens.xs ? 'left' : 'right' }}>
            <Space wrap>
              <Button
                type={showFilters ? 'primary' : 'default'}
                icon={<FilterOutlined />}
                onClick={() => setShowFilters(!showFilters)}
                size="large"
                style={{ borderRadius: 8 }}
              >
                Filtres
              </Button>
              <Button
                icon={<ReloadOutlined />}
                size="large"
                onClick={handleResetFilters}
                style={{ borderRadius: 8 }}
              >
                Réinitialiser
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Onglets */}
      <Card
        style={{
          borderRadius: 16,
          border: '1px solid #f0f0f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          marginBottom: 24
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          size="large"
          className="modern-tabs"
          style={{ padding: '0 20px' }}
        >
          {isAdmin ? (
            <TabPane tab={<span><ProjectOutlined /> Toutes les tâches</span>} key="all" />
          ) : (
            <>
              <TabPane tab={<span><ProjectOutlined /> Toutes</span>} key="all" />
              <TabPane tab={<span><ClockCircleOutlined /> Non commencées</span>} key="not_started" />
              <TabPane tab={<span><SyncOutlined /> En cours</span>} key="in_progress" />
              <TabPane tab={<span><CheckCircleOutlined /> Terminées</span>} key="completed" />
              <TabPane tab={<span><ExclamationCircleOutlined /> En attente</span>} key="waiting" />
            </>
          )}
        </Tabs>
      </Card>

      {/* Filtres avancés */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Card
              style={{
                borderRadius: 16,
                border: '1px solid #f0f0f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                marginBottom: 24,
                background: 'linear-gradient(135deg,#f0f2ff 0%, #e6f7ff 100%)'
              }}
              bodyStyle={{ padding: 24 }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                  <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 12, textTransform: 'uppercase' }}>
                    Priorité
                  </Text>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Sélectionner"
                    value={filters.priority}
                    onChange={v => setFilters(prev => ({ ...prev, priority: v, page: 1 }))}
                    allowClear
                    size="large"
                  >
                    <Option value="urgent">Urgente</Option>
                    <Option value="high">Haute</Option>
                    <Option value="normal">Normale</Option>
                    <Option value="low">Basse</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 12, textTransform: 'uppercase' }}>
                    Type
                  </Text>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Sélectionner"
                    value={filters.type}
                    onChange={v => setFilters(prev => ({ ...prev, type: v, page: 1 }))}
                    allowClear
                    size="large"
                  >
                    <Option value="call">Appel</Option>
                    <Option value="meeting">Réunion</Option>
                    <Option value="note">Note</Option>
                    <Option value="todo">À faire</Option>
                    <Option value="email_journal">Email</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 12, textTransform: 'uppercase' }}>
                    Statut
                  </Text>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Sélectionner"
                    value={filters.status}
                    onChange={v => setFilters(prev => ({ ...prev, status: v, page: 1 }))}
                    allowClear
                    size="large"
                  >
                    <Option value="not_started">Non commencé</Option>
                    <Option value="in_progress">En cours</Option>
                    <Option value="completed">Terminé</Option>
                    <Option value="waiting">En attente</Option>
                    <Option value="deferred">Reporté</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 12, textTransform: 'uppercase' }}>
                    Période
                  </Text>
                  <RangePicker
                    style={{ width: '100%' }}
                    value={filters.date_range}
                    onChange={(val) => setFilters(prev => ({ ...prev, date_range: val, page: 1 }))}
                    size="large"
                    format="DD/MM/YYYY"
                  />
                </Col>
              </Row>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <Card
        style={{
          borderRadius: 16,
          border: '1px solid #f0f0f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}
        bodyStyle={{ padding: 24 }}
      >
        <AnimatePresence mode="wait">
          {loading && !items.length ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
            >
              <SyncOutlined spin style={{ fontSize: 48, marginBottom: 16, color: '#1890ff' }} />
              <Text type="secondary">Chargement des tâches...</Text>
            </motion.div>
          ) : items.length > 0 ? (
            <motion.div
              key="table"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={items.map(t => ({ ...t, key: t.id }))}
                rowKey="id"
                loading={loading}
                onChange={handleTableChange}
                pagination={{
                  current: pagination?.current_page || filters.page,
                  pageSize: pagination?.per_page || filters.per_page,
                  total: pagination?.total || 0,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50', '100'],
                  showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} tâches`,
                  style: { padding: '16px 0' }
                }}
                scroll={{ x: 1200 }}
                style={{ borderRadius: 12, overflow: 'hidden' }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Empty
                description={
                  <Text type="secondary">
                    {filters.search ? `Aucune tâche trouvée pour "${filters.search}"` : 'Aucune tâche trouvée'}
                  </Text>
                }
                style={{ padding: '60px 0' }}
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/tasks/create')}
                  style={{ borderRadius: 8, fontWeight: 600 }}
                >
                  Créer une tâche
                </Button>
              </Empty>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Actions par lot */}
      <AnimatePresence>
        {selectedRowKeys.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            style={{
              position: 'fixed',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000
            }}
          >
            <Card style={{ borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', minWidth: 320 }}>
              <Row justify="space-between" align="middle" gutter={16}>
                <Col>
                  <Space>
                    <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
                      {selectedRowKeys.length}
                    </Avatar>
                    <Text strong>{selectedRowKeys.length} sélectionnée(s)</Text>
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <Button onClick={() => setSelectedRowKeys([])} style={{ borderRadius: 8 }}>
                      Annuler
                    </Button>
                    <Button
                      type="primary"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handleBatchDelete}
                      style={{ borderRadius: 8 }}
                    >
                      Supprimer
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MyTasks;