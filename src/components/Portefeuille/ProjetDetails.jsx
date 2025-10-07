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
    HomeOutlined
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

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;
const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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
    const [documentsModalVisible, setDocumentsModalVisible] = useState(false);
    // const [budgetModalVisible, setBudgetModalVisible] = useState(false);
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

    const statusMenu = (
      <Menu>
        <Menu.Item
          key="planned"
          disabled={projet?.status === "planned"}
          onClick={() => handleStatusChange("planned")}
        >
          <Badge color="orange" text="Planifié" />
        </Menu.Item>
    
        <Menu.Item
          key="in_progress"
          disabled={projet?.status === "in_progress"}
          onClick={() => handleStatusChange("in_progress")}
        >
          <Badge color="processing" text="En cours" />
        </Menu.Item>
    
        <Menu.Item
          key="completed"
          disabled={projet?.status === "completed"}
          onClick={() => handleStatusChange("completed")}
        >
          <Badge color="success" text="Terminé" />
        </Menu.Item>
    
        <Menu.Item
          key="abandoned"
          disabled={projet?.status === "abandoned"}
          onClick={() => handleStatusChange("abandoned")}
        >
          <Badge color="error" text="Abandonné" />
        </Menu.Item>
    
        <Menu.Item
          key="suspended"
          disabled={projet?.status === "suspended"}
          onClick={() => handleStatusChange("suspended")}
        >
          <Badge color="warning" text="Suspendu" />
        </Menu.Item>
    
        <Menu.Item
          key="on_hold"
          disabled={projet?.status === "on_hold"}
          onClick={() => handleStatusChange("on_hold")}
        >
          <Badge color="default" text="En attente" />
        </Menu.Item>
      </Menu>
    );

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
        // Si le projet est terminé, retourner 100%
        if (projet?.status === 'completed') {
            return 100;
        }
    
        // Vérifier si on a des données de pipeline avec pourcentage
        if (pipelineData && typeof pipelineData.progression_percentage === 'number') {
            return Math.round(pipelineData.progression_percentage);
        }
    
        // Si on a des stages et une progression
        if (pipelineStages && pipelineStages.length > 0) {
            const totalStages = pipelineStages.length;
            
            // Si on a une progression avec historique
            if (progression && progression.length > 0) {
                // Compter les étapes complétées
                const completedStages = progression.filter(prog => prog.completed === true || prog.completed === 1).length;
                
                // Si on est à la dernière étape et qu'elle est complétée
                const isLastStageCompleted = effectiveCurrentStage?.is_final && 
                    progression.some(prog => prog.stage_id === effectiveCurrentStage.id && (prog.completed === true || prog.completed === 1));
                
                if (isLastStageCompleted) {
                    return 100;
                }
                
                // Calculer le pourcentage basé sur les étapes complétées
                return Math.round((completedStages / totalStages) * 100);
            }
            
            // Sinon, utiliser l'ordre de l'étape actuelle
            if (effectiveCurrentStage) {
                const currentOrder = effectiveCurrentStage.order || 0;
                
                // Si c'est la dernière étape
                if (effectiveCurrentStage.is_final) {
                    return 95; // Presque terminé mais pas encore finalisé
                }
                
                // Calculer le pourcentage basé sur l'ordre actuel
                return Math.round((currentOrder / totalStages) * 100);
            }
        }
    
        // Par défaut, retourner 0
        return 0;
    };

    const isInFinalStage = effectiveCurrentStage?.is_final || false;
    const isProjectCompleted = projet?.status === 'completed';

    // Format money function
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
                    <Spin size="large" />
                    <Title level={4} style={{ marginTop: 16, color: '#666' }}>
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

            {/* En-tête principal */}
            <motion.div
                variants={headerVariants}
                initial="hidden"
                animate="visible"
            >
                <Card className="modern-header-card">
                    <div className="header-content">
                        <div className="header-info">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Avatar 
                                    size={64} 
                                    icon={<ProjectOutlined />} 
                                    style={{ 
                                        backgroundColor: projet.status === 'completed' ? '#52c41a' : 
                                                        projet.status === 'in_progress' ? '#1890ff' : 
                                                        projet.status === 'abandoned' ? '#ff4d4f' : '#faad14',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                    }} 
                                />
                            </motion.div>
                            <div className="header-details">
                                <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                                    {projet.titre || projet.title || projet.nom || 'Sans titre'}
                                    {projet.status === 'completed' && (
                                        <Tag color="success" style={{ marginLeft: 12 }}>
                                            <CheckOutlined /> Terminé
                                        </Tag>
                                    )}
                                </Title>
                                <Space size="large" style={{ marginTop: 8 }}>
                                    <Text type="secondary">
                                        <BankOutlined style={{ marginRight: 6 }} />
                                        {projet.entreprise?.nom || projet.company_name || 'Entreprise non définie'}
                                    </Text>
                                    <Text type="secondary">
                                        <CalendarOutlined style={{ marginRight: 6 }} />
                                        Créé le {moment(projet.created_at).format('DD/MM/YYYY')}
                                    </Text>
                                    <div>{renderStatus(projet.status)}</div>
                                </Space>
                            </div>
                        </div>

                        <div className="header-actions">
                            <Space size="middle">
                                <Button
                                    type="default"
                                    icon={<FileTextOutlined />}
                                    onClick={() => setDocumentsModalVisible(true)}
                                    className="modern-btn"
                                >
                                    {screens.xs ? '' : 'Documents'}
                                </Button>

                               

                                {nextStage && !isInFinalStage && (
                                    <Button
                                        type="default"
                                        icon={<RightOutlined />}
                                        onClick={() => setPipelineModalVisible(true)}
                                        className="modern-btn"
                                    >
                                        {screens.xs ? 'Avancer' : `Avancer `}
                                    </Button>
                                )}

                                {isInFinalStage && !isProjectCompleted && (
                                    <Button
                                        type="primary"
                                        icon={<CheckOutlined />}
                                        onClick={() => setFinalizeModalVisible(true)}
                                        className="modern-btn-primary"
                                    >
                                        {screens.xs ? 'Terminer' : 'Finaliser'}
                                    </Button>
                                )}

                                <Dropdown overlay={statusMenu} placement="bottomRight">
                                    <Button className="modern-btn">
                                        Statut <DownOutlined />
                                    </Button>
                                </Dropdown>

                                <Dropdown
                                    overlay={
                                        <Menu>
                                            <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => navigate(`/projets/${id}/edit`)}>
                                                Modifier
                                            </Menu.Item>
                                            <Menu.Divider />
                                            <Menu.Item key="delete" danger icon={<DeleteOutlined />} onClick={showDeleteConfirm}>
                                                Supprimer
                                            </Menu.Item>
                                        </Menu>
                                    }
                                >
                                    <Button icon={<EllipsisOutlined />} className="modern-btn" />
                                </Dropdown>
                            </Space>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Métriques de pipeline */}
            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
            >
                <Card className="modern-metrics-card">
                    <Row gutter={[24, 24]}>
                        <Col xs={24} sm={12} md={6}>
                            <div className="metric-item">
                                <div className="metric-icon">
                                    {projet.status === 'completed' ? 
                                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '24px' }} /> : 
                                        <ClockCircleOutlined style={{ color: '#faad14', fontSize: '24px' }} />
                                    }
                                </div>
                                <div className="metric-content">
                                    <div className="metric-label">Statut du projet</div>
                                    <div className="metric-value" style={{ 
                                        color: projet.status === 'completed' ? '#52c41a' : '#faad14' 
                                    }}>
                                        {projet.status === 'completed' ? "Terminé" : "En cours"}
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <div className="metric-item">
                                <div className="metric-icon">
                                    <AuditOutlined style={{ color: '#1890ff', fontSize: '24px' }} />
                                </div>
                                <div className="metric-content">
                                    <div className="metric-label">Phase actuelle</div>
                                    <div className="metric-value" style={{ color: '#1890ff' }}>
                                        {effectiveCurrentStage?.name || 'Aucune'}
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <div className="metric-item">
                                <div className="metric-icon">
                                    <CalendarOutlined style={{ color: '#722ed1', fontSize: '24px' }} />
                                </div>
                                <div className="metric-content">
                                    <div className="metric-label">Temps dans la phase</div>
                                    <div className="metric-value" style={{ color: '#722ed1' }}>
                                        {progression && progression.length > 0
                                            ? moment().diff(moment(progression[0].created_at), 'days')
                                            : 0} jours
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <div className="metric-item">
                                <div className="metric-icon">
                                    <DollarOutlined style={{ color: '#13c2c2', fontSize: '24px' }} />
                                </div>
                                <div className="metric-content">
                                    <div className="metric-label">Budget total</div>
                                    <div className="metric-value" style={{ color: '#13c2c2' }}>
                                        {formatMoney(projet.investment_amount || projet.budget, projet.devise)}
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card>
            </motion.div>

            {/* Visualisation du pipeline */}
            {pipelineStages.length > 0 ? (
                <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.3 }}
                >
                    <Card className="modern-pipeline-card" title={
                        <Space>
                            <AuditOutlined />
                            Pipeline de suivi
                        </Space>
                    }>
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
                    </Card>
                </motion.div>
            ) : (
                <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.3 }}
                >
                    <Card className="modern-pipeline-card">
                        <Alert
                            message="Pipeline non initialisé"
                            description={
                                <div>
                                    <p>Ce projet n'a pas encore de pipeline défini.</p>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={handleInitializePipeline}
                                        disabled={projet?.status === 'completed' || projet?.status === 'abandoned'}
                                        style={{ marginTop: 10 }}
                                        className="modern-btn-primary"
                                    >
                                        Initialiser le pipeline
                                    </Button>
                                </div>
                            }
                            type="info"
                            showIcon
                            className="no-pipeline-alert"
                        />
                    </Card>
                </motion.div>
            )}

            {/* Contenu principal avec onglets */}
            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.4 }}
            >
                <Card className="modern-content-card">
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
                                        className="modern-btn"
                                    >
                                        Modifier
                                    </Button>
                                </div>

                                <Row gutter={16} style={{ marginBottom: 24 }}>
                                    <Col xs={24} sm={12} md={6}>
                                        <Card size="small" className="info-card">
                                            <Statistic
                                                title="Budget total"
                                                value={projet.investment_amount || projet.budget || 0}
                                                precision={0}
                                                valueStyle={{ color: '#3f8600' }}
                                                prefix={<DollarOutlined />}
                                                suffix={projet.devise || 'EUR'}
                                            />
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={12} md={6}>
                                        <Card size="small" className="info-card">
                                            <Statistic
                                                title="Emplois prévus"
                                                value={projet.jobs_expected || 0}
                                                valueStyle={{ color: '#1890ff' }}
                                                prefix={<TeamOutlined />}
                                            />
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={12} md={6}>
                                        <Card size="small" className="info-card">
                                            <Statistic
                                                title="Progression"
                                                value={calculateProgress()}
                                                valueStyle={{ color: '#722ed1' }}
                                                prefix={<BarChartOutlined />}
                                                suffix="%"
                                            />
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={12} md={6}>
                                        <Card size="small" className="info-card">
                                            <Statistic
                                                title="Durée estimée"
                                                value={projet.end_date && projet.start_date ?
                                                    moment(projet.end_date).diff(moment(projet.start_date), 'months') :
                                                    'N/A'
                                                }
                                                valueStyle={{ color: '#cf1322' }}
                                                prefix={<CalendarOutlined />}
                                                suffix="mois"
                                            />
                                        </Card>
                                    </Col>
                                </Row>

                                <Descriptions bordered column={{ xs: 1, sm: 2 }} className="modern-descriptions">
                                    <Descriptions.Item label="Titre du projet">{projet.title || projet.nom}</Descriptions.Item>
                                    <Descriptions.Item label="Entreprise">{projet.entreprise?.nom || projet.company_name || 'Non assignée'}</Descriptions.Item>
                                    <Descriptions.Item label="Secteur d'activité">{projet.secteur?.nom || projet.secteur?.name || 'Non renseigné'}</Descriptions.Item>
                                    <Descriptions.Item label="Pays">{projet.pays?.nom || 'Non renseigné'}</Descriptions.Item>
                                    <Descriptions.Item label="Montant d'investissement">
                                        {formatMoney(projet.investment_amount || projet.budget || 0, projet.devise || 'EUR')}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Responsable">{projet.responsable?.name || 'Non assigné'}</Descriptions.Item>
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
                                    <Descriptions.Item label="Description" span={2}>
                                        {projet.description || 'Aucune description disponible.'}
                                    </Descriptions.Item>
                                </Descriptions>

                                <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                                    <Col xs={24} md={8}>
                                        <Card size="small" className="info-card" title="Détails financiers">
                                            <p>Montant d'investissement: {formatMoney(projet.investment_amount || projet.budget || 0, projet.devise || 'EUR')}</p>
                                            <p>Pourcentage étranger: {projet.foreign_percentage || 0}%</p>
                                            <p>Zone industrielle: {projet.industrial_zone || 'Non spécifiée'}</p>
                                        </Card>
                                    </Col>
                                    <Col xs={24} md={8}>
                                        <Card size="small" className="info-card" title="État du projet">
                                            <p>
                                                <Badge status={projet.in_progress ? "processing" : "default"} text={projet.in_progress ? "🚀 En cours" : "Non démarré"} />
                                            </p>
                                            <p>
                                                <Badge status={projet.in_production ? "success" : "default"} text={projet.in_production ? "🏭 En production" : "Pas en production"} />
                                            </p>
                                            <p>
                                                <Badge status={projet.is_blocked ? "error" : "default"} text={projet.is_blocked ? "⛔ Bloqué" : "Non bloqué"} />
                                            </p>
                                        </Card>
                                    </Col>
                                    <Col xs={24} md={8}>
                                        <Card size="small" className="info-card" title="Notes internes">
                                            <Text>{projet.notes || 'Aucune note interne.'}</Text>
                                        </Card>
                                    </Col>
                                </Row>
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
                                    <>
                                        <Card title="Progression dans le pipeline" className="stages-card">
                                            <PipelineVisualizer
                                                stages={pipelineStages}
                                                currentStage={effectiveCurrentStage}
                                                progression={progression || []}
                                                entityStatus={projet?.status}
                                            />
                                        </Card>

                                        <Card title="Actions de progression" style={{ marginTop: 16 }}>
                                            <div style={{ marginBottom: 16 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <Text strong>Phase actuelle : </Text>
                                                        <Tag color={effectiveCurrentStage?.is_final ? 'green' : 'blue'}>
                                                            {effectiveCurrentStage?.name || 'Non définie'}
                                                        </Tag>
                                                        {effectiveCurrentStage?.is_final && (
                                                            <Tag color="gold" style={{ marginLeft: 8 }}>
                                                                Phase finale
                                                            </Tag>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    {nextStage ? (
                                                        <div>
                                                            <Text strong>Prochaine phase : </Text>
                                                            <Tag color="orange">{nextStage.name}</Tag>
                                                            {nextStage.is_final && (
                                                                <Tag color="gold" style={{ marginLeft: 8 }}>
                                                                    Finale
                                                                </Tag>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <Text type="success" strong>✓ Dernière phase atteinte</Text>
                                                    )}
                                                </div>
                                                <div>
                                                    {nextStage && !isInFinalStage && (
                                                        <Button
                                                            type="primary"
                                                            icon={<RightOutlined />}
                                                            onClick={() => setPipelineModalVisible(true)}
                                                        >
                                                            Avancer vers : {nextStage.name}
                                                        </Button>
                                                    )}

                                                    {isInFinalStage && !isProjectCompleted && (
                                                        <Button
                                                            type="primary"
                                                            icon={<CheckOutlined />}
                                                            onClick={() => setFinalizeModalVisible(true)}
                                                        >
                                                            Finaliser
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    </>
                                ) : (
                                    <Alert
                                        message="Aucun pipeline défini"
                                        description="Ce projet n'a pas encore de pipeline de suivi défini."
                                        type="info"
                                        showIcon
                                        action={
                                            <Button
                                                type="primary"
                                                onClick={handleInitializePipeline}
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
                                        className="modern-btn-primary"
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

                        <TabPane tab={
                            <Space>
                                <FileTextOutlined />
                                Documents
                            </Space>
                        } key="documents">
                            <div className="tab-content">
                                <div className="details-header">
                                    <Title level={4}>Documents du projet</Title>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={() => setDocumentsModalVisible(true)}
                                        className="modern-btn-primary"
                                    >
                                        Ajouter un document
                                    </Button>
                                </div>
                                <Empty description="Aucun document attaché" className="empty-state" />
                            </div>
                        </TabPane>

                        {/* <TabPane tab={
                            <Space>
                                <DollarOutlined />
                                Budget
                            </Space>
                        } key="budget">
                            <div className="tab-content">
                                <div className="details-header">
                                    <Title level={4}>Suivi budgétaire</Title>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={() => setBudgetModalVisible(true)}
                                        className="modern-btn-primary"
                                    >
                                        Ajouter une ligne budgétaire
                                    </Button>
                                </div>

                                <Row gutter={16} style={{ marginBottom: 24 }}>
                                    <Col xs={24} sm={8}>
                                        <Card size="small" className="info-card">
                                            <Statistic
                                                title="Budget total"
                                                value={projet.investment_amount || projet.budget || 0}
                                                precision={0}
                                                valueStyle={{ color: '#3f8600' }}
                                                prefix={<DollarOutlined />}
                                                suffix={projet.devise || 'EUR'}
                                            />
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Card size="small" className="info-card">
                                            <Statistic
                                                title="Dépensé"
                                                value={0}
                                                precision={0}
                                                valueStyle={{ color: '#cf1322' }}
                                                prefix={<DollarOutlined />}
                                                suffix={projet.devise || 'EUR'}
                                            />
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Card size="small" className="info-card">
                                            <Statistic
                                                title="Restant"
                                                value={projet.investment_amount || projet.budget || 0}
                                                precision={0}
                                                valueStyle={{ color: '#1890ff' }}
                                                prefix={<DollarOutlined />}
                                                suffix={projet.devise || 'EUR'}
                                            />
                                        </Card>
                                    </Col>
                                </Row>

                                <Empty description="Aucune ligne budgétaire" className="empty-state" />
                            </div>
                        </TabPane> */}
{/* 
                        <TabPane tab={
                            <Space>
                                <TeamOutlined />
                                Équipe
                            </Space>
                        } key="team">
                            <div className="tab-content">
                                <div className="details-header">
                                    <Title level={4}>Équipe projet</Title>
                                    <Button 
                                        type="primary" 
                                        icon={<PlusOutlined />}
                                        className="modern-btn-primary"
                                    >
                                        Ajouter un membre
                                    </Button>
                                </div>

                                <List
                                    itemLayout="horizontal"
                                    dataSource={[
                                        {
                                            id: 1,
                                            name: projet.responsable?.name || 'Non assigné',
                                            role: 'Chef de projet',
                                            avatar: <UserOutlined />
                                        }
                                    ]}
                                    renderItem={item => (
                                        <List.Item
                                            actions={[
                                                <Button type="text" icon={<EditOutlined />}>Modifier</Button>,
                                                <Button type="text" danger icon={<DeleteOutlined />}>Supprimer</Button>
                                            ]}
                                        >
                                            <List.Item.Meta
                                                avatar={<Avatar icon={item.avatar} />}
                                                title={item.name}
                                                description={item.role}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </div>
                        </TabPane> */}
                    </Tabs>
                </Card>
            </motion.div>

            {/* Modaux */}
            <Modal
                title={`Passer à la phase ${nextStage?.order || ''} : ${nextStage?.name || ''}`}
                visible={pipelineModalVisible}
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

            <Modal
                title="Documents du projet"
                visible={documentsModalVisible}
                onCancel={() => setDocumentsModalVisible(false)}
                width={800}
                footer={[
                    <Button key="cancel" onClick={() => setDocumentsModalVisible(false)}>
                        Fermer
                    </Button>,
                    <Button key="upload" type="primary" icon={<UploadOutlined />}>
                        Télécharger
                    </Button>
                ]}
            >
                <Upload.Dragger multiple listType="picture">
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Cliquez ou glissez-déposez des fichiers dans cette zone</p>
                    <p className="ant-upload-hint">
                        Tous les formats de documents sont acceptés. Taille maximale: 10MB.
                    </p>
                </Upload.Dragger>

                <Divider />

                <List
                    header={<div>Documents attachés</div>}
                    bordered
                    dataSource={[]}
                    renderItem={item => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<FileOutlined />}
                                title={item.name}
                                description={item.description}
                            />
                        </List.Item>
                    )}
                    locale={{ emptyText: 'Aucun document attaché' }}
                />
            </Modal>

            {/* <Modal
                title="Gestion du budget"
                visible={budgetModalVisible}
                onCancel={() => setBudgetModalVisible(false)}
                width={800}
                footer={[
                    <Button key="cancel" onClick={() => setBudgetModalVisible(false)}>
                        Fermer
                    </Button>,
                    <Button key="save" type="primary">
                        Enregistrer
                    </Button>
                ]}
            >
                <Form layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="line_title"
                                label="Titre"
                                rules={[{ required: true, message: 'Veuillez entrer un titre' }]}
                            >
                                <Input placeholder="Ex: Achat d'équipement" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="amount"
                                label="Montant"
                                rules={[{ required: true, message: 'Veuillez entrer un montant' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="Montant"
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                    addonAfter={projet.devise || 'EUR'}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <TextArea rows={3} placeholder="Description détaillée" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="category"
                                label="Catégorie"
                            >
                                <Select placeholder="Sélectionner une catégorie">
                                    <Option value="equipement">Équipement</Option>
                                    <Option value="personnel">Personnel</Option>
                                    <Option value="services">Services</Option>
                                    <Option value="immobilier">Immobilier</Option>
                                    <Option value="marketing">Marketing</Option>
                                    <Option value="autre">Autre</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="date"
                                label="Date de dépense"
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>

                <Divider />

                <Table
                    columns={[
                        { title: 'Titre', dataIndex: 'title', key: 'title' },
                        { title: 'Montant', dataIndex: 'amount', key: 'amount' },
                        { title: 'Catégorie', dataIndex: 'category', key: 'category' },
                        { title: 'Date', dataIndex: 'date', key: 'date' },
                        {
                            title: 'Action',
                            key: 'action',
                            render: (_, record) => (
                                <Space size="middle">
                                    <Button icon={<EditOutlined />} size="small" type="text">Modifier</Button>
                                    <Button icon={<DeleteOutlined />} size="small" type="text" danger>Supprimer</Button>
                                </Space>
                            ),
                        },
                    ]}
                    dataSource={[]}
                    locale={{ emptyText: 'Aucune ligne budgétaire' }}
                />
            </Modal> */}

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
                visible={finalizeModalVisible}
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
    }

    .loading-content {
        text-align: center;
        padding: 40px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }

    .modern-header-card {
        border-radius: 16px;
        border: 1px solid #f0f0f0;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        margin-bottom: 24px;
        overflow: hidden;
    }

    .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px;
    }

    .header-info {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .header-details {
        flex: 1;
    }

    .header-actions {
        display: flex;
        align-items: center;
    }

    .modern-metrics-card {
        border-radius: 16px;
        border: 1px solid #f0f0f0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        margin-bottom: 24px;
    }

    /* Styles pour les métriques - identiques aux autres composants */
    .metric-item {
        display: flex;
        align-items: center;
        padding: 20px;
        background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
        border-radius: 12px;
        border: 1px solid #f0f0f0;
        transition: all 0.3s ease;
        height: 100%;
    }

    .metric-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    }

    .metric-icon {
        margin-right: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.8);
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .metric-content {
        flex: 1;
    }

    .metric-label {
        font-size: 14px;
        color: #666;
        font-weight: 500;
        margin-bottom: 4px;
        line-height: 1.2;
    }

    .metric-value {
        font-size: 18px;
        font-weight: 700;
        line-height: 1.2;
    }

    .modern-pipeline-card {
        border-radius: 16px;
        border: 1px solid #f0f0f0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        margin-bottom: 24px;
    }

    .modern-content-card {
        border-radius: 16px;
        border: 1px solid #f0f0f0;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        overflow: hidden;
    }

    .modern-tabs .ant-tabs-tab {
        padding: 12px 24px;
        font-weight: 500;
    }

    .modern-tabs .ant-tabs-tab-active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white !important;
        border-radius: 8px 8px 0 0;
    }

    .tab-content {
        padding: 24px;
    }

    .details-header,
    .tasks-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
    }

    .details-header h4,
    .tasks-header h4 {
        margin: 0;
        color: #333;
    }

    .modern-descriptions {
        border-radius: 8px;
        overflow: hidden;
    }

    .modern-descriptions .ant-descriptions-item-label {
        background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
        font-weight: 600;
    }

    .info-card {
        border-radius: 8px;
        border: 1px solid #f0f0f0;
        transition: all 0.3s ease;
    }

    .info-card:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        transform: translateY(-2px);
    }

    .stages-card {
        border-radius: 12px;
        border: 1px solid #f0f0f0;
    }

    .no-pipeline-alert {
        border-radius: 8px;
    }

    .empty-state {
        padding: 40px 0;
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

    .modern-btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 8px;
        font-weight: 500;
        transition: all 0.3s ease;
    }

    .modern-btn-primary:hover {
        background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .modern-error-card,
    .modern-not-found-card {
        border-radius: 16px;
        border: 1px solid #f0f0f0;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        margin: 40px auto;
        max-width: 500px;
    }

    .error-content,
    .not-found-content {
        text-align: center;
        padding: 40px 20px;
    }

    .error-icon {
        font-size: 48px;
        color: #ff4d4f;
        margin-bottom: 16px;
    }

    .not-found-icon {
        font-size: 48px;
        color: #1890ff;
        margin-bottom: 16px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .modern-container {
            padding: 16px;
        }

        .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
        }

        .header-actions {
            width: 100%;
            justify-content: space-between;
        }

        .tab-content {
            padding: 16px;
        }

        .details-header,
        .tasks-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
        }

        .metric-item {
            padding: 16px;
            text-align: center;
            flex-direction: column;
        }

        .metric-icon {
            margin-right: 0;
            margin-bottom: 12px;
        }

        .metric-value {
            font-size: 16px;
        }
    }

    @media (max-width: 576px) {
        .header-info {
            flex-direction: column;
            align-items: center;
            text-align: center;
        }

        .modern-metrics-card .ant-col {
            margin-bottom: 16px;
        }

        .metric-item {
            padding: 12px;
        }

        .metric-icon {
            width: 40px;
            height: 40px;
        }

        .metric-icon svg {
            font-size: 20px !important;
        }

        .metric-value {
            font-size: 14px;
        }

        .metric-label {
            font-size: 12px;
        }
    }

    /* Améliorations visuelles */
    .ant-card-head {
        background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
        border-bottom: 1px solid #e8e8e8;
    }

    .ant-card-head-title {
        font-weight: 600;
        color: #333;
    }

    .ant-statistic-title {
        font-size: 14px;
        font-weight: 500;
        color: #666;
    }

    .ant-statistic-content {
        font-size: 20px;
        font-weight: 600;
    }

    .ant-progress-inner {
        background-color: #f5f5f5;
    }

    .ant-progress-bg {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .ant-alert {
        border-radius: 8px;
    }

    .ant-form-item-label > label {
        font-weight: 500;
        color: #333;
    }

    .ant-input,
    .ant-select-selector,
    .ant-picker {
        border-radius: 6px;
        border: 1px solid #d9d9d9;
        transition: all 0.3s ease;
    }

    .ant-input:focus,
    .ant-select-focused .ant-select-selector,
    .ant-picker:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
    }

    .ant-btn {
        border-radius: 6px;
        font-weight: 500;
        transition: all 0.3s ease;
    }

    .ant-modal-header {
        background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
        border-bottom: 1px solid #e8e8e8;
    }

    .ant-modal-title {
        font-weight: 600;
        color: #333;
    }

    .ant-tag {
        border-radius: 4px;
        font-weight: 500;
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

    .ant-list-item {
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 8px;
        background: #fafafa;
        border: 1px solid #f0f0f0;
        transition: all 0.3s ease;
    }

    .ant-list-item:hover {
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transform: translateY(-1px);
    }

    /* Animations supplémentaires */
    .ant-card {
        transition: all 0.3s ease;
    }

    .ant-card:hover {
        box-shadow: 0 6px 24px rgba(0,0,0,0.12);
    }
`}</style>
</div>
);
};

export default ProjetDetails;