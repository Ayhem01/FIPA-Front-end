import React, { useEffect, useState } from 'react';
import { 
  Button, Descriptions, Tag, Card, Space, Row, Col, Typography, Divider, 
  message, Alert, Spin, Modal, Badge, Avatar, Form, Input, Select, 
  DatePicker, Checkbox, Timeline, Tooltip, Progress, Grid 
} from 'antd';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  getTaskById,
  getPipelineTaskById,
  updateTaskStatus,
  updatePipelineTaskStatus,
  updateTask,
  updatePipelineTask,
  deleteTask,
  deletePipelineTask,
  resetTaskOperation,
  clearSelectedTask
} from '../../features/taskSlice';
import {
  EditOutlined, DeleteOutlined, ArrowLeftOutlined, ExclamationCircleOutlined,
  TagOutlined, UserOutlined, BranchesOutlined, LinkOutlined, CheckCircleOutlined,
  ClockCircleOutlined, FileTextOutlined, InfoCircleOutlined, CalendarOutlined,
  CheckOutlined, CloseOutlined, PlayCircleOutlined, PauseCircleOutlined,
  FireOutlined, TeamOutlined, PhoneOutlined, MailOutlined, FlagOutlined,
  HistoryOutlined, SaveOutlined, ShareAltOutlined, SyncOutlined,
  ThunderboltOutlined, SettingOutlined, ReloadOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import { formatDateDisplay } from '../../utils/dateUtils';

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

// Composant de carte animée réutilisable
const AnimatedCard = ({ children, delay = 0, className = "", style = {} }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
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
      y: -4,
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
      className={className}
      style={{ height: '100%', ...style }}
    >
      {children}
    </motion.div>
  );
};

