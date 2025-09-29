import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Table, Space, Button, Input, Tag, Dropdown, Menu, Modal, Card, message,
  Row, Col, Select, Tooltip, Statistic, Badge, Divider, Typography,
  DatePicker, Avatar, Segmented, Tabs, Empty, Pagination, Spin, Progress,
  Breadcrumb, Alert
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, 
  ExclamationCircleOutlined, MoreOutlined, FilterOutlined, EyeOutlined,
  CheckCircleOutlined, CloseCircleOutlined, QuestionCircleOutlined,
  UserOutlined, MailOutlined, GlobalOutlined, TeamOutlined,
  CalendarOutlined, PhoneOutlined, BellOutlined, AppstoreOutlined,
  UnorderedListOutlined, FileExcelOutlined, FilePdfOutlined, SettingOutlined,
  ReloadOutlined, BarsOutlined, SendOutlined, HomeOutlined, DashboardOutlined,
  DownOutlined, SwapOutlined, BankOutlined, AuditOutlined, ClockCircleOutlined,
  ProjectOutlined, TrophyOutlined, DollarOutlined, SyncOutlined, PauseCircleOutlined
} from '@ant-design/icons';
import { 
  fetchProjects, 
  deleteProject, 
  updateProjectStatus,
  resetOperation 
} from '../../features/projectSlice';
import { 
  fetchPays, 
  fetchSecteurs,
  fetchEntreprises 
} from '../../features/marketingSlice';
import moment from 'moment';

