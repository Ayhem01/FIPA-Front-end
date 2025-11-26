import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card, Row, Col, Typography, Tag, Button, Space, Spin,
  Descriptions, Tabs, Table, Statistic, Divider, Tooltip,
  Timeline, Modal, Empty, Breadcrumb, Badge, Avatar, Result,
  Form, Input, Select, Radio, message, Grid, Alert
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, DeleteOutlined, CalendarOutlined,
  FileTextOutlined, UserOutlined, GlobalOutlined, TeamOutlined,
  ClockCircleOutlined, CheckCircleOutlined, InfoCircleOutlined,
  ExclamationCircleOutlined, EnvironmentOutlined, ProfileOutlined,
  PlusOutlined, MailOutlined, PhoneOutlined, FundOutlined, CloseCircleOutlined,
  UserAddOutlined, HomeOutlined, PlayCircleOutlined, SettingOutlined,
  PhoneOutlined as PhoneIcon, QuestionCircleOutlined, SyncOutlined,
  ReloadOutlined, ShareAltOutlined, FireOutlined, ThunderboltOutlined
} from '@ant-design/icons';
import { getActionById, deleteAction, fetchEntreprises, 
  fetchEtapes } from '../../features/marketingSlice';
import { createInvite } from '../../features/inviteSlice';
import moment from 'moment';
import { API_BASE_URL, getAuthHeader } from '../../features/taskSlice';
import { getCurrentUser } from '../../features/userSlice';
import { motion, AnimatePresence } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

// Composant de statistique animée similaire au dashboard
const AnimatedStatCard = ({ icon, title, value, color, loading, delay = 0, prefix = '', suffix = '' }) => {
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
                {prefix}
                <motion.span
                  key={displayValue}
                  initial={{ opacity: 0, y: 10 }}
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

// Composant de carte animée similaire au dashboard
const AnimatedContentCard = ({ title, children, loading, extra, delay = 0, icon }) => {
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
            {icon && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: delay * 0.1 + 0.3 }}
                style={{ color: '#1890ff' }}
              >
                {icon}
              </motion.div>
            )}
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

const ActionDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const screens = useBreakpoint();

  // États pour l'interface
  const [refreshing, setRefreshing] = useState(false);
  
  // Récupération de l'utilisateur courant depuis le Redux store
  const currentUser = useSelector((state) => state.user.user);

  // Récupérer les données depuis le Redux store
  const { selectedItem: action, loading } = useSelector((state) => state.marketing.actions);
  const { items: entreprises, loading: entreprisesLoading } = useSelector((state) => state.marketing.entreprises);
  const { items: etapes, loading: etapesLoading } = useSelector((state) => state.marketing.etapes);
  
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [addInviteModalVisible, setAddInviteModalVisible] = useState(false);
  const [inviteForm] = Form.useForm();
  
  const loadingDependencies = entreprisesLoading || etapesLoading;

  // Charger les détails de l'action
  useEffect(() => {
    loadData();
  }, [dispatch, id]);

  const loadData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(getActionById(id)),
        dispatch(getCurrentUser())
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // Fonction pour charger les données nécessaires pour le formulaire
  const loadFormDependencies = () => {
    dispatch(fetchEntreprises());
    dispatch(fetchEtapes());
  };

  // Ouvrir le modal et charger les données
  const openAddInviteModal = () => {
    inviteForm.resetFields();
    inviteForm.setFieldsValue({
      type_invite: 'externe', 
      statut: 'en_attente',
      action_id: id,
      proprietaire_id: currentUser?.id
    });
    loadFormDependencies();
    setAddInviteModalVisible(true);
  };

  // Gérer la suppression d'une action
  const handleDeleteAction = async () => {
    try {
      await dispatch(deleteAction(id)).unwrap();
      message.success('Action supprimée avec succès');
      navigate('/actions');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      message.error('Impossible de supprimer cette action');
    }
    setDeleteModalVisible(false);
  };

  // Gérer l'ajout d'un invité
  const handleAddInvite = () => {
    inviteForm
      .validateFields()
      .then(values => {
        const inviteData = {
          ...values,
          action_id: id,
          statut: values.statut || 'en_attente',
          proprietaire_id: currentUser?.id
        };

        message.loading('Ajout de l\'invité en cours...', 0.5);
        dispatch(createInvite(inviteData))
          .unwrap()
          .then(() => {
            message.success('Invité ajouté avec succès');
            inviteForm.resetFields();
            setAddInviteModalVisible(false);
            dispatch(getActionById(id));
          })
          .catch(error => {
            console.error('Erreur complète:', error);
            if (error && error.errors) {
              const errorMessages = Object.values(error.errors).flat().join(', ');
              message.error(`Erreur lors de l'ajout: ${errorMessages}`);
            } else {
              message.error(`Erreur lors de l'ajout: ${error.message || error}`);
            }
          });
      })
      .catch(info => {
        console.log('Validation échouée:', info);
      });
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

  const getStatusText = (status) => {
    const statusMap = {
      'planifiee': 'Planifiée',
      'terminee': 'Terminée',
      'annulee': 'Annulée',
      'reportee': 'Reportée',
    };
    return statusMap[status] || status;
  };

  const getTypeIcon = (type) => {
    const typeIconMap = {
      'media': <PlayCircleOutlined />,
      'cte': <SettingOutlined />,
      'salon': <TeamOutlined />,
      'delegation': <UserOutlined />,
      'seminaire_jipays': <FileTextOutlined />,
      'demarchage_direct': <PhoneIcon />,
      'salon_sectoriel': <GlobalOutlined />,
      'seminaire_jisecteur': <FileTextOutlined />,
      'visite_entreprise': <EnvironmentOutlined />,
    };
    return typeIconMap[type] || <FileTextOutlined />;
  };

  const getTypeColor = (type) => {
    const typeColorMap = {
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
    return typeColorMap[type] || '#666';
  };

  const formatType = (type) => {
    const typeLabels = {
      'media': 'Media',
      'cte': 'CTE',
      'salon': 'Salon',
      'delegation': 'Délégation',
      'seminaire_jipays': 'Séminaire JI Pays',
      'demarchage_direct': 'Démarchage Direct',
      'salon_sectoriel': 'Salon Sectoriel',
      'seminaire_jisecteur': 'Séminaire JI Secteur',
      'visite_entreprise': 'Visite Entreprise',
    };
    return typeLabels[type] || type;
  };

  const formatDate = (date) => {
    return date ? moment(date).format('DD/MM/YYYY') : '-';
  };

  const formatDateTime = (date) => {
    return date ? moment(date).format('DD/MM/YYYY HH:mm') : '-';
  };

  // Rendu des invités avec design moderne
  const renderInvites = () => {
    const columns = [
      {
        title: 'Invité',
        dataIndex: 'nom',
        key: 'nom',
        render: (text, record) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Avatar 
              size="default"
              style={{ 
                background: 'linear-gradient(135deg, #1890ff, #096dd9)',
                border: '2px solid white',
                boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)'
              }}
              icon={<UserOutlined />}
            />
            <div>
              <Text strong style={{ fontSize: '14px' }}>{text} {record.prenom}</Text>
              {record.fonction && (
                <>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>{record.fonction}</Text>
                </>
              )}
            </div>
          </div>
        ),
      },
      {
        title: 'Contact',
        key: 'contact',
        render: (_, record) => (
          <div>
            {record.email && (
              <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MailOutlined style={{ color: '#1890ff', fontSize: '12px' }} />
                <a href={`mailto:${record.email}`} style={{ fontSize: '13px' }}>{record.email}</a>
              </div>
            )}
            {record.telephone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PhoneOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
                <span style={{ fontSize: '13px' }}>{record.telephone}</span>
              </div>
            )}
          </div>
        ),
      },
      {
        title: 'Statut',
        dataIndex: 'statut',
        key: 'statut',
        render: statut => {
          const statusMap = {
            'confirmee': { color: 'success', text: 'Confirmé', icon: <CheckCircleOutlined /> },
            'en_attente': { color: 'warning', text: 'En attente', icon: <ClockCircleOutlined /> },
            'refusee': { color: 'error', text: 'Décliné', icon: <CloseCircleOutlined /> },
            'participee': { color: 'processing', text: 'Participé', icon: <CheckCircleOutlined /> }
          };
          
          const { color, text, icon } = statusMap[statut] || { color: 'default', text: statut, icon: <InfoCircleOutlined /> };
          
          return (
            <Tag 
              color={color} 
              icon={icon}
              style={{ 
                borderRadius: '12px',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: 500
              }}
            >
              {text}
            </Tag>
          );
        },
      },
      {
        title: 'Date invitation',
        dataIndex: 'created_at',
        key: 'created_at',
        render: date => (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {formatDateTime(date)}
          </Text>
        ),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Link to={`/invites/${record.id}`}>
              <Button 
                type="text" 
                icon={<InfoCircleOutlined />} 
                size="small"
                style={{ 
                  color: '#1890ff',
                  borderRadius: '6px'
                }}
              >
                Voir
              </Button>
            </Link>
          </Space>
        ),
      }
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ 
          marginBottom: 20, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TeamOutlined style={{ color: '#1890ff' }} />
            <Text type="secondary" style={{ fontSize: '14px', fontWeight: 500 }}>
              {action?.invites?.length || 0} invité(s) au total
            </Text>
          </div>
          <Button 
            type="primary" 
            icon={<UserAddOutlined />}
            onClick={openAddInviteModal}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
          >
            Ajouter un invité
          </Button>
        </div>
        
        {!action || !action.invites || action.invites.length === 0 ? (
          <Empty 
            description="Aucun invité pour cette action" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: '40px 20px' }}
          />
        ) : (
          <Table 
            dataSource={action.invites.map(invite => ({ ...invite, key: invite.id }))}
            columns={columns}
            size="middle"
            pagination={{
              pageSize: 10,
         
            }}
            style={{ 
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid #f0f0f0'
            }}
          />
        )}
      </motion.div>
    );
  };

  // Si chargement
  if (loading || refreshing) {
    return (
      <div className="action-details-container">
        <div className="loading-container">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ marginBottom: '16px' }}
          >
            <SyncOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          </motion.div>
          <Title level={4}>Chargement des détails de l'action...</Title>
          <Text type="secondary">Veuillez patienter</Text>
        </div>
      </div>
    );
  }

  // Si pas d'action trouvée
  if (!action) {
    return (
      <div className="action-details-container">
        <Result
          status="404"
          title="Action non trouvée"
          subTitle="L'action que vous recherchez n'existe pas ou a été supprimée."
          extra={
            <Button 
              type="primary" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/actions')}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px'
              }}
            >
              Retour à la liste
            </Button>
          }
        />
      </div>
    );
  }

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="action-details-container">
      {/* Breadcrumb */}
      
      
      {/* En-tête principal similaire au dashboard */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="action-header"
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
                  icon={getTypeIcon(action.type)}
                  style={{ 
                    background: `linear-gradient(135deg, ${getTypeColor(action.type)} 0%, ${getTypeColor(action.type)}80 100%)`,
                    fontSize: '28px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                  }} 
                />
              </motion.div>
              
              <div>
                <Title level={1} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
                  {action.nom}
                </Title>
                <div style={{ marginTop: '8px' }}>
                  <Space size={16}>
                    <Tag 
                      icon={getTypeIcon(action.type)}
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        color: 'white',
                        borderRadius: '20px',
                        padding: '4px 12px',
                        fontSize: '14px',
                        fontWeight: 600,
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      {formatType(action.type)}
                    </Tag>
                    <Badge 
                      status={getStatusColor(action.statut)} 
                      text={
                        <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                          {getStatusText(action.statut)}
                        </span>
                      }
                    />
                  </Space>
                </div>
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
              <Button 
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/actions')}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)'
                }}
              >
                Retour
              </Button>
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={() => navigate(`/actions/edit/${action.id}`)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)'
                }}
              >
                Modifier
              </Button>
              <Button 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => setDeleteModalVisible(true)}
                style={{
                  background: 'rgba(255,77,79,0.2)',
                  border: '1px solid rgba(255,77,79,0.3)',
                  color: '#ff4d4f',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)'
                }}
              >
                Supprimer
              </Button>
              
            </motion.div>
          </Col>
        </Row>
      </motion.div>

      {/* Statistiques rapides */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={12} sm={6}>
          <AnimatedStatCard
            icon={<TeamOutlined />}
            title="Total Invités"
            value={action.invites_count || 0}
            color="#1890ff"
            delay={0}
          />
        </Col>
        <Col xs={12} sm={6}>
          <AnimatedStatCard
            icon={<CheckCircleOutlined />}
            title="Confirmés"
            value={action.invites_confirmes_count || 0}
            color="#52c41a"
            delay={1}
          />
        </Col>
        <Col xs={12} sm={6}>
          <AnimatedStatCard
            icon={<ClockCircleOutlined />}
            title="En Attente"
            value={(action.invites_count || 0) - (action.invites_confirmes_count || 0)}
            color="#faad14"
            delay={2}
          />
        </Col>
        <Col xs={12} sm={6}>
          <AnimatedStatCard
            icon={<CalendarOutlined />}
            title="Jours Restants"
            value={action.date_debut ? Math.max(0, moment(action.date_debut).diff(moment(), 'days')) : 0}
            color="#722ed1"
            delay={3}
          />
        </Col>
      </Row>

      {/* Informations générales */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} lg={16}>
          <AnimatedContentCard
            title="Informations générales"
            icon={<InfoCircleOutlined />}
            delay={0}
          >
            {action.description && (
              <div style={{ marginBottom: '24px' }}>
                <Paragraph style={{ 
                  fontSize: '16px', 
                  lineHeight: '1.6',
                  background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #e6f0ff'
                }}>
                  {action.description}
                </Paragraph>
              </div>
            )}
            
            <Descriptions 
              bordered 
              column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                overflow: 'hidden'
              }}
            >
              <Descriptions.Item 
                label={
                  <Space>
                    <CalendarOutlined style={{ color: '#52c41a' }} />
                    <Text strong>Date début</Text>
                  </Space>
                }
              >
                <Text strong style={{ color: '#52c41a' }}>{formatDate(action.date_debut)}</Text>
              </Descriptions.Item>
              <Descriptions.Item 
                label={
                  <Space>
                    <CalendarOutlined style={{ color: '#fa8c16' }} />
                    <Text strong>Date fin</Text>
                  </Space>
                }
              >
                <Text strong style={{ color: '#fa8c16' }}>{formatDate(action.date_fin) || '-'}</Text>
              </Descriptions.Item>
              <Descriptions.Item 
                label={
                  <Space>
                    <UserOutlined style={{ color: '#722ed1' }} />
                    <Text strong>Responsable</Text>
                  </Space>
                }
              >
                {action.responsable ? action.responsable.name : '-'}
              </Descriptions.Item>
              <Descriptions.Item 
                label={
                  <Space>
                    <EnvironmentOutlined style={{ color: '#eb2f96' }} />
                    <Text strong>Lieu</Text>
                  </Space>
                }
              >
                {action.lieu || '-'}
              </Descriptions.Item>
              <Descriptions.Item 
                label={
                  <Space>
                    <EnvironmentOutlined style={{ color: '#13c2c2' }} />
                    <Text strong>Ville</Text>
                  </Space>
                }
              >
                {action.ville || '-'}
              </Descriptions.Item>
              <Descriptions.Item 
                label={
                  <Space>
                    <GlobalOutlined style={{ color: '#faad14' }} />
                    <Text strong>Pays</Text>
                  </Space>
                }
              >
                {action.pays || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Créé le">
                <Text type="secondary">{formatDateTime(action.created_at)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Dernière mise à jour">
                <Text type="secondary">{formatDateTime(action.updated_at)}</Text>
              </Descriptions.Item>
            </Descriptions>
          </AnimatedContentCard>
        </Col>
        
        <Col xs={24} lg={8}>
          <AnimatedContentCard
            title="Calendrier"
            icon={<CalendarOutlined />}
            delay={1}
          >
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f2ff 100%)',
                borderRadius: '16px',
                padding: '24px',
                border: '2px solid #1890ff30'
              }}>
                <div style={{ marginBottom: '16px' }}>
                  <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Date de début
                  </Text>
                  <Title level={3} style={{ margin: '4px 0', color: '#1890ff' }}>
                    {formatDate(action.date_debut)}
                  </Title>
                </div>
                
                {action.date_fin && (
                  <>
                    <Divider style={{ margin: '16px 0' }} />
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Date de fin
                      </Text>
                      <Title level={3} style={{ margin: '4px 0', color: '#fa8c16' }}>
                        {formatDate(action.date_fin)}
                      </Title>
                    </div>
                  </>
                )}
                
                <div style={{ marginTop: '16px' }}>
                  <Badge 
                    count={
                      action.date_fin ? 
                        `${moment(action.date_fin).diff(moment(action.date_debut), 'days') + 1} jour(s)` : 
                        '1 jour'
                    } 
                    style={{ 
                      backgroundColor: '#1890ff',
                      borderRadius: '12px',
                      padding: '4px 8px'
                    }}
                  />
                </div>
              </div>
            </div>
          </AnimatedContentCard>
        </Col>
      </Row>
      
      {/* Onglets pour les entités liées */}
      <AnimatedContentCard
        title="Gestion des invités"
        icon={<TeamOutlined />}
        delay={2}
      >
        <Tabs 
          defaultActiveKey="1" 
          style={{
            '& .ant-tabs-tab': {
              padding: '12px 24px',
              fontWeight: 500,
              borderRadius: '8px 8px 0 0'
            }
          }}
        >
          <TabPane 
            tab={
              <Space>
                <TeamOutlined /> 
                Invités 
                <Badge 
                  count={action.invites_count || 0} 
                  showZero 
                  style={{ backgroundColor: '#1890ff' }}
                />
              </Space>
            } 
            key="1"
          >
            {renderInvites()}
          </TabPane>
        </Tabs>
      </AnimatedContentCard>
      
      {/* Modal de confirmation de suppression */}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
            <span>Confirmer la suppression</span>
          </Space>
        }
        open={deleteModalVisible}
        onOk={handleDeleteAction}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Oui, supprimer"
        cancelText="Annuler"
        okButtonProps={{ 
          danger: true,
          style: { borderRadius: '8px' }
        }}
        cancelButtonProps={{ style: { borderRadius: '8px' } }}
        style={{ borderRadius: '16px' }}
      >
        <div style={{ padding: '20px 0' }}>
          <Alert
            message="Action irréversible"
            description="Cette action supprimera définitivement l'action et toutes les données associées."
            type="warning"
            showIcon
            style={{ marginBottom: '16px', borderRadius: '8px' }}
          />
          <Text>Êtes-vous sûr de vouloir supprimer cette action ?</Text>
        </div>
      </Modal>

      {/* Modal pour ajouter un invité */}
      <Modal
        title={
          <Space>
            <UserAddOutlined style={{ color: '#1890ff' }} />
            <span>Ajouter un invité</span>
          </Space>
        }
        open={addInviteModalVisible}
        onCancel={() => setAddInviteModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setAddInviteModalVisible(false)} style={{ borderRadius: '8px' }}>
            Annuler
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={handleAddInvite}
            loading={loadingDependencies}
            disabled={loadingDependencies}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px'
            }}
          >
            Ajouter
          </Button>,
        ]}
        width={800}
        style={{ borderRadius: '16px' }}
      >
        {loadingDependencies ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{ marginBottom: '16px' }}
            >
              <SyncOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
            </motion.div>
            <Text>Chargement des données...</Text>
          </div>
        ) : (
          <Form
            form={inviteForm}
            layout="vertical"
            initialValues={{ 
              type_invite: 'externe', 
              statut: 'en_attente',
              action_id: id,
              proprietaire_id: currentUser?.id
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="nom"
                  label="Nom"
                  rules={[{ required: true, message: 'Veuillez entrer le nom' }]}
                >
                  <Input placeholder="Nom" style={{ borderRadius: '8px' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="prenom"
                  label="Prénom"
                  rules={[{ required: true, message: 'Veuillez entrer le prénom' }]}
                >
                  <Input placeholder="Prénom" style={{ borderRadius: '8px' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Veuillez entrer l\'email' },
                    { type: 'email', message: 'Email invalide' }
                  ]}
                >
                  <Input 
                    placeholder="Email" 
                    prefix={<MailOutlined style={{ color: '#1890ff' }} />}
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="telephone" label="Téléphone">
                  <Input 
                    placeholder="Téléphone" 
                    prefix={<PhoneOutlined style={{ color: '#52c41a' }} />}
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="entreprise_id"
                  label="Entreprise"
                  rules={[{ required: true, message: 'L\'entreprise est obligatoire' }]}
                >
                  <Select 
                    placeholder="Sélectionner une entreprise" 
                    showSearch
                    loading={entreprisesLoading}
                    style={{ borderRadius: '8px' }}
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    notFoundContent={entreprisesLoading ? <Spin size="small" /> : <Empty description="Aucune entreprise trouvée" />}
                  >
                    {Array.isArray(entreprises?.data) 
                      ? entreprises.data.map(entreprise => (
                          <Option key={entreprise.id} value={entreprise.id}>{entreprise.nom || entreprise.name}</Option>
                        ))
                      : Array.isArray(entreprises) 
                        ? entreprises.map(entreprise => (
                            <Option key={entreprise.id} value={entreprise.id}>{entreprise.nom || entreprise.name}</Option>
                          ))
                        : null
                    }
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="fonction" label="Fonction">
                  <Input 
                    placeholder="Fonction dans l'entreprise"
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="type_invite"
                  label="Type d'invité"
                  rules={[{ required: true, message: 'Le type est obligatoire' }]}
                >
                  <Radio.Group>
                    <Radio value="interne">Interne</Radio>
                    <Radio value="externe">Externe</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="statut"
                  label="Statut"
                  rules={[{ required: true, message: 'Le statut est obligatoire' }]}
                >
                  <Select placeholder="Statut de l'invitation" style={{ borderRadius: '8px' }}>
                    <Option value="en_attente">
                      <Badge status="warning" text="En attente" />
                    </Option>
                    <Option value="confirmee">
                      <Badge status="success" text="Confirmé" />
                    </Option>
                    <Option value="refusee">
                      <Badge status="error" text="Décliné" />
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="commentaires" label="Commentaires">
              <TextArea 
                rows={3} 
                placeholder="Commentaires ou notes sur cet invité"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Styles CSS intégrés */}
      <style jsx>{`
        .action-details-container {
          padding: 24px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
          background: white;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          text-align: center;
          padding: 40px;
        }

        .action-header {
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

        .ant-descriptions-bordered .ant-descriptions-item-label {
          background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
          font-weight: 600;
          color: #333;
        }

        .ant-descriptions-bordered .ant-descriptions-item-content {
          background: white;
        }

        .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #f0f0f0;
        }

        .ant-table-tbody > tr:hover > td {
          background: linear-gradient(135deg, #f0f2ff 0%, #e6f7ff 100%);
        }

        .ant-tabs-tab {
          padding: 12px 24px !important;
          font-weight: 500 !important;
          border-radius: 8px 8px 0 0 !important;
          transition: all 0.3s ease !important;
        }

        .ant-tabs-tab-active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
        }

        .ant-modal-content {
          border-radius: 16px !important;
          overflow: hidden;
        }

        .ant-modal-header {
          background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
          border-bottom: 1px solid #e8e8e8;
        }

        .ant-modal-footer {
          border-top: 1px solid #f0f0f0;
          background: #fafafa;
        }

        .ant-form-item-label > label {
          font-weight: 500;
          color: #333;
        }

        .ant-input,
        .ant-select-selector,
        .ant-input-affix-wrapper {
          transition: all 0.3s ease;
        }

        .ant-input:focus,
        .ant-select-focused .ant-select-selector,
        .ant-input-affix-wrapper-focused {
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
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

        /* Responsive Design */
        @media (max-width: 768px) {
          .action-details-container {
            padding: 16px;
          }

          .action-header {
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
        }

        @media (max-width: 576px) {
          .action-header {
            padding: 20px !important;
            border-radius: 12px !important;
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

        /* Amélioration des sélecteurs Ant Design */
        .ant-select-dropdown {
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }

        .ant-select-item {
          border-radius: 4px;
          margin: 2px 8px;
          transition: all 0.2s ease;
        }

        .ant-select-item:hover {
          background: linear-gradient(135deg, #f0f2ff 0%, #e6f7ff 100%);
        }

        .ant-select-item-option-selected {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
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

        /* Amélioration des statistiques */
        .ant-statistic {
          text-align: center;
        }

        .ant-statistic-title {
          font-weight: 500;
          color: #666;
        }

        .ant-statistic-content {
          font-weight: 600;
        }

        /* Empty state */
        .ant-empty {
          padding: 40px 20px;
        }

        .ant-empty-description {
          color: #999;
          font-size: 14px;
        }

        /* Loading state */
        .ant-spin-container {
          transition: opacity 0.3s ease;
        }

        .ant-spin-blur {
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
};

export default ActionDetail;