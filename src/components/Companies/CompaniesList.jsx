import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Table, Tag, Button, Space, Typography, Row, Col, Select, Input, 
  Tooltip, message, Modal, Badge, Alert, Avatar, Progress, Card,
  Statistic, Skeleton, Empty, Divider, Grid, Upload
} from 'antd';
import { 
  BankOutlined, SearchOutlined, FilterOutlined, ClearOutlined,
  EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined,
  UserOutlined, MailOutlined, PhoneOutlined, GlobalOutlined,
  TeamOutlined, RiseOutlined, FallOutlined, ReloadOutlined,
  ExportOutlined, SettingOutlined, SyncOutlined, FireOutlined,
  ArrowUpOutlined, ArrowDownOutlined, ThunderboltOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined, ClockCircleOutlined,
  ApartmentOutlined, DollarOutlined, TrophyOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fetchCompanies, 
  deleteCompany, 
  resetOperation,
  updateFilters,
  clearFilters,
  fetchCompaniesStats,
  updateCompanyPipelineStage
} from '../../features/companiesSlice';

const { Search } = Input;
const { Option } = Select;
const { Title, Paragraph, Text } = Typography;
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

// Composant de carte animée
const AnimatedCard = ({ title, children, loading, extra, delay = 0, style = {} }) => {
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
          height: '100%',
          borderRadius: '16px',
          border: '1px solid #f0f0f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          ...style
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

const CompaniesList = ({ onEdit }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  
  const { 
    companies, 
    statistics, 
    filters, 
    loading, 
    statsLoading,
    error, 
    operation 
  } = useSelector(state => state.companies);

  // États locaux
  const [localFilters, setLocalFilters] = useState({
    statut: 'all',
    type: 'all',
    secteur_id: 'all',
    proprietaire_id: 'all'
  });
  
  const [searchText, setSearchText] = useState('');
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

  // Chargement initial
  useEffect(() => {
    loadData();
  }, []);

  // Gestion des opérations
  useEffect(() => {
    if (operation.success) {
      switch (operation.type) {
        case 'delete':
          message.success('Entreprise supprimée avec succès');
          loadData();
          break;
        case 'updateStage':
          message.success('Étape de pipeline mise à jour avec succès');
          loadData();
          break;
        default:
          message.success('Opération réussie');
      }
      dispatch(resetOperation());
    } else if (operation.error) {
      message.error(`Erreur: ${operation.error}`);
      dispatch(resetOperation());
    }
  }, [operation, dispatch]);

  // Fonction pour construire les paramètres de filtre
  const buildFilterParams = (additionalParams = {}) => {
    const filterParams = { ...additionalParams };
    
    if (localFilters.statut && localFilters.statut !== 'all') {
      filterParams.statut = localFilters.statut;
    }
    
    if (localFilters.type && localFilters.type !== 'all') {
      filterParams.type = localFilters.type;
    }
    
    if (localFilters.secteur_id && localFilters.secteur_id !== 'all') {
      filterParams.secteur_id = localFilters.secteur_id;
    }
    
    if (localFilters.proprietaire_id && localFilters.proprietaire_id !== 'all') {
      filterParams.proprietaire_id = localFilters.proprietaire_id;
    }
    
    if (searchText && searchText.trim() !== '') {
      filterParams.nom = searchText.trim();
    }
    
    if (!filterParams.page) {
      filterParams.page = 1;
    }
    
    if (!filterParams.per_page) {
      filterParams.per_page = 15;
    }
    
    filterParams.page = parseInt(filterParams.page) || 1;
    filterParams.per_page = parseInt(filterParams.per_page) || 15;
    
    return filterParams;
  };

  // Appliquer les filtres
  const applyFilters = () => {
    const filterParams = buildFilterParams({ 
      page: 1,
      per_page: companies?.per_page || 15 
    });
    dispatch(updateFilters(filterParams));
    dispatch(fetchCompanies(filterParams));
  };

  // Effacer les filtres
  const handleClearFilters = () => {
    setLocalFilters({
      statut: 'all',
      type: 'all',
      secteur_id: 'all',
      proprietaire_id: 'all'
    });
    setSearchText('');
    dispatch(clearFilters());
    
    const cleanParams = {
      page: 1,
      per_page: companies?.per_page || 15,
      sort_by: 'created_at',
      sort_direction: 'desc'
    };
    
    dispatch(fetchCompanies(cleanParams));
  };

  // Fonction pour gérer le changement de page
  const handlePaginationChange = (page, pageSize) => {
    const paginationParams = buildFilterParams({
      page: page,
      per_page: pageSize
    });
    dispatch(fetchCompanies(paginationParams));
  };

  // Recherche
  const handleSearch = (value) => {
    setSearchText(value);
    if (value && value.trim() !== '') {
      const searchParams = buildFilterParams({ 
        page: 1,
        nom: value.trim()
      });
      dispatch(fetchCompanies(searchParams));
    }
  };

  // Navigation vers les détails
  const handleViewDetails = (record) => {
    navigate(`/companies/${record.id}`);
  };

  // Modifier une entreprise
  const handleEdit = (record) => {
    navigate(`/companies/edit/${record.id}`);
  };

  // Supprimer une entreprise
  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Supprimer cette entreprise ?',
      content: 'Cette action est irréversible.',
      okText: 'Oui, supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => dispatch(deleteCompany(id))
    });
  };
  const CompanyAvatar = ({ logo, name, size = 40 }) => {
    const [imageError, setImageError] = useState(false);
    
    const handleImageError = () => {
      setImageError(true);
    };
  
    // Construire l'URL du logo
    const getLogoUrl = (logoPath) => {
      if (!logoPath) return null;
      
      // Si c'est déjà une URL complète (http/https)
      if (logoPath.startsWith('http')) {
        return logoPath;
      }
      
      // Si c'est un chemin relatif, construire l'URL complète
      const baseUrl = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000';
      return `${baseUrl}/storage/${logoPath}`;
    };
  
    const logoUrl = getLogoUrl(logo);
    return (
        <Avatar 
          size={size}
          src={logoUrl && !imageError ? logoUrl : null}
          icon={(!logoUrl || imageError) ? <ApartmentOutlined /> : null}
          alt={name}
          onError={handleImageError}
          style={{ 
            backgroundColor: (!logoUrl || imageError) ? '#1890ff' : 'transparent',
            borderRadius: '8px',
            border: (logoUrl && !imageError) ? '1px solid #f0f0f0' : 'none',
            objectFit: 'cover'
          }}
        />
      );
    };
    

  // Mettre à jour l'étape de pipeline
  const handleUpdatePipeline = (id, stageId) => {
    dispatch(updateCompanyPipelineStage({ id, pipeline_stage_id: stageId }));
  };

  // Chargement des données
  const loadData = async () => {
    setRefreshing(true);
    try {
      const params = {
        page: 1,
        per_page: 15,
        sort_by: 'created_at',
        sort_direction: 'desc'
      };
      await Promise.all([
        dispatch(fetchCompanies(params)),
        dispatch(fetchCompaniesStats())
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      message.error('Erreur lors du chargement des données');
    } finally {
      setRefreshing(false);
    }
  };

  // Données filtrées
  const filteredData = useMemo(() => {
    const data = companies?.data || [];
    
    if (!searchText || searchText.trim() === '') return data;
    
    const search = searchText.toLowerCase();
    return data.filter(item => {
      return (
        item.nom?.toLowerCase().includes(search) ||
        item.email?.toLowerCase().includes(search) ||
        item.proprietaire?.name?.toLowerCase().includes(search)
      );
    });
  }, [companies, searchText]);

  // Configuration des colonnes du tableau
  const columns = [
    {
        title: 'Entreprise',
        key: 'company',
        width: 250,
        render: (_, record) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CompanyAvatar 
              logo={record.logo}
              name={record.nom}
              size={40}
            />
            <div>
              <Button 
                type="link" 
                style={{ 
                  padding: 0, 
                  height: 'auto', 
                  fontWeight: 'bold',
                  fontSize: '14px',
                  textAlign: 'left'
                }}
                onClick={() => handleViewDetails(record)}
              >
                {record.nom}
              </Button>
              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                {record.email}
              </div>
            </div>
          </div>
        ),
      },
      
    {
      title: 'Secteur',
      dataIndex: ['secteur', 'name'],
      key: 'secteur',
      width: 150,
      render: (secteur) => (
        <Tag color="blue" style={{ borderRadius: '6px' }}>
          {secteur || 'Non défini'}
        </Tag>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => {
        const colors = {
          'PME': 'green',
          'Grande entreprise': 'purple',
          'Startup': 'orange',
          'Autre': 'gray'
        };
        return (
          <Tag color={colors[type]} style={{ borderRadius: '6px' }}>
            {type || 'Non défini'}
          </Tag>
        );
      },
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      width: 120,
      render: (statut) => {
        const colors = {
          'actif': 'green',
          'inactif': 'red',
          'suspendu': 'orange',
          'en_attente': 'blue'
        };
        const labels = {
          'actif': 'Actif',
          'inactif': 'Inactif',
          'suspendu': 'Suspendu',
          'en_attente': 'En attente'
        };
        return (
          <Tag color={colors[statut]} style={{ borderRadius: '6px' }}>
            {labels[statut] || statut}
          </Tag>
        );
      },
    },
    {
      title: 'Propriétaire',
      key: 'proprietaire',
      width: 150,
      render: (_, record) => (
        record.proprietaire ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Avatar size="small" icon={<UserOutlined />} />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 500 }}>
                {record.proprietaire.name}
              </div>
              <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
                {record.proprietaire.email}
              </div>
            </div>
          </div>
        ) : (
          <Text type="secondary">Non assigné</Text>
        )
      ),
    },
    // {
    //   title: 'Contacts',
    //   key: 'contacts',
    //   width: 100,
    //   render: (_, record) => (
    //     <div style={{ textAlign: 'center' }}>
    //       <Badge 
    //         count={record.contacts_count || 0} 
    //         style={{ backgroundColor: '#52c41a' }}
    //       />
    //       <div style={{ fontSize: '11px', color: '#8c8c8c', marginTop: '2px' }}>
    //         contacts
    //       </div>
    //     </div>
    //   ),
    // },
    // {
    //   title: 'Projets',
    //   key: 'projets',
    //   width: 100,
    //   render: (_, record) => (
    //     <div style={{ textAlign: 'center' }}>
    //       <Badge 
    //         count={record.projets_count || 0} 
    //         style={{ backgroundColor: '#1890ff' }}
    //       />
    //       <div style={{ fontSize: '11px', color: '#8c8c8c', marginTop: '2px' }}>
    //         projets
    //       </div>
    //     </div>
    //   ),
    // },
    {
      title: 'Créé le',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString('fr-FR'),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Voir les détails">
            <Button 
              icon={<EyeOutlined />} 
              type="default"
              size="small"
              style={{ 
                borderRadius: '6px',
                borderColor: '#1890ff',
                color: '#1890ff'
              }}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          
          <Tooltip title="Modifier">
            <Button 
              icon={<EditOutlined />} 
              size="small"
              style={{ 
                borderRadius: '6px',
                borderColor: '#faad14',
                color: '#faad14'
              }}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          
          <Tooltip title="Supprimer">
            <Button 
              icon={<DeleteOutlined />} 
              danger
              size="small"
              style={{ borderRadius: '6px' }}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

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
                <BankOutlined style={{ marginRight: '16px' }} />
                Gestion des Entreprises
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: '8px 0 0 0' }}>
                Vue d'ensemble et gestion des entreprises partenaires
                <Badge 
                  count={statistics?.total || 0} 
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
          
          <Col>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/companies/create')}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '8px'
                  }}
                >
                  Nouvelle Entreprise
                </Button>
                
              
              </Space>
            </motion.div>
          </Col>
        </Row>
      </motion.div>
      
      {/* Cartes de statistiques */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<BankOutlined />}
            title="Total Entreprises"
            value={statistics?.total || 0}
            color="#1890ff"
            loading={statsLoading}
            delay={0}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<CheckCircleOutlined />}
            title="Actives"
            value={statistics?.par_statut?.find(s => s.statut === 'actif')?.count || 0}
            color="#52c41a"
            loading={statsLoading}
            delay={1}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<ClockCircleOutlined />}
            title="En Attente"
            value={statistics?.par_statut?.find(s => s.statut === 'en_attente')?.count || 0}
            color="#faad14"
            loading={statsLoading}
            delay={2}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<ExclamationCircleOutlined />}
            title="Suspendues"
            value={statistics?.par_statut?.find(s => s.statut === 'suspendu')?.count || 0}
            color="#ff4d4f"
            loading={statsLoading}
            delay={3}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<ThunderboltOutlined />}
            title="Nouvelles (30j)"
            value={statistics?.nouveaux || 0}
            color="#722ed1"
            loading={statsLoading}
            delay={4}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<TeamOutlined />}
            title="Avec Propriétaire"
            value={statistics?.par_proprietaire?.length || 0}
            color="#fa8c16"
            loading={statsLoading}
            delay={5}
          />
        </Col>
      </Row>
      
      {/* Filtres et recherche */}
      <AnimatedCard 
        title="Filtres et Recherche"
        delay={1}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} lg={6}>
            <Search
              placeholder="Rechercher une entreprise"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              style={{ width: '100%' }}
              prefix={<SearchOutlined />}
            />
          </Col>
          
          <Col xs={12} sm={6} lg={3}>
            <Select 
              value={localFilters.statut}
              style={{ width: '100%' }} 
              onChange={(value) => setLocalFilters({...localFilters, statut: value})}
              placeholder="Statut"
            >
              <Option value="all">Tous les statuts</Option>
              <Option value="actif">Actif</Option>
              <Option value="inactif">Inactif</Option>
              <Option value="suspendu">Suspendu</Option>
              <Option value="en_attente">En attente</Option>
            </Select>
          </Col>
          
          <Col xs={12} sm={6} lg={3}>
            <Select 
              value={localFilters.type}
              style={{ width: '100%' }} 
              onChange={(value) => setLocalFilters({...localFilters, type: value})}
              placeholder="Type"
            >
              <Option value="all">Tous les types</Option>
              <Option value="PME">PME</Option>
              <Option value="Grande entreprise">Grande entreprise</Option>
              <Option value="Startup">Startup</Option>
              <Option value="Autre">Autre</Option>
            </Select>
          </Col>
          
          <Col xs={12} sm={6} lg={3}>
            <Select 
              value={localFilters.secteur_id}
              style={{ width: '100%' }} 
              onChange={(value) => setLocalFilters({...localFilters, secteur_id: value})}
              placeholder="Secteur"
            >
              <Option value="all">Tous les secteurs</Option>
              {/* Les options seront chargées dynamiquement */}
            </Select>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <Select 
              value={localFilters.proprietaire_id}
              style={{ width: '100%' }} 
              onChange={(value) => setLocalFilters({...localFilters, proprietaire_id: value})}
              placeholder="Propriétaire"
            >
              <Option value="all">Tous</Option>
              {/* Les options seront chargées dynamiquement */}
            </Select>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Space style={{ width: '100%' }}>
              <Button 
                type="primary" 
                icon={<FilterOutlined />} 
                onClick={applyFilters}
                style={{ borderRadius: '8px' }}
              >
                Filtrer
              </Button>
              
              <Button 
                icon={<ClearOutlined />} 
                onClick={handleClearFilters}
                style={{ borderRadius: '8px' }}
              >
                Effacer
              </Button>

             
            </Space>
          </Col>
        </Row>
      </AnimatedCard>
      
      {/* Table des entreprises */}
      <div style={{ marginTop: '24px' }}>
        <AnimatedCard 
          title="Liste des Entreprises"
          delay={2}
          extra={
            <Space>
              <Text type="secondary">
                {companies?.total || 0} entreprise(s)
              </Text>
            </Space>
          }
        >
          <Table 
            columns={columns} 
            dataSource={filteredData}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1400 }}
            style={{ 
              borderRadius: '12px', 
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}
            pagination={{
              current: companies?.current_page || 1,
              pageSize: companies?.per_page || 15,
              total: companies?.total || 0,
            //   showSizeChanger: true,
            //   showQuickJumper: true,
            //   showTotal: (total, range) => 
            //     `${range[0]}-${range[1]} sur ${total} entreprises`,
            //   onChange: handlePaginationChange,
            //   onShowSizeChange: handlePaginationChange,
              style: { padding: '16px' },
              pageSizeOptions: ['10', '15', '20', '50', '100'],
              showLessItems: true,
              hideOnSinglePage: false
            }}
            rowClassName={(record) => 
              record.statut === 'inactif' ? 'inactive-row' : 
              record.statut === 'suspendu' ? 'suspended-row' : ''
            }
          />
        </AnimatedCard>
      </div>

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

        .inactive-row {
          background-color: #fff2f0 !important;
          border-left: 4px solid #ff4d4f !important;
        }

        .suspended-row {
          background-color: #fff7e6 !important;
          border-left: 4px solid #fa8c16 !important;
        }

        .ant-table-tbody > tr.inactive-row:hover > td {
          background-color: #ffe7e6 !important;
        }

        .ant-table-tbody > tr.suspended-row:hover > td {
          background-color: #fff0e0 !important;
        }

        /* Style spécial pour les noms d'entreprises cliquables */
        .ant-btn-link {
          padding: 0 !important;
          height: auto !important;
          border: none !important;
          box-shadow: none !important;
        }

        .ant-btn-link:hover {
          color: #40a9ff !important;
          text-decoration: underline;
        }

        .ant-btn-link:focus {
          color: #40a9ff !important;
          text-decoration: underline;
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
          border-radius: 4px;
        }

        /* Effet de parallaxe pour le header */
        .header-background {
          background-attachment: fixed;
        }

        /* Styles pour la table responsive */
        .ant-table-wrapper {
          border-radius: 12px;
          overflow: hidden;
        }

        .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%);
          border: none;
          color: #262626;
          font-weight: 600;
          padding: 16px;
        }

        .ant-table-tbody > tr > td {
          border: none;
          padding: 16px;
        }

        .ant-table-tbody > tr {
          transition: all 0.2s ease;
        }

        .ant-table-tbody > tr:hover > td {
          background-color: #f8f9ff !important;
          transform: scale(1.005);
        }

        /* Animations pour les tags */
        .ant-tag {
          border-radius: 6px;
          font-weight: 500;
          font-size: 12px;
          padding: 2px 8px;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        /* Animations pour les boutons */
        .ant-btn {
          transition: all 0.2s ease;
        }

        .ant-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        /* Styles spécifiques pour les boutons d'action */
        .ant-btn[style*="border-color: #1890ff"] {
          background-color: transparent;
        }

        .ant-btn[style*="border-color: #1890ff"]:hover {
          background-color: #e6f7ff;
          border-color: #40a9ff;
          color: #40a9ff;
        }

        .ant-btn[style*="border-color: #faad14"] {
          background-color: transparent;
        }

        .ant-btn[style*="border-color: #faad14"]:hover {
          background-color: #fff7e6;
          border-color: #ffc53d;
          color: #ffc53d;
        }

        /* Styles pour les avatars d'entreprises */
        .ant-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Styles pour les badges de compteurs */
        .ant-badge {
          font-size: 11px;
        }

        .ant-badge-count {
          min-width: 16px;
          height: 16px;
          line-height: 16px;
          font-size: 10px;
        }
      `}</style>
    </motion.div>
  );
};

export default CompaniesList;