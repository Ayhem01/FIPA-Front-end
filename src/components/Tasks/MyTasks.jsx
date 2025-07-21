import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, Button, Input, Select, Card, message, Alert, Spin, Tabs, Row, Col } from 'antd';
import { 
  CheckOutlined, ClockCircleOutlined, DeleteOutlined, 
  EditOutlined, EyeOutlined, FilterOutlined, 
  PlusOutlined, ExclamationCircleOutlined, SortAscendingOutlined, ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMyTasks, deleteTask, updateTaskStatus, resetTaskOperation } from '../../features/taskSlice';
import moment from 'moment';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const MyTasks = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { items: tasks, pagination, loading, error } = useSelector(state => state.tasks.myTasks);
  const { type: operationType, loading: operationLoading, success: operationSuccess, error: operationError } = useSelector(state => state.tasks.taskOperation);
  
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    search: '',
    status: undefined,
    priority: undefined,
    type: undefined,
    sort_field: 'start',
    sort_direction: 'asc',
    per_page: 10,
    page: 1
  });

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, activeTab, filters.page, filters.per_page]);

  useEffect(() => {
    if (operationSuccess) {
      if (operationType === 'delete') {
        message.success('Tâche supprimée avec succès');
        loadTasks();
      } else if (operationType === 'status') {
        message.success('Statut mis à jour avec succès');
        loadTasks();
      }
      dispatch(resetTaskOperation());
    } else if (operationError) {
      message.error(`Erreur: ${operationError}`);
      dispatch(resetTaskOperation());
    }
  }, [operationType, operationSuccess, operationError, dispatch]);

  const loadTasks = () => {
    // Préparer les filtres pour l'API
    const apiFilters = { ...filters };
    
    // Ajouter le statut basé sur l'onglet actif
    if (activeTab === 'pending') {
      apiFilters.status = 'not_started';
    } else if (activeTab === 'in_progress') {
      apiFilters.status = 'in_progress';
    } else if (activeTab === 'completed') {
      apiFilters.status = 'completed';
    } else if (activeTab === 'waiting') {
      apiFilters.status = 'waiting';
    } else if (activeTab === 'deferred') {
      apiFilters.status = 'deferred';
    }
    
    // Supprimer les filtres vides
    Object.keys(apiFilters).forEach(key => {
      if (apiFilters[key] === undefined || apiFilters[key] === '') {
        delete apiFilters[key];
      }
    });
    
    dispatch(getMyTasks(apiFilters));
  };

  const handleSearch = () => {
    setFilters({
      ...filters,
      page: 1
    });
    loadTasks();
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: undefined,
      priority: undefined,
      type: undefined,
      sort_field: 'start',
      sort_direction: 'asc',
      per_page: 10,
      page: 1
    });
    
    setTimeout(() => {
      loadTasks();
    }, 0);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setFilters({
      ...filters,
      page: 1,
      status: undefined // Réinitialiser le statut car il sera défini par l'onglet
    });
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setFilters(prev => ({
      ...prev,
      page: pagination.current,
      per_page: pagination.pageSize,
      sort_field: sorter.field || 'start',
      sort_direction: sorter.order === 'ascend' ? 'asc' : 'desc'
    }));
  };

  const handleAddTask = () => {
    navigate('/tasks/create');
  };

  const handleViewTask = (taskId) => {
    navigate(`/tasks/details/${taskId}`);
  };

  const handleEditTask = (taskId) => {
    navigate(`/tasks/edit/${taskId}`);
  };

  const handleDeleteTask = (taskId) => {
    dispatch(deleteTask(taskId));
  };

  const handleStatusChange = (taskId, newStatus) => {
    dispatch(updateTaskStatus({ id: taskId, status: newStatus }));
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'not_started':
        return <Tag color="warning">Non commencé</Tag>;
      case 'in_progress':
        return <Tag color="processing" icon={<ClockCircleOutlined />}>En cours</Tag>;
      case 'completed':
        return <Tag color="success" icon={<CheckOutlined />}>Terminé</Tag>;
      case 'deferred':
        return <Tag color="purple">Reporté</Tag>;
      case 'waiting':
        return <Tag color="cyan">En attente</Tag>;
      default:
        return <Tag color="default">Inconnu</Tag>;
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
        return <Tag color="red" icon={<ExclamationCircleOutlined />}>Urgente</Tag>;
      default:
        return <Tag color="default">Standard</Tag>;
    }
  };
  
  const columns = [
    {
      title: 'Titre',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
      render: (text, record) => <a onClick={() => handleViewTask(record.id)}>{text}</a>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => {
        switch (type) {
          case 'call':
            return <span>📞 Appel</span>;
          case 'meeting':
            return <span>👥 Réunion</span>;
          case 'email_journal':
            return <span>📧 Email</span>;
          case 'note':
            return <span>📝 Note</span>;
          case 'todo':
            return <span>✓ À faire</span>;
          default:
            return type;
        }
      }
    },
    {
      title: 'Priorité',
      dataIndex: 'priority',
      key: 'priority',
      width: 120,
      sorter: true,
      render: (priority) => getPriorityTag(priority)
    },
    {
      title: 'Échéance',
      dataIndex: 'start',
      key: 'start',
      width: 170,
      sorter: true,
      render: (start, record) => {
        // Calculer si la tâche est en retard
        const isOverdue = !record.completed && moment(start).isBefore(moment(), 'day');
        
        return (
          <div>
            {start ? (
              <span style={{ color: isOverdue ? '#ff4d4f' : 'inherit' }}>
                {moment(start).format('DD/MM/YYYY')}
                {record.all_day ? '' : ' ' + moment(start).format('HH:mm')}
                {isOverdue && ' (En retard)'}
              </span>
            ) : 'N/A'}
          </div>
        );
      }
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      sorter: true,
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 250,
      render: (_, record) => (
        <Space size="small">
          <Button icon={<EyeOutlined />} onClick={() => handleViewTask(record.id)} />
          <Button icon={<EditOutlined />} onClick={() => handleEditTask(record.id)} />
          
          <Select 
            defaultValue={record.status} 
            style={{ width: 130 }} 
            onChange={(value) => handleStatusChange(record.id, value)}
            loading={operationLoading && operationType === 'status'}
          >
            <Option value="not_started">Non commencé</Option>
            <Option value="in_progress">En cours</Option>
            <Option value="completed">Terminé</Option>
            <Option value="waiting">En attente</Option>
            <Option value="deferred">Reporté</Option>
          </Select>
          
          <Button 
            icon={<DeleteOutlined />} 
            danger 
            onClick={() => handleDeleteTask(record.id)}
            loading={operationLoading && operationType === 'delete'}
          />
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <div className="my-tasks-container" style={{ padding: '20px' }}>
        <Alert
          message="Erreur"
          description={`Impossible de charger vos tâches: ${error}`}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="my-tasks-container" style={{ padding: '20px' }}>
      <div className="tasks-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Mes tâches</h2>
        <div className="tasks-actions">
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddTask}
          >
            Nouvelle tâche
          </Button>
        </div>
      </div>
      
      <Card style={{ marginBottom: '20px' }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8} md={6} lg={5} xl={4}>
            <Search
              placeholder="Rechercher des tâches"
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              onSearch={handleSearch}
              style={{ width: '100%', marginBottom: '10px' }}
            />
          </Col>
          
          <Col xs={24} sm={8} md={5} lg={4} xl={3}>
            <Select
              placeholder="Priorité"
              allowClear
              style={{ width: '100%', marginBottom: '10px' }}
              value={filters.priority}
              onChange={value => setFilters({ ...filters, priority: value })}
            >
              <Option value="low">Basse</Option>
              <Option value="normal">Normale</Option>
              <Option value="high">Haute</Option>
              <Option value="urgent">Urgente</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={8} md={5} lg={4} xl={3}>
            <Select
              placeholder="Type"
              allowClear
              style={{ width: '100%', marginBottom: '10px' }}
              value={filters.type}
              onChange={value => setFilters({ ...filters, type: value })}
            >
              <Option value="call">Appel</Option>
              <Option value="meeting">Réunion</Option>
              <Option value="email_journal">Email</Option>
              <Option value="note">Note</Option>
              <Option value="todo">À faire</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={8} md={5} lg={4} xl={3}>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={handleSearch}
              style={{ marginBottom: '10px', marginRight: '10px' }}
            >
              Filtrer
            </Button>
            
            <Button
              icon={<ReloadOutlined />}
              onClick={handleResetFilters}
              style={{ marginBottom: '10px' }}
            >
              Réinitialiser
            </Button>
          </Col>
          
          <Col xs={24}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: 8 }}>Trier par: </span>
              <Select
                defaultValue="start"
                style={{ width: 150, marginRight: 8 }}
                onChange={value => setFilters({ ...filters, sort_field: value })}
              >
                <Option value="start">Date d'échéance</Option>
                <Option value="created_at">Date de création</Option>
                <Option value="priority">Priorité</Option>
              </Select>
              
              <Select
                defaultValue="asc"
                style={{ width: 120 }}
                onChange={value => setFilters({ ...filters, sort_direction: value })}
              >
                <Option value="asc">Ascendant</Option>
                <Option value="desc">Descendant</Option>
              </Select>
              
              <Button 
                icon={<SortAscendingOutlined />} 
                style={{ marginLeft: 8 }}
                onClick={handleSearch}
              >
                Appliquer
              </Button>
            </div>
          </Col>
        </Row>
      </Card>
      
      <Card>
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="Toutes" key="all" />
          <TabPane tab="Non commencées" key="pending" />
          <TabPane tab="En cours" key="in_progress" />
          <TabPane tab="En attente" key="waiting" />
          <TabPane tab="Terminées" key="completed" />
          <TabPane tab="Reportées" key="deferred" />
        </Tabs>
        
        <Table 
          columns={columns} 
          dataSource={tasks} 
          rowKey="id"
          loading={loading || operationLoading}
          pagination={{
            current: filters.page,
            pageSize: filters.per_page,
            total: pagination ? pagination.total : 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} tâches`,
          }}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

export default MyTasks;