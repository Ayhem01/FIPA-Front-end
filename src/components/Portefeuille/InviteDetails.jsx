import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card, Descriptions, Button, Space, Spin, Tag, Tabs, Typography, Modal,
  message, Divider, Row, Col, Breadcrumb, Statistic, Tooltip, Badge,
  Dropdown, Menu, Steps, Alert, Timeline, Form, DatePicker, Select, Input, Progress
} from 'antd';
import {
  EditOutlined, DeleteOutlined, ArrowLeftOutlined, ExclamationCircleOutlined,
  MailOutlined, PhoneOutlined, UserOutlined, CalendarOutlined, FileTextOutlined,
  BankOutlined, TeamOutlined, CheckCircleOutlined, CloseCircleOutlined, CheckOutlined,
  QuestionCircleOutlined, DownOutlined, EllipsisOutlined, HistoryOutlined, LoadingOutlined,
  MessageOutlined, InfoCircleOutlined, SendOutlined, AuditOutlined, BellOutlined, GlobalOutlined, RightOutlined
} from '@ant-design/icons';
import {
  getInviteById,
  deleteInvite,
  updateInviteStatus,
  sendInvitation,
  initializePipeline,
  advancePipeline,
  convertToProspect,
  resetOperation,
  getInvitePipeline
} from '../../features/inviteSlice';
import { fetchPays, fetchSecteurs } from '../../features/marketingSlice';
import moment from 'moment';
import '../../../src/assets/styles/action-form.css';
import { Empty } from 'antd/lib';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;
const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;

const InviteDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [conversionModalVisible, setConversionModalVisible] = useState(false);
  const [pipelineModalVisible, setPipelineModalVisible] = useState(false);
  const [selectedPipelineStage, setSelectedPipelineStage] = useState(null);
  const [conversionForm] = Form.useForm();
  const [pipelineForm] = Form.useForm();

  const {
    selectedInvite: { data: invite, loading, error },
    pipeline: { stages: pipelineStages, currentStage, progression, loading: pipelineLoading },
    operation
  } = useSelector(state => state.invites);

  const { pays, secteurs } = useSelector(state => state.marketing);

  // Charger les données de l'invité et son pipeline
  useEffect(() => {
    if (id) {
      dispatch(getInviteById(id));
      dispatch(getInvitePipeline(id));

    }

    // Charger les référentiels
    dispatch(fetchPays());
    dispatch(fetchSecteurs());

    return () => {
      dispatch(resetOperation());
    };
  }, [dispatch, id]);

  // Gérer les opérations réussies ou échouées
  useEffect(() => {
    if (operation.success) {
      switch (operation.type) {
        case 'delete':
          message.success('Invité supprimé avec succès');
          navigate('/invites');
          break;
        case 'update_status':
          message.success('Statut mis à jour avec succès');
          break;
        case 'send_invitation':
          message.success('Invitation envoyée avec succès');
          // Recharger les données
          dispatch(getInviteById(id));
          break;
        case 'initialize_pipeline':
          message.success('Pipeline initialisé avec succès');
          dispatch(getInvitePipeline(id));
          break;
        case 'advance_pipeline':
          message.success('Progression dans le pipeline enregistrée');
          setPipelineModalVisible(false);
          dispatch(getInvitePipeline(id));
          break;
        case 'convert_to_prospect':
          message.success('Invité converti en prospect avec succès');
          setConversionModalVisible(false);
          dispatch(getInviteById(id));
          break;
        default:
          message.success('Opération réussie');
      }
    } else if (operation.error) {
      message.error(operation.error);
    }
  }, [operation, navigate, id, dispatch]);

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

  // Envoyer l'invitation
  const handleSendInvitation = () => {
    dispatch(sendInvitation(id));
  };

  // Initialiser le pipeline
  const handleInitializePipeline = () => {
    confirm({
      title: 'Initialiser le pipeline',
      icon: <InfoCircleOutlined />,
      content: 'Cette action va démarrer le processus de suivi pour cet invité. Voulez-vous continuer?',
      onOk() {
        message.loading('Initialisation en cours...', 0.5);
        dispatch(initializePipeline(id))
          .unwrap()
          .then(() => {
            message.success('Pipeline initialisé avec succès');

            // Force refresh of the component after a short delay
            setTimeout(() => {
              dispatch(getInviteById(id));
              // Pas besoin d'appeler getInvitePipeline car initializePipeline
              // met déjà à jour l'état du pipeline
            }, 500);
          })
          .catch((error) => {
            message.error(`Erreur: ${error}`);
          });
      }
    });
  };

  // Avancer dans le pipeline
  const handleAdvancePipeline = () => {
    pipelineForm.validateFields().then(values => {
      dispatch(advancePipeline({
        id,
        stage_id: selectedPipelineStage,
        notes: values.notes,
        date: values.date?.format('YYYY-MM-DD HH:mm:ss')
      }));
    });
  };

  // Convertir en prospect
  const handleConversion = () => {
    conversionForm.validateFields().then(values => {
      dispatch(convertToProspect({
        id,
        secteur_id: values.secteur_id,
        pays_id: values.pays_id,
        potentiel: values.potentiel,
        notes: values.notes
      }));
    });
  };

  // Remplacer votre statusMenu actuel
  const statusMenu = (
    <Menu>
      <Menu.Item key="en_attente" disabled={invite?.statut === 'en_attente'} onClick={() => handleStatusChange('en_attente')}>
        <Badge color="gold" text="En attente" />
      </Menu.Item>
      <Menu.Item key="envoyee" disabled={invite?.statut === 'envoyee'} onClick={() => handleStatusChange('envoyee')}>
        <Badge color="blue" text="Invitation envoyée" />
      </Menu.Item>
      <Menu.Item key="confirmee" disabled={invite?.statut === 'confirmee'} onClick={() => handleStatusChange('confirmee')}>
        <Badge color="green" text="Confirmée" />
      </Menu.Item>
      <Menu.Item key="details_envoyes" disabled={invite?.statut === 'details_envoyes'} onClick={() => handleStatusChange('details_envoyes')}>
        <Badge color="cyan" text="Détails envoyés" />
      </Menu.Item>
      <Menu.Item key="refusee" disabled={invite?.statut === 'refusee'} onClick={() => handleStatusChange('refusee')}>
        <Badge color="red" text="Refusée" />
      </Menu.Item>
      <Menu.Item key="participation_confirmee" disabled={invite?.statut === 'participation_confirmee'} onClick={() => handleStatusChange('participation_confirmee')}>
        <Badge color="green" text="Participation confirmée" />
      </Menu.Item>
      <Menu.Item key="participation_sans_suivi" disabled={invite?.statut === 'participation_sans_suivi'} onClick={() => handleStatusChange('participation_sans_suivi')}>
        <Badge color="purple" text="A participé (sans suivi)" />
      </Menu.Item>
      <Menu.Item key="absente" disabled={invite?.statut === 'absente'} onClick={() => handleStatusChange('absente')}>
        <Badge color="volcano" text="Absent" />
      </Menu.Item>
      <Menu.Item key="aucune_reponse" disabled={invite?.statut === 'aucune_reponse'} onClick={() => handleStatusChange('aucune_reponse')}>
        <Badge color="default" text="Aucune réponse" />
      </Menu.Item>
    </Menu>
  );

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
        text = 'Invitation envoyée';
        icon = <SendOutlined />;
        break;
      case 'confirmee':
        color = 'green';
        text = 'Confirmée';
        icon = <CheckCircleOutlined />;
        break;
      case 'details_envoyes':
        color = 'cyan';
        text = 'Détails envoyés';
        icon = <MailOutlined />;
        break;
      case 'refusee':
        color = 'red';
        text = 'Refusée';
        icon = <CloseCircleOutlined />;
        break;
      case 'participation_confirmee':
        color = 'green';
        text = 'Participation confirmée';
        icon = <CheckCircleOutlined />;
        break;
      case 'participation_sans_suivi':
        color = 'purple';
        text = 'A participé (sans suivi)';
        icon = <CheckCircleOutlined />;
        break;
      case 'absente':
        color = 'volcano';
        text = 'Absent';
        icon = <CloseCircleOutlined />;
        break;
      case 'aucune_reponse':
        color = 'default';
        text = 'Aucune réponse';
        icon = <InfoCircleOutlined />;
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
                <Text type="secondary">ID: {id}</Text>
                <Divider type="vertical" />
                <Text type="secondary">
                  <Tooltip title="Date de création">
                    <CalendarOutlined /> {formatDate(invite.created_at)}
                  </Tooltip>
                </Text>
                {invite.prospect && (
                  <>
                    <Divider type="vertical" />
                    <Tag color="green" icon={<CheckCircleOutlined />}>Converti en prospect</Tag>
                  </>
                )}
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

      {/* Pipeline de conversion global */}
      <Card className="pipeline-card">
        <Title level={5}>Progression dans le cycle de conversion</Title>
        <Steps>
          <Step
            status="finish"
            title="Invité"
            description="Contact initial"
            icon={<UserOutlined />}
          />
          <Step
            status={invite.prospect ? "finish" : "wait"}
            title="Prospect"
            description="Intérêt confirmé"
            icon={<AuditOutlined />}
          />
          <Step
            status={invite.prospect && invite.prospect.investisseur ? "finish" : "wait"}
            title="Investisseur"
            description="Décision prise"
            icon={<BankOutlined />}
          />
          <Step
            status={invite.prospect && invite.prospect.investisseur &&
              invite.prospect.investisseur.projet ? "finish" : "wait"}
            title="Projet"
            description="Réalisation"
            icon={<FileTextOutlined />}
          />
        </Steps>
      </Card>

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
                title="Potentiel"
                value={invite.potentiel ?
                  invite.potentiel.charAt(0).toUpperCase() + invite.potentiel.slice(1) :
                  'Non évalué'}
                valueStyle={{
                  color: invite.potentiel === 'élevé' ? '#cf1322' :
                    invite.potentiel === 'moyen' ? '#fa8c16' :
                      invite.potentiel === 'faible' ? '#1890ff' : '#8c8c8c'
                }}
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
                <Descriptions.Item label="Pays">
                  {invite.pays ? (
                    <span>
                      <GlobalOutlined /> {invite.pays.nom}
                    </span>
                  ) : 'Non renseigné'}
                </Descriptions.Item>
                <Descriptions.Item label="Secteur d'activité">
                  {invite.secteur ? (
                    <Tag color="cyan">{invite.secteur.nom}</Tag>
                  ) : 'Non renseigné'}
                </Descriptions.Item>
                <Descriptions.Item label="Potentiel">
                  {invite.potentiel ? (
                    <Tag color={
                      invite.potentiel === 'élevé' ? 'red' :
                        invite.potentiel === 'moyen' ? 'orange' : 'blue'
                    }>
                      {invite.potentiel.charAt(0).toUpperCase() + invite.potentiel.slice(1)}
                    </Tag>
                  ) : (
                    <Tag color="default">Non évalué</Tag>
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
                <Descriptions.Item label="Date de rappel">
                  {formatDate(invite.date_rappel) || 'Non programmé'}
                </Descriptions.Item>
                <Descriptions.Item label="Date de conversion">
                  {formatDate(invite.date_conversion) || 'Non converti'}
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
              tab={<span><HistoryOutlined /> Pipeline de suivi</span>}
              key="pipeline"
            >
              {pipelineLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spin />
                </div>
              ) : (
                <div>
                  {!progression || progression.length === 0 ? (
                    <Card type="inner" title="Pipeline non initialisé">
                      <Empty
                        description="Le processus de suivi n'a pas encore été démarré pour cet invité."
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      >
                        <Button
                          type="primary"
                          onClick={handleInitializePipeline}
                          disabled={invite.statut === 'refusee' || invite.prospect}
                        >
                          Initialiser le pipeline
                        </Button>
                      </Empty>
                    </Card>
                  ) : (
                    <>
                      <Card
                        type="inner"
                        title="Progression dans le pipeline"
                        extra={
                          <Button
                            type="primary"
                            onClick={() => setPipelineModalVisible(true)}
                            disabled={invite.prospect}
                          >
                            Avancer dans le pipeline
                          </Button>
                        }
                      >
                        {/* Barre de progression */}
                        <div className="pipeline-progress-bar">
                          <Progress
                            percent={Math.round((currentStage?.order / pipelineStages.length) * 100)}
                            status="active"
                            format={percent => `${percent}% complété`}
                            style={{ marginBottom: 20 }}
                          />
                          <div className="stage-counters" style={{ textAlign: 'center', marginBottom: 20 }}>
                            <Statistic
                              title="Étape actuelle"
                              value={`${currentStage?.order || 0} sur ${pipelineStages.length}`}
                              valueStyle={{ color: '#1890ff', fontSize: '16px' }}
                            />
                          </div>
                        </div>

                        {/* Pipeline visuel amélioré */}
                        <Steps
                          direction="horizontal"
                          current={currentStage ? currentStage.order - 1 : 0}
                          className="invites-pipeline"
                          style={{ marginBottom: 30 }}
                        >
                          {pipelineStages.map((stage) => (
                            <Step
                              key={stage.id}
                              title={stage.name}
                              description={
                                <div style={{ fontSize: '12px' }}>
                                  {stage.description}
                                  {progression.find(p => p.stage_id === stage.id) && (
                                    <div className="stage-completion-date" style={{ marginTop: 5, color: '#52c41a' }}>
                                      <CheckOutlined /> {formatDate(progression.find(p => p.stage_id === stage.id).created_at)}
                                    </div>
                                  )}
                                </div>
                              }
                              status={
                                stage.id === currentStage?.id ? 'process' :
                                  stage.order < currentStage?.order ? 'finish' : 'wait'
                              }
                              icon={
                                stage.id === currentStage?.id ? <LoadingOutlined /> :
                                  stage.order < currentStage?.order ? <CheckCircleOutlined /> : undefined
                              }
                            />
                          ))}
                        </Steps>

                        {/* Étape actuelle détaillée */}
                        {currentStage && (
                          <Alert
                            message={`Étape actuelle: ${currentStage.name}`}
                            description={
                              <div>
                                <p>{currentStage.description}</p>
                                <p>
                                  <strong>Depuis:</strong> {formatDate(progression[0]?.created_at)}
                                  {progression[0]?.assigned_to_user &&
                                    <span> - <strong>Responsable:</strong> {progression[0].assigned_to_user.name}</span>
                                  }
                                </p>
                                {progression[0]?.notes && <p><strong>Notes:</strong> {progression[0].notes}</p>}
                              </div>
                            }
                            type="info"
                            showIcon
                            style={{ marginBottom: 20 }}
                          />
                        )}
                      </Card>

                      <Card type="inner" title="Historique de progression" style={{ marginTop: '20px' }}>
                        <Timeline>
                          {progression.map((progress, index) => (
                            <Timeline.Item
                              key={index}
                              color={index === 0 ? 'blue' : 'green'}
                            >
                              <p>
                                <strong>{progress.stage.name}</strong> - {formatDate(progress.created_at)}
                              </p>
                              {progress.notes && <p>{progress.notes}</p>}
                              <p>
                                <Text type="secondary">
                                  Par: {progress.assigned_to_user?.name || 'Non assigné'}
                                </Text>
                              </p>
                            </Timeline.Item>
                          ))}
                        </Timeline>
                      </Card>
                    </>
                  )}
                </div>
              )}
            </TabPane>

            <TabPane
              tab={<span><CheckOutlined /> Conversion</span>}
              key="conversion"
            >
              <Card type="inner" title="Conversion en prospect">
                {invite.prospect ? (
                  <>
                    <Alert
                      message="Invité converti en prospect"
                      description={`Cet invité a été converti en prospect le ${formatDate(invite.date_conversion)}.`}
                      type="success"
                      showIcon
                    />

                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                      <Button
                        type="primary"
                        onClick={() => navigate(`/prospects/${invite.prospect.id}`)}
                      >
                        Voir le prospect <RightOutlined />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Alert
                      message="Conversion en prospect"
                      description="La conversion d'un invité en prospect permet de poursuivre la relation commerciale après l'événement."
                      type="info"
                      showIcon
                    />

                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                      <Button
                        type="primary"
                        onClick={() => setConversionModalVisible(true)}
                        disabled={invite.statut !== 'participation_confirmee' && invite.statut !== 'participation_sans_suivi'}
                        icon={<CheckOutlined />}
                      >
                        Convertir en prospect
                      </Button>

                      {invite.statut !== 'participation_confirmee' && invite.statut !== 'participation_sans_suivi' && (
                        <div style={{ marginTop: '10px' }}>
                          <Text type="secondary">
                            L'invité doit avoir participé à l'événement pour être converti en prospect.
                          </Text>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </Card>
            </TabPane>

            <TabPane
              tab={<span><MessageOutlined /> Communications</span>}
              key="communications"
            >
              <Card type="inner" title="Gestion des invitations">
                <Space direction="vertical" style={{ width: '100%' }}>
                  {invite.statut === 'en_attente' ? (
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={handleSendInvitation}
                    >
                      Envoyer l'invitation
                    </Button>
                  ) : (
                    <Alert
                      message="Invitation envoyée"
                      description={`L'invitation a été envoyée le ${formatDate(invite.date_invitation)}`}
                      type="info"
                      showIcon
                    />
                  )}

                  {invite.token && (
                    <div style={{ marginTop: '20px' }}>
                      <Divider>Lien d'invitation</Divider>
                      <div className="copy-link-container">
                        <Text copyable={{ text: `${window.location.origin}/invitation/${invite.token}` }}>
                          {`${window.location.origin}/invitation/${invite.token}`}
                        </Text>
                      </div>
                    </div>
                  )}
                </Space>
              </Card>
            </TabPane>
          </Tabs>
        </Card>

        {/* Actions rapides en bas de page */}
        <Card className="quick-actions-card">
          <Space size="middle">
            {invite.statut === 'en_attente' && (
              <Tooltip title="Envoyer l'invitation par email">
                <Button
                  icon={<SendOutlined />}
                  type="primary"
                  onClick={handleSendInvitation}
                >
                  Envoyer l'invitation
                </Button>
              </Tooltip>
            )}

            {!invite.prospect && invite.statut === 'participee' && (
              <Tooltip title="Transformer en prospect">
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  style={{ background: '#52c41a', borderColor: '#52c41a' }}
                  onClick={() => setConversionModalVisible(true)}
                >
                  Convertir
                </Button>
              </Tooltip>
            )}

            {progression?.length > 0 && !invite.prospect && (
              <Tooltip title="Avancer dans le pipeline de suivi">
                <Button
                  icon={<RightOutlined />}
                  onClick={() => setPipelineModalVisible(true)}
                >
                  Avancer le pipeline
                </Button>
              </Tooltip>
            )}

            <Tooltip title="Envoyer un email">
              <Button icon={<MailOutlined />}>
                Contacter
              </Button>
            </Tooltip>
          </Space>
        </Card>
      </div>

      {/* Modal de conversion en prospect */}
      <Modal
        title="Convertir en prospect"
        visible={conversionModalVisible}
        onCancel={() => setConversionModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setConversionModalVisible(false)}>
            Annuler
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleConversion}
          >
            Convertir
          </Button>
        ]}
      >
        <Form
          form={conversionForm}
          layout="vertical"
          initialValues={{
            secteur_id: invite?.secteur_id,
            pays_id: invite?.pays_id,
            potentiel: invite?.potentiel || 'moyen'
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="secteur_id"
                label="Secteur d'activité"
                rules={[{ required: true, message: 'Veuillez sélectionner un secteur' }]}
              >
                <Select placeholder="Sélectionner un secteur">
                  {secteurs.items?.map(secteur => (
                    <Option key={secteur.id} value={secteur.id}>{secteur.nom}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="pays_id"
                label="Pays"
                rules={[{ required: true, message: 'Veuillez sélectionner un pays' }]}
              >
                <Select
                  placeholder="Sélectionner un pays"
                  showSearch
                  optionFilterProp="children"
                >
                  {pays.items?.map(pays => (
                    <Option key={pays.id} value={pays.id}>{pays.nom}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="potentiel"
            label="Potentiel d'investissement"
            rules={[{ required: true, message: 'Veuillez évaluer le potentiel' }]}
          >
            <Select placeholder="Évaluer le potentiel">
              <Option value="faible">
                <Badge color="blue" text="Faible" />
              </Option>
              <Option value="moyen">
                <Badge color="orange" text="Moyen" />
              </Option>
              <Option value="élevé">
                <Badge color="red" text="Élevé" />
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <TextArea rows={4} placeholder="Informations complémentaires sur ce prospect" />
          </Form.Item>

          <Alert
            message="Information"
            description="Cette action va créer un nouveau prospect à partir de cet invité. Le prospect sera automatiquement placé dans la première étape du pipeline prospect."
            type="info"
            showIcon
          />
        </Form>
      </Modal>

      {/* Modal pour avancer dans le pipeline */}
      <Modal
        title="Avancer dans le pipeline"
        visible={pipelineModalVisible}
        onCancel={() => setPipelineModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setPipelineModalVisible(false)}>
            Annuler
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleAdvancePipeline}
            disabled={!selectedPipelineStage}
          >
            Enregistrer la progression
          </Button>
        ]}
      >
        <Form
          form={pipelineForm}
          layout="vertical"
        >
          <Form.Item
            name="stage_id"
            label="Étape du pipeline"
            rules={[{ required: true, message: 'Veuillez sélectionner une étape' }]}
          >
            <Select
              placeholder="Sélectionner l'étape suivante"
              onChange={value => setSelectedPipelineStage(value)}
            >
              {pipelineStages.map(stage => (
                <Option
                  key={stage.id}
                  value={stage.id}
                  disabled={stage.order <= currentStage?.order}
                >
                  {stage.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="date"
            label="Date de réalisation"
          >
            <DatePicker
              showTime
              style={{ width: '100%' }}
              placeholder="Sélectionner une date (optionnel)"
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <TextArea rows={4} placeholder="Informations complémentaires sur cette étape" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InviteDetails;