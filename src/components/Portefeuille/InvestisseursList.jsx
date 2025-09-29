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
  FundOutlined, TrophyOutlined, DollarOutlined
} from '@ant-design/icons';
import { 
  getInvestisseurs, 
  deleteInvestisseur, 
  updateInvestisseurStatus, 
  convertToProject,
  resetOperation 
} from '../../features/investisseurSlice';
import { 
  fetchPays, 
  fetchSecteurs 
} from '../../features/marketingSlice';
import moment from 'moment';

const { confirm } = Modal;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const InvestisseursList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const { 
    items: investisseurs, 
    loading, 
    error, 
    pagination,
    operation 
  } = useSelector(state => state.investisseurs);
  
  // Ensure investisseurs is always an array to prevent Table errors
  const safeInvestisseurs = Array.isArray(investisseurs) ? investisseurs : [];
  
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
  const [allInvestisseurs, setAllInvestisseurs] = useState([]);

  // Récupérer les données nécessaires du marketing slice
  const { 
    pays: { items: paysList = [] },
    secteurs: { items: secteursList = [] }
  } = useSelector(state => state.marketing);

  // Stats calculés à partir de TOUS les investisseurs
  const stats = useMemo(() => {
    if (!allInvestisseurs || allInvestisseurs.length === 0) return {
      total: 0,
      actif: 0,
      negociation: 0,
      engagement: 0,
      finalisation: 0,
      investi: 0,
      suspendu: 0,
      inactif: 0
    };
    
    return {
      total: allInvestisseurs.length,
      actif: allInvestisseurs.filter(i => i.statut === 'actif').length,
      negociation: allInvestisseurs.filter(i => i.statut === 'negociation').length,
      engagement: allInvestisseurs.filter(i => i.statut === 'engagement').length,
      finalisation: allInvestisseurs.filter(i => i.statut === 'finalisation').length,
      investi: allInvestisseurs.filter(i => i.statut === 'investi').length,
      suspendu: allInvestisseurs.filter(i => i.statut === 'suspendu').length,
      inactif: allInvestisseurs.filter(i => i.statut === 'inactif').length,
    };
  }, [allInvestisseurs]);

  // Charger les investisseurs au chargement et lors des changements de filtres/pagination
  useEffect(() => {
    const params = {
      page: currentPage,
      per_page: pageSize,
      search: searchText,
      ...filters,
      ...advancedFilters
    };
    dispatch(getInvestisseurs(params));
  }, [dispatch, currentPage, pageSize, filters, advancedFilters, searchText, refreshTrigger]);

  // Charger TOUS les investisseurs pour les statistiques (sans pagination)
  useEffect(() => {
    const fetchAllInvestisseurs = async () => {
      try {
        const allParams = {
          per_page: 9999, // Grande valeur pour récupérer tous les investisseurs
          search: searchText,
          ...filters,
          ...advancedFilters
        };
        const result = await dispatch(getInvestisseurs(allParams));
        if (result.payload && result.payload.data) {
          const investisseursData = Array.isArray(result.payload.data) 
            ? result.payload.data 
            : result.payload.data.data || [];
          setAllInvestisseurs(investisseursData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de tous les investisseurs:', error);
        setAllInvestisseurs([]);
      }
    };

    fetchAllInvestisseurs();
  }, [dispatch, filters, advancedFilters, searchText, refreshTrigger]);

  // Charger les listes de pays et secteurs au montage du composant
  useEffect(() => {
    dispatch(fetchPays());
    dispatch(fetchSecteurs());
  }, [dispatch]);

  // Gestion des succès/erreurs d'opération
  useEffect(() => {
    if (operation.success && operation.type === 'delete') {
      message.success('Investisseur supprimé avec succès');
      setSelectedRows([]);
      setSelectedRowKeys([]);
      setRefreshTrigger(prev => prev + 1);
    } else if (operation.success && operation.type === 'update_status') {
      message.success('Statut mis à jour avec succès');
      setRefreshTrigger(prev => prev + 1);
    } else if (operation.success && operation.type === 'convert_to_project') {
      message.success('Investisseur converti en projet avec succès');
      setRefreshTrigger(prev => prev + 1);
    } else if (operation.error) {
      message.error(operation.error);
    }
  }, [operation]);

  // Fonctions
  const showDeleteConfirm = (id, name) => {
    confirm({
      title: `Êtes-vous sûr de vouloir supprimer l'investisseur ${name}?`,
      icon: <ExclamationCircleOutlined />,
      content: 'Cette action est irréversible.',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk() {
        dispatch(deleteInvestisseur(id));
      }
    });
  };

  const handleStatusChange = (id, newStatus) => {
    dispatch(updateInvestisseurStatus({ id, statut: newStatus }));
  };

  const handleConvertToProject = (id, name) => {
    confirm({
      title: `Convertir l'investisseur ${name} en projet?`,
      icon: <SwapOutlined />,
      content: 'Cette action créera un nouveau projet basé sur les données de l\'investisseur.',
      okText: 'Convertir',
      okType: 'primary',
      cancelText: 'Annuler',
      onOk() {
        dispatch(convertToProject({ id }));
      }
    });
  };

  const handleAddNew = () => {
    navigate('/investisseurs/create');
  };

  const handleEdit = (id) => {
    navigate(`/investisseurs/${id}/edit`);
  };

  const handleView = (id) => {
    navigate(`/investisseurs/${id}`);
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
      message.warning('Veuillez sélectionner au moins un investisseur');
      return;
    }

    if (action === 'delete') {
      confirm({
        title: `Supprimer ${selectedRows.length} investisseur(s)?`,
        icon: <ExclamationCircleOutlined />,
        content: 'Cette action est irréversible.',
        okText: 'Oui',
        okType: 'danger',
        cancelText: 'Non',
        onOk() {
          message.success(`${selectedRows.length} investisseurs supprimés`);
          setSelectedRows([]);
          setSelectedRowKeys([]);
          setRefreshTrigger(prev => prev + 1);
        }
      });
    } else if (action.startsWith('status:')) {
      const newStatus = action.split(':')[1];
      message.success(`Statut mis à jour pour ${selectedRows.length} investisseurs`);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  // Rendu du statut avec un tag coloré
  const renderStatus = (statut) => {
    let color, text, icon;
    switch (statut) {
      case 'actif':
        color = 'green';
        text = 'Actif';
        icon = <CheckCircleOutlined />;
        break;
      case 'negociation':
        color = 'orange';
        text = 'Négociation';
        icon = <DollarOutlined />;
        break;
      case 'engagement':
        color = 'blue';
        text = 'Engagement';
        icon = <AuditOutlined />;
        break;
      case 'finalisation':
        color = 'cyan';
        text = 'Finalisation';
        icon = <ClockCircleOutlined />;
        break;
      case 'investi':
        color = 'purple';
        text = 'Investi';
        icon = <TrophyOutlined />;
        break;
      case 'suspendu':
        color = 'volcano';
        text = 'Suspendu';
        icon = <CloseCircleOutlined />;
        break;
      case 'inactif':
        color = 'default';
        text = 'Inactif';
        icon = <CloseCircleOutlined />;
        break;
      default:
        color = 'default';
        text = statut || 'Inconnu';
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
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      sorter: true,
      render: (text, record) => (
        <div className="investisseur-name-cell">
          <Avatar 
            size="small" 
            icon={<FundOutlined />} 
            style={{ 
              marginRight: 8, 
              backgroundColor: '#722ed1'
            }} 
          />
          <a onClick={() => handleView(record.id)}>
            {record.nom}
          </a>
          {record.statut === 'converti' && (
            <Tag color="purple" style={{ marginLeft: 8 }}>Converti</Tag>
          )}
        </div>
      )
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <div className="contact-info">
          <div>
            <MailOutlined style={{ marginRight: 6, color: '#1890ff' }} />
            {record.email || 'N/A'}
          </div>
          {record.telephone && (
            <div>
              <PhoneOutlined style={{ marginRight: 6, color: '#52c41a' }} />
              {record.telephone}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Type',
      key: 'type_investisseur',
      render: (_, record) => (
        <div>
          <TrophyOutlined style={{ marginRight: 6, color: '#fa8c16' }} />
          {record.type_investisseur || 'N/A'}
        </div>
      )
    },
    {
      title: 'Secteur d\'intérêt',
      key: 'secteur_interet',
      render: (_, record) => (
        <div>
          <GlobalOutlined style={{ marginRight: 6, color: '#13c2c2' }} />
          {record.secteur_interet?.name || 'N/A'}
        </div>
      )
    },
    {
      title: 'Capacité d\'investissement',
      key: 'capacite_investissement',
      render: (_, record) => (
        <div>
          <DollarOutlined style={{ marginRight: 6, color: '#52c41a' }} />
          {formatMoney(record.capacite_investissement, record.devise)}
        </div>
      )
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
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
                  key="actif" 
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, 'actif')}
                  disabled={record.statut === 'actif'}
                >
                  Actif
                </Menu.Item>
                <Menu.Item 
                  key="negociation" 
                  icon={<DollarOutlined />}
                  onClick={() => handleStatusChange(record.id, 'negociation')}
                  disabled={record.statut === 'negociation'}
                >
                  Négociation
                </Menu.Item>
                <Menu.Item 
                  key="engagement" 
                  icon={<AuditOutlined />}
                  onClick={() => handleStatusChange(record.id, 'engagement')}
                  disabled={record.statut === 'engagement'}
                >
                  Engagement
                </Menu.Item>
                <Menu.Item 
                  key="finalisation" 
                  icon={<ClockCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, 'finalisation')}
                  disabled={record.statut === 'finalisation'}
                >
                  Finalisation
                </Menu.Item>
                <Menu.Item 
                  key="investi" 
                  icon={<TrophyOutlined />}
                  onClick={() => handleStatusChange(record.id, 'investi')}
                  disabled={record.statut === 'investi'}
                >
                  Investi
                </Menu.Item>
                <Menu.Item 
                  key="suspendu" 
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, 'suspendu')}
                  disabled={record.statut === 'suspendu'}
                >
                  Suspendu
                </Menu.Item>
                <Menu.Item 
                  key="inactif" 
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, 'inactif')}
                  disabled={record.statut === 'inactif'}
                >
                  Inactif
                </Menu.Item>
              </Menu.SubMenu>
              <Menu.Divider />
              <Menu.Item 
                key="convert" 
                icon={<SwapOutlined />}
                onClick={() => handleConvertToProject(record.id, record.nom)}
                disabled={record.statut === 'converti'}
              >
                Convertir en projet
              </Menu.Item>
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
          <FundOutlined /> Investisseurs
        </Breadcrumb.Item>
      </Breadcrumb>

      {/* En-tête avec le style CRM */}
      <div className="crm-header">
        <div className="crm-title">
          <div className="crm-lead-label">
            <FundOutlined /> Gestion des <span className="lead-name">Investisseurs</span>
          </div>
          <div className="crm-lead-actions">
            <Text type="secondary">Suivi et gestion de tous les investisseurs</Text>
          </div>
        </div>

       
      </div>

      {/* Méta-informations */}
      <div className="crm-meta-info">
        <div className="crm-meta-item">
          <div className="crm-meta-label">TOTAL:</div>
          <div className="crm-meta-value">
            <Badge status="processing" text={`${stats.total} investisseurs`} />
          </div>
        </div>
        <div className="crm-meta-item">
          <div className="crm-meta-label">ACTIFS:</div>
          <div className="crm-meta-value">
            <Badge status="success" text={`${stats.actif} investisseurs`} />
          </div>
        </div>
        <div className="crm-meta-item">
          <div className="crm-meta-label">NÉGOCIATION:</div>
          <div className="crm-meta-value">
            <Badge status="warning" text={`${stats.negociation} investisseurs`} />
          </div>
        </div>
        <div className="crm-meta-item">
          <div className="crm-meta-label">INVESTIS:</div>
          <div className="crm-meta-value">
            <Badge status="success" text={`${stats.investi} investisseurs`} />
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
                prefix={<FundOutlined />} 
                valueStyle={{ color: '#722ed1' }}
              />
              <div className="stat-progress">
                <Progress percent={100} showInfo={false} strokeColor="#722ed1" />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="stat-card">
              <Statistic 
                title="Actifs" 
                value={stats.actif} 
                prefix={<CheckCircleOutlined />} 
                valueStyle={{ color: '#52c41a' }}
              />
              <div className="stat-progress">
                <Progress 
                  percent={stats.total ? Math.round((stats.actif / stats.total) * 100) : 0} 
                  showInfo={false}
                  strokeColor="#52c41a" 
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="stat-card">
              <Statistic 
                title="En négociation" 
                value={stats.negociation} 
                prefix={<DollarOutlined />} 
                valueStyle={{ color: '#faad14' }}
              />
              <div className="stat-progress">
                <Progress 
                  percent={stats.total ? Math.round((stats.negociation / stats.total) * 100) : 0} 
                  showInfo={false}
                  strokeColor="#faad14" 
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="stat-card">
              <Statistic 
                title="Engagement" 
                value={stats.engagement} 
                prefix={<AuditOutlined />} 
                valueStyle={{ color: '#1890ff' }}
              />
              <div className="stat-progress">
                <Progress 
                  percent={stats.total ? Math.round((stats.engagement / stats.total) * 100) : 0} 
                  showInfo={false}
                  strokeColor="#1890ff" 
                />
              </div>
            </Card>
          </Col>
        </Row>
        <Row gutter={[16, 16]} className="stats-cards-row">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="stat-card">
              <Statistic 
                title="Finalisation" 
                value={stats.finalisation} 
                prefix={<ClockCircleOutlined />} 
                valueStyle={{ color: '#13c2c2' }}
              />
              <div className="stat-progress">
                <Progress 
                  percent={stats.total ? Math.round((stats.finalisation / stats.total) * 100) : 0} 
                  showInfo={false}
                  strokeColor="#13c2c2" 
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="stat-card">
              <Statistic 
                title="Investis" 
                value={stats.investi} 
                prefix={<TrophyOutlined />} 
                valueStyle={{ color: '#722ed1' }}
              />
              <div className="stat-progress">
                <Progress 
                  percent={stats.total ? Math.round((stats.investi / stats.total) * 100) : 0} 
                  showInfo={false}
                  strokeColor="#722ed1" 
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="stat-card">
              <Statistic 
                title="Suspendus" 
                value={stats.suspendu} 
                prefix={<CloseCircleOutlined />} 
                valueStyle={{ color: '#f5222d' }}
              />
              <div className="stat-progress">
                <Progress 
                  percent={stats.total ? Math.round((stats.suspendu / stats.total) * 100) : 0} 
                  showInfo={false}
                  strokeColor="#f5222d" 
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="stat-card">
              <Statistic 
                title="Inactifs" 
                value={stats.inactif} 
                prefix={<CloseCircleOutlined />} 
                valueStyle={{ color: '#d9d9d9' }}
              />
              <div className="stat-progress">
                <Progress 
                  percent={stats.total ? Math.round((stats.inactif / stats.total) * 100) : 0} 
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
                  <div>Liste des investisseurs</div>
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
                        onChange={(value) => handleFilterChange('statut', value)}
                        value={filters.statut}
                      >
                        <Option value="actif">Actif</Option>
                        <Option value="negociation">Négociation</Option>
                        <Option value="engagement">Engagement</Option>
                        <Option value="finalisation">Finalisation</Option>
                        <Option value="investi">Investi</Option>
                        <Option value="suspendu">Suspendu</Option>
                        <Option value="inactif">Inactif</Option>
                      </Select>
                    </Col>
                    <Col span={6}>
                      <Select
                        style={{ width: '100%' }}
                        placeholder="Type d'investisseur"
                        allowClear
                        onChange={(value) => handleFilterChange('type_investisseur', value)}
                        value={filters.type_investisseur}
                      >
                        <Option value="individuel">Individuel</Option>
                        <Option value="institutionnel">Institutionnel</Option>
                        <Option value="fonds_investissement">Fonds d'investissement</Option>
                        <Option value="business_angel">Business Angel</Option>
                        <Option value="autre">Autre</Option>
                      </Select>
                    </Col>
                    <Col span={6}>
                      <Select
                        style={{ width: '100%' }}
                        placeholder="Secteur d'intérêt"
                        allowClear
                        onChange={(value) => handleFilterChange('secteur_interet_id', value)}
                        value={filters.secteur_interet_id}
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
                  </Row>
                  <Row gutter={16} style={{ marginTop: 16 }}>
                    <Col span={12}>
                      <Input.Search
                        placeholder="Recherche par devise..."
                        allowClear
                        onSearch={(value) => handleFilterChange('devise', value)}
                      />
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
                    <Text strong>{`${selectedRows.length} investisseur(s) sélectionné(s)`}</Text>
                    <Dropdown
                      overlay={
                        <Menu onClick={({ key }) => handleBatchAction(key)}>
                          <Menu.SubMenu key="status" title="Changer le statut">
                            <Menu.Item key="status:actif">Actif</Menu.Item>
                            <Menu.Item key="status:negociation">Négociation</Menu.Item>
                            <Menu.Item key="status:engagement">Engagement</Menu.Item>
                            <Menu.Item key="status:finalisation">Finalisation</Menu.Item>
                            <Menu.Item key="status:investi">Investi</Menu.Item>
                            <Menu.Item key="status:suspendu">Suspendu</Menu.Item>
                            <Menu.Item key="status:inactif">Inactif</Menu.Item>
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
                  dataSource={safeInvestisseurs}
                  rowKey="id"
                  loading={loading}
                  rowSelection={rowSelection}
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: pagination?.total || 0,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} investisseurs`
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
                  ) : safeInvestisseurs && safeInvestisseurs.length > 0 ? (
                    <Row gutter={[16, 16]} className="cards-container">
                      {safeInvestisseurs.map(investisseur => (
                        <Col xs={24} sm={12} md={8} lg={6} key={investisseur.id}>
                          <Card
                            hoverable
                            className="investisseur-card"
                            onClick={() => handleView(investisseur.id)}
                            actions={[
                              <Tooltip title="Voir"><EyeOutlined onClick={(e) => {
                                e.stopPropagation();
                                handleView(investisseur.id);
                              }} /></Tooltip>,
                              <Tooltip title="Modifier"><EditOutlined onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(investisseur.id);
                              }} /></Tooltip>,
                             
                              <Tooltip title="Supprimer"><DeleteOutlined onClick={(e) => {
                                e.stopPropagation();
                                showDeleteConfirm(investisseur.id, investisseur.nom);
                              }} /></Tooltip>,
                            ]}
                          >
                            <div className="card-avatar">
                              <Avatar 
                                size={64} 
                                icon={<FundOutlined />} 
                                style={{ 
                                  backgroundColor: '#722ed1'
                                }} 
                              />
                              {investisseur.statut === 'converti' && (
                                <div className="converted-badge">
                                  <Badge status="success" text="Converti" />
                                </div>
                              )}
                            </div>
                            <div className="card-content">
                              <div className="card-name">
                                {investisseur.nom}
                              </div>
                              <div className="card-company">{investisseur.type_investisseur || 'N/A'}</div>
                              <div className="card-status">{renderStatus(investisseur.statut)}</div>
                              <div className="card-meta">
                                <div className="card-meta-item">
                                  <MailOutlined /> {investisseur.email || 'N/A'}
                                </div>
                                {investisseur.telephone && (
                                  <div className="card-meta-item">
                                    <PhoneOutlined /> {investisseur.telephone}
                                  </div>
                                )}
                                <div className="card-meta-item">
                                  <GlobalOutlined /> {investisseur.secteur_interet?.name || 'N/A'}
                                </div>
                                <div className="card-meta-item">
                                  <DollarOutlined /> {formatMoney(investisseur.capacite_investissement, investisseur.devise)}
                                </div>
                                <div className="card-meta-item">
                                  <CalendarOutlined /> {investisseur.created_at ? moment(investisseur.created_at).format('DD/MM/YYYY') : 'N/A'}
                                </div>
                                {investisseur.responsable?.name && (
                                  <div className="card-meta-item">
                                    <UserOutlined /> {investisseur.responsable.name}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Empty description="Aucun investisseur trouvé" />
                  )}
                  
                  {/* Pagination pour le mode cartes */}
                  {safeInvestisseurs && safeInvestisseurs.length > 0 && (
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
                        showTotal={(total, range) => `${range[0]}-${range[1]} sur ${total} investisseurs`}
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
          color: #722ed1;
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
          background-color: #722ed1;
          border-color: #722ed1;
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
        
        .investisseur-name-cell {
          display: flex;
          align-items: center;
        }
        
        .contact-info {
          display: flex;
          flex-direction: column;
        }
        
        .cards-container {
          margin-top: 16px;
        }
        
        .investisseur-card {
          border-radius: 8px;
          transition: all 0.3s;
          overflow: hidden;
        }
        
        .investisseur-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .card-avatar {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
          position: relative;
        }
        
        .converted-badge {
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
        
        .tab-content {
          padding: 16px;
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

export default InvestisseursList;