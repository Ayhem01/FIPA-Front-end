import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Form, Input, Button, Card, Select, DatePicker, Space, message,
  Spin, Row, Col, Steps, Breadcrumb, Divider, Switch, Tooltip,
  Avatar, Result, Alert, Progress, Timeline, Badge, Typography, Tabs
} from 'antd';
import {
  SaveOutlined, ArrowLeftOutlined, UserOutlined, MailOutlined,
  PhoneOutlined, CalendarOutlined, TeamOutlined, FileTextOutlined,
  EditOutlined, PlusOutlined, CheckOutlined, BuildOutlined,
  RightOutlined, LeftOutlined, InfoCircleOutlined, ClockCircleOutlined,
  CheckCircleOutlined, CloseCircleOutlined, BankOutlined, BellOutlined,
  SolutionOutlined, ExclamationCircleOutlined, LinkOutlined, 
  AuditOutlined, GlobalOutlined, ScheduleOutlined, SendOutlined,
  HomeOutlined, FormOutlined, DashboardOutlined, DownOutlined
} from '@ant-design/icons';
import {
  createInvite,
  updateInvite,
  getInviteById,
  resetOperation,
  fetchEntreprises,
  fetchActions,
  fetchEtapesByAction
} from '../../features/inviteSlice';
import { getCurrentUser } from '../../features/userSlice';
import moment from 'moment';
import '../../../src/assets/styles/action-form.css';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const InviteForm = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const isEditMode = !!id;
  
  // États locaux
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepsData, setStepsData] = useState({});
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedEntreprise, setSelectedEntreprise] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [completedSteps, setCompletedSteps] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('form');

  // Sélection des données du store Redux
  const {
    selectedInvite: { data: invite, loading: inviteLoading, error: inviteError },
    operation,
    entreprises,
    actions,
    etapes
  } = useSelector(state => state.invites);

  // Sélectionne l'utilisateur connecté
  const user = useSelector(state => state.user.user);

  // Charger l'utilisateur connecté si non présent
  useEffect(() => {
    const fetchUser = async () => {
      try {
        await dispatch(getCurrentUser()).unwrap();
      } catch (error) {
        message.error('Impossible de charger les informations de l\'utilisateur');
      } finally {
        setLoadingUser(false);
      }
    };
    if (!user && localStorage.getItem('token')) {
      fetchUser();
    } else {
      setLoadingUser(false);
    }
  }, [dispatch, user]);

  // Charger l'invité en mode édition
  useEffect(() => {
    if (id) {
      setLoadingData(true);
      dispatch(getInviteById(id))
        .unwrap()
        .then(() => setLoadingData(false))
        .catch((error) => {
          console.error("Erreur lors du chargement de l'invité:", error);
          message.error("Impossible de charger les détails de l'invité");
          setLoadingData(false);
        });
    }
    return () => {
      dispatch(resetOperation());
    };
  }, [dispatch, id]);

  // Charger les entreprises et actions via Redux
  useEffect(() => {
    dispatch(fetchEntreprises());
    dispatch(fetchActions());
  }, [dispatch]);

  // Charger les étapes quand une action est sélectionnée
  const handleActionChange = (actionId) => {
    form.setFieldsValue({ etape_id: undefined });
    setSelectedAction(actionId);
    if (actionId) {
      dispatch(fetchEtapesByAction(actionId));
    }
  };

  // Mettre à jour le formulaire quand les données de l'invité sont chargées
  useEffect(() => {
    if (invite && id) {
      form.setFieldsValue({
        nom: invite.nom,
        prenom: invite.prenom,
        fonction: invite.fonction,
        email: invite.email,
        telephone: invite.telephone,
        type_invite: invite.type_invite,
        entreprise_id: invite.entreprise_id,
        action_id: invite.action_id,
        etape_id: invite.etape_id,
        statut: invite.statut,
        suivi_requis: invite.suivi_requis,
        date_invitation: invite.date_invitation ? moment(invite.date_invitation) : null,
        date_evenement: invite.date_evenement ? moment(invite.date_evenement) : null,
        commentaires: invite.commentaires,
      });
      setSelectedEntreprise(invite.entreprise_id);
      setSelectedAction(invite.action_id);
      if (invite.action_id) {
        dispatch(fetchEtapesByAction(invite.action_id));
      }
      
      // Marquer toutes les étapes comme complétées en mode édition
      setCompletedSteps([0, 1, 2]);
    }
  }, [invite, form, id, dispatch]);

  // Gestion des succès/erreurs d'opération
  useEffect(() => {
    if (operation.success) {
      setFormSubmitted(true);
      setIsSubmitting(false);
      
      // Redirection après un court délai pour montrer le message de succès
      setTimeout(() => {
        navigate('/invites');
      }, 1500);
    } else if (operation.error) {
      message.error(operation.error);
      setIsSubmitting(false);
    }
  }, [operation, navigate]);

  // Fonctions de navigation entre étapes
  const nextStep = async () => {
    try {
      // Valider les champs de l'étape actuelle
      const currentFields = getFieldsForStep(currentStep);
      const values = await form.validateFields(currentFields);
      
      // Mettre à jour les données des étapes
      setStepsData(prevData => ({
        ...prevData,
        ...values
      }));
      
      // Marquer cette étape comme complétée
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      
      // Passer à l'étape suivante
      setCurrentStep(currentStep + 1);
      
      // Effet de défilement fluide vers le haut
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (errorInfo) {
      // Afficher les erreurs de validation
      const errors = {};
      errorInfo.errorFields.forEach(field => {
        errors[field.name[0]] = field.errors[0];
      });
      setFormErrors(errors);
      
      message.error('Veuillez corriger les erreurs avant de continuer');
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Obtenir les champs de formulaire pour une étape spécifique
  const getFieldsForStep = (step) => {
    switch (step) {
      case 0:
        return ['nom', 'prenom', 'email', 'telephone', 'fonction', 'type_invite'];
      case 1:
        return ['entreprise_id', 'action_id', 'etape_id'];
      case 2:
        return ['statut', 'suivi_requis', 'date_invitation', 'date_evenement', 'commentaires'];
      default:
        return [];
    }
  };

  // Soumission du formulaire
  const handleSubmit = async () => {
    try {
      // Valider tous les champs du formulaire
      const allValues = await form.validateFields();
      
      // Fusionner avec les données des étapes précédentes
      const allFormValues = {
        ...stepsData,
        ...allValues
      };

      if (!user || !user.id) {
        message.error("Utilisateur non connecté !");
        return;
      }

      setIsSubmitting(true);
      
      const formattedValues = {
        ...allFormValues,
        date_invitation: allFormValues.date_invitation ? allFormValues.date_invitation.format('YYYY-MM-DD HH:mm:ss') : null,
        date_evenement: allFormValues.date_evenement ? allFormValues.date_evenement.format('YYYY-MM-DD HH:mm:ss') : null,
        proprietaire_id: user.id
      };
      
      if (id) {
        await dispatch(updateInvite({ id, inviteData: formattedValues })).unwrap();
      } else {
        await dispatch(createInvite(formattedValues)).unwrap();
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      message.error('Une erreur est survenue lors du traitement du formulaire');
      setIsSubmitting(false);
    }
  };

  // Rendu du statut
  const renderStatus = (status) => {
    switch (status) {
      case 'en_attente':
        return <Badge status="warning" text="En attente" />;
      case 'confirmee':
        return <Badge status="success" text="Confirmée" />;
      case 'refusee':
        return <Badge status="error" text="Refusée" />;
      case 'envoyee':
        return <Badge status="processing" text="Envoyée" />;
      case 'participation_confirmee':
        return <Badge status="success" text="Participation confirmée" />;
      case 'absente':
        return <Badge status="default" text="Absent(e)" />;
      default:
        return <Badge status="default" text={status || 'Non défini'} />;
    }
  };

  // Obtenir le résumé des données pour une étape
  const getStepSummary = (step) => {
    const allData = { ...stepsData, ...form.getFieldsValue() };
    
    switch (step) {
      case 0:
        return (
          <div className="step-summary">
            <div className="summary-item">
              <UserOutlined className="summary-icon" />
              <div className="summary-content">
                <div className="summary-label">Nom complet:</div>
                <div className="summary-value">{allData.nom} {allData.prenom}</div>
              </div>
            </div>
            {allData.email && (
              <div className="summary-item">
                <MailOutlined className="summary-icon" />
                <div className="summary-content">
                  <div className="summary-label">Email:</div>
                  <div className="summary-value">{allData.email}</div>
                </div>
              </div>
            )}
            {allData.telephone && (
              <div className="summary-item">
                <PhoneOutlined className="summary-icon" />
                <div className="summary-content">
                  <div className="summary-label">Téléphone:</div>
                  <div className="summary-value">{allData.telephone}</div>
                </div>
              </div>
            )}
            {allData.fonction && (
              <div className="summary-item">
                <BuildOutlined className="summary-icon" />
                <div className="summary-content">
                  <div className="summary-label">Fonction:</div>
                  <div className="summary-value">{allData.fonction}</div>
                </div>
              </div>
            )}
            {allData.type_invite && (
              <div className="summary-item">
                <SolutionOutlined className="summary-icon" />
                <div className="summary-content">
                  <div className="summary-label">Type:</div>
                  <div className="summary-value">{allData.type_invite === 'interne' ? 'Interne' : 'Externe'}</div>
                </div>
              </div>
            )}
          </div>
        );
      case 1:
        const entrepriseNom = entreprises.items?.find(e => e.id === allData.entreprise_id)?.nom || '';
        const actionNom = actions.items?.find(a => a.id === allData.action_id)?.nom || '';
        const etapeNom = etapes.items?.find(e => e.id === allData.etape_id)?.nom || '';
        
        return (
          <div className="step-summary">
            <div className="summary-item">
              <BankOutlined className="summary-icon" />
              <div className="summary-content">
                <div className="summary-label">Entreprise:</div>
                <div className="summary-value">{entrepriseNom}</div>
              </div>
            </div>
            <div className="summary-item">
              <AuditOutlined className="summary-icon" />
              <div className="summary-content">
                <div className="summary-label">Action:</div>
                <div className="summary-value">{actionNom}</div>
              </div>
            </div>
            <div className="summary-item">
              <LinkOutlined className="summary-icon" />
              <div className="summary-content">
                <div className="summary-label">Étape:</div>
                <div className="summary-value">{etapeNom}</div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="step-summary">
            <div className="summary-item">
              <InfoCircleOutlined className="summary-icon" />
              <div className="summary-content">
                <div className="summary-label">Statut:</div>
                <div className="summary-value">{renderStatus(allData.statut)}</div>
              </div>
            </div>
            {allData.date_invitation && (
              <div className="summary-item">
                <CalendarOutlined className="summary-icon" />
                <div className="summary-content">
                  <div className="summary-label">Date d'invitation:</div>
                  <div className="summary-value">{allData.date_invitation.format('DD/MM/YYYY HH:mm')}</div>
                </div>
              </div>
            )}
            {allData.date_evenement && (
              <div className="summary-item">
                <ScheduleOutlined className="summary-icon" />
                <div className="summary-content">
                  <div className="summary-label">Date de l'événement:</div>
                  <div className="summary-value">{allData.date_evenement.format('DD/MM/YYYY HH:mm')}</div>
                </div>
              </div>
            )}
            <div className="summary-item">
              <BellOutlined className="summary-icon" />
              <div className="summary-content">
                <div className="summary-label">Suivi requis:</div>
                <div className="summary-value">{allData.suivi_requis ? 'Oui' : 'Non'}</div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Définition des étapes du formulaire avec des icônes
  const stepsConfig = [
    {
      title: 'Informations personnelles',
      icon: <UserOutlined />,
      description: 'Coordonnées et identité',
      status: completedSteps.includes(0) ? 'finish' : currentStep === 0 ? 'process' : 'wait',
    },
    {
      title: 'Entreprise et action',
      icon: <TeamOutlined />,
      description: 'Associations organisationnelles',
      status: completedSteps.includes(1) ? 'finish' : currentStep === 1 ? 'process' : 'wait',
    },
    {
      title: 'Statut et dates',
      icon: <CalendarOutlined />,
      description: 'Planification et suivi',
      status: completedSteps.includes(2) ? 'finish' : currentStep === 2 ? 'process' : 'wait',
    }
  ];

  // Contenu des étapes du formulaire
  const steps = [
    {
      title: 'Informations personnelles',
      content: (
        <div className="form-section">
          <div className="form-section-header">
            <div className="form-section-icon">
              <Avatar icon={<UserOutlined />} size={48} style={{ backgroundColor: '#1890ff' }} />
            </div>
            <div className="form-section-title">
              <Title level={4}>Informations de l'invité</Title>
              <Text type="secondary">Complétez les informations personnelles de l'invité</Text>
            </div>
          </div>
          
          <Divider />
          
          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="nom" 
                label="Nom" 
                rules={[{ required: true, message: 'Le nom est obligatoire' }]}
                validateStatus={formErrors.nom ? 'error' : ''}
                help={formErrors.nom}
                className="enhanced-form-item"
              >
                <Input 
                  prefix={<UserOutlined className="site-form-item-icon" />} 
                  placeholder="Nom de l'invité"
                  className="enhanced-input" 
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="prenom" 
                label="Prénom" 
                rules={[{ required: true, message: 'Le prénom est obligatoire' }]}
                validateStatus={formErrors.prenom ? 'error' : ''}
                help={formErrors.prenom}
                className="enhanced-form-item"
              >
                <Input 
                  prefix={<UserOutlined className="site-form-item-icon" />} 
                  placeholder="Prénom de l'invité" 
                  className="enhanced-input"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'L\'email est obligatoire' },
                  { type: 'email', message: 'Format d\'email invalide' }
                ]}
                validateStatus={formErrors.email ? 'error' : ''}
                help={formErrors.email}
                className="enhanced-form-item"
              >
                <Input 
                  prefix={<MailOutlined className="site-form-item-icon" />} 
                  placeholder="Email de l'invité" 
                  className="enhanced-input"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="telephone"
                label="Téléphone"
                validateStatus={formErrors.telephone ? 'error' : ''}
                help={formErrors.telephone}
                className="enhanced-form-item"
              >
                <Input 
                  prefix={<PhoneOutlined className="site-form-item-icon" />} 
                  placeholder="Numéro de téléphone" 
                  className="enhanced-input"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="fonction"
                label="Fonction"
                validateStatus={formErrors.fonction ? 'error' : ''}
                help={formErrors.fonction}
                className="enhanced-form-item"
              >
                <Input 
                  prefix={<BuildOutlined className="site-form-item-icon" />} 
                  placeholder="Fonction de l'invité" 
                  className="enhanced-input"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="type_invite"
                label="Type d'invité"
                rules={[{ required: true, message: 'Le type est obligatoire' }]}
                validateStatus={formErrors.type_invite ? 'error' : ''}
                help={formErrors.type_invite}
                className="enhanced-form-item"
              >
                <Select 
                  placeholder="Sélectionnez le type d'invité"
                  className="enhanced-select"
                >
                  <Option value="interne">Interne</Option>
                  <Option value="externe">Externe</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <div className="form-tips">
            <Alert
              message="Conseil"
              description="Une adresse email correcte est importante pour les communications ultérieures avec l'invité."
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
              className="form-tip-alert"
            />
          </div>
        </div>
      )
    },
    {
      title: 'Entreprise et action',
      content: (
        <div className="form-section">
          <div className="form-section-header">
            <div className="form-section-icon">
              <Avatar icon={<TeamOutlined />} size={48} style={{ backgroundColor: '#52c41a' }} />
            </div>
            <div className="form-section-title">
              <Title level={4}>Association avec entreprise et action</Title>
              <Text type="secondary">Associez l'invité à une entreprise et une action</Text>
            </div>
          </div>
          
          <Divider />
          
          {completedSteps.includes(0) && (
            <Card className="summary-card" size="small">
              <Title level={5}>Récapitulatif des informations personnelles</Title>
              {getStepSummary(0)}
            </Card>
          )}
          
          <Row gutter={24} className="form-section-content">
            <Col xs={24} sm={12}>
              <Form.Item
                name="entreprise_id"
                label="Entreprise"
                rules={[{ required: true, message: 'L\'entreprise est obligatoire' }]}
                validateStatus={formErrors.entreprise_id ? 'error' : ''}
                help={formErrors.entreprise_id}
                className="enhanced-form-item"
              >
                <Select
                  placeholder="Sélectionnez une entreprise"
                  loading={entreprises.loading}
                  onChange={value => setSelectedEntreprise(value)}
                  showSearch
                  optionFilterProp="children"
                  className="enhanced-select"
                  notFoundContent={
                    entreprises.loading ? 
                    <div style={{ textAlign: 'center', padding: '8px' }}><Spin size="small" /></div> : 
                    "Aucune entreprise trouvée"
                  }
                >
                  {Array.isArray(entreprises.items) && entreprises.items.map(entreprise => (
                    <Option key={entreprise.id} value={entreprise.id}>
                      <Space>
                        <BankOutlined />
                        {entreprise.nom}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="action_id"
                label="Action"
                rules={[{ required: true, message: 'L\'action est obligatoire' }]}
                validateStatus={formErrors.action_id ? 'error' : ''}
                help={formErrors.action_id}
                className="enhanced-form-item"
              >
                <Select
                  placeholder="Sélectionnez une action"
                  loading={actions.loading}
                  onChange={handleActionChange}
                  showSearch
                  optionFilterProp="children"
                  className="enhanced-select"
                  notFoundContent={
                    actions.loading ? 
                    <div style={{ textAlign: 'center', padding: '8px' }}><Spin size="small" /></div> : 
                    "Aucune action trouvée"
                  }
                >
                  {Array.isArray(actions.items) && actions.items.map(action => (
                    <Option key={action.id} value={action.id}>
                      <Space>
                        <AuditOutlined />
                        {action.nom}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                name="etape_id"
                label="Étape"
                rules={[{ required: true, message: 'L\'étape est obligatoire' }]}
                validateStatus={formErrors.etape_id ? 'error' : ''}
                help={formErrors.etape_id}
                className="enhanced-form-item"
                tooltip={
                  <div>
                    <p>Sélectionnez d'abord une action pour voir les étapes disponibles</p>
                    <p>Les étapes représentent les différentes phases de l'action</p>
                  </div>
                }
              >
                <Select
                  placeholder="Sélectionnez une étape"
                  loading={etapes.loading}
                  disabled={!selectedAction}
                  showSearch
                  optionFilterProp="children"
                  className="enhanced-select"
                  notFoundContent={
                    !selectedAction ? (
                      <div className="empty-select-content">
                        <InfoCircleOutlined style={{ fontSize: 16, marginRight: 8 }} />
                        Sélectionnez d'abord une action
                      </div>
                    ) : etapes.loading ? (
                      <div style={{ textAlign: 'center', padding: '8px' }}><Spin size="small" /></div>
                    ) : (
                      "Aucune étape trouvée"
                    )
                  }
                >
                  {Array.isArray(etapes.items) && etapes.items.map(etape => (
                    <Option key={etape.id} value={etape.id}>
                      <Space>
                        <LinkOutlined />
                        {etape.nom}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <div className="form-tips">
            <Alert
              message="Important"
              description="L'association à une entreprise et à une action permet de suivre efficacement la participation de l'invité."
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
              className="form-tip-alert"
            />
          </div>
        </div>
      )
    },
    {
      title: 'Statut et dates',
      content: (
        <div className="form-section">
          <div className="form-section-header">
            <div className="form-section-icon">
              <Avatar icon={<CalendarOutlined />} size={48} style={{ backgroundColor: '#722ed1' }} />
            </div>
            <div className="form-section-title">
              <Title level={4}>Statut et planification</Title>
              <Text type="secondary">Définissez le statut et les dates importantes</Text>
            </div>
          </div>
          
          <Divider />
          
          {completedSteps.length > 0 && (
            <Card className="summary-card" size="small">
              <Tabs defaultActiveKey="0">
                <TabPane tab="Informations personnelles" key="0">
                  {getStepSummary(0)}
                </TabPane>
                <TabPane tab="Entreprise et action" key="1">
                  {getStepSummary(1)}
                </TabPane>
              </Tabs>
            </Card>
          )}
          
          <Row gutter={24} className="form-section-content">
            <Col xs={24} sm={12}>
              <Form.Item
                name="statut"
                label="Statut"
                rules={[{ required: true, message: 'Le statut est obligatoire' }]}
                validateStatus={formErrors.statut ? 'error' : ''}
                help={formErrors.statut}
                className="enhanced-form-item"
              >
                <Select 
                  placeholder="Sélectionnez un statut"
                  className="enhanced-select status-select"
                >
                  <Option value="en_attente">
                    <Badge status="warning" text="En attente" />
                  </Option>
                  <Option value="envoyee">
                    <Badge status="processing" text="Invitation envoyée" />
                  </Option>
                  <Option value="confirmee">
                    <Badge status="success" text="Confirmée" />
                  </Option>
                  <Option value="refusee">
                    <Badge status="error" text="Refusée" />
                  </Option>
                  <Option value="participation_confirmee">
                    <Badge status="success" text="Participation confirmée" />
                  </Option>
                  <Option value="absente">
                    <Badge status="default" text="Absent(e)" />
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="suivi_requis"
                label="Suivi requis"
                valuePropName="checked"
                tooltip="Indiquez si un suivi est nécessaire après l'invitation"
                className="enhanced-form-item"
              >
                <Switch 
                  checkedChildren="Oui" 
                  unCheckedChildren="Non"
                  className="enhanced-switch"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="date_invitation"
                label="Date d'invitation"
                validateStatus={formErrors.date_invitation ? 'error' : ''}
                help={formErrors.date_invitation}
                className="enhanced-form-item"
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  showTime 
                  format="DD/MM/YYYY HH:mm"
                  placeholder="Sélectionnez la date d'invitation" 
                  className="enhanced-datepicker"
                  popupClassName="enhanced-datepicker-popup"
                  suffixIcon={<CalendarOutlined />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="date_evenement"
                label="Date de l'événement"
                validateStatus={formErrors.date_evenement ? 'error' : ''}
                help={formErrors.date_evenement}
                className="enhanced-form-item"
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  showTime 
                  format="DD/MM/YYYY HH:mm" 
                  placeholder="Sélectionnez la date de l'événement"
                  className="enhanced-datepicker"
                  popupClassName="enhanced-datepicker-popup"
                  suffixIcon={<ScheduleOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                name="commentaires"
                label="Commentaires"
                validateStatus={formErrors.commentaires ? 'error' : ''}
                help={formErrors.commentaires}
                className="enhanced-form-item"
              >
                <TextArea 
                  rows={4} 
                  placeholder="Commentaires concernant cet invité"
                  className="enhanced-textarea" 
                />
              </Form.Item>
            </Col>
          </Row>
          
          <div className="form-tips">
            <Alert
              message="Rappel"
              description="Les dates permettent de planifier les relances et de mesurer l'efficacité de vos invitations."
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
              className="form-tip-alert"
            />
          </div>
        </div>
      )
    }
  ];

  // Calcul de la progression du formulaire
  const calculateProgress = () => {
    return Math.round(((completedSteps.length) / stepsConfig.length) * 100);
  };

  // Affichage du chargement
  if (loadingUser || (id && loadingData)) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <p>Chargement des données...</p>
      </div>
    );
  }

  // Affichage du résultat après soumission
  if (formSubmitted) {
    return (
      <Result
        status="success"
        title={isEditMode ? "Invité mis à jour avec succès" : "Invité créé avec succès"}
        subTitle="Redirection vers la liste des invités..."
        extra={[
          <Button type="primary" key="list" onClick={() => navigate('/invites')}>
            Voir la liste des invités
          </Button>,
        ]}
      />
    );
  }

  // Affichage en cas d'erreur
  if (id && inviteError) {
    return (
      <Result
        status="error"
        title="Une erreur est survenue"
        subTitle={inviteError}
        extra={[
          <Button type="primary" key="back" onClick={() => navigate('/invites')}>
            Retour à la liste
          </Button>,
        ]}
      />
    );
  }

  return (
    <div className="crm-container">
      {/* En-tête avec le style CRM */}
      <div className="crm-header">
        <div className="crm-lead-info">
          <div className="crm-avatar">
            <Avatar icon={<FormOutlined />} size={42} style={{ backgroundColor: '#1890ff' }} />
          </div>
          <div className="crm-title">
            <div className="crm-lead-label">
              {isEditMode ? (
                <>Modifier l'invité: <span className="lead-name">"{invite?.nom} {invite?.prenom}"</span></>
              ) : (
                <>Nouvel invité</>
              )}
            </div>
            <div className="crm-lead-actions">
              <Breadcrumb separator=">" className="crm-breadcrumb">
                <Breadcrumb.Item><Link to="/dashboard"><HomeOutlined /> Accueil</Link></Breadcrumb.Item>
                <Breadcrumb.Item><Link to="/invites"><TeamOutlined /> Invités</Link></Breadcrumb.Item>
                <Breadcrumb.Item>{isEditMode ? 'Modifier' : 'Nouveau'}</Breadcrumb.Item>
              </Breadcrumb>
            </div>
          </div>
        </div>

        <div className="crm-header-actions">
          <Button 
            className="crm-btn" 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/invites')}
          >
            Retour à la liste
          </Button>
          
          {currentStep === steps.length - 1 && (
            <Button 
              type="primary"
              className="crm-btn"
              icon={isEditMode ? <EditOutlined /> : <PlusOutlined />}
              loading={isSubmitting}
              onClick={handleSubmit}
            >
              {isEditMode ? 'Mettre à jour' : 'Créer'}
            </Button>
          )}
        </div>
      </div>

      {/* Informations du pipeline */}
      <div className="crm-meta-info">
        <div className="crm-meta-item">
          <div className="crm-meta-label">TYPE:</div>
          <div className="crm-meta-value">
            <Badge status="processing" text={isEditMode ? "Modification" : "Création"} />
          </div>
        </div>
        <div className="crm-meta-item">
          <div className="crm-meta-label">ÉTAPE:</div>
          <div className="crm-meta-value">
            {stepsConfig[currentStep].title}
          </div>
        </div>
        <div className="crm-meta-item">
          <div className="crm-meta-label">PROGRESSION:</div>
          <div className="crm-meta-value">
            {calculateProgress()}%
          </div>
        </div>
        <div className="crm-meta-item">
          <div className="crm-meta-label">DATE:</div>
          <div className="crm-meta-value">{moment().format('DD/MM/YYYY')}</div>
        </div>
        <div className="crm-meta-item">
          <div className="crm-meta-label">CRÉATEUR:</div>
          <div className="crm-meta-value">
            <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
            {user?.name || 'Utilisateur'}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="crm-content-tabs">
        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
          <TabPane tab={<span><FormOutlined /> Formulaire d'invitation</span>} key="form">
            <div className="crm-form-container">
              <div className="crm-form-progress">
                <Progress 
                  percent={calculateProgress()} 
                  status="active" 
                  showInfo={false}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
                
                <Steps current={currentStep} className="crm-steps">
                  {stepsConfig.map((item) => (
                    <Step 
                      key={item.title}
                      title={item.title}
                      icon={item.icon}
                      status={item.status}
                    />
                  ))}
                </Steps>
              </div>
              
              <div className="crm-form-content">
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{
                    statut: 'en_attente',
                    type_invite: 'externe',
                    suivi_requis: false
                  }}
                >
                  <div className="crm-step-content">
                    {steps[currentStep].content}
                  </div>

                  <div className="crm-step-actions">
                    {currentStep > 0 && (
                      <Button 
                        onClick={prevStep}
                        icon={<LeftOutlined />}
                      >
                        Précédent
                      </Button>
                    )}

                    {currentStep < steps.length - 1 && (
                      <Button 
                        type="primary"
                        onClick={nextStep}
                      >
                        Suivant <RightOutlined />
                      </Button>
                    )}

                    {currentStep === steps.length - 1 && (
                      <Button 
                        type="primary"
                        icon={isEditMode ? <EditOutlined /> : <PlusOutlined />}
                        loading={isSubmitting}
                        onClick={handleSubmit}
                      >
                        {isEditMode ? 'Mettre à jour' : 'Créer l\'invité'}
                      </Button>
                    )}
                  </div>
                </Form>
              </div>
            </div>
          </TabPane>

          <TabPane tab={<span><InfoCircleOutlined /> Aide & Instructions</span>} key="help">
            <div className="crm-help-container">
              <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                  <Card title="Étape 1: Informations personnelles" className="help-card">
                    <p>Commencez par remplir les informations de base sur l'invité :</p>
                    <ul>
                      <li>Nom et prénom sont requis</li>
                      <li>L'email est essentiel pour les communications</li>
                      <li>Le type d'invité détermine l'accès et les communications</li>
                    </ul>
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card title="Étape 2: Entreprise et action" className="help-card">
                    <p>Associez l'invité à une entreprise et une action :</p>
                    <ul>
                      <li>Sélectionnez l'entreprise de l'invité</li>
                      <li>Choisissez l'action à laquelle il est invité</li>
                      <li>Sélectionnez une étape spécifique de l'action</li>
                    </ul>
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card title="Étape 3: Statut et dates" className="help-card">
                    <p>Finalisez l'invitation avec les détails de suivi :</p>
                    <ul>
                      <li>Définissez le statut initial de l'invitation</li>
                      <li>Planifiez les dates importantes</li>
                      <li>Ajoutez des commentaires pour le suivi</li>
                    </ul>
                  </Card>
                </Col>
              </Row>
              
              <Divider />
              
              <Alert
                message="Besoin d'aide supplémentaire?"
                description={
                  <div>
                    <p>Si vous avez des questions sur ce formulaire, contactez l'administrateur système ou consultez la documentation complète.</p>
                    <Button type="link">Voir la documentation</Button>
                  </div>
                }
                type="info"
                showIcon
              />
            </div>
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
        
        .crm-lead-info {
          display: flex;
          align-items: center;
        }
        
        .crm-avatar {
          margin-right: 12px;
        }
        
        .crm-title {
          display: flex;
          flex-direction: column;
        }
        
        .crm-lead-label {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }
        
        .lead-name {
          color: #1890ff;
        }
        
        .crm-lead-actions {
          margin-top: 4px;
        }
        
        .crm-breadcrumb {
          font-size: 12px;
        }
        
        .crm-header-actions {
          display: flex;
          gap: 8px;
        }
        
        .crm-btn {
          border-radius: 4px;
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
        
        .crm-content-tabs {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        
        .crm-form-container {
          padding: 16px;
        }
        
        .crm-form-progress {
          margin-bottom: 32px;
        }
        
        .crm-steps {
          margin-top: 24px;
        }
        
        .crm-step-content {
          min-height: 300px;
          padding: 24px 0;
          margin-bottom: 24px;
        }
        
        .crm-step-actions {
          display: flex;
          justify-content: space-between;
          padding-top: 16px;
          border-top: 1px solid #f0f0f0;
        }
        
        .summary-card {
          background-color: #fafafa;
          border-left: 3px solid #1890ff;
          margin-bottom: 24px;
        }
        
        .step-summary {
          padding: 8px;
        }
        
        .summary-item {
          display: flex;
          margin-bottom: 8px;
        }
        
        .summary-icon {
          color: #1890ff;
          margin-right: 8px;
          font-size: 16px;
        }
        
        .summary-content {
          flex: 1;
        }
        
        .summary-label {
          color: #666;
          font-size: 12px;
        }
        
        .summary-value {
          font-weight: 500;
          color: #333;
        }
        
        .form-section-header {
          display: flex;
          align-items: center;
          margin-bottom: 24px;
        }
        
        .form-section-icon {
          margin-right: 16px;
        }
        
        .form-section-title h4 {
          margin: 0;
          color: #333;
        }
        
        .enhanced-form-item {
          margin-bottom: 24px;
        }
        
        .form-tips {
          margin-top: 24px;
        }
        
        .crm-help-container {
          padding: 24px 0;
        }
        
        .help-card {
          height: 100%;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }
        
        .loading-container p {
          margin-top: 16px;
          color: #666;
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
          
          .crm-step-actions {
            flex-direction: column;
            gap: 12px;
          }
          
          .crm-step-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default InviteForm;