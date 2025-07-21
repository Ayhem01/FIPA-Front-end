import React, { useEffect, useState } from 'react';
import { Button, Descriptions, Tag, Card, Space, Row, Col, Typography, Divider, message, Popconfirm, Alert, Spin, Modal } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getTaskById, updateTaskStatus, deleteTask, resetTaskOperation } from '../../features/taskSlice';
import { EditOutlined, DeleteOutlined, ArrowLeftOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import { formatDateDisplay } from '../../utils/dateUtils';


const { Title, Text } = Typography;

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data: task, loading, error } = useSelector(state => state.tasks.selectedTask);
  const { type: operationType, loading: operationLoading, success: operationSuccess, error: operationError } = useSelector(state => state.tasks.taskOperation);
  const currentUser = useSelector(state => state.user.user); // Récupérer l'utilisateur connecté

  // Ajout d'un état local pour mettre à jour immédiatement l'interface
  const [localTask, setLocalTask] = useState(null);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [confirmStatusVisible, setConfirmStatusVisible] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  // Déterminer si l'utilisateur est un responsable FIPA
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
  // Un responsable FIPA ne peut modifier que ses propres tâches
  const canModifyTask = !isResponsableFipa || isTaskCreator;

  // Charger la tâche depuis l'API
  useEffect(() => {
    if (id) {
      dispatch(getTaskById(id));
    }

    return () => {
      dispatch(resetTaskOperation());
    };
  }, [dispatch, id]);

  // Synchroniser l'état local avec les données Redux
  useEffect(() => {
    if (task) {
      setLocalTask(task);
    }
  }, [task]);

  // Log pour débogage
  useEffect(() => {
    if (currentUser && localTask) {
      console.log("Vérification des permissions:", {
        currentUserId: currentUser.id,
        currentUserRole: currentUser.role,
        taskCreatorId: localTask.user_id,
        isResponsableFipa,
        isTaskCreator,
        canModifyTask
      });
    }
  }, [currentUser, localTask, isResponsableFipa, isTaskCreator, canModifyTask]);

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
        dispatch(getTaskById(id));
      } else if (operationType === 'delete') {
        message.success('Tâche supprimée avec succès');
        dispatch(resetTaskOperation());
        navigate('/tasks');
      }
    } else if (operationError) {
      message.error(`Erreur: ${operationError}`);
      dispatch(resetTaskOperation());
    }
  }, [operationType, operationSuccess, operationError, dispatch, id, navigate, localTask, pendingStatus]);

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

    dispatch(updateTaskStatus({ id, status: pendingStatus }));
    setConfirmStatusVisible(false);
  };

  const handleEdit = () => {
    navigate(`/tasks/edit/${id}`);
  };

  const handleDelete = () => {
    setConfirmDeleteVisible(true);
  };

  const confirmDelete = () => {
    dispatch(deleteTask(id));
    setConfirmDeleteVisible(false);
    navigate('/tasks');
  };

  // Les fonctions de rendu (getStatusTag, getTypeLabel, etc.) restent inchangées...
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
        return <Tag color="green">Basse</Tag>;
      case 'normal':
        return <Tag color="blue">Normale</Tag>;
      case 'high':
        return <Tag color="orange">Haute</Tag>;
      case 'urgent':
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

  if (loading || !localTask) {
    return (
      <div className="task-details-container" style={{ padding: '20px', textAlign: 'center' }}>
        <Spin size="large" tip="Chargement des détails..." />
      </div>
    );
  }

  return (
    <div className="task-details-container" style={{ padding: '20px' }}>
      <div className="details-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/tasks')}>
          Retour à la liste
        </Button>

        <Space>
          {/* Bouton Modifier: visible si l'utilisateur peut modifier la tâche ET n'est PAS admin */}
          {canModifyTask && !isAdmin && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
            >
              Modifier
            </Button>
          )}

          {/* Bouton Supprimer: visible si l'utilisateur peut modifier la tâche OU est admin */}
          {(canModifyTask || isAdmin) && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              loading={operationLoading && operationType === 'delete'}
            >
              Supprimer
            </Button>
          )}
        </Space>
      </div>


      <Card>
        {/* Le reste du code reste identique... */}
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={4}>{localTask.title}</Title>
              {getStatusTag(localTask.status)}
            </div>
            <div style={{ marginTop: 8 }}>
              <Space>
                {getPriorityTag(localTask.priority)}
                <Text type="secondary">{getTypeLabel(localTask.type)}</Text>
              </Space>
            </div>
          </Col>

          <Col xs={24}>
            <Divider orientation="left">Détails</Divider>
            <Descriptions column={{ xs: 1, sm: 2 }} bordered>
              <Descriptions.Item label="Date de début">
                {formatDateDisplay(localTask.start)}
              </Descriptions.Item>
              <Descriptions.Item label="Date de fin">
                {formatDateDisplay(localTask.end)}
              </Descriptions.Item>
              <Descriptions.Item label="Toute la journée">
                {localTask.all_day ? 'Oui' : 'Non'}
              </Descriptions.Item>
              <Descriptions.Item label="Créée le">
                {formatDateDisplay(localTask.created_at)}
              </Descriptions.Item>
              <Descriptions.Item label="Assignée à">
                {localTask.assignee ? localTask.assignee.name : 'Non assignée'}
              </Descriptions.Item>
              {/* <Descriptions.Item label="Créée le">
                {localTask.created_at ? moment(localTask.created_at).format('DD/MM/YYYY HH:mm') : 'N/A'}
              </Descriptions.Item> */}
              <Descriptions.Item label="Modifiée le">
                {formatDateDisplay(localTask.updated_at)}
              </Descriptions.Item>
            </Descriptions>
          </Col>

          {localTask.description && (
            <Col xs={24}>
              <Divider orientation="left">Description</Divider>
              <Card style={{ background: '#f9f9f9' }}>
                <Text>{localTask.description}</Text>
              </Card>
            </Col>
          )}

          <Col xs={24}>
            <Divider orientation="left">Changer le statut</Divider>
            <Space wrap>
              <Button
                type={localTask.status === 'not_started' ? 'primary' : 'default'}
                onClick={() => handleStatusChange('not_started')}
                loading={operationLoading && operationType === 'status' && pendingStatus === 'not_started'}
              >
                Non commencé
              </Button>
              <Button
                type={localTask.status === 'in_progress' ? 'primary' : 'default'}
                onClick={() => handleStatusChange('in_progress')}
                loading={operationLoading && operationType === 'status' && pendingStatus === 'in_progress'}
              >
                En cours
              </Button>
              <Button
                type={localTask.status === 'waiting' ? 'primary' : 'default'}
                onClick={() => handleStatusChange('waiting')}
                loading={operationLoading && operationType === 'status' && pendingStatus === 'waiting'}
              >
                En attente
              </Button>
              <Button
                type={localTask.status === 'completed' ? 'primary' : 'default'}
                style={localTask.status === 'completed' ? { background: '#52c41a', borderColor: '#52c41a' } : {}}
                onClick={() => handleStatusChange('completed')}
                loading={operationLoading && operationType === 'status' && pendingStatus === 'completed'}
              >
                Terminé
              </Button>
              <Button
                type={localTask.status === 'deferred' ? 'primary' : 'default'}
                danger={localTask.status === 'deferred'}
                onClick={() => handleStatusChange('deferred')}
                loading={operationLoading && operationType === 'status' && pendingStatus === 'deferred'}
              >
                Reporté
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

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
    </div>
  );
};

export default TaskDetails;