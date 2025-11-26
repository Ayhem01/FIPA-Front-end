import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Card, Descriptions, Button, Space, Spin, Tag, Tabs, Typography, Modal,
  message, Divider, Row, Col, Breadcrumb, Statistic, Tooltip, Badge, Checkbox, List,
  Dropdown, Menu, Steps, Alert, Timeline, Form, DatePicker, Select, Input, Progress, InputNumber,
  Avatar, Empty, Grid
} from 'antd';
import {
  EditOutlined, DeleteOutlined, ArrowLeftOutlined, ExclamationCircleOutlined,
  MailOutlined, PhoneOutlined, UserOutlined, CalendarOutlined, FileTextOutlined,
  BankOutlined, TeamOutlined, CheckCircleOutlined, CloseCircleOutlined, CheckOutlined,
  QuestionCircleOutlined, DownOutlined, EllipsisOutlined, HistoryOutlined, LoadingOutlined, PlusOutlined,
  MessageOutlined, InfoCircleOutlined, SendOutlined, AuditOutlined, BellOutlined, GlobalOutlined, RightOutlined,
  SearchOutlined, SettingOutlined, ClockCircleOutlined, ArrowUpOutlined, WarningOutlined, LinkOutlined,
  ProjectOutlined, HomeOutlined, SyncOutlined, FireOutlined, ThunderboltOutlined, ReloadOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getInvestisseurById,
  deleteInvestisseur,
  updateInvestisseurStatus,
  initializePipeline,
  advancePipeline,
  convertToProject,
  resetOperation,
  getPipelineStatus
} from '../../features/investisseurSlice';
import { fetchPays, fetchSecteurs, fetchEntreprises } from '../../features/marketingSlice';
import { fetchAllUsers, getCurrentUser } from '../../features/userSlice';
import { createProjectFromInvestisseur, getInvestisseurDataForProject } from '../../features/projectSlice';
import moment from 'moment';
import '../../../src/assets/styles/action-form.css';
import PipelineTasks from '../Portefeuille/PipelineTasks';
import PipelineBlockages from '../Blockages/PipelineBlockages';
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

