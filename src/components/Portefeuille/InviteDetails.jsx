import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Button,
  Space,
  Spin,
  Tag,
  Tabs,
  Typography,
  Modal,
  message,
  Divider,
  Row,
  Col,
  Breadcrumb,
  Statistic,
  Tooltip,
  Badge,
  Dropdown,
  Menu
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  BankOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  DownOutlined,
  EllipsisOutlined,
  HistoryOutlined,
  MessageOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { 
  getInviteById, 
  deleteInvite, 
  updateInviteStatus,
  resetOperation 
} from '../../features/inviteSlice';
import moment from 'moment';
import '../../../src/assets/styles/action-form.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;

const InviteDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  
  const { 
    selectedInvite: { data: invite, loading, error },
    operation 
  } = useSelector(state => state.invites);

  // Charger les données de l'invité
  useEffect(() => {
    if (id) {
      dispatch(getInviteById(id));
    }
    
    return () => {
      dispatch(resetOperation());
    };
  }, [dispatch, id]);

  // Gérer les opérations réussies ou échouées
  useEffect(() => {
    if (operation.success && operation.type === 'delete') {
      message.success('Invité supprimé avec succès');
      navigate('/invites');
    } else if (operation.success && operation.type === 'update_status') {
      message.success('Statut mis à jour avec succès');
    } else if (operation.error) {
      message.error(operation.error);
    }
  }, [operation, navigate]);

  // Confirmation de suppression
  const showDeleteConfirm = () => {
    confirm({
      title: `Êtes-vous sûr de vouloir supprimer cet invité?`,
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

  // Modifier le statut
  const handleStatusChange = (newStatus) => {
    dispatch(updateInviteStatus({ id, statut: newStatus }));
  };

  // Menu pour le changement de statut
  const statusMenu = (
    <Menu>
      <Menu.Item key="en_attente" disabled={invite?.statut === 'en_attente'} onClick={() => handleStatusChange('en_attente')}>
        <Badge color="gold" text="En attente" />
      </Menu.Item>
      <Menu.Item key="confirmee" disabled={invite?.statut === 'confirmee'} onClick={() => handleStatusChange('confirmee')}>
        <Badge color="green" text="Confirmée" />
      </Menu.Item>
      <Menu.Item key="refusee" disabled={invite?.statut === 'refusee'} onClick={() => handleStatusChange('refusee')}>
        <Badge color="red" text="Refusée" />
      </Menu.Item>
      <Menu.Item key="participation_confirmee" disabled={invite?.statut === 'participation_confirmee'} onClick={() => handleStatusChange('participation_confirmee')}>
        <Badge color="blue" text="Participation confirmée" />
      </Menu.Item>
      <Menu.Item key="absente" disabled={invite?.statut === 'absente'} onClick={() => handleStatusChange('absente')}>
        <Badge color="volcano" text="Absente" />
      </Menu.Item>
    </Menu>
  );

  // Rendu du statut
  const renderStatus = (statut) => {
    let color, text, icon;
    switch (statut) {
      case 'en_attente':
        color = 'gold'; 
        text = 'En attente';
        icon = <QuestionCircleOutlined />;
        break;
      case 'confirmee':
        color = 'green'; 
        text = 'Confirmée';
        icon = <CheckCircleOutlined />;
        break;
      case 'refusee':
        color = 'red'; 
        text = 'Refusée';
        icon = <CloseCircleOutlined />;
        break;
      case 'participation_confirmee':
        color = 'blue'; 
        text = 'Participation confirmée';
        icon = <CheckCircleOutlined />;
        break;
      case 'absente':
        color = 'volcano'; 
        text = 'Absente';
        icon = <CloseCircleOutlined />;
        break;
      default:
        color = 'default'; 
        text = statut || 'Inconnu';
        icon = <InfoCircleOutlined />;
    }
    return (
      <Space>
        {icon}
        <Tag color={color}>{text}</Tag>
        <Dropdown overlay={statusMenu} trigger={['click']}>
          <Button type="link" size="small" icon={<DownOutlined />}>Changer</Button>
        </Dropdown>
      </Space>
    );
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    return moment(dateString).format('DD/MM/YYYY HH:mm');
  };

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Chargement des détails de l'invité..." />
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <Card className="error-card">
        <div className="error-message">
          <ExclamationCircleOutlined style={{ fontSize: 24, color: '#ff4d4f', marginBottom: 16 }} />
          <Title level={4}>Erreur lors du chargement</Title>
          <Text type="danger">{error}</Text>
          <Button type="primary" onClick={() => navigate('/invites')} style={{ marginTop: 16 }}>
            Retour à la liste
          </Button>
        </div>
      </Card>
    );
  }

  // Affichage si l'invité n'est pas trouvé
  if (!invite) {
    return (
      <Card className="not-found-card">
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <InfoCircleOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <Title level={4}>Invité non trouvé</Title>
          <Text>L'invité que vous recherchez n'existe pas ou a été supprimé.</Text>
          <div style={{ marginTop: 24 }}>
            <Button type="primary" onClick={() => navigate('/invites')}>
              Retour à la liste
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="action-detail-container">
      {/* Header avec breadcrumbs et boutons d'action */}
      <div className="action-form-header">
        <Breadcrumb className="breadcrumb-navigation">
          <Breadcrumb.Item>
            <Link to="/">Tableau de bord</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/invites">Invités</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            {invite.nom} {invite.prenom}
          </Breadcrumb.Item>
        </Breadcrumb>
        
        <div className="header-content">
          <div className="title-section">
            <Title level={3} className="no-margin">
              <UserOutlined /> {invite.nom} {invite.prenom}
            </Title>
            <div className="subtitle-info">
              <Space>
                {renderStatus(invite.statut)}
                <Divider type="vertical" />
                <Text type="secondary">
                  <Tooltip title="Date de création">
                    <CalendarOutlined /> {formatDate(invite.created_at)}
                  </Tooltip>
                </Text>
              </Space>
            </div>
          </div>
          
          <div className="header-actions">
            <Space>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/invites')}>
                Retour
              </Button>
              <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/invites/${id}/edit`)}>
                Modifier
              </Button>
              <Button danger icon={<DeleteOutlined />} onClick={showDeleteConfirm}>
                Supprimer
              </Button>
            </Space>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="detail-content">
        {/* Cartes de statistiques rapides */}
        <Row gutter={16} className="stats-row">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic 
                title="Type d'invité" 
                value={invite.type_invite === 'interne' ? 'Interne' : 'Externe'} 
                prefix={<TeamOutlined />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic 
                title="Suivi requis" 
                value={invite.suivi_requis ? 'Oui' : 'Non'} 
                valueStyle={{ color: invite.suivi_requis ? '#1890ff' : '#8c8c8c' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic 
                title="Entreprise" 
                value={invite.entreprise?.nom || 'Non assignée'} 
                prefix={<BankOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic 
                title="Date d'événement" 
                value={invite.date_evenement ? moment(invite.date_evenement).format('DD/MM/YYYY') : 'Non définie'} 
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Onglets d'information détaillée */}
        <Card className="detail-tabs-card">
          <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
            <TabPane 
              tab={<span><UserOutlined /> Informations personnelles</span>} 
              key="info"
            >
              <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}>
                <Descriptions.Item label="Nom complet">{invite.nom} {invite.prenom}</Descriptions.Item>
                <Descriptions.Item label="Email">
                  <a href={`mailto:${invite.email}`}>
                    <MailOutlined /> {invite.email}
                  </a>
                </Descriptions.Item>
                <Descriptions.Item label="Téléphone">
                  {invite.telephone ? (
                    <a href={`tel:${invite.telephone}`}>
                      <PhoneOutlined /> {invite.telephone}
                    </a>
                  ) : 'Non renseigné'}
                </Descriptions.Item>
                <Descriptions.Item label="Fonction">{invite.fonction || 'Non renseignée'}</Descriptions.Item>
                <Descriptions.Item label="Type d'invité" span={2}>
                  {invite.type_invite === 'interne' ? (
                    <Tag color="blue">Interne</Tag>
                  ) : (
                    <Tag color="orange">Externe</Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Propriétaire">{invite.proprietaire?.name || 'Non assigné'}</Descriptions.Item>
                <Descriptions.Item label="Date de création">{formatDate(invite.created_at)}</Descriptions.Item>
                <Descriptions.Item label="Dernière mise à jour">{formatDate(invite.updated_at)}</Descriptions.Item>
              </Descriptions>
            </TabPane>
            
            <TabPane 
              tab={<span><BankOutlined /> Entreprise et action</span>} 
              key="enterprise"
            >
              <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}>
                <Descriptions.Item label="Entreprise" span={2}>
                  <Link to={`/entreprises/${invite.entreprise?.id}`}>
                    <BankOutlined /> {invite.entreprise?.nom || 'Non assignée'}
                  </Link>
                </Descriptions.Item>
                <Descriptions.Item label="Action" span={2}>
                  <Link to={`/actions/${invite.action?.id}`}>
                    {invite.action?.nom || 'Non assignée'}
                  </Link>
                </Descriptions.Item>
                <Descriptions.Item label="Étape" span={2}>
                  {invite.etape?.nom || 'Non assignée'}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
            
            <TabPane 
              tab={<span><CalendarOutlined /> Dates et statut</span>} 
              key="dates"
            >
              <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}>
                <Descriptions.Item label="Statut actuel" span={3}>
                  {renderStatus(invite.statut)}
                </Descriptions.Item>
                <Descriptions.Item label="Date d'invitation">
                  {formatDate(invite.date_invitation)}
                </Descriptions.Item>
                <Descriptions.Item label="Date d'événement">
                  {formatDate(invite.date_evenement)}
                </Descriptions.Item>
                <Descriptions.Item label="Suivi requis">
                  {invite.suivi_requis ? (
                    <Tag color="blue">Oui</Tag>
                  ) : (
                    <Tag color="default">Non</Tag>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
            
            <TabPane 
              tab={<span><FileTextOutlined /> Notes et commentaires</span>} 
              key="comments"
            >
              <Card type="inner" title="Commentaires">
                {invite.commentaires ? (
                  <Paragraph>{invite.commentaires}</Paragraph>
                ) : (
                  <Text type="secondary">Aucun commentaire n'a été ajouté pour cet invité.</Text>
                )}
              </Card>
            </TabPane>
            
            <TabPane 
              tab={<span><HistoryOutlined /> Historique</span>} 
              key="history"
            >
              <Card type="inner" title="Historique des changements de statut">
                <Text type="secondary">
                  L'historique des changements de statut sera affiché ici.
                </Text>
              </Card>
            </TabPane>
            
            <TabPane 
              tab={<span><MessageOutlined /> Communications</span>} 
              key="communications"
            >
              <Card type="inner" title="Historique des communications">
                <Text type="secondary">
                  Les communications avec cet invité seront affichées ici.
                </Text>
              </Card>
            </TabPane>
          </Tabs>
        </Card>

        {/* Actions rapides en bas de page */}
        <Card className="quick-actions-card">
          <Space size="middle">
            <Tooltip title="Envoyer un email">
              <Button icon={<MailOutlined />} type="primary">
                Contacter
              </Button>
            </Tooltip>
            
            <Tooltip title="Imprimer les détails">
              <Button icon={<FileTextOutlined />}>
                Exporter
              </Button>
            </Tooltip>
            
            <Dropdown 
              overlay={
                <Menu>
                  <Menu.Item key="add_note">Ajouter une note</Menu.Item>
                  <Menu.Item key="schedule">Programmer un suivi</Menu.Item>
                  <Menu.Divider />
                  <Menu.Item key="duplicate" icon={<UserOutlined />}>
                    Dupliquer l'invité
                  </Menu.Item>
                </Menu>
              } 
              placement="bottomRight"
            >
              <Button icon={<EllipsisOutlined />}>
                Plus d'actions
              </Button>
            </Dropdown>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default InviteDetails;