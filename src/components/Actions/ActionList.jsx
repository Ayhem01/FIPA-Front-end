import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Table, Card, Input, Button, Space, Tag, Row, Col, Select, 
  DatePicker, Tooltip, Divider, Typography, Dropdown, Menu, 
  Empty, Spin, Pagination, Radio
} from 'antd';
import {
  SearchOutlined, FilterOutlined, PlusOutlined, CalendarOutlined,
  EyeOutlined, EditOutlined, DeleteOutlined, DownloadOutlined,
  MoreOutlined, SortAscendingOutlined, ReloadOutlined, UserOutlined,
  GlobalOutlined, FileTextOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { fetchActions, deleteAction } from '../../features/marketingSlice';
import moment from 'moment';
import '../../../src/assets/styles/action-list.css';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ActionList = () => {
  const dispatch = useDispatch();
  const { items: actionsData, loading } = useSelector((state) => state.marketing.actions || { items: [] });
  
  // États pour la recherche, les filtres et la pagination
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    statut: '',
    periode: '',
    responsable_id: '',
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [sortParams, setSortParams] = useState({
    sort_by: 'date_debut',
    sort_direction: 'asc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Extraction des données paginées
  const actions = actionsData?.data || [];
  
  // Récupérer le total à partir de la réponse
  useEffect(() => {
    if (actionsData && actionsData.total) {
      setPagination(prev => ({
        ...prev,
        total: actionsData.total
      }));
    }
  }, [actionsData]);

  // Fetch actions avec les paramètres actuels
  const fetchActionsList = () => {
    const params = {
      page: pagination.current,
      per_page: pagination.pageSize,
      ...sortParams,
      ...filters
    };
    
    // Ajouter le terme de recherche si présent
    if (searchText) {
      params.nom = searchText;
    }
    
    dispatch(fetchActions(params));
  };

  // Charger les actions au montage et quand les paramètres changent
  useEffect(() => {
    fetchActionsList();
  }, [pagination.current, pagination.pageSize, sortParams, filters]);

  // Gestion de la recherche
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 })); // Revenir à la première page
    fetchActionsList();
  };

  // Gestion des filtres
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, current: 1 })); // Revenir à la première page
  };

  // Réinitialiser les filtres
  const clearFilters = () => {
    setFilters({
      type: '',
      statut: '',
      periode: '',
      responsable_id: ''
    });
    setSearchText('');
    setPagination(prev => ({ ...prev, current: 1 })); // Revenir à la première page
  };

  // Gestion de la suppression
  const handleDeleteAction = async (id) => {
    try {
      await dispatch(deleteAction(id)).unwrap();
      fetchActionsList(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  // Suppression groupée
  const handleBatchDelete = async () => {
    try {
      for (const id of selectedRowKeys) {
        await dispatch(deleteAction(id)).unwrap();
      }
      setSelectedRowKeys([]);
      fetchActionsList(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors de la suppression multiple:', error);
    }
  };

  // Gestion du changement de page
  const handleTableChange = (pagination, filters, sorter) => {
    setPagination({
      ...pagination,
      current: pagination.current
    });

    if (sorter && sorter.field) {
      setSortParams({
        sort_by: sorter.field,
        sort_direction: sorter.order === 'ascend' ? 'asc' : 'desc'
      });
    }
  };

  // Utilitaires pour l'affichage
  const getStatusColor = (status) => {
    const statusMap = {
      'planifiee': 'blue',
      'terminee': 'green',
      'annulee': 'red',
      'reportee': 'orange',
    };
    return statusMap[status] || 'default';
  };

  const getTypeIcon = (type) => {
    const typeIconMap = {
      'media': <GlobalOutlined />,
      'cte': <CalendarOutlined />,
      'salon': <FileTextOutlined />,
      'delegation': <UserOutlined />,
      'seminaire_jipays': <CalendarOutlined />,
      'demarchage_direct': <UserOutlined />,
      'salon_sectoriel': <FileTextOutlined />,
      'seminaire_jisecteur': <CalendarOutlined />,
      'visite_entreprise': <UserOutlined />,
    };
    return typeIconMap[type] || <FileTextOutlined />;
  };

  const formatType = (type) => {
    const typeLabels = {
      'media': 'Media',
      'cte': 'CTE',
      'salon': 'Salon',
      'delegation': 'Délégation',
      'seminaire_jipays': 'Séminaire',
      'demarchage_direct': 'Démarchage Direct',
      'salon_sectoriel': 'Salon Sectoriel',
      'seminaire_jisecteur': 'Séminaire Secteur',
      'visite_entreprise': 'Visite Entreprise',
    };
    return typeLabels[type] || type;
  };

  const formatStatus = (status) => {
    const statusLabels = {
      'planifiee': 'Planifiée',
      'terminee': 'Terminée',
      'annulee': 'Annulée',
      'reportee': 'Reportée',
    };
    return statusLabels[status] || status;
  };

  // Définition des colonnes du tableau
  const columns = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      sorter: true, // Tri géré par le backend
      render: (text, record) => (
        <div className="action-name">
          <Link to={`/actions/${record.id}`}>{text}</Link>
          {record.description && (
            <Tooltip title={record.description}>
              <InfoCircleOutlined style={{ marginLeft: 8, color: '#8c8c8c' }} />
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      sorter: true,
      render: (type) => (
        <Tag icon={getTypeIcon(type)} color="#004165">
          {formatType(type)}
        </Tag>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      sorter: true,
      render: (statut) => (
        <Tag color={getStatusColor(statut)}>
          {formatStatus(statut)}
        </Tag>
      ),
    },
    {
      title: 'Date début',
      dataIndex: 'date_debut',
      key: 'date_debut',
      sorter: true,
      render: (date) => date ? moment(date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Responsable',
      dataIndex: 'responsable',
      key: 'responsable',
      render: (responsable) => responsable ? responsable.name : '-',
    },
    {
      title: 'Lieu',
      dataIndex: 'lieu',
      key: 'lieu',
      render: (text, record) => {
        const location = [];
        if (text) location.push(text);
        if (record.ville) location.push(record.ville);
        if (record.pays) location.push(record.pays);
        
        return location.length ? location.join(', ') : '-';
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Voir les détails">
            <Link to={`/actions/${record.id}`}>
              <Button type="text" icon={<EyeOutlined />} className="action-button view" />
            </Link>
          </Tooltip>
          <Tooltip title="Modifier">
            <Link to={`/actions/edit/${record.id}`}>
              <Button type="text" icon={<EditOutlined />} className="action-button edit" />
            </Link>
          </Tooltip>
          <Tooltip title="Supprimer">
            <Button 
              type="text" 
              icon={<DeleteOutlined />} 
              onClick={() => handleDeleteAction(record.id)}
              className="action-button delete"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  const actionMenu = (
    <Menu>
      <Menu.Item key="export" icon={<DownloadOutlined />}>
        Exporter les actions
      </Menu.Item>
      <Menu.Item key="refresh" icon={<ReloadOutlined />} onClick={fetchActionsList}>
        Rafraîchir la liste
      </Menu.Item>
      {selectedRowKeys.length > 0 && (
        <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={handleBatchDelete}>
          Supprimer {selectedRowKeys.length} action(s)
        </Menu.Item>
      )}
    </Menu>
  );

  return (
    <div className="action-list-container">
      <div className="action-list-header">
        <Title level={2} className="page-title">
          <Space>
            <FileTextOutlined />
            <span>Liste des actions</span>
          </Space>
        </Title>
        
        <div className="action-list-tools">
          <Input.Search
            placeholder="Rechercher une action..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 300 }}
            allowClear
          />
          
          <Space>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'active-filter-btn' : ''}
            >
              Filtres
            </Button>
            
            <Link to="/actions/add">
              <Button type="primary" icon={<PlusOutlined />} className="add-action-btn">
                Nouvelle action
              </Button>
            </Link>
            
            <Dropdown overlay={actionMenu} trigger={['click']}>
              <Button icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        </div>
      </div>
      
      {showFilters && (
        <div className="action-filters">
          <Row gutter={16} align="middle">
            <Col span={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filtrer par type"
                value={filters.type || undefined}
                onChange={(value) => handleFilterChange('type', value)}
                allowClear
              >
                <Option value="media">Media</Option>
                <Option value="cte">CTE</Option>
                <Option value="salon">Salon</Option>
                <Option value="delegation">Délégation</Option>
                <Option value="seminaire_jipays">Séminaire</Option>
                <Option value="demarchage_direct">Démarchage Direct</Option>
                <Option value="salon_sectoriel">Salon Sectoriel</Option>
                <Option value="seminaire_jisecteur">Séminaire Secteur</Option>
                <Option value="visite_entreprise">Visite Entreprise</Option>
              </Select>
            </Col>
            
            <Col span={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filtrer par statut"
                value={filters.statut || undefined}
                onChange={(value) => handleFilterChange('statut', value)}
                allowClear
              >
                <Option value="planifiee">Planifiée</Option>
                <Option value="terminee">Terminée</Option>
                <Option value="annulee">Annulée</Option>
                <Option value="reportee">Reportée</Option>
              </Select>
            </Col>
            
            <Col span={8}>
              <Radio.Group 
                value={filters.periode || ''} 
                onChange={(e) => handleFilterChange('periode', e.target.value)}
              >
                <Radio.Button value="">Toutes</Radio.Button>
                <Radio.Button value="a_venir">À venir</Radio.Button>
                <Radio.Button value="passees">Passées</Radio.Button>
                <Radio.Button value="semaine">Cette semaine</Radio.Button>
                <Radio.Button value="mois">Ce mois</Radio.Button>
              </Radio.Group>
            </Col>
            
            <Col span={4} style={{ textAlign: 'right' }}>
              <Button onClick={clearFilters}>Réinitialiser</Button>
            </Col>
          </Row>
        </div>
      )}
      
      <Card className="action-list-card">
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
            <p>Chargement des actions...</p>
          </div>
        ) : actions.length > 0 ? (
          <>
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={actions.map(action => ({ ...action, key: action.id }))}
              rowClassName="action-table-row"
              pagination={false} // Nous gérons la pagination manuellement
              onChange={handleTableChange}
              bordered={false}
              className="actions-table"
            />
            
            <div className="pagination-container">
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                showSizeChanger
                pageSizeOptions={['10', '20', '50', '100']}
                onChange={(page, pageSize) => setPagination({ current: page, pageSize, total: pagination.total })}
                showTotal={(total, range) => `${range[0]}-${range[1]} sur ${total} actions`}
              />
            </div>
          </>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                Aucune action trouvée
                {searchText && ` pour la recherche "${searchText}"`}
                {(filters.type || filters.statut || filters.periode) && " avec les filtres appliqués"}
              </span>
            }
          >
            <Link to="/actions/add">
              <Button type="primary" icon={<PlusOutlined />}>
                Créer une action
              </Button>
            </Link>
          </Empty>
        )}
        
        {selectedRowKeys.length > 0 && (
          <div className="batch-actions">
            <Space>
              <span>{selectedRowKeys.length} action(s) sélectionnée(s)</span>
              <Button 
                type="primary" 
                danger 
                icon={<DeleteOutlined />}
                onClick={handleBatchDelete}
              >
                Supprimer la sélection
              </Button>
            </Space>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ActionList;