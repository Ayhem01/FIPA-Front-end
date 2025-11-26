import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; 
import { 
  Table, Tag, Button, Space, Typography, Row, Col, Select, Input, 
  Tooltip, message, Modal, Badge, Alert
} from 'antd';
import { 
  AlertOutlined, SearchOutlined, FilterOutlined, ClearOutlined,
  EditOutlined, DeleteOutlined, CheckCircleOutlined, 
  ExclamationCircleOutlined, ThunderboltOutlined, WarningOutlined,
  UserOutlined, EyeOutlined 
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { 
  fetchBlockagesAdmin, 
  deleteBlockage, 
  resolveBlockage, 
  resetOperation,
  updateFilters,
  clearFilters
} from '../../features/blockageSlice';
import AnimatedCard from '../Common/AnimatedCard.jsx';
import AnimatedStatCard from '../Common/AnimatedStatCard.jsx';
import BlockageForm from './BlockageForm';

const { Search } = Input;
const { Option } = Select;
const { Title, Paragraph, Text } = Typography;

const BlockageList = ({ onEdit }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Ajouté pour la navigation
  
  const { 
    adminBlockages, 
    statistics, 
    filters, 
    loading, 
    error, 
    operation 
  } = useSelector(state => state.blockages);

  // États locaux
  const [localFilters, setLocalFilters] = useState({
    status: 'all',
    priority: 'all',
    blockage_type: 'all',
    blockable_type: 'all',
    is_escalated: 'all'
  });
  
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // NOUVEAUX ÉTATS POUR LA MODIFICATION
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedBlockage, setSelectedBlockage] = useState(null);

  // Animation variants
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
          message.success('Blocage supprimé avec succès');
          loadData();
          break;
        case 'resolve':
          message.success('Blocage résolu avec succès');
          loadData();
          break;
        case 'update':
          message.success('Blocage modifié avec succès');
          // Recharger les données après modification
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
  

  const handleViewDetails = (record) => {
    console.log('Navigation vers les détails du blocage:', record.id);
    navigate(`/blockage/${record.id}`);
  };

  // Fonction pour construire les paramètres de filtre
  const buildFilterParams = (additionalParams = {}) => {
    const filterParams = { ...additionalParams };
    
    // Validation et nettoyage des paramètres
    if (localFilters.status && localFilters.status !== 'all') {
      filterParams.status = localFilters.status;
    }
    
    if (localFilters.priority && localFilters.priority !== 'all') {
      filterParams.priority = localFilters.priority;
    }
    
    if (localFilters.blockage_type && localFilters.blockage_type !== 'all') {
      filterParams.blockage_type = localFilters.blockage_type;
    }
    
    if (localFilters.blockable_type && localFilters.blockable_type !== 'all') {
      filterParams.blockable_type = localFilters.blockable_type;
    }
    
    // Gestion spéciale pour is_escalated
    if (localFilters.is_escalated && localFilters.is_escalated !== 'all') {
      filterParams.is_escalated = localFilters.is_escalated === 'true' ? 1 : 0;
    }
    
    // Recherche
    if (searchText && searchText.trim() !== '') {
      filterParams.search = searchText.trim();
    }
    
    // Valeurs par défaut pour la pagination
    if (!filterParams.page) {
      filterParams.page = 1;
    }
    
    if (!filterParams.per_page) {
      filterParams.per_page = 15;
    }
    
    // Validation des types
    filterParams.page = parseInt(filterParams.page) || 1;
    filterParams.per_page = parseInt(filterParams.per_page) || 15;
    
    console.log('Paramètres de filtre construits:', filterParams);
    return filterParams;
  };

  // Appliquer les filtres
  const applyFilters = () => {
    console.log('Application des filtres...');
    const filterParams = buildFilterParams({ 
      page: 1,
      per_page: adminBlockages?.per_page || 15 
    });
    dispatch(updateFilters(filterParams));
    dispatch(fetchBlockagesAdmin(filterParams));
  };

  // Effacer les filtres
  const handleClearFilters = () => {
    setLocalFilters({
      status: 'all',
      priority: 'all',
      blockage_type: 'all',
      blockable_type: 'all',
      is_escalated: 'all'
    });
    setSearchText('');
    dispatch(clearFilters());
    
    const cleanParams = {
      page: 1,
      per_page: adminBlockages?.per_page || 15,
      sort_by: 'created_at',
      sort_direction: 'desc'
    };
    
    dispatch(fetchBlockagesAdmin(cleanParams));
  };

  // Fonction pour gérer le changement de page
  const handlePaginationChange = (page, pageSize) => {
    const paginationParams = buildFilterParams({
      page: page,
      per_page: pageSize
    });
    dispatch(fetchBlockagesAdmin(paginationParams));
  };

  // Recherche
  const handleSearch = (value) => {
    setSearchText(value);
    if (value && value.trim() !== '') {
      const searchParams = buildFilterParams({ 
        page: 1,
        search: value.trim()
      });
      dispatch(fetchBlockagesAdmin(searchParams));
    }
  };

  // NOUVELLE FONCTION POUR OUVRIR LE MODAL DE MODIFICATION
  const handleEdit = (record) => {
    console.log('Modification du blocage:', record);
    setSelectedBlockage(record);
    setEditModalVisible(true);
  };

  // FONCTION POUR FERMER LE MODAL
  const handleEditCancel = () => {
    setEditModalVisible(false);
    setSelectedBlockage(null);
    
    // Recharger les données après modification
    const currentParams = buildFilterParams({
      page: adminBlockages?.current_page || 1,
      per_page: adminBlockages?.per_page || 15
    });
    dispatch(fetchBlockagesAdmin(currentParams));
  };

  // Résoudre un blocage
  const handleResolve = (id) => {
    Modal.confirm({
      title: 'Résoudre ce blocage ?',
      content: 'Cette action marquera le blocage comme résolu.',
      okText: 'Oui, résoudre',
      cancelText: 'Annuler',
      onOk: () => dispatch(resolveBlockage(id))
    });
  };

  // Supprimer un blocage
  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Supprimer ce blocage ?',
      content: 'Cette action est irréversible.',
      okText: 'Oui, supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => dispatch(deleteBlockage(id))
    });
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
      await dispatch(fetchBlockagesAdmin(params));
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      message.error('Erreur lors du chargement des données');
    } finally {
      setRefreshing(false);
    }
  };

  // Données filtrées
  const filteredData = useMemo(() => {
    const data = adminBlockages?.data || [];
    
    if (!searchText || searchText.trim() === '') return data;
    
    const search = searchText.toLowerCase();
    return data.filter(item => {
      return (
        item.name?.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search) ||
        item.assigned_user?.name?.toLowerCase().includes(search)
      );
    });
  }, [adminBlockages, searchText]);

  // Configuration des colonnes du tableau
  const columns = [
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (text, record) => (
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
            {text}
          </Button>
          {record.is_escalated && (
            <Tag color="red" size="small" style={{ marginLeft: 8 }}>
              Escaladé
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      ellipsis: true,
    },
    {
      title: 'Type',
      dataIndex: 'blockage_type',
      key: 'blockage_type',
      width: 120,
      render: (type) => {
        const colors = {
          process: 'blue',
          data: 'green',
          technical: 'orange',
          other: 'gray'
        };
        const labels = {
          process: 'Processus',
          data: 'Données',
          technical: 'Technique',
          other: 'Autre'
        };
        return (
          <Tag color={colors[type]} style={{ borderRadius: '6px' }}>
            {labels[type] || type}
          </Tag>
        );
      },
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const colors = {
          actif: 'orange',
          open: 'orange',
          in_progress: 'blue',
          resolu: 'green',
          resolved: 'green',
          annule: 'red',
          cancelled: 'red'
        };
        const labels = {
          actif: 'Actif',
          open: 'Ouvert',
          in_progress: 'En cours',
          resolu: 'Résolu',
          resolved: 'Résolu',
          annule: 'Annulé',
          cancelled: 'Annulé'
        };
        return (
          <Tag color={colors[status]} style={{ borderRadius: '6px' }}>
            {labels[status] || status}
          </Tag>
        );
      },
    },
    {
      title: 'Priorité',
      dataIndex: 'priority',
      key: 'priority',
      width: 120,
      render: (priority) => {
        const colors = {
          low: 'green',
          medium: 'orange',
          high: 'red',
          critical: 'purple'
        };
        const labels = {
          low: 'Basse',
          medium: 'Moyenne',
          high: 'Haute',
          critical: 'Critique'
        };
        return (
          <Tag color={colors[priority]} style={{ borderRadius: '6px' }}>
            {labels[priority] || priority}
          </Tag>
        );
      },
    },
    {
      title: 'Assigné à',
      key: 'assigned_user',
      width: 150,
      render: (_, record) => (
        record.assigned_user ? (
          <div>
            <UserOutlined style={{ marginRight: 4 }} />
            {record.assigned_user.name}
          </div>
        ) : (
          <Text type="secondary">Non assigné</Text>
        )
      ),
    },
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
      width: 180, // Augmenté pour inclure le nouveau bouton
      render: (_, record) => (
        <Space size="small">
          {/* NOUVEAU BOUTON POUR VOIR LES DÉTAILS */}
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
          
          {['actif', 'open', 'in_progress'].includes(record.status) && (
            <Tooltip title="Marquer comme résolu">
              <Button 
                icon={<CheckCircleOutlined />} 
                type="primary"
                size="small"
                style={{ 
                  borderRadius: '6px',
                  backgroundColor: '#52c41a',
                  borderColor: '#52c41a'
                }}
                onClick={() => handleResolve(record)}
              />
            </Tooltip>
          )}
          
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
    <div className="blockage-container-modern">
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
                <AlertOutlined style={{ marginRight: '16px' }} />
                Gestion des Blocages
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: '8px 0 0 0' }}>
                Vue d'ensemble et gestion des blocages système
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
        </Row>
      </motion.div>
      
      {/* Cartes de statistiques */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<AlertOutlined />}
            title="Total"
            value={statistics?.total || 0}
            color="#1890ff"
            loading={loading}
            delay={0}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<ExclamationCircleOutlined />}
            title="Actifs"
            value={statistics?.by_status?.active || 0}
            color="#ff4d4f"
            loading={loading}
            delay={1}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<CheckCircleOutlined />}
            title="Résolus"
            value={statistics?.by_status?.resolved || 0}
            color="#52c41a"
            loading={loading}
            delay={2}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<ThunderboltOutlined />}
            title="Escaladés"
            value={statistics?.escalated_count || 0}
            color="#fa541c"
            loading={loading}
            delay={3}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<WarningOutlined />}
            title="Critiques"
            value={statistics?.by_priority?.critical || 0}
            color="#722ed1"
            loading={loading}
            delay={4}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<UserOutlined />}
            title="Non assignés"
            value={statistics?.unassigned_count || 0}
            color="#faad14"
            loading={loading}
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
              placeholder="Rechercher un blocage"
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
              value={localFilters.status}
              style={{ width: '100%' }} 
              onChange={(value) => setLocalFilters({...localFilters, status: value})}
              placeholder="Statut"
            >
              <Option value="all">Tous les statuts</Option>
              <Option value="actif">Actif</Option>
              <Option value="open">Ouvert</Option>
              <Option value="in_progress">En cours</Option>
              <Option value="resolu">Résolu</Option>
              <Option value="resolved">Résolu</Option>
              <Option value="annule">Annulé</Option>
              <Option value="cancelled">Annulé</Option>
            </Select>
          </Col>
          
          <Col xs={12} sm={6} lg={3}>
            <Select 
              value={localFilters.priority}
              style={{ width: '100%' }} 
              onChange={(value) => setLocalFilters({...localFilters, priority: value})}
              placeholder="Priorité"
            >
              <Option value="all">Toutes priorités</Option>
              <Option value="low">Basse</Option>
              <Option value="medium">Moyenne</Option>
              <Option value="high">Haute</Option>
              <Option value="critical">Critique</Option>
            </Select>
          </Col>
          
          <Col xs={12} sm={6} lg={3}>
            <Select 
              value={localFilters.blockage_type}
              style={{ width: '100%' }} 
              onChange={(value) => setLocalFilters({...localFilters, blockage_type: value})}
              placeholder="Type"
            >
              <Option value="all">Tous les types</Option>
              <Option value="process">Processus</Option>
              <Option value="data">Données</Option>
              <Option value="technical">Technique</Option>
              <Option value="other">Autre</Option>
            </Select>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <Select 
              value={localFilters.blockable_type}
              style={{ width: '100%' }} 
              onChange={(value) => setLocalFilters({...localFilters, blockable_type: value})}
              placeholder="Entité"
            >
              <Option value="all">Toutes entités</Option>
              <Option value="invite">Invité</Option>
              <Option value="prospect">Prospect</Option>
              <Option value="investisseur">Investisseur</Option>
              <Option value="projet">Projet</Option>
            </Select>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <Select 
              value={localFilters.is_escalated}
              style={{ width: '100%' }} 
              onChange={(value) => setLocalFilters({...localFilters, is_escalated: value})}
              placeholder="Escalade"
            >
              <Option value="all">Tous</Option>
              <Option value="true">Escaladés</Option>
              <Option value="false">Non escaladés</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={12} lg={3}>
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
      
      {/* Table des blocages */}
      <div style={{ marginTop: '24px' }}>
        <AnimatedCard 
          title="Liste des Blocages"
          delay={2}
          extra={
            <Space>
              <Text type="secondary">
                {adminBlockages?.total || 0} blocage(s)
              </Text>
            </Space>
          }
        >
          <Table 
            columns={columns} 
            dataSource={filteredData}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1200 }} // Augmenté pour tenir compte de la nouvelle colonne
            style={{ 
              borderRadius: '12px', 
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}
            pagination={{
              current: adminBlockages?.current_page || 1,
              pageSize: adminBlockages?.per_page || 15,
              total: adminBlockages?.total || 0,
              onChange: handlePaginationChange,
              onShowSizeChange: handlePaginationChange,
              style: { padding: '16px' },
              pageSizeOptions: ['10', '15', '20', '50', '100'],
              showLessItems: true,
              hideOnSinglePage: false
            }}
            rowClassName={(record) => 
              record.is_escalated ? 'escalated-row' : 
              record.priority === 'critical' ? 'critical-row' : ''
            }
          />
        </AnimatedCard>
      </div>

      {/* MODAL DE MODIFICATION UTILISANT BlockageForm */}
      <Modal
        title="Modifier le blocage"
        open={editModalVisible}
        onCancel={handleEditCancel}
        footer={null}
        width={800}
        destroyOnClose
        maskClosable={false}
        style={{ top: 20 }}
      >
        {selectedBlockage && (
          <BlockageForm
            blockage={selectedBlockage}
            onCancel={handleEditCancel}
            entityType={selectedBlockage.blockable_type}
            entityId={selectedBlockage.blockable_id}
            pipelineStageType={selectedBlockage.pipeline_stageable_type}
            pipelineStageId={selectedBlockage.pipeline_stageable_id}
          />
        )}
      </Modal>

      {/* Styles CSS */}
      <style jsx>{`
        .blockage-container-modern {
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

        .escalated-row {
          background-color: #fff2f0 !important;
          border-left: 4px solid #ff4d4f !important;
        }

        .critical-row {
          background-color: #fff7e6 !important;
          border-left: 4px solid #fa8c16 !important;
        }

        .ant-table-tbody > tr.escalated-row:hover > td {
          background-color: #ffe7e6 !important;
        }

        .ant-table-tbody > tr.critical-row:hover > td {
          background-color: #fff0e0 !important;
        }

        /* Style spécial pour les noms de blocage cliquables */
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
          .blockage-container-modern {
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
      `}</style>
    </div>
  );
};

export default BlockageList;