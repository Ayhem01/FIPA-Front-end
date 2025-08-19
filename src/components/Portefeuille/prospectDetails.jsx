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
  getProspectById,
  deleteProspect,
  updateProspect,
  initializePipeline,
  advancePipeline,
  convertToInvestor,
  resetOperation,
  getPipelineStatus
} from '../../features/prospectSlice';
import { fetchPays, fetchSecteurs } from '../../features/marketingSlice';
import { fetchEntreprises } from '../../features/marketingSlice';
import { fetchAllUsers } from '../../features/userSlice';
import moment from 'moment';
import '../../../src/assets/styles/action-form.css';
import { Empty } from 'antd/lib';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;
const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;

const ProspectDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [conversionModalVisible, setConversionModalVisible] = useState(false);
  const [pipelineModalVisible, setPipelineModalVisible] = useState(false);
  const [editStatusModalVisible, setEditStatusModalVisible] = useState(false);
  const [pipelineForm] = Form.useForm();
  const [conversionForm] = Form.useForm();
  const [statusForm] = Form.useForm();

  const {
    selectedProspect: { data: prospect, loading, error },
    pipeline: { data: pipelineData, stages, currentStage, loading: pipelineLoading },
    operation
  } = useSelector(state => state.prospects);

  const { pays, secteurs, entreprises } = useSelector(state => state.marketing);
  const users = useSelector(state => state.users?.items);
  // Charger les données du prospect et son pipeline
  useEffect(() => {
    if (id) {
      dispatch(getProspectById(id));
      dispatch(getPipelineStatus(id));
    }

    // Charger les référentiels
    dispatch(fetchPays());
    dispatch(fetchSecteurs());
    dispatch(fetchEntreprises());
    dispatch(fetchAllUsers());

    return () => {
      dispatch(resetOperation());
    };
  }, [dispatch, id]);

  // Gérer les opérations réussies ou échouées
  useEffect(() => {
    if (operation.success) {
      switch (operation.type) {
        case 'delete':
          message.success('Prospect supprimé avec succès');
          navigate('/prospects');
          break;
        case 'update':
          message.success('Prospect mis à jour avec succès');
          break;
        case 'initialize_pipeline':
          message.success('Pipeline initialisé avec succès');
          dispatch(getPipelineStatus(id));
          break;
        case 'advance_pipeline':
          message.success('Progression dans le pipeline enregistrée');
          setPipelineModalVisible(false);
          dispatch(getPipelineStatus(id));
          break;
        case 'convert_to_investor':
          message.success('Prospect converti en investisseur avec succès');
          setConversionModalVisible(false);
          dispatch(getProspectById(id));
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
      title: `Êtes-vous sûr de vouloir supprimer ce prospect?`,
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

  // Modifier le statut
  const handleStatusChange = () => {
    statusForm.validateFields().then(values => {
      dispatch(updateProspect({ 
        id,
        data: { statut: values.statut }
      }))
      .unwrap()
      .then(() => {
        setEditStatusModalVisible(false);
        statusForm.resetFields();
      });
    });
  };

  // Initialiser le pipeline
  const handleInitializePipeline = () => {
    confirm({
      title: 'Initialiser le pipeline',
      icon: <InfoCircleOutlined />,
      content: 'Cette action va démarrer le processus de suivi pour ce prospect. Voulez-vous continuer?',
      onOk() {
        message.loading('Initialisation en cours...', 0.5);
        dispatch(initializePipeline({ id }))
          .unwrap()
          .then(() => {
            message.success('Pipeline initialisé avec succès');
            setTimeout(() => {
              dispatch(getProspectById(id));
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
        notes: values.notes
      }));
    });
  };

  // Convertir en investisseur
  const handleConversion = () => {
    conversionForm.validateFields().then(values => {
      dispatch(convertToInvestor({
        id,
        data: {
          nom: values.nom,
          responsable_id: values.responsable_id,
          notes: values.notes
        }
      }));
    });
  };

  // Menu de sélection du statut
  const statusMenu = (
    <Menu>
      <Menu.Item key="statut" onClick={() => {
        statusForm.setFieldsValue({ statut: prospect?.statut || 'nouveau' });
        setEditStatusModalVisible(true);
      }}>
        <Badge color="blue" text="Modifier le statut" />
      </Menu.Item>
    </Menu>
  );

  // Rendu du statut
  const renderStatus = (statut) => {
    let color, text;
    switch (statut) {
      case 'nouveau':
        color = 'blue';
        text = 'Nouveau';
        break;
      case 'en_cours':
        color = 'processing';
        text = 'En cours';
        break;
      case 'qualifie':
        color = 'green';
        text = 'Qualifié';
        break;
      case 'non_qualifie':
        color = 'orange';
        text = 'Non qualifié';
        break;
      case 'converti':
        color = 'success';
        text = 'Converti';
        break;
      case 'perdu':
        color = 'red';
        text = 'Perdu';
        break;
      default:
        color = 'default';
        text = statut || 'Non défini';
    }
    return (
      <Space>
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

  // Formater la valeur monétaire
  const formatMoney = (value, devise = '€') => {
    if (!value && value !== 0) return 'Non définie';
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: devise
    }).format(value);
  };

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Chargement des détails du prospect..." />
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
          <Button type="primary" onClick={() => navigate('/prospects')} style={{ marginTop: 16 }}>
            Retour à la liste
          </Button>
        </div>
      </Card>
    );
  }

  // Affichage si le prospect n'est pas trouvé
  if (!prospect) {
    return (
      <Card className="not-found-card">
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <InfoCircleOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <Title level={4}>Prospect non trouvé</Title>
          <Text>Le prospect que vous recherchez n'existe pas ou a été supprimé.</Text>
          <div style={{ marginTop: 24 }}>
            <Button type="primary" onClick={() => navigate('/prospects')}>
              Retour à la liste
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="prospect-detail-container">
      {/* Header avec breadcrumbs et boutons d'action */}
      <div className="action-form-header">
        <Breadcrumb className="breadcrumb-navigation">
          <Breadcrumb.Item>
            <Link to="/">Tableau de bord</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/prospects">Prospects</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            {prospect.nom}
          </Breadcrumb.Item>
        </Breadcrumb>

        <div className="header-content">
          <div className="title-section">
            <Title level={3} className="no-margin">
              <UserOutlined /> {prospect.nom}
            </Title>
            <div className="subtitle-info">
              <Space>
                {renderStatus(prospect.statut)}
                <Divider type="vertical" />
                <Text type="secondary">ID: {id}</Text>
                <Divider type="vertical" />
                <Text type="secondary">
                  <Tooltip title="Date de création">
                    <CalendarOutlined /> {formatDate(prospect.created_at)}
                  </Tooltip>
                </Text>
                {prospect.investisseur && (
                  <>
                    <Divider type="vertical" />
                    <Tag color="green" icon={<CheckCircleOutlined />}>Converti en investisseur</Tag>
                  </>
                )}
              </Space>
            </div>
          </div>

          <div className="header-actions">
            <Space>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/prospects')}>
                Retour
              </Button>
              <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/prospects/${id}/edit`)}>
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
        <Title level={5}>Progression dans le cycle d'investissement</Title>
        <Steps>
          {prospect.invite ? (
            <Step
              status="finish"
              title="Invité"
              description="Contact initial"
              icon={<UserOutlined />}
            />
          ) : (
            <Step
              status="wait"
              title="Invité"
              description="Contact initial"
              icon={<UserOutlined />}
            />
          )}
          <Step
            status="finish"
            title="Prospect"
            description="Intérêt confirmé"
            icon={<AuditOutlined />}
          />
          <Step
            status={prospect.investisseur ? "finish" : "wait"}
            title="Investisseur"
            description="Décision prise"
            icon={<BankOutlined />}
          />
          <Step
            status={prospect.investisseur && prospect.investisseur.projet ? "finish" : "wait"}
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
                title="Valeur potentielle"
                value={formatMoney(prospect.valeur_potentielle, prospect.devise || '€')}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic
                title="Statut"
                value={prospect.statut ? prospect.statut.charAt(0).toUpperCase() + prospect.statut.slice(1) : 'Non défini'}
                valueStyle={{
                  color: prospect.statut === 'qualifie' ? '#52c41a' :
                    prospect.statut === 'non_qualifie' ? '#faad14' :
                      prospect.statut === 'converti' ? '#1890ff' :
                        prospect.statut === 'perdu' ? '#ff4d4f' : '#8c8c8c'
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic
                title="Entreprise"
                value={prospect.entreprise?.nom || 'Non assignée'}
                prefix={<BankOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic
                title="Prochain contact"
                value={prospect.prochain_contact_prevu ? moment(prospect.prochain_contact_prevu).format('DD/MM/YYYY') : 'Non planifié'}
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
                <Descriptions.Item label="Nom">{prospect.nom}</Descriptions.Item>
                <Descriptions.Item label="Email">
                  {prospect.email ? (
                    <a href={`mailto:${prospect.email}`}>
                      <MailOutlined /> {prospect.email}
                    </a>
                  ) : 'Non renseigné'}
                </Descriptions.Item>
                <Descriptions.Item label="Téléphone">
                  {prospect.telephone ? (
                    <a href={`tel:${prospect.telephone}`}>
                      <PhoneOutlined /> {prospect.telephone}
                    </a>
                  ) : 'Non renseigné'}
                </Descriptions.Item>
                <Descriptions.Item label="Entreprise">
                  {prospect.entreprise ? (
                    <Link to={`/entreprises/${prospect.entreprise.id}`}>
                      <BankOutlined /> {prospect.entreprise.nom}
                    </Link>
                  ) : 'Non renseigné'}
                </Descriptions.Item>
                <Descriptions.Item label="Pays">
                  {prospect.pays ? (
                    <span>
                      <GlobalOutlined /> {prospect.pays.nom}
                    </span>
                  ) : 'Non renseigné'}
                </Descriptions.Item>
                <Descriptions.Item label="Secteur d'activité">
                  {prospect.secteur ? (
                    <Tag color="cyan">{prospect.secteur.nom}</Tag>
                  ) : 'Non renseigné'}
                </Descriptions.Item>
                <Descriptions.Item label="Responsable">{prospect.responsable?.name || 'Non assigné'}</Descriptions.Item>
                <Descriptions.Item label="Créé par">{prospect.createur?.name || 'Non renseigné'}</Descriptions.Item>
                <Descriptions.Item label="Date de création">{formatDate(prospect.created_at)}</Descriptions.Item>
                <Descriptions.Item label="Dernière mise à jour">{formatDate(prospect.updated_at)}</Descriptions.Item>
                
                {prospect.invite && (
                  <Descriptions.Item label="Converti depuis invitation">
                    <Link to={`/invites/${prospect.invite.id}`}>
                      <UserOutlined /> {prospect.invite.nom} {prospect.invite.prenom}
                    </Link>
                  </Descriptions.Item>
                )}
                
                {prospect.investisseur && (
                  <Descriptions.Item label="Converti en investisseur">
                    <Link to={`/investisseurs/${prospect.investisseur.id}`}>
                      <BankOutlined /> {prospect.investisseur.nom}
                    </Link>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </TabPane>

            <TabPane
              tab={<span><FileTextOutlined /> Description et notes</span>}
              key="description"
            >
              <Card type="inner" title="Description">
                {prospect.description ? (
                  <Paragraph>{prospect.description}</Paragraph>
                ) : (
                  <Text type="secondary">Aucune description disponible pour ce prospect.</Text>
                )}
              </Card>

              <Card type="inner" title="Notes internes" style={{ marginTop: 16 }}>
                {prospect.notes_internes ? (
                  <Paragraph>{prospect.notes_internes}</Paragraph>
                ) : (
                  <Text type="secondary">Aucune note interne n'a été ajoutée pour ce prospect.</Text>
                )}
              </Card>
            </TabPane>

            <TabPane
              tab={<span><CalendarOutlined /> Contacts et suivi</span>}
              key="contacts"
            >
              <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}>
                <Descriptions.Item label="Date du dernier contact">
                  {formatDate(prospect.date_dernier_contact)}
                </Descriptions.Item>
                <Descriptions.Item label="Prochain contact prévu">
                  {formatDate(prospect.prochain_contact_prevu)}
                </Descriptions.Item>
                <Descriptions.Item label="Statut actuel">
                  {renderStatus(prospect.statut)}
                </Descriptions.Item>
                <Descriptions.Item label="Valeur potentielle">
                  {formatMoney(prospect.valeur_potentielle, prospect.devise)}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane
              tab={<span><HistoryOutlined /> Pipeline de qualification</span>}
              key="pipeline"
            >
              {pipelineLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spin />
                </div>
              ) : (
                <div>
                  {!pipelineData ? (
                    <Card type="inner" title="Pipeline non initialisé">
                      <Empty
                        description="Le processus de qualification n'a pas encore été démarré pour ce prospect."
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      >
                        <Button
                          type="primary"
                          onClick={handleInitializePipeline}
                          disabled={prospect.statut === 'perdu' || prospect.statut === 'converti' || prospect.investisseur}
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
                            disabled={
                              !pipelineData.can_convert_to_investor || 
                              prospect.statut === 'perdu' || 
                              prospect.investisseur
                            }
                          >
                            Avancer dans le pipeline
                          </Button>
                        }
                      >
                        {/* Barre de progression */}
                        <div className="pipeline-progress-bar">
                          <Progress
                            percent={pipelineData.progression_percentage || 0}
                            status="active"
                            format={percent => `${percent}% complété`}
                            style={{ marginBottom: 20 }}
                          />
                          <div className="stage-counters" style={{ textAlign: 'center', marginBottom: 20 }}>
                            <Statistic
                              title="Progression"
                              value={`${stages.filter(s => s.status === 'completed').length} sur ${stages.length} étapes`}
                              valueStyle={{ color: '#1890ff', fontSize: '16px' }}
                            />
                          </div>
                        </div>

                        {/* Pipeline visuel */}
                        <Steps
                          direction="horizontal"
                          current={stages.findIndex(s => s.status === 'current')}
                          className="prospect-pipeline"
                          style={{ marginBottom: 30 }}
                        >
                          {stages.map((stage) => (
                            <Step
                              key={stage.id}
                              title={stage.name}
                              description={
                                <div style={{ fontSize: '12px' }}>
                                  {stage.description}
                                </div>
                              }
                              status={
                                stage.status === 'current' ? 'process' :
                                stage.status === 'completed' ? 'finish' : 'wait'
                              }
                              icon={
                                stage.status === 'current' ? <LoadingOutlined /> :
                                stage.status === 'completed' ? <CheckCircleOutlined /> : undefined
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
                                {pipelineData.can_convert_to_investor && (
                                  <div style={{ marginTop: 16 }}>
                                    <Button 
                                      type="primary" 
                                      onClick={() => setConversionModalVisible(true)}
                                      disabled={prospect.investisseur}
                                    >
                                      Convertir en investisseur
                                    </Button>
                                  </div>
                                )}
                              </div>
                            }
                            type="info"
                            showIcon
                            style={{ marginBottom: 20 }}
                          />
                        )}
                      </Card>
                    </>
                  )}
                </div>
              )}
            </TabPane>

            {prospect.investisseur && (
              <TabPane
                tab={<span><BankOutlined /> Investisseur</span>}
                key="investor"
              >
                <Card type="inner" title="Détails de l'investisseur">
                  <Alert
                    message="Converti en investisseur"
                    description={`Ce prospect a été converti en investisseur le ${formatDate(prospect.investisseur.created_at)}.`}
                    type="success"
                    showIcon
                    style={{ marginBottom: 20 }}
                  />

                  <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}>
                    <Descriptions.Item label="Nom">{prospect.investisseur.nom}</Descriptions.Item>
                    <Descriptions.Item label="Responsable">{prospect.investisseur.responsable?.name || 'Non assigné'}</Descriptions.Item>
                    <Descriptions.Item label="Date de création">{formatDate(prospect.investisseur.created_at)}</Descriptions.Item>
                  </Descriptions>

                  <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <Button
                      type="primary"
                      onClick={() => navigate(`/investisseurs/${prospect.investisseur.id}`)}
                    >
                      Voir l'investisseur <RightOutlined />
                    </Button>
                  </div>
                </Card>
              </TabPane>
            )}
          </Tabs>
        </Card>

        {/* Actions rapides en bas de page */}
        <Card className="quick-actions-card">
          <Space size="middle">
            {!pipelineData && prospect.statut !== 'perdu' && prospect.statut !== 'converti' && !prospect.investisseur && (
              <Tooltip title="Démarrer le processus de qualification">
                <Button
                  icon={<RightOutlined />}
                  type="primary"
                  onClick={handleInitializePipeline}
                >
                  Initialiser le pipeline
                </Button>
              </Tooltip>
            )}

            {pipelineData && pipelineData.can_convert_to_investor && !prospect.investisseur && (
              <Tooltip title="Transformer en investisseur">
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  style={{ background: '#52c41a', borderColor: '#52c41a' }}
                  onClick={() => setConversionModalVisible(true)}
                >
                  Convertir en investisseur
                </Button>
              </Tooltip>
            )}

            {pipelineData && !prospect.investisseur && prospect.statut !== 'perdu' && prospect.statut !== 'converti' && (
              <Tooltip title="Avancer dans le pipeline de qualification">
                <Button
                  icon={<RightOutlined />}
                  onClick={() => setPipelineModalVisible(true)}
                >
                  Avancer le pipeline
                </Button>
              </Tooltip>
            )}

            <Tooltip title="Envoyer un email">
              <Button icon={<MailOutlined />} disabled={!prospect.email}>
                Contacter
              </Button>
            </Tooltip>
          </Space>
        </Card>
      </div>

      {/* Modal pour modifier le statut */}
      <Modal
        title="Modifier le statut"
        visible={editStatusModalVisible}
        onCancel={() => setEditStatusModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setEditStatusModalVisible(false)}>
            Annuler
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleStatusChange}
          >
            Enregistrer
          </Button>
        ]}
      >
        <Form
          form={statusForm}
          layout="vertical"
        >
          <Form.Item
            name="statut"
            label="Statut"
            rules={[{ required: true, message: 'Veuillez sélectionner un statut' }]}
          >
            <Select>
              <Option value="nouveau">Nouveau</Option>
              <Option value="en_cours">En cours</Option>
              <Option value="qualifie">Qualifié</Option>
              <Option value="non_qualifie">Non qualifié</Option>
              <Option value="converti">Converti</Option>
              <Option value="perdu">Perdu</Option>
            </Select>
          </Form.Item>
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
          >
            Avancer à l'étape suivante
          </Button>
        ]}
      >
        <Alert
          message="Avancement automatique"
          description="Le système va automatiquement avancer le prospect à l'étape suivante du pipeline. Vous pouvez ajouter des notes à cette progression."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Form
          form={pipelineForm}
          layout="vertical"
        >
          <Form.Item
            name="notes"
            label="Notes (optionnelles)"
          >
            <TextArea rows={4} placeholder="Informations complémentaires sur cette progression" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal pour convertir en investisseur */}
      <Modal
        title="Convertir en investisseur"
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
            nom: prospect?.nom,
            responsable_id: prospect?.responsable_id
          }}
        >
          <Form.Item
            name="nom"
            label="Nom de l'investisseur"
            rules={[{ required: true, message: 'Veuillez entrer un nom' }]}
          >
            <Input placeholder="Nom de l'investisseur" />
          </Form.Item>

          <Form.Item
            name="responsable_id"
            label="Responsable"
            rules={[{ required: true, message: 'Veuillez sélectionner un responsable' }]}
          >
            <Select placeholder="Sélectionner un responsable">
              {users?.items?.map(user => (
                <Option key={user.id} value={user.id}>{user.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <TextArea rows={4} placeholder="Informations complémentaires sur cet investisseur" />
          </Form.Item>

          <Alert
            message="Information"
            description="Cette action va créer un nouvel investisseur à partir de ce prospect. Toutes les informations pertinentes seront transférées."
            type="info"
            showIcon
          />
        </Form>
      </Modal>
    </div>
  );
};

export default ProspectDetails;