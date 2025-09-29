import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table, Tag, Space, Button, Modal, message, Tooltip,
  Badge, Select, Typography, Spin, Input
} from 'antd';
import {
  ExclamationCircleOutlined, 
  CheckCircleOutlined,
  EditOutlined, 
  DeleteOutlined,
  AlertOutlined,
  ArrowUpOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { fetchBlockages, deleteBlockage, resolveBlockage, resetOperation } from '../../features/blockageSlice';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;
const { confirm } = Modal;

const BlockageList = () => {
  const dispatch = useDispatch();
  const { items: blockages, loading, error, operation } = useSelector(state => state.blockages);
  const [filteredBlockages, setFilteredBlockages] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchBlockages());
  }, [dispatch]);

  useEffect(() => {
    if (operation.success) {
      switch (operation.type) {
        case 'delete':
          message.success('Blocage supprimé avec succès');
          break;
        case 'resolve':
          message.success('Blocage résolu avec succès');
          break;
        default:
          message.success('Opération réussie');
      }
      dispatch(resetOperation());
    } else if (operation.error) {
      message.error(`Erreur: ${operation.error}`);
      dispatch(resetOperation());
    }
  }, [operation, dispatch]);

  useEffect(() => {
    let result = [...blockages];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(item => item.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(item => item.blockage_type === typeFilter);
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(item => item.priority === priorityFilter);
    }
    
    // Apply search
    if (searchText) {
      const lowercasedSearch = searchText.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(lowercasedSearch) ||
        (item.description && item.description.toLowerCase().includes(lowercasedSearch))
      );
    }
    
    setFilteredBlockages(result);
  }, [blockages, searchText, statusFilter, typeFilter, priorityFilter]);

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleResolve = (id) => {
    confirm({
      title: 'Êtes-vous sûr de vouloir résoudre ce blocage?',
      icon: <ExclamationCircleOutlined />,
      content: 'Cette action marquera le blocage comme résolu.',
      onOk() {
        dispatch(resolveBlockage(id));
      },
    });
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Êtes-vous sûr de vouloir supprimer ce blocage?',
      icon: <ExclamationCircleOutlined />,
      content: 'Cette action est irréversible.',
      okType: 'danger',
      onOk() {
        dispatch(deleteBlockage(id));
      },
    });
  };

  const renderStatus = (status) => {
    const statusConfig = {
      actif: { color: 'blue', text: 'Actif' },
      resolu: { color: 'green', text: 'Résolu' },
      annule: { color: 'default', text: 'Annulé' },
    };
    
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const renderPriority = (priority) => {
    const priorityConfig = {
      low: { color: 'blue', text: 'Basse' },
      medium: { color: 'orange', text: 'Moyenne' },
      high: { color: 'volcano', text: 'Haute' },
      critical: { color: 'red', text: 'Critique' },
    };
    
    const config = priorityConfig[priority] || { color: 'default', text: priority };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const renderBlockageType = (type) => {
    const typeConfig = {
      process: { color: 'blue', text: 'Processus' },
      data: { color: 'cyan', text: 'Données' },
      technical: { color: 'orange', text: 'Technique' },
      other: { color: 'default', text: 'Autre' },
    };
    
    const config = typeConfig[type] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <Text strong>{text}</Text>
          {record.is_escalated && (
            <Badge 
              status="error" 
              text="Escaladé"
              style={{ fontSize: '12px' }}
            />
          )}
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: text => text || 'Pas de description',
      ellipsis: true,
    },
    {
      title: 'Type',
      dataIndex: 'blockage_type',
      key: 'blockage_type',
      render: renderBlockageType,
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: renderStatus,
    },
    {
      title: 'Priorité',
      dataIndex: 'priority',
      key: 'priority',
      render: renderPriority,
    },
    {
      title: 'Assigné à',
      dataIndex: 'assignedUser',
      key: 'assignedUser',
      render: user => user?.name || 'Non assigné',
    },
    {
      title: 'Créé le',
      dataIndex: 'created_at',
      key: 'created_at',
      render: date => moment(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'actif' && (
            <Tooltip title="Marquer comme résolu">
              <Button 
                icon={<CheckCircleOutlined />} 
                type="primary"
                size="small"
                onClick={() => handleResolve(record.id)}
              />
            </Tooltip>
          )}
          
          <Tooltip title="Modifier">
            <Button 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          
          <Tooltip title="Supprimer">
            <Button 
              icon={<DeleteOutlined />} 
              danger
              size="small"
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (loading && blockages.length === 0) {
    return <div className="loading-container"><Spin size="large" tip="Chargement des blocages..." /></div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <ExclamationCircleOutlined style={{ fontSize: 32, color: '#ff4d4f', marginBottom: 16 }} />
        <Text type="danger">{error}</Text>
      </div>
    );
  }

  return (
    <div className="blockage-list-container">
      <Title level={4}>Liste des blocages</Title>
      
      <div className="filter-container" style={{ marginBottom: 20 }}>
        <Space wrap>
          <Search
            placeholder="Rechercher un blocage"
            allowClear
            onSearch={handleSearch}
            style={{ width: 250 }}
          />
          
          <Select 
            defaultValue="all" 
            style={{ width: 120 }} 
            onChange={setStatusFilter}
          >
            <Option value="all">Tous les statuts</Option>
            <Option value="actif">Actifs</Option>
            <Option value="resolu">Résolus</Option>
            <Option value="annule">Annulés</Option>
          </Select>
          
          <Select 
            defaultValue="all" 
            style={{ width: 150 }} 
            onChange={setTypeFilter}
          >
            <Option value="all">Tous les types</Option>
            <Option value="process">Processus</Option>
            <Option value="data">Données</Option>
            <Option value="technical">Technique</Option>
            <Option value="other">Autre</Option>
          </Select>
          
          <Select 
            defaultValue="all" 
            style={{ width: 140 }} 
            onChange={setPriorityFilter}
          >
            <Option value="all">Toutes priorités</Option>
            <Option value="low">Basse</Option>
            <Option value="medium">Moyenne</Option>
            <Option value="high">Haute</Option>
            <Option value="critical">Critique</Option>
          </Select>
        </Space>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={filteredBlockages} 
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default BlockageList;