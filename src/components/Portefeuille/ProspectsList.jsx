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
  ReloadOutlined, BarsOutlined, SendOutlined, HomeOutlined, DashboardOutlined,
  DownOutlined, SwapOutlined, BankOutlined, AuditOutlined, ClockCircleOutlined,
  SyncOutlined, ArrowUpOutlined, ArrowDownOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchProspects,
  deleteProspect,
  updateProspectStatus,
  convertToInvestor,
  resetOperation
} from '../../features/prospectSlice';
import {
  fetchPays,
  fetchSecteurs
} from '../../features/marketingSlice';
import moment from 'moment';

const { confirm } = Modal;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;
const { useBreakpoint } = Grid;

// Composant de statistique animée réutilisé
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
                      fontSize: '10px',
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

// Composant de carte de prospect animée
const AnimatedProspectCard = ({ prospect, onView, onEdit, onDelete, renderStatus, delay = 0 }) => {
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
        hoverable
        className="prospect-card-modern"
        onClick={() => onView(prospect.id)}
        style={{
          height: '100%',
          borderRadius: '16px',
          border: '1px solid #f0f0f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          cursor: 'pointer'
        }}
        actions={[
          <Tooltip title="Voir">
            <EyeOutlined 
              onClick={(e) => {
                e.stopPropagation();
                onView(prospect.id);
              }} 
              style={{ color: '#1890ff' }}
            />
          </Tooltip>,
          <Tooltip title="Modifier">
            <EditOutlined 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(prospect.id);
              }} 
              style={{ color: '#52c41a' }}
            />
          </Tooltip>,
          <Tooltip title="Supprimer">
            <DeleteOutlined 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(prospect.id, prospect.nom);
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
                backgroundColor: prospect.statut === 'converti' ? '#52c41a' : 
                                prospect.statut === 'qualifie' ? '#1890ff' :
                                prospect.statut === 'perdu' ? '#ff4d4f' : '#faad14',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }} 
            />
          </motion.div>
          {prospect.statut === 'converti' && (
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
            {prospect.nom}
          </div>
          <div className="card-company" style={{ color: '#666', marginBottom: '8px' }}>
            {prospect.entreprise?.nom || 'N/A'}
          </div>
          <div className="card-status" style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
            {renderStatus(prospect.statut)}
          </div>
          <div className="card-meta" style={{ textAlign: 'left', borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
            <motion.div 
              className="card-meta-item"
              whileHover={{ x: 5 }}
              style={{ marginTop: '4px', color: '#666', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <MailOutlined style={{ color: '#1890ff' }} /> {prospect.email || 'N/A'}
            </motion.div>
            {prospect.telephone && (
              <motion.div 
                className="card-meta-item"
                whileHover={{ x: 5 }}
                style={{ marginTop: '4px', color: '#666', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <PhoneOutlined style={{ color: '#52c41a' }} /> {prospect.telephone}
              </motion.div>
            )}
            <motion.div 
              className="card-meta-item"
              whileHover={{ x: 5 }}
              style={{ marginTop: '4px', color: '#666', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <GlobalOutlined style={{ color: '#13c2c2' }} /> {prospect.secteur?.name || 'N/A'}
            </motion.div>
            <motion.div 
              className="card-meta-item"
              whileHover={{ x: 5 }}
              style={{ marginTop: '4px', color: '#666', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <GlobalOutlined style={{ color: '#13c2c2' }} /> {prospect.pays?.name_pays || 'N/A'}
            </motion.div>
            <motion.div 
              className="card-meta-item"
              whileHover={{ x: 5 }}
              style={{ marginTop: '4px', color: '#666', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <CalendarOutlined style={{ color: '#faad14' }} /> {prospect.created_at ? moment(prospect.created_at).format('DD/MM/YYYY') : 'N/A'}
            </motion.div>
            {prospect.responsable?.name && (
              <motion.div 
                className="card-meta-item"
                whileHover={{ x: 5 }}
                style={{ marginTop: '4px', color: '#666', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <UserOutlined style={{ color: '#1890ff' }} /> {prospect.responsable.name}
              </motion.div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const ProspectsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const screens = useBreakpoint();

  // Redux state
  const {
    list: { items: prospects, loading, error, meta },
    operation
  } = useSelector(state => state.prospects);

  // Ensure prospects is always an array to prevent Table errors
  const safeProspects = Array.isArray(prospects) ? prospects : [];

  // Local state
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
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({});
  const [allProspects, setAllProspects] = useState([]);

  // Récupérer les données nécessaires du marketing slice
  const {
    pays: { items: paysList = [] },
    secteurs: { items: secteursList = [] }
  } = useSelector(state => state.marketing);

  // Stats calculés à partir de TOUS les prospects
  const stats = useMemo(() => {
    if (!allProspects || allProspects.length === 0) return {
      total: 0,
      qualifie: 0,
      nouveau: 0,
      en_cours: 0,
      non_qualifie: 0,
      converti: 0,
      perdu: 0
    };

    return {
      total: allProspects.length,
      qualifie: allProspects.filter(p => p.statut === 'qualifie').length,
      nouveau: allProspects.filter(p => p.statut === 'nouveau').length,
      en_cours: allProspects.filter(p => p.statut === 'en_cours').length,
      non_qualifie: allProspects.filter(p => p.statut === 'non_qualifie').length,
      converti: allProspects.filter(p => p.statut === 'converti').length,
      perdu: allProspects.filter(p => p.statut === 'perdu').length,
    };
  }, [allProspects]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchPays()),
        dispatch(fetchSecteurs())
      ]);
      await loadProspects();
    } finally {
      setRefreshing(false);
    }
  };

  const loadProspects = () => {
    const params = {
      page: currentPage,
      per_page: pageSize,
      search: searchText,
      ...filters,
      ...advancedFilters
    };
    dispatch(fetchProspects(params));
  };

  // Charger les prospects au chargement et lors des changements de filtres/pagination
  useEffect(() => {
    loadProspects();
  }, [currentPage, pageSize, filters, advancedFilters, searchText, refreshTrigger]);

  // Charger TOUS les prospects pour les statistiques (sans pagination)
  useEffect(() => {
    const fetchAllProspects = async () => {
      try {
        const allParams = {
          per_page: 9999, // Grande valeur pour récupérer tous les prospects
          search: searchText,
          ...filters,
          ...advancedFilters
        };
        const result = await dispatch(fetchProspects(allParams));
        if (result.payload && result.payload.data) {
          // Vérifier si result.payload.data est un tableau ou un objet avec une propriété data
          const prospectsData = Array.isArray(result.payload.data)
            ? result.payload.data
            : result.payload.data.data || [];
          setAllProspects(prospectsData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de tous les prospects:', error);
        setAllProspects([]); // Initialiser avec un tableau vide en cas d'erreur
      }
    };

    fetchAllProspects();
  }, [filters, advancedFilters, searchText, refreshTrigger]);

  // Gestion des succès/erreurs d'opération
  useEffect(() => {
    if (operation.success && operation.type === 'delete') {
      message.success('Prospect supprimé avec succès');
      setSelectedRows([]);
      setSelectedRowKeys([]);
      setRefreshTrigger(prev => prev + 1);
    } else if (operation.success && operation.type === 'update_status') {
      message.success('Statut mis à jour avec succès');
      setRefreshTrigger(prev => prev + 1);
    } else if (operation.success && operation.type === 'convert_to_investor') {
      message.success('Prospect converti en investisseur avec succès');
      setRefreshTrigger(prev => prev + 1);
    } else if (operation.error) {
      message.error(operation.error);
    }
  }, [operation]);

  // Fonctions
  const showDeleteConfirm = (id, name) => {
    confirm({
      title: `Êtes-vous sûr de vouloir supprimer le prospect ${name}?`,
      icon: <ExclamationCircleOutlined />,
      content: 'Cette action est irréversible.',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk() {
        dispatch(deleteProspect(id));
      }
    });
  };

  const handleStatusChange = (id, newStatus) => {
    dispatch(updateProspectStatus({ id, statut: newStatus }));
  };

  const handleConvertToInvestor = (id, name) => {
    confirm({
      title: `Convertir le prospect ${name} en investisseur?`,
      icon: <SwapOutlined />,
      content: 'Cette action créera un nouvel investisseur basé sur les données du prospect.',
      okText: 'Convertir',
      okType: 'primary',
      cancelText: 'Annuler',
      onOk() {
        dispatch(convertToInvestor({ id }));
      }
    });
  };

  const handleEdit = (id) => {
    navigate(`/prospects/${id}/edit`);
  };

  const handleView = (id) => {
    navigate(`/prospects/${id}`);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const resetAllFilters = () => {
    setFilters({});
    setAdvancedFilters({});
    setSearchText('');
    setCurrentPage(1);
  };

  const handleTableChange = (pagination, tableFilters, sorter) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);

    if (sorter && sorter.field) {
      const orderDir = sorter.order === 'ascend' ? 'asc' : 'desc';
      setFilters(prev => ({
        ...prev,
        sort_by: sorter.field,
        sort_dir: orderDir
      }));
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys, rows) => {
      setSelectedRowKeys(keys);
      setSelectedRows(rows);
    }
  };

  const handleBatchAction = (action) => {
    if (selectedRows.length === 0) {
      message.warning('Veuillez sélectionner au moins un prospect');
      return;
    }

    if (action === 'delete') {
      confirm({
        title: `Supprimer ${selectedRows.length} prospect(s)?`,
        icon: <ExclamationCircleOutlined />,
        content: 'Cette action est irréversible.',
        okText: 'Oui',
        okType: 'danger',
        cancelText: 'Non',
        onOk() {
          // Suppression en lot à implémenter
          message.success(`${selectedRows.length} prospects supprimés`);
          setSelectedRows([]);
          setSelectedRowKeys([]);
          setRefreshTrigger(prev => prev + 1);
        }
      });
    } else if (action.startsWith('status:')) {
      const newStatus = action.split(':')[1];
      // Changement de statut en lot à implémenter
      message.success(`Statut mis à jour pour ${selectedRows.length} prospects`);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  // Rendu du statut avec un tag coloré
  const renderStatus = (statut) => {
    let color, text, icon;
    switch (statut) {
      case 'nouveau':
        color = 'blue';
        text = 'Nouveau';
        icon = <PlusOutlined />;
        break;
      case 'en_cours':
        color = 'orange';
        text = 'En cours';
        icon = <QuestionCircleOutlined />;
        break;
      case 'qualifie':
        color = 'green';
        text = 'Qualifié';
        icon = <CheckCircleOutlined />;
        break;
      case 'non_qualifie':
        color = 'red';
        text = 'Non qualifié';
        icon = <CloseCircleOutlined />;
        break;
      case 'converti':
        color = 'purple';
        text = 'Converti';
        icon = <SwapOutlined />;
        break;
      case 'perdu':
        color = 'volcano';
        text = 'Perdu';
        icon = <CloseCircleOutlined />;
        break;
      default:
        color = 'default';
        text = statut || 'Inconnu';
        icon = null;
    }
    return <Tag color={color} icon={icon}>{text}</Tag>;
  };

  // Colonnes du tableau avec animations
  const columns = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      sorter: true,
      render: (text, record) => (
        <motion.div 
          className="prospect-name-cell"
          whileHover={{ x: 5 }}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <Avatar
            size="small"
            icon={<UserOutlined />}
            style={{
              marginRight: 8,
              backgroundColor: '#1890ff'
            }}
          />
          <a onClick={() => handleView(record.id)} style={{ fontWeight: 500 }}>
            {record.nom}
          </a>
          {record.statut === 'converti' && (
            <Tag color="purple" style={{ marginLeft: 8 }}>Converti</Tag>
          )}
        </motion.div>
      )
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <motion.div whileHover={{ x: 3 }} className="contact-info">
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
        </motion.div>
      )
    },
    {
      title: 'Entreprise',
      key: 'entreprise',
      sorter: true,
      render: (_, record) => (
        <motion.div whileHover={{ x: 3 }}>
          <BankOutlined style={{ marginRight: 6, color: '#722ed1' }} />
          {record.entreprise?.nom || 'N/A'}
        </motion.div>
      )
    },
    {
      title: 'Secteur',
      key: 'secteur',
      render: (_, record) => (
        <motion.div whileHover={{ x: 3 }}>
          <GlobalOutlined style={{ marginRight: 6, color: '#13c2c2' }} />
          {record.secteur?.name || 'Non spécifié'}
        </motion.div>
      )
    },
    {
      title: 'Pays',
      key: 'pays',
      render: (_, record) => (
        <motion.div whileHover={{ x: 3 }}>
          <GlobalOutlined style={{ marginRight: 6, color: '#13c2c2' }} />
          {record.pays?.name_pays || 'Non spécifié'}
        </motion.div>
      )
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (statut) => (
        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2 }}
        >
          {renderStatus(statut)}
        </motion.div>
      ),
    },
    {
      title: 'Responsable',
      key: 'responsable',
      render: (_, record) => (
        <motion.div whileHover={{ x: 3 }}>
          <UserOutlined style={{ marginRight: 6, color: '#1890ff' }} />
          {record.responsable?.name || 'Non assigné'}
        </motion.div>
      )
    },
    {
      title: 'Date de création',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: true,
      render: (text) => (
        <motion.div whileHover={{ scale: 1.05 }}>
          <Text type="secondary">
            {text ? moment(text).format('DD/MM/YYYY') : 'N/A'}
          </Text>
        </motion.div>
      )
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
                  key="nouveau"
                  icon={<PlusOutlined />}
                  onClick={() => handleStatusChange(record.id, 'nouveau')}
                  disabled={record.statut === 'nouveau'}
                >
                  Nouveau
                </Menu.Item>
                <Menu.Item
                  key="en_cours"
                  icon={<QuestionCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, 'en_cours')}
                  disabled={record.statut === 'en_cours'}
                >
                  En cours
                </Menu.Item>
                <Menu.Item
                  key="qualifie"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, 'qualifie')}
                  disabled={record.statut === 'qualifie'}
                >
                  Qualifié
                </Menu.Item>
                <Menu.Item
                  key="non_qualifie"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, 'non_qualifie')}
                  disabled={record.statut === 'non_qualifie'}
                >
                  Non qualifié
                </Menu.Item>
                <Menu.Item
                  key="perdu"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, 'perdu')}
                  disabled={record.statut === 'perdu'}
                >
                  Perdu
                </Menu.Item>
              </Menu.SubMenu>
              <Menu.Divider />
             
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
                <UserOutlined style={{ marginRight: '16px' }} />
                Gestion des Prospects
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: '8px 0 0 0' }}>
                Suivi et gestion de tous les prospects commerciaux
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
                  icon={<DashboardOutlined />}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <Link to="/dashboard/prospects" style={{ color: 'white' }}>
                    Dashboard de prospects
                  </Link>
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
            icon={<UserOutlined />}
            title="Total"
            value={stats.total}
            color="#1890ff"
            loading={loading}
            delay={0}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<PlusOutlined />}
            title="Nouveaux"
            value={stats.nouveau}
            color="#52c41a"
            loading={loading}
            delay={1}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<QuestionCircleOutlined />}
            title="En cours"
            value={stats.en_cours}
            color="#faad14"
            loading={loading}
            delay={2}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<CheckCircleOutlined />}
            title="Qualifiés"
            value={stats.qualifie}
            color="#722ed1"
            loading={loading}
            delay={3}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<SwapOutlined />}
            title="Convertis"
            value={stats.converti}
            color="#722ed1"
            loading={loading}
            delay={4}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<CloseCircleOutlined />}
            title="Perdus"
            value={stats.perdu}
            color="#f5222d"
            loading={loading}
            delay={5}
          />
        </Col>
      </Row>

      {/* Filtres */}
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
                placeholder="Rechercher un prospect..."
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
                value={filters.statut}
              >
                <Option value="nouveau">Nouveau</Option>
                <Option value="en_cours">En cours</Option>
                <Option value="qualifie">Qualifié</Option>
                <Option value="non_qualifie">Non qualifié</Option>
                <Option value="converti">Converti</Option>
                <Option value="perdu">Perdu</Option>
              </Select>
            </Col>
            <Col xs={24} sm={8} md={5}>
              <Select
                style={{ width: '100%', borderRadius: '8px' }}
                placeholder="Secteur"
                allowClear
                onChange={(value) => handleFilterChange('secteur_id', value)}
                value={filters.secteur_id}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {secteursList.map(secteur => (
                  <Option key={secteur.id} value={secteur.id}>
                    {secteur.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={8} md={5}>
              <Select
                style={{ width: '100%', borderRadius: '8px' }}
                placeholder="Pays"
                allowClear
                onChange={(value) => handleFilterChange('pays_id', value)}
                value={filters.pays_id}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {paysList.map((pays) => (
                  <Option key={pays.id} value={pays.id}>
                    {pays.name_pays}
                  </Option>
                ))}
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
                    {selectedRows.length} prospect(s) sélectionné(s)
                  </Text>
                </Col>
                <Col>
                  <Dropdown
                    overlay={
                      <Menu onClick={({ key }) => handleBatchAction(key)}>
                        <Menu.SubMenu key="status" title="Changer le statut">
                          <Menu.Item key="status:nouveau">Nouveau</Menu.Item>
                          <Menu.Item key="status:en_cours">En cours</Menu.Item>
                          <Menu.Item key="status:qualifie">Qualifié</Menu.Item>
                          <Menu.Item key="status:non_qualifie">Non qualifié</Menu.Item>
                          <Menu.Item key="status:converti">Converti</Menu.Item>
                          <Menu.Item key="status:perdu">Perdu</Menu.Item>
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
                dataSource={safeProspects}
                rowKey="id"
                loading={loading}
                rowSelection={rowSelection}
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: meta?.total || 0,
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
              ) : safeProspects && safeProspects.length > 0 ? (
                <Row gutter={[24, 24]}>
                  {safeProspects.map((prospect, index) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={prospect.id}>
                      <AnimatedProspectCard
                        prospect={prospect}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={showDeleteConfirm}
                        renderStatus={renderStatus}
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
                    description="Aucun prospect trouvé" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </motion.div>
              )}
              
              {/* Pagination pour le mode cartes */}
              {safeProspects && safeProspects.length > 0 && (
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
                    total={meta?.total || 0}
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
          margin-bottom: 12px;
        }

        .stat-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .prospect-card-modern {
          transition: all 0.3s ease;
        }

        .prospect-card-modern:hover {
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

        /* Styles pour les cartes de prospect */
        .prospect-card-modern .ant-card-actions {
          background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
          border-top: 1px solid #e8e8e8;
        }

        .prospect-card-modern .ant-card-actions > li {
          margin: 8px 0;
        }

        .prospect-card-modern .ant-card-actions > li > span {
          transition: all 0.2s ease;
        }

        .prospect-card-modern .ant-card-actions > li > span:hover {
          transform: scale(1.2);
        }

        .contact-info {
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
};

export default ProspectsList;