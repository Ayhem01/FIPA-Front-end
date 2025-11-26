import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    Card, Descriptions, Button, Space, Spin, Tag, Tabs, Typography, Modal,
    message, Divider, Row, Col, Breadcrumb, Statistic, Tooltip, Badge, Checkbox, List,
    Dropdown, Menu, Steps, Alert, Timeline, Form, DatePicker, Select, Input, Progress, InputNumber,
    Avatar, Table, Upload, Grid, Empty
} from 'antd';
import {
    DeleteOutlined, ArrowLeftOutlined, ExclamationCircleOutlined,
    MailOutlined, PhoneOutlined, UserOutlined, CalendarOutlined, FileTextOutlined,
    BankOutlined, TeamOutlined, CheckCircleOutlined, CloseCircleOutlined,
    QuestionCircleOutlined, DownOutlined, EllipsisOutlined, HistoryOutlined, LoadingOutlined, PlusOutlined,
    MessageOutlined, InfoCircleOutlined, SendOutlined, AuditOutlined, BellOutlined, RightOutlined,
    SearchOutlined, SettingOutlined, ClockCircleOutlined, ArrowUpOutlined, WarningOutlined, LinkOutlined,
    ProjectOutlined, DollarOutlined, FundOutlined, BarChartOutlined, FlagOutlined, ApartmentOutlined,
    EnvironmentOutlined, GlobalOutlined, SolutionOutlined, EditOutlined, CheckOutlined,
    SyncOutlined, ToolOutlined, PauseCircleOutlined, UploadOutlined, InboxOutlined, FileOutlined,
    HomeOutlined, FireOutlined, ThunderboltOutlined, ReloadOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

import {
    getProjectById,
    deleteProject,
    updateProjectStatus,
    initializeProjectPipeline,
    advanceProjectPipeline,
    resetOperation,
    getProjectPipelineStatus,
    finalizeProjectPipeline
} from '../../features/projectSlice';
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
import BlockageForm from '../Blockages/BlockageForm'; // AJOUT

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

          <Text type="secondary" style={{ fontSize: '13px', fontWeight: 500 }}>
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
};const getStatusInfo = (status) => {
    switch (status) {
        case 'planned':
            return {
                icon: <CalendarOutlined />,
                text: 'Planifié',
                color: '#faad14'
            };
        case 'in_progress':
            return {
                icon: <SyncOutlined spin />,
                text: 'En cours',
                color: '#1890ff'
            };
        case 'completed':
            return {
                icon: <CheckCircleOutlined />,
                text: 'Terminé',
                color: '#52c41a'
            };
        case 'on_hold':
            return {
                icon: <ClockCircleOutlined />,
                text: 'En attente',
                color: '#8c8c8c'
            };
        case 'suspended':
            return {
                icon: <PauseCircleOutlined />,
                text: 'Suspendu',
                color: '#fa8c16'
            };
        case 'abandoned':
            return {
                icon: <CloseCircleOutlined />,
                text: 'Abandonné',
                color: '#ff4d4f'
            };
        default:
            return {
                icon: <QuestionCircleOutlined />,
                text: 'Inconnu',
                color: '#d9d9d9'
            };
    }
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

const ProjetDetails = () => {
    const [taskForm] = Form.useForm();
    const [shouldCreateTask, setShouldCreateTask] = useState(false);
    const screens = useBreakpoint();

    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('details');
    const [pipelineModalVisible, setPipelineModalVisible] = useState(false);
    const [selectedPipelineStage, setSelectedPipelineStage] = useState(null);
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
    const [finalizeModalVisible, setFinalizeModalVisible] = useState(false);

    const {
        selectedProject: { data: projet, loading, error },
        projectPipeline: { data: pipelineData, loading: pipelineLoading },
        operation
    } = useSelector(state => state.projects);

    const pipelineStages = pipelineData?.stages || [];
    const currentStage = pipelineData?.current_stage || null;
    const progression = pipelineData?.stage_history || [];
    
    const pipelineCompletedAt = pipelineData?.project?.pipeline_completed_at || null;
    const pipelineCompleted = pipelineData?.pipeline_completed || false;
    const progressionPercentage = pipelineData?.progression_percentage || 0;

    const { pays, secteurs, entreprises } = useSelector(state => state.marketing);
    const currentUser = useSelector(state => state.user.user);

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
            dispatch(getProjectById(id));
            dispatch(getProjectPipelineStatus(id));
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
                    message.success('Projet supprimé avec succès');
                    navigate('/projets');
                    break;
                case 'update_status':
                    message.success('Statut mis à jour avec succès');
                    break;
                case 'initialize_pipeline':
                    message.success('Pipeline initialisé avec succès');
                    setTimeout(() => {
                        dispatch(getProjectPipelineStatus(id));
                        setRefreshTrigger(prev => prev + 1);
                    }, 500);
                    break;
                case 'advance_pipeline':
                    message.success('Progression dans le pipeline enregistrée');
                    setPipelineModalVisible(false);
                    dispatch(getProjectPipelineStatus(id));
                    break;
                case 'finalize_pipeline':
                    message.success('Projet finalisé avec succès ! Le pipeline est maintenant terminé.');
                    setFinalizeModalVisible(false);
                    dispatch(getProjectById(id));
                    dispatch(getProjectPipelineStatus(id));
                    setRefreshTrigger(prev => prev + 1);
                    break;
                default:
                    message.success('Opération réussie');
            }
        } else if (operation.error) {
            message.error(operation.error);
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
                entityType: 'projet',
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
            title: `Êtes-vous sûr de vouloir supprimer ce projet?`,
            icon: <ExclamationCircleOutlined />,
            content: 'Cette action est irréversible.',
            okText: 'Oui',
            okType: 'danger',
            cancelText: 'Non',
            onOk() {
                dispatch(deleteProject(id));
            }
        });
    };

    const openTaskModal = (stageId, stageName, task = null) => {
        setSelectedStageForTask(stageId);
        setSelectedStageName(stageName);
        setTaskModalVisible(true);
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await dispatch(updateProjectStatus({ id, status: newStatus })).unwrap();
            dispatch(getProjectById(id));
            message.success('Statut du projet mis à jour avec succès');
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
            message.error('Échec de la mise à jour du statut');
        }
    };

    const handleAdvancePipeline = async () => {
        try {
            const values = await pipelineForm.validateFields();
            const stageId = nextStage?.id;

            if (!stageId) {
                message.error('Aucune étape suivante disponible');
                return;
            }

            await dispatch(advanceProjectPipeline({
                id,
                stageData: {
                    stage_id: stageId,
                    notes: values.notes,
                    date: values.date?.format('YYYY-MM-DD HH:mm:ss')
                }
            })).unwrap();

            message.success('Progression enregistrée avec succès');
            setPipelineModalVisible(false);
            pipelineForm.resetFields();

            dispatch(getProjectById(id));
            dispatch(getProjectPipelineStatus(id));
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Erreur lors de l\'avancement:', error);
            message.error('Erreur lors de l\'avancement dans le pipeline');
        }
    };

    const handleFinalizePipeline = async () => {
        try {
            await dispatch(finalizeProjectPipeline(id)).unwrap();
            
            setFinalizeModalVisible(false);
            
            dispatch(getProjectById(id));
            dispatch(getProjectPipelineStatus(id));
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Erreur lors de la finalisation du pipeline:', error);
        }
    };

    const handleInitializePipeline = () => {
        dispatch(initializeProjectPipeline({ id }));
    };

    const loadBlockages = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/blockages`);
            const allBlockages = response.data.data || [];

            const stageBlockages = allBlockages.filter(
                blockage =>
                    blockage.blockable_type === 'projet' &&
                    blockage.blockable_id === parseInt(id) &&
                    blockage.pipeline_stageable_type === 'pipeline_stage' &&
                    blockage.pipeline_stageable_id === effectiveCurrentStage?.id
            );

            setBlockages(stageBlockages);
        } catch (error) {
            console.error('Erreur lors du chargement des blocages:', error);
        }
    }, [id, effectiveCurrentStage]);

    const renderStatus = (status) => {
        let color, text, icon;
      
        switch (status) {
          case "planned":
            color = "orange";
            text = "Planifié";
            icon = <CalendarOutlined />;
            break;
      
          case "in_progress":
            color = "processing";
            text = "En cours";
            icon = <SyncOutlined spin />;
            break;
      
          case "completed":
            color = "success";
            text = "Terminé";
            icon = <CheckCircleOutlined />;
            break;
      
          case "abandoned":
            color = "error";
            text = "Abandonné";
            icon = <CloseCircleOutlined />;
            break;
      
          case "suspended":
            color = "warning";
            text = "Suspendu";
            icon = <PauseCircleOutlined />;
            break;
      
          case "on_hold":
            color = "default";
            text = "En attente";
            icon = <ClockCircleOutlined />;
            break;
      
          default:
            color = "default";
            text = status || "Inconnu";
            icon = <InfoCircleOutlined />;
        }
      
        return (
          <Space>
            {icon}
            <Tag color={color}>{text}</Tag>
          </Space>
        );
    };

    const calculateProgress = () => {
        if (projet?.status === 'completed') {
            return 100;
        }
    
        if (pipelineData && typeof pipelineData.progression_percentage === 'number') {
            return Math.round(pipelineData.progression_percentage);
        }
    
        if (pipelineStages && pipelineStages.length > 0) {
            const totalStages = pipelineStages.length;
            
            if (progression && progression.length > 0) {
                const completedStages = progression.filter(prog => prog.completed === true || prog.completed === 1).length;
                
                const isLastStageCompleted = effectiveCurrentStage?.is_final && 
                    progression.some(prog => prog.stage_id === effectiveCurrentStage.id && (prog.completed === true || prog.completed === 1));
                
                if (isLastStageCompleted) {
                    return 100;
                }
                
                return Math.round((completedStages / totalStages) * 100);
            }
            
            if (effectiveCurrentStage) {
                const currentOrder = effectiveCurrentStage.order || 0;
                
                if (effectiveCurrentStage.is_final) {
                    return 95;
                }
                
                return Math.round((currentOrder / totalStages) * 100);
            }
        }
    
        return 0;
    };

    const isInFinalStage = effectiveCurrentStage?.is_final || false;
    const isProjectCompleted = projet?.status === 'completed';

    const formatMoney = (amount, currency = 'EUR') => {
        if (!amount) return 'Non défini';
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: currency
        }).format(amount);
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
                        <SyncOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                    </motion.div>
                    <Title level={4} style={{ color: '#666' }}>
                        Chargement des détails du projet...
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
                        <Button type="primary" onClick={() => navigate('/projets')} style={{ marginTop: 16 }}>
                            Retour à la liste
                        </Button>
                    </div>
                </Card>
            </motion.div>
        );
    }

    if (!projet) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="modern-container"
            >
                <Card className="modern-not-found-card">
                    <div className="not-found-content">
                        <InfoCircleOutlined className="not-found-icon" />
                        <Title level={4}>Projet non trouvé</Title>
                        <Text>Le projet que vous recherchez n'existe pas ou a été supprimé.</Text>
                        <Button type="primary" onClick={() => navigate('/projets')} style={{ marginTop: 24 }}>
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
                        <Link to="/projets">
                            <ProjectOutlined /> Projets
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <FlagOutlined /> {projet.titre || projet.title || projet.nom || 'Sans titre'}
                    </Breadcrumb.Item>
                </Breadcrumb>
            </motion.div>

            {/* En-tête principal identique à InviteDetails */}
            <motion.div
                variants={headerVariants}
                initial="hidden"
                animate="visible"
                className="projet-header"
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
                                    icon={<ProjectOutlined />} 
                                    style={{ 
                                        backgroundColor: projet.status === 'completed' ? '#52c41a' : 
                                                        projet.status === 'in_progress' ? '#1890ff' : 
                                                        projet.status === 'abandoned' ? '#ff4d4f' : '#faad14',
                                        fontSize: '28px',
                                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                                    }} 
                                />
                            </motion.div>
                            
                            <div>
                                <Title level={1} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
                                    {projet.titre || projet.title || projet.nom || 'Sans titre'}
                                    {projet.status === 'completed' && (
                                        <Tag color="success" style={{ marginLeft: 12 }}>
                                            <CheckOutlined /> Terminé
                                        </Tag>
                                    )}
                                </Title>
                                <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: '8px 0 0 0' }}>
                                    <BankOutlined style={{ marginRight: 6 }} />
                                    {projet.entreprise?.nom || projet.company_name || 'Entreprise non définie'} • 
                                    <CalendarOutlined style={{ marginLeft: 8, marginRight: 6 }} />
                                    Créé le {moment(projet.created_at).format('DD/MM/YYYY')}
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
        {/* Bouton pour changer le statut */}
        <Dropdown
            overlay={
                <Menu onClick={(e) => handleStatusChange(e.key)}>
                    <Menu.Item key="planned" icon={<CalendarOutlined />}>
                        Planifié
                    </Menu.Item>
                    <Menu.Item key="in_progress" icon={<SyncOutlined />}>
                        En cours
                    </Menu.Item>
                    <Menu.Item key="completed" icon={<CheckCircleOutlined />}>
                        Terminé
                    </Menu.Item>
                    <Menu.Item key="on_hold" icon={<ClockCircleOutlined />}>
                        En attente
                    </Menu.Item>
                    <Menu.Item key="suspended" icon={<PauseCircleOutlined />}>
                        Suspendu
                    </Menu.Item>
                    <Menu.Item key="abandoned" icon={<CloseCircleOutlined />} danger>
                        Abandonné
                    </Menu.Item>
                </Menu>
            }
            placement="bottomRight"
        >
            <Button 
                size="large"
                icon={<DownOutlined />}
                style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    borderRadius: '8px',
                    backdropFilter: 'blur(10px)',
                    fontWeight: 500
                }}
            >
                {screens.xs ? '' : 'Changer statut'}
            </Button>
        </Dropdown>

        {/* Bouton Modifier */}
        <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/projets/${id}/edit`)}
            size="large"
            style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)',
                fontWeight: 500
            }}
        >
            {screens.xs ? '' : 'Modifier'}
        </Button>

        {/* Bouton Supprimer */}
        <Button
            danger
            icon={<DeleteOutlined />}
            onClick={showDeleteConfirm}
            size="large"
            style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)',
                fontWeight: 500
            }}
        >
            {screens.xs ? '' : 'Supprimer'}
        </Button>

        {/* Bouton Finaliser (si phase finale et pas encore terminé) */}
        {isInFinalStage && !isProjectCompleted && (
            <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => setFinalizeModalVisible(true)}
                size="large"
                style={{
                    background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 500
                }}
            >
                {screens.xs ? 'Terminer' : 'Finaliser le projet'}
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
        icon={getStatusInfo(projet.status).icon}
        title="Statut du projet"
        value={getStatusInfo(projet.status).text}
        color={getStatusInfo(projet.status).color}
        delay={0}
    />
</Col>
                <Col xs={12} sm={6}>
                    <AnimatedStatCard
                        icon={<AuditOutlined />}
                        title="Phase actuelle"
                        value={effectiveCurrentStage?.name || 'Aucune'}
                        color="#1890ff"
                        delay={1}
                    />
                </Col>
                <Col xs={12} sm={6}>
                    <AnimatedStatCard
                        icon={<CalendarOutlined />}
                        title="Temps dans la phase"
                        value={progression && progression.length > 0
                            ? moment().diff(moment(progression[0].created_at), 'days')
                            : 0}
                        suffix=" jours"
                        color="#722ed1"
                        delay={2}
                    />
                </Col>
                <Col xs={12} sm={6}>
                    <AnimatedStatCard
                        icon={<DollarOutlined />}
                        title="Budget total"
                        value={formatMoney(projet.investment_amount || projet.budget, projet.devise)}
                        color="#13c2c2"
                        delay={3}
                    />
                </Col>
            </Row>

            {/* Visualisation du pipeline */}
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
                                {nextStage && !isInFinalStage && (
                                    <Button
                                        type="primary"
                                        icon={<RightOutlined />}
                                        onClick={() => setPipelineModalVisible(true)}
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
                            entityType="projet"
                            entityId={id}
                            stages={pipelineStages}
                            currentStage={currentStage}
                            progression={progression || []}
                            pipelineCompletedAt={pipelineCompletedAt}
                            onStagesChange={() => dispatch(getProjectPipelineStatus(id))}
                            showAddButton={true}
                            buttonText="Ajouter une phase"
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
                                    <Title level={4}>Informations du projet</Title>
                                    <Button 
                                        icon={<EditOutlined />} 
                                        onClick={() => navigate(`/projets/${id}/edit`)}
                                        style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontWeight: 500
                                        }}
                                    >
                                        Modifier
                                    </Button>
                                </div>

                                <Descriptions bordered column={{ xs: 1, sm: 2 }} className="modern-descriptions">
                                    <Descriptions.Item label="Titre du projet">
                                        <Text strong>{projet.title || projet.nom}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Entreprise">
                                        {projet.entreprise?.nom || projet.company_name || 'Non assignée'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Secteur d'activité">
                                        {projet.secteur?.nom || projet.secteur?.name || 'Non renseigné'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Pays">
                                        {projet.pays?.nom || 'Non renseigné'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Montant d'investissement">
                                        {formatMoney(projet.investment_amount || projet.budget || 0, projet.devise || 'EUR')}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Responsable">
                                        {projet.responsable?.name || 'Non assigné'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Date de début">
                                        {projet.start_date ? moment(projet.start_date).format('DD/MM/YYYY') : 'Non définie'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Date de fin estimée">
                                        {projet.end_date ? moment(projet.end_date).format('DD/MM/YYYY') : 'Non définie'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Contact initial">
                                        {projet.initial_contact_person || 'Non renseigné'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Emplois prévus">
                                        <Tag color="blue">{projet.jobs_expected || 0} emplois</Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Statut">
                                        {renderStatus(projet.status)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Progression">
                                        <Progress 
                                            percent={calculateProgress()} 
                                            strokeColor={{
                                                '0%': '#667eea',
                                                '100%': '#764ba2',
                                            }}
                                        />
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Description" span={2}>
                                        {projet.description || 'Aucune description disponible.'}
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>
                        </TabPane>
<TabPane tab={
    <Space>
        <AuditOutlined />
        Phases
    </Space>
} key="stages">
    <div className="tab-content">
        {pipelineStages.length > 0 ? (
            <Card title="Progression dans le pipeline" className="stages-card">
                <PipelineVisualizer
                    stages={pipelineStages}
                    currentStage={effectiveCurrentStage}
                    progression={progression || []}
                    entityStatus={projet?.status}
                />
            </Card>
        ) : (
            <Alert
                message="Aucun pipeline défini"
                description="Ce projet n'a pas encore de pipeline de suivi défini."
                type="info"
                showIcon
                action={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            dispatch(initializeProjectPipeline({ id }));
                        }}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 500
                        }}
                    >
                        Initialiser le pipeline
                    </Button>
                }
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
      entityType="projet"
      entityId={id}
      pipelineStages={pipelineStages || []}
      title="Blocages par phase du pipeline"
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
                                                message.error("Aucune phase active pour ajouter une tâche.");
                                                return;
                                            }
                                            openTaskModal(effectiveCurrentStage.id, effectiveCurrentStage.name);
                                        }}
                                        style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: 500
                                        }}
                                    >
                                        Ajouter une tâche
                                    </Button>
                                </div>

                                <PipelineTasks
                                    entityType="projet"
                                    entityId={id}
                                    stageId={effectiveCurrentStage?.id}
                                    onEdit={(task) => {
                                        openTaskModal(task.pipeline_stage_id, effectiveCurrentStage?.name, task);
                                    }}
                                />
                            </div>
                        </TabPane>

                       
                    </Tabs>
                </AnimatedContentCard>
            </motion.div>

            {/* Modaux */}
            

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
    entityType="projet"
    entityId={id}
    pipelineStageType="pipeline_stage"
    pipelineStageId={effectiveCurrentStage?.id}
  />
</Modal>
            <Modal
                title={`Passer à la phase: ${nextStage?.name || ''}`}
                open={pipelineModalVisible}
                onCancel={() => setPipelineModalVisible(false)}
                width={600}
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
                        <TextArea rows={4} placeholder="Informations complémentaires sur cette phase" />
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
  entityType="projet"
  entityId={id}
  stageId={selectedStageForTask}
  stageName={selectedStageName}
  entityName={projet?.titre || projet?.nom}
/>

            <Modal
                title="Finaliser le projet"
                open={finalizeModalVisible}
                onCancel={() => setFinalizeModalVisible(false)}
                width={600}
                footer={[
                    <Button key="cancel" onClick={() => setFinalizeModalVisible(false)}>
                        Annuler
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={handleFinalizePipeline}
                        loading={operation.loading && operation.type === 'finalize_pipeline'}
                    >
                        Finaliser le projet
                    </Button>
                ]}
            >
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <CheckCircleOutlined 
                        style={{ 
                            fontSize: 64, 
                            color: '#52c41a', 
                            marginBottom: 16,
                            display: 'block'
                        }} 
                    />
                    <Title level={4} style={{ marginBottom: 16 }}>
                        Êtes-vous sûr de vouloir finaliser ce projet ?
                    </Title>
                    <Paragraph style={{ marginBottom: 24, color: '#666' }}>
                        Cette action marquera le projet comme terminé et mettra à jour son statut. 
                        Une fois finalisé, le projet passera automatiquement au statut "Terminé".
                    </Paragraph>
                    
                    <Alert
                        message="Information importante"
                        description="La finalisation du projet est une action définitive qui indique que toutes les phases ont été complétées avec succès."
                        type="info"
                        showIcon
                        style={{ textAlign: 'left' }}
                    />
                </div>
            </Modal>

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

                .projet-header {
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
                    margin-bottom: 24px;
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

                .modern-tabs .ant-tabs-tab-active {
                    background: white;
                    border-color: #667eea;
                    border-bottom-color: white;
                }

                .modern-tabs .ant-tabs-content-holder {
                    background: white;
                    border: 1px solid #f0f0f0;
                    border-radius: 0 8px 8px 8px;
                    padding: 0;
                }

                .tab-content {
                    padding: 24px;
                    min-height: 400px;
                }

                .modern-descriptions {
                    background: white;
                    border-radius: 8px;
                }

                .modern-descriptions .ant-descriptions-item-label {
                    font-weight: 600;
                    color: #333;
                    background: #fafafa;
                }

                .modern-descriptions .ant-descriptions-item-content {
                    background: white;
                }

                .info-card {
                    border-radius: 8px;
                    border: 1px solid #f0f0f0;
                    transition: all 0.3s ease;
                }

                .info-card:hover {
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    transform: translateY(-1px);
                }

                .stages-card {
                    border-radius: 8px;
                    border: 1px solid #f0f0f0;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }

                .stages-card .ant-card-head {
                    background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
                    border-bottom: 2px solid #e8e8e8;
                    border-radius: 8px 8px 0 0;
                }

                .stages-card .ant-card-head-title {
                    font-weight: 600;
                    color: #333;
                }

                .no-pipeline-alert {
                    border-radius: 8px;
                    border: 1px solid #1890ff;
                }

                .details-header,
                .tasks-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid #f0f0f0;
                }

                .details-header h4,
                .tasks-header h4 {
                    margin: 0;
                    color: #333;
                    font-weight: 600;
                }

                .empty-state {
                    padding: 60px 20px;
                }

                .empty-state .ant-empty-description {
                    color: #999;
                    font-size: 14px;
                }

                .modern-error-card,
                .modern-not-found-card {
                    text-align: center;
                    border-radius: 16px;
                    border: 1px solid #f0f0f0;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                }

                .error-content,
                .not-found-content {
                    padding: 60px 40px;
                }

                .error-icon {
                    font-size: 48px;
                    color: #ff4d4f;
                    margin-bottom: 24px;
                }

                .not-found-icon {
                    font-size: 48px;
                    color: #faad14;
                    margin-bottom: 24px;
                }

                /* Effet de brillance */
                .shine-effect {
                    pointer-events: none;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .modern-container {
                        padding: 16px;
                    }

                    .projet-header {
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

                    .tab-content {
                        padding: 16px;
                        min-height: 300px;
                    }

                    .details-header,
                    .tasks-header {
                        flex-direction: column;
                        gap: 12px;
                        align-items: flex-start;
                    }
                }

                @media (max-width: 576px) {
                    .projet-header {
                        padding: 20px !important;
                        border-radius: 12px !important;
                    }

                    .loading-content {
                        padding: 30px 20px;
                    }

                    .error-content,
                    .not-found-content {
                        padding: 40px 20px;
                    }

                    .tab-content {
                        padding: 12px;
                    }
                }
            `}</style>
        </div>
    );
};

export default ProjetDetails;