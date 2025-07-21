import React, { useEffect } from 'react';
import { Card, Row, Col, Statistic, List, Tag, Progress, Button, Alert, Spin } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getDashboardStats } from '../../features/taskSlice';
import moment from 'moment';

const TasksDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { data, loading, error } = useSelector(state => state.tasks.dashboardStats);

  useEffect(() => {
    dispatch(getDashboardStats());
  }, [dispatch]);

  const getStatusTag = (status) => {
    switch (status) {
      case 'completed':
        return <Tag color="success" icon={<CheckCircleOutlined />}>Terminé</Tag>;
      case 'in_progress':
        return <Tag color="processing" icon={<ClockCircleOutlined />}>En cours</Tag>;
      case 'not_started':
        return <Tag color="warning">Non commencé</Tag>;
      case 'deferred':
        return <Tag color="purple">Reporté</Tag>;
      case 'waiting':
        return <Tag color="cyan">En attente</Tag>;
      default:
        return <Tag>Inconnu</Tag>;
    }
  };

  const getPriorityTag = (priority) => {
    switch (priority) {
      case 'high':
        return <Tag color="red">Haute</Tag>;
      case 'urgent':
        return <Tag color="volcano">Urgente</Tag>;
      case 'normal':
        return <Tag color="orange">Normale</Tag>;
      case 'low':
        return <Tag color="green">Basse</Tag>;
      default:
        return <Tag>Standard</Tag>;
    }
  };

  const handleViewTask = (taskId) => {
    navigate(`/tasks/details/${taskId}`);
  };

  const handleAddTask = () => {
    navigate('/tasks/create');
  };

  if (error) {
    return (
      <div className="dashboard-container" style={{ padding: '20px' }}>
        <Alert 
          message="Erreur" 
          description={`Impossible de charger les statistiques: ${error}`} 
          type="error" 
          showIcon 
        />
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="dashboard-container" style={{ padding: '20px', textAlign: 'center' }}>
        <Spin size="large" tip="Chargement des statistiques..." />
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Tableau de bord des tâches</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddTask}
        >
          Ajouter une tâche
        </Button>
      </div>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Total des tâches" 
              value={data.total} 
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Terminées" 
              value={data.completed} 
              valueStyle={{ color: '#52c41a' }}
              suffix={`/ ${data.total}`} 
            />
            <Progress 
              percent={Math.round((data.completed / data.total) * 100) || 0} 
              status="success" 
              showInfo={false} 
              strokeColor="#52c41a" 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="En cours" 
              value={data.inProgress} 
              valueStyle={{ color: '#1890ff' }}
              suffix={`/ ${data.total}`} 
            />
            <Progress 
              percent={Math.round((data.inProgress / data.total) * 100) || 0} 
              status="active" 
              showInfo={false} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="En retard" 
              value={data.overdue} 
              valueStyle={{ color: '#ff4d4f' }}
              suffix={`/ ${data.total}`} 
            />
            <Progress 
              percent={Math.round((data.overdue / data.total) * 100) || 0} 
              status="exception" 
              showInfo={false}
              strokeColor="#ff4d4f" 
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col xs={24} md={12}>
          <Card title="Tâches récentes">
            <List
              size="small"
              dataSource={data.recentTasks}
              renderItem={item => (
                <List.Item
                  actions={[
                    getStatusTag(item.status),
                    getPriorityTag(item.priority)
                  ]}
                >
                  <List.Item.Meta
                    title={<a onClick={() => handleViewTask(item.id)}>{item.title}</a>}
                    description={item.start ? `Échéance: ${moment(item.start).format('DD/MM/YYYY')}` : null}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Card title="Répartition par statut">
                {data.byStatus.map(item => (
                  <div key={item.status} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '150px' }}>{getStatusTag(item.status)}</div>
                    <Progress 
                      percent={Math.round((item.count / data.total) * 100)} 
                      strokeColor={
                        item.status === 'completed' ? '#52c41a' :
                        item.status === 'in_progress' ? '#1890ff' :
                        item.status === 'not_started' ? '#fa8c16' : '#8c8c8c'
                      }
                    />
                  </div>
                ))}
              </Card>
            </Col>
            
            <Col xs={24}>
              <Card title="Répartition par type">
                {data.byType.map(item => (
                  <div key={item.type} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '150px' }}>
                      {item.type === 'call' && '📞 Appel'}
                      {item.type === 'meeting' && '👥 Réunion'}
                      {item.type === 'email_journal' && '📧 Email'}
                      {item.type === 'note' && '📝 Note'}
                      {item.type === 'todo' && '✓ À faire'}
                    </div>
                    <Progress 
                      percent={Math.round((item.count / data.total) * 100)} 
                      strokeColor={
                        item.type === 'call' ? '#1890ff' :
                        item.type === 'meeting' ? '#52c41a' :
                        item.type === 'email_journal' ? '#eb2f96' :
                        item.type === 'note' ? '#722ed1' : '#faad14'
                      }
                    />
                  </div>
                ))}
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default TasksDashboard;