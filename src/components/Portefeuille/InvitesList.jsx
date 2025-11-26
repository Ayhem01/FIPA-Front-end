import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Table, Space, Button, Input, Tag, Dropdown, Menu, Modal, Card, message,
  Row, Col, Select, Tooltip, Statistic, Badge, Divider, Typography,
  DatePicker, Avatar, Segmented, Tabs, Empty, Pagination, Spin, Progress,
  Breadcrumb, Alert, Grid
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, 
  ExclamationCircleOutlined, MoreOutlined, FilterOutlined, EyeOutlined,
  CheckCircleOutlined, CloseCircleOutlined, QuestionCircleOutlined,
  UserOutlined, MailOutlined, GlobalOutlined, TeamOutlined,
  CalendarOutlined, PhoneOutlined, BellOutlined, AppstoreOutlined,
  UnorderedListOutlined, FileExcelOutlined, FilePdfOutlined, SettingOutlined,
  ReloadOutlined, BarsOutlined, HomeOutlined, DashboardOutlined, DownOutlined,
  SyncOutlined, ArrowUpOutlined, ArrowDownOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchInvites, deleteInvite, updateInviteStatus, setFilters } from '../../features/inviteSlice';
import moment from 'moment';
import { fetchActions } from '../../features/marketingSlice';

const { confirm } = Modal;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;
const { useBreakpoint } = Grid;

