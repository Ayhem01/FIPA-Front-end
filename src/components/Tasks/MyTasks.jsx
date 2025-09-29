import React, { useEffect, useState } from 'react';
import { 
  Table, Button, Space, Tag, Badge, Input, Select, DatePicker, 
  Tabs, Avatar, Typography, message, Tooltip, Dropdown, Menu 
} from 'antd';
import { 
  PlusOutlined, FilterOutlined, ReloadOutlined, EllipsisOutlined,
  ProjectOutlined, SearchOutlined, CalendarOutlined, UserOutlined,
  EyeOutlined, EditOutlined, DeleteOutlined, CheckOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getMyTasks, deleteTask } from '../../features/taskSlice';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Option } = Select;

const MyTasks = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [activeTab, setActiveTab] = useState('all');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState({
    status: undefined,
    priority: undefined,
    search: '',
    start_date: null,
    end_date: null,
    assignee_id: undefined,
    page: 1,
    per_page: 10
  });
  
  // Redux state
  const { items: tasks, pagination, loading, error } = useSelector(state => state.tasks.myTasks);
  
  useEffect(() => {
    loadTasks();
  }, [filters, activeTab]);
  
  const loadTasks = () => {
    // Préparer les filtres avec le statut de l'onglet actif
    const apiFilters = { ...filters };
    if (activeTab !== 'all') {
      apiFilters.status = activeTab;
    }
    
    dispatch(getMyTasks(apiFilters))
      .unwrap()
      .then(() => {
        console.log('Tâches chargées avec succès');
      })
      .catch(error => {
        message.error('Erreur lors du chargement des tâches');
      });
  };
  
  const handleTabChange = (key) => {
    setActiveTab(key);
    // Réinitialiser la page
    setFilters(prev => ({
      ...prev,
      page: 1
    }));
  };
  
  const handleSearch = (value) => {
    setFilters(prev => ({
      ...prev,
      search: value,
      page: 1
    }));
  };
  
  const handleTableChange = (pagination, filters, sorter) => {
    setFilters(prev => ({
      ...prev,
      page: pagination.current,
      per_page: pagination.pageSize
    }));
  };
  
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1
    }));
  };
  
  const handleResetFilters = () => {
    setFilters({
      status: undefined,
      priority: undefined,
      search: '',
      start_date: null,
      end_date: null,
      assignee_id: undefined,
      page: 1,
      per_page: 10
    });
  };
  
  const handleAddTask = () => {
    navigate('/tasks/create');
  };
  
  const handleViewTask = (id) => {
    navigate(`/tasks/${id}`);
  };
  
  const handleEditTask = (id) => {
    navigate(`/tasks/${id}/edit`);
  };
  
  const handleDeleteTask = (id) => {
    dispatch(deleteTask(id))
      .unwrap()
      .then(() => {
        message.success('Tâche supprimée avec succès');
        loadTasks();
      })
      .catch(error => {
        message.error('Erreur lors de la suppression de la tâche');
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
        return <Tag color="default"><ClockCircleOutlined /> À faire</Tag>;
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
  
  const columns = [
    {
      title: 'Titre',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space>
          {text}
          {record.priority && renderPriority(record.priority)}
        </Space>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: status => renderTaskStatus(status),
    },
    {
      title: 'Dates',
      dataIndex: 'dates',
      key: 'dates',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.start && (
            <Text type="secondary">
              <CalendarOutlined /> Début: {moment(record.start).format('DD/MM/YYYY')}
            </Text>
          )}
          {record.end && (
            <Text type="secondary">
              <CalendarOutlined /> Fin: {moment(record.end).format('DD/MM/YYYY')}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Assigné à',
      dataIndex: 'assignee',
      key: 'assignee',
      render: assignee => assignee ? (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} src={assignee.avatar} />
          {assignee.name}
        </Space>
      ) : 'Non assigné',
    },
    {
      title: 'Entité',
      dataIndex: 'entity_type',
      key: 'entity_type',
      render: (entity_type, record) => {
        let entityName = '';
        let entityType = '';
        
        switch (entity_type) {
          case 'invite':
            entityName = 'Lead';
            entityType = 'Invité';
            break;
          case 'prospect':
            entityName = 'Prospect';
            entityType = 'Prospect';
            break;
          case 'project':
            entityName = 'Projet';
            entityType = 'Projet';
            break;
          default:
            entityName = 'Autre';
            entityType = entity_type || 'Non défini';
        }
        
        return (
          <Space direction="vertical" size="small">
            <Tag>{entityType}</Tag>
            {record.entity_name && <Text type="secondary">{record.entity_name}</Text>}
          </Space>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => handleViewTask(record.id)}
          />
          <Button 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEditTask(record.id)}
          />
          <Dropdown 
            overlay={
              <Menu>
                <Menu.Item 
                  key="delete" 
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteTask(record.id)}
                >
                  Supprimer
                </Menu.Item>
              </Menu>
            }
          >
            <Button size="small" icon={<EllipsisOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div className="crm-container">
      <div className="crm-header">
        <div className="crm-lead-info">
          <div className="crm-avatar">
            <Avatar icon={<ProjectOutlined />} size={42} style={{ backgroundColor: '#1890ff' }} />
          </div>
          <div className="crm-title">
            <div className="crm-lead-label">Mes tâches</div>
            <div className="crm-lead-actions">
              <span className="crm-count">{pagination?.total || 0} tâche(s) au total</span>
            </div>
          </div>
        </div>

        <div className="crm-header-actions">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddTask}
            className="crm-btn"
          >
            Nouvelle tâche
          </Button>
          <Button
            icon={<FilterOutlined />}
            onClick={() => setFiltersVisible(!filtersVisible)}
            className={`crm-btn ${filtersVisible ? 'crm-btn-active' : ''}`}
          >
            Filtres
          </Button>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleResetFilters}
            className="crm-btn"
          >
            Réinitialiser
          </Button>
        </div>
      </div>

      {filtersVisible && (
        <div className="crm-filters-container">
          <Space wrap>
            <Input
              placeholder="Rechercher..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            
            <Select
              placeholder="Priorité"
              style={{ width: 120 }}
              value={filters.priority}
              onChange={value => handleFilterChange('priority', value)}
              allowClear
            >
              <Option value="urgent">Urgente</Option>
              <Option value="high">Haute</Option>
              <Option value="normal">Normale</Option>
              <Option value="low">Basse</Option>
            </Select>
            
            <DatePicker
              placeholder="Date début"
              value={filters.start_date ? moment(filters.start_date) : null}
              onChange={date => handleFilterChange('start_date', date ? date.format('YYYY-MM-DD') : null)}
            />
            
            <DatePicker
              placeholder="Date fin"
              value={filters.end_date ? moment(filters.end_date) : null}
              onChange={date => handleFilterChange('end_date', date ? date.format('YYYY-MM-DD') : null)}
            />
          </Space>
        </div>
      )}

      <div className="crm-tabs-container">
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="Toutes" key="all" />
          <TabPane tab="À faire" key="todo" />
          <TabPane tab="En cours" key="in_progress" />
          <TabPane tab="Terminées" key="completed" />
          <TabPane tab="En attente" key="waiting" />
        </Tabs>
      </div>

      <div className="crm-content">
        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current: filters.page,
            pageSize: filters.per_page,
            total: pagination?.total || 0,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} tâches`
          }}
          className="crm-table"
        />
      </div>

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
        
        .crm-lead-actions {
          display: flex;
          font-size: 13px;
          color: #888;
        }
        
        .crm-count {
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
        
        .crm-btn-active {
          background-color: #e6f7ff;
          border-color: #1890ff;
        }
        
        .crm-filters-container {
          background-color: white;
          padding: 16px 20px;
          border-bottom: 1px solid #e8e8e8;
        }
        
        .crm-tabs-container {
          background-color: white;
          padding: 0 20px;
        }
        
        .crm-content {
          background-color: white;
          padding: 20px;
        }
        
        .crm-table {
          margin-top: 8px;
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
        }
      `}</style>
    </div>
  );
};

export default MyTasks;