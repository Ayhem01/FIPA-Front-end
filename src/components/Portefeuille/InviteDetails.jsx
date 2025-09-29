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
  BankOutlined, TeamOutlined, CheckCircleOutlined, CloseCircleOutlined, 
  QuestionCircleOutlined, DownOutlined, EllipsisOutlined, HistoryOutlined, LoadingOutlined, PlusOutlined,
  MessageOutlined, InfoCircleOutlined, SendOutlined, AuditOutlined, BellOutlined, GlobalOutlined, RightOutlined,
  SearchOutlined, SettingOutlined, ClockCircleOutlined, ArrowUpOutlined, WarningOutlined, LinkOutlined
} from '@ant-design/icons';
import { CheckOutlined } from '@ant-design/icons';

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
const InviteDetails = () => {
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
  // const [stageModalVisible, setStageModalVisible] = useState(false); // modal ouverte/fermée
  const [addBlockageVisible, setAddBlockageVisible] = useState(false);
  const [pipelineTasks, setPipelineTasks] = useState({ planned: [], recent: [] });
  const [loadingTasks, setLoadingTasks] = useState(false);
  // const [taskModalVisible, setTaskModalVisible] = useState(false);
  // const [selectedStageForTask, setSelectedStageForTask] = useState(null);
  const [selectedStageName, setSelectedStageName] = useState('');



  const {
    selectedInvite: { data: invite, loading, error },
    pipeline: { stages: pipelineStages, currentStage, progression, loading: pipelineLoading },
    operation
  } = useSelector(state => state.invites);

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
    // Vérifier si l'invitation a été convertie
    if (invite && invite.is_converted && invite.prospect_id) {
      console.log('Invitation convertie vers prospect ID:', invite.prospect_id);
    }
  }, [invite]);

  // Charger les données de l'invité et son pipeline
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
  }, [dispatch, id, refreshTrigger]); // Ajouter refreshTrigger pour forcer le rechargement

  // Gérer les opérations réussies ou échouées
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
          // Recharger les données
          dispatch(getInviteById(id));
          break;
        case 'initialize_pipeline':
          message.success('Pipeline initialisé avec succès');
          // Recharger explicitement les données du pipeline après l'initialisation
          setTimeout(() => {
            dispatch(getInvitePipeline(id));
            setRefreshTrigger(prev => prev + 1); // Forcer le rechargement
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

  const effectiveCurrentStage = currentStage ||
    (pipelineStages && pipelineStages.length > 0 ? pipelineStages[0] : null);

  // Debug: Ajouter des logs pour comprendre pourquoi le bouton est désactivé
  useEffect(() => {
    if (invite && effectiveCurrentStage) {
      console.log('=== DEBUG BOUTON CONVERT ===');
      console.log('invite.statut:', invite.statut);
      console.log('invite.is_converted:', invite.is_converted);
      console.log('effectiveCurrentStage:', effectiveCurrentStage);
      console.log('effectiveCurrentStage.is_final:', effectiveCurrentStage.is_final);
      console.log('Bouton désactivé à cause de:');
      if (invite.statut === 'converti') {
        console.log('- Statut déjà converti');
      }
      console.log('========================');
    }
  }, [invite, effectiveCurrentStage]);

  const nextStage = pipelineStages.find(
    stage => stage.order === ((effectiveCurrentStage?.order || 0) + 1)
  );

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
        // user_id: currentUser.id
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
          setRefreshTrigger(prev => prev + 1); // Ceci déclenchera le rechargement des tâches
        })
        .catch(error => {
          message.error(`Erreur: ${error}`);
        });
    });
  };

  // Ajoutez un effet pour réinitialiser le formulaire de tâche lorsqu'on ouvre le modal
  useEffect(() => {
    if (pipelineModalVisible) {
      // Réinitialiser le formulaire de tâche avec des valeurs par défaut
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


  // Modifier le statut
  const handleStatusChange = (newStatus) => {
    dispatch(updateInviteStatus({ id, statut: newStatus }));
  };

  // Envoyer l'invitation
  const handleSendInvitation = () => {
    dispatch(sendInvitation(id));
  };

  // const handleMoveStage = (stage, direction) => {
  //   const newOrder = direction === 'up' ? stage.order - 1 : stage.order + 1;

  //   if (newOrder < 1 || newOrder > pipelineStages.length) {
  //     return;
  //   }

  //   dispatch(updatePipelineStage({
  //     entityType: 'invite',
  //     id: stage.id,
  //     stageData: {
  //       ...stage,
  //       order: newOrder
  //     }
  //   })).unwrap()
  //     .then(() => {
  //       // Recharger les données du pipeline après mise à jour
  //       dispatch(getInvitePipeline(id));
  //     })
  //     .catch(err => {
  //       message.error(`Erreur lors du déplacement de l'étape: ${err}`);
  //     });
  // };

  // Gérer l'édition d'une étape
  // const handleEditStage = (stage) => {
  //   setEditingStage(stage);
  //   // Réinitialiser d'abord pour effacer toutes les valeurs précédentes
  //   stageForm.resetFields();
  //   // Puis définir les valeurs du stage à modifier
  //   stageForm.setFieldsValue({
  //     name: stage.name,
  //     description: stage.description,
  //     order: stage.order,
  //     is_final: stage.is_final
  //   });
  //   setStageModalVisible(true);
  // };

  // Gérer la suppression d'une étape
  // const handleDeleteStage = (stageId) => {
  //   Modal.confirm({
  //     title: 'Confirmer la suppression',
  //     icon: <ExclamationCircleOutlined />,
  //     content: 'Êtes-vous sûr de vouloir supprimer ce Stage?',
  //     okText: 'Oui',
  //     onOk: () => {
  //       dispatch(deletePipelineStage({
  //         entityType: 'invite',
  //         id: stageId
  //       })).unwrap()
  //         .then(() => {
  //           message.success('Étape supprimée avec succès');
  //           // Recharger les données du pipeline
  //           dispatch(getInvitePipeline(id));
  //         })
  //         .catch(err => {
  //           message.error(`Erreur lors de la suppression de l'étape: ${err}`);
  //         });
  //     }
  //   });
  // };

  // Gérer l'ajout ou la mise à jour d'une étape
  // const handleSaveStage = () => {
  //   stageForm.validateFields()
  //     .then(values => {
  //       if (editingStage) {
  //         // Mettre à jour une étape existante
  //         dispatch(updatePipelineStage({
  //           entityType: 'invite',
  //           id: editingStage.id,
  //           stageData: values
  //         })).unwrap()
  //           .then(() => {
  //             message.success('Stage mise à jour avec succès');
  //             setStageModalVisible(false); // Corriger ici: fermer le bon modal
  //             setEditingStage(null); // Réinitialiser l'étape en édition
  //             // Recharger les données du pipeline
  //             dispatch(getInvitePipeline(id));
  //           })
  //           .catch(err => {
  //             message.error(`Erreur lors de la mise à jour de ce stage: ${err}`);
  //           });
  //       } else {
  //         // Ajouter une nouvelle étape
  //         dispatch(addPipelineStage({
  //           entityType: 'invite',
  //           entityId: id, // Assurez-vous de passer l'ID de l'invite
  //           stageData: values
  //         })).unwrap()
  //           .then(() => {
  //             message.success('Étape ajoutée avec succès');
  //             setStageModalVisible(false); // Corriger ici: fermer le bon modal
  //             // Recharger les données du pipeline
  //             dispatch(getInvitePipeline(id));
  //           })
  //           .catch(err => {
  //             message.error(`Erreur lors de l'ajout de l'étape: ${err}`);
  //           });
  //       }
  //     });
  // };

  // Avancer dans le pipeline
  const handleAdvancePipeline = async () => {
    try {
      const values = await pipelineForm.validateFields();

      // Utiliser automatiquement l'étape suivante
      const stageId = nextStage?.id;

      if (!stageId) {
        message.error('Aucune étape suivante disponible');
        return;
      }

      // Envoyer les données au backend
      await dispatch(advancePipeline({
        id,
        stage_id: stageId,
        notes: values.notes,
        date: values.date?.format('YYYY-MM-DD HH:mm:ss')
      })).unwrap();

      message.success('Progression enregistrée avec succès');
      setPipelineModalVisible(false);
      pipelineForm.resetFields();

      // Recharger les données au lieu d'appeler loadInviteData
      dispatch(getInviteById(id));
      dispatch(getInvitePipeline(id));
      setRefreshTrigger(prev => prev + 1); // Déclencher un rechargement

    } catch (error) {
      console.error('Erreur lors de l\'avancement:', error);
    }
  };

  // Convertir en prospect
  // Modifier la fonction handleConversion pour formater les dates

  const handleConversion = () => {
    conversionForm.validateFields().then(values => {
      // Fonction utilitaire pour formater les dates
      const formatDateForBackend = (momentDate) => {
        if (!momentDate) return null;
        // Format MySQL: YYYY-MM-DD HH:MM:SS
        return momentDate.format('YYYY-MM-DD HH:mm:ss');
      };

      // Construire les données de conversion avec formatage des dates
      const conversionData = {
        id, // obligatoire (lien avec l'invitation)
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
        // Formater les dates correctement
        date_dernier_contact: formatDateForBackend(values.date_dernier_contact),
        prochain_contact_prevu: formatDateForBackend(values.prochain_contact_prevu),
        converted_to_id: id // id de l'invitation source
      };

      console.log('Données de conversion formatées:', conversionData);

      dispatch(convertToProspect(conversionData))
        .unwrap()
        .then((prospect) => {
          console.log('Prospect créé:', prospect);

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
          console.error("Erreur lors de la conversion :", error);
          message.error(`Erreur lors de la conversion: ${error}`);
        });
    });
  };

  // Obtenir une référence valide à l'étape actuelle (même si currentStage est null)



  const loadBlockages = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/blockages`);
      const allBlockages = response.data.data || [];

      // Filtrer pour ce pipeline et cette étape
      const stageBlockages = allBlockages.filter(
        blockage =>
          blockage.blockable_type === 'invite' &&
          blockage.blockable_id === parseInt(id) &&
          blockage.pipeline_stageable_type === 'pipeline_stage' &&
          blockage.pipeline_stageable_id === effectiveCurrentStage?.id
      );

      setBlockages(stageBlockages);
    } catch (error) {
      console.error('Erreur lors du chargement des blocages:', error);
    }
  }, [id, effectiveCurrentStage]);

  // Remplacer votre statusMenu actuel
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

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    return moment(dateString).format('DD/MM/YYYY HH:mm');
  };

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Chargement des détails de l'invité..." />
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
          <Button type="primary" onClick={() => navigate('/invites')} style={{ marginTop: 16 }}>
            Retour à la liste
          </Button>
        </div>
      </Card>
    );
  }

  // Affichage si l'invité n'est pas trouvé
  if (!invite) {
    return (
      <Card className="not-found-card">
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <InfoCircleOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <Title level={4}>Invité non trouvé</Title>
          <Text>L'invité que vous recherchez n'existe pas ou a été supprimé.</Text>
          <div style={{ marginTop: 24 }}>
            <Button type="primary" onClick={() => navigate('/invites')}>
              Retour à la liste
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // NOUVEAU RENDU AVEC DESIGN CRM
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
              Lead: <span className="lead-name">"{invite.nom} {invite.prenom}"</span>
              {invite.entreprise && <span className="lead-company"> - ({invite.entreprise.nom})</span>}
            </div>
            <div className="crm-lead-actions">
              <Link to="#" className="crm-link">{invite.entreprise?.nom || 'Entreprise non définie'}</Link>
            </div>
          </div>
        </div>

        <div className="crm-header-actions">
          <Button
            className="crm-btn crm-send-btn"
            type="default"
            icon={<SendOutlined />}
            onClick={handleSendInvitation}
            disabled={invite.statut !== 'en_attente'}
          >
            Send Invitation
          </Button>

          <Dropdown overlay={statusMenu} placement="bottomRight">
            <Button className="crm-btn crm-options-btn">
              Status <DownOutlined />
            </Button>
          </Dropdown>

          {invite.is_converted && invite.prospect ? (
            <Button
              className="crm-btn crm-view-prospect-btn"
              type="primary"
              icon={<LinkOutlined />}
              onClick={() => navigate(`/prospects/${invite.prospect.id}`)}
            >
              Voir le prospect
            </Button>
          ) : invite.is_converted ? (
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
                setConversionModalVisible(true);
              }}
              disabled={invite.statut === 'converti'}
            >
              Convert
            </Button>
          )}

        </div>
      </div>

      {/* Informations du pipeline */}
      <div className="crm-meta-info">
        <div className="crm-meta-item">
        <div className="crm-meta-label">CONVERSION STATUS:</div>
  <div className="crm-meta-value">
    {invite.is_converted ? (
      <Tag color="success" icon={<CheckOutlined />}>
        Converti en prospect
      </Tag>
    ) : (
      <Tag color="blue">
        En cours
      </Tag>
    )}
  </div>
</div>
        <div className="crm-meta-item">
          <div className="crm-meta-label">ACTION:</div>
          <div className="crm-meta-value">
            <Link to="#" className="crm-link">{invite.action?.nom || 'Non définie'}</Link>
          </div>
        </div>
        <div className="crm-meta-item">
          <div className="crm-meta-label">PIPELINE ADDED:</div>
          <div className="crm-meta-value">{moment(invite.created_at).format('MMM D, YYYY')}</div>
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
            <Link to="#" className="crm-link">{invite.proprietaire?.name || 'Non assigné'}</Link>
          </div>
        </div>
      </div>

      {/* Visualisation du pipeline avec étapes */}
      <div className="crm-pipeline-visualization">
        <PipelineStageManager
          entityType="invite"
          entityId={id}
          stages={pipelineStages}
          currentStage={currentStage}
          progression={progression || []}
          pipelineCompletedAt={invite?.is_converted ? invite?.date_conversion || new Date().toISOString() : null}
          onStagesChange={() => dispatch(getInvitePipeline(id))}
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
                <h3>Lead Information</h3>
                <Button icon={<EditOutlined />} size="small" onClick={() => navigate(`/invites/${id}/edit`)}>
                  Edit details
                </Button>
              </div>

              <Descriptions bordered column={2}>
                <Descriptions.Item label="Nom complet">{invite.nom} {invite.prenom}</Descriptions.Item>
                <Descriptions.Item label="Email">{invite.email}</Descriptions.Item>
                <Descriptions.Item label="Téléphone">{invite.telephone || 'Non renseigné'}</Descriptions.Item>
                <Descriptions.Item label="Fonction">{invite.fonction || 'Non renseignée'}</Descriptions.Item>
                <Descriptions.Item label="Pays">{invite.pays?.nom || 'Non renseigné'}</Descriptions.Item>
                <Descriptions.Item label="Type d'invité">
                  {invite.type_invite === 'interne' ? 'Interne' : 'Externe'}
                </Descriptions.Item>
                <Descriptions.Item label="Entreprise">{invite.entreprise?.nom || 'Non assignée'}</Descriptions.Item>
                <Descriptions.Item label="Secteur d'activité">{invite.secteur?.name || 'Non renseigné'}</Descriptions.Item>
                <Descriptions.Item label="Potentiel">
                  {invite.potentiel ? invite.potentiel.charAt(0).toUpperCase() + invite.potentiel.slice(1) : 'Non évalué'}
                </Descriptions.Item>
                <Descriptions.Item label="Date d'événement">
                  {invite.date_evenement ? moment(invite.date_evenement).format('DD/MM/YYYY') : 'Non définie'}
                </Descriptions.Item>
              </Descriptions>

              <div className="crm-info-blocks">
                <Card title="Projet confidentiel:" bordered={false}>
                  <Tag color={invite.confidentiel ? 'red' : 'green'}>
                    {invite.confidentiel ? 'Oui' : 'Non'}
                  </Tag>
                </Card>

                <Card title="Type d'investissement prévu:" bordered={false}>
                  <Text>{invite.type_investissement || 'Expansion'}</Text>
                </Card>

                <Card title="Plan d'investissement (détails):" bordered={false}>
                  <Text>{invite.plan_investissement || 'Intéressée par la Tunisie'}</Text>
                </Card>
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
                </>
              ) : (
                <Alert
                  message="Aucun pipeline défini"
                  description="Ce lead n'a pas encore de pipeline de suivi défini."
                  type="info"
                  showIcon
                />
              )}
            </div>
          </TabPane>

          <TabPane tab={<span><WarningOutlined /> Blockages ({blockages.length})</span>} key="blockages">
            <PipelineBlockages
              entityType="invite"
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

              <div className="crm-tasks-content"  >
                <PipelineTasks
                  entityType="invite"
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

      {/* Modal de conversion en prospect */}
      <Modal
        title="Convertir en prospect"
        visible={conversionModalVisible}
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

      {/* Modal pour modifier/ajouter une étape */}
      {/* <Modal
        title={editingStage ? "Modifier l'étape" : "Nouvelle étape"}
        visible={stageModalVisible}
        onCancel={() => {
          setEditingStage(null);
          setStageModalVisible(false);
        }}
        onOk={handleSaveStage}
      >
        <Form form={stageForm} layout="vertical" initialValues={editingStage || {}}>
          <Form.Item
            name="name"
            label="Nom de l'étape"
            rules={[{ required: true, message: "Nom obligatoire" }]}
          >
            <Input placeholder="Nom de l'étape" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea
              rows={3}
              placeholder="Description de cette étape du pipeline"
            />
          </Form.Item>

          <Form.Item
            name="order"
            label="Ordre"
            rules={[
              { required: true, message: "Ordre obligatoire" },
              {
                type: 'number',
                min: 1,
                message: "L'ordre doit être un nombre positif"
              }
            ]}
          >
            <InputNumber
              min={1}
              precision={0}
              style={{ width: '100%' }}
              placeholder="Position dans le pipeline"
            />
          </Form.Item>

          {editingStage?.is_final && (
            <Form.Item name="is_final" valuePropName="checked">
              <Checkbox disabled>Étape finale</Checkbox>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                (Cette étape est définie comme l'étape finale du pipeline)
              </Text>
            </Form.Item>
          )}
        </Form>
      </Modal> */}

      {/* Modal pour avancer dans le pipeline */}
      <Modal
        title={`Passer à l'étape ${nextStage?.order || ''} : ${nextStage?.name || ''}`}
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
        entityType="invite"
        entityId={id}
        stageId={selectedStageForTask}
        stageName={selectedStageName}
        entityName={invite?.nom}
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
        
        .crm-stage-btn {
          background-color: #1890ff;
          color: white;
        }
        
        .crm-convert-btn {
          background-color: #722ed1;
          border-color: #722ed1;
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
        
        .crm-pipeline-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        
        .crm-pipeline-stages {
          display: flex;
        }
        
        .crm-stage {
          padding: 6px 12px;
          margin-right: 2px;
          background-color: #f0f0f0;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          color: #666;
        }
        
        .crm-stage.current {
          background-color: #1890ff;
          color: white;
        }
        
        .crm-stage.open {
          background-color: #52c41a;
          color: white;
        }
        
        .crm-pipeline-actions {
          display: flex;
          gap: 8px;
        }
        
        .crm-pipeline-steps {
          display: flex;
          margin-top: 20px;
          position: relative;
        }
        
        .crm-pipeline-steps::after {
          content: '';
          position: absolute;
          top: 20px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: #e8e8e8;
          z-index: 1;
        }
        
        .pipeline-step {
          flex: 1;
          position: relative;
          text-align: center;
          z-index: 2;
        }
        
        .pipeline-step::after {
          content: '';
          position: absolute;
          width: 12px;
          height: 12px;
          background-color: #e8e8e8;
          border-radius: 50%;
          top: 14px;
          left: calc(50% - 6px);
          z-index: 2;
        }
        
        .pipeline-step.active::after {
          background-color: #1890ff;
          box-shadow: 0 0 0 4px rgba(24, 144, 255, 0.2);
        }
        
        .pipeline-step.completed::after {
          background-color: #52c41a;
        }
        
        .step-label {
          font-size: 12px;
          color: #666;
          margin-top: 30px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          padding: 0 5px;
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

export default InviteDetails;