import React, { useEffect } from 'react';
import { List, Card, Tag, Tooltip, Button, Space, Badge, Typography, Avatar, message, Spin, Alert, Empty } from 'antd';
import {
  ClockCircleOutlined, CheckOutlined,
  CalendarOutlined, RightOutlined, EditOutlined, EyeOutlined, UserOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { fetchPipelineStageTasks, getPipelineTaskById, clearStageTasks } from '../../features/taskSlice';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

const PipelineTasks = ({ stageId, entityId, entityType, onEdit }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Sélecteurs Redux
  const stageTasks = useSelector(state => state.tasks.stageTasks || []);
  const stageTasksLoading = useSelector(state => state.tasks.stageTasksLoading);
  const stageTasksError = useSelector(state => state.tasks.stageTasksError);

  useEffect(() => {
    if (stageId && entityId && entityType) {
      console.log(`🔄 Chargement des tâches pour étape=${stageId}, ${entityType}=${entityId}`);
      
      dispatch(fetchPipelineStageTasks({ entityType, entityId, stageId }))
        .unwrap()
        .then(response => {
          console.log('✅ Tâches récupérées:', response);
        })
        .catch(error => {
          console.error('❌ Erreur lors du chargement des tâches:', error);
          message.error('Impossible de charger les tâches pour cette étape');
        });
    }

    // Nettoyer seulement quand le composant est démonté
    return () => {
      dispatch(clearStageTasks());
    };
  }, [dispatch, stageId, entityId, entityType]);

  const handleViewTask = (taskId) => {
    dispatch(getPipelineTaskById(taskId))
      .unwrap()
      .then(() => {
        navigate(`/tasks/${taskId}`);
      })
      .catch(error => {
        console.error('Erreur lors du chargement de la tâche:', error);
        message.error('Impossible de charger les détails de cette tâche');
      });
  };

  const renderTaskStatus = (status) => {
    switch (status) {
      case 'completed':
        return <Tag color="green"><CheckOutlined /> Terminé</Tag>;
      case 'in_progress':
        return <Tag color="blue"><ClockCircleOutlined /> En cours</Tag>;
      case 'waiting':
        return <Tag color="orange"><ClockCircleOutlined /> En attente</Tag>;
      case 'deferred':
        return <Tag color="purple"><ClockCircleOutlined /> Reporté</Tag>;
      default:
        return <Tag><ClockCircleOutlined /> À faire</Tag>;
    }
  };

  const renderPriority = (priority) => {
    switch (priority) {
      case 'urgent':
        return <Badge status="error" text="Urgente" />;
      case 'high':
        return <Badge status="warning" text="Haute" />;
      case 'normal':
        return <Badge status="processing" text="Normale" />;
      default:
        return <Badge status="default" text="Basse" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    return moment(dateString).format('DD/MM/YYYY HH:mm');
  };

  return (
    <Card
      title={<Title level={5}>Tâches associées à cette étape</Title>}
      extra={
        <Button 
          type="link" 
          icon={<RightOutlined />}
          onClick={() => navigate(`/tasks?entity_type=${entityType}&entity_id=${entityId}&stage_id=${stageId}`)}
        >
          Voir toutes les tâches
        </Button>
      }
    >
      {stageTasksLoading ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Spin tip="Chargement des tâches..." />
        </div>
      ) : stageTasksError ? (
        <Alert message="Erreur" description={stageTasksError} type="error" showIcon />
      ) : stageTasks.length > 0 ? (
        <List
          dataSource={stageTasks}
          renderItem={task => (
            <List.Item
              actions={[
                <Button
                  key="view"
                  icon={<EyeOutlined />}
                  size="small"
                  onClick={() => handleViewTask(task.id)}
                >
                  Voir
                </Button>,
                onEdit && (
                  <Button
                    key="edit"
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => onEdit(task)}
                  >
                    Modifier
                  </Button>
                )
              ].filter(Boolean)}
            >
              <List.Item.Meta
                avatar={task.assignee ? (
                  <Avatar icon={<UserOutlined />} src={task.assignee?.avatar || null} />
                ) : null}
                title={<Space>{task.title}{renderTaskStatus(task.status)}</Space>}
                description={
                  <div>
                    {task.description && <p>{task.description}</p>}
                    <Space direction="vertical" size="small">
                      <Space>
                        {task.start && (
                          <Tooltip title="Date de début">
                            <CalendarOutlined /> {formatDate(task.start)}
                          </Tooltip>
                        )}
                        {task.start && task.end && <Text type="secondary">→</Text>}
                        {task.end && (
                          <Tooltip title="Date d'échéance">
                            <CalendarOutlined /> {formatDate(task.end)}
                          </Tooltip>
                        )}
                      </Space>
                      {task.priority && renderPriority(task.priority)}
                    </Space>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description="Aucune tâche associée à cette étape" />
      )}
    </Card>
  );
};

export default PipelineTasks;
