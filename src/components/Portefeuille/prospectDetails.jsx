import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Card, Descriptions, Button, Space, Spin, Tag, Tabs, Typography, Modal,
  message, Divider, Row, Col, Breadcrumb, Statistic, Tooltip, Badge, Checkbox, List,
  Dropdown, Menu, Steps, Alert, Timeline, Form, DatePicker, Select, Input, Progress, InputNumber,
  Avatar, Grid, Empty
} from 'antd';
import {
  EditOutlined, DeleteOutlined, ArrowLeftOutlined, ExclamationCircleOutlined,
  MailOutlined, PhoneOutlined, UserOutlined, CalendarOutlined, FileTextOutlined,
  BankOutlined, TeamOutlined, CheckCircleOutlined, CloseCircleOutlined, CheckOutlined,
  QuestionCircleOutlined, DownOutlined, EllipsisOutlined, HistoryOutlined, LoadingOutlined, PlusOutlined,
  MessageOutlined, InfoCircleOutlined, SendOutlined, AuditOutlined, BellOutlined, GlobalOutlined, RightOutlined,
  SearchOutlined, SettingOutlined, ClockCircleOutlined, ArrowUpOutlined, WarningOutlined, LinkOutlined,
  HomeOutlined, SyncOutlined, FireOutlined, ThunderboltOutlined, ReloadOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getProspectById,
  deleteProspect,
  updateProspectStatus,
  advancePipeline,
  convertToInvestor,
  resetOperation,
  getProspectPipeline,
} from '../../features/prospectSlice';
import { fetchPays, fetchSecteurs, fetchEntreprises } from '../../features/marketingSlice';
import moment from 'moment';
import '../../../src/assets/styles/action-form.css';
import PipelineTasks from '../Portefeuille/PipelineTasks';
import {
  fetchPipelineStages,
  addPipelineStage,
  updatePipelineStage,
  deletePipelineStage,
} from '../../features/pipelineStageSlice';
import PipelineBlockages from '../Blockages/PipelineBlockages';
import { getCurrentUser } from '../../features/userSlice';
import { createPipelineStageTask, getPipelineStageTasks } from '../../features/taskSlice';
import TaskCreateModal from '../Tasks/TaskCreateModal';
import PipelineStageManager from '../Portefeuille/PipelineStageManager';
import PipelineVisualizer from '../Portefeuille/PipelineVisualizer';
import BlockageForm from '../Blockages/BlockageForm'; // <- AJOUT


const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;
const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Composant de statistique animée (identique à InviteDetails)
const AnimatedStatCard = ({ icon, title, value, prefix, suffix, color, loading, delay = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!loading && typeof value === 'number' && value > 0) {
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
    } else if (!loading) {
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
              boxShadow: `0 4px 12px ${color}40`,
              marginBottom: '12px'
            }}
          >
            {loading ? <SyncOutlined spin /> : icon}
          </motion.div>

          <Text type="secondary" style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
            {title}
          </Text>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay * 0.1 + 0.3 }}
          >
            <Title level={3} style={{ 
              margin: '4px 0 0 0', 
              color: color,
              fontWeight: 700,
              fontSize: '22px'
            }}>
              {prefix}
              <motion.span
                key={displayValue}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
              </motion.span>
              {suffix}
            </Title>
          </motion.div>
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
            transform: 'skewX(-25deg)',
            pointerEvents: 'none'
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

// Composant de carte animée (identique à InviteDetails)
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
                background: 'linear-gradient(135deg, #667eea, #764ba2)'
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
                  <SyncOutlined style={{ fontSize: '32px', color: '#667eea' }} />
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

