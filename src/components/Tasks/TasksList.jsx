import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, Button, Card, message, Select, Tabs, Alert, Spin, Row, Col, Input, Avatar, Typography, Badge, Tooltip } from 'antd';
import { 
  EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined, 
  CalendarOutlined, UserOutlined, FilterOutlined, ReloadOutlined, 
  ProjectOutlined, TeamOutlined, BranchesOutlined, LinkOutlined,
  SortAscendingOutlined, BellOutlined, CheckOutlined, ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, deleteTask, resetTaskOperation } from '../../features/taskSlice';
import { getCurrentUser } from '../../features/userSlice';

const { Option } = Select;
const { TabPane } = Tabs;
const { Search } = Input;
const { Text } = Typography;

const TasksList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items = [], pagination, loading, error } = useSelector(state => state.tasks.tasks);
  const { loading: operationLoading, success: operationSuccess } = useSelector(state => state.tasks.taskOperation);
  const currentUser = useSelector(state => state.user.user);
  const authLoading = useSelector(state => state.user.loading);

  const [filters, setFilters] = useState({
    search: '',
    status: undefined,
    priority: undefined,
    type: undefined,
    entity_type: undefined,
    pipeline_stage_id: undefined,
    sort_field: 'start',
    sort_direction: 'asc',
    per_page: 10,
    page: 1
  });

  const [activeTab, setActiveTab] = useState('created');
  const [operationTargetId, setOperationTargetId] = useState(null);

  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.is_admin === true || currentUser.id === 1);
  const isResponsableFipa = currentUser && currentUser.role === 'responsable fipa';

  const loadTasks = () => {
    if (!currentUser) return;

    const apiFilters = { ...filters };

    if (isAdmin) {
      if (activeTab === 'created_by_admin') {
        apiFilters.user_id = currentUser.id;
      } else if (activeTab === 'created_by_others') {
        apiFilters.user_id = undefined;
        apiFilters.assignee_id = undefined;
        apiFilters.user_or_assignee_id = undefined;
        apiFilters.exclude_user_id = currentUser.id;
      }
    } else {
      if (activeTab === 'created') {
        apiFilters.user_id = currentUser.id;
      } else if (activeTab === 'assigned') {
        apiFilters.assignee_id = currentUser.id;
        apiFilters.exclude_user_id = currentUser.id; // exclude self-created tasks
      }
    }

    // Supprimer les filtres vides
    Object.keys(apiFilters).forEach(key => {
      if (apiFilters[key] === undefined || apiFilters[key] === '') {
        delete apiFilters[key];
      }
    });

    dispatch(fetchTasks(apiFilters)).unwrap().catch(() => {
      message.error('Impossible de charger les tâches');
    });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!currentUser && token) {
      dispatch(getCurrentUser())
        .unwrap()
        .catch(() => message.error("Session expirée, veuillez vous reconnecter."));
    }
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (currentUser) loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filters.page, filters.per_page, currentUser, isAdmin, activeTab]);

  useEffect(() => {
    if (operationSuccess) {
      dispatch(resetTaskOperation());
      loadTasks();
    }
  }, [operationSuccess, dispatch]);

  const handleEditTask = (task) => navigate(`/tasks/edit/${task.id}`);
  const handleViewTask = (task) => navigate(`/tasks/${task.id}`);
  const handleAddTask = () => navigate('/tasks/create');

  const handleDeleteTask = (id) => {
    setOperationTargetId(id);
    dispatch(deleteTask(id))
      .unwrap()
      .then(() => message.success('Tâche supprimée'))
      .catch(() => message.error('Erreur lors de la suppression'))
      .finally(() => setOperationTargetId(null));
  };

  const handleFilterChange = (key, value) => setFilters({ ...filters, [key]: value, page: 1 });
  
  const handleTableChange = (pagination, filters, sorter) => {
    setFilters(prev => ({
      ...prev,
      page: pagination.current,
      per_page: pagination.pageSize,
      sort_field: sorter.field || 'start',
      sort_direction: sorter.order === 'ascend' ? 'asc' : 'desc'
    }));
  };
  
  const handleTabChange = (key) => {
    setActiveTab(key);
    setFilters({ ...filters, page: 1 });
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
      entity_type: undefined,
      pipeline_stage_id: undefined,
      sort_field: 'start',
      sort_direction: 'asc',
      per_page: 10,
      page: 1
    });
    
    setTimeout(() => {
      loadTasks();
    }, 0);
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
  
  // Fonction pour obtenir l'icône d'entité en fonction du type
  const getEntityIcon = (entityType) => {
    switch (entityType) {
      case 'invite':
        return <UserOutlined style={{ color: '#1890ff' }} />;
      case 'prospect':
        return <TeamOutlined style={{ color: '#52c41a' }} />;
      case 'investor':
        return <BellOutlined style={{ color: '#722ed1' }} />;
      case 'projet':
        return <ProjectOutlined style={{ color: '#fa8c16' }} />;
      default:
        return <LinkOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  // Fonction pour obtenir le label d'entité en fonction du type
  const getEntityLabel = (entityType) => {
    switch (entityType) {
      case 'invite':
        return 'Invité';
      case 'prospect':
        return 'Prospect';
      case 'investor':
        return 'Investisseur';
      case 'projet':
        return 'Projet';
      default:
        return entityType || 'N/A';
    }
  };

  const columns = [
    {
      title: 'Titre',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
      render: (text, record) => (
        <div className="task-title-cell">
          <a onClick={() => handleViewTask(record)}>{text}</a>
          {record.description && (
            <Tooltip title={record.description.length > 100 ? `${record.description.slice(0, 100)}...` : record.description}>
              <Text type="secondary" style={{ display: 'block', fontSize: '12px', marginTop: '4px' }}>
                {record.description?.length > 50 ? `${record.description.slice(0, 50)}...` : record.description}
              </Text>
            </Tooltip>
          )}
        </div>
      ),
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
      title: 'Entité',
      dataIndex: 'entity',
      key: 'entity',
      width: 180,
      render: (entity) => {
        if (!entity) return <Text type="secondary">Non associé</Text>;
        
        return (
          <Space direction="vertical" size={0}>
            <Tag icon={getEntityIcon(entity.type)} color={entity.type === 'invite' ? 'blue' : entity.type === 'prospect' ? 'green' : entity.type === 'investor' ? 'purple' : 'orange'}>
              {getEntityLabel(entity.type)}
            </Tag>
            <a href={`/${entity.type}s/${entity.id}`} onClick={(e) => { e.stopPropagation(); }}>
              {entity.name}
            </a>
          </Space>
        );
      }
    },
    {
      title: 'Étape',
      dataIndex: 'pipeline_stage',
      key: 'pipeline_stage',
      width: 140,
      render: (stage) => {
        if (!stage) return <Text type="secondary">N/A</Text>;
        
        return (
          <Badge status="processing" text={stage.name} />
        );
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
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      sorter: true,
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Échéance',
      dataIndex: 'start',
      key: 'start',
      width: 170,
      sorter: true,
      render: (start, record) => {
        // Calculer si la tâche est en retard
        const isOverdue = !record.status === 'completed' && moment(start).isBefore(moment(), 'day');
        
        return (
          <div>
            {start ? (
              <span style={{ color: isOverdue ? '#ff4d4f' : 'inherit' }}>
                <CalendarOutlined style={{ marginRight: 4 }} />
                {moment(start).format('DD/MM/YYYY')}
                {record.all_day ? '' : ' ' + moment(start).format('HH:mm')}
                {isOverdue && <Tag color="error" style={{ marginLeft: 4 }}>En retard</Tag>}
              </span>
            ) : 'N/A'}
          </div>
        );
      }
    }
  ];

  // Ajouter conditionnellement la colonne pour le créateur ou la personne assignée
  if (isAdmin) {
    if (activeTab === 'created_by_others') {
      columns.splice(7, 0, {
        title: 'Créé par',
        dataIndex: 'user',
        key: 'user',
        width: 150,
        render: (_, record) => (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
            {record.user?.name || 'Inconnu'}
          </div>
        )
      });
    } else {
      columns.splice(7, 0, {
        title: 'Assigné à',
        dataIndex: 'assignee',
        key: 'assignee',
        width: 150,
        render: (assignee) => {
          if (!assignee) return <Text type="secondary">Non assigné</Text>;
          
          return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
              {assignee.name}
            </div>
          );
        }
      });
    }
  } else {
    if (activeTab === 'assigned') {
      // Pour les non-admin, dans l'onglet "assigné", on affiche qui a créé la tâche
      columns.splice(7, 0, {
        title: 'Créé par',
        dataIndex: 'user',
        key: 'user',
        width: 150,
        render: (_, record) => (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
            {record.user?.name || 'Inconnu'}
          </div>
        )
      });
    }
  }

  // Ajouter la colonne d'actions
  if (!(isResponsableFipa && activeTab === 'assigned')) {
    columns.push({
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          {/* Bouton Détail - toujours affiché */}
          <Button 
            className="crm-btn" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewTask(record)} 
          />
          
          {/* Bouton Modifier - masqué pour les admins dans l'onglet 'created_by_others' */}
          {!(isAdmin && activeTab === 'created_by_others') && (
            <Button 
              className="crm-btn" 
              icon={<EditOutlined />} 
              onClick={() => handleEditTask(record)} 
            />
          )}
          
          {/* Bouton Supprimer - toujours affiché */}
          <Button 
            className="crm-btn"
            icon={<DeleteOutlined />} 
            danger 
            loading={operationLoading && record.id === operationTargetId} 
            onClick={() => handleDeleteTask(record.id)} 
          />
        </Space>
      )
    });
  }

  if (error) {
    return (
      <div className="crm-container" style={{ padding: '20px' }}>
        <Alert
          message="Erreur"
          description={`Impossible de charger les tâches: ${error}`}
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (!currentUser && authLoading) {
    return (
      <div className="crm-container" style={{ padding: '20px', textAlign: 'center' }}>
        <Spin size="large" tip="Chargement utilisateur..." />
      </div>
    );
  }

  if (!currentUser && !authLoading) {
    return (
      <div className="crm-container" style={{ padding: '20px' }}>
        <Alert message="Non connecté" description="Veuillez vous reconnecter." type="warning" showIcon />
      </div>
    );
  }

  return (
    <div className="crm-container" style={{ padding: '20px', animation: 'fadeIn 0.3s ease-in-out' }}>
      <div className="crm-header">
        <div className="crm-lead-info">
          <div className="crm-avatar">
            <Avatar icon={<ProjectOutlined />} size={42} style={{ backgroundColor: '#1890ff' }} />
          </div>
          <div className="crm-title">
            <div className="crm-lead-label">
              {isAdmin ? 'Gestion des tâches' : 'Mes tâches'}
            </div>
            <div className="crm-lead-actions">
              <span className="crm-count">
                {pagination?.total || 0} tâche(s) au total
              </span>
            </div>
          </div>
        </div>

        <div className="crm-header-actions">
          <Button
            className="crm-btn"
            icon={<CalendarOutlined />}
            onClick={() => navigate('/tasks/calendar')}
          >
            Calendrier
          </Button>
          
        </div>
      </div>
      
      <Card className="crm-filter-card" style={{ marginBottom: '20px' }}>
        <Tabs activeKey={activeTab} onChange={handleTabChange} className="crm-tabs" style={{ marginBottom: '16px' }}>
          {isAdmin ? (
            <>
              <TabPane tab="Tâches créées par moi (admin)" key="created_by_admin" />
              <TabPane tab="Tâches créées par les autres" key="created_by_others" />
            </>
          ) : (
            <>
              <TabPane tab="Mes tâches créées" key="created" />
              <TabPane tab="Tâches qui me sont assignées" key="assigned" />
            </>
          )}
        </Tabs>
      
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
              placeholder="Statut"
              allowClear
              style={{ width: '100%', marginBottom: '10px' }}
              value={filters.status}
              onChange={value => handleFilterChange('status', value)}
            >
              <Option value="not_started">Non commencé</Option>
              <Option value="in_progress">En cours</Option>
              <Option value="completed">Terminé</Option>
              <Option value="waiting">En attente</Option>
              <Option value="deferred">Reporté</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={8} md={5} lg={4} xl={3}>
            <Select
              placeholder="Priorité"
              allowClear
              style={{ width: '100%', marginBottom: '10px' }}
              value={filters.priority}
              onChange={value => handleFilterChange('priority', value)}
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
              onChange={value => handleFilterChange('type', value)}
            >
              <Option value="call">Appel</Option>
              <Option value="meeting">Réunion</Option>
              <Option value="email_journal">Email</Option>
              <Option value="note">Note</Option>
              <Option value="todo">À faire</Option>
            </Select>
          </Col>

          <Col xs={24} sm={8} md={5} lg={4} xl={3}>
            <Select
              placeholder="Type d'entité"
              allowClear
              style={{ width: '100%', marginBottom: '10px' }}
              value={filters.entity_type}
              onChange={value => handleFilterChange('entity_type', value)}
            >
              <Option value="invite">Invité</Option>
              <Option value="prospect">Prospect</Option>
              <Option value="investor">Investisseur</Option>
              <Option value="projet">Projet</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={8} md={5} lg={4} xl={3}>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={handleSearch}
              className="crm-btn"
              style={{ marginBottom: '10px', marginRight: '10px' }}
            >
              Filtrer
            </Button>
            
            <Button
              icon={<ReloadOutlined />}
              onClick={handleResetFilters}
              className="crm-btn"
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
                onChange={value => handleFilterChange('sort_field', value)}
              >
                <Option value="start">Date d'échéance</Option>
                <Option value="created_at">Date de création</Option>
                <Option value="priority">Priorité</Option>
              </Select>
              
              <Select
                defaultValue="asc"
                style={{ width: 120 }}
                onChange={value => handleFilterChange('sort_direction', value)}
              >
                <Option value="asc">Ascendant</Option>
                <Option value="desc">Descendant</Option>
              </Select>
              
              <Button 
                icon={<SortAscendingOutlined />} 
                style={{ marginLeft: 8 }}
                onClick={handleSearch}
                className="crm-btn"
              >
                Appliquer
              </Button>
            </div>
          </Col>
        </Row>
      </Card>
      
      <Card className="crm-content-card">
        <Table 
          columns={columns} 
          dataSource={items || []}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination?.current_page || 1,
            pageSize: pagination?.per_page || 10,
            total: pagination?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} tâches`,
          }}
          onChange={handleTableChange}
          className="crm-table"
          rowClassName={(record) => {
            if (record.status === 'completed') return 'task-completed';
            if (record.status !== 'completed' && moment(record.start).isBefore(moment(), 'day')) return 'task-overdue';
            return '';
          }}
        />
      </Card>

      <style jsx>{`
        .crm-container {
          background-color: #f0f2f5;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
          border-radius: 4px 4px 0 0;
          margin-bottom: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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
        
        .crm-lead-actions {
          display: flex;
          font-size: 13px;
          color: #888;
        }
        
        .crm-btn {
          border-radius: 3px;
          transition: all 0.2s ease;
        }
        
        .crm-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        
        .crm-filter-card, .crm-content-card {
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        
        .crm-tabs .ant-tabs-tab {
          padding: 8px 16px;
        }
        
        .crm-table .ant-table-thead > tr > th {
          background-color: #fafafa;
          font-weight: 600;
        }
        
        .task-completed td {
          color: #8c8c8c;
          background-color: #f9f9f9;
        }
        
        .task-overdue {
          background-color: #fff1f0;
        }
        
        .task-title-cell {
          max-width: 300px;
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
          
          .crm-table .ant-table {
            width: 100%;
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default TasksList;