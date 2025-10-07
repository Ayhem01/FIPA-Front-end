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
  ProjectOutlined, HomeOutlined
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

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;
const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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

  // Sélecteurs Redux avec vérification de sécurité
  const investisseursState = useSelector(state => state.investisseurs || {
    selectedInvestisseur: { data: null, loading: false, error: null },
    pipeline: { stages: [], currentStage: null, progression: [], loading: false },
    operation: { type: null, loading: false, success: false, error: null }
  });

  const {
    selectedInvestisseur: { data: investisseur, loading, error },
    pipeline: { stages: pipelineStages, currentStage, progression, loading: pipelineLoading },
    operation
  } = investisseursState;

  const { pays, secteurs, entreprises } = useSelector(state => ({
    pays: state.marketing?.pays?.items || [],
    secteurs: state.marketing?.secteurs?.items || [],
    entreprises: state.marketing?.entreprises?.items || []
  }));

  const users = useSelector(state => state.users?.list || []);
  const currentUser = useSelector(state => state.user.user);

  const investisseurDataForProject = useSelector(state => state.projects?.investisseurData || {
    data: null,
    loading: false,
    error: null
  });

  // Étape effective (avec fallback)
  const effectiveCurrentStage = currentStage ||
    (pipelineStages && pipelineStages.length > 0 ? pipelineStages[0] : null);

  // Prochaine étape
  const nextStage = pipelineStages.find(
    stage => stage.order === ((effectiveCurrentStage?.order || 0) + 1)
  );

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
      dispatch(getPipelineStatus(id));
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
        market_target: values.market_target || null,
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
          <Spin size="large" />
          <Title level={4} style={{ marginTop: 16, color: '#666' }}>
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
                  icon={<BankOutlined />} 
                  style={{ 
                    backgroundColor: investisseur.statut === 'actif' ? '#52c41a' : 
                                    investisseur.statut === 'negocie' ? '#faad14' : '#1890ff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }} 
                />
              </motion.div>
              <div className="header-details">
                <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                  {investisseur.nom}
                  {investisseur.statut === 'converti' && (
                    <Tag color="success" style={{ marginLeft: 12 }}>
                      <CheckOutlined /> Converti
                    </Tag>
                  )}
                </Title>
                <Space size="large" style={{ marginTop: 8 }}>
                  <Text type="secondary">
                    <BankOutlined style={{ marginRight: 6 }} />
                    {investisseur.entreprise?.nom || 'Entreprise non définie'}
                  </Text>
                  <Text type="secondary">
                    <CalendarOutlined style={{ marginRight: 6 }} />
                    Créé le {moment(investisseur.created_at).format('DD/MM/YYYY')}
                  </Text>
                  <div>{renderStatus(investisseur.statut)}</div>
                </Space>
              </div>
            </div>

            <div className="header-actions">
              <Space size="middle">
                {nextStage && !investisseur.statut === 'converti' && (
                  <Button
                    type="default"
                    icon={<RightOutlined />}
                    onClick={() => setPipelineModalVisible(true)}
                    className="modern-btn"
                  >
                    {screens.xs ? 'Avancer' : `Avancer vers: ${nextStage.name}`}
                  </Button>
                )}

                <Dropdown overlay={statusMenu} placement="bottomRight">
                  <Button className="modern-btn">
                    Statut <DownOutlined />
                  </Button>
                </Dropdown>

                {investisseur.projets && investisseur.projets.length > 0 ? (
                  <Button
                    type="primary"
                    icon={<LinkOutlined />}
                    onClick={() => navigate(`/projets/${investisseur.projets[0].id}`)}
                    className="modern-btn-primary"
                  >
                    {screens.xs ? 'Voir' : 'Voir le projet'}
                  </Button>
                ) : investisseur.statut === 'converti' ? (
                  <Button
                    disabled
                    icon={<CheckOutlined />}
                    className="modern-btn-disabled"
                  >
                    {screens.xs ? 'Converti' : 'Déjà converti'}
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    onClick={() => setConversionModalVisible(true)}
                    disabled={!canConvertToProject()}
                    className="modern-btn-primary"
                  >
                    {screens.xs ? 'Convertir' : 'Convertir en projet'}
                  </Button>
                )}

                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => navigate(`/investisseurs/${id}/edit`)}>
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
            {investisseur.statut === 'converti' ? 
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '24px' }} /> : 
              <ClockCircleOutlined style={{ color: '#faad14', fontSize: '24px' }} />
            }
          </div>
          <div className="metric-content">
            <div className="metric-label">Statut de conversion</div>
            <div className="metric-value" style={{ 
              color: investisseur.statut === 'converti' ? '#52c41a' : '#faad14' 
            }}>
              {investisseur.statut === 'converti' ? "Converti" : "En cours"}
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
            <div className="metric-label">Étape actuelle</div>
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
            <div className="metric-label">Temps dans l'étape</div>
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
            <GlobalOutlined style={{ color: '#13c2c2', fontSize: '24px' }} />
          </div>
          <div className="metric-content">
            <div className="metric-label">Montant d'investissement</div>
            <div className="metric-value" style={{ color: '#13c2c2' }}>
              {investisseur.montant_investissement ? 
                formatMoney(investisseur.montant_investissement, investisseur.devise) : 
                'Non défini'
              }
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
              entityType="investisseur"
              entityId={id}
              stages={pipelineStages}
              currentStage={currentStage}
              progression={progression || []}
              pipelineCompletedAt={investisseur?.converted_to_project_at || (investisseur?.projets?.length > 0 ? new Date().toISOString() : null)}
              onStagesChange={() => dispatch(getPipelineStatus(id))}
              showAddButton={true}
              buttonText="Ajouter une étape"
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
                  <p>Cet investisseur n'a pas encore de pipeline défini.</p>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleInitializePipeline}
                    disabled={investisseur.statut === 'converti' || investisseur.projets?.length > 0}
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
                  <Title level={4}>Informations de l'investisseur</Title>
                  <Button 
                    icon={<EditOutlined />} 
                    onClick={() => navigate(`/investisseurs/${id}/edit`)}
                    className="modern-btn"
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
                        progression={progression || []}
                      />
                    </Card>

                    {!(investisseur.statut === 'converti' || investisseur.projets?.length > 0) && (
                      <Card title="Actions de progression" style={{ marginTop: 16 }}>
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <Text strong>Étape actuelle : </Text>
                              <Tag color={effectiveCurrentStage?.is_final ? 'green' : 'blue'}>
                                {effectiveCurrentStage?.name || 'Non définie'}
                              </Tag>
                              {effectiveCurrentStage?.is_final && (
                                <Tag color="gold" style={{ marginLeft: 8 }}>
                                  Étape finale
                                </Tag>
                              )}
                            </div>
                            <div>
                              {(() => {
                                const currentOrder = effectiveCurrentStage?.order || 0;
                                const maxOrder = Math.max(...(pipelineStages.map(s => s.order) || [0]));
                                const progress = maxOrder > 0 ? Math.round((currentOrder / maxOrder) * 100) : 0;

                                return (
                                  <div style={{ textAlign: 'right' }}>
                                    <Text type="secondary">Progression: {progress}%</Text>
                                    <Progress
                                      percent={progress}
                                      size="small"
                                      style={{ width: 120, marginTop: 4 }}
                                    />
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                          {(() => {
                            if (investisseur.statut === 'converti' || investisseur.projets?.length > 0) {
                              return (
                                <Alert
                                  message="Investisseur déjà converti"
                                  description="Cet investisseur a déjà été converti en projet."
                                  type="success"
                                  showIcon
                                />
                              );
                            }

                            if (!effectiveCurrentStage) {
                              return (
                                <Alert
                                  message="Aucune étape définie"
                                  description="Cet investisseur n'a pas d'étape de pipeline définie."
                                  type="warning"
                                  showIcon
                                />
                              );
                            }

                            if (effectiveCurrentStage.is_final) {
                              return (
                                <Alert
                                  message="Prêt pour la conversion"
                                  description="Cet investisseur est dans l'étape finale et peut maintenant être converti en projet."
                                  type="success"
                                  showIcon
                                  action={
                                    <Button
                                      type="primary"
                                      size="small"
                                      onClick={() => setConversionModalVisible(true)}
                                    >
                                      Convertir maintenant
                                    </Button>
                                  }
                                />
                              );
                            }

                            return (
                              <Alert
                                message="Progression requise"
                                description="L'investisseur doit atteindre l'étape finale du pipeline avant d'être converti."
                                type="info"
                                showIcon
                              />
                            );
                          })()}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            {nextStage ? (
                              <div>
                                <Text strong>Prochaine étape : </Text>
                                <Tag color="orange">{nextStage.name}</Tag>
                                {nextStage.is_final && (
                                  <Tag color="gold" style={{ marginLeft: 8 }}>
                                    Finale
                                  </Tag>
                                )}
                              </div>
                            ) : (
                              <Text type="success" strong>✓ Dernière étape atteinte</Text>
                            )}
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
                            ) : effectiveCurrentStage?.is_final ? (
                              <Button
                                type="primary"
                                icon={<CheckOutlined />}
                                onClick={() => setConversionModalVisible(true)}
                              >
                                Convertir en projet
                              </Button>
                            ) : (
                              <Button
                                type="default"
                                disabled
                              >
                                Étape finale requise
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    )}

                    {investisseur.projets && investisseur.projets.length > 0 && (
                      <Card title="Conversion réussie" style={{ marginTop: 16 }}>
                        <Alert
                          message="Investisseur converti avec succès"
                          description={
                            <div>
                              <p>Cet investisseur a été converti en projet le {moment(investisseur.projets[0].created_at).format('DD/MM/YYYY')}.</p>
                              <Button
                                type="primary"
                                icon={<LinkOutlined />}
                                onClick={() => navigate(`/projets/${investisseur.projets[0].id}`)}
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
                    className="modern-btn-primary"
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
                  <Button type="primary" icon={<PlusOutlined />} className="modern-btn-primary">
                    Ajouter une note
                  </Button>
                </div>
                <Empty description="Aucune note" className="empty-state" />
              </div>
            </TabPane>

            <TabPane tab={
              <Space>
                <ProjectOutlined />
                Projets
              </Space>
            } key="projets">
              <div className="tab-content">
                {investisseur.projets && investisseur.projets.length > 0 ? (
                  <List
                    itemLayout="horizontal"
                    dataSource={investisseur.projets}
                    renderItem={projet => (
                      <List.Item
                        actions={[
                          <Button
                            type="primary"
                            icon={<LinkOutlined />}
                            onClick={() => navigate(`/projets/${projet.id}`)}
                          >
                            Voir
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<Avatar icon={<ProjectOutlined />} />}
                          title={<Link to={`/projets/${projet.id}`}>{projet.title || projet.nom}</Link>}
                          description={
                            <div>
                              <div>{projet.description}</div>
                              <div>Créé le {moment(projet.created_at).format('DD/MM/YYYY')}</div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div className="empty-projects">
                    <Empty
                      description="Aucun projet associé à cet investisseur"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                    <div style={{ marginTop: 16, textAlign: 'center' }}>
                      <Button
                        type="primary"
                        icon={<ProjectOutlined />}
                        onClick={() => setConversionModalVisible(true)}
                        disabled={!canConvertToProject()}
                        className="modern-btn-primary"
                      >
                        Créer un projet
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabPane>
          </Tabs>
        </Card>
      </motion.div>

      {/* Modal pour avancer dans le pipeline */}
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
            name="stage_id"
            label="Étape du pipeline"
            rules={[{ required: true, message: 'Veuillez sélectionner une étape' }]}
            initialValue={nextStage?.id}
          >
            <Select
              placeholder="Sélectionner l'étape suivante"
              onChange={value => setSelectedPipelineStage(value)}
            >
              {pipelineStages.map(stage => (
                <Option
                  key={stage.id}
                  value={stage.id}
                  disabled={stage.order <= (effectiveCurrentStage?.order || 0)}
                >
                  {stage.name}
                  {stage.is_final && ' (Étape finale)'}
                </Option>
              ))}
            </Select>
          </Form.Item>

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

      {/* Modal de conversion en projet */}
      <Modal
        title="Convertir en projet"
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
            icon={<ProjectOutlined />}
            onClick={handleConversion}
            loading={operation.loading && (operation.type === 'convert_to_project' || operation.type === 'create_from_investisseur')}
          >
            Créer le projet
          </Button>
        ]}
      >
        <Form
          form={conversionForm}
          layout="vertical"
          initialValues={{
            title: `Projet - ${investisseur?.nom}`,
            company_name: investisseur?.entreprise?.nom || '',
            secteur_id: investisseur?.secteur_id,
            responsable_id: investisseur?.responsable_id || currentUser?.id,
            investment_amount: investisseur?.valeur_potentielle || investisseur?.montant_investissement,
            contact_source: 'Conversion depuis Investisseur',
            initial_contact_person: investisseur?.nom,
            first_contact_date: moment(),
            start_date: moment(),
            status: 'planned',
            in_progress: false,
            in_production: false,
            is_blocked: false,
            market_target: 'local',
            nationality: investisseur?.pays?.name || null,
            foreign_percentage: 0,
            jobs_expected: 0,
            industrial_zone: null,
            idea: true,
            contact_source: null,
          }}
        >
          {/* Informations de base */}
          <Card type="inner" title="Informations de base" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="title"
                  label="Titre du projet"
                  rules={[{ required: true, message: 'Veuillez entrer un titre' }]}
                >
                  <Input placeholder="Titre du projet" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="company_name"
                  label="Nom de l'entreprise"
                  rules={[{ required: true, message: 'Veuillez entrer le nom de l\'entreprise' }]}
                >
                  <Input placeholder="Nom de l'entreprise" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Description du projet"
              rules={[{ required: true, message: 'Veuillez entrer une description' }]}
            >
              <TextArea
                rows={3}
                placeholder="Description détaillée du projet"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="secteur_id"
                  label="Secteur d'activité"
                  rules={[{ required: true, message: 'Veuillez sélectionner un secteur' }]}
                >
                  <Select
                    placeholder="Sélectionner un secteur"
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {secteurs.map(secteur => (
                      <Option key={secteur.id} value={secteur.id}>
                        {secteur.nom || secteur.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="responsable_id"
                  label="Responsable du projet"
                  rules={[{ required: true, message: 'Veuillez sélectionner un responsable' }]}
                >
                  <Select
                    placeholder="Sélectionner un responsable"
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {users.map(user => (
                      <Option key={user.id} value={user.id}>{user.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Détails du projet */}
          <Card type="inner" title="Détails du projet" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="investment_amount"
                  label="Montant d'investissement"
                  rules={[{ required: true, message: 'Veuillez entrer un montant' }]}
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
                  name="jobs_expected"
                  label="Emplois attendus"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Nombre d'emplois"
                    min={0}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="market_target"
                  label="Marché cible"
                  rules={[{ required: true, message: 'Veuillez spécifier le marché cible' }]}
                >
                  <Select
                    placeholder="Sélectionner le marché cible"
                    showSearch
                  >
                    <Option value="local">Marché local</Option>
                    <Option value="export">Marché export</Option>
                    <Option value="both">Marché local et export</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="nationality"
                  label="Nationalité du projet"
                >
                  <Select
                    placeholder="Sélectionner une nationalité"
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {pays.map(pay => (
                      <Option key={pay.id} value={pay.name}>
                        {pay.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            
            // ...existing code...

<Row gutter={16}>
  <Col span={12}>
    <Form.Item
      name="foreign_percentage"
      label="Pourcentage d'investissement étranger"
    >
      <InputNumber
        style={{ width: '100%' }}
        placeholder="Pourcentage"
        min={0}
        max={100}
        formatter={value => `${value}%`}
        parser={value => value.replace('%', '')}
      />
    </Form.Item>
  </Col>
  <Col span={12}>
    <Form.Item
      name="industrial_zone"
      label="Zone industrielle"
    >
      <Input placeholder="Zone industrielle ou région" />
    </Form.Item>
  </Col>
</Row>
</Card>

{/* Dates et statut */}
<Card type="inner" title="Planification" style={{ marginBottom: 16 }}>
<Row gutter={16}>
  <Col span={12}>
    <Form.Item
      name="start_date"
      label="Date de début prévue"
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
      name="first_contact_date"
      label="Date du premier contact"
    >
      <DatePicker 
        style={{ width: '100%' }}
        placeholder="Premier contact"
        format="DD/MM/YYYY"
      />
    </Form.Item>
  </Col>
  <Col span={12}>
    <Form.Item
      name="status"
      label="Statut du projet"
      rules={[{ required: true, message: 'Veuillez sélectionner un statut' }]}
    >
      <Select placeholder="Statut du projet">
        <Option value="planned">Planifié</Option>
        <Option value="in_progress">En cours</Option>
        <Option value="completed">Terminé</Option>
        <Option value="cancelled">Annulé</Option>
        <Option value="on_hold">En attente</Option>
      </Select>
    </Form.Item>
  </Col>
</Row>
</Card>

{/* Informations de contact */}
<Card type="inner" title="Informations de contact" style={{ marginBottom: 16 }}>
<Row gutter={16}>
  <Col span={12}>
    <Form.Item
      name="contact_source"
      label="Source du contact"
    >
      <Input placeholder="Comment le contact a été établi" />
    </Form.Item>
  </Col>
  <Col span={12}>
    <Form.Item
      name="initial_contact_person"
      label="Personne de contact initial"
    >
      <Input placeholder="Nom de la personne contactée" />
    </Form.Item>
  </Col>
</Row>
</Card>

{/* Options et caractéristiques */}
<Card type="inner" title="Caractéristiques du projet">
<Row gutter={16}>
  <Col span={8}>
    <Form.Item name="idea" valuePropName="checked">
      <Checkbox>Projet d'idée</Checkbox>
    </Form.Item>
  </Col>
  <Col span={8}>
    <Form.Item name="in_progress" valuePropName="checked">
      <Checkbox>En cours de réalisation</Checkbox>
    </Form.Item>
  </Col>
  <Col span={8}>
    <Form.Item name="in_production" valuePropName="checked">
      <Checkbox>En production</Checkbox>
    </Form.Item>
  </Col>
</Row>

<Form.Item name="is_blocked" valuePropName="checked">
  <Checkbox>Projet bloqué</Checkbox>
</Form.Item>

<Form.Item
  name="notes"
  label="Notes supplémentaires"
>
  <TextArea 
    rows={3} 
    placeholder="Informations supplémentaires sur le projet..." 
  />
</Form.Item>
</Card>

<Alert
message="Information importante"
description="Cette action va créer un nouveau projet et marquer automatiquement l'investisseur comme 'converti'. L'investisseur sera lié au projet créé."
type="warning"
showIcon
style={{ marginTop: 16 }}
/>
</Form>
</Modal>

{/* Modal de création de tâche */}
<TaskCreateModal
visible={taskModalVisible}
onCancel={() => setTaskModalVisible(false)}
onSuccess={() => {
setTaskModalVisible(false);
setRefreshTrigger(prev => prev + 1);
message.success('Tâche créée avec succès');
}}
entityType="investisseur"
entityId={id}
stageId={selectedStageForTask}
stageName={selectedStageName}
entityName={investisseur?.nom}
/>

{/* Styles CSS modernes */}
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
.tasks-header,
.notes-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 24px;
}

.details-header h4,
.tasks-header h4,
.notes-header h4 {
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

.empty-projects {
text-align: center;
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

.modern-btn-disabled {
border-radius: 8px;
opacity: 0.6;
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
.tasks-header,
.notes-header {
flex-direction: column;
align-items: flex-start;
gap: 16px;
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

.ant-statistic {
text-align: center;
padding: 16px;
border-radius: 8px;
background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
transition: all 0.3s ease;
}

.ant-statistic:hover {
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
`}</style>
</div>
);
};

export default InvestisseurDetails;