const InvestisseurDetails = () => {
  const [taskForm] = Form.useForm();
  const [pipelineForm] = Form.useForm();
  const [conversionForm] = Form.useForm();
  const screens = useBreakpoint();

  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [conversionModalVisible, setConversionModalVisible] = useState(false);
  const [pipelineModalVisible, setPipelineModalVisible] = useState(false);
  const [selectedPipelineStage, setSelectedPipelineStage] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [selectedStageForTask, setSelectedStageForTask] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [blockages, setBlockages] = useState([]);
  const [pipelineTasks, setPipelineTasks] = useState({ planned: [], recent: [] });
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [selectedStageName, setSelectedStageName] = useState('');
  const [addBlockageVisible, setAddBlockageVisible] = useState(false);


  // --- Sélecteurs Redux optimisés ---

  // Sélecteur Investisseur
  const investisseur = useSelector(s => s.investisseurs?.selectedInvestisseur?.data);
  const loading = useSelector(s => s.investisseurs?.selectedInvestisseur?.loading);
  const error = useSelector(s => s.investisseurs?.selectedInvestisseur?.error);

  // Pipeline
  const pipelineStages = useSelector(s => s.investisseurs?.pipeline?.stages || []);
  const currentStage = useSelector(s => s.investisseurs?.pipeline?.currentStage);
  const progression = useSelector(s => s.investisseurs?.pipeline?.progression || []);
  const pipelineLoading = useSelector(s => s.investisseurs?.pipeline?.loading);

  // Operation
  const operation = useSelector(s => s.investisseurs?.operation);

  // Marketing data
  const { pays, secteurs, entreprises } = useSelector(state => ({
    pays: state.marketing?.pays?.items || [],
    secteurs: state.marketing?.secteurs?.items || [],
    entreprises: state.marketing?.entreprises?.items || []
  }));

  // Users
  const users = useSelector(s => s.users?.list || []);
  const currentUser = useSelector(s => s.user?.user);

  // Données investisseur utilisées par projets
  const investisseurDataForProject = useSelector(s => s.projects?.investisseurData || {
    data: null,
    loading: false,
    error: null
  });

  // --- Logique pipeline ---

  // Étape effective (avec fallback)
  const effectiveCurrentStage =
    currentStage || (pipelineStages.length > 0 ? pipelineStages[0] : null);

  // Prochaine étape
  const nextStage = pipelineStages.find(
    stage => stage.order === ((effectiveCurrentStage?.order || 0) + 1)
  );

  // Indicateur dernière étape
  const isInFinalStage =
    effectiveCurrentStage?.is_final === true ||
    (pipelineStages.length > 0 &&
      effectiveCurrentStage?.order === Math.max(...pipelineStages.map(s => s.order)));

  // Fonction pour vérifier si on peut convertir en projet
  const canConvertToProject = () => {
    if (investisseur?.statut === 'converti' || investisseur?.projects?.length > 0) {
      return false;
    }

    if (!effectiveCurrentStage) {
      return false;
    }

    const isLastStage = pipelineStages.length > 0 &&
      effectiveCurrentStage.order === Math.max(...pipelineStages.map(s => s.order));

    return effectiveCurrentStage.is_final === true || isLastStage;
  };

  // Chargement de l'utilisateur courant
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

  // Charger les données de l'investisseur et son pipeline
  useEffect(() => {
    if (id) {
      dispatch(getInvestisseurById(id));
      // ⭐ Ajouter un then pour logger
      dispatch(getPipelineStatus(id)).then((result) => {
        console.log('🎯 getPipelineStatus result:', result);
        console.log('🎯 Payload:', result.payload);
      });
      dispatch(fetchPays());
      dispatch(fetchSecteurs());
      dispatch(fetchEntreprises());
      dispatch(fetchAllUsers());
    }

    return () => {
      dispatch(resetOperation());
    };
  }, [dispatch, id, refreshTrigger]);

  // Charger les données pour la conversion si nécessaire
  useEffect(() => {
    if (conversionModalVisible && id) {
      dispatch(getInvestisseurDataForProject(id));
    }
  }, [conversionModalVisible, id, dispatch]);

  // Préremplir le formulaire avec les données de l'investisseur
  useEffect(() => {
    if (investisseurDataForProject.data && conversionModalVisible) {
      const data = investisseurDataForProject.data;
      conversionForm.setFieldsValue({
        title: data.suggested_title || `Projet - ${investisseur?.nom}`,
        description: data.suggested_description,
        company_name: data.company_name || investisseur?.entreprise?.nom,
        secteur_id: investisseur?.secteur_id,
        responsable_id: investisseur?.responsable_id || currentUser?.id,
        investment_amount: investisseur?.valeur_potentielle || investisseur?.montant_investissement,
        start_date: moment(),
        status: 'planned',
        contact_source: '',
        initial_contact_person: investisseur?.nom
      });
    }
  }, [investisseurDataForProject.data, conversionModalVisible, conversionForm, investisseur, currentUser]);

  // Gérer les opérations réussies ou échouées
  useEffect(() => {
    if (operation.success) {
      switch (operation.type) {
        case 'delete':
          message.success('Investisseur supprimé avec succès');
          navigate('/investisseurs');
          break;
        case 'update_status':
          message.success('Statut mis à jour avec succès');
          break;
        case 'initialize_pipeline':
          message.success('Pipeline initialisé avec succès');
          setTimeout(() => {
            dispatch(getInvestisseurById(id));
            dispatch(getPipelineStatus(id));
          }, 500);
          break;
        case 'advance_pipeline':
          message.success('Progression dans le pipeline enregistrée');
          setPipelineModalVisible(false);
          pipelineForm.resetFields();
          setSelectedPipelineStage(null);
          dispatch(getPipelineStatus(id));
          break;
        case 'create_from_investisseur':
          message.success('Projet créé avec succès à partir de l\'investisseur');
          setConversionModalVisible(false);
          conversionForm.resetFields();
          dispatch(getInvestisseurById(id));
          break;
        case 'convert_to_project':
          message.success('Investisseur converti en projet avec succès');
          setConversionModalVisible(false);
          conversionForm.resetFields();
          dispatch(getInvestisseurById(id));
          break;
        default:
          message.success('Opération réussie');
      }
      dispatch(resetOperation());
    } else if (operation.error) {
      message.error(operation.error);
      dispatch(resetOperation());
    }
  }, [operation, navigate, id, dispatch, pipelineForm, conversionForm]);

  // Chargement des tâches du pipeline
  const loadPipelineTasks = useCallback(async () => {
    if (!id || !effectiveCurrentStage?.id) return;

    setLoadingTasks(true);
    try {
      dispatch(getPipelineStageTasks({
        entityType: 'investisseur',
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

  // Charger les tâches lorsque l'onglet Tasks est actif
  useEffect(() => {
    if (activeTab === 'tasks' && effectiveCurrentStage?.id) {
      loadPipelineTasks();
    }
  }, [activeTab, effectiveCurrentStage, loadPipelineTasks, refreshTrigger]);

  // HANDLERS POUR LES ACTIONS

  // Confirmation de suppression
  const showDeleteConfirm = () => {
    confirm({
      title: `Êtes-vous sûr de vouloir supprimer cet investisseur?`,
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

  // Ouverture du modal de tâche
  const openTaskModal = (stageId, stageName, task = null) => {
    setSelectedStageForTask(stageId);
    setSelectedStageName(stageName);
    setTaskModalVisible(true);
  };

  // Création d'une tâche
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
        investisseurId: id,
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

  // Modifier le statut
  const handleStatusChange = (newStatus) => {
    dispatch(updateInvestisseurStatus({ id, statut: newStatus }));
  };

  // Initialiser le pipeline
  const handleInitializePipeline = () => {
    confirm({
      title: 'Initialiser le pipeline',
      icon: <InfoCircleOutlined />,
      content: 'Cette action va démarrer le processus de suivi pour cet investisseur. Voulez-vous continuer?',
      onOk() {
        message.loading('Initialisation en cours...', 0.5);
        dispatch(initializePipeline({ id }))
          .unwrap()
          .then(() => {
            message.success('Pipeline initialisé avec succès');
            setTimeout(() => {
              dispatch(getInvestisseurById(id));
              dispatch(getPipelineStatus(id));
            }, 500);
          })
          .catch((error) => {
            message.error(`Erreur: ${error}`);
          });
      }
    });
  };

  // Avancer dans le pipeline
  const handleAdvancePipeline = async () => {
    try {
      const values = await pipelineForm.validateFields();
      const stageId = selectedPipelineStage || nextStage?.id;

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
      setSelectedPipelineStage(null);

      dispatch(getInvestisseurById(id));
      dispatch(getPipelineStatus(id));
      setRefreshTrigger(prev => prev + 1);

    } catch (error) {
      console.error('Erreur lors de l\'avancement:', error);
    }
  };

  // Convertir en projet
  const handleConversion = () => {
    conversionForm.validateFields().then(values => {
      if (!id) {
        message.error('ID de l\'investisseur manquant');
        return;
      }

      if (!canConvertToProject()) {
        message.warning('Cet investisseur n\'est pas dans l\'étape finale du pipeline');
        return;
      }
      const allowedMarketTargets = ['local', 'export', 'both'];

      const projectData = {
        title: values.title,
        description: values.description,
        company_name: values.company_name,
        idea: values.idea || false,
        in_progress: values.in_progress || false,
        in_production: values.in_production || false,
        is_blocked: values.is_blocked || false,
        secteur_id: values.secteur_id,
        responsable_id: values.responsable_id,
        investisseur_id: parseInt(id),
        market_target: allowedMarketTargets.includes(values.market_target) ? values.market_target : 'local', // FIX
        nationality: values.nationality || null,
        foreign_percentage: values.foreign_percentage || 0,
        investment_amount: values.investment_amount,
        jobs_expected: values.jobs_expected || 0,
        industrial_zone: values.industrial_zone || null,
        pipeline_stage_id: values.pipeline_stage_id || null,
        pipeline_completed_at: null,
        pipeline_completed_by: null,
        start_date: values.start_date?.format('YYYY-MM-DD') || null,
        end_date: values.end_date?.format('YYYY-MM-DD') || null,
        first_contact_date: values.first_contact_date?.format('YYYY-MM-DD') || null,
        contact_source: values.contact_source,
        initial_contact_person: values.initial_contact_person || investisseur?.nom,
        status: values.status || 'planned',
        created_by: currentUser?.id || null,
        notes: values.notes || null,
        converted_from_investisseur_at: moment().format('YYYY-MM-DD HH:mm:ss')
      };

      console.log('Project creation data with correct columns:', projectData);

      dispatch(createProjectFromInvestisseur(projectData))
        .unwrap()
        .then((response) => {
          console.log('Réponse de conversion:', response);

          const project = response.data?.project || response.data;

          if (project?.id) {
            setConversionModalVisible(false);
            message.success('Conversion réussie! Redirection vers le projet...');
            navigate(`/projets/${project.id}`);
          } else {
            message.error('Conversion réussie mais impossible de récupérer le projet');
            setConversionModalVisible(false);
            navigate('/projets');
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

  // Menu de statut
  const statusMenu = (
    <Menu>
      <Menu.Item key="nouveau" disabled={investisseur?.statut === 'nouveau'} onClick={() => handleStatusChange('nouveau')}>
        <Badge color="blue" text="Nouveau" />
      </Menu.Item>
      <Menu.Item key="en_cours" disabled={investisseur?.statut === 'en_cours'} onClick={() => handleStatusChange('en_cours')}>
        <Badge color="processing" text="En cours" />
      </Menu.Item>
      <Menu.Item key="actif" disabled={investisseur?.statut === 'actif'} onClick={() => handleStatusChange('actif')}>
        <Badge color="green" text="Actif" />
      </Menu.Item>
      <Menu.Item key="negocie" disabled={investisseur?.statut === 'negocie'} onClick={() => handleStatusChange('negocie')}>
        <Badge color="orange" text="En négociation" />
      </Menu.Item>
      <Menu.Item key="converti" disabled={investisseur?.statut === 'converti'} onClick={() => handleStatusChange('converti')}>
        <Badge color="success" text="Converti" />
      </Menu.Item>
      <Menu.Item key="perdu" disabled={investisseur?.statut === 'perdu'} onClick={() => handleStatusChange('perdu')}>
        <Badge color="red" text="Perdu" />
      </Menu.Item>
      <Menu.Item key="inactif" disabled={investisseur?.statut === 'inactif'} onClick={() => handleStatusChange('inactif')}>
        <Badge color="default" text="Inactif" />
      </Menu.Item>
    </Menu>
  );

  // Rendu du statut
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
      case 'actif':
        color = 'green';
        text = 'Actif';
        icon = <CheckCircleOutlined />;
        break;
      case 'negocie':
        color = 'orange';
        text = 'En négociation';
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
      case 'inactif':
        color = 'default';
        text = 'Inactif';
        icon = <QuestionCircleOutlined />;
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

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    return moment(dateString).format('DD/MM/YYYY HH:mm');
  };

  // Formater la valeur monétaire
  const formatMoney = (value, devise = 'EUR') => {
    if (!value && value !== 0) return 'Non définie';
    try {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: devise
      }).format(value);
    } catch (error) {
      return `${value} ${devise}`;
    }
  };

  // Affichage pendant le chargement
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
            Chargement des détails de l'investisseur...
          </Title>
        </motion.div>
      </div>
    );
  }

  // Affichage en cas d'erreur
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
            <Button type="primary" onClick={() => navigate('/investisseurs')} style={{ marginTop: 16 }}>
              Retour à la liste
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Affichage si l'investisseur n'est pas trouvé
  if (!investisseur) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="modern-container"
      >
        <Card className="modern-not-found-card">
          <div className="not-found-content">
            <InfoCircleOutlined className="not-found-icon" />
            <Title level={4}>Investisseur non trouvé</Title>
            <Text>L'investisseur que vous recherchez n'existe pas ou a été supprimé.</Text>
            <Button type="primary" onClick={() => navigate('/investisseurs')} style={{ marginTop: 24 }}>
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
            <Link to="/investisseurs">
              <BankOutlined /> Investisseurs
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <UserOutlined /> {investisseur.nom}
          </Breadcrumb.Item>
        </Breadcrumb>
      </motion.div>

      {/* En-tête principal identique à InviteDetails */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="investisseur-header"
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
                  icon={<BankOutlined />}
                  style={{
                    backgroundColor: investisseur.statut === 'actif' ? '#52c41a' :
                      investisseur.statut === 'negocie' ? '#faad14' : '#1890ff',
                    fontSize: '28px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                  }}
                />
              </motion.div>

              <div>
                <Title level={1} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
                  {investisseur.nom}
                  {investisseur.statut === 'converti' && (
                    <Tag color="success" style={{ marginLeft: 12 }}>
                      <CheckOutlined /> Converti
                    </Tag>
                  )}
                </Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: '8px 0 0 0' }}>
                  <BankOutlined style={{ marginRight: 6 }} />
                  {investisseur.entreprise?.nom || 'Entreprise non définie'} •
                  <CalendarOutlined style={{ marginLeft: 8, marginRight: 6 }} />
                  Créé le {moment(investisseur.created_at).format('DD/MM/YYYY')}
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
              <Button
                icon={<EditOutlined />}
                onClick={() => navigate(`/investisseurs/${id}/edit`)}
                size="large"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)'
                }}
              >
                Modifier
              </Button>

              <Button
                icon={<DeleteOutlined />}
                danger
                onClick={showDeleteConfirm}
                size="large"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)'
                }}
              >
                Supprimer
              </Button>

              <Dropdown overlay={statusMenu} placement="bottomRight">
                <Button
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

              {investisseur.projets && investisseur.projets.length > 0 ? (
                <Button
                  type="primary"
                  icon={<LinkOutlined />}
                  onClick={() => navigate(`/projets/${investisseur.projets[0].id}`)}
                  size="large"
                  style={{
                    background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 500
                  }}
                >
                  {screens.xs ? 'Voir' : 'Voir le projet'}
                </Button>
              ) : investisseur.statut === 'converti' ? (
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
                  onClick={() => setConversionModalVisible(true)}
                  disabled={!canConvertToProject()}
                  size="large"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    borderRadius: '8px',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {screens.xs ? 'Convertir' : 'Convertir en projet'}
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
            icon={investisseur.statut === 'converti' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
            title="Statut de conversion"
            value={investisseur.statut === 'converti' ? "Converti" : "En cours"}
            color={investisseur.statut === 'converti' ? '#52c41a' : '#faad14'}
            delay={0}
          />
        </Col>
        <Col xs={12} sm={6}>
          <AnimatedStatCard
            icon={<AuditOutlined />}
            title="Étape actuelle"
            value={effectiveCurrentStage?.name || 'Aucune'}
            color="#1890ff"
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
            color="#722ed1"
            delay={2}
          />
        </Col>
        <Col xs={12} sm={6}>
          <AnimatedStatCard
            icon={<GlobalOutlined />}
            title="Montant d'investissement"
            value={investisseur.montant_investissement ?
              formatMoney(investisseur.montant_investissement, investisseur.devise) :
              'Non défini'
            }
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
        >
          <AnimatedContentCard
            title="Pipeline de suivi"
            delay={0}
            extra={
              <Space>
                {nextStage && !investisseur.statut === 'converti' && (
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
              entityType="investisseur"
              entityId={id}
              stages={pipelineStages}
              currentStage={currentStage}
              progression={progression}
              pipelineCompletedAt={investisseur?.converted_to_project_at || (investisseur?.projets?.length > 0 ? new Date().toISOString() : null)}
              onStagesChange={() => dispatch(getPipelineStatus(id))}
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
                  <Title level={4}>Informations de l'investisseur</Title>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/investisseurs/${id}/edit`)}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 500
                    }}
                  >
                    Modifier
                  </Button>
                </div>

                <Descriptions bordered column={{ xs: 1, sm: 2 }} className="modern-descriptions">
                  <Descriptions.Item label="Nom">{investisseur.nom}</Descriptions.Item>
                  <Descriptions.Item label="Email">
                    <Text copyable>{investisseur.email}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Téléphone">
                    <Text copyable>{investisseur.telephone || 'Non renseigné'}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Entreprise">
                    {investisseur.entreprise?.nom || 'Non assignée'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Pays">
                    {investisseur.pays?.name || 'Non renseigné'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Secteur d'activité">
                    {investisseur.secteur?.name || 'Non renseigné'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Montant d'investissement">
                    {investisseur.montant_investissement ? formatMoney(investisseur.montant_investissement, investisseur.devise) : 'Non défini'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Responsable">
                    {investisseur.responsable?.name || 'Non assigné'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Date d'engagement">
                    {investisseur.date_engagement ? moment(investisseur.date_engagement).format('DD/MM/YYYY') : 'Non définie'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Date de signature">
                    {investisseur.date_signature ? moment(investisseur.date_signature).format('DD/MM/YYYY') : 'Non définie'}
                  </Descriptions.Item>
                </Descriptions>

                <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                  <Col xs={24}>
                    <Card size="small" className="info-card" title="Critères d'investissement">
                      <Text>{investisseur.criteres_investissement || 'Aucun critère spécifié.'}</Text>
                    </Card>
                  </Col>
                  <Col xs={24}>
                    <Card size="small" className="info-card" title="Intérêts spécifiques">
                      <Text>{investisseur.interets_specifiques || 'Aucun intérêt spécifié.'}</Text>
                    </Card>
                  </Col>
                  <Col xs={24}>
                    <Card size="small" className="info-card" title="Notes internes">
                      <Text>{investisseur.notes || 'Aucune note interne.'}</Text>
                    </Card>
                  </Col>
                  {investisseur.projets && investisseur.projets.length > 0 && (
                    <Col xs={24}>
                      <Card size="small" className="info-card" title="Converti en projet">
                        <Tag color="green">
                          Converti le {moment(investisseur.projets[0].created_at).format('DD/MM/YYYY')}
                        </Tag>
                        <div style={{ marginTop: 8 }}>
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => navigate(`/projets/${investisseur.projets[0].id}`)}
                          >
                            Voir le projet
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
                        progression={progression}
                        entityStatus={investisseur?.statut}
                      />
                    </Card>



                    {investisseur.projets && investisseur.projets.length > 0 && (
                      <Card style={{ marginTop: 16 }} title="Conversion réussie">
                        <Alert
                          message="Investisseur converti avec succès"
                          description={
                            <div>
                              <p>Cet investisseur a été converti en projet le {moment(investisseur.projets[0].created_at).format('DD/MM/YYYY')}.</p>
                              <Button
                                type="primary"
                                icon={<LinkOutlined />}
                                onClick={() => navigate(`/projets/${investisseur.projets[0].id}`)}
                                style={{
                                  background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontWeight: 500
                                }}
                              >
                                Voir le projet
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
                    description="Cet investisseur n'a pas encore de pipeline de suivi défini."
                    type="info"
                    showIcon
                    action={
                      <Button
                        type="primary"
                        onClick={handleInitializePipeline}
                        disabled={investisseur.statut === 'converti' || investisseur.projets?.length > 0}
                        icon={<PlusOutlined />}
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
                  entityType="investisseur"
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
                  entityType="investisseur"
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
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 500
                    }}
                  >
                    Ajouter une note
                  </Button>
                </div>
                <Empty description="Aucune note" className="empty-state" />
              </div>
            </TabPane>
          </Tabs>
        </AnimatedContentCard>
      </motion.div>

      {/* Modal pour convertir en projet */}
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
          entityType="investisseur"
          entityId={id}
          pipelineStageType="pipeline_stage"
          pipelineStageId={effectiveCurrentStage?.id}
        />
      </Modal>
      <Modal
        title="Convertir en projet"
        open={conversionModalVisible}
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
            loading={operation.loading && operation.type === 'create_from_investisseur'}
          >
            Convertir
          </Button>
        ]}
      >
        <Form
          form={conversionForm}
          layout="vertical"
          initialValues={{
            title: `Projet - ${investisseur?.nom}`,
            status: 'planned',
            responsable_id: currentUser?.id,
            start_date: moment(),
            market_target: 'local'

          }}
        >
          <Alert
            message="Conditions de conversion"
            description={
              <div>
                <p>Pour convertir un investisseur en projet, les conditions suivantes doivent être remplies :</p>
                <ul>
                  <li>Statut actif ou en négociation ✓</li>
                  <li>Étape finale du pipeline complétée {
                    effectiveCurrentStage?.is_final ? (
                      <Tag color="success" style={{ marginLeft: 8 }}>
                        <CheckOutlined /> Étape finale atteinte
                      </Tag>
                    ) : (
                      <Tag color="warning" style={{ marginLeft: 8 }}>
                        <ClockCircleOutlined /> En cours
                      </Tag>
                    )
                  }</li>
                </ul>
                <p><strong>Étape actuelle :</strong> {effectiveCurrentStage?.name || 'Non définie'}</p>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Titre du projet"
                rules={[{ required: true, message: 'Veuillez entrer le titre du projet' }]}
              >
                <Input placeholder="Titre du projet" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="company_name"
                label="Nom de l'entreprise"
              >
                <Input placeholder="Nom de l'entreprise" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea
              rows={4}
              placeholder="Description du projet"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="secteur_id"
                label="Secteur d'activité"
              >
                <Select placeholder="Sélectionner un secteur">
                  {secteurs.map(secteur => (
                    <Option key={secteur.id} value={secteur.id}>
                      {secteur.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="responsable_id"
                label="Responsable"
              >
                <Select placeholder="Sélectionner un responsable">
                  {users.map(user => (
                    <Option key={user.id} value={user.id}>
                      {user.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="market_target"
                label="Marché cible"
                rules={[{ required: true, message: 'Marché cible requis' }]}
              >
                <Select placeholder="Sélectionner">
                  <Option value="local">Local</Option>
                  <Option value="export">Export</Option>
                  <Option value="both">Local & Export</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nationality"
                label="Nationalité principale"
                rules={[{ required: true, message: 'Nationalité requise' }]}
              >
                <Input placeholder="Ex: TN, FR, DE" maxLength={5} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="foreign_percentage"
                label="% capital étranger"
              >
                <InputNumber style={{ width: '100%' }} min={0} max={100} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="industrial_zone"
                label="Zone industrielle"
                rules={[{ required: true, message: 'Zone industrielle requis' }]}
              >
                <Input placeholder="Zone / Région" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="investment_amount"
                label="Montant d'investissement"
                rules={[{ required: true, message: 'Montant d\'investissement requis' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Montant"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Statut"
                initialValue="planned"
              >
                <Select>
                  <Option value="planned">Planifié</Option>
                  <Option value="in_progress">En cours</Option>
                  <Option value="completed">Terminé</Option>
                  <Option value="abandoned">Abandonné</Option>
                  <Option value="suspended">Suspendu</Option>
                  <Option value="on_hold">En attente</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="start_date"
                label="Date de début"
              >
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="Date de début"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="end_date"
                label="Date de fin prévue"
              >
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="Date de fin"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contact_source"
                label="Source du contact"
              >
                <Input placeholder="Ex: Salon professionnel, Recommandation..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="initial_contact_person"
                label="Personne de contact initiale"
              >
                <Input placeholder="Nom de la personne" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <TextArea
              rows={3}
              placeholder="Notes complémentaires..."
            />
          </Form.Item>

          <Alert
            message="Information importante"
            description="Cette action va créer un nouveau projet et initialiser automatiquement son pipeline. L'investisseur sera marqué comme 'converti'."
            type="warning"
            showIcon
          />
        </Form>
      </Modal>

      {/* Modal pour avancer dans le pipeline */}
      <Modal
        title={`Passer à l'étape: ${nextStage?.name || ''}`}
        open={pipelineModalVisible}
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

      {/* Modal pour créer/modifier une tâche */}
      <TaskCreateModal
        visible={taskModalVisible}
        onCancel={() => setTaskModalVisible(false)}
        onSuccess={() => {
          setTaskModalVisible(false);
          setRefreshTrigger(prev => prev + 1);
        }}
        entityType="investisseur"
        entityId={id}
        stageId={selectedStageForTask}
        stageName={selectedStageName}
        entityName={investisseur?.nom}
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

        .investisseur-header {
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
        .tasks-header,
        .notes-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f0f0f0;
        }

        .details-header h4,
        .tasks-header h4,
        .notes-header h4 {
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

          .investisseur-header {
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
          .tasks-header,
          .notes-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
        }

        @media (max-width: 576px) {
          .investisseur-header {
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

export default InvestisseurDetails;
