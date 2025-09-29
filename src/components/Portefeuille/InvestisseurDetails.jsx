import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Card, Descriptions, Button, Space, Spin, Tag, Tabs, Typography, Modal,
  message, Divider, Row, Col, Breadcrumb, Statistic, Tooltip, Badge, Checkbox, List,
  Dropdown, Menu, Steps, Alert, Timeline, Form, DatePicker, Select, Input, Progress, InputNumber,
  Avatar, Empty
} from 'antd';
import {
  EditOutlined, DeleteOutlined, ArrowLeftOutlined, ExclamationCircleOutlined,
  MailOutlined, PhoneOutlined, UserOutlined, CalendarOutlined, FileTextOutlined,
  BankOutlined, TeamOutlined, CheckCircleOutlined, CloseCircleOutlined, CheckOutlined,
  QuestionCircleOutlined, DownOutlined, EllipsisOutlined, HistoryOutlined, LoadingOutlined, PlusOutlined,
  MessageOutlined, InfoCircleOutlined, SendOutlined, AuditOutlined, BellOutlined, GlobalOutlined, RightOutlined,
  SearchOutlined, SettingOutlined, ClockCircleOutlined, ArrowUpOutlined, WarningOutlined, LinkOutlined,
  ProjectOutlined
} from '@ant-design/icons';
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
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const InvestisseurDetails = () => {
  // États du formulaire et du composant
  const [taskForm] = Form.useForm();
  const [pipelineForm] = Form.useForm();
  const [conversionForm] = Form.useForm();

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
    // Vérifier si déjà converti
    if (investisseur?.statut === 'converti' || investisseur?.projects?.length > 0) {
      return false;
    }
    
    // Vérifier si on est dans l'étape finale
    if (!effectiveCurrentStage) {
      return false;
    }
    
    // Nouvelle logique : permettre la conversion si on est à la dernière étape OU si l'étape est finale
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
        status: 'planned', // Changé de 'active' à 'planned' selon l'enum de la DB
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
          // Recharger les données du pipeline ET de l'investisseur
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
          // Recharger les données
          dispatch(getPipelineStatus(id));
          break;
        case 'create_from_investisseur':
          message.success('Projet créé avec succès à partir de l\'investisseur');
          setConversionModalVisible(false);
          conversionForm.resetFields();
          // Recharger les données de l'investisseur
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

  // Charger les tâches lorsque l'onglet Tasks est actif
  useEffect(() => {
    if (activeTab === 'tasks' && effectiveCurrentStage?.id) {
      loadPipelineTasks();
    }
  }, [activeTab, effectiveCurrentStage, loadPipelineTasks, refreshTrigger]);

  // Chargement des blocages
  // const loadBlockages = useCallback(async () => {
  //   try {
  //     const response = await axios.get(`${API_URL}/blockages`);
  //     const allBlockages = response.data.data || [];

  //     const stageBlockages = allBlockages.filter(
  //       blockage =>
  //         blockage.blockable_type === 'investisseur' &&
  //         blockage.blockable_id === parseInt(id) &&
  //         blockage.pipeline_stageable_type === 'pipeline_stage' &&
  //         blockage.pipeline_stageable_id === effectiveCurrentStage?.id
  //     );

  //     setBlockages(stageBlockages);
  //   } catch (error) {
  //     console.error('Erreur lors du chargement des blocages:', error);
  //   }
  // }, [id, effectiveCurrentStage]);

  // Charger les blocages quand l'onglet est actif
  // useEffect(() => {
  //   if (activeTab === 'blockages' && id && effectiveCurrentStage?.id) {
  //     loadBlockages();
  //   }
  // }, [activeTab, id, effectiveCurrentStage, loadBlockages]);

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

      // Vérifier si on peut convertir
      if (!canConvertToProject()) {
        message.warning('Cet investisseur n\'est pas dans l\'étape finale du pipeline');
        return;
      }

      // Préparer les données selon les colonnes exactes de la base de données
      const projectData = {
        // Informations de base (colonnes obligatoires)
        title: values.title,
        description: values.description,
        company_name: values.company_name,

        // Status et flags booléens
        idea: values.idea || false,
        in_progress: values.in_progress || false,
        in_production: values.in_production || false,
        is_blocked: values.is_blocked || false,

        // Relations (IDs)
        secteur_id: values.secteur_id,
        responsable_id: values.responsable_id,
        investisseur_id: parseInt(id),

        // Détails du projet
        market_target: values.market_target || null,
        nationality: values.nationality || null,
        foreign_percentage: values.foreign_percentage || 0,
        investment_amount: values.investment_amount,
        jobs_expected: values.jobs_expected || 0,
        industrial_zone: values.industrial_zone || null,

        // Pipeline
        pipeline_stage_id: values.pipeline_stage_id || null,
        pipeline_completed_at: null, // Sera défini par le backend si nécessaire
        pipeline_completed_by: null, // Sera défini par le backend si nécessaire

        // Dates
        start_date: values.start_date?.format('YYYY-MM-DD') || null,
        end_date: values.end_date?.format('YYYY-MM-DD') || null,
        first_contact_date: values.first_contact_date?.format('YYYY-MM-DD') || null,

        // Contact et source
        contact_source: values.contact_source,
        initial_contact_person: values.initial_contact_person || investisseur?.nom,

        // Métadonnées
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
      <div className="loading-container">
        <Spin size="large" tip="Chargement des détails de l'investisseur..." />
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
          <Button type="primary" onClick={() => navigate('/investisseurs')} style={{ marginTop: 16 }}>
            Retour à la liste
          </Button>
        </div>
      </Card>
    );
  }

  // Affichage si l'investisseur n'est pas trouvé
  if (!investisseur) {
    return (
      <Card className="not-found-card">
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <InfoCircleOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <Title level={4}>Investisseur non trouvé</Title>
          <Text>L'investisseur que vous recherchez n'existe pas ou a été supprimé.</Text>
          <div style={{ marginTop: 24 }}>
            <Button type="primary" onClick={() => navigate('/investisseurs')}>
              Retour à la liste
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // RENDU PRINCIPAL AVEC DESIGN CRM
  return (
    <div className="crm-container">
      {/* En-tête avec le style CRM */}
      <div className="crm-header">
        <div className="crm-lead-info">
          <div className="crm-avatar">
            <Avatar icon={<BankOutlined />} size={42} style={{ backgroundColor: '#1890ff' }} />
          </div>
          <div className="crm-title">
            <div className="crm-lead-label">
              Investisseur: <span className="lead-name">"{investisseur.nom}"</span>
              {investisseur.entreprise && <span className="lead-company"> - ({investisseur.entreprise.nom})</span>}
            </div>
            <div className="crm-lead-actions">
              <Link to="#" className="crm-link">{investisseur.entreprise?.nom || 'Entreprise non définie'}</Link>
            </div>
          </div>
        </div>

        <div className="crm-header-actions">

          <Dropdown overlay={statusMenu} placement="bottomRight">
            <Button className="crm-btn crm-options-btn">
              Status <DownOutlined />
            </Button>
          </Dropdown>

          {/* Bouton conditionnel pour la conversion */}
          {investisseur.projets && investisseur.projets.length > 0 ? (
            <Button
              className="crm-btn crm-view-project-btn"
              type="primary"
              icon={<LinkOutlined />}
              onClick={() => navigate(`/projets/${investisseur.projets[0].id}`)}
            >
              Voir le projet
            </Button>
          ) : investisseur.statut === 'converti' ? (
            <Button
              className="crm-btn crm-converted-btn"
              disabled
              icon={<CheckOutlined />}
            >
              Déjà converti
            </Button>
          ) : (
            <Button
              className="crm-btn crm-convert-btn"
              type="primary"
              icon={<ProjectOutlined />}
              onClick={() => setConversionModalVisible(true)}
              disabled={!canConvertToProject()}
            >
              Convertir en projet
            </Button>
          )}
        </div>
      </div>

      {/* Informations du pipeline */}
      <div className="crm-meta-info">
        <div className="crm-meta-item">
          <div className="crm-meta-label">STATUS:</div>
          <div className="crm-meta-value">
            {renderStatus(investisseur.statut)}
          </div>
        </div>
        <div className="crm-meta-item">
          <div className="crm-meta-label">CONVERSION STATUS:</div>
          <div className="crm-meta-value">
            {(() => {
              // Vérifier si déjà converti
              if (investisseur.statut === 'converti' || investisseur.projets?.length > 0) {
                return (
                  <Tag color="success" icon={<CheckOutlined />}>
                    Converti en projet
                  </Tag>
                );
              }

              // Vérifier si on est dans l'étape finale
              if (!effectiveCurrentStage) {
                return (
                  <Tag color="red">
                    Aucune étape définie
                  </Tag>
                );
              }

              // Logique simplifiée: juste vérifier is_final
              if (effectiveCurrentStage.is_final) {
                return (
                  <Tag color="green">
                    Prêt à convertir
                  </Tag>
                );
              }

              return (
                <Tag color="blue">
                  En progression
                </Tag>
              );
            })()}
          </div>
        </div>
        <div className="crm-meta-item">
          <div className="crm-meta-label">SECTEUR:</div>
          <div className="crm-meta-value">
            <Link to="#" className="crm-link">{investisseur.secteur?.name || 'Non défini'}</Link>
          </div>
        </div>
        <div className="crm-meta-item">
          <div className="crm-meta-label">PIPELINE ADDED:</div>
          <div className="crm-meta-value">{moment(investisseur.created_at).format('MMM D, YYYY')}</div>
        </div>
        <div className="crm-meta-item">
          <div className="crm-meta-label">TIME IN CURRENT STAGE:</div>
          <div className="crm-meta-value">
            {progression && progression.length > 0
              ? moment().diff(moment(progression[0].created_at), 'days') + ' DAYS'
              : 'N/A'}
          </div>
        </div>
        <div className="crm-meta-item">
          <div className="crm-meta-label">OWNER(S):</div>
          <div className="crm-meta-value">
            <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
            <Link to="#" className="crm-link">{investisseur.responsable?.name || 'Non assigné'}</Link>
          </div>
        </div>
      </div>

      {/* Visualisation du pipeline avec étapes */}
      <div className="crm-pipeline-visualization">
        {pipelineStages.length > 0 ? (
          <PipelineStageManager
            entityType="investisseur"
            entityId={id}
            stages={pipelineStages}
            currentStage={currentStage}
            progression={progression || []}
            pipelineCompletedAt={investisseur?.converted_to_project_at || (investisseur?.projets?.length > 0 ? new Date().toISOString() : null)}
            onStagesChange={() => dispatch(getPipelineStatus(id))}
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
                <p>Cet investisseur n'a pas encore de pipeline défini.</p>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleInitializePipeline}
                  disabled={investisseur.statut === 'converti' || investisseur.projets?.length > 0}
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
          <TabPane tab={<span><InfoCircleOutlined /> Details</span>} key="details">
            <div className="crm-details-section">
              <div className="crm-details-header">
                <h3>Informations de l'investisseur</h3>
                <Button icon={<EditOutlined />} size="small" onClick={() => navigate(`/investisseurs/${id}/edit`)}>
                  Edit details
                </Button>
              </div>

              <Descriptions bordered column={2}>
                <Descriptions.Item label="Nom">{investisseur.nom}</Descriptions.Item>
                <Descriptions.Item label="Email">{investisseur.email}</Descriptions.Item>
                <Descriptions.Item label="Téléphone">{investisseur.telephone || 'Non renseigné'}</Descriptions.Item>
                <Descriptions.Item label="Entreprise">{investisseur.entreprise?.nom || 'Non assignée'}</Descriptions.Item>
                <Descriptions.Item label="Pays">{investisseur.pays?.name || 'Non renseigné'}</Descriptions.Item>
                <Descriptions.Item label="Secteur d'activité">{investisseur.secteur?.name || 'Non renseigné'}</Descriptions.Item>
                <Descriptions.Item label="Montant d'investissement">
                  {investisseur.montant_investissement ? formatMoney(investisseur.montant_investissement, investisseur.devise) : 'Non défini'}
                </Descriptions.Item>
                <Descriptions.Item label="Responsable">{investisseur.responsable?.name || 'Non assigné'}</Descriptions.Item>
                <Descriptions.Item label="Date d'engagement">
                  {investisseur.date_engagement ? moment(investisseur.date_engagement).format('DD/MM/YYYY') : 'Non définie'}
                </Descriptions.Item>
                <Descriptions.Item label="Date de signature">
                  {investisseur.date_signature ? moment(investisseur.date_signature).format('DD/MM/YYYY') : 'Non définie'}
                </Descriptions.Item>
              </Descriptions>

              <div className="crm-info-blocks">
                <Card title="Critères d'investissement:" bordered={false}>
                  <Text>{investisseur.criteres_investissement || 'Aucun critère spécifié.'}</Text>
                </Card>

                <Card title="Intérêts spécifiques:" bordered={false}>
                  <Text>{investisseur.interets_specifiques || 'Aucun intérêt spécifié.'}</Text>
                </Card>

                <Card title="Notes internes:" bordered={false}>
                  <Text>{investisseur.notes || 'Aucune note interne.'}</Text>
                </Card>

                {investisseur.projets && investisseur.projets.length > 0 && (
                  <Card title="Converti en projet:" bordered={false}>
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
                )}
              </div>
            </div>
          </TabPane>

          <TabPane tab={<span><AuditOutlined /> Stages</span>} key="stages">
            <div className="crm-stages-section">
              {pipelineStages.length > 0 ? (
                <>
                  <Card title="Progression dans le pipeline" className="crm-stages-card">
                    <PipelineVisualizer
                      stages={pipelineStages}
                      currentStage={effectiveCurrentStage}
                      progression={progression || []}
                    />
                  </Card>

                  {/* Section pour les actions de progression */}
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
                              // Calculer la progression basée sur l'ordre des étapes
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
                          // Vérifier si déjà converti
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

                          // Vérifier si aucune étape définie
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

                          // Vérifier si étape finale
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

                          // Si pas encore dans l'étape finale
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

                  {/* Information sur la conversion */}
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
                />
              )}
            </div>
          </TabPane>

          <TabPane tab={<span><WarningOutlined /> Blockages ({blockages.length})</span>} key="blockages">
            <PipelineBlockages
              entityType="investisseur"
              entityId={id}
              pipelineStages={pipelineStages || []}
              title="Blocages par étape du pipeline"
            />
          </TabPane>

          <TabPane tab={<span><ClockCircleOutlined /> Tasks</span>} key="tasks">
            <div className="crm-tasks-container">
              <div className="crm-tasks-header">
                <h3>Liste des tâches</h3>
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
                >
                  Add Task
                </Button>
              </div>

              <div className="crm-tasks-content">
                <PipelineTasks
                  entityType="investisseur"
                  entityId={id}
                  stageId={effectiveCurrentStage?.id}
                  onEdit={(task) => {
                    openTaskModal(task.pipeline_stage_id, effectiveCurrentStage?.name, task);
                  }}
                />
              </div>
            </div>
          </TabPane>

          <TabPane tab={<span><FileTextOutlined /> Notes</span>} key="notes">
            <div className="crm-notes-container">
              <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }}>
                Add Note
              </Button>
              <Empty description="No notes" />
            </div>
          </TabPane>

          <TabPane tab={<span><ProjectOutlined /> Projets</span>} key="projets">
            <div className="crm-projects-container">
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
                    >
                      Créer un projet
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabPane>
        </Tabs>
      </div>

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
            // Informations de base
            title: `Projet - ${investisseur?.nom}`,
            company_name: investisseur?.entreprise?.nom || '',
            secteur_id: investisseur?.secteur_id,
            responsable_id: investisseur?.responsable_id || currentUser?.id,
            investment_amount: investisseur?.valeur_potentielle || investisseur?.montant_investissement,

            // Contact et source
            contact_source: 'Conversion depuis Investisseur',
            initial_contact_person: investisseur?.nom,
            first_contact_date: moment(),

            // Dates par défaut
            start_date: moment(),

            // Status et flags
            status: 'planned', // Changé de 'active' à 'planned' selon l'enum de la DB
            in_progress: false,
            in_production: false,
            is_blocked: false,

            // Nouveaux champs avec valeurs par défaut
            market_target: 'local', // Valeur par défaut selon le schéma (local, export, both)
            nationality: investisseur?.pays?.name || null,
            foreign_percentage: 0,
            jobs_expected: 0, // Changé à 0 selon le schéma
            industrial_zone: null,
            
            // Ajout des nouveaux champs selon le schéma
            idea: true, // Par défaut true selon le schéma
            contact_source: null, // Sera défini selon l'enum
          }}
        >
          {/* <Alert
            message="Conditions de conversion"
            description={
              <div>
                <p>Pour convertir un investisseur en projet, les conditions suivantes doivent être remplies :</p>
                <ul>
                  <li>
                    Pas déjà converti {
                      (investisseur.statut === 'converti' || investisseur.projets?.length > 0) ? '✗' : '✓'
                    }
                  </li>
                  <li>
                    Être dans l'étape finale du pipeline {
                      effectiveCurrentStage?.is_final ? '✓' : '✗'
                    }
                  </li>
                </ul>
                <div style={{ marginTop: 12, padding: 8, backgroundColor: '#f0f0f0', borderRadius: 4 }}>
                  <Text strong>État actuel :</Text>
                  <br />
                  <Text>Étape actuelle : {effectiveCurrentStage?.name || 'Non définie'}</Text>
                  <br />
                  <Text>Type d'étape : {
                    effectiveCurrentStage?.is_final ? (
                      <Tag color="green">Finale</Tag>
                    ) : (
                      <Tag color="orange">Intermédiaire</Tag>
                    )
                  }</Text>
                  <br />
                  <Text>Statut : {investisseur.statut}</Text>
                </div>
                {!effectiveCurrentStage?.is_final && (
                  <div style={{ marginTop: 12, padding: 8, backgroundColor: '#fff7e6', borderRadius: 4, border: '1px solid #ffd591' }}>
                    <Text type="warning">
                      💡 <strong>Conseil :</strong> Faites progresser l'investisseur jusqu'à l'étape finale du pipeline avant de le convertir.
                    </Text>
                  </div>
                )}
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          /> */}

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
                    {/* <Option value="international">Marché international</Option>
                    <Option value="global">Marché global</Option> */}
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

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="foreign_percentage"
                  label="Pourcentage étranger (%)"
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
                  <Input placeholder="Zone industrielle (optionnel)" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="start_date"
                  label="Date de début"
                  rules={[{ required: true, message: 'Veuillez sélectionner une date de début' }]}
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
                  label="Date de fin estimée"
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    placeholder="Date de fin (optionnel)"
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Statut du projet"
                  rules={[{ required: true, message: 'Veuillez sélectionner un statut' }]}
                >
                  <Select placeholder="Sélectionner un statut">
                    <Option value="planned">Planifié</Option>
                    <Option value="in_progress">En cours</Option>
                    <Option value="completed">Terminé</Option>
                    <Option value="abandoned">Abandonné</Option>
                    <Option value="suspended">Suspendu</Option>
                    <Option value="on_hold">En attente</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="contact_source"
                  label="Source de contact"
                >
                  <Select placeholder="Sélectionner une source">
                    <Option value="action_promo">Action promotionnelle</Option>
                    <Option value="visite">Visite</Option>
                    <Option value="reference">Référence</Option>
                    <Option value="salon">Salon</Option>
                    <Option value="direct">Contact direct</Option>
                    <Option value="autre">Autre</Option>
                  </Select>
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
                    placeholder="Date du premier contact"
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="initial_contact_person"
                  label="Personne de contact initial"
                >
                  <Input placeholder="Nom de la personne de contact" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="idea" valuePropName="checked" style={{ marginBottom: 16 }}>
              <Checkbox>Ce projet est encore au stade d'idée</Checkbox>
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="in_progress" valuePropName="checked">
                  <Checkbox>Projet en cours de développement</Checkbox>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="in_production" valuePropName="checked">
                  <Checkbox>Projet en production</Checkbox>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="is_blocked" valuePropName="checked">
                  <Checkbox>Projet bloqué</Checkbox>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="notes"
              label="Notes sur le projet"
            >
              <TextArea
                rows={3}
                placeholder="Notes supplémentaires sur le projet"
              />
            </Form.Item>
          </Card>
        </Form>
      </Modal>

      {/* Modal pour créer une tâche */}
      <TaskCreateModal
        visible={taskModalVisible}
        onCancel={() => setTaskModalVisible(false)}
        onSuccess={() => {
          setRefreshTrigger(prev => prev + 1);
          loadPipelineTasks();
        }}
        entityType="investisseur"
        entityId={id}
        stageId={selectedStageForTask}
        stageName={selectedStageName}
        entityName={investisseur?.nom}
      />

      {/* Styles CSS pour la cohérence avec ProspectDetails */}
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
  
  .crm-convert-btn {
    background-color: #722ed1;
    border-color: #722ed1;
  }
  
  .crm-view-project-btn {
    background-color: #52c41a;
    border-color: #52c41a;
  }
  
  .crm-view-project-btn:hover {
    background-color: #73d13d;
    border-color: #73d13d;
  }
  
  .crm-converted-btn {
    background-color: #f0f0f0;
    border-color: #d9d9d9;
    color: #8c8c8c;
  }
  
  .crm-advance-btn {
    background-color: #1890ff;
    color: white;
    border-color: #1890ff;
  }
  
  .crm-advance-btn:hover {
    background-color: #40a9ff;
    border-color: #40a9ff;
    color: white;
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
  
  .crm-tasks-container {
    padding: 16px;
  }
  
  .crm-tasks-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .crm-tasks-header h3 {
    margin: 0;
    color: #333;
  }
  
  .crm-tasks-content {
    min-height: 120px;
  }
  
  .crm-notes-container {
    padding: 16px;
  }
  
  .crm-projects-container {
    padding: 16px;
  }
  
  .empty-projects {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px;
  }
  
  .crm-conversion-indicator {
    text-align: center;
    padding: 8px 0;
    font-size: 14px;
    background-color: white;
    border-bottom: 1px solid #e8e8e8;
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

export default InvestisseurDetails;