// Composant carte statistique animée identique à ProspectsList
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
        bodyStyle={{ padding: '20px' }}
      >
        <div className="stat-card-content">
          <div className="stat-header">
            <motion.div 
              className="stat-icon"
              variants={iconVariants}
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
            
            {trend !== undefined && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay * 0.1 + 0.4 }}
                className="trend-indicator"
              >
                <Badge 
                  count={
                    <span style={{ 
                      color: trend > 0 ? '#52c41a' : trend < 0 ? '#ff4d4f' : '#666',
                      fontSize: '10px',
                      fontWeight: 600
                    }}>
                      {trend > 0 && <ArrowUpOutlined />}
                      {trend < 0 && <ArrowDownOutlined />}
                      {Math.abs(trend)}%
                    </span>
                  }
                  style={{
                    backgroundColor: trend > 0 ? '#52c41a15' : trend < 0 ? '#ff4d4f15' : '#f0f0f0',
                    border: `1px solid ${trend > 0 ? '#52c41a' : trend < 0 ? '#ff4d4f' : '#d9d9d9'}30`
                  }}
                />
              </motion.div>
            )}
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
              <Title level={4} style={{ 
                margin: '8px 0 0 0', 
                color: color,
                fontWeight: 700,
                fontSize: '24px'
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

const AnimatedInviteCard = ({ invite, onView, onEdit, onDelete, delay }) => {
  const renderStatus = (statut) => {
    let color, text, icon;
    switch (statut) {
      case 'en_attente':
        color = 'gold';
        text = 'En attente';
        icon = <QuestionCircleOutlined />;
        break;
      case 'envoyee':
        color = 'blue';
        text = 'Envoyée';
        icon = <MailOutlined />;
        break;
      case 'confirmee':
        color = 'green';
        text = 'Confirmé';
        icon = <CheckCircleOutlined />;
        break;
      case 'refusee':
        color = 'red';
        text = 'Décliné';
        icon = <CloseCircleOutlined />;
        break;
      case 'participation_confirmee':
        color = 'blue';
        text = 'A participé';
        icon = <CheckCircleOutlined />;
        break;
      case 'absente':
        color = 'volcano';
        text = 'Absent';
        icon = <CloseCircleOutlined />;
        break;
      default:
        color = 'default';
        text = statut || 'Inconnu';
        icon = null;
    }
    return <Tag color={color} icon={icon}>{text}</Tag>;
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: delay * 0.05,
        ease: "easeOut"
      }
    },
    hover: {
      y: -8,
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
        className="invite-card-modern"
        style={{
          height: '100%',
          borderRadius: '16px',
          border: '1px solid #f0f0f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          cursor: 'pointer'
        }}
        onClick={() => onView(invite.id)}
        actions={[
          <Tooltip title="Voir">
            <EyeOutlined 
              onClick={(e) => {
                e.stopPropagation();
                onView(invite.id);
              }} 
              style={{ color: '#1890ff' }}
            />
          </Tooltip>,
          <Tooltip title="Modifier">
            <EditOutlined 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(invite.id);
              }} 
              style={{ color: '#52c41a' }}
            />
          </Tooltip>,
          <Tooltip title="Supprimer">
            <DeleteOutlined 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(invite.id, `${invite.nom} ${invite.prenom}`);
              }} 
              style={{ color: '#ff4d4f' }}
            />
          </Tooltip>,
        ]}
      >
        <div className="card-avatar" style={{ textAlign: 'center', marginBottom: '16px', position: 'relative' }}>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <Avatar 
              size={64} 
              icon={<UserOutlined />} 
              style={{ 
                backgroundColor: invite.potentiel === 'élevé' ? '#f5222d' : 
                                invite.potentiel === 'moyen' ? '#faad14' : '#1890ff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }} 
            />
          </motion.div>
          {invite.is_converted && (
            <motion.div
              className="converted-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              style={{ position: 'absolute', top: '-4px', right: '20%' }}
            >
              <Badge status="success" text="Converti" />
            </motion.div>
          )}
        </div>

        <div className="card-content" style={{ textAlign: 'center' }}>
          <div className="card-name" style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>
            {invite.nom} {invite.prenom}
          </div>
          <div className="card-company" style={{ color: '#666', marginBottom: '8px' }}>
            {invite.entreprise?.nom || 'N/A'}
          </div>
          <div className="card-status" style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
            {renderStatus(invite.statut)}
          </div>
          <div className="card-meta" style={{ textAlign: 'left', borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
            <motion.div 
              className="card-meta-item"
              whileHover={{ x: 5 }}
              style={{ marginTop: '4px', color: '#666', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <MailOutlined style={{ color: '#1890ff' }} /> {invite.email || 'N/A'}
            </motion.div>
            {invite.telephone && (
              <motion.div 
                className="card-meta-item"
                whileHover={{ x: 5 }}
                style={{ marginTop: '4px', color: '#666', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <PhoneOutlined style={{ color: '#52c41a' }} /> {invite.telephone}
              </motion.div>
            )}
            <motion.div 
              className="card-meta-item"
              whileHover={{ x: 5 }}
              style={{ marginTop: '4px', color: '#666', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <CalendarOutlined style={{ color: '#722ed1' }} /> {invite.action?.nom || 'N/A'}
            </motion.div>
            <motion.div 
              className="card-meta-item"
              whileHover={{ x: 5 }}
              style={{ marginTop: '4px', color: '#666', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <CalendarOutlined style={{ color: '#13c2c2' }} /> {invite.date_invitation ? moment(invite.date_invitation).format('DD/MM/YYYY') : 'N/A'}
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const InvitesList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  
  const { 
    items: invites, 
    loading, 
    error, 
    pagination, 
    filters,
    operation 
  } = useSelector(state => state.invites);

  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState('table');
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [localFilters, setLocalFilters] = useState({});
  const [allInvites, setAllInvites] = useState([]);
  const [actionsList, setActionsList] = useState([]);
  const [actionsLoading, setActionsLoading] = useState(false);

  // Stats calculés à partir de TOUS les invités
  const stats = useMemo(() => {
    if (!allInvites || allInvites.length === 0) return {
      total: 0,
      confirmed: 0,
      pending: 0,
      rejected: 0,
      attended: 0,
      absent: 0
    };
    
    return {
      total: allInvites.length,
      confirmed: allInvites.filter(i => i.statut === 'confirmee').length,
      pending: allInvites.filter(i => i.statut === 'en_attente').length,
      rejected: allInvites.filter(i => i.statut === 'refusee').length,
      attended: allInvites.filter(i => i.statut === 'participation_confirmee').length,
      absent: allInvites.filter(i => i.statut === 'absente').length,
    };
  }, [allInvites]);

  useEffect(() => {
    const loadActions = async () => {
      setActionsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://127.0.0.1:8000/api/actions/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const actions = data.success ? (data.data?.data || data.data || []) : [];
          setActionsList(Array.isArray(actions) ? actions : []);
        }
      } catch (error) {
        console.error('Erreur chargement actions:', error);
      } finally {
        setActionsLoading(false);
      }
    };
    
    loadActions();
  }, []);

  // Charger les invités au chargement et lors des changements de filtres/pagination
  useEffect(() => {
    const params = {
      page: currentPage,
      per_page: pageSize,
      search: searchText,
      ...localFilters,
      ...advancedFilters
    };
    dispatch(fetchInvites(params));
  }, [dispatch, currentPage, pageSize, localFilters, advancedFilters, searchText, refreshTrigger]);

  // Charger TOUS les invités pour les statistiques (sans pagination)
  useEffect(() => {
    const fetchAllInvites = async () => {
      try {
        const allParams = {
          per_page: 9999,
          search: searchText,
          ...localFilters,
          ...advancedFilters
        };
        const result = await dispatch(fetchInvites(allParams));
        if (result.payload && result.payload.data) {
          const invitesData = Array.isArray(result.payload.data) 
            ? result.payload.data 
            : result.payload.data.data || [];
          setAllInvites(invitesData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de tous les invités:', error);
        setAllInvites([]);
      }
    };

    fetchAllInvites();
  }, [dispatch, localFilters, advancedFilters, searchText, refreshTrigger]);

  // Gestion des succès/erreurs d'opération
  useEffect(() => {
    if (operation.success && operation.type === 'delete') {
      message.success('Invité supprimé avec succès');
      setSelectedRows([]);
      setSelectedRowKeys([]);
      setRefreshTrigger(prev => prev + 1);
    } else if (operation.success && operation.type === 'update_status') {
      message.success('Statut mis à jour avec succès');
      setRefreshTrigger(prev => prev + 1);
    } else if (operation.error) {
      message.error(operation.error);
    }
  }, [operation]);

  // Fonction pour ouvrir la confirmation de suppression
  const showDeleteConfirm = (id, name) => {
    confirm({
      title: `Êtes-vous sûr de vouloir supprimer l'invité ${name}?`,
      icon: <ExclamationCircleOutlined />,
      content: 'Cette action est irréversible.',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk() {
        dispatch(deleteInvite(id));
      }
    });
  };

  // Changer le statut d'un invité
  const handleStatusChange = (id, newStatus) => {
    dispatch(updateInviteStatus({ id, statut: newStatus }));
  };

  // Navigation pour créer/éditer
  const handleAddNew = () => {
    navigate('/invites/create');
  };

  const handleEdit = (id) => {
    navigate(`/invites/${id}/edit`);
  };

  const handleView = (id) => {
    navigate(`/invites/${id}`);
  };

  // Recherche
  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  // Filtres
  const handleFilterChange = (field, value) => {
    setLocalFilters(prev => {
      const next = { ...prev };
      if (value === undefined || value === null || value === '') {
        delete next[field];
      } else {
        next[field] = value;
      }
      return next;
    });
    setCurrentPage(1);
  };

  // Réinitialiser tous les filtres
  const resetAllFilters = () => {
    setLocalFilters({});
    setAdvancedFilters({});
    setSearchText('');
    setCurrentPage(1);
  };

  // Pagination
  const handleTableChange = (paginationTable, tableFilters, sorter) => {
    setCurrentPage(paginationTable.current);
    setPageSize(paginationTable.pageSize);
    
    if (sorter && sorter.field) {
      const orderDir = sorter.order === 'ascend' ? 'asc' : 'desc';
      setLocalFilters(prev => ({
        ...prev,
        sort_by: sorter.field,
        sort_dir: orderDir
      }));
    }
  };

  // Sélection de lignes
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys, rows) => {
      setSelectedRowKeys(keys);
      setSelectedRows(rows);
    }
  };

  // Actions en lot
  const handleBatchAction = (action) => {
    if (selectedRows.length === 0) {
      message.warning('Veuillez sélectionner au moins un invité');
      return;
    }

    if (action === 'delete') {
      confirm({
        title: `Supprimer ${selectedRows.length} invité(s)?`,
        icon: <ExclamationCircleOutlined />,
        content: 'Cette action est irréversible.',
        okText: 'Oui',
        okType: 'danger',
        cancelText: 'Non',
        onOk() {
          message.success(`${selectedRows.length} invités supprimés`);
          setSelectedRows([]);
          setSelectedRowKeys([]);
          setRefreshTrigger(prev => prev + 1);
        }
      });
    } else if (action.startsWith('status:')) {
      const newStatus = action.split(':')[1];
      message.success(`Statut mis à jour pour ${selectedRows.length} invités`);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  // Rendu du statut avec un tag coloré
  const renderStatus = (statut) => {
    let color, text, icon;
    switch (statut) {
      case 'en_attente':
        color = 'gold';
        text = 'En attente';
        icon = <QuestionCircleOutlined />;
        break;
      case 'envoyee':
        color = 'blue';
        text = 'Envoyée';
        icon = <MailOutlined />;
        break;
      case 'confirmee':
        color = 'green';
        text = 'Confirmé';
        icon = <CheckCircleOutlined />;
        break;
      case 'refusee':
        color = 'red';
        text = 'Décliné';
        icon = <CloseCircleOutlined />;
        break;
      case 'participation_confirmee':
        color = 'blue';
        text = 'A participé';
        icon = <CheckCircleOutlined />;
        break;
      case 'participation_sans_suivi':
        color = 'purple';
        text = 'Sans suivi';
        icon = null;
        break;
      case 'absente':
        color = 'volcano';
        text = 'Absent';
        icon = <CloseCircleOutlined />;
        break;
      case 'aucune_reponse':
        color = 'default';
        text = 'Sans réponse';
        icon = <BellOutlined />;
        break;
      default:
        color = 'default';
        text = statut || 'Inconnu';
        icon = null;
    }
    return (
      <Tag color={color} icon={icon}>{text}</Tag>
    );
  };

  // Colonnes du tableau
  const columns = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      sorter: true,
      render: (text, record) => (
        <motion.div 
          className="invite-name-cell"
          whileHover={{ x: 5 }}
          transition={{ duration: 0.2 }}
        >
          <Avatar 
            size="small" 
            icon={<UserOutlined />} 
            style={{ 
              marginRight: 8, 
              backgroundColor: record.potentiel === 'élevé' ? '#f5222d' : 
                              record.potentiel === 'moyen' ? '#faad14' : '#1890ff' 
            }} 
          />
          <a onClick={() => handleView(record.id)}>
            {record.nom} {record.prenom}
          </a>
          {record.is_converted && (
            <Tag color="success" style={{ marginLeft: 8 }}>Converti</Tag>
          )}
        </motion.div>
      )
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <div className="contact-info">
          <div>
            <MailOutlined style={{ marginRight: 6, color: '#1890ff' }} />
            {record.email || 'N/A'}
          </div>
          {record.telephone && (
            <div>
              <PhoneOutlined style={{ marginRight: 6, color: '#52c41a' }} />
              {record.telephone}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Entreprise',
      key: 'entreprise',
      sorter: true,
      render: (_, record) => (
        <div>
          <TeamOutlined style={{ marginRight: 6, color: '#722ed1' }} />
          {record.entreprise?.nom || 'N/A'}
        </div>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div>
          <CalendarOutlined style={{ marginRight: 6, color: '#13c2c2' }} />
          {record.action?.nom || 'N/A'}
        </div>
      )
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: renderStatus,
    },
    {
      title: 'Date d\'invitation',
      dataIndex: 'date_invitation',
      key: 'date_invitation',
      sorter: true,
      render: (text) => text ? moment(text).format('DD/MM/YYYY') : 'N/A'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 90,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="view" icon={<EyeOutlined />} onClick={() => handleView(record.id)}>
                Voir
              </Menu.Item>
              <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEdit(record.id)}>
                Modifier
              </Menu.Item>
              <Menu.Divider />
              <Menu.SubMenu key="status" title="Changer le statut" icon={<FilterOutlined />}>
                <Menu.Item 
                  key="envoyee" 
                  icon={<MailOutlined />}
                  onClick={() => handleStatusChange(record.id, 'envoyee')}
                  disabled={record.statut === 'envoyee'}
                >
                  Invitation envoyée
                </Menu.Item>
                <Menu.Item 
                  key="confirmee" 
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, 'confirmee')}
                  disabled={record.statut === 'confirmee'}
                >
                  Confirmé
                </Menu.Item>
                <Menu.Item 
                  key="refusee" 
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, 'refusee')}
                  disabled={record.statut === 'refusee'}
                >
                  Décliné
                </Menu.Item>
                <Menu.Item 
                  key="participation_confirmee" 
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, 'participation_confirmee')}
                  disabled={record.statut === 'participation_confirmee'}
                >
                  A participé
                </Menu.Item>
                <Menu.Item 
                  key="absente" 
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, 'absente')}
                  disabled={record.statut === 'absente'}
                >
                  Absent
                </Menu.Item>
                <Menu.Item 
                  key="en_attente" 
                  icon={<QuestionCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, 'en_attente')}
                  disabled={record.statut === 'en_attente'}
                >
                  En attente
                </Menu.Item>
              </Menu.SubMenu>
              <Menu.Divider />
              <Menu.Item 
                key="delete" 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => showDeleteConfirm(record.id, record.nom)}
              >
                Supprimer
              </Menu.Item>
            </Menu>
          }
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  const safeInvites = Array.isArray(invites) ? invites : [];

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
              <Title level={2} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
                <TeamOutlined style={{ marginRight: '16px' }} />
                Gestion des Invités
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: '8px 0 0 0' }}>
                Suivi et gestion de tous les invités aux événements
              </Paragraph>
            </motion.div>
          </Col>
          <Col>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Space size="large">
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleAddNew}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  Nouvel Invité
                </Button>
                <Button 
                  type="primary" 
                  icon={<DashboardOutlined />}
                  onClick={() => navigate('/dashboard/invites')}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  Dashboard Invité
                </Button>
              </Space>
            </motion.div>
          </Col>
        </Row>
      </motion.div>

      {/* Statistiques principales */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<TeamOutlined />}
            title="Total"
            value={stats.total}
            color="#1890ff"
            loading={loading}
            delay={0}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<QuestionCircleOutlined />}
            title="En Attente"
            value={stats.pending}
            color="#faad14"
            loading={loading}
            delay={1}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<CheckCircleOutlined />}
            title="Confirmés"
            value={stats.confirmed}
            color="#52c41a"
            loading={loading}
            delay={2}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<CloseCircleOutlined />}
            title="Refusés"
            value={stats.rejected}
            color="#ff4d4f"
            loading={loading}
            delay={3}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<CheckCircleOutlined />}
            title="Ont Participé"
            value={stats.attended}
            color="#722ed1"
            loading={loading}
            delay={4}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<CloseCircleOutlined />}
            title="Absents"
            value={stats.absent}
            color="#fa541c"
            loading={loading}
            delay={5}
          />
        </Col>
      </Row>

      {/* Filtres identiques à ProspectsList */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ marginBottom: '32px' }}
      >
        <Card 
          style={{ 
            borderRadius: '16px',
            border: '1px solid #f0f0f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
          bodyStyle={{ padding: '20px' }}
        >
          <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={5}>
          <Search
                placeholder="Rechercher un invité..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onSearch={handleSearch}
                style={{ borderRadius: '8px' }}
                prefix={<SearchOutlined style={{ color: '#1890ff' }} />}
              />
            </Col>
            <Col xs={24} sm={8} md={5}>
              <Select
                style={{ width: '100%', borderRadius: '8px' }}
                placeholder="Statut"
                allowClear
                onChange={(value) => handleFilterChange('statut', value)}
                value={localFilters.statut}
              >
                <Option value="en_attente">En attente</Option>
                <Option value="envoyee">Envoyée</Option>
                <Option value="confirmee">Confirmée</Option>
                <Option value="refusee">Refusée</Option>
                <Option value="participation_confirmee">A participé</Option>
                <Option value="absente">Absent</Option>
              </Select>
            </Col>
            <Col xs={24} sm={8} md={5}>
              <Select
                style={{ width: '100%', borderRadius: '8px' }}
                placeholder="Action"
                allowClear
                onChange={(value) => handleFilterChange('action_id', value)}
                value={localFilters.action_id}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().includes(input.toLowerCase())
                }
                notFoundContent={
                  actionsLoading ? (
                    <Spin size="small" />
                  ) : (
                    "Aucune action trouvée"
                  )
                }
              >
                {actionsList && actionsList.length > 0 ? (
                  actionsList.map(action => (
                    <Option key={action.id} value={action.id}>
                      {action.nom}
                    </Option>
                  ))
                ) : (
                  <Option disabled value="">
                    {actionsLoading ? 'Chargement...' : 'Aucune action disponible'}
                  </Option>
                )}
              </Select>
            </Col>
            <Col xs={24} sm={8} md={5}>
              <Select
                style={{ width: '100%', borderRadius: '8px' }}
                placeholder="Potentiel"
                allowClear
                onChange={(value) => handleFilterChange('potentiel', value)}
                value={localFilters.potentiel}
              >
                <Option value="faible">Faible</Option>
                <Option value="moyen">Moyen</Option>
                <Option value="élevé">Élevé</Option>
              </Select>
            </Col>
            <Col>
              <Segmented
                value={viewMode}
                onChange={setViewMode}
                options={[
                  {
                    value: 'table',
                    icon: <BarsOutlined />,
                    label: screens.xs ? null : 'Tableau'
                  },
                  {
                    value: 'cards',
                    icon: <AppstoreOutlined />,
                    label: screens.xs ? null : 'Cartes'
                  },
                ]}
              />
            </Col>
          </Row>
        </Card>
      </motion.div>

      {/* Actions en lot */}
      <AnimatePresence>
        {selectedRows.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginBottom: '24px' }}
          >
            <Card 
              style={{ 
                background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)',
                border: '1px solid #91d5ff',
                borderRadius: '12px'
              }}
              bodyStyle={{ padding: '16px' }}
            >
              <Row justify="space-between" align="middle">
                <Col>
                  <Text strong style={{ color: '#096dd9' }}>
                    {selectedRows.length} invité(s) sélectionné(s)
                  </Text>
                </Col>
                <Col>
                  <Dropdown
                    overlay={
                      <Menu onClick={({ key }) => handleBatchAction(key)}>
                        <Menu.SubMenu key="status" title="Changer le statut">
                          <Menu.Item key="status:en_attente">En attente</Menu.Item>
                          <Menu.Item key="status:envoyee">Envoyée</Menu.Item>
                          <Menu.Item key="status:confirmee">Confirmée</Menu.Item>
                          <Menu.Item key="status:refusee">Refusée</Menu.Item>
                          <Menu.Item key="status:participation_confirmee">A participé</Menu.Item>
                          <Menu.Item key="status:absente">Absent</Menu.Item>
                        </Menu.SubMenu>
                        <Menu.Divider />
                        <Menu.Item key="export-excel" icon={<FileExcelOutlined />}>Exporter (Excel)</Menu.Item>
                        <Menu.Item key="export-pdf" icon={<FilePdfOutlined />}>Exporter (PDF)</Menu.Item>
                        <Menu.Divider />
                        <Menu.Item key="delete" danger icon={<DeleteOutlined />}>Supprimer</Menu.Item>
                      </Menu>
                    }
                  >
                    <Button type="primary">
                      Actions groupées <DownOutlined />
                    </Button>
                  </Dropdown>
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
        transition={{ delay: 0.6 }}
      >
        <Card
          style={{
            borderRadius: '16px',
            border: '1px solid #f0f0f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            overflow: 'hidden'
          }}
          bodyStyle={{ padding: '24px' }}
        >
          {error && (
            <Alert 
              message="Erreur" 
              description={error} 
              type="error" 
              showIcon 
              style={{ marginBottom: 16, borderRadius: '8px' }} 
            />
          )}

          {/* Mode tableau */}
          {viewMode === 'table' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Table
                columns={columns}
                dataSource={safeInvites}
                rowKey="id"
                loading={loading}
                rowSelection={rowSelection}
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: pagination?.total || 0,
                  style: { marginTop: '16px' }
                }}
                onChange={handleTableChange}
                scroll={{ x: 'max-content' }}
                style={{ borderRadius: '8px', overflow: 'hidden' }}
              />
            </motion.div>
          )}

          {/* Mode cartes */}
          {viewMode === 'cards' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    style={{ marginBottom: '16px' }}
                  >
                    <SyncOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                  </motion.div>
                </div>
              ) : safeInvites && safeInvites.length > 0 ? (
                <Row gutter={[24, 24]}>
                  {safeInvites.map((invite, index) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={invite.id}>
                      <AnimatedInviteCard
                        invite={invite}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={showDeleteConfirm}
                        delay={index}
                      />
                    </Col>
                  ))}
                </Row>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ textAlign: 'center', padding: '60px 0' }}
                >
                  <Empty 
                    description="Aucun invité trouvé" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </motion.div>
              )}
              
              {/* Pagination pour le mode cartes */}
              {safeInvites && safeInvites.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  style={{ 
                    marginTop: '32px', 
                    display: 'flex', 
                    justifyContent: 'center' 
                  }}
                >
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={pagination?.total || 0}
                    onChange={(page, size) => {
                      setCurrentPage(page);
                      setPageSize(size);
                    }}
                  />
                </motion.div>
              )}
            </motion.div>
          )}
        </Card>
      </motion.div>

      {/* Styles CSS intégrés identiques à ProspectsList */}
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
          margin-bottom: 12px;
        }

        .stat-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .invite-card-modern {
          transition: all 0.3s ease;
        }

        .invite-card-modern:hover {
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

        .invite-name-cell {
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
        }

        .invite-name-cell:hover {
          transform: translateX(5px);
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .card-avatar {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
          position: relative;
        }

        .converted-badge {
          position: absolute;
          top: -4px;
          right: 20%;
          z-index: 1;
        }

        .card-content {
          text-align: center;
        }

        .card-name {
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 8px;
          color: #333;
        }

        .card-company {
          color: #666;
          margin-bottom: 12px;
          font-size: 14px;
        }

        .card-status {
          margin-bottom: 16px;
          display: flex;
          justify-content: center;
        }

        .card-meta {
          text-align: left;
          border-top: 1px solid #f0f0f0;
          padding-top: 16px;
          margin-top: 16px;
        }

        .card-meta-item {
          margin-bottom: 8px;
          color: #666;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .card-meta-item:hover {
          transform: translateX(5px);
          color: #1890ff !important;
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

        /* Styles pour les tables responsives */
        .ant-table-wrapper {
          border-radius: 8px;
          overflow: hidden;
        }

        .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
          border-bottom: 2px solid #e8e8e8;
          font-weight: 600;
        }

        .ant-table-tbody > tr:hover > td {
          background: linear-gradient(135deg, #f0f7ff 0%, #e6f7ff 100%);
        }

        /* Styles pour les cartes d'invités */
        .invite-card-modern .ant-card-actions {
          background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
          border-top: 1px solid #e8e8e8;
        }

        .invite-card-modern .ant-card-actions > li {
          margin: 8px 0;
        }

        .invite-card-modern .ant-card-actions > li > span {
          transition: all 0.2s ease;
        }

        .invite-card-modern .ant-card-actions > li > span:hover {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
};

export default InvitesList;