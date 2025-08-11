import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  DatePicker,
  Space,
  message,
  Spin,
  Row,
  Col,
  Steps,
  Breadcrumb,
  Divider,
  Switch,
  Tooltip
} from 'antd';
import {
  SaveOutlined, 
  ArrowLeftOutlined, 
  UserOutlined, 
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  TeamOutlined,
  FileTextOutlined,
  EditOutlined,
  PlusOutlined,
  CheckOutlined,
  BuildOutlined
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
    }
  }, [invite, form, id, dispatch]);

  // Gestion des succès/erreurs d'opération
  useEffect(() => {
    if (operation.success) {
      message.success(id ? 'Invité mis à jour avec succès' : 'Invité créé avec succès');
      setIsSubmitting(false);
      navigate('/invites');
    } else if (operation.error) {
      message.error(operation.error);
      setIsSubmitting(false);
    }
  }, [operation, navigate, id]);

  // Fonctions de navigation entre étapes
  const nextStep = async () => {
    try {
      const currentValues = await form.validateFields();
      
      setStepsData(prevData => ({
        ...prevData,
        ...currentValues
      }));
      
      setCurrentStep(currentStep + 1);
    } catch (errorInfo) {
      console.log('Validation échouée:', errorInfo);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Soumission du formulaire
  const handleSubmit = async () => {
    try {
      const currentStepValues = await form.validateFields();
      const allFormValues = {
        ...stepsData,
        ...currentStepValues
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
        message.success('Invité mis à jour avec succès');
      } else {
        await dispatch(createInvite(formattedValues)).unwrap();
        message.success('Invité créé avec succès');
      }
      
      navigate('/invites');
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      message.error('Une erreur est survenue lors du traitement du formulaire');
      setIsSubmitting(false);
    }
  };

  // Définition des étapes du formulaire
  const steps = [
    {
      title: 'Informations personnelles',
      content: (
        <div className="form-section">
          <h3 className="form-section-title">
            <UserOutlined /> Informations de l'invité
          </h3>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="nom" 
                label="Nom" 
                rules={[{ required: true, message: 'Veuillez saisir le nom' }]}
                className="required-field"
              >
                <Input placeholder="Nom de l'invité" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="prenom" 
                label="Prénom" 
                rules={[{ required: true, message: 'Veuillez saisir le prénom' }]}
                className="required-field"
              >
                <Input placeholder="Prénom de l'invité" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Veuillez saisir l\'email' },
                  { type: 'email', message: 'Format d\'email invalide' }
                ]}
                className="required-field"
              >
                <Input placeholder="Email de l'invité" prefix={<MailOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="telephone"
                label="Téléphone"
              >
                <Input placeholder="Numéro de téléphone" prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fonction"
                label="Fonction"
              >
                <Input placeholder="Fonction de l'invité" prefix={<BuildOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type_invite"
                label="Type d'invité"
                rules={[{ required: true, message: 'Veuillez sélectionner le type' }]}
                className="required-field"
              >
                <Select placeholder="Sélectionnez le type d'invité">
                  <Option value="interne">Interne</Option>
                  <Option value="externe">Externe</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </div>
      )
    },
    {
      title: 'Entreprise et action',
      content: (
        <div className="form-section">
          <h3 className="form-section-title">
            <TeamOutlined /> Association avec entreprise et action
          </h3>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="entreprise_id"
                label="Entreprise"
                rules={[{ required: true, message: 'Veuillez sélectionner une entreprise' }]}
                className="required-field"
              >
                <Select
                  placeholder="Sélectionnez une entreprise"
                  loading={entreprises.loading}
                  onChange={value => setSelectedEntreprise(value)}
                  showSearch
                  optionFilterProp="children"
                >
                  {Array.isArray(entreprises.items) && entreprises.items.map(entreprise => (
                    <Option key={entreprise.id} value={entreprise.id}>
                      {entreprise.nom}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="action_id"
                label="Action"
                rules={[{ required: true, message: 'Veuillez sélectionner une action' }]}
                className="required-field"
              >
                <Select
                  placeholder="Sélectionnez une action"
                  loading={actions.loading}
                  onChange={handleActionChange}
                  showSearch
                  optionFilterProp="children"
                >
                  {Array.isArray(actions.items) && actions.items.map(action => (
                    <Option key={action.id} value={action.id}>
                      {action.nom}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="etape_id"
                label="Étape"
                rules={[{ required: true, message: 'Veuillez sélectionner une étape' }]}
                className="required-field"
                tooltip="Veuillez d'abord sélectionner une action pour voir les étapes disponibles"
              >
                <Select
                  placeholder="Sélectionnez une étape"
                  loading={etapes.loading}
                  disabled={!selectedAction}
                  showSearch
                  optionFilterProp="children"
                  notFoundContent={
                    selectedAction 
                      ? (etapes.loading ? <Spin size="small" /> : "Aucune étape trouvée") 
                      : "Sélectionnez d'abord une action"
                  }
                >
                  {Array.isArray(etapes.items) && etapes.items.map(etape => (
                    <Option key={etape.id} value={etape.id}>
                      {etape.nom}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </div>
      )
    },
    {
      title: 'Statut et dates',
      content: (
        <div className="form-section">
          <h3 className="form-section-title">
            <CalendarOutlined /> Statut et planification
          </h3>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="statut"
                label="Statut"
                rules={[{ required: true, message: 'Veuillez sélectionner un statut' }]}
                className="required-field"
              >
                <Select placeholder="Sélectionnez un statut">
                  <Option value="en_attente">En attente</Option>
                  <Option value="confirmee">Confirmée</Option>
                  <Option value="refusee">Refusée</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="suivi_requis"
                label="Suivi requis"
                valuePropName="checked"
                tooltip="Indiquez si un suivi est nécessaire après l'invitation"
              >
                <Switch 
                  checkedChildren="Oui" 
                  unCheckedChildren="Non"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date_invitation"
                label="Date d'invitation"
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  showTime 
                  format="DD/MM/YYYY HH:mm"
                  placeholder="Sélectionnez la date d'invitation" 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="date_evenement"
                label="Date de l'événement"
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  showTime 
                  format="DD/MM/YYYY HH:mm" 
                  placeholder="Sélectionnez la date de l'événement"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="commentaires"
                label="Commentaires"
              >
                <TextArea 
                  rows={4} 
                  placeholder="Commentaires concernant cet invité"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
      )
    }
  ];

  // Affichage du chargement
  if (loadingUser || (id && loadingData)) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <p>Chargement des données...</p>
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (id && inviteError) {
    return (
      <div className="error-container">
        <h2>Erreur</h2>
        <p>{inviteError}</p>
        <Button type="primary" onClick={() => navigate('/invites')}>
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="action-form-container">
      <div className="action-form-header">
        <Breadcrumb className="breadcrumb-navigation">
          <Breadcrumb.Item>
            <Link to="/">Tableau de bord</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/invites">Invités</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            {isEditMode ? 'Modifier un invité' : 'Nouvel invité'}
          </Breadcrumb.Item>
        </Breadcrumb>
        
        <div className="header-content">
          <div className="title-section">
            <h2 className="form-title">
              {isEditMode ? (
                <><EditOutlined /> Modifier l'invité</>
              ) : (
                <><PlusOutlined /> Nouvel invité</>
              )}
            </h2>
            {isEditMode && invite && <p className="action-subtitle">ID: {id} - {invite.nom} {invite.prenom}</p>}
          </div>
          
          <div className="header-actions">
            <Link to="/invites">
              <Button icon={<ArrowLeftOutlined />}>Retour à la liste</Button>
            </Link>
          </div>
        </div>
      </div>
      
      <Card className="action-form-content">
        <Steps current={currentStep} style={{ marginBottom: 40 }}>
          {steps.map(step => (
            <Step key={step.title} title={step.title} />
          ))}
        </Steps>
        
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            statut: 'en_attente',
            type_invite: 'externe',
            suivi_requis: false
          }}
        >
          <div className="steps-content form-fade-in">
            {steps[currentStep].content}
          </div>
          
          <div className="steps-action" style={{ marginTop: 24, textAlign: 'right' }}>
            {currentStep > 0 && (
              <Button style={{ marginRight: 8 }} onClick={prevStep}>
                Précédent
              </Button>
            )}
            
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={nextStep}>
                Suivant
              </Button>
            )}
            
            {currentStep === steps.length - 1 && (
              <Button 
                type="primary" 
                onClick={handleSubmit}
                className={isEditMode ? "update-button" : ""}
                icon={isEditMode ? <EditOutlined /> : <CheckOutlined />}
                loading={isSubmitting}
              >
                {isEditMode ? 'Mettre à jour' : 'Créer l\'invité'}
              </Button>
            )}
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default InviteForm;