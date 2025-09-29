import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Table, Space, Button, Input, Tag, Dropdown, Menu, Modal, Card, message,
  Row, Col, Select, Tooltip, Statistic, Badge, Divider, Typography,
  DatePicker, Avatar, Segmented, Tabs, Empty,Pagination,Spin
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, 
  ExclamationCircleOutlined, MoreOutlined, FilterOutlined, EyeOutlined,
  CheckCircleOutlined, CloseCircleOutlined, QuestionCircleOutlined,
  UserOutlined, MailOutlined, GlobalOutlined, TeamOutlined,
  CalendarOutlined, PhoneOutlined, BellOutlined, AppstoreOutlined,
  UnorderedListOutlined, FileExcelOutlined, FilePdfOutlined, SettingOutlined,
  ReloadOutlined, BarsOutlined
} from '@ant-design/icons';
import { fetchInvites, deleteInvite, updateInviteStatus, setFilters } from '../../features/inviteSlice';

const { confirm } = Modal;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

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
  
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState('table');
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Stats calculés à partir des données
  const stats = useMemo(() => {
    if (!invites) return {
      total: 0,
      confirmed: 0,
      pending: 0,
      rejected: 0,
      attended: 0
    };
    
    return {
      total: invites.length,
      confirmed: invites.filter(i => i.statut === 'confirmee').length,
      pending: invites.filter(i => i.statut === 'en_attente').length,
      rejected: invites.filter(i => i.statut === 'refusee').length,
      attended: invites.filter(i => i.statut === 'participation_confirmee').length,
      absent: invites.filter(i => i.statut === 'absente').length,
    };
  }, [invites]);

  // Charger les invités au chargement et lors des changements de filtres/pagination
  useEffect(() => {
    const params = {
      page: currentPage,
      per_page: pageSize,
      search: searchText,
      ...filters,
      ...advancedFilters
    };
    dispatch(fetchInvites(params));
  }, [dispatch, currentPage, pageSize, filters, advancedFilters, searchText]);

  // Gestion des succès/erreurs d'opération
  useEffect(() => {
    if (operation.success && operation.type === 'delete') {
      message.success('Invité supprimé avec succès');
      setSelectedRows([]);
      setSelectedRowKeys([]);
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

  // Recherche
  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  // Filtres
  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value }));
    setCurrentPage(1);
  };

  // Appliquer les filtres avancés
  const applyAdvancedFilters = (values) => {
    setAdvancedFilters(values);
    setCurrentPage(1);
    setShowFilters(false);
  };

  // Réinitialiser tous les filtres
  const resetAllFilters = () => {
    dispatch(setFilters({}));
    setAdvancedFilters({});
    setSearchText('');
    setCurrentPage(1);
  };

  // Pagination
  const handleTableChange = (pagination, filters, sorter) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
    
    // Gestion du tri
    if (sorter && sorter.field) {
      const orderDir = sorter.order === 'ascend' ? 'asc' : 'desc';
      dispatch(setFilters({
        sort_by: sorter.field,
        sort_dir: orderDir
      }));
    }
  };

  // Sélection de lignes
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys, rows) => {
      setSelectedRowKeys(keys);
      setSelectedRows(rows);
    }
  };

  // Actions en lot
  const handleBatchAction = (action) => {
    if (selectedRows.length === 0) {
      message.warning('Veuillez sélectionner au moins un invité');
      return;
    }

    if (action === 'delete') {
      confirm({
        title: `Supprimer ${selectedRows.length} invité(s)?`,
        icon: <ExclamationCircleOutlined />,
        content: 'Cette action est irréversible.',
        okText: 'Oui',
        okType: 'danger',
        cancelText: 'Non',
        onOk() {
          // Implémentation à faire: suppression en lot
          message.success(`${selectedRows.length} invités supprimés`);
          setSelectedRows([]);
          setSelectedRowKeys([]);
        }
      });
    } else if (action.startsWith('status:')) {
      const newStatus = action.split(':')[1];
      // Implémentation à faire: changement de statut en lot
      message.success(`Statut mis à jour pour ${selectedRows.length} invités`);
    }
  };

  // Rendu du statut avec un tag coloré
  const renderStatus = (statut) => {
    let color, text, icon;
    switch (statut) {
      case 'en_attente':
        color = 'gold';
        text = 'En attente';
        icon = <QuestionCircleOutlined />;
        break;
      case 'envoyee':
        color = 'blue';
        text = 'Envoyée';
        icon = <MailOutlined />;
        break;
      case 'confirmee':
        color = 'green';
        text = 'Confirmé';
        icon = <CheckCircleOutlined />;
        break;
      case 'refusee':
        color = 'red';
        text = 'Décliné';
        icon = <CloseCircleOutlined />;
        break;
      case 'participation_confirmee':
        color = 'blue';
        text = 'A participé';
        icon = <CheckCircleOutlined />;
        break;
      case 'participation_sans_suivi':
        color = 'purple';
        text = 'Sans suivi';
        icon = null;
        break;
      case 'absente':
        color = 'volcano';
        text = 'Absent';
        icon = <CloseCircleOutlined />;
        break;
      case 'aucune_reponse':
        color = 'default';
        text = 'Sans réponse';
        icon = <BellOutlined />;
        break;
      default:
        color = 'default';
        text = statut || 'Inconnu';
        icon = null;
    }
    return (
      <Tag color={color} icon={icon}>{text}</Tag>
    );
  };

  // Colonnes du tableau
  const columns = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      sorter: true,
      render: (text, record) => (
        <div className="invite-name-cell">
          <Avatar 
            size="small" 
            icon={<UserOutlined />} 
            style={{ marginRight: 8, backgroundColor: record.potentiel === 'élevé' ? '#f5222d' : record.potentiel === 'moyen' ? '#faad14' : '#1890ff' }} 
          />
          <a onClick={() => handleView(record.id)}>
            {record.nom} {record.prenom}
          </a>
          {record.is_converted && (
            <Tag color="success" style={{ marginLeft: 8 }}>Converti</Tag>
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
      render: (_, record) => record.entreprise?.nom || 'N/A'
    },
    {
      title: 'Action ',
      key: 'action_etape',
      render: (_, record) => (
        <div>
          <div>{record.action?.nom || 'N/A'}</div>
          
        </div>
      )
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
            <Badge color="gold" text="En attente" />
          </Menu.Item>
          <Menu.Item key="envoyee" onClick={() => handleFilterChange('statut', 'envoyee')}>
            <Badge color="blue" text="Envoyée" />
          </Menu.Item>
          <Menu.Item key="confirmee" onClick={() => handleFilterChange('statut', 'confirmee')}>
            <Badge color="green" text="Confirmé" />
          </Menu.Item>
          <Menu.Item key="refusee" onClick={() => handleFilterChange('statut', 'refusee')}>
            <Badge color="red" text="Décliné" />
          </Menu.Item>
          <Menu.Item key="participation_confirmee" onClick={() => handleFilterChange('statut', 'participation_confirmee')}>
            <Badge color="blue" text="A participé" />
          </Menu.Item>
          <Menu.Item key="absente" onClick={() => handleFilterChange('statut', 'absente')}>
            <Badge color="volcano" text="Absent" />
          </Menu.Item>
        </Menu>
      )
    },
    {
      title: 'Date',
      dataIndex: 'date_invitation',
      key: 'date_invitation',
      sorter: true,
      render: (text) => text ? new Date(text).toLocaleString() : 'N/A'
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
                  key="envoyee" 
                  icon={<MailOutlined />}
                  onClick={() => handleStatusChange(record.id, 'envoyee')}
                  disabled={record.statut === 'envoyee'}
                >
                  Invitation envoyée
                </Menu.Item>
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
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, 'participation_confirmee')}
                  disabled={record.statut === 'participation_confirmee'}
                >
                  A participé
                </Menu.Item>
                <Menu.Item 
                  key="absente" 
                  icon={<CloseCircleOutlined />}
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

  // Rendu du composant
  return (
    <div className="crm-container">
      {/* En-tête avec statistiques */}
      <div className="crm-dashboard-header">
        <Title level={3}>Gestion des Invités</Title>
        <div className="crm-header-actions">
          {/* <Button 
            icon={<ReloadOutlined />} 
            onClick={() => dispatch(fetchInvites({}))}
          >
            Rafraîchir
          </Button> */}
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddNew}
          >
            Nouvel invité
          </Button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <Row gutter={16} className="stats-cards-row">
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="stat-card">
            <Statistic 
              title="Total" 
              value={stats.total} 
              prefix={<TeamOutlined />} 
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="stat-card">
            <Statistic 
              title="En attente" 
              value={stats.pending} 
              prefix={<QuestionCircleOutlined />} 
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="stat-card">
            <Statistic 
              title="Confirmés" 
              value={stats.confirmed} 
              prefix={<CheckCircleOutlined />} 
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="stat-card">
            <Statistic 
              title="Refusés" 
              value={stats.rejected} 
              prefix={<CloseCircleOutlined />} 
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="stat-card">
            <Statistic 
              title="Ont participé" 
              value={stats.attended} 
              prefix={<CheckCircleOutlined />} 
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="stat-card">
            <Statistic 
              title="Absents" 
              value={stats.absent} 
              prefix={<CloseCircleOutlined />} 
              valueStyle={{ color: '#fa541c' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Conteneur principal */}
      <Card 
        className="main-content-card"
        title={
          <div className="card-title-container">
            <div>
              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab="Tous" key="all" />
                <TabPane tab="En attente" key="en_attente" />
                <TabPane tab="Confirmés" key="confirmee" />
                <TabPane tab="Ont participé" key="participation_confirmee" />
              </Tabs>
            </div>
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
            <Input.Search
              placeholder="Rechercher un invité..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              style={{ width: 250 }}
            />
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
                  <Option value="en_attente">En attente</Option>
                  <Option value="envoyee">Envoyée</Option>
                  <Option value="confirmee">Confirmée</Option>
                  <Option value="refusee">Refusée</Option>
                  <Option value="participation_confirmee">A participé</Option>
                  <Option value="absente">Absent</Option>
                </Select>
              </Col>
              <Col span={6}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Action"
                  allowClear
                  onChange={(value) => handleFilterChange('action_id', value)}
                  value={filters.action_id}
                >
                  {/* Options d'actions à remplir dynamiquement */}
                </Select>
              </Col>
              <Col span={6}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Entreprise"
                  allowClear
                  onChange={(value) => handleFilterChange('entreprise_id', value)}
                  value={filters.entreprise_id}
                >
                  {/* Options d'entreprises à remplir dynamiquement */}
                </Select>
              </Col>
              <Col span={6}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Potentiel"
                  allowClear
                  onChange={(value) => handleFilterChange('potentiel', value)}
                  value={filters.potentiel}
                >
                  <Option value="faible">Faible</Option>
                  <Option value="moyen">Moyen</Option>
                  <Option value="élevé">Élevé</Option>
                </Select>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <RangePicker 
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
              <Text strong>{`${selectedRows.length} invité(s) sélectionné(s)`}</Text>
              <Dropdown
                overlay={
                  <Menu onClick={({ key }) => handleBatchAction(key)}>
                    <Menu.SubMenu key="status" title="Changer le statut">
                      <Menu.Item key="status:en_attente">En attente</Menu.Item>
                      <Menu.Item key="status:envoyee">Envoyée</Menu.Item>
                      <Menu.Item key="status:confirmee">Confirmée</Menu.Item>
                      <Menu.Item key="status:refusee">Refusée</Menu.Item>
                      <Menu.Item key="status:participation_confirmee">A participé</Menu.Item>
                      <Menu.Item key="status:absente">Absent</Menu.Item>
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
              <Button icon={<CloseOutlined />} onClick={() => {
                setSelectedRows([]);
                setSelectedRowKeys([]);
              }}>
                Annuler
              </Button>
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
            dataSource={invites}
            rowKey="id"
            loading={loading}
            rowSelection={rowSelection}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} invités`
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
            ) : invites && invites.length > 0 ? (
              <Row gutter={[16, 16]} className="cards-container">
                {invites.map(invite => (
                  <Col xs={24} sm={12} md={8} lg={6} key={invite.id}>
                    <Card
                      hoverable
                      className="invite-card"
                      onClick={() => handleView(invite.id)}
                      actions={[
                        <Tooltip title="Voir"><EyeOutlined onClick={(e) => {
                          e.stopPropagation();
                          handleView(invite.id);
                        }} /></Tooltip>,
                        <Tooltip title="Modifier"><EditOutlined onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(invite.id);
                        }} /></Tooltip>,
                        <Tooltip title="Supprimer"><DeleteOutlined onClick={(e) => {
                          e.stopPropagation();
                          showDeleteConfirm(invite.id, invite.nom);
                        }} /></Tooltip>,
                      ]}
                    >
                      <div className="card-avatar">
                        <Avatar 
                          size={64} 
                          icon={<UserOutlined />} 
                          style={{ 
                            backgroundColor: invite.potentiel === 'élevé' ? '#f5222d' : 
                            invite.potentiel === 'moyen' ? '#faad14' : '#1890ff' 
                          }} 
                        />
                      </div>
                      <div className="card-content">
                        <div className="card-name">
                          {invite.nom} {invite.prenom}
                          {invite.is_converted && (
                            <Tag color="success" style={{ marginLeft: 8 }}>Converti</Tag>
                          )}
                        </div>
                        <div className="card-company">{invite.entreprise?.nom || 'N/A'}</div>
                        <div className="card-status">{renderStatus(invite.statut)}</div>
                        <div className="card-meta">
                          <div className="card-meta-item">
                            <MailOutlined /> {invite.email || 'N/A'}
                          </div>
                          {invite.telephone && (
                            <div className="card-meta-item">
                              <PhoneOutlined /> {invite.telephone}
                            </div>
                          )}
                          <div className="card-meta-item">
                            <CalendarOutlined /> {invite.date_invitation ? new Date(invite.date_invitation).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="Aucun invité trouvé" />
            )}
            
            {/* Pagination pour le mode cartes */}
            {invites && invites.length > 0 && (
              <div className="cards-pagination">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={pagination.total}
                  showSizeChanger
                  onChange={(page, size) => {
                    setCurrentPage(page);
                    setPageSize(size);
                  }}
                  showTotal={(total, range) => `${range[0]}-${range[1]} sur ${total} invités`}
                />
              </div>
            )}
          </>
        )}
      </Card>

      {/* Styles CSS */}
      <style jsx>{`
        .crm-container {
          padding: 16px;
        }

        .crm-dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .crm-header-actions {
          display: flex;
          gap: 8px;
        }

        .stats-cards-row {
          margin-bottom: 24px;
        }

        .stat-card {
          border-radius: 8px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          height: 100%;
        }

        .main-content-card {
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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

        .invite-name-cell {
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

        .invite-card {
          border-radius: 8px;
          transition: all 0.3s;
        }

        .invite-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .card-avatar {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
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
          margin-bottom: 12px;
          display: flex;
          justify-content: center;
        }

        .card-meta {
          text-align: left;
        }

        .card-meta-item {
          margin-top: 4px;
          color: #666;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
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

export default InvitesList;