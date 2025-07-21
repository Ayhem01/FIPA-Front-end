import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Badge, 
  Tooltip, 
  Dropdown, 
  Menu, 
  Modal, 
  Input,
  Select,
  DatePicker,
  Empty,
  Typography
} from 'antd';
import { 
  PlusOutlined, 
  ClockCircleOutlined, 
  CheckOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  FilterOutlined,
  SortAscendingOutlined
} from '@ant-design/icons';
import moment from 'moment';
import TaskCreateModal from '../Tasks/TaskCreateModal';
import { 
  fetchProjectTasks, 
  updateTaskStatus, 
  deleteTask,
  getAuthHeader
} from '../../features/taskSlice';
import axios from 'axios';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;
const { confirm } = Modal;

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const ProjectTasksTab = () => {
  const { id: projectId } = useParams();
  const dispatch = useDispatch();
  
  // États locaux
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all'
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Récupérer les tâches et l'état depuis Redux
  const { tasks, loading, error } = useSelector(state => state.tasks.projectTasks);
  
  // Récupérer les détails du projet
  const { data: projectData } = useSelector(state => state.projects.selectedProject);
  
  // Récupérer la liste des utilisateurs directement
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/users`, getAuthHeader());
        setUsersList(response.data.data || []);
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs:", error);
      } finally {
        setLoadingUsers(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Récupérer les tâches liées au projet
  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectTasks(projectId));
    }
  }, [dispatch, projectId]);
  
  // Filtrer les tâches
  const getFilteredTasks = () => {
    if (!tasks) return [];
    
    return tasks.filter(task => {
      // Recherche par texte
      const matchesSearch = searchText 
        ? task.title.toLowerCase().includes(searchText.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchText.toLowerCase()))
        : true;
      
      // Filtre par statut
      const matchesStatus = filters.status === 'all' 
        ? true 
        : task.status === filters.status;
      
      // Filtre par priorité
      const matchesPriority = filters.priority === 'all' 
        ? true 
        : task.priority === filters.priority;
      
      // Filtre par assigné
      const matchesAssignee = filters.assignee === 'all' 
        ? true 
        : task.assigned_to === parseInt(filters.assignee);
      
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });
  };
  
  // Gérer le changement de statut d'une tâche
  const handleStatusChange = (taskId, newStatus) => {
    dispatch(updateTaskStatus({ id: taskId, status: newStatus }))
      .then(() => {
        // Rafraîchir les tâches après mise à jour
        dispatch(fetchProjectTasks(projectId));
      });
  };
  
  // Gérer la suppression d'une tâche
  const handleDeleteTask = (taskId) => {
    confirm({
      title: 'Êtes-vous sûr de vouloir supprimer cette tâche?',
      icon: <ExclamationCircleOutlined />,
      content: 'Cette action ne peut pas être annulée',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk() {
        dispatch(deleteTask(taskId))
          .then(() => {
            // Rafraîchir les tâches après suppression
            dispatch(fetchProjectTasks(projectId));
          });
      }
    });
  };
  
  // Modifier une tâche existante
  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskModalVisible(true);
  };
  
  // Colonnes du tableau
  const columns = [
    {
      title: 'Titre',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space>
          <Badge 
            status={
              record.status === 'completed' ? 'success' :
              record.status === 'in_progress' ? 'processing' :
              record.status === 'pending' ? 'default' :
              record.status === 'overdue' ? 'error' : 'warning'
            } 
          />
          <Text 
            style={{ 
              textDecoration: record.status === 'completed' ? 'line-through' : 'none',
              fontWeight: record.priority === 'high' ? 'bold' : 'normal'
            }}
          >
            {text}
          </Text>
        </Space>
      )
    },
    {
      title: 'Priorité',
      dataIndex: 'priority',
      key: 'priority',
      render: priority => (
        <Tag color={
          priority === 'high' ? 'red' : 
          priority === 'medium' ? 'orange' : 
          'green'
        }>
          {priority === 'high' ? 'Haute' : 
           priority === 'medium' ? 'Moyenne' : 
           'Basse'}
        </Tag>
      )
    },
    {
      title: 'Date d\'échéance',
      dataIndex: 'due_date',
      key: 'due_date',
      render: date => date ? moment(date).format('DD/MM/YYYY') : 'Non définie'
    },
    {
      title: 'Assigné à',
      dataIndex: 'assigned_to',
      key: 'assigned_to',
      render: (userId) => {
        if (!userId) return 'Non assigné';
        
        const user = usersList.find(u => u.id === userId);
        return user ? `${user.name}` : `Utilisateur #${userId}`;
      }
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color, text;
        switch(status) {
          case 'pending':
            color = 'default';
            text = 'En attente';
            break;
          case 'in_progress':
            color = 'processing';
            text = 'En cours';
            break;
          case 'completed':
            color = 'success';
            text = 'Terminée';
            break;
          case 'overdue':
            color = 'error';
            text = 'En retard';
            break;
          default:
            color = 'default';
            text = status;
        }
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Dropdown 
          overlay={
            <Menu>
              <Menu.Item 
                key="edit" 
                icon={<EditOutlined />}
                onClick={() => handleEditTask(record)}
              >
                Modifier
              </Menu.Item>
              <Menu.SubMenu key="status" title="Changer le statut" icon={<ClockCircleOutlined />}>
                <Menu.Item 
                  key="pending"
                  onClick={() => handleStatusChange(record.id, 'pending')}
                  disabled={record.status === 'pending'}
                >
                  En attente
                </Menu.Item>
                <Menu.Item 
                  key="in_progress"
                  onClick={() => handleStatusChange(record.id, 'in_progress')}
                  disabled={record.status === 'in_progress'}
                >
                  En cours
                </Menu.Item>
                <Menu.Item 
                  key="completed"
                  onClick={() => handleStatusChange(record.id, 'completed')}
                  disabled={record.status === 'completed'}
                >
                  Terminée
                </Menu.Item>
              </Menu.SubMenu>
              <Menu.Item 
                key="delete" 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteTask(record.id)}
              >
                Supprimer
              </Menu.Item>
            </Menu>
          } 
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];
  
  // Fermer et réinitialiser le modal
  const handleCloseModal = () => {
    setTaskModalVisible(false);
    setEditingTask(null);
  };
  
  // Gestionnaire après création/édition de tâche
  const handleTaskSaved = () => {
    handleCloseModal();
    dispatch(fetchProjectTasks(projectId));
  };
  
  // Générer les options du filtre pour les utilisateurs assignés
  const generateAssigneeFilterOptions = () => {
    if (loadingUsers) {
      return [<Menu.Item key="loading" disabled>Chargement...</Menu.Item>];
    }
    
    return [
      <Menu.Item key="all-assignee" onClick={() => setFilters({...filters, assignee: 'all'})}>
        Tous
      </Menu.Item>,
      ...usersList.map(user => (
        <Menu.Item 
          key={`assignee-${user.id}`} 
          onClick={() => setFilters({...filters, assignee: user.id})}
        >
          {user.name}
        </Menu.Item>
      ))
    ];
  };
  
  return (
    <div className="project-tasks-container">
      <Card 
        title={
          <Space>
            <Title level={4}>Tâches du projet</Title>
            {projectData && (
              <Text type="secondary">({projectData.title})</Text>
            )}
          </Space>
        }
        extra={
          <Space>
            <Search
              placeholder="Rechercher une tâche"
              allowClear
              onSearch={value => setSearchText(value)}
              style={{ width: 200 }}
            />
            <Dropdown 
              overlay={
                <Menu>
                  <Menu.SubMenu title="Statut" key="status">
                    <Menu.Item key="all-status" onClick={() => setFilters({...filters, status: 'all'})}>
                      Tous
                    </Menu.Item>
                    <Menu.Item key="pending" onClick={() => setFilters({...filters, status: 'pending'})}>
                      En attente
                    </Menu.Item>
                    <Menu.Item key="in_progress" onClick={() => setFilters({...filters, status: 'in_progress'})}>
                      En cours
                    </Menu.Item>
                    <Menu.Item key="completed" onClick={() => setFilters({...filters, status: 'completed'})}>
                      Terminées
                    </Menu.Item>
                    <Menu.Item key="overdue" onClick={() => setFilters({...filters, status: 'overdue'})}>
                      En retard
                    </Menu.Item>
                  </Menu.SubMenu>
                  <Menu.SubMenu title="Priorité" key="priority">
                    <Menu.Item key="all-priority" onClick={() => setFilters({...filters, priority: 'all'})}>
                      Toutes
                    </Menu.Item>
                    <Menu.Item key="high" onClick={() => setFilters({...filters, priority: 'high'})}>
                      Haute
                    </Menu.Item>
                    <Menu.Item key="medium" onClick={() => setFilters({...filters, priority: 'medium'})}>
                      Moyenne
                    </Menu.Item>
                    <Menu.Item key="low" onClick={() => setFilters({...filters, priority: 'low'})}>
                      Basse
                    </Menu.Item>
                  </Menu.SubMenu>
                  <Menu.SubMenu title="Assigné à" key="assignee">
                    {generateAssigneeFilterOptions()}
                  </Menu.SubMenu>
                </Menu>
              } 
              trigger={['click']}
            >
              <Button icon={<FilterOutlined />}>Filtres</Button>
            </Dropdown>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setTaskModalVisible(true)}
            >
              Nouvelle tâche
            </Button>
          </Space>
        }
      >
        {loading ? (
          <div className="loading-container">
            Chargement des tâches...
          </div>
        ) : error ? (
          <div className="error-container">
            Une erreur est survenue: {error}
          </div>
        ) : getFilteredTasks().length === 0 ? (
          <Empty 
            description="Aucune tâche à afficher" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Table 
            columns={columns} 
            dataSource={getFilteredTasks().map(task => ({ ...task, key: task.id }))} 
            pagination={{ pageSize: 10 }}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys),
              selections: [
                Table.SELECTION_ALL,
                Table.SELECTION_INVERT,
                {
                  key: 'complete-selected',
                  text: 'Marquer les sélectionnés comme terminés',
                  onSelect: () => {
                    if (selectedRowKeys.length > 0) {
                      // Appeler l'API pour mettre à jour les statuts en batch
                      Promise.all(
                        selectedRowKeys.map(taskId => 
                          dispatch(updateTaskStatus({ id: taskId, status: 'completed' }))
                        )
                      ).then(() => {
                        setSelectedRowKeys([]);
                        dispatch(fetchProjectTasks(projectId));
                      });
                    }
                  }
                }
              ]
            }}
          />
        )}
      </Card>
      
      <TaskCreateModal 
        visible={taskModalVisible} 
        onCancel={handleCloseModal}
        onTaskSaved={handleTaskSaved}
        editTask={editingTask}
        projectId={projectId}
      />
    </div>
  );
};

export default ProjectTasksTab;