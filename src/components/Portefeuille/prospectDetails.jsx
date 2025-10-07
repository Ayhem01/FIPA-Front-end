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
  HomeOutlined
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

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;
const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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
          <Spin size="large" />
          <Title level={4} style={{ marginTop: 16, color: '#666' }}>
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
                  icon={<UserOutlined />} 
                  style={{ 
                    backgroundColor: prospect.potentiel === 'élevé' ? '#f5222d' : 
                                    prospect.potentiel === 'moyen' ? '#faad14' : '#1890ff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }} 
                />
              </motion.div>
              <div className="header-details">
                <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                  {prospect.nom}
                  {prospect.is_converted && (
                    <Tag color="success" style={{ marginLeft: 12 }}>
                      <CheckOutlined /> Converti
                    </Tag>
                  )}
                </Title>
                <Space size="large" style={{ marginTop: 8 }}>
                  <Text type="secondary">
                    <BankOutlined style={{ marginRight: 6 }} />
                    {prospect.entreprise?.nom || 'Entreprise non définie'}
                  </Text>
                  <Text type="secondary">
                    <CalendarOutlined style={{ marginRight: 6 }} />
                    Créé le {moment(prospect.created_at).format('DD/MM/YYYY')}
                  </Text>
                  <div>{renderStatus(prospect.statut)}</div>
                </Space>
              </div>
            </div>

            <div className="header-actions">
              <Space size="middle">
                {nextStage && !prospect.is_converted && (
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

                {prospect.is_converted && prospect.investisseur ? (
                  <Button
                    type="primary"
                    icon={<LinkOutlined />}
                    onClick={() => navigate(`/investisseurs/${prospect.investisseur.id}`)}
                    className="modern-btn-primary"
                  >
                    {screens.xs ? 'Voir' : 'Voir l\'investisseur'}
                  </Button>
                ) : prospect.is_converted ? (
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
                    className="modern-btn-primary"
                  >
                    {screens.xs ? 'Convertir' : 'Convertir en investisseur'}
                  </Button>
                )}

                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => navigate(`/prospects/${id}/edit`)}>
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
            <Col xs={24} sm={8} md={6}>
              <Statistic
                title="Statut de conversion"
                value={prospect.is_converted ? "Converti" : "En cours"}
                prefix={prospect.is_converted ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <ClockCircleOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: prospect.is_converted ? '#52c41a' : '#faad14' }}
              />
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Statistic
                title="Étape actuelle"
                value={effectiveCurrentStage?.name || 'Aucune'}
                prefix={<AuditOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Statistic
                title="Temps dans l'étape"
                value={progression && progression.length > 0
                  ? moment().diff(moment(progression[0].created_at), 'days')
                  : 0}
                suffix="jours"
                prefix={<CalendarOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Statistic
                title="Valeur potentielle"
                value={prospect.valeur_potentielle ? new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: prospect.devise || 'EUR'
                }).format(prospect.valeur_potentielle) : 'Non définie'}
                prefix={<GlobalOutlined style={{ color: '#13c2c2' }} />}
                valueStyle={{ color: '#13c2c2' }}
              />
            </Col>
          </Row>
        </Card>
      </motion.div>

      {/* Visualisation du pipeline */}
      {pipelineStages.length > 0 && (
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
              entityType="prospect"
              entityId={id}
              stages={pipelineStages}
              currentStage={currentStage}
              progression={progression || []}
              pipelineCompletedAt={prospect?.is_converted ? prospect?.converted_at || new Date().toISOString() : null}
              onStagesChange={() => dispatch(getProspectPipeline(id))}
              showAddButton={true}
              buttonText="Ajouter une étape"
              buttonClassName="modern-btn"
              showVisualizer={true}
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
        </Card>
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

      {/* CSS Styles */}
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
          color: '#ff4d4f';
          margin-bottom: 16px;
        }

        .not-found-icon {
          font-size: 48px;
          color: '#1890ff';
          margin-bottom: 16px;
        }

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
        }
      `}</style>
    </div>
  );
};

export default ProspectDetails;