// Composant de statistique moderne amélioré
const TaskStatCard = ({ icon, title, value, color, loading, delay = 0, isNumeric = false }) => {
  const [displayValue, setDisplayValue] = useState(isNumeric ? 0 : value);

  useEffect(() => {
    if (!loading && value !== undefined) {
      if (isNumeric && typeof value === 'number') {
        // Animation pour les valeurs numériques
        const duration = 1000;
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
      } else {
        // Affichage direct pour les valeurs textuelles
        setDisplayValue(value);
      }
    }
  }, [value, loading, isNumeric]);

  return (
    <AnimatedCard delay={delay}>
      <Card 
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: delay * 0.1 + 0.2, duration: 0.6 }}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              boxShadow: `0 4px 16px ${color}40`
            }}
          >
            {loading ? <SyncOutlined spin /> : icon}
          </motion.div>
          
          <div style={{ flex: 1 }}>
            <Text type="secondary" style={{ fontSize: '12px', fontWeight: 500, textTransform: 'uppercase' }}>
              {title}
            </Text>
            <div style={{ marginTop: '2px' }}>
              {loading ? (
                <Spin size="small" />
              ) : (
                <Text style={{ 
                  fontSize: '16px',
                  fontWeight: 700,
                  color: color,
                  display: 'block',
                  lineHeight: 1.2
                }}>
                  {isNumeric && typeof displayValue === 'number' 
                    ? displayValue.toLocaleString() 
                    : displayValue
                  }
                </Text>
              )}
            </div>
          </div>
        </div>
      </Card>
    </AnimatedCard>
  );
};

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const screens = useBreakpoint();

  // Sélecteurs Redux
  const { data: task, loading, error } = useSelector(state => {
    console.log('🔍 Redux selectedTask state:', state.tasks.selectedTask);
    return state.tasks.selectedTask;
  });
  
  const { loading: operationLoading, success: operationSuccess, error: operationError } = useSelector(state => state.tasks.taskOperation);
  const currentUser = useSelector(state => state.user.user);

  const [localTask, setLocalTask] = useState(null);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [confirmStatusVisible, setConfirmStatusVisible] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [isPipelineTask, setIsPipelineTask] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [form] = Form.useForm();

  // Permissions
  const isResponsableFipa = currentUser && (
    currentUser.role === 'responsable_fipa' ||
    currentUser.role === 'responsable fipa'
  );
  const isAdmin = currentUser && (
    currentUser.role === 'admin' ||
    currentUser.is_admin === true
  );
  const isTaskCreator = localTask && currentUser && localTask.user_id === currentUser.id;
  const canModifyTask = !isResponsableFipa || isTaskCreator;

  // Chargement des données
  useEffect(() => {
    if (id) {
      loadTaskData();
    }
  }, [dispatch, id, navigate]);

  const loadTaskData = async () => {
    setRefreshing(true);
    console.log('🔍 Chargement de la tâche avec ID:', id);
    
    setLocalTask(null);
    setIsPipelineTask(false);

    try {
      // Essayer pipeline task d'abord
      const pipelineResponse = await dispatch(getPipelineTaskById(id)).unwrap();
      console.log('✅ Réponse getPipelineTaskById:', pipelineResponse);
      
      setIsPipelineTask(true);
      const taskData = pipelineResponse.data || pipelineResponse;
      console.log('📦 Données pipeline task extraites:', taskData);
      setLocalTask(taskData);
    } catch (pipelineError) {
      console.log('❌ Erreur tâche pipeline:', pipelineError);
      
      try {
        // Essayer task normale
        const normalResponse = await dispatch(getTaskById(id)).unwrap();
        console.log('✅ Réponse getTaskById:', normalResponse);
        
        setIsPipelineTask(false);
        const taskData = normalResponse.data || normalResponse;
        console.log('📦 Données task normale extraites:', taskData);
        setLocalTask(taskData);
      } catch (normalError) {
        console.error('❌ Erreur tâche normale:', normalError);
        message.error('Impossible de charger les détails de cette tâche');
        navigate('/tasks');
      }
    } finally {
      setRefreshing(false);
    }
  };

  // Synchronisation Redux
  useEffect(() => {
    console.log('🔄 Synchronisation Redux - task:', task);
    if (task) {
      console.log('📥 Mise à jour localTask depuis Redux:', task);
      setLocalTask(task);
    }
  }, [task]);

  // Gestion des opérations
  useEffect(() => {
    if (operationSuccess) {
      console.log('✅ Opération réussie');
      message.success('Opération réussie !');
      
      if (pendingStatus && localTask) {
        setLocalTask(prev => ({
          ...prev,
          status: pendingStatus
        }));
      }

      setTimeout(() => {
        if (isPipelineTask) {
          dispatch(getPipelineTaskById(id));
        } else {
          dispatch(getTaskById(id));
        }
      }, 500);

      dispatch(resetTaskOperation());
      
    } else if (operationError) {
      console.error('❌ Erreur opération:', operationError);
      message.error(`Erreur: ${operationError}`);
      dispatch(resetTaskOperation());
    }
  }, [operationSuccess, operationError, dispatch, id, pendingStatus, localTask, isPipelineTask]);

  // Initialiser formulaire
  useEffect(() => {
    if (isEditing && localTask) {
      form.setFieldsValue({
        title: localTask.title,
        description: localTask.description || '',
        type: localTask.type,
        priority: localTask.priority,
        status: localTask.status,
        start: localTask.start ? moment(localTask.start) : null,
        end: localTask.end ? moment(localTask.end) : null,
        all_day: localTask.all_day || false,
        assignee_id: localTask.assignee?.id
      });
    }
  }, [isEditing, localTask, form]);

  // Handlers
  const handleStatusChange = (newStatus) => {
    console.log('🔄 Changement de statut vers:', newStatus);
    setPendingStatus(newStatus);
    setConfirmStatusVisible(true);
    
  };

  const confirmStatusChange = () => {
    console.log('✅ Confirmation changement de statut:', pendingStatus);
    
    if (isPipelineTask) {
      dispatch(updatePipelineTaskStatus({ taskId: id, status: pendingStatus }));
    } else {
      dispatch(updateTaskStatus({ id, status: pendingStatus }));
    }

    setConfirmStatusVisible(false);
    loadTaskData();
  };

  const handleEdit = () => {
    if (!isEditing) {
      setIsEditing(true);
    } else {
      form.submit();
    }
  };

  const handleUpdate = async (values) => {
    console.log('🔄 Mise à jour avec les valeurs:', values);
    
    try {
      const taskData = {
        title: values.title,
        description: values.description,
        type: values.type,
        priority: values.priority,
        status: values.status || localTask.status,
        start: values.start?.format('YYYY-MM-DD HH:mm:ss'),
        end: values.end?.format('YYYY-MM-DD HH:mm:ss'),
        all_day: values.all_day,
        assignee_id: values.assignee_id
      };

      if (isPipelineTask) {
        await dispatch(updatePipelineTask({ taskId: id, taskData })).unwrap();
      } else {
        await dispatch(updateTask({ id, data: taskData })).unwrap();
      }

      setIsEditing(false);

    } catch (error) {
      console.error('❌ Erreur mise à jour:', error);
      message.error(`Erreur lors de la mise à jour: ${error}`);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleDelete = () => {
    setConfirmDeleteVisible(true);
  };

  const confirmDelete = () => {
    if (isPipelineTask) {
      dispatch(deletePipelineTask(id));
    } else {
      dispatch(deleteTask(id));
    }
    setConfirmDeleteVisible(false);
  };

  const handleRefresh = () => {
    loadTaskData();
  };

  // Fonctions helpers pour les configurations
  const getStatusConfig = (status) => {
    const configs = {
      not_started: {
        color: '#faad14',
        bgColor: '#fff7e6',
        borderColor: '#ffd666',
        icon: <ClockCircleOutlined />,
        text: 'Non commencé',
        progress: 0
      },
      in_progress: {
        color: '#1890ff',
        bgColor: '#e6f7ff',
        borderColor: '#69c0ff',
        icon: <PlayCircleOutlined />,
        text: 'En cours',
        progress: 50
      },
      completed: {
        color: '#52c41a',
        bgColor: '#f6ffed',
        borderColor: '#95de64',
        icon: <CheckCircleOutlined />,
        text: 'Terminé',
        progress: 100
      },
      deferred: {
        color: '#722ed1',
        bgColor: '#f9f0ff',
        borderColor: '#b37feb',
        icon: <PauseCircleOutlined />,
        text: 'Reporté',
        progress: 25
      },
      waiting: {
        color: '#13c2c2',
        bgColor: '#e6fffb',
        borderColor: '#5cdbd3',
        icon: <ClockCircleOutlined />,
        text: 'En attente',
        progress: 25
      }
    };
    return configs[status] || configs.not_started;
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      low: { color: '#52c41a', icon: <FlagOutlined />, text: 'Basse' },
      medium: { color: '#1890ff', icon: <FlagOutlined />, text: 'Normale' },
      normal: { color: '#1890ff', icon: <FlagOutlined />, text: 'Normale' },
      high: { color: '#fa8c16', icon: <FlagOutlined />, text: 'Haute' },
      urgent: { color: '#ff4d4f', icon: <FireOutlined />, text: 'Urgente' }
    };
    return configs[priority] || configs.medium;
  };

  const getTypeConfig = (type) => {
    const configs = {
      call: { icon: <PhoneOutlined />, color: '#1890ff', text: 'Appel', emoji: '📞' },
      meeting: { icon: <TeamOutlined />, color: '#52c41a', text: 'Réunion', emoji: '👥' },
      email_journal: { icon: <MailOutlined />, color: '#eb2f96', text: 'Email', emoji: '📧' },
      note: { icon: <FileTextOutlined />, color: '#722ed1', text: 'Note', emoji: '📝' },
      todo: { icon: <CheckOutlined />, color: '#faad14', text: 'À faire', emoji: '✓' }
    };
    return configs[type] || configs.todo;
  };

  // Variables d'animation
  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  // Gestion des états de chargement et d'erreur
  if (error) {
    return (
      <div className="task-details-modern">
        <AnimatedCard>
          <Alert
            message="Erreur de chargement"
            description={`Impossible de charger les détails de la tâche: ${error}`}
            type="error"
            showIcon
            style={{ margin: '20px' }}
          />
          <div style={{ padding: '20px' }}>
            <Space>
              <Button type="primary" onClick={() => navigate('/tasks')}>
                Retour à la liste
              </Button>
              <Button onClick={handleRefresh} loading={refreshing}>
                Réessayer
              </Button>
            </Space>
          </div>
        </AnimatedCard>
      </div>
    );
  }

  if (loading || refreshing || !localTask) {
    return (
      <div className="task-details-modern">
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ marginBottom: '24px' }}
          >
            <SyncOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          </motion.div>
          <Title level={3} style={{ color: '#666' }}>
            Chargement des détails...
          </Title>
          <Text type="secondary">ID: {id}</Text>
        </div>
      </div>
    );
  }

  if (!localTask.id && !localTask.title) {
    return (
      <div className="task-details-modern">
        <AnimatedCard>
          <Alert
            message="Données incomplètes"
            description="Les données de la tâche semblent incomplètes."
            type="warning"
            showIcon
            style={{ margin: '20px' }}
          />
          <div style={{ padding: '20px' }}>
            <Button type="primary" onClick={() => navigate('/tasks')}>
              Retour à la liste
            </Button>
          </div>
        </AnimatedCard>
      </div>
    );
  }

  const statusConfig = getStatusConfig(localTask.status);
  const priorityConfig = getPriorityConfig(localTask.priority);
  const typeConfig = getTypeConfig(localTask.type);

  return (
    <div className="task-details-modern">
      {/* En-tête moderne avec gradient */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="modern-header"
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
                  icon={typeConfig.icon} 
                  style={{ 
                    background: `linear-gradient(135deg, ${typeConfig.color} 0%, ${typeConfig.color}80 100%)`,
                    fontSize: '28px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                  }} 
                />
              </motion.div>
              
              <div>
                <Title level={1} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
                  {localTask.title}
                </Title>
                <div style={{ marginTop: '8px' }}>
                  <Space size={16}>
                    <Tag 
                      icon={typeConfig.icon}
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        color: 'white',
                        borderRadius: '20px',
                        padding: '4px 12px',
                        fontSize: '14px',
                        fontWeight: 600,
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      {typeConfig.emoji} {typeConfig.text}
                    </Tag>
                    <Badge 
                      status={statusConfig.progress === 100 ? "success" : statusConfig.progress > 0 ? "processing" : "default"}
                      text={
                        <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                          {statusConfig.text}
                        </span>
                      }
                    />
                  </Space>
                  
                  {isPipelineTask && localTask.entity && (
                    <div style={{ marginTop: '8px' }}>
                      <Link 
                        to={`/${localTask.entity.type}s/${localTask.entity.id}`} 
                        style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}
                      >
                        <LinkOutlined /> {localTask.entity.name}
                      </Link>
                    </div>
                  )}
                </div>
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
              <AnimatePresence>
                {canModifyTask && (
                  <>
                    {isEditing ? (
                      <motion.div
                        key="edit-actions"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        style={{ display: 'flex', gap: '8px' }}
                      >
                        <Button
                          type="primary"
                          icon={<SaveOutlined />}
                          onClick={() => form.submit()}
                          loading={operationLoading}
                          style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '8px',
                            backdropFilter: 'blur(10px)'
                          }}
                        >
                          Sauvegarder
                        </Button>
                        <Button
                          icon={<CloseOutlined />}
                          onClick={handleCancelEdit}
                          style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white',
                            borderRadius: '8px',
                            backdropFilter: 'blur(10px)'
                          }}
                        >
                          Annuler
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="normal-actions"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        style={{ display: 'flex', gap: '8px' }}
                      >
                        <Button
                          type="primary"
                          icon={<EditOutlined />}
                          onClick={handleEdit}
                          style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '8px',
                            backdropFilter: 'blur(10px)'
                          }}
                        >
                          Modifier
                        </Button>
                      </motion.div>
                    )}
                  </>
                )}

                {(canModifyTask || isAdmin) && !isEditing && (
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleDelete}
                    loading={operationLoading}
                    style={{
                      background: 'rgba(255,77,79,0.2)',
                      border: '1px solid rgba(255,77,79,0.3)',
                      color: '#ff4d4f',
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    Supprimer
                  </Button>
                )}

                

                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/tasks')}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    borderRadius: '8px',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  Retour
                </Button>
              </AnimatePresence>
            </motion.div>
          </Col>
        </Row>
      </motion.div>

      {/* Statistiques principales */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={12} sm={6}>
          <TaskStatCard
            icon={statusConfig.icon}
            title="Statut actuel"
            value={statusConfig.text}
            color={statusConfig.color}
            loading={loading || refreshing}
            delay={0}
            isNumeric={false}
          />
        </Col>
        <Col xs={12} sm={6}>
          <TaskStatCard
            icon={priorityConfig.icon}
            title="Priorité"
            value={priorityConfig.text}
            color={priorityConfig.color}
            loading={loading || refreshing}
            delay={1}
            isNumeric={false}
          />
        </Col>
        
        <Col xs={12} sm={6}>
          <TaskStatCard
            icon={<UserOutlined />}
            title="Responsable"
            value={
              localTask?.assignee?.name ||
              localTask?.user?.name ||
              localTask?.creator?.name ||
              'Non assignée'
            }
            color="#1890ff"
            loading={loading || refreshing}
            delay={3}
            isNumeric={false}
          />
        </Col>
        <Col xs={12} sm={6}>
            <TaskStatCard
              icon={typeConfig.icon}
              title="Type de tâche"
              value={`${typeConfig.emoji} ${typeConfig.text}`}
              color={typeConfig.color}
              loading={loading || refreshing}
              delay={6}
              isNumeric={false}
            />
          </Col>
         
      </Row>


     

      {/* Contenu principal */}
      <Row gutter={[24, 24]}>
        {/* Colonne principale */}
        <Col xs={24} lg={16}>
          <AnimatedCard delay={2}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '8px',
                    height: '24px',
                    borderRadius: '4px',
                    background: 'linear-gradient(135deg, #1890ff, #096dd9)'
                  }} />
                  <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
                    Détails de la tâche
                  </Title>
                </div>
              }
             
              style={{ 
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                marginBottom: '24px'
              }}
              bodyStyle={{ padding: '32px' }}
            >
              {isEditing ? (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleUpdate}
                  className="modern-form"
                >
                  <Form.Item
                    name="title"
                    label="Titre"
                    rules={[{ required: true, message: 'Veuillez saisir un titre' }]}
                  >
                    <Input size="large" placeholder="Titre de la tâche" />
                  </Form.Item>

                  <Form.Item
                    name="description"
                    label="Description"
                  >
                    <Input.TextArea rows={6} placeholder="Description détaillée..." />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="type"
                        label="Type"
                        rules={[{ required: true, message: 'Veuillez sélectionner un type' }]}
                      >
                        <Select size="large" placeholder="Sélectionner un type">
                          <Select.Option value="todo">✓ À faire</Select.Option>
                          <Select.Option value="call">📞 Appel</Select.Option>
                          <Select.Option value="meeting">👥 Réunion</Select.Option>
                          <Select.Option value="email_journal">📧 Email</Select.Option>
                          <Select.Option value="note">📝 Note</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="priority"
                        label="Priorité"
                        rules={[{ required: true, message: 'Veuillez sélectionner une priorité' }]}
                      >
                        <Select size="large" placeholder="Sélectionner une priorité">
                          <Select.Option value="low">🟢 Basse</Select.Option>
                          <Select.Option value="medium">🔵 Normale</Select.Option>
                          <Select.Option value="high">🟠 Haute</Select.Option>
                          <Select.Option value="urgent">🔴 Urgente</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="start"
                        label="Date de début"
                        rules={[{ required: true, message: 'Veuillez sélectionner une date de début' }]}
                      >
                        <DatePicker 
                          showTime 
                          format="DD/MM/YYYY HH:mm" 
                          style={{ width: '100%' }} 
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="end"
                        label="Date de fin"
                        rules={[{ required: true, message: 'Veuillez sélectionner une date de fin' }]}
                      >
                        <DatePicker 
                          showTime 
                          format="DD/MM/YYYY HH:mm" 
                          style={{ width: '100%' }} 
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="all_day"
                    valuePropName="checked"
                  >
                    <Checkbox style={{ fontSize: '16px' }}>Toute la journée</Checkbox>
                  </Form.Item>
                </Form>
              ) : (
                <>
                  <Descriptions 
                    bordered 
                    column={{ xs: 1, sm: 2 }} 
                    className="modern-descriptions"
                    style={{ marginBottom: '32px' }}
                  >
                    <Descriptions.Item 
                      label={
                        <Space>
                          <CalendarOutlined style={{ color: '#1890ff' }} />
                          <Text strong>Date de début</Text>
                        </Space>
                      }
                    >
                      <Text>{formatDateDisplay(localTask.start)}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item 
                      label={
                        <Space>
                          <CalendarOutlined style={{ color: '#ff4d4f' }} />
                          <Text strong>Date de fin</Text>
                        </Space>
                      }
                    >
                      <Text>{formatDateDisplay(localTask.end)}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Toute la journée">
                      <Badge 
                        status={localTask.all_day ? "success" : "default"} 
                        text={localTask.all_day ? 'Oui' : 'Non'} 
                      />
                    </Descriptions.Item>
                    <Descriptions.Item 
                      label={
                        <Space>
                          <UserOutlined style={{ color: '#52c41a' }} />
                          <Text strong>Créé par</Text>
                        </Space>
                      }
                    >
                      <Space>
                        <Avatar size="small" icon={<UserOutlined />} />
                        <Text>{localTask.creator?.name || localTask.user?.name || 'N/A'}</Text>
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Dernière modification">
                      <Text type="secondary">{formatDateDisplay(localTask.updated_at)}</Text>
                    </Descriptions.Item>
                  </Descriptions>

                  {/* Description */}
                  {localTask.description && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="description-section"
                    >
                      <Divider orientation="left">
                        <Space>
                          <FileTextOutlined style={{ color: '#1890ff' }} />
                          <Text strong>Description</Text>
                        </Space>
                      </Divider>
                      <Card 
                        style={{ 
                          background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)',
                          border: '1px solid #e6f0ff',
                          borderRadius: '12px',
                          marginBottom: '24px'
                        }}
                        bodyStyle={{ padding: '24px' }}
                      >
                        <Paragraph style={{ margin: 0, fontSize: '16px', lineHeight: 1.6 }}>
                          {localTask.description}
                        </Paragraph>
                      </Card>
                    </motion.div>
                  )}
                </>
              )}
            </Card>

            {/* Actions de statut */}
            {!isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '8px',
                        height: '24px',
                        borderRadius: '4px',
                        background: 'linear-gradient(135deg, #52c41a, #389e0d)'
                      }} />
                      <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
                        Changer le statut
                      </Title>
                    </div>
                  }
                  style={{ 
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                  }}
                  bodyStyle={{ padding: '32px' }}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '12px'
                  }}>
                    {[
                      { key: 'not_started', label: 'Non commencé', config: getStatusConfig('not_started') },
                      { key: 'in_progress', label: 'En cours', config: getStatusConfig('in_progress') },
                      { key: 'waiting', label: 'En attente', config: getStatusConfig('waiting') },
                      { key: 'completed', label: 'Terminé', config: getStatusConfig('completed') },
                      { key: 'deferred', label: 'Reporté', config: getStatusConfig('deferred') }
                    ].map((status, index) => (
                      <motion.div
                        key={status.key}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Button
                          size="large"
                          type={localTask.status === status.key ? 'primary' : 'default'}
                          icon={status.config.icon}
                          onClick={() => handleStatusChange(status.key)}
                          loading={operationLoading && pendingStatus === status.key}
                          style={{
                            borderRadius: '12px',
                            height: '48px',
                            fontWeight: localTask.status === status.key ? 'bold' : 'normal',
                            background: localTask.status === status.key ? status.config.color : undefined,
                            borderColor: localTask.status === status.key ? 'transparent' : undefined,
                            color: localTask.status === status.key ? 'white' : undefined,
                            width: '100%'
                          }}
                        >
                          {status.label}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatedCard>
        </Col>

        {/* Barre latérale */}
        <Col xs={24} lg={8}>
          {/* Informations de pipeline */}
          {isPipelineTask && localTask.entity && (
            <AnimatedCard delay={3} style={{ marginBottom: '24px' }}>
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '8px',
                      height: '24px',
                      borderRadius: '4px',
                      background: 'linear-gradient(135deg, #722ed1, #531dab)'
                    }} />
                    <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
                      Contexte Pipeline
                    </Title>
                  </div>
                }
                style={{ 
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Type d'entité
                    </Text>
                    <div style={{ marginTop: '4px' }}>
                      <Tag 
                        icon={<LinkOutlined />}
                        style={{
                          background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
                          border: 'none',
                          color: 'white',
                          borderRadius: '20px',
                          padding: '4px 12px',
                          fontWeight: 600
                        }}
                      >
                        {localTask.entity.type === 'invite' && 'Invité'}
                        {localTask.entity.type === 'prospect' && 'Prospect'}
                        {localTask.entity.type === 'investor' && 'Investisseur'}
                        {localTask.entity.type === 'projet' && 'Projet'}
                      </Tag>
                    </div>
                  </div>

                  <div>
                    <Text type="secondary" style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Nom de l'entité
                    </Text>
                    <div style={{ marginTop: '4px' }}>
                      <Link 
                        to={`/${localTask.entity.type}s/${localTask.entity.id}`}
                        style={{ fontSize: '16px', fontWeight: 600, color: '#1890ff' }}
                      >
                        {localTask.entity.name || 'N/A'}
                      </Link>
                    </div>
                  </div>

                  {localTask.pipeline_stage && (
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Étape du pipeline
                      </Text>
                      <div style={{ marginTop: '4px' }}>
                        <Badge 
                          status="processing" 
                          text={
                            <Text style={{ fontSize: '14px', fontWeight: 500 }}>
                              {localTask.pipeline_stage.name || 'N/A'}
                            </Text>
                          } 
                        />
                      </div>
                    </div>
                  )}

                  {localTask.entity.description && (
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Description
                      </Text>
                      <Card 
                        style={{ 
                          marginTop: '8px',
                          background: '#f9f0ff',
                          border: '1px solid #d3adf7',
                          borderRadius: '8px'
                        }}
                        bodyStyle={{ padding: '12px' }}
                      >
                        <Text style={{ fontSize: '14px', lineHeight: 1.5 }}>
                          {localTask.entity.description}
                        </Text>
                      </Card>
                    </div>
                  )}
                </Space>
              </Card>
            </AnimatedCard>
            
          )}

        
        </Col>
      </Row>

      {/* Modals */}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#1890ff' }} />
            <Text strong>Confirmer le changement de statut</Text>
          </Space>
        }
        open={confirmStatusVisible}
        onOk={confirmStatusChange}
        onCancel={() => setConfirmStatusVisible(false)}
        okText="Confirmer"
        cancelText="Annuler"
        okButtonProps={{ 
          loading: operationLoading,
          style: { borderRadius: '8px' }
        }}
        cancelButtonProps={{ style: { borderRadius: '8px' } }}
        style={{ borderRadius: '16px' }}
      >
        <div style={{ padding: '16px 0' }}>
          <Text>
            Êtes-vous sûr de vouloir changer le statut de cette tâche en "
            <Text strong style={{ color: getStatusConfig(pendingStatus)?.color }}>
              {getStatusConfig(pendingStatus)?.text}
            </Text>"?
          </Text>
        </div>
      </Modal>

      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
            <Text strong>Confirmer la suppression</Text>
          </Space>
        }
        open={confirmDeleteVisible}
        onOk={confirmDelete}
        onCancel={() => setConfirmDeleteVisible(false)}
        okText="Supprimer"
        cancelText="Annuler"
        okButtonProps={{ 
          danger: true, 
          loading: operationLoading,
          style: { borderRadius: '8px' }
        }}
        cancelButtonProps={{ style: { borderRadius: '8px' } }}
        style={{ borderRadius: '16px' }}
      >
        <div style={{ padding: '16px 0' }}>
          <Alert
            message="Action irréversible"
            description="Cette action supprimera définitivement la tâche et toutes les données associées."
            type="warning"
            showIcon
            style={{ marginBottom: '16px', borderRadius: '8px' }}
          />
          <Text>Êtes-vous sûr de vouloir supprimer cette tâche?</Text>
        </div>
      </Modal>

      {/* Styles CSS */}
      <style jsx>{`
        .task-details-modern {
          padding: 24px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
        }

        .modern-header {
          position: relative;
        }

        .modern-descriptions .ant-descriptions-item-label {
          background-color: #fafafa;
          font-weight: 600;
          border-radius: 6px 0 0 6px;
        }

        .modern-descriptions .ant-descriptions-item-content {
          border-radius: 0 6px 6px 0;
        }

        .modern-form .ant-form-item {
          margin-bottom: 24px;
        }

        .modern-form .ant-input,
        .modern-form .ant-input-number,
        .modern-form .ant-select-selector,
        .modern-form .ant-picker {
          border-radius: 8px;
          border: 1px solid #d9d9d9;
          transition: all 0.3s ease;
        }

        .modern-form .ant-input:hover,
        .modern-form .ant-select-selector:hover,
        .modern-form .ant-picker:hover {
          border-color: #40a9ff;
          box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
        }

        .modern-form .ant-input:focus,
        .modern-form .ant-select-focused .ant-select-selector,
        .modern-form .ant-picker-focused {
          border-color: #1890ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .task-details-modern {
            padding: 16px;
          }
          
          .modern-header {
            padding: 24px !important;
            border-radius: 16px !important;
          }
        }

        @media (max-width: 576px) {
          .modern-header {
            padding: 20px !important;
            border-radius: 12px !important;
          }
        }

        /* Animations personnalisées */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .ant-card {
          animation: fadeInUp 0.5s ease-out;
        }

        /* Timeline personnalisée */
        .ant-timeline-item {
          padding-bottom: 20px;
        }

        .ant-timeline-item-tail {
          border-left: 2px solid #f0f0f0;
        }

        .ant-timeline-item-head {
          border: 2px solid #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        /* Cards hover effect */
        .ant-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
          transition: all 0.3s ease;
        }

        /* Progress personnalisé */
        .ant-progress-text {
          font-weight: 600 !important;
        }

        /* Badges et tags */
        .ant-tag {
          transition: all 0.3s ease;
        }

        .ant-tag:hover {
          transform: scale(1.05);
        }

        /* Scrollbar personnalisée */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

export default TaskDetails;