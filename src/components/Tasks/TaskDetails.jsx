import React, { useEffect, useState } from 'react';
import { Button, Descriptions, Tag, Card, Space, Row, Col, Typography, Divider, message, Alert, Spin, Modal, Badge, Avatar, Form, Input, Select, DatePicker, Checkbox } from 'antd';
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
  resetTaskOperation
} from '../../features/taskSlice';
import {
  EditOutlined, DeleteOutlined, ArrowLeftOutlined, ExclamationCircleOutlined,
  TagOutlined, UserOutlined, BranchesOutlined, LinkOutlined, CheckCircleOutlined,
  ClockCircleOutlined, FileTextOutlined, InfoCircleOutlined, CalendarOutlined,
  CheckOutlined, CloseOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { formatDateDisplay } from '../../utils/dateUtils';
import '../../../src/assets/styles/action-form.css';

const { Title, Text } = Typography;

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data: task, loading, error } = useSelector(state => state.tasks.selectedTask);
  const { type: operationType, loading: operationLoading, success: operationSuccess, error: operationError } = useSelector(state => state.tasks.taskOperation);
  const currentUser = useSelector(state => state.user.user);

  const [localTask, setLocalTask] = useState(null);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [confirmStatusVisible, setConfirmStatusVisible] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [isPipelineTask, setIsPipelineTask] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  // Déterminer si l'utilisateur a des droits spéciaux
  const isResponsableFipa = currentUser && (
    currentUser.role === 'responsable_fipa' ||
    currentUser.role === 'responsable fipa'
  );
  const isAdmin = currentUser && (
    currentUser.role === 'admin' ||
    currentUser.is_admin === true
  );

  // Vérifier si l'utilisateur courant est le créateur de la tâche
  const isTaskCreator = localTask && currentUser && localTask.user_id === currentUser.id;

  // Déterminer si l'utilisateur peut modifier/supprimer la tâche
  const canModifyTask = !isResponsableFipa || isTaskCreator;

  // Dans le useEffect qui charge la tâche:
  useEffect(() => {
    if (id) {
      // Vérifier si les données sont déjà dans le state Redux
      if (task && task.id === parseInt(id)) {
        setIsPipelineTask(true);
        setLocalTask(task);
        return;
      }

      // Sinon, charger les données
      dispatch(getPipelineTaskById(id))
        .unwrap()
        .then(response => {
          setIsPipelineTask(true);
        })
        .catch((error) => {
          console.error('Erreur lors du chargement de la tâche de pipeline:', error);

          // Si l'erreur concerne 'avatar', essayer de manipuler les données
          if (error && error.toString().includes('avatar')) {
            message.warning('Problème d\'affichage. Certaines informations peuvent être incomplètes.');
          }

          // Essayer de charger comme tâche normale
          dispatch(getTaskById(id))
            .unwrap()
            .catch(() => {
              message.error('Impossible de charger les détails de cette tâche');
              navigate('/tasks');
            });

          setIsPipelineTask(false);
        });
    }
  }, [dispatch, id, task]);

  // Synchroniser l'état local avec les données Redux
  useEffect(() => {
    if (task) {
      setLocalTask(task);
    }
  }, [task]);

  // Gérer les résultats des opérations
  useEffect(() => {
    if (operationSuccess) {
      if (operationType === 'status') {
        message.success('Statut mis à jour avec succès');

        // Mettre à jour l'état local immédiatement pour un affichage instantané
        if (localTask && pendingStatus) {
          setLocalTask({
            ...localTask,
            status: pendingStatus
          });
        }

        dispatch(resetTaskOperation());
        // Récupérer également les données mises à jour du serveur en arrière-plan
        if (isPipelineTask) {
          dispatch(getPipelineTaskById(id));
        } else {
          dispatch(getTaskById(id));
        }
      } else if (operationType === 'delete') {
        message.success('Tâche supprimée avec succès');
        dispatch(resetTaskOperation());
        navigate('/tasks');
      } else if (operationType === 'update') {
        message.success('Tâche mise à jour avec succès');
        setIsEditing(false);
        dispatch(resetTaskOperation());

        // Récupérer les données mises à jour
        if (isPipelineTask) {
          dispatch(getPipelineTaskById(id));
        } else {
          dispatch(getTaskById(id));
        }
      }
    } else if (operationError) {
      message.error(`Erreur: ${operationError}`);
      dispatch(resetTaskOperation());
    }
  }, [operationType, operationSuccess, operationError, dispatch, id, navigate, localTask, pendingStatus, isPipelineTask]);

  // Initialiser le formulaire en mode édition
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

  // Ouvrir le modal de confirmation de changement de statut
  const handleStatusChange = (newStatus) => {
    setPendingStatus(newStatus);
    setConfirmStatusVisible(true);
  };

  // Confirmer le changement de statut
  const confirmStatusChange = () => {
    // Mettre à jour l'état local immédiatement pour un retour visuel instantané
    if (localTask && pendingStatus) {
      setLocalTask({
        ...localTask,
        status: pendingStatus
      });
    }

    if (isPipelineTask) {
      dispatch(updatePipelineTaskStatus({ taskId: id, status: pendingStatus }));
    } else {
      dispatch(updateTaskStatus({ id, status: pendingStatus }));
    }

    setConfirmStatusVisible(false);
  };

  const handleEdit = () => {
    if (!isEditing) {
      // Basculer en mode édition
      setIsEditing(true);
    } else {
      // Soumettre le formulaire lorsqu'on est déjà en mode édition
      form.submit();
    }
  };

  const handleUpdate = async (values) => {
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

      // Utiliser la bonne fonction selon le type de tâche
      if (isPipelineTask) {
        await dispatch(updatePipelineTask({ taskId: id, taskData })).unwrap();
      } else {
        await dispatch(updateTask({ id, data: taskData })).unwrap();
      }

      message.success('Tâche mise à jour avec succès');
      setIsEditing(false);

      // Rafraîchir les données
      if (isPipelineTask) {
        dispatch(getPipelineTaskById(id));
      } else {
        dispatch(getTaskById(id));
      }
    } catch (error) {
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

  // Fonctions helpers pour afficher les statuts et priorités
  const getStatusTag = (status) => {
    switch (status) {
      case 'not_started':
        return <Tag color="warning">Non commencé</Tag>;
      case 'in_progress':
        return <Tag color="processing">En cours</Tag>;
      case 'completed':
        return <Tag color="success">Terminé</Tag>;
      case 'deferred':
        return <Tag color="purple">Reporté</Tag>;
      case 'waiting':
        return <Tag color="cyan">En attente</Tag>;
      default:
        return <Tag color="default">Inconnu</Tag>;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'not_started': return 'Non commencé';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'deferred': return 'Reporté';
      case 'waiting': return 'En attente';
      default: return 'Inconnu';
    }
  };

  const getPriorityTag = (priority) => {
    switch (priority) {
      case 'low':
      case 'l':
        return <Tag color="green">Basse</Tag>;
      case 'normal':
      case 'medium':
      case 'm':
        return <Tag color="blue">Normale</Tag>;
      case 'high':
      case 'h':
        return <Tag color="orange">Haute</Tag>;
      case 'urgent':
      case 'u':
        return <Tag color="red">Urgente</Tag>;
      default:
        return <Tag color="default">Standard</Tag>;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'call': return '📞 Appel';
      case 'meeting': return '👥 Réunion';
      case 'email_journal': return '📧 Email';
      case 'note': return '📝 Note';
      case 'todo': return '✓ À faire';
      default: return type;
    }
  };

  // Afficher le message d'erreur s'il y en a un
  if (error) {
    return (
      <div className="task-details-container" style={{ padding: '20px' }}>
        <Alert
          message="Erreur"
          description={`Impossible de charger les détails de la tâche: ${error}`}
          type="error"
          showIcon
        />
        <Button style={{ marginTop: 16 }} onClick={() => navigate('/tasks')}>
          Retour à la liste
        </Button>
      </div>
    );
  }

  // Afficher un spinner pendant le chargement
  if (loading || !localTask) {
    return (
      <div className="task-details-container" style={{ padding: '20px', textAlign: 'center' }}>
        <Spin size="large" tip="Chargement des détails..." />
      </div>
    );
  }

  // Nouveau rendu avec le style CRM
  return (
    <div className="crm-container">
      {/* En-tête avec le style CRM */}
      <div className="crm-header">
        <div className="crm-lead-info">
          <div className="crm-avatar">
            <Avatar icon={<FileTextOutlined />} size={42} style={{ backgroundColor: '#1890ff' }} />
          </div>
          <div className="crm-title">
            <div className="crm-lead-label">
              Tâche: <span className="lead-name">"{localTask.title}"</span>
            </div>
            <div className="crm-lead-actions">
              {isPipelineTask && localTask.entity && (
                <Link to={`/${localTask.entity.type}s/${localTask.entity.id}`} className="crm-link">
                  {localTask.entity.type === 'invite' ? 'Invité' :
                    localTask.entity.type === 'prospect' ? 'Prospect' :
                      localTask.entity.type === 'investor' ? 'Investisseur' : 'Projet'}: {localTask.entity.name}
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="crm-header-actions">
          {canModifyTask && (
            <>
              {isEditing ? (
                <>
                  <Button
                    className="crm-btn"
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => form.submit()}
                  >
                    Appliquer
                  </Button>
                  <Button
                    className="crm-btn"
                    icon={<CloseOutlined />}
                    onClick={handleCancelEdit}
                  >
                    Annuler
                  </Button>
                </>
              ) : (
                <Button
                  className="crm-btn"
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                >
                  Modifier
                </Button>
              )}
            </>
          )}

          {(canModifyTask || isAdmin) && !isEditing && (
            <Button
              className="crm-btn"
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              loading={operationLoading && operationType === 'delete'}
            >
              Supprimer
            </Button>
          )}

          <Button
            className="crm-btn"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/tasks')}
          >
            Retour à la liste
          </Button>
          <Button
            className="crm-btn"
            icon={<CalendarOutlined />}
            onClick={() => navigate('/tasks/calendar')}
          >
            Calendrier
          </Button>
        </div>
      </div>

      {/* Informations meta */}
      <div className="crm-meta-info">
        <div className="crm-meta-item">
          <div className="crm-meta-label">STATUT:</div>
          <div className="crm-meta-value">
            {getStatusTag(localTask.status)}
          </div>
        </div>

        <div className="crm-meta-item">
          <div className="crm-meta-label">TYPE:</div>
          <div className="crm-meta-value">
            {getTypeLabel(localTask.type)}
          </div>
        </div>

        <div className="crm-meta-item">
          <div className="crm-meta-label">PRIORITÉ:</div>
          <div className="crm-meta-value">
            {getPriorityTag(localTask.priority)}
          </div>
        </div>

        <div className="crm-meta-item">
          <div className="crm-meta-label">CRÉÉE LE:</div>
          <div className="crm-meta-value">
            {formatDateDisplay(localTask.created_at)}
          </div>
        </div>

        <div className="crm-meta-item">
          <div className="crm-meta-label">ASSIGNÉ À:</div>
          <div className="crm-meta-value">
            <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
            {localTask.assignee ? localTask.assignee.name : 'Non assignée'}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="crm-content-tabs">
        <Card>
          <div className="crm-details-section">
            <div className="crm-details-header">
              <h3>Détails de la tâche</h3>
            </div>

            {isEditing ? (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdate}
              >
                <Form.Item
                  name="title"
                  label="Titre"
                  rules={[{ required: true, message: 'Veuillez saisir un titre' }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="Description"
                >
                  <Input.TextArea rows={4} />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="type"
                      label="Type"
                      rules={[{ required: true, message: 'Veuillez sélectionner un type' }]}
                    >
                      <Select>
                        <Select.Option value="todo">À faire</Select.Option>
                        <Select.Option value="call">Appel</Select.Option>
                        <Select.Option value="meeting">Réunion</Select.Option>
                        <Select.Option value="email_journal">Email</Select.Option>
                        <Select.Option value="note">Note</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="priority"
                      label="Priorité"
                      rules={[{ required: true, message: 'Veuillez sélectionner une priorité' }]}
                    >
                      <Select>
                        <Select.Option value="low">Basse</Select.Option>
                        <Select.Option value="medium">Normale</Select.Option>
                        <Select.Option value="high">Haute</Select.Option>
                        <Select.Option value="urgent">Urgente</Select.Option>
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
                      <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="end"
                      label="Date de fin"
                      rules={[{ required: true, message: 'Veuillez sélectionner une date de fin' }]}
                    >
                      <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="all_day"
                  valuePropName="checked"
                >
                  <Checkbox>Toute la journée</Checkbox>
                </Form.Item>
              </Form>
            ) : (
              <>
                <Descriptions bordered column={{ xs: 1, sm: 2 }} className="crm-descriptions">
                  <Descriptions.Item label={<><CalendarOutlined /> Date de début</>}>
                    {formatDateDisplay(localTask.start)}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><CalendarOutlined /> Date de fin</>}>
                    {formatDateDisplay(localTask.end)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Toute la journée">
                    {localTask.all_day ? 'Oui' : 'Non'}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><UserOutlined /> Créé par</>}>
                    {localTask.creator?.name || localTask.user?.name || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Dernière modification">
                    {formatDateDisplay(localTask.updated_at)}
                  </Descriptions.Item>
                </Descriptions>

                {/* Description de la tâche */}
                {localTask.description && (
                  <div className="crm-description-block">
                    <Divider orientation="left">Description</Divider>
                    <Card style={{ background: '#f9f9f9', marginBottom: 24 }}>
                      <Text>{localTask.description}</Text>
                    </Card>
                  </div>
                )}

                {/* Informations de pipeline */}
                {isPipelineTask && localTask.entity && (
                  <div className="crm-pipeline-info">
                    <Divider orientation="left">Informations de pipeline</Divider>
                    <Card style={{ background: '#f9f9f9', marginBottom: 24 }}
                      title={<><BranchesOutlined /> Contexte de la tâche</>}>
                      <Descriptions column={{ xs: 1, sm: 2 }} size="small" bordered>
                        <Descriptions.Item label="Type d'entité">
                          <Tag icon={<LinkOutlined />}>
                            {localTask.entity.type === 'invite' && 'Invité'}
                            {localTask.entity.type === 'prospect' && 'Prospect'}
                            {localTask.entity.type === 'investor' && 'Investisseur'}
                            {localTask.entity.type === 'projet' && 'Projet'}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Nom de l'entité">
                          <Text strong>{localTask.entity.name || 'N/A'}</Text>
                        </Descriptions.Item>
                        {localTask.pipeline_stage && (
                          <>
                            <Descriptions.Item label="Étape du pipeline">
                              <Badge status="processing" text={localTask.pipeline_stage.name || 'N/A'} />
                            </Descriptions.Item>

                          </>
                        )}
                      </Descriptions>
                      {localTask.entity.description && (
                        <div style={{ marginTop: 16 }}>
                          <Text type="secondary">Description de l'entité: {localTask.entity.description}</Text>
                        </div>
                      )}
                    </Card>
                  </div>
                )}
              </>
            )}

            {!isEditing && (
              <div className="crm-status-section">
                <Divider orientation="left">Changer le statut</Divider>
                <div className="crm-status-buttons">
                  <Button
                    type={localTask.status === 'not_started' ? 'primary' : 'default'}
                    onClick={() => handleStatusChange('not_started')}
                    loading={operationLoading && operationType === 'status' && pendingStatus === 'not_started'}
                    className={localTask.status === 'not_started' ? 'active-status' : ''}
                  >
                    Non commencé
                  </Button>
                  <Button
                    type={localTask.status === 'in_progress' ? 'primary' : 'default'}
                    onClick={() => handleStatusChange('in_progress')}
                    loading={operationLoading && operationType === 'status' && pendingStatus === 'in_progress'}
                    className={localTask.status === 'in_progress' ? 'active-status' : ''}
                  >
                    En cours
                  </Button>
                  <Button
                    type={localTask.status === 'waiting' ? 'primary' : 'default'}
                    onClick={() => handleStatusChange('waiting')}
                    loading={operationLoading && operationType === 'status' && pendingStatus === 'waiting'}
                    className={localTask.status === 'waiting' ? 'active-status' : ''}
                  >
                    En attente
                  </Button>
                  <Button
                    type={localTask.status === 'completed' ? 'primary' : 'default'}
                    style={localTask.status === 'completed' ? { background: '#52c41a', borderColor: '#52c41a' } : {}}
                    onClick={() => handleStatusChange('completed')}
                    loading={operationLoading && operationType === 'status' && pendingStatus === 'completed'}
                    className={localTask.status === 'completed' ? 'active-status' : ''}
                  >
                    Terminé
                  </Button>
                  <Button
                    type={localTask.status === 'deferred' ? 'primary' : 'default'}
                    danger={localTask.status === 'deferred'}
                    onClick={() => handleStatusChange('deferred')}
                    loading={operationLoading && operationType === 'status' && pendingStatus === 'deferred'}
                    className={localTask.status === 'deferred' ? 'active-status' : ''}
                  >
                    Reporté
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Modal de confirmation pour le changement de statut */}
      <Modal
        title={<><ExclamationCircleOutlined style={{ color: '#1890ff' }} /> Confirmer le changement de statut</>}
        open={confirmStatusVisible}
        onOk={confirmStatusChange}
        onCancel={() => setConfirmStatusVisible(false)}
        okText="Oui, changer"
        cancelText="Annuler"
        okButtonProps={{ loading: operationLoading && operationType === 'status' }}
      >
        <p>Êtes-vous sûr de vouloir changer le statut de cette tâche en "{getStatusLabel(pendingStatus)}"?</p>
      </Modal>

      {/* Modal de confirmation pour la suppression */}
      <Modal
        title={<><ExclamationCircleOutlined style={{ color: '#ff4d4f' }} /> Confirmer la suppression</>}
        open={confirmDeleteVisible}
        onOk={confirmDelete}
        onCancel={() => setConfirmDeleteVisible(false)}
        okText="Oui, supprimer"
        cancelText="Annuler"
        okButtonProps={{ danger: true, loading: operationLoading && operationType === 'delete' }}
      >
        <p>Êtes-vous sûr de vouloir supprimer cette tâche?</p>
        <p>Cette action est irréversible.</p>
      </Modal>

      {/* Styles CSS intégrés */}
      <style jsx>{`
        .crm-container {
          background-color: #f0f2f5;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
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
          transition: all 0.2s ease;
        }
        
        .crm-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        
        .crm-meta-info {
          display: flex;
          background-color: white;
          padding: 10px 20px;
          border-bottom: 1px solid #e8e8e8;
          flex-wrap: wrap;
        }
        
        .crm-meta-item {
          margin-right: 40px;
          margin-bottom: 8px;
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
        
        .crm-content-tabs {
          background-color: white;
          padding: 20px;
        }
        
        .crm-details-section {
          padding: 0 8px;
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
          font-size: 18px;
          font-weight: 600;
        }
        
        .crm-descriptions {
          margin-bottom: 24px;
        }
        
        .crm-descriptions .ant-descriptions-item-label {
          background-color: #fafafa;
        }
        
        .crm-status-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .active-status {
          font-weight: bold;
        }
        
        /* Responsive styles */
        @media (max-width: 768px) {
          .crm-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .crm-header-actions {
            margin-top: 16px;
            width: 100%;
          }
          
          .crm-meta-info {
            flex-direction: column;
          }
          
          .crm-meta-item {
            margin-bottom: 8px;
          }
          
          .crm-status-buttons {
            flex-direction: column;
            gap: 8px;
          }
          
          .crm-status-buttons button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default TaskDetails;