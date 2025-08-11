import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchAllUsers } from '../../features/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Card,
  message,
  Row,
  Col,
  Divider,
  Tooltip,
  Steps,
  Space,
  Spin,
  Breadcrumb
} from 'antd';
import { 
  addAction, 
  updateAction, 
  getActionById 
} from '../../features/marketingSlice';
import Media from '../Promotional activities/Marketing pays/Media';
import CTE from '../Promotional activities/Marketing pays/CTE';
import Salon from '../Promotional activities/Marketing pays/Salon';
import Delegations from '../Promotional activities/Visites et délégation/Delegations';
import Seminaire from '../Promotional activities/Marketing pays/Seminaire';
import DemarchageDirect from '../Promotional activities/Marketing secteurs/DemarchageDirect';
import SalonsSectoriels from '../Promotional activities/Marketing secteurs/SalonsSectoriels';
import SeminaireSecteur from '../Promotional activities/Marketing secteurs/SeminaireSecteur';
import VisiteEntreprise from '../Promotional activities/Visites et délégation/VisiteEntreprise';
import { 
  FormOutlined, 
  CheckOutlined, 
  CalendarOutlined, 
  UserOutlined, 
  EnvironmentOutlined, 
  FileTextOutlined,
  InfoCircleOutlined,
  SendOutlined,
  LoadingOutlined,
  EditOutlined,
  PlusOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import '../../../src/assets/styles/action-form.css';

const { Option } = Select;
const { Step } = Steps;

const ActionForm = () => {
  const { id } = useParams(); // Récupérer l'ID de l'action si en mode édition
  const isEditMode = !!id; // Détecter si nous sommes en mode édition
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const actionData = useSelector((state) => state.marketing.actions.selectedItem);
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode); // Charger les données si en mode édition
  const [selectedType, setSelectedType] = useState(null);
  const [subFormData, setSubFormData] = useState({});
  const [formattedDateDebut, setFormattedDateDebut] = useState(null);
  const [mainDateDebut, setMainDateDebut] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepsData, setStepsData] = useState({});

  // Charger les détails de l'action en cas de mode édition
  useEffect(() => {
    if (isEditMode) {
      const loadActionDetails = async () => {
        try {
          setLoadingData(true);
          await dispatch(getActionById(id)).unwrap();
        } catch (error) {
          console.error("Erreur lors du chargement de l'action:", error);
          message.error("Impossible de charger les détails de l'action");
        } finally {
          setLoadingData(false);
        }
      };
      
      loadActionDetails();
    }
  }, [dispatch, id, isEditMode]);

  // Charger les utilisateurs pour le champ responsable
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await dispatch(fetchAllUsers()).unwrap();
        setUsers(response.data || response);
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs:", error);
        message.error("Impossible de charger la liste des responsables");
      }
    };
    
    loadUsers();
  }, [dispatch]);

  // Remplir le formulaire avec les données de l'action en mode édition
  useEffect(() => {
    if (isEditMode && actionData && !loadingData) {
      // Définir le type sélectionné
      setSelectedType(actionData.type);
      
      // Préparer les valeurs du formulaire principal
      const formValues = {
        nom: actionData.nom,
        type: actionData.type,
        description: actionData.description,
        statut: actionData.statut,
        responsable_id: actionData.responsable_id,
        date_debut: actionData.date_debut ? moment(actionData.date_debut) : null,
        date_fin: actionData.date_fin ? moment(actionData.date_fin) : null,
        lieu: actionData.lieu,
        ville: actionData.ville,
        pays: actionData.pays,
        notes_internes: actionData.notes_internes
      };
      
      // Mettre à jour les états pour la date
      if (formValues.date_debut) {
        setMainDateDebut(formValues.date_debut);
        setFormattedDateDebut(formatDate(formValues.date_debut));
      }
      
      // Pré-remplir le formulaire
      form.setFieldsValue(formValues);
      
      // Pré-remplir les données du sous-formulaire spécifique au type
      if (actionData.type) {
        // Obtenir l'entité spécifique au type (media, cte, etc.)
        const typeEntityMap = {
          'media': 'media',
          'cte': 'cte',
          'salon': 'salon',
          'delegation': 'delegation',
          'seminaire_jipays': 'seminaireJIPays',
          'demarchage_direct': 'demarchageDirect',
          'salon_sectoriel': 'salonSectoriel',
          'seminaire_jisecteur': 'seminaireJISecteur',
          'visite_entreprise': 'visiteEntreprise',
        };
        
        const entityName = typeEntityMap[actionData.type];
        const entityData = actionData[entityName];
        
        if (entityData) {
          // Préparer les données pour le sous-formulaire
          const subFormInitialData = { ...entityData };
          
          // Convertir les dates
          Object.keys(subFormInitialData).forEach(key => {
            if (key.includes('date') && subFormInitialData[key]) {
              subFormInitialData[key] = moment(subFormInitialData[key]);
            }
          });
          
          setSubFormData(subFormInitialData);
        }
      }
    }
  }, [actionData, loadingData, isEditMode, form]);

  // Formatage de date
  const formatDate = (dateValue) => {
    if (!dateValue) return null;
    
    try {
      if (moment.isMoment(dateValue)) {
        return dateValue.format('YYYY-MM-DD');
      } else if (dateValue instanceof Date) {
        return moment(dateValue).format('YYYY-MM-DD');
      } else if (typeof dateValue === 'string') {
        if (dateValue.includes('T')) {
          return dateValue.split('T')[0];
        }
        return dateValue;
      } else {
        return moment(dateValue).format('YYYY-MM-DD');
      }
    } catch (e) {
      console.error('Erreur lors du formatage de la date:', e);
      return null;
    }
  };

  // Gestionnaire pour la date de début
  const handleDateDebutChange = (date) => {
    console.log("Date principale mise à jour:", date);
    setMainDateDebut(date);
    
    const formatted = formatDate(date);
    setFormattedDateDebut(formatted);
    
    if (!date) {
      message.warning('La date de début est obligatoire');
    }
  };

  // Formatage de tous les champs de date
  const formatAllDateFields = (payload) => {
    const dateFields = ['date_debut', 'date_fin', 'date_visite', 'date_contact', 'date_butoir'];
    
    dateFields.forEach(field => {
      if (payload[field]) {
        if (typeof payload[field] === 'string' && payload[field].includes('T')) {
          payload[field] = payload[field].split('T')[0];
        } 
        else if (payload[field]) {
          payload[field] = formatDate(payload[field]);
        }
      }
    });
    
    return payload;
  };

  // Affichage du sous-formulaire selon le type
  const renderTypeForm = () => {
    if (!selectedType) return null;
    
    const componentMap = {
      'media': Media,
      'cte': CTE,
      'salon': Salon,
      'delegation': Delegations,
      'seminaire_jipays': Seminaire,
      'demarchage_direct': DemarchageDirect,
      'salon_sectoriel': SalonsSectoriels,
      'seminaire_jisecteur': SeminaireSecteur,
      'visite_entreprise': VisiteEntreprise,
    };
    
    const Component = componentMap[selectedType];
    
    if (!Component) return null;
    
    return (
      <div className="sub-form-container form-fade-in">
        <Divider>
          <Space>
            <FileTextOutlined />
            <span>Détails spécifiques du type {selectedType}</span>
          </Space>
        </Divider>
        <Component
          onChange={setSubFormData}
          mainDateDebut={mainDateDebut}
          initialData={subFormData} // Passer les données initiales au sous-formulaire
        />
      </div>
    );
  };

  // Navigation entre les étapes
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
      
      console.log(`${isEditMode ? 'Mise à jour' : 'Création'} du formulaire...`);
      console.log('Valeurs combinées de toutes les étapes:', allFormValues);
      
      // Formater la date de début
      const formattedDateDebut = formatDate(allFormValues.date_debut);
      
      // Créer l'objet à envoyer au serveur
      let actionPayload = {
        ...allFormValues,
        date_debut: formattedDateDebut,
        type: selectedType
      };
    
      // Logger l'état du payload avant fusion
      console.log('Payload initial avant fusion des sous-formulaires:', {...actionPayload});
      
      // Fusionner avec les données du sous-formulaire
      if (subFormData) {
        console.log('Données du sous-formulaire à fusionner:', subFormData);
        
        // Préserver les données importantes du formulaire principal
        const mainFormNom = actionPayload.nom;
        const mainFormDateDebut = actionPayload.date_debut;
        
        // Fusion des données avec précaution
        Object.entries(subFormData).forEach(([key, value]) => {
          // Ne pas écraser les données importantes du formulaire principal
          if (key === 'nom' && mainFormNom) return;
          if (key === 'date_debut' && mainFormDateDebut) return;
          
          actionPayload[key] = value;
        });
        
        // S'assurer que la date est bien définie
        if (!actionPayload.date_debut) {
          const fallbackDate = subFormData.date_debut || formattedDateDebut;
          console.log('Réapplication de la date après fusion:', fallbackDate);
          actionPayload.date_debut = fallbackDate;
        }
        
        // Formatage des dates additionnelles
        ['date_fin', 'date_butoir'].forEach(dateField => {
          if (actionPayload[dateField]) {
            actionPayload[dateField] = formatDate(actionPayload[dateField]);
          }
        });
      }
      
      actionPayload = formatAllDateFields(actionPayload);
      console.log('Données finales avec toutes les dates formatées:', actionPayload);
      
      // VÉRIFICATION FINALE: Confirmer que les champs obligatoires sont présents
      if (!actionPayload.nom) {
        console.error('Nom manquant dans le payload final!');
        message.error('Le nom de l\'action est obligatoire');
        return;
      }
      
      if (!actionPayload.date_debut) {
        console.error('Date de début manquante dans le payload final!');
        message.error('La date de début est obligatoire');
        return;
      }
      
      // Traitement du responsable
      if (actionPayload.responsable_id) {
        actionPayload.responsable_id = Number(actionPayload.responsable_id);
      } else {
        delete actionPayload.responsable_id;
      }

      // Traitement spécifique pour visite_entreprise
      if (selectedType === 'visite_entreprise') {
        console.log("Traitement spécifique pour visite d'entreprise");
        
        actionPayload.date_visite = actionPayload.date_visite || actionPayload.date_debut;
        
        ['entreprise_importante', 'encadre_avec_programme'].forEach(field => {
          if (actionPayload[field] !== undefined) {
            actionPayload[field] = actionPayload[field] === true;
          }
        });
        
        if (actionPayload.nombre_visites) {
          actionPayload.nombre_visites = Number(actionPayload.nombre_visites);
        }
      }
      
      setLoading(true);
      
      try {
        let response;
        if (isEditMode) {
          // Mode édition: appeler updateAction
          response = await dispatch(updateAction({ id, data: actionPayload })).unwrap();
          message.success('Action mise à jour avec succès');
        } else {
          // Mode création: appeler addAction
          response = await dispatch(addAction(actionPayload)).unwrap();
          message.success('Action créée avec succès');
        }
        
        console.log(`${isEditMode ? 'Mise à jour' : 'Création'} réussie:`, response);
        
        // Rediriger vers la page de détails de l'action
        const actionId = isEditMode ? id : (response.data?.id || response.id);
        navigate(`/actions/${actionId}`);
      } catch (apiError) {
        console.error(`Erreur lors de la ${isEditMode ? 'mise à jour' : 'création'}:`, apiError);
        
        if (apiError.errors) {
          const errorMessages = Object.entries(apiError.errors)
            .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
            .join(' | ');
          
          message.error(`Erreurs de validation: ${errorMessages}`);
        } else {
          message.error(`Erreur: ${apiError.message || JSON.stringify(apiError)}`);
        }
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      message.error('Une erreur est survenue lors du traitement du formulaire');
    }
  };

  // Contenu des étapes du formulaire
  const steps = [
    {
      title: 'Information de base',
      content: (
        <div className="form-section">
          <h3 className="form-section-title">
            <FormOutlined /> Informations générales
          </h3>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="nom" 
                label="Nom" 
                rules={[{ required: true, message: 'Veuillez saisir le nom de l\'action' }]}
                className="required-field"
              >
                <Input placeholder="Nom de l'action" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="type" 
                label="Type" 
                rules={[{ required: true, message: 'Veuillez sélectionner un type' }]}
                className="required-field"
              >
                <Select 
                  onChange={(value) => {
                    // Si le type change, réinitialiser les données du sous-formulaire
                    if (value !== selectedType) {
                      setSubFormData({});
                    }
                    setSelectedType(value);
                  }} 
                  placeholder="Sélectionnez le type"
                  showSearch
                  optionFilterProp="children"
                  disabled={isEditMode} // Désactiver la modification du type en mode édition
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
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="description" label="Description">
                <Input.TextArea placeholder="Description de l'action" rows={4} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="statut" label="Statut">
                <Select placeholder="Sélectionnez le statut">
                  <Option value="planifiee">Planifiée</Option>
                  <Option value="terminee">Terminée</Option>
                  <Option value="annulee">Annulée</Option>
                  <Option value="reportee">Reportée</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="responsable_id"
                label="Responsable"
                tooltip="Personne responsable de cette action"
              >
                <Select
                  placeholder="Sélectionnez un responsable"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  loading={users.length === 0}
                >
                  {users.map(user => (
                    <Option key={user.id} value={user.id}>
                      {user.name}
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
      title: 'Date et lieu',
      content: (
        <div className="form-section">
          <h3 className="form-section-title">
            <CalendarOutlined /> Dates et localisation
          </h3>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date_debut"
                label="Date début"
                rules={[{ required: true, message: 'La date de début est requise' }]}
                className="required-field"
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="YYYY-MM-DD" 
                  onChange={handleDateDebutChange} 
                  placeholder="Sélectionnez une date"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="date_fin"
                label="Date fin"
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="YYYY-MM-DD" 
                  placeholder="Sélectionnez une date (optionnel)"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="lieu" label="Lieu">
                <Input placeholder="Lieu de l'action" prefix={<EnvironmentOutlined />} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="ville" label="Ville">
                <Input placeholder="Ville de l'action" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="pays" label="Pays">
                <Input placeholder="Pays de l'action" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="notes_internes" label="Notes internes">
                <Input.TextArea placeholder="Notes internes (visibles uniquement par l'équipe)" rows={4} />
              </Form.Item>
            </Col>
          </Row>
        </div>
      )
    },
    {
      title: 'Détails spécifiques',
      content: (
        <div className="form-section">
          {selectedType ? (
            renderTypeForm()
          ) : (
            <div className="empty-type-message">
              <InfoCircleOutlined style={{ fontSize: 24, color: '#FFD700' }} />
              <p>Veuillez sélectionner un type d'action pour afficher les champs spécifiques</p>
            </div>
          )}
        </div>
      )
    }
  ];

  // Affichage du chargement en mode édition
  if (isEditMode && loadingData) {
    return (
      <div className="loading-container">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        <p>Chargement des données de l'action...</p>
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
            <Link to="/actions">Actions</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            {isEditMode ? 'Modifier une action' : 'Nouvelle action'}
          </Breadcrumb.Item>
        </Breadcrumb>
        
        <div className="header-content">
          <div className="title-section">
            <h2 className="form-title">
              {isEditMode ? (
                <><EditOutlined /> Modifier l'action</>
              ) : (
                <><PlusOutlined /> Nouvelle action</>
              )}
            </h2>
            {isEditMode && actionData && <p className="action-subtitle"> Action: {actionData.nom}</p>}
          </div>
          
          <div className="header-actions">
            <Link to="/actions">
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
        
        <Form form={form} layout="vertical">
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
                loading={loading}
              >
                {isEditMode ? 'Mettre à jour' : 'Créer l\'action'}
              </Button>
            )}
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ActionForm;