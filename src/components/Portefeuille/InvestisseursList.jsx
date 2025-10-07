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
  FundOutlined, TrophyOutlined, DollarOutlined, SafetyOutlined, SyncOutlined,
  PauseCircleOutlined, ExportOutlined, FireOutlined, ArrowUpOutlined, ArrowDownOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from "framer-motion";
import {
  getInvestisseurs,
  deleteInvestisseur,
  updateInvestisseurStatus,
  convertToProject,
  resetOperation
} from '../../features/investisseurSlice';
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

// Composant de carte d'investisseur animée
const AnimatedInvestisseurCard = ({ investisseur, onView, onEdit, onDelete, delay = 0 }) => {
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

  const formatMoney = (value, devise = 'EUR') => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: devise
    }).format(value);
  };

  const renderStatus = (statut) => {
    let color, text, icon;
    switch (statut) {
      case 'actif':
        color = 'green';
        text = 'Actif';
        icon = <CheckCircleOutlined />;
        break;
      case 'negociation':
        color = 'orange';
        text = 'Négociation';
        icon = <DollarOutlined />;
        break;
      case 'engagement':
        color = 'blue';
        text = 'Engagement';
        icon = <AuditOutlined />;
        break;
      case 'finalisation':
        color = 'cyan';
        text = 'Finalisation';
        icon = <ClockCircleOutlined />;
        break;
      case 'investi':
        color = 'purple';
        text = 'Investi';
        icon = <TrophyOutlined />;
        break;
      case 'suspendu':
        color = 'volcano';
        text = 'Suspendu';
        icon = <PauseCircleOutlined />;
        break;
      case 'inactif':
        color = 'default';
        text = 'Inactif';
        icon = <CloseCircleOutlined />;
        break;
      default:
        color = 'default';
        text = statut || 'Inconnu';
        icon = null;
    }
    return <Tag color={color} icon={icon}>{text}</Tag>;
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
        className="investisseur-card-modern"
        onClick={() => onView(investisseur.id)}
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
                onView(investisseur.id);
              }} 
              style={{ color: '#1890ff' }}
            />
          </Tooltip>,
          <Tooltip title="Modifier">
            <EditOutlined 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(investisseur.id);
              }} 
              style={{ color: '#52c41a' }}
            />
          </Tooltip>,
          <Tooltip title="Supprimer">
            <DeleteOutlined 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(investisseur.id, investisseur.nom);
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
              icon={<FundOutlined />} 
              style={{ 
                backgroundColor: investisseur.statut === 'investi' ? '#722ed1' : 
                                investisseur.statut === 'actif' ? '#52c41a' :
                                investisseur.statut === 'negociation' ? '#faad14' : '#1890ff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }} 
            />
          </motion.div>
          {investisseur.statut === 'converti' && (
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
            {investisseur.nom || 'Sans nom'}
          </div>
          <div className="card-company" style={{ color: '#666', marginBottom: '8px' }}>
            {investisseur.type_investisseur || 'Type non défini'}
          </div>
          <div className="card-status" style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
            {renderStatus(investisseur.statut)}
          </div>
          <div className="card-meta" style={{ textAlign: 'left', borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
            <motion.div 
              className="card-meta-item"
              whileHover={{ x: 5 }}
              style={{ marginTop: '4px', color: '#666', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <MailOutlined style={{ color: '#1890ff' }} /> {investisseur.email || 'N/A'}
            </motion.div>
            {investisseur.telephone && (
              <motion.div 
                className="card-meta-item"
                whileHover={{ x: 5 }}
                style={{ marginTop: '4px', color: '#666', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <PhoneOutlined style={{ color: '#52c41a' }} /> {investisseur.telephone}
              </motion.div>
            )}
            <motion.div 
              className="card-meta-item"
              whileHover={{ x: 5 }}
              style={{ marginTop: '4px', color: '#666', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <GlobalOutlined style={{ color: '#13c2c2' }} /> {investisseur.secteur?.name || 'N/A'}
            </motion.div>
            <motion.div 
              className="card-meta-item"
              whileHover={{ x: 5 }}
              style={{ marginTop: '4px', color: '#666', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <DollarOutlined style={{ color: '#722ed1' }} /> {formatMoney(investisseur.montant_investissement, investisseur.devise)}
            </motion.div>
            <motion.div 
              className="card-meta-item"
              whileHover={{ x: 5 }}
              style={{ marginTop: '4px', color: '#666', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <CalendarOutlined style={{ color: '#faad14' }} /> {investisseur.created_at ? moment(investisseur.created_at).format('DD/MM/YYYY') : 'N/A'}
            </motion.div>
            {investisseur.responsable?.name && (
              <motion.div 
                className="card-meta-item"
                whileHover={{ x: 5 }}
                style={{ marginTop: '4px', color: '#666', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <UserOutlined style={{ color: '#1890ff' }} /> {investisseur.responsable.name}
              </motion.div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const InvestisseursList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const screens = useBreakpoint();

  // Redux state
  const {
    items: investisseurs,
    loading,
    error,
    pagination,
    operation
  } = useSelector(state => state.investisseurs);

  // Ensure investisseurs is always an array to prevent Table errors
  const safeInvestisseurs = Array.isArray(investisseurs) ? investisseurs : [];

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
  const [allInvestisseurs, setAllInvestisseurs] = useState([]);

  // Récupérer les données nécessaires du marketing slice
  const {
    pays: { items: paysList = [] },
    secteurs: { items: secteursList = [] }
  } = useSelector(state => state.marketing);

  // Stats calculés à partir de TOUS les investisseurs
  const stats = useMemo(() => {
    if (!allInvestisseurs || allInvestisseurs.length === 0) return {
      total: 0,
      actif: 0,
      negociation: 0,
      engagement: 0,
      finalisation: 0,
      investi: 0,
      suspendu: 0,
      inactif: 0,
      converti: 0
    };

    return {
      total: allInvestisseurs.length,
      actif: allInvestisseurs.filter(i => i.statut === 'actif').length,
      negociation: allInvestisseurs.filter(i => i.statut === 'negociation').length,
      engagement: allInvestisseurs.filter(i => i.statut === 'engagement').length,
      finalisation: allInvestisseurs.filter(i => i.statut === 'finalisation').length,
      investi: allInvestisseurs.filter(i => i.statut === 'investi').length,
      suspendu: allInvestisseurs.filter(i => i.statut === 'suspendu').length,
      inactif: allInvestisseurs.filter(i => i.statut === 'inactif').length,
      converti: allInvestisseurs.filter(i => i.statut === 'converti').length
    };
  }, [allInvestisseurs]);

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
      await loadInvestisseurs();
    } finally {
      setRefreshing(false);
    }
  };

  const loadInvestisseurs = () => {
    const params = {
      page: currentPage,
      per_page: pageSize,
      search: searchText,
      ...filters,
      ...advancedFilters
    };
    dispatch(getInvestisseurs(params));
  };

  // Charger les investisseurs au chargement et lors des changements de filtres/pagination
  useEffect(() => {
    loadInvestisseurs();
  }, [currentPage, pageSize, filters, advancedFilters, searchText, refreshTrigger]);

  // Charger TOUS les investisseurs pour les statistiques (sans pagination)
  useEffect(() => {
    const fetchAllInvestisseurs = async () => {
      try {
        const allParams = {
          per_page: 9999,
          search: searchText,
          ...filters,
          ...advancedFilters
        };
        const result = await dispatch(getInvestisseurs(allParams));
        if (result.payload && result.payload.data) {
          const investisseursData = Array.isArray(result.payload.data)
            ? result.payload.data
            : result.payload.data.data || [];
          setAllInvestisseurs(investisseursData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de tous les investisseurs:', error);
        setAllInvestisseurs([]);
      }
    };

    fetchAllInvestisseurs();
  }, [filters, advancedFilters, searchText, refreshTrigger]);

  // Gestion des succès/erreurs d'opération
  useEffect(() => {
    if (operation.success && operation.type === 'delete') {
      message.success('Investisseur supprimé avec succès');
      setSelectedRows([]);
      setSelectedRowKeys([]);
      setRefreshTrigger(prev => prev + 1);
    } else if (operation.success && operation.type === 'update_status') {
      message.success('Statut mis à jour avec succès');
      setRefreshTrigger(prev => prev + 1);
    } else if (operation.success && operation.type === 'convert_to_project') {
      message.success('Investisseur converti en projet avec succès');
      setRefreshTrigger(prev => prev + 1);
    } else if (operation.error) {
      message.error(operation.error);
    }
  }, [operation]);

  // Fonctions
  const showDeleteConfirm = (id, name) => {
    confirm({
      title: `Êtes-vous sûr de vouloir supprimer l'investisseur ${name}?`,
      icon: <ExclamationCircleOutlined />,
      content: 'Cette action est irréversible.',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk() {
        dispatch(deleteInvestisseur(id));
      }
    });
  };

  const handleStatusChange = (id, newStatus) => {
    dispatch(updateInvestisseurStatus({ id, statut: newStatus }));
  };

  const handleAddNew = () => {
    navigate('/investisseurs/create');
  };

  const handleEdit = (id) => {
    navigate(`/investisseurs/${id}/edit`);
  };

  const handleView = (id) => {
    navigate(`/investisseurs/${id}`);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const resetAllFilters = () => {
    setFilters({});
    setAdvancedFilters({});
    setSearchText('');
    setCurrentPage(1);
  };

  const handleTableChange = (paginationTable, tableFilters, sorter) => {
    setCurrentPage(paginationTable.current);
    setPageSize(paginationTable.pageSize);

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
      message.warning('Veuillez sélectionner au moins un investisseur');
      return;
    }

    if (action === 'delete') {
      confirm({
        title: `Supprimer ${selectedRows.length} investisseur(s)?`,
        icon: <ExclamationCircleOutlined />,
        content: 'Cette action est irréversible.',
        okText: 'Oui',
        okType: 'danger',
        cancelText: 'Non',
        onOk() {
          message.success(`${selectedRows.length} investisseurs supprimés`);
          setSelectedRows([]);
          setSelectedRowKeys([]);
          setRefreshTrigger(prev => prev + 1);
        }
      });
    } else if (action.startsWith('status:')) {
      const newStatus = action.split(':')[1];
      message.success(`Statut mis à jour pour ${selectedRows.length} investisseurs`);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  // Rendu du statut avec un tag coloré
  const renderStatus = (statut) => {
    let color, text, icon;
    switch (statut) {
      case 'actif':
        color = 'green';
        text = 'Actif';
        icon = <CheckCircleOutlined />;
        break;
      case 'negociation':
        color = 'orange';
        text = 'Négociation';
        icon = <DollarOutlined />;
        break;
      case 'engagement':
        color = 'blue';
        text = 'Engagement';
        icon = <AuditOutlined />;
        break;
      case 'finalisation':
        color = 'cyan';
        text = 'Finalisation';
        icon = <ClockCircleOutlined />;
        break;
      case 'investi':
        color = 'purple';
        text = 'Investi';
        icon = <TrophyOutlined />;
        break;
      case 'suspendu':
        color = 'volcano';
        text = 'Suspendu';
        icon = <PauseCircleOutlined />;
        break;
      case 'inactif':
        color = 'default';
        text = 'Inactif';
        icon = <CloseCircleOutlined />;
        break;
      default:
        color = 'default';
        text = statut || 'Inconnu';
        icon = null;
    }
    return <Tag color={color} icon={icon}>{text}</Tag>;
  };

  // Formater la valeur monétaire
  const formatMoney = (value, devise = 'EUR') => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: devise
    }).format(value);
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
          className="investisseur-name-cell"
          whileHover={{ x: 5 }}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <Avatar
            size="small"
            icon={<FundOutlined />}
            style={{
              marginRight: 8,
              backgroundColor: '#722ed1'
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
        <motion.div whileHover={{ x: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <MailOutlined style={{ marginRight: 6, color: '#1890ff' }} />
            {record.email || 'N/A'}
          </div>
          {record.telephone && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <PhoneOutlined style={{ marginRight: 6, color: '#52c41a' }} />
              {record.telephone}
            </div>
          )}
        </motion.div>
      )
    },
    {
      title: 'Secteur d\'intérêt',
      key: 'secteur_interet',
      render: (_, record) => (
        <motion.div whileHover={{ x: 3 }}>
          <GlobalOutlined style={{ marginRight: 6, color: '#13c2c2' }} />
          {record.secteur?.name || 'N/A'}
        </motion.div>
      )
    },
    {
      title: 'Capacité d\'investissement',
      key: 'capacite_investissement',
      render: (_, record) => (
        <motion.div whileHover={{ scale: 1.05 }}>
          <DollarOutlined style={{ marginRight: 6, color: '#722ed1' }} />
          <Text strong style={{ color: '#722ed1' }}>
            {formatMoney(record.montant_investissement, record.devise)}
          </Text>
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
                  key="actif"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, 'actif')}
                  disabled={record.statut === 'actif'}
                >
                  Actif
                </Menu.Item>
                <Menu.Item
                  key="negociation"
                  icon={<DollarOutlined />}
                  onClick={() => handleStatusChange(record.id, 'negociation')}
                  disabled={record.statut === 'negociation'}
                >
                  Négociation
                </Menu.Item>
                <Menu.Item
                  key="engagement"
                  icon={<AuditOutlined />}
                  onClick={() => handleStatusChange(record.id, 'engagement')}
                  disabled={record.statut === 'engagement'}
                >
                  Engagement
                </Menu.Item>
                <Menu.Item
                  key="finalisation"
                  icon={<ClockCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, 'finalisation')}
                  disabled={record.statut === 'finalisation'}
                >
                  Finalisation
                </Menu.Item>
                <Menu.Item
                  key="investi"
                  icon={<TrophyOutlined />}
                  onClick={() => handleStatusChange(record.id, 'investi')}
                  disabled={record.statut === 'investi'}
                >
                  Investi
                </Menu.Item>
                <Menu.Item
                  key="suspendu"
                  icon={<PauseCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, 'suspendu')}
                  disabled={record.statut === 'suspendu'}
                >
                  Suspendu
                </Menu.Item>
                <Menu.Item
                  key="inactif"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, 'inactif')}
                  disabled={record.statut === 'inactif'}
                >
                  Inactif
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
          background: 'linear-gradient(135deg, #722ed1 0%, #eb2f96 100%)',
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
              {/* Breadcrumb Navigation */}
            

              <Title level={1} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
                <FundOutlined style={{ marginRight: '16px' }} />
                Gestion des Investisseurs
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: '8px 0 0 0' }}>
                Suivi et gestion de tous les investisseurs potentiels
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
              
              </Space>
            </motion.div>
          </Col>
        </Row>
      </motion.div>

    

      {/* Statistiques principales */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<FundOutlined />}
            title="Total"
            value={stats.total}
            color="#722ed1"
            loading={loading}
            delay={0}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<CheckCircleOutlined />}
            title="Actifs"
            value={stats.actif}
            color="#52c41a"
            loading={loading}
            delay={1}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<DollarOutlined />}
            title="Négociation"
            value={stats.negociation}
            color="#faad14"
            loading={loading}
            delay={2}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<AuditOutlined />}
            title="Engagement"
            value={stats.engagement}
            color="#1890ff"
            loading={loading}
            delay={3}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<TrophyOutlined />}
            title="Investis"
            value={stats.investi}
            color="#722ed1"
            loading={loading}
            delay={4}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<SafetyOutlined />}
            title="Convertis"
            value={stats.converti}
            color="#13c2c2"
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
            <Col xs={24} sm={8} md={6}>
              <Search
                placeholder="Rechercher un investisseur..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onSearch={handleSearch}
                style={{ borderRadius: '8px' }}
                prefix={<SearchOutlined style={{ color: '#722ed1' }} />}
              />
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Select
                style={{ width: '100%', borderRadius: '8px' }}
                placeholder="Filtrer par statut"
                allowClear
                onChange={(value) => handleFilterChange('statut', value)}
                value={filters.statut}
              >
                <Option value="actif">Actif</Option>
                <Option value="negociation">Négociation</Option>
                <Option value="engagement">Engagement</Option>
                <Option value="finalisation">Finalisation</Option>
                <Option value="investi">Investi</Option>
                <Option value="suspendu">Suspendu</Option>
                <Option value="inactif">Inactif</Option>
                <Option value="converti">Converti</Option>
              </Select>
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Select
                style={{ width: '100%', borderRadius: '8px' }}
                placeholder="Filtrer par secteur"
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
            <Col xs={24} sm={24} md={6} style={{ textAlign: screens.md ? 'right' : 'left' }}>
              <Space>
             
                <Segmented
                  value={viewMode}
                  onChange={setViewMode}
                  options={[
                    {
                      value: 'table',
                      label: 'Tableau',
                      icon: <BarsOutlined />,
                    },
                    {
                      value: 'cards',
                      label: 'Cards',
                      icon: <AppstoreOutlined />,
                      
                    },
                  ]}
                />
              </Space>
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
                    {selectedRows.length} investisseur(s) sélectionné(s)
                  </Text>
                </Col>
                <Col>
                  <Dropdown
                    overlay={
                      <Menu onClick={({ key }) => handleBatchAction(key)}>
                        <Menu.SubMenu key="status" title="Changer le statut">
                          <Menu.Item key="status:actif">Actif</Menu.Item>
                          <Menu.Item key="status:negociation">Négociation</Menu.Item>
                          <Menu.Item key="status:engagement">Engagement</Menu.Item>
                          <Menu.Item key="status:finalisation">Finalisation</Menu.Item>
                          <Menu.Item key="status:investi">Investi</Menu.Item>
                          <Menu.Item key="status:suspendu">Suspendu</Menu.Item>
                          <Menu.Item key="status:inactif">Inactif</Menu.Item>
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
                dataSource={safeInvestisseurs}
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
                    <SyncOutlined style={{ fontSize: '32px', color: '#722ed1' }} />
                  </motion.div>
                </div>
              ) : safeInvestisseurs && safeInvestisseurs.length > 0 ? (
                <Row gutter={[24, 24]}>
                  {safeInvestisseurs.map((investisseur, index) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={investisseur.id}>
                      <AnimatedInvestisseurCard
                        investisseur={investisseur}
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
                    description="Aucun investisseur trouvé" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </motion.div>
              )}
              
              {/* Pagination pour le mode cartes */}
              {safeInvestisseurs && safeInvestisseurs.length > 0 && (
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

        .investisseur-card-modern {
          transition: all 0.3s ease;
        }

        .investisseur-card-modern:hover {
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

        /* Styles pour les cartes d'investisseur */
        .investisseur-card-modern .ant-card-actions {
          background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
          border-top: 1px solid #e8e8e8;
        }

        .investisseur-card-modern .ant-card-meta-title {
          font-size: 18px;
          font-weight: 600;
        }        
 `}</style>
    </div>
  );
};

export default InvestisseursList;
