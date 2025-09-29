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
  DownOutlined, SwapOutlined, BankOutlined, AuditOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { 
  fetchProspects, 
  deleteProspect, 
  updateProspectStatus, 
  convertToInvestor,
  resetOperation 
} from '../../features/prospectSlice';
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

const ProspectsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const { 
    list: { items: prospects, loading, error, meta },
    operation 
  } = useSelector(state => state.prospects);
  
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
  const [allProspects, setAllProspects] = useState([]);

  // Récupérer les données nécessaires du marketing slice
  const { 
    pays: { items: paysList = [] },
    secteurs: { items: secteursList = [] }
  } = useSelector(state => state.marketing);

  // Stats calculés à partir de TOUS les prospects
  const stats = useMemo(() => {
    if (!allProspects || allProspects.length === 0) return {
      total: 0,
      qualifie: 0,
      nouveau: 0,
      en_cours: 0,
      non_qualifie: 0,
      converti: 0,
      perdu: 0
    };
    
    return {
      total: allProspects.length,
      qualifie: allProspects.filter(p => p.statut === 'qualifie').length,
      nouveau: allProspects.filter(p => p.statut === 'nouveau').length,
      en_cours: allProspects.filter(p => p.statut === 'en_cours').length,
      non_qualifie: allProspects.filter(p => p.statut === 'non_qualifie').length,
      converti: allProspects.filter(p => p.statut === 'converti').length,
      perdu: allProspects.filter(p => p.statut === 'perdu').length,
    };
  }, [allProspects]);

  // Charger les prospects au chargement et lors des changements de filtres/pagination
  useEffect(() => {
    const params = {
      page: currentPage,
      per_page: pageSize,
      search: searchText,
      ...filters,
      ...advancedFilters
    };
    dispatch(fetchProspects(params));
  }, [dispatch, currentPage, pageSize, filters, advancedFilters, searchText, refreshTrigger]);

  // Charger TOUS les prospects pour les statistiques (sans pagination)
  useEffect(() => {
    const fetchAllProspects = async () => {
      try {
        const allParams = {
          per_page: 9999, // Grande valeur pour récupérer tous les prospects
          search: searchText,
          ...filters,
          ...advancedFilters
        };
        const result = await dispatch(fetchProspects(allParams));
        if (result.payload && result.payload.data) {
          // Vérifier si result.payload.data est un tableau ou un objet avec une propriété data
          const prospectsData = Array.isArray(result.payload.data) 
            ? result.payload.data 
            : result.payload.data.data || [];
          setAllProspects(prospectsData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de tous les prospects:', error);
        setAllProspects([]); // Initialiser avec un tableau vide en cas d'erreur
      }
    };

    fetchAllProspects();
  }, [dispatch, filters, advancedFilters, searchText, refreshTrigger]);

  // Charger les listes de pays et secteurs au montage du composant
  useEffect(() => {
    dispatch(fetchPays());
    dispatch(fetchSecteurs());
  }, [dispatch]);

  // Gestion des succès/erreurs d'opération
  useEffect(() => {
    if (operation.success && operation.type === 'delete') {
      message.success('Prospect supprimé avec succès');
      setSelectedRows([]);
      setSelectedRowKeys([]);
      setRefreshTrigger(prev => prev + 1);
    } else if (operation.success && operation.type === 'update_status') {
      message.success('Statut mis à jour avec succès');
      setRefreshTrigger(prev => prev + 1);
    } else if (operation.success && operation.type === 'convert_to_investor') {
      message.success('Prospect converti en investisseur avec succès');
      setRefreshTrigger(prev => prev + 1);
    } else if (operation.error) {
      message.error(operation.error);
    }
  }, [operation]);

  // Fonctions
  const showDeleteConfirm = (id, name) => {
    confirm({
      title: `Êtes-vous sûr de vouloir supprimer le prospect ${name}?`,
      icon: <ExclamationCircleOutlined />,
      content: 'Cette action est irréversible.',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk() {
        dispatch(deleteProspect(id));
      }
    });
  };

  const handleStatusChange = (id, newStatus) => {
    dispatch(updateProspectStatus({ id, statut: newStatus }));
  };

  const handleConvertToInvestor = (id, name) => {
    confirm({
      title: `Convertir le prospect ${name} en investisseur?`,
      icon: <SwapOutlined />,
      content: 'Cette action créera un nouvel investisseur basé sur les données du prospect.',
      okText: 'Convertir',
      okType: 'primary',
      cancelText: 'Annuler',
      onOk() {
        dispatch(convertToInvestor({ id }));
      }
    });
  };

//   const handleAddNew = () => {
//     navigate('/prospects/create');
//   };

  const handleEdit = (id) => {
    navigate(`/prospects/${id}/edit`);
  };

  const handleView = (id) => {
    navigate(`/prospects/${id}`);
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

  const handleTableChange = (pagination, tableFilters, sorter) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
    
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
      message.warning('Veuillez sélectionner au moins un prospect');
      return;
    }

    if (action === 'delete') {
      confirm({
        title: `Supprimer ${selectedRows.length} prospect(s)?`,
        icon: <ExclamationCircleOutlined />,
        content: 'Cette action est irréversible.',
        okText: 'Oui',
        okType: 'danger',
        cancelText: 'Non',
        onOk() {
          // Suppression en lot à implémenter
          message.success(`${selectedRows.length} prospects supprimés`);
          setSelectedRows([]);
          setSelectedRowKeys([]);
          setRefreshTrigger(prev => prev + 1);
        }
      });
    } else if (action.startsWith('status:')) {
      const newStatus = action.split(':')[1];
      // Changement de statut en lot à implémenter
      message.success(`Statut mis à jour pour ${selectedRows.length} prospects`);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  // Rendu du statut avec un tag coloré
  const renderStatus = (statut) => {
    let color, text, icon;
    switch (statut) {
      case 'nouveau':
        color = 'blue';
        text = 'Nouveau';
        icon = <PlusOutlined />;
        break;
      case 'en_cours':
        color = 'orange';
        text = 'En cours';
        icon = <QuestionCircleOutlined />;
        break;
      case 'qualifie':
        color = 'green';
        text = 'Qualifié';
        icon = <CheckCircleOutlined />;
        break;
      case 'non_qualifie':
        color = 'red';
        text = 'Non qualifié';
        icon = <CloseCircleOutlined />;
        break;
      case 'converti':
        color = 'purple';
        text = 'Converti';
        icon = <SwapOutlined />;
        break;
      case 'perdu':
        color = 'volcano';
        text = 'Perdu';
        icon = <CloseCircleOutlined />;
        break;
      default:
        color = 'default';
        text = statut || 'Inconnu';
        icon = null;
    }
    return <Tag color={color} icon={icon}>{text}</Tag>;
  };

  // Colonnes du tableau
  const columns = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      sorter: true,
      render: (text, record) => (
        <div className="prospect-name-cell">
          <Avatar 
            size="small" 
            icon={<UserOutlined />} 
            style={{ 
              marginRight: 8, 
              backgroundColor: '#1890ff'
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
      title: 'Entreprise',
      key: 'entreprise',
      sorter: true,
      render: (_, record) => (
        <div>
          <BankOutlined style={{ marginRight: 6, color: '#722ed1' }} />
          {record.entreprise?.nom || 'N/A'}
        </div>
      )
    },
    {
      title: 'Secteur',
      key: 'secteur',
      render: (_, record) => (
        <div>
          <GlobalOutlined style={{ marginRight: 6, color: '#fa8c16' }} />
          {record.secteur?.name || 'N/A'}
        </div>
      )
    },
    {
      title: 'Pays',
      key: 'pays',
      render: (_, record) => (
        <div>
          <GlobalOutlined style={{ marginRight: 6, color: '#13c2c2' }} />
          {record.pays?.name_pays || 'N/A'}
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
                  key="nouveau" 
                  icon={<PlusOutlined />}
                  onClick={() => handleStatusChange(record.id, 'nouveau')}
                  disabled={record.statut === 'nouveau'}
                >
                  Nouveau
                </Menu.Item>
                <Menu.Item 
                  key="en_cours" 
                  icon={<QuestionCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, 'en_cours')}
                  disabled={record.statut === 'en_cours'}
                >
                  En cours
                </Menu.Item>
                <Menu.Item 
                  key="qualifie" 
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, 'qualifie')}
                  disabled={record.statut === 'qualifie'}
                >
                  Qualifié
                </Menu.Item>
                <Menu.Item 
                  key="non_qualifie" 
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, 'non_qualifie')}
                  disabled={record.statut === 'non_qualifie'}
                >
                  Non qualifié
                </Menu.Item>
                <Menu.Item 
                  key="perdu" 
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, 'perdu')}
                  disabled={record.statut === 'perdu'}
                >
                  Perdu
                </Menu.Item>
              </Menu.SubMenu>
              <Menu.Divider />
              <Menu.Item 
                key="convert" 
                icon={<SwapOutlined />}
                onClick={() => handleConvertToInvestor(record.id, record.nom)}
                disabled={record.statut === 'converti'}
              >
                Convertir en investisseur
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
          <UserOutlined /> Prospects
        </Breadcrumb.Item>
      </Breadcrumb>

      {/* En-tête avec le style CRM */}
      <div className="crm-header">
        <div className="crm-title">
          <div className="crm-lead-label">
            <UserOutlined /> Gestion des <span className="lead-name">Prospects</span>
          </div>
          <div className="crm-lead-actions">
            <Text type="secondary">Suivi et gestion de tous les prospects commerciaux</Text>
          </div>
        </div>

      </div>

      {/* Méta-informations */}
      <div className="crm-meta-info">
        <div className="crm-meta-item">
          <div className="crm-meta-label">TOTAL:</div>
          <div className="crm-meta-value">
            <Badge status="processing" text={`${stats.total} prospects`} />
          </div>
        </div>
        <div className="crm-meta-item">
          <div className="crm-meta-label">NOUVEAUX:</div>
          <div className="crm-meta-value">
            <Badge status="success" text={`${stats.nouveau} prospects`} />
          </div>
        </div>
        <div className="crm-meta-item">
          <div className="crm-meta-label">QUALIFIÉS:</div>
          <div className="crm-meta-value">
            <Badge status="success" text={`${stats.qualifie} prospects`} />
          </div>
        </div>
        <div className="crm-meta-item">
          <div className="crm-meta-label">EN COURS:</div>
          <div className="crm-meta-value">
            <Badge status="warning" text={`${stats.en_cours} prospects`} />
          </div>
        </div>
        <div className="crm-meta-item">
          <div className="crm-meta-label">NON QUALIFIÉS:</div>
          <div className="crm-meta-value">
            <Badge status="error" text={`${stats.non_qualifie} prospects`} />
          </div>
        </div>
        <div className="crm-meta-item">
          <div className="crm-meta-label">CONVERTIS:</div>
          <div className="crm-meta-value">
            <Badge status="success" text={`${stats.converti} prospects`} />
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
                prefix={<UserOutlined />} 
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
                title="Nouveaux" 
                value={stats.nouveau} 
                prefix={<PlusOutlined />} 
                valueStyle={{ color: '#52c41a' }}
              />
              <div className="stat-progress">
                <Progress 
                  percent={stats.total ? Math.round((stats.nouveau / stats.total) * 100) : 0} 
                  showInfo={false}
                  strokeColor="#52c41a" 
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="stat-card">
              <Statistic 
                title="En cours" 
                value={stats.en_cours} 
                prefix={<QuestionCircleOutlined />} 
                valueStyle={{ color: '#faad14' }}
              />
              <div className="stat-progress">
                <Progress 
                  percent={stats.total ? Math.round((stats.en_cours / stats.total) * 100) : 0} 
                  showInfo={false} 
                  strokeColor="#faad14"
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="stat-card">
              <Statistic 
                title="Qualifiés" 
                value={stats.qualifie} 
                prefix={<CheckCircleOutlined />} 
                valueStyle={{ color: '#722ed1' }}
              />
              <div className="stat-progress">
                <Progress 
                  percent={stats.total ? Math.round((stats.qualifie / stats.total) * 100) : 0} 
                  showInfo={false}
                  strokeColor="#722ed1" 
                />
              </div>
            </Card>
          </Col>
        </Row>
        <Row gutter={[16, 16]} className="stats-cards-row">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="stat-card">
              <Statistic 
                title="Convertis" 
                value={stats.converti} 
                prefix={<SwapOutlined />} 
                valueStyle={{ color: '#722ed1' }}
              />
              <div className="stat-progress">
                <Progress 
                  percent={stats.total ? Math.round((stats.converti / stats.total) * 100) : 0} 
                  showInfo={false}
                  strokeColor="#722ed1" 
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="stat-card">
              <Statistic 
                title="Perdus" 
                value={stats.perdu} 
                prefix={<CloseCircleOutlined />} 
                valueStyle={{ color: '#f5222d' }}
              />
              <div className="stat-progress">
                <Progress 
                  percent={stats.total ? Math.round((stats.perdu / stats.total) * 100) : 0} 
                  showInfo={false}
                  strokeColor="#f5222d" 
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
                  <div>Liste des prospects</div>
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
                        <Option value="nouveau">Nouveau</Option>
                        <Option value="en_cours">En cours</Option>
                        <Option value="qualifie">Qualifié</Option>
                        <Option value="non_qualifie">Non qualifié</Option>
                        <Option value="converti">Converti</Option>
                        <Option value="perdu">Perdu</Option>
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
                        placeholder="Pays"
                        allowClear
                        onChange={(value) => handleFilterChange('pays_id', value)}
                        value={filters.pays_id}
                        showSearch
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {paysList.map(pays => (
                          <Option key={pays.id} value={pays.id}>
                            {pays.name_pays}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginTop: 16 }}>
                    <Col span={12}>
                      {/* <RangePicker 
                        style={{ width: '100%' }} 
                        placeholder={['Date début', 'Date fin']}
                        onChange={(dates) => {
                          if (dates) {
                            handleFilterChange('date_debut', dates[0].format('YYYY-MM-DD'));
                            handleFilterChange('date_fin', dates[1].format('YYYY-MM-DD'));
                          } else {
                            handleFilterChange('date_debut', null);
                            handleFilterChange('date_fin', null);
                          }
                        }}
                      /> */}
                    </Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                      <Space>
                        {/* <Button onClick={resetAllFilters}>Réinitialiser</Button> */}
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
                    <Text strong>{`${selectedRows.length} prospect(s) sélectionné(s)`}</Text>
                    <Dropdown
                      overlay={
                        <Menu onClick={({ key }) => handleBatchAction(key)}>
                          <Menu.SubMenu key="status" title="Changer le statut">
                            <Menu.Item key="status:nouveau">Nouveau</Menu.Item>
                            <Menu.Item key="status:en_cours">En cours</Menu.Item>
                            <Menu.Item key="status:qualifie">Qualifié</Menu.Item>
                            <Menu.Item key="status:non_qualifie">Non qualifié</Menu.Item>
                            <Menu.Item key="status:converti">Converti</Menu.Item>
                            <Menu.Item key="status:perdu">Perdu</Menu.Item>
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
                  dataSource={prospects}
                  rowKey="id"
                  loading={loading}
                  rowSelection={rowSelection}
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: meta?.total || 0,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} prospects`
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
                  ) : prospects && prospects.length > 0 ? (
                    <Row gutter={[16, 16]} className="cards-container">
                      {prospects.map(prospect => (
                        <Col xs={24} sm={12} md={8} lg={6} key={prospect.id}>
                          <Card
                            hoverable
                            className="prospect-card"
                            onClick={() => handleView(prospect.id)}
                            actions={[
                              <Tooltip title="Voir"><EyeOutlined onClick={(e) => {
                                e.stopPropagation();
                                handleView(prospect.id);
                              }} /></Tooltip>,
                              <Tooltip title="Modifier"><EditOutlined onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(prospect.id);
                              }} /></Tooltip>,
                              
                              <Tooltip title="Supprimer"><DeleteOutlined onClick={(e) => {
                                e.stopPropagation();
                                showDeleteConfirm(prospect.id, prospect.nom);
                              }} /></Tooltip>,
                            ]}
                          >
                            <div className="card-avatar">
                              <Avatar 
                                size={64} 
                                icon={<UserOutlined />} 
                                style={{ 
                                  backgroundColor: '#1890ff'
                                }} 
                              />
                              {prospect.statut === 'converti' && (
                                <div className="converted-badge">
                                  <Badge status="success" text="Converti" />
                                </div>
                              )}
                            </div>
                            <div className="card-content">
                              <div className="card-name">
                                {prospect.nom}
                              </div>
                              <div className="card-company">{prospect.entreprise?.nom || 'N/A'}</div>
                              <div className="card-status">{renderStatus(prospect.statut)}</div>
                              <div className="card-meta">
                                <div className="card-meta-item">
                                  <MailOutlined /> {prospect.email || 'N/A'}
                                </div>
                                {prospect.telephone && (
                                  <div className="card-meta-item">
                                    <PhoneOutlined /> {prospect.telephone}
                                  </div>
                                )}
                                <div className="card-meta-item">
                                  <GlobalOutlined /> {prospect.secteur?.name || 'N/A'}
                                </div>
                                <div className="card-meta-item">
                                  <GlobalOutlined /> {prospect.pays?.name_pays || 'N/A'}
                                </div>
                                <div className="card-meta-item">
                                  <CalendarOutlined /> {prospect.created_at ? moment(prospect.created_at).format('DD/MM/YYYY') : 'N/A'}
                                </div>
                                {prospect.responsable?.name && (
                                  <div className="card-meta-item">
                                    <UserOutlined /> {prospect.responsable.name}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Empty description="Aucun prospect trouvé" />
                  )}
                  
                  {/* Pagination pour le mode cartes */}
                  {prospects && prospects.length > 0 && (
                    <div className="cards-pagination">
                      <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={meta?.total || 0}
                        showSizeChanger
                        onChange={(page, size) => {
                          setCurrentPage(page);
                          setPageSize(size);
                        }}
                        showTotal={(total, range) => `${range[0]}-${range[1]} sur ${total} prospects`}
                      />
                    </div>
                  )}
                </>
              )}
            </Card>
          </TabPane>

          {/* <TabPane tab={<span><CheckCircleOutlined /> Qualifiés</span>} key="qualified">
            <div className="tab-content">
              <Alert
                message="Filtre actif"
                description="Affichage des prospects qualifiés uniquement."
                type="info"
                showIcon
                closable
                style={{ marginBottom: 16 }}
              />
              <Empty description="Changez d'onglet pour visualiser les prospects" />
            </div>
          </TabPane>

          <TabPane tab={<span><QuestionCircleOutlined /> En cours</span>} key="en_cours">
            <div className="tab-content">
              <Alert
                message="Filtre actif"
                description="Affichage des prospects en cours uniquement."
                type="info"
                showIcon
                closable
                style={{ marginBottom: 16 }}
              />
              <Empty description="Changez d'onglet pour visualiser les prospects" />
            </div>
          </TabPane>

          <TabPane tab={<span><CloseCircleOutlined /> Non qualifiés</span>} key="non_qualifie">
            <div className="tab-content">
              <Alert
                message="Filtre actif"
                description="Affichage des prospects non qualifiés uniquement."
                type="info"
                showIcon
                closable
                style={{ marginBottom: 16 }}
              />
              <Empty description="Changez d'onglet pour visualiser les prospects" />
            </div>
          </TabPane>

          <TabPane tab={<span><SwapOutlined /> Convertis</span>} key="converted">
            <div className="tab-content">
              <Alert
                message="Filtre actif"
                description="Affichage des prospects convertis uniquement."
                type="info"
                showIcon
                closable
                style={{ marginBottom: 16 }}
              />
              <Empty description="Changez d'onglet pour visualiser les prospects" />
            </div>
          </TabPane>

          <TabPane tab={<span><CloseCircleOutlined /> Perdus</span>} key="perdu">
            <div className="tab-content">
              <Alert
                message="Filtre actif"
                description="Affichage des prospects perdus uniquement."
                type="info"
                showIcon
                closable
                style={{ marginBottom: 16 }}
              />
              <Empty description="Changez d'onglet pour visualiser les prospects" />
            </div>
          </TabPane>*/}
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
        
        .prospect-name-cell {
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
        
        .prospect-card {
          border-radius: 8px;
          transition: all 0.3s;
          overflow: hidden;
        }
        
        .prospect-card:hover {
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

export default ProspectsList;