const ProspectDetails = () => {
  const [taskForm] = Form.useForm();
  const [shouldCreateTask, setShouldCreateTask] = useState(false);
  const screens = useBreakpoint();

  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [conversionModalVisible, setConversionModalVisible] = useState(false);
  const [pipelineModalVisible, setPipelineModalVisible] = useState(false);
  const [selectedPipelineStage, setSelectedPipelineStage] = useState(null);
  const [conversionForm] = Form.useForm();
  const [pipelineForm] = Form.useForm();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [selectedStageForTask, setSelectedStageForTask] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [pipelineManagementVisible, setPipelineManagementVisible] = useState(false);
  const [editingStage, setEditingStage] = useState(null);
  const [stageForm] = Form.useForm();
  const [blockages, setBlockages] = useState([]);
  const [addBlockageVisible, setAddBlockageVisible] = useState(false);
  const [pipelineTasks, setPipelineTasks] = useState({ planned: [], recent: [] });
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [selectedStageName, setSelectedStageName] = useState('');

  const {
    selectedProspect: { data: prospect, loading, error },
    pipeline: { stages: pipelineStages, currentStage, progression, loading: pipelineLoading },
    operation
  } = useSelector(state => state.prospects);

  const { pays, secteurs, entreprises } = useSelector(state => state.marketing);
  const currentUser = useSelector(state => state.user.user);

  useEffect(() => {
    if (!id) {
      console.error('ID du prospect manquant dans les paramètres URL');
      message.error('ID du prospect manquant');
      navigate('/prospects');
      return;
    }
    console.log('ID du prospect récupéré:', id);
  }, [id, navigate]);

  useEffect(() => {
    if (prospect && prospect.is_converted && prospect.investisseur) {
      console.log('Prospect converti vers investisseur ID:', prospect.investisseur.id);
    }
  }, [prospect]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!currentUser && localStorage.getItem('token')) {
          await dispatch(getCurrentUser()).unwrap();
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        message.error('Impossible de charger vos informations. Veuillez vous reconnecter.');
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (id) {
      dispatch(getProspectById(id));
      dispatch(getProspectPipeline(id));
      dispatch(fetchPays());
      dispatch(fetchSecteurs());
      dispatch(fetchEntreprises());
    }

    return () => {
      dispatch(resetOperation());
    };
  }, [dispatch, id, refreshTrigger]);

  useEffect(() => {
    if (operation.success) {
      switch (operation.type) {
        case 'delete':
          message.success('Prospect supprimé avec succès');
          navigate('/prospects');
          break;
        case 'update_status':
          message.success('Statut mis à jour avec succès');
          break;
        case 'advance_pipeline':
          message.success('Progression dans le pipeline enregistrée');
          setPipelineModalVisible(false);
          dispatch(getProspectPipeline(id));
          break;
        case 'convert_to_investor':
          break;
        default:
          message.success('Opération réussie');
      }
      dispatch(resetOperation());
    } else if (operation.error) {
      if (operation.type !== 'convert_to_investor') {
        message.error(operation.error);
      }
      dispatch(resetOperation());
    }
  }, [operation, navigate, id, dispatch]);

  const effectiveCurrentStage = currentStage ||
    (pipelineStages && pipelineStages.length > 0 ? pipelineStages[0] : null);

  const nextStage = pipelineStages.find(
    stage => stage.order === ((effectiveCurrentStage?.order || 0) + 1)
  );

  const loadPipelineTasks = useCallback(async () => {
    if (!id || !effectiveCurrentStage?.id) return;

    setLoadingTasks(true);
    try {
      dispatch(getPipelineStageTasks({
        entityType: 'prospect',
        entityId: id,
        stageId: effectiveCurrentStage.id
      }))
        .unwrap()
        .then(response => {
          const tasks = response.data || [];
          const now = moment();
          const planned = tasks.filter(task => moment(task.end || task.start).isAfter(now));
          const recent = tasks.filter(task => moment(task.end || task.start).isSameOrBefore(now));
          setPipelineTasks({ planned, recent });
        })
        .catch(error => {
          console.error('Erreur lors du chargement des tâches:', error);
          message.error('Impossible de charger les tâches associées à cette étape');
        })
        .finally(() => {
          setLoadingTasks(false);
        });
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error);
      message.error('Impossible de charger les tâches associées à cette étape');
      setLoadingTasks(false);
    }
  }, [id, effectiveCurrentStage, dispatch]);

  useEffect(() => {
    if (activeTab === 'tasks' && effectiveCurrentStage?.id) {
      loadPipelineTasks();
    }
  }, [activeTab, effectiveCurrentStage, loadPipelineTasks, refreshTrigger]);

  const showDeleteConfirm = () => {
    confirm({
      title: `Êtes-vous sûr de vouloir supprimer ce prospect?`,
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

  const openTaskModal = (stageId, stageName, task = null) => {
    setSelectedStageForTask(stageId);
    setSelectedStageName(stageName);
    setTaskModalVisible(true);
  };

  const handleCreateTask = () => {
    taskForm.validateFields().then(values => {
      if (!currentUser?.id) {
        message.error('Utilisateur non connecté. Veuillez vous reconnecter.');
        return;
      }

      const taskData = {
        title: values.title,
        description: values.description,
        start: values.start?.format('YYYY-MM-DD HH:mm:ss'),
        end: values.end?.format('YYYY-MM-DD HH:mm:ss'),
        all_day: false,
        type: values.type,
        priority: values.priority,
      };

      dispatch(createPipelineStageTask({
        prospectId: id,
        stageId: selectedStageForTask,
        taskData
      }))
        .unwrap()
        .then(response => {
          message.success('Tâche créée avec succès');
          setTaskModalVisible(false);
          setRefreshTrigger(prev => prev + 1);
        })
        .catch(error => {
          message.error(`Erreur: ${error}`);
        });
    });
  };

  useEffect(() => {
    if (pipelineModalVisible) {
      const now = moment();
      taskForm.setFieldsValue({
        title: `Tâche pour ${prospect?.nom || 'prospect'} - ${currentStage?.name || 'suivi'}`,
        start: now,
        end: moment(now).add(1, 'hours'),
        type: 'todo',
        priority: 'normal',
        description: ''
      });
    }
  }, [pipelineModalVisible, prospect, currentStage, taskForm]);

  const handleStatusChange = (newStatus) => {
    dispatch(updateProspectStatus({ id, statut: newStatus }));
  };

  const handleAdvancePipeline = async () => {
    try {
      const values = await pipelineForm.validateFields();
      const stageId = nextStage?.id;

      if (!stageId) {
        message.error('Aucune étape suivante disponible');
        return;
      }

      await dispatch(advancePipeline({
        id,
        stage_id: stageId,
        notes: values.notes,
        date: values.date?.format('YYYY-MM-DD HH:mm:ss')
      })).unwrap();

      message.success('Progression enregistrée avec succès');
      setPipelineModalVisible(false);
      pipelineForm.resetFields();

      dispatch(getProspectById(id));
      dispatch(getProspectPipeline(id));
      setRefreshTrigger(prev => prev + 1);

    } catch (error) {
      console.error('Erreur lors de l\'avancement:', error);
    }
  };

  const handleConversion = () => {
    conversionForm.validateFields().then(values => {
      if (!id) {
        message.error('ID du prospect manquant');
        return;
      }

      const formatDateForBackend = (momentDate) => {
        if (!momentDate) return null;
        return momentDate.format('YYYY-MM-DD');
      };

      const conversionData = {
        id: id,
        nom: values.nom,
        montant_investissement: values.montant_investissement || null,
        devise: values.devise || 'EUR',
        interets_specifiques: values.interets_specifiques || null,
        criteres_investissement: values.criteres_investissement || null,
        responsable_id: values.responsable_id || currentUser?.id || null,
        notes: values.notes_internes || null,
        date_engagement: formatDateForBackend(values.date_engagement),
        date_signature: formatDateForBackend(values.date_signature),
        initialize_pipeline: true
      };

      console.log('ID du prospect:', id);
      console.log('Données de conversion formatées:', conversionData);

      dispatch(convertToInvestor(conversionData))
        .unwrap()
        .then((response) => {
          console.log('Réponse de conversion:', response);

          const investisseur = response.data?.investisseur;

          if (investisseur?.id) {
            setConversionModalVisible(false);
            message.success('Conversion réussie! Redirection vers l\'investisseur...');
            navigate(`/investisseurs/${investisseur.id}`);
          } else {
            message.error('Conversion réussie mais impossible de récupérer l\'investisseur');
            setConversionModalVisible(false);
            navigate('/investisseurs');
          }
        })
        .catch((error) => {
          console.error("Erreur lors de la conversion :", error);
          message.error(`Erreur lors de la conversion: ${error}`);
        });
    }).catch((validationError) => {
      console.error('Erreur de validation du formulaire:', validationError);
    });
  };

  const statusMenu = (
    <Menu>
      <Menu.Item key="nouveau" disabled={prospect?.statut === 'nouveau'} onClick={() => handleStatusChange('nouveau')}>
        <Badge color="blue" text="Nouveau" />
      </Menu.Item>
      <Menu.Item key="en_cours" disabled={prospect?.statut === 'en_cours'} onClick={() => handleStatusChange('en_cours')}>
        <Badge color="processing" text="En cours" />
      </Menu.Item>
      <Menu.Item key="qualifie" disabled={prospect?.statut === 'qualifie'} onClick={() => handleStatusChange('qualifie')}>
        <Badge color="green" text="Qualifié" />
      </Menu.Item>
      <Menu.Item key="non_qualifie" disabled={prospect?.statut === 'non_qualifie'} onClick={() => handleStatusChange('non_qualifie')}>
        <Badge color="orange" text="Non qualifié" />
      </Menu.Item>
      <Menu.Item key="converti" disabled={prospect?.statut === 'converti'} onClick={() => handleStatusChange('converti')}>
        <Badge color="success" text="Converti" />
      </Menu.Item>
      <Menu.Item key="perdu" disabled={prospect?.statut === 'perdu'} onClick={() => handleStatusChange('perdu')}>
        <Badge color="red" text="Perdu" />
      </Menu.Item>
    </Menu>
  );

  const renderStatus = (statut) => {
    let color, text, icon;
    switch (statut) {
      case 'nouveau':
        color = 'blue';
        text = 'Nouveau';
        icon = <InfoCircleOutlined />;
        break;
      case 'en_cours':
        color = 'processing';
        text = 'En cours';
        icon = <LoadingOutlined />;
        break;
      case 'qualifie':
        color = 'green';
        text = 'Qualifié';
        icon = <CheckCircleOutlined />;
        break;
      case 'non_qualifie':
        color = 'orange';
        text = 'Non qualifié';
        icon = <CloseCircleOutlined />;
        break;
      case 'converti':
        color = 'success';
        text = 'Converti';
        icon = <CheckCircleOutlined />;
        break;
      case 'perdu':
        color = 'red';
        text = 'Perdu';
        icon = <CloseCircleOutlined />;
        break;
      default:
        color = 'default';
        text = statut || 'Non défini';
        icon = <QuestionCircleOutlined />;
    }
    return (
      <Space>
        {icon}
        <Tag color={color}>{text}</Tag>
      </Space>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    return moment(dateString).format('DD/MM/YYYY HH:mm');
  };

  if (loading) {
    return (
      <div className="modern-loading-container">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="loading-content"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ marginBottom: '16px' }}
          >
            <SyncOutlined style={{ fontSize: '48px', color: '#667eea' }} />
          </motion.div>
          <Title level={4} style={{ color: '#666' }}>
            Chargement des détails du prospect...
          </Title>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="modern-container"
      >
        <Card className="modern-error-card">
          <div className="error-content">
            <ExclamationCircleOutlined className="error-icon" />
            <Title level={4}>Erreur lors du chargement</Title>
            <Text type="danger">{error}</Text>
            <Button type="primary" onClick={() => navigate('/prospects')} style={{ marginTop: 16 }}>
              Retour à la liste
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (!prospect) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="modern-container"
      >
        <Card className="modern-not-found-card">
          <div className="not-found-content">
            <InfoCircleOutlined className="not-found-icon" />
            <Title level={4}>Prospect non trouvé</Title>
            <Text>Le prospect que vous recherchez n'existe pas ou a été supprimé.</Text>
            <Button type="primary" onClick={() => navigate('/prospects')} style={{ marginTop: 24 }}>
              Retour à la liste
            </Button>
          </div>
        </Card>
      </motion.div>
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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="modern-container">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Breadcrumb style={{ marginBottom: 24 }}>
          <Breadcrumb.Item>
            <Link to="/dashboard">
              <HomeOutlined /> Dashboard
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/prospects">
              <TeamOutlined /> Prospects
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <UserOutlined /> {prospect.nom}
          </Breadcrumb.Item>
        </Breadcrumb>
      </motion.div>

      {/* En-tête principal avec gradient identique à InviteDetails */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="prospect-header"
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
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'4\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
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
                  icon={<UserOutlined />} 
                  style={{ 
                    backgroundColor: prospect.potentiel === 'élevé' ? '#f5222d' : 
                                    prospect.potentiel === 'moyen' ? '#faad14' : '#1890ff',
                    fontSize: '28px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                  }} 
                />
              </motion.div>
              
              <div>
                <Title level={1} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
                  {prospect.nom}
                  {prospect.is_converted && (
                    <Tag color="success" style={{ marginLeft: 12 }}>
                      <CheckOutlined /> Converti
                    </Tag>
                  )}
                </Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: '8px 0 0 0' }}>
                  <BankOutlined style={{ marginRight: 6 }} />
                  {prospect.entreprise?.nom || 'Entreprise non définie'} • 
                  <CalendarOutlined style={{ marginLeft: 8, marginRight: 6 }} />
                  Créé le {moment(prospect.created_at).format('DD/MM/YYYY')}
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
              

              <Dropdown overlay={statusMenu} placement="bottomRight">
                <Button 
                  size="large"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    borderRadius: '8px',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  Statut <DownOutlined />
                </Button>
              </Dropdown>
              <Button 
                  size="large"
                  onClick={() => navigate(`/prospects/${id}/edit`)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    borderRadius: '8px',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  Modifier <EditOutlined />
                </Button>
                <Button 
                  size="large"
                  onClick={showDeleteConfirm}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    borderRadius: '8px',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  Supprimer <DeleteOutlined />
                </Button>

              {prospect.is_converted && prospect.investisseur ? (
                <Button
                  type="primary"
                  icon={<LinkOutlined />}
                  onClick={() => navigate(`/investisseurs/${prospect.investisseur.id}`)}
                  size="large"
                  style={{
                    background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 500
                  }}
                >
                  {screens.xs ? 'Voir' : 'Voir l\'investisseur'}
                </Button>
              ) : prospect.is_converted ? (
                <Button
                  disabled
                  icon={<CheckOutlined />}
                  size="large"
                  style={{ borderRadius: '8px' }}
                >
                  {screens.xs ? 'Converti' : 'Déjà converti'}
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={() => {
                    if (prospect.statut === 'converti' || prospect.converted_at) {
                      message.info('Ce prospect est déjà converti en investisseur');
                      return;
                    }
                    if (!currentStage) {
                      message.warning('Aucune étape de pipeline définie pour ce prospect');
                      return;
                    }
                    if (!currentStage.is_final) {
                      message.warning({
                        content: (
                          <div>
                            <p>Le prospect doit être dans l'étape finale du pipeline pour être converti.</p>
                            <p><strong>Étape actuelle :</strong> {currentStage.name}</p>
                            <p><strong>Type d'étape :</strong> {currentStage.is_final ? 'Finale' : 'Intermédiaire'}</p>
                            <p>Faites progresser le prospect jusqu'à l'étape finale ou marquez l'étape actuelle comme finale.</p>
                          </div>
                        ),
                        duration: 6
                      });
                      return;
                    }
                    setConversionModalVisible(true);
                  }}
                  disabled={prospect.statut === 'converti' || prospect.converted_at}
                  size="large"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    borderRadius: '8px',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {screens.xs ? 'Convertir' : 'Convertir en investisseur'}
                </Button>
              )}





            </motion.div>
          </Col>
        </Row>
      </motion.div>

      {/* Métriques de pipeline avec AnimatedStatCard */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={12} sm={6}>
          <AnimatedStatCard
            icon={prospect.is_converted ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
            title="Statut de conversion"
            value={prospect.is_converted ? "Converti" : "En cours"}
            color={prospect.is_converted ? '#52c41a' : '#faad14'}
            delay={0}
          />
        </Col>
        <Col xs={12} sm={6}>
          <AnimatedStatCard
            icon={<AuditOutlined />}
            title="Étape actuelle"
            value={effectiveCurrentStage?.name || 'Aucune'}
            color="#667eea"
            delay={1}
          />
        </Col>
        <Col xs={12} sm={6}>
          <AnimatedStatCard
            icon={<CalendarOutlined />}
            title="Temps dans l'étape"
            value={progression && progression.length > 0
              ? moment().diff(moment(progression[0].created_at), 'days')
              : 0}
            suffix=" jours"
            color="#764ba2"
            delay={2}
          />
        </Col>
        <Col xs={12} sm={6}>
          <AnimatedStatCard
            icon={<GlobalOutlined />}
            title="Valeur potentielle"
            value={prospect.valeur_potentielle ? new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: prospect.devise || 'EUR'
            }).format(prospect.valeur_potentielle) : 'Non définie'}
            color="#13c2c2"
            delay={3}
          />
        </Col>
      </Row>

      {/* Visualisation du pipeline avec AnimatedContentCard */}
      {pipelineStages.length > 0 && (
  <motion.div
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    transition={{ delay: 0.3 }}
    style={{ marginBottom: '24px' }}
  >
    <AnimatedContentCard
      title="Pipeline de suivi"
      delay={0}
      extra={
        <Space>
          {nextStage && !prospect?.is_converted && (
            <Button
              type="primary"
              icon={<RightOutlined />}
              onClick={() => setPipelineModalVisible(true)}
              disabled={!nextStage}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 500
              }}
            >
              Avancer
            </Button>
          )}
        </Space>
      }
    >
      <PipelineStageManager
        entityType="prospect"
        entityId={id}
        stages={pipelineStages}
        currentStage={currentStage}
        progression={progression || []}
        pipelineCompletedAt={
          prospect?.is_converted
            ? prospect?.converted_at || new Date().toISOString()
            : null
        }
        onStagesChange={() => dispatch(getProspectPipeline(id))}
        showAddButton={true}
        buttonText="Ajouter une étape"
        buttonClassName="modern-btn"
        showVisualizer={true}
      />
    </AnimatedContentCard>
  </motion.div>
)}


      {/* Contenu principal avec onglets */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
      >
        <AnimatedContentCard
          title="Informations détaillées"
          delay={1}
        >
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab} 
            type="card"
            className="modern-tabs"
          >
            <TabPane tab={
              <Space>
                <InfoCircleOutlined />
                Détails
              </Space>
            } key="details">
              <div className="tab-content">
                <div className="details-header">
                  <Title level={4}>Informations du prospect</Title>
                  <Button 
                    icon={<EditOutlined />} 
                    onClick={() => navigate(`/prospects/${id}/edit`)}
                    className="modern-btn"
                  >
                    Modifier
                  </Button>
                </div>

                <Descriptions bordered column={{ xs: 1, sm: 2 }} className="modern-descriptions">
                  <Descriptions.Item label="Nom">{prospect.nom}</Descriptions.Item>
                  <Descriptions.Item label="Email">
                    <Text copyable>{prospect.email}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Téléphone">
                    <Text copyable>{prospect.telephone || 'Non renseigné'}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Entreprise">
                    {prospect.entreprise?.nom || 'Non assignée'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Pays">
                    {prospect.pays?.name || 'Non renseigné'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Secteur d'activité">
                    {prospect.secteur?.name || 'Non renseigné'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Valeur potentielle">
                    {prospect.valeur_potentielle ? new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: prospect.devise || 'EUR'
                    }).format(prospect.valeur_potentielle) : 'Non définie'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Responsable">
                    {prospect.responsable?.name || 'Non assigné'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Prochain contact prévu">
                    {prospect.prochain_contact_prevu ? moment(prospect.prochain_contact_prevu).format('DD/MM/YYYY') : 'Non planifié'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Dernier contact">
                    {prospect.date_dernier_contact ? moment(prospect.date_dernier_contact).format('DD/MM/YYYY') : 'Non enregistré'}
                  </Descriptions.Item>
                </Descriptions>

                <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                  <Col xs={24}>
                    <Card size="small" className="info-card" title="Description">
                      <Text>{prospect.description || 'Aucune description disponible.'}</Text>
                    </Card>
                  </Col>
                  <Col xs={24}>
                    <Card size="small" className="info-card" title="Notes internes">
                      <Text>{prospect.notes_internes || 'Aucune note interne.'}</Text>
                    </Card>
                  </Col>
                  {prospect.investisseur && (
                    <Col xs={24}>
                      <Card size="small" className="info-card" title="Converti en investisseur">
                        <Tag color="green">
                          Converti le {moment(prospect.investisseur.created_at).format('DD/MM/YYYY')}
                        </Tag>
                        <div style={{ marginTop: 8 }}>
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => navigate(`/investisseurs/${prospect.investisseur.id}`)}
                          >
                            Voir l'investisseur
                          </Button>
                        </div>
                      </Card>
                    </Col>
                  )}
                </Row>
              </div>
            </TabPane>

            <TabPane tab={
              <Space>
                <AuditOutlined />
                Étapes
              </Space>
            } key="stages">
              <div className="tab-content">
                {pipelineStages.length > 0 ? (
                  <>
                    <Card title="Progression dans le pipeline" className="stages-card">
                      <PipelineVisualizer
                        stages={pipelineStages}
                        currentStage={effectiveCurrentStage}
                        progression={progression || []}
                      />
                    </Card>

                    {!prospect.is_converted && (
                      <Card title="Actions de progression" style={{ marginTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <Text strong>Étape actuelle : </Text>
                            <Tag color="blue">{currentStage?.name || 'Non définie'}</Tag>
                          </div>
                          <div>
                            {nextStage ? (
                              <Button
                                type="primary"
                                icon={<RightOutlined />}
                                onClick={() => setPipelineModalVisible(true)}
                              >
                                Avancer vers : {nextStage.name}
                              </Button>
                            ) : (
                              <Tag color="green">Étape finale atteinte</Tag>
                            )}
                          </div>
                        </div>
                      </Card>
                    )}

                    {prospect.is_converted && prospect.investisseur && (
                      <Card title="Conversion réussie" style={{ marginTop: 16 }}>
                        <Alert
                          message="Prospect converti avec succès"
                          description={
                            <div>
                              <p>Ce prospect a été converti en investisseur le {moment(prospect.converted_at).format('DD/MM/YYYY')}.</p>
                              <Button
                                type="primary"
                                icon={<LinkOutlined />}
                                onClick={() => navigate(`/investisseurs/${prospect.investisseur.id}`)}
                              >
                                Voir l'investisseur
                              </Button>
                            </div>
                          }
                          type="success"
                          showIcon
                        />
                      </Card>
                    )}
                  </>
                ) : (
                  <Alert
                    message="Aucun pipeline défini"
                    description="Ce prospect n'a pas encore de pipeline de suivi défini."
                    type="info"
                    showIcon
                    className="no-pipeline-alert"
                  />
                )}
              </div>
            </TabPane>

            <TabPane tab={
  <Space>
    <WarningOutlined />
    Blocages 
  </Space>
} key="blockages">
  <div className="tab-content">
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={() => setAddBlockageVisible(true)}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        marginBottom: 16
      }}
    >
      Add Blockage
    </Button>
    <PipelineBlockages
      entityType="prospect"
      entityId={id}
      pipelineStages={pipelineStages || []}
      title="Blocages par étape du pipeline"
    />
  </div>
</TabPane>

            <TabPane tab={
              <Space>
                <ClockCircleOutlined />
                Tâches
              </Space>
            } key="tasks">
              <div className="tab-content">
                <div className="tasks-header">
                  <Title level={4}>Liste des tâches</Title>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!effectiveCurrentStage) {
                        message.error("Aucune étape active pour ajouter une tâche.");
                        return;
                      }
                      openTaskModal(effectiveCurrentStage.id, effectiveCurrentStage.name);
                    }}
                    className="modern-btn-primary"
                  >
                    Ajouter une tâche
                  </Button>
                </div>

                <PipelineTasks
                  entityType="prospect"
                  entityId={id}
                  stageId={effectiveCurrentStage?.id}
                  onEdit={(task) => {
                    openTaskModal(task.pipeline_stage_id, effectiveCurrentStage?.name, task);
                  }}
                />
              </div>
            </TabPane>

            <TabPane tab={
              <Space>
                <FileTextOutlined />
                Notes
              </Space>
            } key="notes">
              <div className="tab-content">
                <div className="notes-header">
                  <Title level={4}>Notes</Title>
                  <Button type="primary" icon={<PlusOutlined />} className="modern-btn-primary">
                    Ajouter une note
                  </Button>
                </div>
                <Empty description="Aucune note" className="empty-state" />
              </div>
            </TabPane>
          </Tabs>
        </AnimatedContentCard>
      </motion.div>

      {/* Modaux */}
      <Modal
        title="Convertir en investisseur"
        visible={conversionModalVisible}
        onCancel={() => setConversionModalVisible(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setConversionModalVisible(false)}>
            Annuler
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleConversion}
            loading={operation.loading && operation.type === 'convert_to_investor'}
          >
            Convertir
          </Button>
        ]}
      >
        <Form
          form={conversionForm}
          layout="vertical"
          initialValues={{
            nom: prospect?.nom,
            devise: 'EUR',
            responsable_id: currentUser?.id
          }}
        >
          <Alert
            message="Conditions de conversion"
            description={
              <div>
                <p>Pour convertir un prospect en investisseur, les conditions suivantes doivent être remplies :</p>
                <ul>
                  <li>Statut "qualifié" ✓</li>
                  <li>Étape finale du pipeline complétée {
                    (() => {
                      const hasFinalStageProgression = progression?.some(prog => 
                        prog.stage?.is_final && prog.completed
                      );
                      return hasFinalStageProgression ? '✓' : '✗';
                    })()
                  }</li>
                </ul>
                <p><strong>Étape actuelle :</strong> {currentStage?.name || 'Non définie'}</p>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="nom"
                label="Nom complet de l'investisseur"
                rules={[{ required: true, message: 'Veuillez entrer le nom complet' }]}
              >
                <Input placeholder="Nom complet de l'investisseur" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="responsable_id"
                label="Responsable"
              >
                <Select placeholder="Sélectionner un responsable">
                  <Option value={currentUser?.id}>{currentUser?.name} (Moi)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="montant_investissement"
                label="Montant d'investissement"
                rules={[
                  {
                    type: 'number',
                    min: 0,
                    message: 'Le montant doit être positif'
                  }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Montant en devise"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="devise"
                label="Devise"
              >
                <Select>
                  <Option value="EUR">EUR - Euro</Option>
                  <Option value="USD">USD - Dollar américain</Option>
                  <Option value="TND">TND - Dinar tunisien</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date_engagement"
                label="Date d'engagement"
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  placeholder="Date d'engagement"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="date_signature"
                label="Date de signature"
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  placeholder="Date de signature"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="interets_specifiques"
            label="Intérêts spécifiques"
          >
            <TextArea 
              rows={3} 
              placeholder="Domaines d'investissement préférés, secteurs d'intérêt..." 
            />
          </Form.Item>

          <Form.Item
            name="criteres_investissement"
            label="Critères d'investissement"
          >
            <TextArea 
              rows={3} 
              placeholder="Critères de sélection, montants préférés, durée d'investissement..." 
            />
          </Form.Item>

          <Form.Item
            name="notes_internes"
            label="Notes internes"
          >
            <TextArea 
              rows={3} 
              placeholder="Informations internes, observations, historique..." 
            />
          </Form.Item>

          <Alert
            message="Information importante"
            description="Cette action va créer un nouvel investisseur et initialiser automatiquement son pipeline. Le prospect sera marqué comme 'converti'."
            type="warning"
            showIcon
          />
        </Form>
      </Modal>
      <Modal
  open={addBlockageVisible}
  onCancel={() => setAddBlockageVisible(false)}
  footer={null}
  destroyOnClose
  title="Créer un blocage"
  width={720}
>
  <BlockageForm
    blockage={null}
    onCancel={() => setAddBlockageVisible(false)}
    entityType="prospect"
    entityId={id}
    pipelineStageType="pipeline_stage"
    pipelineStageId={effectiveCurrentStage?.id}
  />
</Modal>

      <Modal
        title={`Passer à l'étape: ${nextStage?.name || ''}`}
        visible={pipelineModalVisible}
        onCancel={() => setPipelineModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setPipelineModalVisible(false)}>
            Annuler
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleAdvancePipeline}
          >
            Confirmer l'avancement
          </Button>
        ]}
      >
        <Form
          form={pipelineForm}
          layout="vertical"
        >
          <Form.Item
            name="date"
            label="Date de réalisation"
          >
            <DatePicker
              showTime
              style={{ width: '100%' }}
              placeholder="Sélectionner une date (optionnel)"
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <TextArea rows={4} placeholder="Informations complémentaires sur cette étape" />
          </Form.Item>
        </Form>
      </Modal>

   <TaskCreateModal
  visible={taskModalVisible}
  onCancel={() => setTaskModalVisible(false)}
  onSuccess={() => {
    setTaskModalVisible(false);
    setRefreshTrigger(prev => prev + 1);
    message.success('Tâche créée avec succès');
  }}
  entityType="prospect"
  entityId={id}
  stageId={selectedStageForTask}
  stageName={selectedStageName}
  entityName={prospect?.nom}
/>

      {/* CSS Styles identiques à InviteDetails */}
      <style jsx>{`
        .modern-container {
          padding: 24px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
        }

        .modern-loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        }

        .loading-content {
          text-align: center;
          padding: 40px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .prospect-header {
          position: relative;
        }

        .header-background {
          background-attachment: fixed;
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

        .content-card-modern {
          transition: all 0.3s ease;
        }

        .content-card-modern:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
        }

        .modern-tabs {
          margin-top: 0;
        }

        .modern-tabs .ant-tabs-tab {
          border-radius: 8px 8px 0 0;
          border: 1px solid #f0f0f0;
          background: #fafafa;
          margin-right: 4px;
          transition: all 0.3s ease;
          padding: 12px 16px;
        }

        .modern-tabs .ant-tabs-tab:hover {
          background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
          border-color: #667eea;
          transform: translateY(-1px);
        }

        .modern-tabs .ant-tabs-tab-active
      `}</style>
    </div>
  );
}

export default ProspectDetails;