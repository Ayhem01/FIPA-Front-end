import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    Card, Descriptions, Button, Space, Spin, Tag, Tabs, Typography, Modal,
    message, Divider, Row, Col, Breadcrumb, Statistic, Tooltip, Badge, Checkbox, List,
    Dropdown, Menu, Steps, Alert, Timeline, Form, DatePicker, Select, Input, Progress, InputNumber,
    Avatar, Table, Upload
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
    SyncOutlined, ToolOutlined, PauseCircleOutlined, UploadOutlined, InboxOutlined, FileOutlined
} from '@ant-design/icons';

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
import { Empty } from 'antd/lib';
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
// import { formatMoney } from '../../utils/formatters';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;
const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const ProjetDetails = () => {
    const [taskForm] = Form.useForm();
    const [shouldCreateTask, setShouldCreateTask] = useState(false);

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
    const [budgetModalVisible, setBudgetModalVisible] = useState(false);
    const [finalizeModalVisible, setFinalizeModalVisible] = useState(false);

    const {
        selectedProject: { data: projet, loading, error },
        projectPipeline: { data: pipelineData, loading: pipelineLoading },
        operation
    } = useSelector(state => state.projects);

    // Et ajouter cette extraction de données après le useSelector :

    const pipelineStages = pipelineData?.stages || [];
    const currentStage = pipelineData?.current_stage || null;
    const progression = pipelineData?.stage_history || [];
    
    // ✅ Ajouter l'extraction des données de completion du pipeline
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

    // Charger les données du projet et son pipeline
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

    // Gérer les opérations réussies ou échouées
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
                        dispatch(getProjectPipelineStatus(id)); // Correction ici - utiliser la bonne fonction
                        setRefreshTrigger(prev => prev + 1);
                    }, 500);
                    break;
                case 'advance_pipeline':
                    message.success('Progression dans le pipeline enregistrée');
                    setPipelineModalVisible(false);
                    dispatch(getProjectPipelineStatus(id)); // Correction ici - utiliser la bonne fonction
                    break;
                case 'finalize_pipeline':
                    message.success('Projet finalisé avec succès ! Le pipeline est maintenant terminé.');
                    setFinalizeModalVisible(false);
                    // Rafraîchir toutes les données du projet
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

                    // Diviser les tâches en "planifiées" (futures) et "récentes" (passées)
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

    // Confirmation de suppression
    const showDeleteConfirm = () => {
        confirm({
            title: `Êtes-vous sûr de vouloir supprimer ce projet?`,
            icon: <ExclamationCircleOutlined />,
            content: 'Cette action est irréversible.',
            okText: 'Oui',
            okType: 'danger',
            cancelText: 'Non',
            onOk() {
                dispatch(deleteProjet(id));
            }
        });
    };

    const openTaskModal = (stageId, stageName, task = null) => {
        setSelectedStageForTask(stageId);
        setSelectedStageName(stageName);
        setTaskModalVisible(true);
    };

    // Modifier le statut
    const handleStatusChange = async (newStatus) => {
        try {
            // Dispatch l'action et attendre sa résolution
            await dispatch(updateProjectStatus({ id, status: newStatus })).unwrap();
            
            // Après une mise à jour réussie, récupérer les données mises à jour du projet
            dispatch(getProjectById(id));
            
            // Afficher un message de succès
            message.success('Statut du projet mis à jour avec succès');
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
            message.error('Échec de la mise à jour du statut');
        }
    };

    // Avancer dans le pipeline
    // Remplacer la fonction handleAdvancePipeline par celle-ci:
    const handleAdvancePipeline = async () => {
        try {
            const values = await pipelineForm.validateFields();

            const stageId = nextStage?.id;

            if (!stageId) {
                message.error('Aucune étape suivante disponible');
                return;
            }

            // Envoyer les données au backend avec la bonne structure
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

            // Rafraîchir les données avec le nom de fonction correct
            dispatch(getProjectById(id));
            dispatch(getProjectPipelineStatus(id)); // Nom correct
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Erreur lors de l\'avancement:', error);
            message.error('Erreur lors de l\'avancement dans le pipeline');
        }
    };

    // Fonction pour finaliser le pipeline
    const handleFinalizePipeline = async () => {
        try {
            await dispatch(finalizeProjectPipeline(id)).unwrap();
            
            setFinalizeModalVisible(false);
            
            // Rafraîchir les données du projet
            dispatch(getProjectById(id));
            dispatch(getProjectPipelineStatus(id));
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Erreur lors de la finalisation du pipeline:', error);
            // Le message d'erreur est déjà géré dans le slice Redux
        }
    };

    const loadBlockages = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/blockages`);
            const allBlockages = response.data.data || [];

            // Filtrer pour ce pipeline et cette étape
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
        // Si le projet est complété, retourner 100%
        if (projet?.status === 'completed') {
            return 100;
        }

        // Si nous avons des données de progression du backend
        if (pipelineData && typeof pipelineData.progression_percentage === 'number') {
            return pipelineData.progression_percentage;
        }

        // Calcul basé sur les étapes complétées dans la progression
        if (progression && progression.length > 0 && pipelineStages && pipelineStages.length > 0) {
            const completedStages = progression.filter(prog => prog.completed).length;
            const totalStages = pipelineStages.length;
            
            // Si toutes les étapes sont complétées ou si on est dans l'étape finale et qu'elle est complétée
            const isLastStageCompleted = effectiveCurrentStage?.is_final && 
                progression.some(prog => prog.stage_id === effectiveCurrentStage.id && prog.completed);
            
            if (isLastStageCompleted || completedStages === totalStages) {
                return 100;
            }
            
            return Math.round((completedStages / totalStages) * 100);
        }

        // Calcul de secours si progression_percentage n'est pas disponible
        if (!pipelineStages || pipelineStages.length === 0) return 0;

        const totalStages = pipelineStages.length;
        const currentStageOrder = effectiveCurrentStage?.order || 0;

        // Si on est dans l'étape finale, considérer comme 90% (pas 100% tant que pas finalisé)
        if (effectiveCurrentStage?.is_final) {
            return 90;
        }

        return Math.round((currentStageOrder / totalStages) * 100);
    };

    // Vérifier si nous sommes dans l'étape finale
    const isInFinalStage = effectiveCurrentStage?.is_final || false;
    const isProjectCompleted = projet?.status === 'completed';

    // Affichage pendant le chargement
    if (loading) {
        return (
            <div className="loading-container">
                <Spin size="large" tip="Chargement des détails du projet..." />
            </div>
        );
    }

    // Affichage en cas d'erreur
    if (error) {
        return (
            <Card className="error-card">
                <div className="error-message">
                    <ExclamationCircleOutlined style={{ fontSize: 24, color: '#ff4d4f', marginBottom: 16 }} />
                    <Title level={4}>Erreur lors du chargement</Title>
                    <Text type="danger">{error}</Text>
                    <Button type="primary" onClick={() => navigate('/projets')} style={{ marginTop: 16 }}>
                        Retour à la liste
                    </Button>
                </div>
            </Card>
        );
    }

    // Affichage si le projet n'est pas trouvé
    if (!projet) {
        return (
            <Card className="not-found-card">
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <InfoCircleOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                    <Title level={4}>Projet non trouvé</Title>
                    <Text>Le projet que vous recherchez n'existe pas ou a été supprimé.</Text>
                    <div style={{ marginTop: 24 }}>
                        <Button type="primary" onClick={() => navigate('/projets')}>
                            Retour à la liste
                        </Button>
                    </div>
                </div>
            </Card>
        );
    }

    // RENDU AVEC DESIGN CRM
    return (
        <div className="crm-container">
            {/* En-tête avec le style CRM */}
            <div className="crm-header">
                <div className="crm-lead-info">
                    <div className="crm-avatar">
                        <Avatar icon={<ProjectOutlined />} size={42} style={{ backgroundColor: '#1890ff' }} />
                    </div>
                    <div className="crm-title">
                        <div className="crm-lead-label">
                            Projet: <span className="lead-name">"{projet.titre || projet.title || projet.nom || 'Sans titre'}"</span>
                            {projet.entreprise?.nom && <span className="lead-company"> - ({projet.entreprise.nom})</span>}
                            {projet.company_name && !projet.entreprise?.nom && <span className="lead-company"> - ({projet.company_name})</span>}
                        </div>
                        <div className="crm-lead-actions">
                            <Link to="#" className="crm-link">
                                {projet.secteur?.nom || projet.secteur?.name || 'Secteur non défini'}
                            </Link>
                            {projet.pays && <Link to="#" className="crm-link"><EnvironmentOutlined /> {projet.pays?.nom || 'Pays non défini'}</Link>}
                        </div>
                    </div>
                </div>

                <div className="crm-header-actions">
                    <Button
                        className="crm-btn crm-documents-btn"
                        icon={<FileTextOutlined />}
                        onClick={() => setDocumentsModalVisible(true)}
                    >
                        Documents
                    </Button>

                    <Button
                        className="crm-btn crm-budget-btn"
                        icon={<DollarOutlined />}
                        onClick={() => setBudgetModalVisible(true)}
                    >
                        Budget
                    </Button>

                    {/* {nextStage && !isInFinalStage && (
                        <Button
                            className="crm-btn crm-advance-btn"
                            type="primary"
                            icon={<RightOutlined />}
                            onClick={() => setPipelineModalVisible(true)}
                        >
                            Avancer vers: {nextStage.name}
                        </Button>
                    )} */}

                    {isInFinalStage && !isProjectCompleted && (
                        <Button
                            className="crm-btn crm-advance-btn"
                            type="primary"
                            icon={<CheckOutlined />}
                            onClick={() => setFinalizeModalVisible(true)}
                        >
                            Terminer
                        </Button>
                    )}

                    <Dropdown overlay={statusMenu} placement="bottomRight">
                        <Button className="crm-btn crm-options-btn">
                            Status <DownOutlined />
                        </Button>
                    </Dropdown>

                    <Button
                        className="crm-btn crm-edit-btn"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/projets/${id}/edit`)}
                    >
                        Modifier
                    </Button>

                    <Button
                        danger
                        className="crm-btn"
                        icon={<DeleteOutlined />}
                        onClick={showDeleteConfirm}
                    >
                        Supprimer
                    </Button>
                </div>
            </div>

            {/* Informations du pipeline */}
            <div className="crm-meta-info">
                <div className="crm-meta-item">
                    <div className="crm-meta-label">STATUT PIPELINE:</div>
                    <div className="crm-meta-value">
                        {renderStatus(projet.status)}
                    </div>
                </div>
                <div className="crm-meta-item">
                    <div className="crm-meta-label">BUDGET:</div>
                    <div className="crm-meta-value">
                        {(projet.investment_amount || projet.budget || 0).toLocaleString()} {projet.devise || 'EUR'}
                    </div>
                </div>
                <div className="crm-meta-item">
                    <div className="crm-meta-label">DATE DE DÉBUT:</div>
                    <div className="crm-meta-value">
                        {projet.start_date ? moment(projet.start_date).format('MMM D, YYYY') : 'Non définie'}
                    </div>
                </div>
                <div className="crm-meta-item">
                    <div className="crm-meta-label">TIME IN CURRENT STAGE:</div>
                    <div className="crm-meta-value">
                        {progression && progression.length > 0
                            ? moment().diff(moment(progression[0].created_at), 'days') + ' jours'
                            : 'N/A'}
                    </div>
                </div>
                <div className="crm-meta-item">
                    <div className="crm-meta-label">RESPONSABLE:</div>
                    <div className="crm-meta-value">
                        <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
                        <Link to="#" className="crm-link">{projet.responsable?.name || 'Non assigné'}</Link>
                    </div>
                </div>
            </div>

            {/* Visualisation du pipeline avec étapes */}
            <div className="crm-pipeline-visualization">
                {pipelineStages.length > 0 ? (
                    <PipelineStageManager
                        entityType="project"
                        entityId={id}
                        stages={pipelineStages}
                        currentStage={currentStage}
                        progression={progression || []}
                        pipelineCompletedAt={pipelineCompletedAt}
                        onStagesChange={() => dispatch(getProjectPipelineStatus(id))}
                        showAddButton={true}
                        buttonText="Add stage"
                        buttonClassName="crm-btn add-stage"
                        showVisualizer={true}
                    />
                ) : (
                    <Alert
                        message="Pipeline non initialisé"
                        description={
                            <div>
                                <p>Ce projet n'a pas encore de pipeline défini.</p>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => dispatch(initializeProjectPipeline({ id }))}
                                    style={{ marginTop: 10 }}
                                >
                                    Initialiser le pipeline
                                </Button>
                            </div>
                        }
                        type="info"
                        showIcon
                    />
                )}
            </div>

            {/* Onglets d'information détaillée */}
            <div className="crm-content-tabs">
                <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
                    <TabPane tab={<span><InfoCircleOutlined /> Détails</span>} key="details">
                        <div className="crm-details-section">
                            <div className="crm-details-header">
                                <h3>Information du projet</h3>
                                <Button icon={<EditOutlined />} size="small" onClick={() => navigate(`/projets/${id}/edit`)}>
                                    Edit details
                                </Button>
                            </div>

                            <Row gutter={16} style={{ marginBottom: 24 }}>
                                <Col span={6}>
                                    <Card className="stat-card">
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
                                <Col span={6}>
                                    <Card className="stat-card">
                                        <Statistic
                                            title="Emplois prévus"
                                            value={projet.jobs_expected || 0}
                                            valueStyle={{ color: '#1890ff' }}
                                            prefix={<TeamOutlined />}
                                        />
                                    </Card>
                                </Col>
                                <Col span={6}>
                                    <Card className="stat-card">
                                        <Statistic
                                            title="Progression"
                                            value={calculateProgress()}
                                            valueStyle={{ color: '#722ed1' }}
                                            prefix={<BarChartOutlined />}
                                            suffix="%"
                                        />
                                    </Card>
                                </Col>
                                <Col span={6}>
                                    <Card className="stat-card">
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

                            <Descriptions bordered column={2}>
                                <Descriptions.Item label="Titre du projet">{projet.title || projet.nom}</Descriptions.Item>
                                <Descriptions.Item label="Entreprise">{projet.entreprise?.nom || 'Non assignée'}</Descriptions.Item>
                                <Descriptions.Item label="Secteur d'activité">{projet.secteur?.nom || projet.secteur?.name || 'Non renseigné'}</Descriptions.Item>
                                <Descriptions.Item label="Pays">{projet.pays?.nom || 'Non renseigné'}</Descriptions.Item>
                                {/* <Descriptions.Item label="Montant d'investissement">
                  {formatMoney(projet.investment_amount || projet.budget || 0, projet.devise || 'EUR')}
                </Descriptions.Item> */}
                                <Descriptions.Item label="Responsable">{projet.responsable?.name || 'Non assigné'}</Descriptions.Item>
                                <Descriptions.Item label="Date de début">
                                    {projet.start_date ? moment(projet.start_date).format('DD/MM/YYYY') : 'Non définie'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Date de fin estimée">
                                    {projet.end_date ? moment(projet.end_date).format('DD/MM/YYYY') : 'Non définie'}
                                </Descriptions.Item>
                                {/* <Descriptions.Item label="Source du projet">
                                    {projet.source || 'Non spécifiée'}
                                </Descriptions.Item> */}
                                <Descriptions.Item label="Contact initial">
                                    {projet.initial_contact_person || 'Non renseigné'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Emplois prévus" >
                                    <Tag color="blue">{projet.jobs_expected || 0} emplois</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Description" >
                                    {projet.description || 'Aucune description disponible.'}
                                </Descriptions.Item>
                            </Descriptions>

                            <div className="crm-info-blocks">
                                <Card title="Détails financiers:" bordered={false}>
                                    {/* <p>Montant d'investissement: {formatMoney(projet.investment_amount || projet.budget || 0, projet.devise || 'EUR')}</p> */}
                                    <p>Pourcentage étranger: {projet.foreign_percentage || 0}%</p>
                                    {/* <p>Source de financement: {projet.funding_source || 'Non spécifiée'}</p> */}
                                </Card>

                                <Card title="État du projet:" bordered={false}>
                                   
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

                                <Card title="Notes internes:" bordered={false}>
                                    <Text>{projet.notes || 'Aucune note interne.'}</Text>
                                </Card>
                            </div>
                        </div>
                    </TabPane>

                    <TabPane tab={<span><AuditOutlined /> Phases</span>} key="stages">
                        <div className="crm-stages-section">
                            {pipelineStages.length > 0 ? (
                                <>
                                    {/* <Card title="Progression dans le pipeline" className="crm-stages-card">
                                        <PipelineVisualizer
                                            stages={pipelineStages}
                                            currentStage={effectiveCurrentStage}
                                            progression={progression || []}
                                            entityStatus={projet?.status}
                                        />
                                    </Card> */}

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
                                                {/* {nextStage && !isInFinalStage && (
                                                    <Button
                                                        type="primary"
                                                        icon={<RightOutlined />}
                                                        onClick={() => setPipelineModalVisible(true)}
                                                    >
                                                        Avancer vers : {nextStage.name}
                                                    </Button>
                                                )} */}

                                                {isInFinalStage && !isProjectCompleted && (
                                                    <Button
                                                        type="primary"
                                                        icon={<CheckOutlined />}
                                                        onClick={() => setFinalizeModalVisible(true)}
                                                    >
                                                        Terminer
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
                                            onClick={() => dispatch(initializeProjectPipeline({ id }))}
                                        >
                                            Initialiser le pipeline
                                        </Button>
                                    }
                                />
                            )}
                        </div>
                    </TabPane>

                    <TabPane tab={<span><WarningOutlined /> Blocages ({blockages.length})</span>} key="blockages">
                        <PipelineBlockages
                            entityType="projet"
                            entityId={id}
                            pipelineStages={pipelineStages || []}
                            title="Blocages par phase du pipeline"
                        />
                    </TabPane>

                    <TabPane tab={<span><ClockCircleOutlined /> Tâches</span>} key="tasks">
                        <div className="crm-tasks-container">
                            <div className="crm-tasks-header">
                                <h3>Liste des tâches</h3>
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
                                >
                                    Ajouter une tâche
                                </Button>
                            </div>

                            <div className="crm-tasks-content">
                                <PipelineTasks
                                    entityType="projet"
                                    entityId={id}
                                    stageId={effectiveCurrentStage?.id}
                                    onEdit={(task) => {
                                        openTaskModal(task.pipeline_stage_id, effectiveCurrentStage?.name, task);
                                    }}
                                />
                            </div>
                        </div>
                    </TabPane>

                    <TabPane tab={<span><FileTextOutlined /> Documents</span>} key="documents">
                        <div className="crm-documents-container">
                            <div className="crm-documents-header">
                                <h3>Documents du projet</h3>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => setDocumentsModalVisible(true)}
                                >
                                    Ajouter un document
                                </Button>
                            </div>

                            <div className="crm-documents-content">
                                {/* Ici vous pourriez afficher la liste des documents liés au projet */}
                                <Empty description="Aucun document attaché" />
                            </div>
                        </div>
                    </TabPane>

                    <TabPane tab={<span><DollarOutlined /> Budget</span>} key="budget">
                        <div className="crm-budget-container">
                            <div className="crm-budget-header">
                                <h3>Suivi budgétaire</h3>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => setBudgetModalVisible(true)}
                                >
                                    Ajouter une ligne budgétaire
                                </Button>
                            </div>

                            <div className="crm-budget-summary">
                                <Row gutter={16} style={{ marginBottom: 24 }}>
                                    <Col span={8}>
                                        <Card>
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
                                    <Col span={8}>
                                        <Card>
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
                                    <Col span={8}>
                                        <Card>
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
                            </div>

                            <div className="crm-budget-content">
                                <Empty description="Aucune ligne budgétaire" />
                            </div>
                        </div>
                    </TabPane>

                    <TabPane tab={<span><TeamOutlined /> Équipe</span>} key="team">
                        <div className="crm-team-container">
                            <div className="crm-team-header">
                                <h3>Équipe projet</h3>
                                <Button type="primary" icon={<PlusOutlined />}>
                                    Ajouter un membre
                                </Button>
                            </div>

                            <div className="crm-team-content">
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
                        </div>
                    </TabPane>
                </Tabs>
            </div>

            {/* Modal pour avancer dans le pipeline */}
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

            {/* Modal pour ajouter/gérer des documents */}
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

            {/* Modal pour gérer le budget */}
            <Modal
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
            </Modal>

            {/* Modal pour créer une tâche */}
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

            {/* Modal pour finaliser le pipeline */}
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

            {/* CSS intégré pour les styles CRM */}
            <style jsx>{`
        .crm-container {
          background-color: #f0f2f5;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .crm-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background-color: white;
          border-bottom: 1px solid #e8e8e8;
        }
        
        .crm-lead-info {
          display: flex;
          align-items: center;
        }
        
        .crm-avatar {
          margin-right: 12px;
        }
        
        .crm-title {
          display: flex;
          flex-direction: column;
        }
        
        .crm-lead-label {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }
        
        .lead-name {
          color: #1890ff;
        }
        
        .lead-company {
          color: #666;
        }
        
        .crm-lead-actions {
          display: flex;
          font-size: 13px;
          color: #888;
        }
        
        .crm-link {
          color: #1890ff;
          margin-right: 16px;
        }
        
        .crm-header-actions {
          display: flex;
          gap: 8px;
        }
        
        .crm-btn {
          border-radius: 3px;
        }
        
        .crm-options-btn {
          background-color: #f5f5f5;
        }
        
        .crm-stage-btn {
          background-color: #1890ff;
          color: white;
        }
        
        .crm-documents-btn {
          background-color: #faad14;
          border-color: #faad14;
          color: white;
        }
        
        .crm-budget-btn {
          background-color: #52c41a;
          border-color: #52c41a;
          color: white;
        }
        
        .crm-advance-btn {
          background-color: #1890ff;
          color: white;
          border-color: #1890ff;
        }
        
        .crm-meta-info {
          display: flex;
          background-color: white;
          padding: 10px 20px;
          border-bottom: 1px solid #e8e8e8;
        }
        
        .crm-meta-item {
          margin-right: 40px;
          display: flex;
        }
        
        .crm-meta-label {
          color: #999;
          font-size: 12px;
          margin-right: 8px;
        }
        
        .crm-meta-value {
          color: #333;
          font-size: 12px;
          display: flex;
          align-items: center;
        }
        
        .crm-pipeline-visualization {
          background-color: white;
          padding: 20px;
          border-bottom: 1px solid #e8e8e8;
        }
        
        .crm-content-tabs {
          background-color: white;
          padding: 20px;
        }
        
        .crm-details-section {
          padding: 16px;
        }
        
        .crm-details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .crm-details-header h3 {
          margin: 0;
          color: #333;
        }
        
        .crm-info-blocks {
          margin-top: 24px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }
        
        .crm-stages-section {
          padding: 16px;
        }
        
        .crm-stages-card {
          margin-bottom: 20px;
        }
        
        .crm-tasks-container,
        .crm-documents-container,
        .crm-budget-container,
        .crm-team-container {
          padding: 16px;
        }
        
        .crm-tasks-header,
        .crm-documents-header,
        .crm-budget-header,
        .crm-team-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .crm-tasks-header h3,
        .crm-documents-header h3,
        .crm-budget-header h3,
        .crm-team-header h3 {
          margin: 0;
          color: #333;
        }
        
        .crm-tasks-content,
        .crm-documents-content,
        .crm-budget-content,
        .crm-team-content {
          min-height: 120px;
        }
        
        .stat-card {
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          height: 100%;
        }
        
        @media (max-width: 768px) {
          .crm-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .crm-header-actions {
            margin-top: 16px;
            width: 100%;
            flex-wrap: wrap;
          }
          
          .crm-meta-info {
            flex-direction: column;
          }
          
          .crm-meta-item {
            margin-bottom: 8px;
          }
        }
      `}</style>
        </div>
    );
};

export default ProjetDetails;