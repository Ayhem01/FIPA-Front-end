import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, Button, Card, message, Pagination, Select, Tabs, Alert, Spin } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, deleteTask, resetTaskOperation } from '../../features/taskSlice';
import { getCurrentUser } from '../../features/userSlice';

const { Option } = Select;
const { TabPane } = Tabs;

const TasksList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items = [], pagination, loading, error } = useSelector(state => state.tasks.tasks);
  const { loading: operationLoading, success: operationSuccess } = useSelector(state => state.tasks.taskOperation);
  const currentUser = useSelector(state => state.user.user);
  const authLoading = useSelector(state => state.user.loading);

  const [filters, setFilters] = useState({
    status: undefined,
    priority: undefined,
    type: undefined,
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
  }, [dispatch, filters, currentUser, isAdmin, activeTab]);

  useEffect(() => {
    if (operationSuccess) {
      dispatch(resetTaskOperation());
      loadTasks();
    }
  }, [operationSuccess, dispatch]);

  const handleEditTask = (task) => navigate(`/tasks/edit/${task.id}`);
  const handleViewTask = (task) => navigate(`/tasks/details/${task.id}`);
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
  const handlePageChange = (page, pageSize) => setFilters({ ...filters, page, per_page: pageSize });
  const handleTabChange = (key) => {
    setActiveTab(key);
    setFilters({ ...filters, page: 1 });
  };

  const getStatusTag = (status) => {
    const colors = { not_started: 'orange', in_progress: 'blue', completed: 'green', deferred: 'purple', waiting: 'cyan' };
    const labels = { not_started: 'Non commencé', in_progress: 'En cours', completed: 'Terminé', deferred: 'Reporté', waiting: 'En attente' };
    return <Tag color={colors[status] || 'default'}>{labels[status] || status}</Tag>;
  };

  const getPriorityTag = (priority) => {
    const colors = { low: 'green', normal: 'blue', high: 'orange', urgent: 'red' };
    const labels = { low: 'Basse', normal: 'Normale', high: 'Haute', urgent: 'Urgente' };
    return priority ? <Tag color={colors[priority]}>{labels[priority]}</Tag> : null;
  };

  const baseColumns = [
    {
      title: 'Titre', dataIndex: 'title', key: 'title',
      render: (text, record) => <a onClick={() => handleViewTask(record)}>{text}</a>
    },
    {
      title: 'Type', dataIndex: 'type', key: 'type',
      render: type => ({ call: 'Appel', meeting: 'Réunion', email_journal: 'Email', note: 'Note', todo: 'À faire' }[type] || type)
    },
    { title: 'Statut', dataIndex: 'status', key: 'status', render: getStatusTag },
    { title: 'Priorité', dataIndex: 'priority', key: 'priority', render: getPriorityTag },
    {
      title: 'Date début', dataIndex: 'start', key: 'start',
      render: date => date ? moment(date).format('DD/MM/YYYY HH:mm') : 'N/A'
    },
  ];

  const conditionalColumn = isAdmin
    ? activeTab === 'created_by_others'
      ? {
        title: 'Créé par',
        dataIndex: 'user',
        key: 'user',
        render: (_, record) => record.user?.name || 'Inconnu'
      }
      : {
        title: 'Assigné à',
        dataIndex: 'assignee',
        key: 'assignee',
        render: (_, record) => record.assignee?.name || 'Non assigné'
      }

    : null;

  const actionsColumn = {
    title: 'Actions', key: 'action',
    render: (_, record) => (
       <Space size="small">
      {/* Bouton Détail - toujours affiché */}
      <Button 
        icon={<EyeOutlined />} 
        onClick={() => handleViewTask(record)} 
      />
      
      {/* Bouton Modifier - masqué pour les admins dans l'onglet 'created_by_others' */}
      {!(isAdmin && activeTab === 'created_by_others') && (
        <Button 
          icon={<EditOutlined />} 
          onClick={() => handleEditTask(record)} 
        />
      )}
      
      {/* Bouton Supprimer - toujours affiché */}
      <Button 
        icon={<DeleteOutlined />} 
        danger 
        loading={operationLoading && record.id === operationTargetId} 
        onClick={() => handleDeleteTask(record.id)} 
      />
    </Space>
    )
  };

  const columns = [
    ...baseColumns,
    ...(conditionalColumn ? [conditionalColumn] : []),
    ...(!(isResponsableFipa && activeTab === 'assigned') ? [actionsColumn] : [])
  ];

  if (error) return <Alert message="Erreur" description={error} type="error" showIcon />;
  if (!currentUser && authLoading) return <Spin size="large" tip="Chargement utilisateur..." />;
  if (!currentUser && !authLoading) return <Alert message="Non connecté" description="Veuillez vous reconnecter." type="warning" showIcon />;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2>{isAdmin ? 'Gestion des tâches' : 'Mes tâches'}</h2>
        <Space>
          <Button icon={<CalendarOutlined />} onClick={() => navigate('/tasks/calendar')}>Calendrier</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTask}>Nouvelle tâche</Button>
        </Space>
      </div>

      <Tabs activeKey={activeTab} onChange={handleTabChange} style={{ marginBottom: 20 }}>
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

      <Space wrap style={{ marginBottom: 20 }}>
        <Select placeholder="Statut" style={{ width: 150 }} allowClear onChange={val => handleFilterChange('status', val)}>
          <Option value="not_started">Non commencé</Option>
          <Option value="in_progress">En cours</Option>
          <Option value="completed">Terminé</Option>
          <Option value="deferred">Reporté</Option>
          <Option value="waiting">En attente</Option>
        </Select>
        <Select placeholder="Priorité" style={{ width: 150 }} allowClear onChange={val => handleFilterChange('priority', val)}>
          <Option value="low">Basse</Option>
          <Option value="normal">Normale</Option>
          <Option value="high">Haute</Option>
          <Option value="urgent">Urgente</Option>
        </Select>
        <Select placeholder="Type" style={{ width: 150 }} allowClear onChange={val => handleFilterChange('type', val)}>
          <Option value="call">Appel</Option>
          <Option value="meeting">Réunion</Option>
          <Option value="email_journal">Email</Option>
          <Option value="note">Note</Option>
          <Option value="todo">À faire</Option>
        </Select>
      </Space>

      <Card>
        <Table
          columns={columns}
          dataSource={items || []}
          rowKey="id"
          loading={loading}
          pagination={false}
          locale={{ emptyText: loading ? 'Chargement...' : 'Aucune tâche trouvée' }}
        />

        {pagination && (
          <div style={{ marginTop: 20, textAlign: 'right' }}>
            <Pagination
              current={pagination.current_page}
              pageSize={pagination.per_page}
              total={pagination.total}
              showSizeChanger
              showQuickJumper
              onChange={handlePageChange}
              onShowSizeChange={handlePageChange}
              showTotal={(total, range) => `${range[0]}-${range[1]} sur ${total} tâches`}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default TasksList;
