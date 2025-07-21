import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Space,
  Button,
  Input,
  Tag,
  Dropdown,
  Menu,
  Modal,
  Card,
  message,
  Row,
  Col,
  Select,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  FilterOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { fetchInvites, deleteInvite, updateInviteStatus, setFilters } from '../../features/inviteSlice';

const { confirm } = Modal;
const { Option } = Select;

const InvitesList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { 
    items: invites, 
    loading, 
    error, 
    pagination, 
    filters,
    operation 
  } = useSelector(state => state.invites);
  
  // const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Charger les invités au chargement et lors des changements de filtres/pagination
  useEffect(() => {
    const params = {
      page: currentPage,
      per_page: pageSize,
      ...filters
    };
    dispatch(fetchInvites(params));
  }, [dispatch, currentPage, pageSize, filters]);

  // Gestion des succès/erreurs d'opération
  useEffect(() => {
    if (operation.success && operation.type === 'delete') {
      message.success('Invité supprimé avec succès');
    } else if (operation.success && operation.type === 'update_status') {
      message.success('Statut mis à jour avec succès');
    } else if (operation.error) {
      message.error(operation.error);
    }
  }, [operation]);

  // Fonction pour ouvrir la confirmation de suppression
  const showDeleteConfirm = (id, name) => {
    confirm({
      title: `Êtes-vous sûr de vouloir supprimer l'invité ${name}?`,
      icon: <ExclamationCircleOutlined />,
      content: 'Cette action est irréversible.',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk() {
        dispatch(deleteInvite(id));
      }
    });
  };

  // Changer le statut d'un invité
  const handleStatusChange = (id, newStatus) => {
    dispatch(updateInviteStatus({ id, statut: newStatus }));
  };

  // Navigation pour créer/éditer
  const handleAddNew = () => {
    navigate('/invites/create');
  };

  const handleEdit = (id) => {
    navigate(`/invites/${id}/edit`);
  };

  const handleView = (id) => {
    navigate(`/invites/${id}`);
  };

  // Filtres
  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value }));
    setCurrentPage(1);
  };

  // Pagination
  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  // Rendu du statut avec un tag coloré
  const renderStatus = (statut) => {
    let color, text;
    switch (statut) {
      case 'en_attente':
        color = 'gold';
        text = 'En attente';
        break;
      case 'confirmee':
        color = 'green';
        text = 'Confirmé';
        break;
      case 'refusee':
        color = 'red';
        text = 'Décliné';
        break;
      case 'participation_confirmee':
        color = 'blue';
        text = 'A participé';
        break;
      case 'absente':
        color = 'volcano';
        text = 'Absent';
        break;
      default:
        color = 'default';
        text = statut || 'Inconnu';
    }
    return <Tag color={color}>{text}</Tag>;
  };

  // Colonnes du tableau
  const columns = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      render: (text, record) => (
        <a onClick={() => handleView(record.id)}>
          {record.nom} {record.prenom}
        </a>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Entreprise',
      key: 'entreprise',
      render: (_, record) => record.entreprise?.nom || ''
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => record.action?.nom || ''
    },
    {
      title: 'Étape',
      key: 'etape',
      render: (_, record) => record.etape?.nom || ''
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: renderStatus,
      filterDropdown: () => (
        <Menu>
          <Menu.Item key="all" onClick={() => handleFilterChange('statut', undefined)}>
            Tous
          </Menu.Item>
          <Menu.Item key="en_attente" onClick={() => handleFilterChange('statut', 'en_attente')}>
            En attente
          </Menu.Item>
          <Menu.Item key="confirmee" onClick={() => handleFilterChange('statut', 'confirmee')}>
            Confirmé
          </Menu.Item>
          <Menu.Item key="refusee" onClick={() => handleFilterChange('statut', 'refusee')}>
            Décliné
          </Menu.Item>
          <Menu.Item key="participation_confirmee" onClick={() => handleFilterChange('statut', 'participation_confirmee')}>
            A participé
          </Menu.Item>
          <Menu.Item key="absente" onClick={() => handleFilterChange('statut', 'absente')}>
            Absent
          </Menu.Item>
        </Menu>
      )
    },
    {
      title: 'Date d\'invitation',
      dataIndex: 'date_invitation',
      key: 'date_invitation',
      render: (text) => text ? new Date(text).toLocaleString() : ''
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="view" icon={<EyeOutlined />} onClick={() => handleView(record.id)}>
                Voir
              </Menu.Item>
              <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEdit(record.id)}>
                Modifier
              </Menu.Item>
              <Menu.Divider />
              <Menu.SubMenu key="status" title="Changer le statut" icon={<FilterOutlined />}>
                <Menu.Item 
                  key="confirmee" 
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, 'confirmee')}
                  disabled={record.statut === 'confirmee'}
                >
                  Confirmé
                </Menu.Item>
                <Menu.Item 
                  key="refusee" 
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, 'refusee')}
                  disabled={record.statut === 'refusee'}
                >
                  Décliné
                </Menu.Item>
                <Menu.Item 
                  key="participation_confirmee" 
                  onClick={() => handleStatusChange(record.id, 'participation_confirmee')}
                  disabled={record.statut === 'participation_confirmee'}
                >
                  A participé
                </Menu.Item>
                <Menu.Item 
                  key="absente" 
                  onClick={() => handleStatusChange(record.id, 'absente')}
                  disabled={record.statut === 'absente'}
                >
                  Absent
                </Menu.Item>
                <Menu.Item 
                  key="en_attente" 
                  icon={<QuestionCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, 'en_attente')}
                  disabled={record.statut === 'en_attente'}
                >
                  En attente
                </Menu.Item>
              </Menu.SubMenu>
              <Menu.Divider />
              <Menu.Item 
                key="delete" 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => showDeleteConfirm(record.id, record.nom)}
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

  return (
    <Card 
      title="Liste des invités" 
      extra={
        <Space>
          {/* <Input.Search
            placeholder="Rechercher un invité..."
            onSearch={handleSearch}
            style={{ width: 250 }}
            allowClear
          /> */}
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddNew}
          >
            Nouvel invité
          </Button>
        </Space>
      }
    >
      {error && <div className="error-message">{error}</div>}
      
      <Table
        columns={columns}
        dataSource={invites}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} invités`
        }}
        onChange={handleTableChange}
      />
    </Card>
  );
};

export default InvitesList;