const { confirm } = Modal;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ProjetsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const { 
    items: projets, 
    loading, 
    error, 
    pagination,
    operation 
  } = useSelector(state => state.projects);
  
  // Ensure projets is always an array to prevent Table errors
  const safeProjets = Array.isArray(projets) ? projets : [];
  
  // Local state
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState('table');
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filters, setFilters] = useState({});
  const [allProjets, setAllProjets] = useState([]);

  // Récupérer les données nécessaires du marketing slice
  const { 
    pays: { items: paysList = [] },
    secteurs: { items: secteursList = [] },
    entreprises: { items: entreprisesList = [] }
  } = useSelector(state => state.marketing);

  // Stats calculés à partir de TOUS les projets
  const stats = useMemo(() => {
    if (!allProjets || allProjets.length === 0) return {
      total: 0,
      planned: 0,
      in_progress: 0,
      completed: 0,
      abandoned: 0,
      suspended: 0,
      on_hold: 0
    };
    
    return {
      total: allProjets.length,
      planned: allProjets.filter(p => p.status === 'planned').length,
      in_progress: allProjets.filter(p => p.status === 'in_progress').length,
      completed: allProjets.filter(p => p.status === 'completed').length,
      abandoned: allProjets.filter(p => p.status === 'abandoned').length,
      suspended: allProjets.filter(p => p.status === 'suspended').length,
      on_hold: allProjets.filter(p => p.status === 'on_hold').length,
    };
  }, [allProjets]);

  // Charger les projets au chargement et lors des changements de filtres/pagination
  useEffect(() => {
    const params = {
      page: currentPage,
      per_page: pageSize,
      search: searchText,
      ...filters,
      ...advancedFilters
    };
    dispatch(fetchProjects(params));
  }, [dispatch, currentPage, pageSize, filters, advancedFilters, searchText, refreshTrigger]);

  // Charger TOUS les projets pour les statistiques (sans pagination)
  useEffect(() => {
    const fetchAllProjets = async () => {
      try {
        const allParams = {
          per_page: 9999, // Grande valeur pour récupérer tous les projets
          search: searchText,
          ...filters,
          ...advancedFilters
        };
        const result = await dispatch(fetchProjects(allParams));
        if (result.payload && result.payload.data) {
          const projetsData = Array.isArray(result.payload.data) 
            ? result.payload.data 
            : result.payload.data.data || [];
          setAllProjets(projetsData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de tous les projets:', error);
        setAllProjets([]);
      }
    };

    fetchAllProjets();
  }, [dispatch, filters, advancedFilters, searchText, refreshTrigger]);

  // Charger les listes de pays, secteurs et entreprises au montage du composant
  useEffect(() => {
    dispatch(fetchPays());
    dispatch(fetchSecteurs());
    dispatch(fetchEntreprises());
  }, [dispatch]);

  // Gestion des succès/erreurs d'opération
  useEffect(() => {
    if (operation.success && operation.type === 'delete') {
      message.success('Projet supprimé avec succès');
      setSelectedRows([]);
      setSelectedRowKeys([]);
      setRefreshTrigger(prev => prev + 1);
    } else if (operation.success && operation.type === 'status') {
      message.success('Statut mis à jour avec succès');
      setRefreshTrigger(prev => prev + 1);
    } else if (operation.error) {
      message.error(operation.error);
    }
  }, [operation]);

  // Fonctions
  const showDeleteConfirm = (id, name) => {
    confirm({
      title: `Êtes-vous sûr de vouloir supprimer le projet "${name}"?`,
      icon: <ExclamationCircleOutlined />,
      content: 'Cette action est irréversible.',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk() {
        dispatch(deleteProject(id));
      }
    });
  };

  const handleStatusChange = (id, newStatus) => {
    dispatch(updateProjectStatus({ id, status: newStatus }));
  };

  const handleAddNew = () => {
    navigate('/projets/create');
  };

  const handleEdit = (id) => {
    navigate(`/projets/${id}/edit`);
  };

  const handleView = (id) => {
    navigate(`/projets/${id}`);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const resetAllFilters = () => {
    setFilters({});
    setAdvancedFilters({});
    setSearchText('');
    setCurrentPage(1);
  };

  const handleTableChange = (paginationTable, tableFilters, sorter) => {
    setCurrentPage(paginationTable.current);
    setPageSize(paginationTable.pageSize);
    
    if (sorter && sorter.field) {
      const orderDir = sorter.order === 'ascend' ? 'asc' : 'desc';
      setFilters(prev => ({
        ...prev,
        sort_by: sorter.field,
        sort_dir: orderDir
      }));
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys, rows) => {
      setSelectedRowKeys(keys);
      setSelectedRows(rows);
    }
  };

  const handleBatchAction = (action) => {
    if (selectedRows.length === 0) {
      message.warning('Veuillez sélectionner au moins un projet');
      return;
    }

    if (action === 'delete') {
      confirm({
        title: `Supprimer ${selectedRows.length} projet(s)?`,
        icon: <ExclamationCircleOutlined />,
        content: 'Cette action est irréversible.',
        okText: 'Oui',
        okType: 'danger',
        cancelText: 'Non',
        onOk() {
          message.success(`${selectedRows.length} projets supprimés`);
          setSelectedRows([]);
          setSelectedRowKeys([]);
          setRefreshTrigger(prev => prev + 1);
        }
      });
    } else if (action.startsWith('status:')) {
      const newStatus = action.split(':')[1];
      message.success(`Statut mis à jour pour ${selectedRows.length} projets`);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  // Rendu du statut avec un tag coloré
  const renderStatus = (status) => {
    let color, text, icon;
    switch (status) {
      case 'planned':
        color = 'orange';
        text = 'Planifié';
        icon = <CalendarOutlined />;
        break;
      case 'in_progress':
        color = 'processing';
        text = 'En cours';
        icon = <SyncOutlined spin />;
        break;
      case 'completed':
        color = 'success';
        text = 'Terminé';
        icon = <CheckCircleOutlined />;
        break;
      case 'abandoned':
        color = 'error';
        text = 'Abandonné';
        icon = <CloseCircleOutlined />;
        break;
      case 'suspended':
        color = 'warning';
        text = 'Suspendu';
        icon = <PauseCircleOutlined />;
        break;
      case 'on_hold':
        color = 'default';
        text = 'En attente';
        icon = <ClockCircleOutlined />;
        break;
      default:
        color = 'default';
        text = status || 'Inconnu';
        icon = null;
    }
    return <Tag color={color} icon={icon}>{text}</Tag>;
  };

  // Formater la valeur monétaire
  const formatMoney = (value, devise = 'EUR') => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: devise
    }).format(value);
  };

  // Colonnes du tableau
  const columns = [
    {
      title: 'Projet',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
      render: (text, record) => (
        <div className="projet-name-cell">
          <Avatar 
            size="small" 
            icon={<ProjectOutlined />} 
            style={{ 
              marginRight: 8, 
              backgroundColor: '#1890ff'
            }} 
          />
          <a onClick={() => handleView(record.id)}>
            {record.title || record.nom || 'Sans titre'}
          </a>
          {record.status === 'completed' && (
            <Tag color="green" style={{ marginLeft: 8 }}>Terminé</Tag>
          )}
        </div>
      )
    },
    {
      title: 'Entreprise',
      key: 'entreprise',
      render: (_, record) => (
        <div>
          <BankOutlined style={{ marginRight: 6, color: '#1890ff' }} />
          {record.entreprise?.nom || record.company_name || 'N/A'}
        </div>
      )
    },
    {
      title: 'Secteur',
      key: 'secteur',
      render: (_, record) => (
        <div>
          <GlobalOutlined style={{ marginRight: 6, color: '#13c2c2' }} />
          {record.secteur?.name || record.secteur?.nom || 'N/A'}
        </div>
      )
    },
    {
      title: 'Budget',
      key: 'budget',
      render: (_, record) => (
        <div>
          <DollarOutlined style={{ marginRight: 6, color: '#52c41a' }} />
          {formatMoney(record.investment_amount || record.budget, record.devise)}
        </div>
      )
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: renderStatus,
    },
    {
      title: 'Responsable',
      key: 'responsable',
      render: (_, record) => (
        <div>
          <UserOutlined style={{ marginRight: 6, color: '#1890ff' }} />
          {record.responsable?.name || 'Non assigné'}
        </div>
      )
    },
    {
      title: 'Date de création',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: true,
      render: (text) => text ? moment(text).format('DD/MM/YYYY') : 'N/A'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 90,
      fixed: 'right',
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
                  key="planned" 
                  icon={<CalendarOutlined />}
                  onClick={() => handleStatusChange(record.id, 'planned')}
                  disabled={record.status === 'planned'}
                >
                  Planifié
                </Menu.Item>
                <Menu.Item 
                  key="in_progress" 
                  icon={<SyncOutlined />}
                  onClick={() => handleStatusChange(record.id, 'in_progress')}
                  disabled={record.status === 'in_progress'}
                >
                  En cours
                </Menu.Item>
                <Menu.Item 
                  key="completed" 
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, 'completed')}
                  disabled={record.status === 'completed'}
                >
                  Terminé
                </Menu.Item>
                <Menu.Item 
                  key="abandoned" 
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, 'abandoned')}
                  disabled={record.status === 'abandoned'}
                >
                  Abandonné
                </Menu.Item>
                <Menu.Item 
                  key="suspended" 
                  icon={<PauseCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, 'suspended')}
                  disabled={record.status === 'suspended'}
                >
                  Suspendu
                </Menu.Item>
                <Menu.Item 
                  key="on_hold" 
                  icon={<ClockCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, 'on_hold')}
                  disabled={record.status === 'on_hold'}
                >
                  En attente
                </Menu.Item>
              </Menu.SubMenu>
              <Menu.Divider />
              <Menu.Item 
                key="delete" 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => showDeleteConfirm(record.id, record.title || record.nom)}
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
    <div className="crm-container">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="crm-breadcrumb">
        <Breadcrumb.Item>
          <Link to="/"><HomeOutlined /> Accueil</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/dashboard"><DashboardOutlined /> Dashboard</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <ProjectOutlined /> Projets
        </Breadcrumb.Item>
      </Breadcrumb>

      {/* En-tête avec le style CRM */}
      <div className="crm-header">
        <div className="crm-title">
          <div className="crm-lead-label">
            <ProjectOutlined /> Gestion des <span className="lead-name">Projets</span>
          </div>
          <div className="crm-lead-actions">
            <Text type="secondary">Suivi et gestion de tous les projets d'investissement</Text>
          </div>
        </div>

       
      </div>

      {/* Méta-informations */}
      <div className="crm-meta-info">
        <div className="crm-meta-item">
          <div className="crm-meta-label">TOTAL:</div>
          <div className="crm-meta-value">
            <Badge status="processing" text={`${stats.total} projets`} />
          </div>
        </div>
        <div className="crm-meta-item">
          <div className="crm-meta-label">PLANIFIÉS:</div>
          <div className="crm-meta-value">
            <Badge status="warning" text={`${stats.planned} projets`} />
          </div>
        </div>
        <div className="crm-meta-item">
          <div className="crm-meta-label">EN COURS:</div>
          <div className="crm-meta-value">
            <Badge status="processing" text={`${stats.in_progress} projets`} />
          </div>
        </div>
        <div className="crm-meta-item">
          <div className="crm-meta-label">TERMINÉS:</div>
          <div className="crm-meta-value">
            <Badge status="success" text={`${stats.completed} projets`} />
          </div>
        </div>
        <div className="crm-meta-item">
          <div className="crm-meta-label">DERNIÈRE MAJ:</div>
          <div className="crm-meta-value">
            {moment().format('DD/MM/YYYY HH:mm')}
          </div>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="crm-dashboard-section">
        <Row gutter={[16, 16]} className="stats-cards-row">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="stat-card">
              <Statistic 
                title="Total" 
                value={stats.total} 
                prefix={<ProjectOutlined />} 
                valueStyle={{ color: '#1890ff' }}
              />
              <div className="stat-progress">
                <Progress percent={100} showInfo={false} strokeColor="#1890ff" />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="stat-card">
              <Statistic 
                title="Planifiés" 
                value={stats.planned} 
                prefix={<CalendarOutlined />} 
                valueStyle={{ color: '#faad14' }}
              />
              <div className="stat-progress">
                <Progress 
                  percent={stats.total ? Math.round((stats.planned / stats.total) * 100) : 0} 
                  showInfo={false}
                  strokeColor="#faad14" 
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="stat-card">
              <Statistic 
                title="En cours" 
                value={stats.in_progress} 
                prefix={<SyncOutlined />} 
                valueStyle={{ color: '#1890ff' }}
              />
              <div className="stat-progress">
                <Progress 
                  percent={stats.total ? Math.round((stats.in_progress / stats.total) * 100) : 0} 
                  showInfo={false} 
                  strokeColor="#1890ff"
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="stat-card">
              <Statistic 
                title="Terminés" 
                value={stats.completed} 
                prefix={<CheckCircleOutlined />} 
                valueStyle={{ color: '#52c41a' }}
              />
              <div className="stat-progress">
                <Progress 
                  percent={stats.total ? Math.round((stats.completed / stats.total) * 100) : 0} 
                  showInfo={false}
                  strokeColor="#52c41a" 
                />
              </div>
            </Card>
          </Col>
        </Row>
        <Row gutter={[16, 16]} className="stats-cards-row">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="stat-card">
              <Statistic 
                title="Abandonnés" 
                value={stats.abandoned} 
                prefix={<CloseCircleOutlined />} 
                valueStyle={{ color: '#f5222d' }}
              />
              <div className="stat-progress">
                <Progress 
                  percent={stats.total ? Math.round((stats.abandoned / stats.total) * 100) : 0} 
                  showInfo={false}
                  strokeColor="#f5222d" 
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="stat-card">
              <Statistic 
                title="Suspendus" 
                value={stats.suspended} 
                prefix={<PauseCircleOutlined />} 
                valueStyle={{ color: '#fa541c' }}
              />
              <div className="stat-progress">
                <Progress 
                  percent={stats.total ? Math.round((stats.suspended / stats.total) * 100) : 0} 
                  showInfo={false}
                  strokeColor="#fa541c" 
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="stat-card">
              <Statistic 
                title="En attente" 
                value={stats.on_hold} 
                prefix={<ClockCircleOutlined />} 
                valueStyle={{ color: '#d9d9d9' }}
              />
              <div className="stat-progress">
                <Progress 
                  percent={stats.total ? Math.round((stats.on_hold / stats.total) * 100) : 0} 
                  showInfo={false}
                  strokeColor="#d9d9d9" 
                />
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Conteneur principal */}
      <div className="crm-content-tabs">
        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
          <TabPane tab={<span><UnorderedListOutlined /> Tous</span>} key="all">
            <Card 
              className="main-content-card"
              title={
                <div className="card-title-container">
                  <div>Liste des projets</div>
                  <div className="view-switcher">
                    <Segmented
                      value={viewMode}
                      onChange={setViewMode}
                      options={[
                        {
                          value: 'table',
                          icon: <BarsOutlined />,
                        },
                        {
                          value: 'cards',
                          icon: <AppstoreOutlined />,
                        },
                      ]}
                    />
                  </div>
                </div>
              }
              extra={
                <div className="card-extra-content">
                 
                  
                  <Button 
                    icon={<FilterOutlined />} 
                    onClick={() => setShowFilters(!showFilters)}
                    type={Object.keys(advancedFilters).length > 0 ? 'primary' : 'default'}
                  >
                    Filtres
                    {Object.keys(advancedFilters).length > 0 && (
                      <Badge count={Object.keys(advancedFilters).length} style={{ marginLeft: 5 }} />
                    )}
                  </Button>
                  
                  
                </div>
              }
            >
              {/* Filtres avancés */}
              {showFilters && (
                <div className="advanced-filters">
                  <Row gutter={16}>
                    <Col span={6}>
                      <Select
                        style={{ width: '100%' }}
                        placeholder="Statut"
                        allowClear
                        onChange={(value) => handleFilterChange('status', value)}
                        value={filters.status}
                      >
                        <Option value="planned">Planifié</Option>
                        <Option value="in_progress">En cours</Option>
                        <Option value="completed">Terminé</Option>
                        <Option value="abandoned">Abandonné</Option>
                        <Option value="suspended">Suspendu</Option>
                        <Option value="on_hold">En attente</Option>
                      </Select>
                    </Col>
                    <Col span={6}>
                      <Select
                        style={{ width: '100%' }}
                        placeholder="Secteur"
                        allowClear
                        onChange={(value) => handleFilterChange('secteur_id', value)}
                        value={filters.secteur_id}
                        showSearch
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {secteursList.map(secteur => (
                          <Option key={secteur.id} value={secteur.id}>
                            {secteur.name}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                    <Col span={6}>
                      <Select
                        style={{ width: '100%' }}
                        placeholder="Entreprise"
                        allowClear
                        onChange={(value) => handleFilterChange('entreprise_id', value)}
                        value={filters.entreprise_id}
                        showSearch
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {entreprisesList.map(entreprise => (
                          <Option key={entreprise.id} value={entreprise.id}>
                            {entreprise.nom}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginTop: 16 }}>
                    <Col span={12}>
                     
                    </Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                      <Space>
                        <Button onClick={resetAllFilters}>Réinitialiser</Button>
                        <Button type="primary" onClick={() => setShowFilters(false)}>Appliquer</Button>
                      </Space>
                    </Col>
                  </Row>
                </div>
              )}

              {/* Actions en lot */}
              {selectedRows.length > 0 && (
                <div className="batch-actions">
                  <Space>
                    <Text strong>{`${selectedRows.length} projet(s) sélectionné(s)`}</Text>
                    <Dropdown
                      overlay={
                        <Menu onClick={({ key }) => handleBatchAction(key)}>
                          <Menu.SubMenu key="status" title="Changer le statut">
                            <Menu.Item key="status:planned">Planifié</Menu.Item>
                            <Menu.Item key="status:in_progress">En cours</Menu.Item>
                            <Menu.Item key="status:completed">Terminé</Menu.Item>
                            <Menu.Item key="status:abandoned">Abandonné</Menu.Item>
                            <Menu.Item key="status:suspended">Suspendu</Menu.Item>
                            <Menu.Item key="status:on_hold">En attente</Menu.Item>
                          </Menu.SubMenu>
                          <Menu.Divider />
                          <Menu.Item key="export-excel" icon={<FileExcelOutlined />}>Exporter (Excel)</Menu.Item>
                          <Menu.Item key="export-pdf" icon={<FilePdfOutlined />}>Exporter (PDF)</Menu.Item>
                          <Menu.Divider />
                          <Menu.Item key="delete" danger icon={<DeleteOutlined />}>Supprimer</Menu.Item>
                        </Menu>
                      }
                    >
                      <Button>
                        Actions groupées <DownOutlined />
                      </Button>
                    </Dropdown>
                  </Space>
                </div>
              )}

              {error && (
                <Alert message="Erreur" description={error} type="error" showIcon style={{ marginBottom: 16 }} />
              )}

              {/* Mode tableau */}
              {viewMode === 'table' && (
                <Table
                  columns={columns}
                  dataSource={safeProjets}
                  rowKey="id"
                  loading={loading}
                  rowSelection={rowSelection}
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: pagination?.total || 0,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} projets`
                  }}
                  onChange={handleTableChange}
                  scroll={{ x: 'max-content' }}
                  className="crm-table"
                />
              )}

              {/* Mode cartes */}
              {viewMode === 'cards' && (
                <>
                  {loading ? (
                    <div className="cards-loading">
                      <Spin size="large" />
                    </div>
                  ) : safeProjets && safeProjets.length > 0 ? (
                    <Row gutter={[16, 16]} className="cards-container">
                      {safeProjets.map(projet => (
                        <Col xs={24} sm={12} md={8} lg={6} key={projet.id}>
                          <Card
                            hoverable
                            className="projet-card"
                            onClick={() => handleView(projet.id)}
                            actions={[
                              <Tooltip title="Voir"><EyeOutlined onClick={(e) => {
                                e.stopPropagation();
                                handleView(projet.id);
                              }} /></Tooltip>,
                              <Tooltip title="Modifier"><EditOutlined onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(projet.id);
                              }} /></Tooltip>,
                              <Tooltip title="Supprimer"><DeleteOutlined onClick={(e) => {
                                e.stopPropagation();
                                showDeleteConfirm(projet.id, projet.title || projet.nom);
                              }} /></Tooltip>,
                            ]}
                          >
                            <div className="card-avatar">
                              <Avatar 
                                size={64} 
                                icon={<ProjectOutlined />} 
                                style={{ 
                                  backgroundColor: '#1890ff'
                                }} 
                              />
                              {projet.status === 'completed' && (
                                <div className="completed-badge">
                                  <Badge status="success" text="Terminé" />
                                </div>
                              )}
                            </div>
                            <div className="card-content">
                              <div className="card-name">
                                {projet.title || projet.nom || 'Sans titre'}
                              </div>
                              <div className="card-company">{projet.entreprise?.nom || projet.company_name || 'N/A'}</div>
                              <div className="card-status">{renderStatus(projet.status)}</div>
                              <div className="card-meta">
                                <div className="card-meta-item">
                                  <GlobalOutlined /> {projet.secteur?.name || 'N/A'}
                                </div>
                                <div className="card-meta-item">
                                  <DollarOutlined /> {formatMoney(projet.investment_amount || projet.budget, projet.devise)}
                                </div>
                                <div className="card-meta-item">
                                  <CalendarOutlined /> {projet.created_at ? moment(projet.created_at).format('DD/MM/YYYY') : 'N/A'}
                                </div>
                                {projet.responsable?.name && (
                                  <div className="card-meta-item">
                                    <UserOutlined /> {projet.responsable.name}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Empty description="Aucun projet trouvé" />
                  )}
                  
                  {/* Pagination pour le mode cartes */}
                  {safeProjets && safeProjets.length > 0 && (
                    <div className="cards-pagination">
                      <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={pagination?.total || 0}
                        showSizeChanger
                        onChange={(page, size) => {
                          setCurrentPage(page);
                          setPageSize(size);
                        }}
                        showTotal={(total, range) => `${range[0]}-${range[1]} sur ${total} projets`}
                      />
                    </div>
                  )}
                </>
              )}
            </Card>
          </TabPane>
        </Tabs>
      </div> 

      {/* CSS intégré pour les styles CRM */}
      <style jsx>{`
        .crm-container {
          background-color: #f0f2f5;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          padding: 24px;
        }
        
        .crm-breadcrumb {
          margin-bottom: 16px;
        }
        
        .crm-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          margin-bottom: 16px;
        }
        
        .crm-title {
          display: flex;
          flex-direction: column;
        }
        
        .crm-lead-label {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .lead-name {
          color: #1890ff;
        }
        
        .crm-lead-actions {
          margin-top: 4px;
        }
        
        .crm-header-actions {
          display: flex;
          gap: 8px;
        }
        
        .crm-btn {
          border-radius: 4px;
        }
        
        .crm-add-btn {
          background-color: #1890ff;
          border-color: #1890ff;
        }
        
        .crm-meta-info {
          display: flex;
          background-color: white;
          padding: 12px 20px;
          margin-bottom: 16px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          flex-wrap: wrap;
        }
        
        .crm-meta-item {
          margin-right: 32px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
        }
        
        .crm-meta-label {
          color: #999;
          font-size: 12px;
          margin-right: 8px;
          font-weight: 500;
        }
        
        .crm-meta-value {
          color: #333;
          font-size: 12px;
          display: flex;
          align-items: center;
        }
        
        .crm-dashboard-section {
          margin-bottom: 16px;
        }
        
        .stats-cards-row {
          margin-bottom: 16px;
        }
        
        .stat-card {
          border-radius: 8px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          height: 100%;
        }
        
        .stat-progress {
          margin-top: 8px;
        }
        
        .crm-content-tabs {
          background-color: white;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        
        .main-content-card {
          border: none;
          box-shadow: none;
        }
        
        .card-title-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        
        .card-extra-content {
          display: flex;
          gap: 8px;
        }
        
        .advanced-filters {
          background-color: #f9f9f9;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
        }
        
        .batch-actions {
          background-color: #f0f7ff;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .crm-table {
          margin-top: 16px;
        }
        
        .projet-name-cell {
          display: flex;
          align-items: center;
        }
        
        .cards-container {
          margin-top: 16px;
        }
        
        .projet-card {
          border-radius: 8px;
          transition: all 0.3s;
          overflow: hidden;
        }
        
        .projet-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .card-avatar {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
          position: relative;
        }
        
        .completed-badge {
          position: absolute;
          top: -4px;
          right: 16px;
        }
        
        .card-content {
          text-align: center;
        }
        
        .card-name {
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 4px;
        }
        
        .card-company {
          color: #666;
          margin-bottom: 8px;
        }
        
        .card-status {
          margin-bottom: 8px;
          display: flex;
          justify-content: center;
        }
        
        .card-meta {
          text-align: left;
          border-top: 1px solid #f0f0f0;
          padding-top: 12px;
        }
        
        .card-meta-item {
          margin-top: 4px;
          color: #666;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .cards-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 300px;
        }
        
        .cards-pagination {
          margin-top: 24px;
          display: flex;
          justify-content: flex-end;
        }
        
        @media (max-width: 768px) {
          .crm-container {
            padding: 12px;
          }
          
          .crm-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .crm-header-actions {
            margin-top: 16px;
            width: 100%;
          }
          
          .crm-meta-info {
            flex-direction: column;
          }
          
          .crm-meta-item {
            margin-bottom: 8px;
          }
          
          .card-title-container {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .card-extra-content {
            margin-top: 16px;
            width: 100%;
          }
          
          .card-extra-content > * {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ProjetsList;