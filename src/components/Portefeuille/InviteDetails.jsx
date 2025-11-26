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
  BankOutlined, TeamOutlined, CheckCircleOutlined, CloseCircleOutlined,
  QuestionCircleOutlined, DownOutlined, EllipsisOutlined, HistoryOutlined, LoadingOutlined, PlusOutlined,
  MessageOutlined, InfoCircleOutlined, SendOutlined, AuditOutlined, BellOutlined, GlobalOutlined, RightOutlined,
  SearchOutlined, SettingOutlined, ClockCircleOutlined, ArrowUpOutlined, WarningOutlined, LinkOutlined,
  HomeOutlined, SyncOutlined, FireOutlined, ThunderboltOutlined, ReloadOutlined
} from '@ant-design/icons';
import { CheckOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

import {
  getInviteById,
  deleteInvite,
  updateInviteStatus,
  sendInvitation,
  initializePipeline,
  advancePipeline,
  convertToProspect,
  resetOperation,
  getInvitePipeline,
} from '../../features/inviteSlice';
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
import BlockageForm from '../Blockages/BlockageForm';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;
const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Composant de statistique animée
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

// Composant de carte animée
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

const InviteDetails = () => {
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
    selectedInvite: { data: invite, loading, error },
    pipeline: { stages: pipelineStages, currentStage, progression, loading: pipelineLoading },
    operation
  } = useSelector(state => state.invites);

  const { pays, secteurs, entreprises } = useSelector(state => state.marketing);
  const currentUser = useSelector(state => state.user.user);

  // Etape courante calculée et étape suivante (déclarées tôt)
  const effectiveCurrentStage = currentStage ||
    (pipelineStages && pipelineStages.length > 0 ? pipelineStages[0] : null);

  const nextStage = pipelineStages.find(
    stage => stage.order === ((effectiveCurrentStage?.order || 0) + 1)
  );

  // Helpers blocages
  function isUnresolvedBlockage(b) {
    if (!b) return false;
    const rawStatus = String(b.status || b.statut || b.state || '').toLowerCase();
    const resolvedByStatus =
      rawStatus === 'resolved' ||
      rawStatus === 'resolu' ||
      rawStatus === 'résolu' ||
      rawStatus === 'close' ||
      rawStatus === 'closed';

    const resolvedFlag =
      b.resolved === true ||
      b.is_resolved === true ||
      b.isResolved === true ||
      !!b.resolved_at ||
      !!b.date_resolution;

    return !(resolvedByStatus || resolvedFlag);
  }

  function matchesType(value, expected) {
    const v = String(value || '').toLowerCase();
    const e = String(expected || '').toLowerCase();
    // Gère 'invite', 'App\\Models\\Invite', '/Invite', etc.
    return v === e || v.endsWith(`\\${e}`) || v.endsWith(`/${e}`) || v.includes(e);
  }

  async function loadBlockages() {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/blockages`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const all = res.data?.data || res.data || [];
      const stageId = effectiveCurrentStage?.id;

      const stageBlockages = all.filter((b) =>
        matchesType(b?.blockable_type, 'invite') &&
        String(b?.blockable_id) === String(id) &&
        matchesType(b?.pipeline_stageable_type, 'pipeline_stage') &&
        String(b?.pipeline_stageable_id) === String(stageId)
      );

      setBlockages(stageBlockages);
      return stageBlockages;
    } catch (error) {
      console.error('Erreur lors du chargement des blocages:', error);
      return [];
    }
  }

  // Chargement user
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
    if (invite && invite.is_converted && invite.prospect_id) {
      console.log('Invitation convertie vers prospect ID:', invite.prospect_id);
    }
  }, [invite]);

  // Chargements init
  useEffect(() => {
    if (id) {
      dispatch(getInviteById(id));
      dispatch(getInvitePipeline(id));
      dispatch(fetchPays());
      dispatch(fetchSecteurs());
      dispatch(fetchEntreprises());
    }

    return () => {
      dispatch(resetOperation());
    };
  }, [dispatch, id, refreshTrigger]);

  // Charger les blocages quand l'étape change
  useEffect(() => {
    if (effectiveCurrentStage?.id) {
      loadBlockages();
    }
  }, [effectiveCurrentStage?.id]);

  useEffect(() => {
    if (operation.success) {
      switch (operation.type) {
        case 'delete':
          message.success('Invité supprimé avec succès');
          navigate('/invites');
          break;
        case 'update_status':
          message.success('Statut mis à jour avec succès');
          break;
        case 'send_invitation':
          message.success('Invitation envoyée avec succès');
          dispatch(getInviteById(id));
          break;
        case 'initialize_pipeline':
          message.success('Pipeline initialisé avec succès');
          setTimeout(() => {
            dispatch(getInvitePipeline(id));
            setRefreshTrigger(prev => prev + 1);
          }, 500);
          break;
        case 'advance_pipeline':
          message.success('Progression dans le pipeline enregistrée');
          setPipelineModalVisible(false);
          dispatch(getInvitePipeline(id));
          break;
        case 'convert_to_prospect':
          message.success('Invité converti en prospect avec succès');
          setConversionModalVisible(false);
          dispatch(getInviteById(id));
          break;
        default:
          message.success('Opération réussie');
      }
    } else if (operation.error) {
      message.error(operation.error);
    }
  }, [operation, navigate, id, dispatch]);

  useEffect(() => {
    if (invite && effectiveCurrentStage) {
      if (invite.statut === 'converti') {
        // logique éventuelle si converti
      }
    }
  }, [invite, effectiveCurrentStage]);

  const loadPipelineTasks = useCallback(async () => {
    if (!id || !effectiveCurrentStage?.id) return;

    setLoadingTasks(true);
    try {
      dispatch(getPipelineStageTasks({
        entityType: 'invite',
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

  const handleOpenAdvanceModal = async () => {
    const currentStageBlockages = await loadBlockages();
    const unresolved = (currentStageBlockages || []).filter(isUnresolvedBlockage);

    if (unresolved.length > 0) {
      const names = unresolved.map(b => b.title || b.nom || b.name || `Blocage #${b.id}`);
      Modal.warning({
        title: "Blocages non résolus",
        content: (
          <div>
            <p>Il y a des blocages qui doivent être résolus avant de passer à l’étape suivante :</p>
            <ul style={{ paddingLeft: 20 }}>
              {names.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          </div>
        )
      });
      return;
    }

    setPipelineModalVisible(true);
  };

  const handleAdvancePipeline = async () => {
    try {
      const currentStageBlockages = await loadBlockages();
      const unresolved = (currentStageBlockages || []).filter(isUnresolvedBlockage);

      if (unresolved.length > 0) {
        const names = unresolved.map(b => b.title || b.nom || b.name || `Blocage #${b.id}`);
        Modal.warning({
          title: "Blocages non résolus",
          content: (
            <div>
              <p>Impossible d’avancer: les blocages suivants doivent être résolus :</p>
              <ul style={{ paddingLeft: 20 }}>
                {names.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </div>
          )
        });
        return;
      }

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

      dispatch(getInviteById(id));
      dispatch(getInvitePipeline(id));
      setRefreshTrigger(prev => prev + 1);

    } catch (error) {
      console.error('Erreur lors de l\'avancement:', error);
    }
  };

  const showDeleteConfirm = () => {
    confirm({
      title: `Êtes-vous sûr de vouloir supprimer cet invité?`,
      icon: <ExclamationCircleOutlined />,
      content: 'Cette action est irréversible.',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk() {
        dispatch(deleteInvite(id));
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
        inviteId: id,
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
        title: `Tâche pour ${invite?.nom || 'invité'} - ${currentStage?.name || 'suivi'}`,
        start: now,
        end: moment(now).add(1, 'hours'),
        type: 'todo',
        priority: 'normal',
        description: ''
      });
    }
  }, [pipelineModalVisible, invite, currentStage, taskForm]);

  const handleStatusChange = (newStatus) => {
    dispatch(updateInviteStatus({ id, statut: newStatus }));
  };

  const handleSendInvitation = () => {
    dispatch(sendInvitation(id));
  };

  const handleConversion = () => {
    conversionForm.validateFields().then(values => {
      const formatDateForBackend = (momentDate) => {
        if (!momentDate) return null;
        return momentDate.format('YYYY-MM-DD HH:mm:ss');
      };

      const conversionData = {
        id,
        entreprise_id: values.entreprise_id,
        nom: values.nom,
        email: values.email,
        telephone: values.telephone,
        adresse: values.adresse,
        pays_id: values.pays_id,
        secteur_id: values.secteur_id,
        statut: values.statut || 'nouveau',
        responsable_id: currentUser?.id,
        created_by: currentUser?.id,
        description: values.description,
        notes_internes: values.notes_internes,
        valeur_potentielle: values.valeur_potentielle,
        devise: values.devise || 'EUR',
        date_dernier_contact: formatDateForBackend(values.date_dernier_contact),
        prochain_contact_prevu: formatDateForBackend(values.prochain_contact_prevu),
        converted_to_id: id
      };

      dispatch(convertToProspect(conversionData))
        .unwrap()
        .then((prospect) => {
          if (prospect?.id) {
            setConversionModalVisible(false);
            message.success('Conversion réussie! Redirection vers le prospect...');
            navigate(`/prospects/${prospect.id}`);
          } else {
            message.error('Conversion réussie mais impossible de récupérer le prospect');
            setConversionModalVisible(false);
            navigate('/prospects');
          }
        })
        .catch((error) => {
          message.error(`Erreur lors de la conversion: ${error}`);
        });
    });
  };

  const statusMenu = (
    <Menu>
      <Menu.Item key="en_attente" disabled={invite?.statut === 'en_attente'} onClick={() => handleStatusChange('en_attente')}>
        <Badge color="gold" text="En attente" />
      </Menu.Item>
      <Menu.Item key="envoyee" disabled={invite?.statut === 'envoyee'} onClick={() => handleStatusChange('envoyee')}>
        <Badge color="blue" text="Invitation envoyée" />
      </Menu.Item>
      <Menu.Item key="confirmee" disabled={invite?.statut === 'confirmee'} onClick={() => handleStatusChange('confirmee')}>
        <Badge color="green" text="Confirmée" />
      </Menu.Item>
      <Menu.Item key="details_envoyes" disabled={invite?.statut === 'details_envoyes'} onClick={() => handleStatusChange('details_envoyes')}>
        <Badge color="cyan" text="Détails envoyés" />
      </Menu.Item>
      <Menu.Item key="refusee" disabled={invite?.statut === 'refusee'} onClick={() => handleStatusChange('refusee')}>
        <Badge color="red" text="Refusée" />
      </Menu.Item>
      <Menu.Item key="participation_confirmee" disabled={invite?.statut === 'participation_confirmee'} onClick={() => handleStatusChange('participation_confirmee')}>
        <Badge color="green" text="Participation confirmée" />
      </Menu.Item>
      <Menu.Item key="participation_sans_suivi" disabled={invite?.statut === 'participation_sans_suivi'} onClick={() => handleStatusChange('participation_sans_suivi')}>
        <Badge color="purple" text="A participé (sans suivi)" />
      </Menu.Item>
      <Menu.Item key="absente" disabled={invite?.statut === 'absente'} onClick={() => handleStatusChange('absente')}>
        <Badge color="volcano" text="Absent" />
      </Menu.Item>
      <Menu.Item key="aucune_reponse" disabled={invite?.statut === 'aucune_reponse'} onClick={() => handleStatusChange('aucune_reponse')}>
        <Badge color="default" text="Aucune réponse" />
      </Menu.Item>
    </Menu>
  );

  const renderStatus = (statut) => {
    let color, text, icon;
    switch (statut) {
      case 'en_attente':
        color = 'gold';
        text = 'En attente';
        icon = <QuestionCircleOutlined />;
        break;
      case 'envoyee':
        color = 'blue';
        text = 'Invitation envoyée';
        icon = <SendOutlined />;
        break;
      case 'confirmee':
        color = 'green';
        text = 'Confirmée';
        icon = <CheckCircleOutlined />;
        break;
      case 'details_envoyes':
        color = 'cyan';
        text = 'Détails envoyés';
        icon = <MailOutlined />;
        break;
      case 'refusee':
        color = 'red';
        text = 'Refusée';
        icon = <CloseCircleOutlined />;
        break;
      case 'participation_confirmee':
        color = 'green';
        text = 'Participation confirmée';
        icon = <CheckCircleOutlined />;
        break;
      case 'participation_sans_suivi':
        color = 'purple';
        text = 'A participé (sans suivi)';
        icon = <CheckCircleOutlined />;
        break;
      case 'absente':
        color = 'volcano';
        text = 'Absent';
        icon = <CloseCircleOutlined />;
        break;
      case 'aucune_reponse':
        color = 'default';
        text = 'Aucune réponse';
        icon = <InfoCircleOutlined />;
        break;
      default:
        color = 'default';
        text = statut || 'Inconnu';
        icon = <InfoCircleOutlined />;
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
            <SyncOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          </motion.div>
          <Title level={4} style={{ color: '#666' }}>
            Chargement des détails de l'invité...
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
            <Button type="primary" onClick={() => navigate('/invites')} style={{ marginTop: 16 }}>
              Retour à la liste
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (!invite) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="modern-container"
      >
        <Card className="modern-not-found-card">
          <div className="not-found-content">
            <InfoCircleOutlined className="not-found-icon" />
            <Title level={4}>Invité non trouvé</Title>
            <Text>L'invité que vous recherchez n'existe pas ou a été supprimé.</Text>
            <Button type="primary" onClick={() => navigate('/invites')} style={{ marginTop: 24 }}>
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
            <Link to="/invites">
              <TeamOutlined /> Invités
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <UserOutlined /> {invite.nom} {invite.prenom}
          </Breadcrumb.Item>
        </Breadcrumb>
      </motion.div>

      {/* En-tête principal */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="invite-header"
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
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: invite.potentiel === 'élevé' ? '#f5222d' :
                      invite.potentiel === 'moyen' ? '#faad14' : '#1890ff',
                    fontSize: '28px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                  }}
                />
              </motion.div>

              <div>
                <Title level={1} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
                  {invite.nom} {invite.prenom}
                  {invite.is_converted && (
                    <Tag color="success" style={{ marginLeft: 12 }}>
                      <CheckOutlined /> Converti
                    </Tag>
                  )}
                </Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: '8px 0 0 0' }}>
                  <BankOutlined style={{ marginRight: 6 }} />
                  {invite.entreprise?.nom || 'Entreprise non définie'} •
                  <CalendarOutlined style={{ marginLeft: 8, marginRight: 6 }} />
                  {invite.action?.nom || 'Action non définie'}
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
                onClick={() => navigate(`/invites/${id}/edit`)}
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
                type='danger'
                onClick={showDeleteConfirm}
                size='large'
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)'
                }}
              >Delete</Button>
              <Button
                type="default"
                icon={<SendOutlined />}
                onClick={handleSendInvitation}
                disabled={invite.statut !== 'en_attente'}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {screens.xs ? '' : 'Envoyer invitation'}
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
              {invite.is_converted && invite.prospect ? (
                <Button
                  type="primary"
                  icon={<LinkOutlined />}
                  onClick={() => navigate(`/prospects/${invite.prospect.id}`)}
                  size="large"
                  block
                  style={{
                    background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 500
                  }}
                >
                  Voir le prospect
                </Button>
              ) : invite.is_converted ? (
                <Button
                  disabled
                  icon={<CheckOutlined />}
                  size="large"
                  block
                  style={{ borderRadius: '8px' }}
                >
                  Déjà converti
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={() => setConversionModalVisible(true)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    borderRadius: '8px',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  Convertir en prospect
                </Button>
              )}
            </motion.div>
          </Col>
        </Row>
      </motion.div>

      {/* Métriques de pipeline */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={12} sm={6}>
          <AnimatedStatCard
            icon={
              invite.statut === 'confirmee' || invite.statut === 'participation_confirmee' ? <CheckCircleOutlined /> :
                invite.statut === 'refusee' || invite.statut === 'absente' ? <CloseCircleOutlined /> :
                  invite.statut === 'envoyee' ? <SendOutlined /> :
                    <ClockCircleOutlined />
            }
            title="Statut de l'invitation"
            value={
              invite.statut === 'en_attente' ? 'En attente' :
                invite.statut === 'envoyee' ? 'Envoyée' :
                  invite.statut === 'confirmee' ? 'Confirmée' :
                    invite.statut === 'details_envoyes' ? 'Détails envoyés' :
                      invite.statut === 'refusee' ? 'Refusée' :
                        invite.statut === 'participation_confirmee' ? 'Participation confirmée' :
                          invite.statut === 'participation_sans_suivi' ? 'A participé' :
                            invite.statut === 'absente' ? 'Absent' :
                              invite.statut === 'aucune_reponse' ? 'Aucune réponse' :
                                'Inconnu'
            }
            color={
              invite.statut === 'confirmee' || invite.statut === 'participation_confirmee' ? '#52c41a' :
                invite.statut === 'refusee' || invite.statut === 'absente' ? '#ff4d4f' :
                  invite.statut === 'envoyee' || invite.statut === 'details_envoyes' ? '#1890ff' :
                    invite.statut === 'participation_sans_suivi' ? '#722ed1' :
                      '#faad14'
            }
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
            icon={<CalendarOutlined />}
            title="Date d'ajout"
            value={moment(invite.created_at).format('DD/MM/YYYY')}
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
                <Button
                  type="primary"
                  icon={<RightOutlined />}
                  onClick={handleOpenAdvanceModal}
                  disabled={
                    !nextStage ||
                    (blockages && blockages.some(isUnresolvedBlockage))
                  }
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 500
                  }}
                >
                  Avancer
                </Button>
              </Space>
            }
          >
            <PipelineStageManager
              entityType="invite"
              entityId={id}
              stages={pipelineStages}
              currentStage={currentStage}
              progression={progression || []}
              pipelineCompletedAt={invite?.is_converted ? invite?.date_conversion || new Date().toISOString() : null}
              onStagesChange={() => dispatch(getInvitePipeline(id))}
              showAddButton={true}
              buttonText="Ajouter une étape"
              buttonClassName="modern-btn"
              showVisualizer={true}
            />
          </AnimatedContentCard>
        </motion.div>
      )}

      {/* Actions rapides */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
      >
      </motion.div>

      {/* Contenu principal avec onglets */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.5 }}
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
                <Descriptions bordered column={{ xs: 1, sm: 2 }} className="modern-descriptions">
                  <Descriptions.Item label="Nom complet">
                    <Text strong>{invite.nom} {invite.prenom}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    <Text copyable>{invite.email}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Téléphone">
                    <Text copyable>{invite.telephone || 'Non renseigné'}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Fonction">
                    {invite.fonction || 'Non renseignée'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Pays">
                    {invite.pays?.nom || 'Non renseigné'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Type d'invité">
                    <Tag color={invite.type_invite === 'interne' ? 'blue' : 'green'}>
                      {invite.type_invite === 'interne' ? 'Interne' : 'Externe'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Entreprise">
                    {invite.entreprise?.nom || 'Non assignée'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Secteur d'activité">
                    {invite.secteur?.name || 'Non renseigné'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Potentiel">
                    <Tag color={
                      invite.potentiel === 'élevé' ? 'red' :
                        invite.potentiel === 'moyen' ? 'orange' : 'blue'
                    }>
                      {invite.potentiel ? invite.potentiel.charAt(0).toUpperCase() + invite.potentiel.slice(1) : 'Non évalué'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Date d'événement">
                    {invite.date_evenement ? moment(invite.date_evenement).format('DD/MM/YYYY') : 'Non définie'}
                  </Descriptions.Item>
                </Descriptions>

                <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                  <Col xs={24} sm={8}>
                    <Card size="small" className="info-card">
                      <Statistic
                        title="Projet confidentiel"
                        value={invite.confidentiel ? 'Oui' : 'Non'}
                        valueStyle={{ color: invite.confidentiel ? '#f5222d' : '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card size="small" className="info-card">
                      <div>
                        <Text type="secondary">Type d'investissement</Text>
                        <div style={{ marginTop: 4 }}>
                          <Text strong>{invite.type_investissement || 'Expansion'}</Text>
                        </div>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card size="small" className="info-card">
                      <div>
                        <Text type="secondary">Plan d'investissement</Text>
                        <div style={{ marginTop: 4 }}>
                          <Text strong>{invite.plan_investissement || 'Intéressée par la Tunisie'}</Text>
                        </div>
                      </div>
                    </Card>
                  </Col>
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
                  <Card title="Progression dans le pipeline" className="stages-card">
                    <PipelineVisualizer
                      stages={pipelineStages}
                      currentStage={effectiveCurrentStage}
                      progression={progression || []}
                    />
                  </Card>
                ) : (
                  <Alert
                    message="Aucun pipeline défini"
                    description="Cet invité n'a pas encore de pipeline de suivi défini."
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
                  entityType="invite"
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
                  entityType="invite"
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

      {/* Modaux */}
      <Modal
        title="Convertir en prospect"
        open={conversionModalVisible}
        onCancel={() => setConversionModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setConversionModalVisible(false)}>
            Annuler
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleConversion}
          >
            Convertir
          </Button>
        ]}
        width={800}
      >
        <Form
          form={conversionForm}
          layout="vertical"
          initialValues={{
            secteur_id: invite?.secteur_id,
            pays_id: invite?.pays_id,
            potentiel: invite?.potentiel || 'moyen',
            nom: invite?.nom,
            email: invite?.email,
            telephone: invite?.telephone,
            adresse: invite?.adresse,
            statut: 'nouveau',
            devise: 'EUR'
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="nom"
                label="Nom complet"
                rules={[{ required: true, message: 'Veuillez entrer le nom' }]}
              >
                <Input placeholder="Nom du prospect" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="entreprise_id"
                label="Entreprise"
              >
                <Select
                  placeholder="Sélectionner une entreprise"
                  allowClear
                >
                  {entreprises.items?.map(ent => (
                    <Option key={ent.id} value={ent.id}>{ent.nom}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ type: 'email', message: 'Email invalide' }]}
              >
                <Input placeholder="Adresse email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="telephone"
                label="Téléphone"
              >
                <Input placeholder="Numéro de téléphone" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="adresse" label="Adresse">
            <Input placeholder="Adresse complète" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="secteur_id"
                label="Secteur d'activité"
                rules={[{ required: true, message: 'Veuillez sélectionner un secteur' }]}
              >
                <Select placeholder="Sélectionner un secteur">
                  {secteurs.items?.map(secteur => (
                    <Option key={secteur.id} value={secteur.id}>{secteur.nom}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="pays_id"
                label="Pays"
                rules={[{ required: true, message: 'Veuillez sélectionner un pays' }]}
              >
                <Select
                  placeholder="Sélectionner un pays"
                  showSearch
                  optionFilterProp="children"
                >
                  {pays.items?.map(pays => (
                    <Option key={pays.id} value={pays.id}>{pays.nom}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="valeur_potentielle"
            label="Valeur potentielle"
          >
            <Input type="number" placeholder="Ex: 50000" addonAfter={<Select defaultValue="EUR"><Option value="EUR">EUR</Option><Option value="USD">USD</Option></Select>} />
          </Form.Item>

          <Form.Item
            name="potentiel"
            label="Potentiel d'investissement"
            rules={[{ required: true, message: 'Veuillez évaluer le potentiel' }]}
          >
            <Select placeholder="Évaluer le potentiel">
              <Option value="faible">
                <Badge color="blue" text="Faible" />
              </Option>
              <Option value="moyen">
                <Badge color="orange" text="Moyen" />
              </Option>
              <Option value="élevé">
                <Badge color="red" text="Élevé" />
              </Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="date_dernier_contact" label="Date du dernier contact">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="prochain_contact_prevu" label="Prochain contact prévu">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Description du prospect" />
          </Form.Item>

          <Form.Item name="notes_internes" label="Notes internes">
            <TextArea rows={3} placeholder="Informations internes non visibles par le client" />
          </Form.Item>

          <Alert
            message="Information"
            description="Cette action va créer un nouveau prospect à partir de cet invité. Le prospect sera automatiquement placé dans la première étape du pipeline prospect."
            type="info"
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
          entityType="invite"
          entityId={id}
          pipelineStageType="pipeline_stage"
          pipelineStageId={effectiveCurrentStage?.id}
        />
      </Modal>

      <Modal
        title={`Passer à l'étape ${nextStage?.order || ''} : ${nextStage?.name || ''}`}
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
        entityType="invite"
        entityId={id}
        stageId={selectedStageForTask}
        stageName={selectedStageName}
        entityName={invite?.nom}
      />

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

  .invite-header {
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

  .actions-card {
    border-radius: 16px;
    border: 1px solid #f0f0f0;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    margin-bottom: 24px;
    background: white;
  }

  .actions-card .ant-card-body {
    padding: 24px;
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
    background: #f0f2ff;
    border-color: #1890ff;
    transform: translateY(-1px);
  }

  .modern-tabs .ant-tabs-tab-active {
    background: white;
    border-color: #1890ff;
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
    border: 1px solid #faad14;
  }

  .tasks-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
  }

  .tasks-header h4 {
    margin: 0;
    color: #333;
    font-weight: 600;
  }

  .notes-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
  }

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

  .modern-error-card {
    text-align: center;
    border-radius: 16px;
    border: 1px solid #ff4d4f;
    box-shadow: 0 4px 20px rgba(255, 77, 79, 0.1);
  }

  .error-content {
    padding: 60px 40px;
  }

  .error-icon {
    font-size: 48px;
    color: #ff4d4f;
    margin-bottom: 24px;
  }

  .modern-not-found-card {
    text-align: center;
    border-radius: 16px;
    border: 1px solid #faad14;
    box-shadow: 0 4px 20px rgba(250, 173, 20, 0.1);
  }

  .not-found-content {
    padding: 60px 40px;
  }

  .not-found-icon {
    font-size: 48px;
    color: #faad14;
    margin-bottom: 24px;
  }

  @media (max-width: 768px) {
    .modern-container {
      padding: 16px;
    }

    .invite-header {
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

    .actions-card {
      margin-bottom: 16px;
    }

    .tab-content {
      padding: 16px;
      min-height: 300px;
    }

    .tasks-header,
    .notes-header {
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
    }

    .modern-descriptions {
      font-size: 14px;
    }
  }

  @media (max-width: 576px) {
    .invite-header {
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

  @keyframes shimmer {
    0% { background-position: -468px 0; }
    100% { background-position: 468px 0; }
  }

  .loading-shimmer {
    animation: shimmer 1.5s ease-in-out infinite;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 400% 100%;
  }

  .ant-modal {
    border-radius: 12px;
    overflow: hidden;
  }

  .ant-modal-header {
    background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
    border-bottom: 2px solid #e8e8e8;
    padding: 20px 24px;
  }

  .ant-modal-title {
    font-weight: 600;
    color: #333;
    font-size: 16px;
  }

  .ant-modal-body {
    padding: 24px;
  }

  .ant-modal-footer {
    border-top: 1px solid #f0f0f0;
    padding: 16px 24px;
    background: #fafafa;
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
  .ant-input-focused,
  .ant-select-focused .ant-select-selector,
  .ant-picker-focused {
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
  }

  .ant-btn {
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .ant-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  .ant-btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
  }

  .ant-btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  }

  .ant-tag {
    border-radius: 4px;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .ant-tag:hover {
    transform: scale(1.05);
  }

  .ant-badge {
    transition: all 0.3s ease;
  }

  .ant-badge:hover {
    transform: scale(1.05);
  }

  .ant-descriptions-bordered .ant-descriptions-item-label {
    background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
    font-weight: 600;
  }

  .ant-descriptions-bordered .ant-descriptions-item-content {
    background: white.
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

  .ant-alert {
    border-radius: 8px;
    border: 1px solid;
    padding: 16px;
  }

  .ant-alert-info {
    background: linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%);
    border-color: #91d5ff;
  }

  .ant-alert-warning {
    background: linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%);
    border-color: #ffd666;
  }

  .ant-alert-error {
    background: linear-gradient(135deg, #fff2f0 0%, #fff1f0 100%);
    border-color: #ffccc7;
  }

  .ant-alert-success {
    background: linear-gradient(135deg, #f6ffed 0%, #f0f9e8 100%);
    border-color: #b7eb8f;
  }

  .ant-dropdown-menu {
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  }

  .ant-dropdown-menu-item {
    border-radius: 4px;
    margin: 2px 8px;
    transition: all 0.2s ease;
  }

  .ant-dropdown-menu-item:hover {
    background: linear-gradient(135deg, #f0f2ff 0%, #e6f7ff 100%);
  }

  .shine-effect {
    pointer-events: none;
  }

  .ant-statistic {
    text-align: center;
  }

  .ant-statistic-title {
    font-weight: 500;
    color: #666;
    margin-bottom: 8px;
  }

  .ant-statistic-content {
    font-weight: 700;
    font-size: 20px;
  }

  .ant-steps-item-icon {
    transition: all 0.3s ease;
  }

  .ant-steps-item:hover .ant-steps-item-icon {
    transform: scale(1.1);
  }

  .ant-steps-item-process .ant-steps-item-icon {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-color: #667eea;
  }

  .ant-steps-item-finish .ant-steps-item-icon {
    background: #52c41a;
    border-color: #52c41a;
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  }
`}</style>
    </div>
  );
};
export default InviteDetails;