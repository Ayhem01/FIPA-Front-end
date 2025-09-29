import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Card, Descriptions, Button, Space, Spin, Tag, Tabs, Typography, Modal,
  message, Divider, Row, Col, Breadcrumb, Statistic, Tooltip, Badge, Checkbox, List,
  Dropdown, Menu, Steps, Alert, Timeline, Form, DatePicker, Select, Input, Progress, InputNumber,
  Avatar
} from 'antd';
import {
  EditOutlined, DeleteOutlined, ArrowLeftOutlined, ExclamationCircleOutlined,
  MailOutlined, PhoneOutlined, UserOutlined, CalendarOutlined, FileTextOutlined,
  BankOutlined, TeamOutlined, CheckCircleOutlined, CloseCircleOutlined, CheckOutlined,
  QuestionCircleOutlined, DownOutlined, EllipsisOutlined, HistoryOutlined, LoadingOutlined, PlusOutlined,
  MessageOutlined, InfoCircleOutlined, SendOutlined, AuditOutlined, BellOutlined, GlobalOutlined, RightOutlined,
  SearchOutlined, SettingOutlined, ClockCircleOutlined, ArrowUpOutlined, WarningOutlined, LinkOutlined
} from '@ant-design/icons';
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

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;
const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const ProspectDetails = () => {
  // Déplacé à l'intérieur du composant - correction de l'erreur
  const [taskForm] = Form.useForm();
  const [shouldCreateTask, setShouldCreateTask] = useState(false);

  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [conversionModalVisible, setConversionModalVisible] = useState(false);
  const [pipelineModalVisible, setPipelineModalVisible] = useState(false);
  const [selectedPipelineStage, setSelectedPipelineStage] = useState(null);
  const [conversionForm] = Form.useForm();
  const [pipelineForm] = Form.useForm();
  // Ajouter un état pour forcer le rechargement
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

  // Vérification de l'ID au début
  useEffect(() => {
    if (!id) {
      console.error('ID du prospect manquant dans les paramètres URL');
      message.error('ID du prospect manquant');
      navigate('/prospects');
      return;
    }
    console.log('ID du prospect récupéré:', id);
  }, [id, navigate]);

  // Vérifier le statut de conversion
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

  // Charger les données du prospect et son pipeline
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

  // Gérer les opérations réussies ou échouées
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
          // Ne pas afficher de message ici car c'est géré dans handleConversion
          break;
        default:
          message.success('Opération réussie');
      }
      dispatch(resetOperation());
    } else if (operation.error) {
      // Afficher l'erreur seulement si ce n'est pas une conversion (gérée dans handleConversion)
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

  // Ajoutez un effet pour réinitialiser le formulaire de tâche lorsqu'on ouvre le modal
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

  // Modifier le statut
  const handleStatusChange = (newStatus) => {
    dispatch(updateProspectStatus({ id, statut: newStatus }));
  };

  // Avancer dans le pipeline
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

  // Convertir en investisseur
  const handleConversion = () => {
    conversionForm.validateFields().then(values => {
      if (!id) {
        message.error('ID du prospect manquant');
        return;
      }

      // Fonction utilitaire pour formater les dates
      const formatDateForBackend = (momentDate) => {
        if (!momentDate) return null;
        return momentDate.format('YYYY-MM-DD');
      };

      // Construire les données de conversion selon l'API backend
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

  // const loadBlockages = useCallback(async () => {
  //   try {
  //     const response = await axios.get(`${API_URL}/blockages`);
  //     const allBlockages = response.data.data || [];

  //     const stageBlockages = allBlockages.filter(
  //       blockage =>
  //         blockage.blockable_type === 'prospect' &&
  //         blockage.blockable_id === parseInt(id) &&
  //         blockage.pipeline_stageable_type === 'pipeline_stage' &&
  //         blockage.pipeline_stageable_id === effectiveCurrentStage?.id
  //     );

  //     setBlockages(stageBlockages);
  //   } catch (error) {
  //     console.error('Erreur lors du chargement des blocages:', error);
  //   }
  // }, [id, effectiveCurrentStage]);

  // Menu de statut
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

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    return moment(dateString).format('DD/MM/YYYY HH:mm');
  };

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Chargement des détails du prospect..." />
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
          <Button type="primary" onClick={() => navigate('/prospects')} style={{ marginTop: 16 }}>
            Retour à la liste
          </Button>
        </div>
      </Card>
    );
  }

  // Affichage si le prospect n'est pas trouvé
  if (!prospect) {
    return (
      <Card className="not-found-card">
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <InfoCircleOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <Title level={4}>Prospect non trouvé</Title>
          <Text>Le prospect que vous recherchez n'existe pas ou a été supprimé.</Text>
          <div style={{ marginTop: 24 }}>
            <Button type="primary" onClick={() => navigate('/prospects')}>
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
            <Avatar icon={<UserOutlined />} size={42} style={{ backgroundColor: '#1890ff' }} />
          </div>
          <div className="crm-title">
            <div className="crm-lead-label">
              Prospect: <span className="lead-name">"{prospect.nom}"</span>
              {prospect.entreprise && <span className="lead-company"> - ({prospect.entreprise.nom})</span>}
            </div>
            <div className="crm-lead-actions">
              <Link to="#" className="crm-link">{prospect.entreprise?.nom || 'Entreprise non définie'}</Link>
            </div>
          </div>
        </div>

        <div className="crm-header-actions">
          {/* Bouton pour avancer dans le pipeline */}
          {/* {nextStage && !prospect.is_converted && (
            <Button
              className="crm-btn crm-advance-btn"
              type="default"
              icon={<RightOutlined />}
              onClick={() => setPipelineModalVisible(true)}
            >
              Avancer vers: {nextStage.name}
            </Button>
          )} */}

          <Dropdown overlay={statusMenu} placement="bottomRight">
            <Button className="crm-btn crm-options-btn">
              Status <DownOutlined />
            </Button>
          </Dropdown>

     

{/* Bouton conditionnel pour la conversion */}
{prospect.is_converted && prospect.investisseur ? (
  <Button
    className="crm-btn crm-view-investor-btn"
    type="primary"
    icon={<LinkOutlined />}
    onClick={() => navigate(`/investisseurs/${prospect.investisseur.id}`)}
  >
    Voir l'investisseur
  </Button>
) : prospect.is_converted ? (
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
    onClick={() => {
      // ✅ NOUVELLE LOGIQUE SIMPLIFIÉE selon le backend
      
      // Vérifier si déjà converti
      if (prospect.statut === 'converti' || prospect.converted_at) {
        message.info('Ce prospect est déjà converti en investisseur');
        return;
      }

      // Vérifier si on est dans l'étape finale
      if (!currentStage) {
        message.warning('Aucune étape de pipeline définie pour ce prospect');
        return;
      }

      // ✅ CONDITION PRINCIPALE : juste vérifier si c'est l'étape finale
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

      // Si toutes les conditions sont remplies, ouvrir le modal de conversion
      setConversionModalVisible(true);
    }}
    disabled={prospect.statut === 'converti' || prospect.converted_at}
  >
    Convert
  </Button>
)}
        </div>
      </div>

      {/* Informations du pipeline */}
      <div className="crm-meta-info">
        <div className="crm-meta-item">
          <div className="crm-meta-label">STATUS:</div>
          <div className="crm-meta-value">
            {renderStatus(prospect.statut)}
          </div>
        </div>
        <div className="crm-meta-item">
          <div className="crm-meta-label">CONVERSION STATUS:</div>
          <div className="crm-meta-value">
            {prospect.is_converted ? (
              <Tag color="success" icon={<CheckOutlined />}>
                Converti en investisseur
              </Tag>
            ) : prospect.statut === 'qualifie' ? (
              <Tag color="green">
                Prêt à convertir
              </Tag>
            ) : (
              <Tag color="blue">
                En cours
              </Tag>
            )}
          </div>
        </div>
        <div className="crm-meta-item">
          <div className="crm-meta-label">SECTEUR:</div>
          <div className="crm-meta-value">
            <Link to="#" className="crm-link">{prospect.secteur?.name || 'Non défini'}</Link>
          </div>
        </div>
        <div className="crm-meta-item">
          <div className="crm-meta-label">PIPELINE ADDED:</div>
          <div className="crm-meta-value">{moment(prospect.created_at).format('MMM D, YYYY')}</div>
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
            <Link to="#" className="crm-link">{prospect.responsable?.name || 'Non assigné'}</Link>
          </div>
        </div>
      </div>

      {/* Visualisation du pipeline avec étapes */}
      <div className="crm-pipeline-visualization">
        <PipelineStageManager
          entityType="prospect"
          entityId={id}
          stages={pipelineStages}
          currentStage={currentStage}
          progression={progression || []}
          pipelineCompletedAt={prospect?.is_converted ? prospect?.converted_at || new Date().toISOString() : null}
          onStagesChange={() => dispatch(getProspectPipeline(id))}
          showAddButton={true}
          buttonText="Add stage"
          buttonClassName="crm-btn add-stage"
          showVisualizer={true}
        />
      </div>

      {/* Onglets d'information détaillée */}
      <div className="crm-content-tabs">
        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
          <TabPane tab={<span><InfoCircleOutlined /> Details</span>} key="details">
            <div className="crm-details-section">
              <div className="crm-details-header">
                <h3>Prospect Information</h3>
                <Button icon={<EditOutlined />} size="small" onClick={() => navigate(`/prospects/${id}/edit`)}>
                  Edit details
                </Button>
              </div>

              <Descriptions bordered column={2}>
                <Descriptions.Item label="Nom">{prospect.nom}</Descriptions.Item>
                <Descriptions.Item label="Email">{prospect.email}</Descriptions.Item>
                <Descriptions.Item label="Téléphone">{prospect.telephone || 'Non renseigné'}</Descriptions.Item>
                <Descriptions.Item label="Entreprise">{prospect.entreprise?.nom || 'Non assignée'}</Descriptions.Item>
                <Descriptions.Item label="Pays">{prospect.pays?.name || 'Non renseigné'}</Descriptions.Item>
                <Descriptions.Item label="Secteur d'activité">{prospect.secteur?.name || 'Non renseigné'}</Descriptions.Item>
                <Descriptions.Item label="Valeur potentielle">
                  {prospect.valeur_potentielle ? new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: prospect.devise || 'EUR'
                  }).format(prospect.valeur_potentielle) : 'Non définie'}
                </Descriptions.Item>
                <Descriptions.Item label="Responsable">{prospect.responsable?.name || 'Non assigné'}</Descriptions.Item>
                <Descriptions.Item label="Prochain contact prévu">
                  {prospect.prochain_contact_prevu ? moment(prospect.prochain_contact_prevu).format('DD/MM/YYYY') : 'Non planifié'}
                </Descriptions.Item>
                <Descriptions.Item label="Dernier contact">
                  {prospect.date_dernier_contact ? moment(prospect.date_dernier_contact).format('DD/MM/YYYY') : 'Non enregistré'}
                </Descriptions.Item>
              </Descriptions>

              <div className="crm-info-blocks">
                <Card title="Description:" bordered={false}>
                  <Text>{prospect.description || 'Aucune description disponible.'}</Text>
                </Card>

                <Card title="Notes internes:" bordered={false}>
                  <Text>{prospect.notes_internes || 'Aucune note interne.'}</Text>
                </Card>

                {prospect.investisseur && (
                  <Card title="Converti en investisseur:" bordered={false}>
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

                  {/* Ajouter cette section pour les actions de progression */}
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

                  {/* Information sur la conversion */}
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
                />
              )}
            </div>
          </TabPane>

          <TabPane tab={<span><WarningOutlined /> Blockages ({blockages.length})</span>} key="blockages">
            <PipelineBlockages
              entityType="prospect"
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
                  entityType="prospect"
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
        </Tabs>
      </div>

      {/* Modal de conversion en investisseur */}
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

      {/* Modal pour créer une tâche */}
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
        
        .crm-init-btn {
          background-color: #1890ff;
          color: white;
        }
        
        .crm-convert-btn {
          background-color: #722ed1;
          border-color: #722ed1;
        }
        
        .crm-view-investor-btn {
          background-color: #52c41a;
          border-color: #52c41a;
        }

        .crm-view-investor-btn:hover {
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
          border-color: #1890ff;
          color: white;
        }

        .crm-advance-btn:hover {
          background-color: #40a9ff;
          border-color: #40a9ff;
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
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .crm-notes-container {
          padding: 16px;
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

export default ProspectDetails;