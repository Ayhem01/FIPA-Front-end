import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchAllUsers } from '../../features/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../../features/userSlice';

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
  Breadcrumb,
  Avatar,
  Badge,
  Typography,
  Alert,
  Grid
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
  ArrowLeftOutlined,
  HomeOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  PlayCircleOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PhoneOutlined,
  FireOutlined,
  SyncOutlined,
  ThunderboltOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

const { Option } = Select;
const { Step } = Steps;
const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

// Composant de carte animée similaire au dashboard
const AnimatedFormCard = ({ title, children, loading, extra, delay = 0, icon }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        delay: delay * 0.1,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      style={{ height: '100%' }}
    >
      <Card
        className="form-card-modern"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay * 0.1 + 0.2 }}
            >
              <div style={{
                width: '8px',
                height: '24px',
                borderRadius: '4px',
                background: 'linear-gradient(135deg, #1890ff, #096dd9)'
              }} />
            </motion.div>
            {icon && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: delay * 0.1 + 0.3 }}
                style={{ color: '#1890ff' }}
              >
                {icon}
              </motion.div>
            )}
            <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
              {title}
            </Title>
          </div>
        }
        extra={extra}
        style={{
          height: '100%',
          borderRadius: '16px',
          border: '1px solid #f0f0f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '200px'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  style={{ marginBottom: '16px' }}
                >
                  <SyncOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                </motion.div>
                <Text type="secondary">Chargement des données...</Text>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

const ActionForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  
  const actionData = useSelector((state) => state.marketing.actions.selectedItem);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [selectedType, setSelectedType] = useState(null);
  const [subFormData, setSubFormData] = useState({});
  const [formattedDateDebut, setFormattedDateDebut] = useState(null);
  const [mainDateDebut, setMainDateDebut] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepsData, setStepsData] = useState({});
  const { user: currentUser, loading: userLoading } = useSelector((s) => s.user);

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


    useEffect(() => {
    if (!currentUser?.id) dispatch(getCurrentUser());
  }, [dispatch, currentUser?.id]);

  const isAdmin =
    currentUser?.is_admin === true ||
    currentUser?.role === 'admin' ||
    (Array.isArray(currentUser?.roles_list) && currentUser.roles_list.includes('admin')) ||
    (Array.isArray(currentUser?.roles) && currentUser.roles.some(r => (r?.name || r) === 'admin'));

  if (userLoading && !currentUser) {
    return (
      <div style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/403" replace />;
  }

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
      setSelectedType(actionData.type);

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

      if (formValues.date_debut) {
        setMainDateDebut(formValues.date_debut);
        setFormattedDateDebut(formatDate(formValues.date_debut));
      }

      form.setFieldsValue(formValues);

      if (actionData.type) {
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
          const subFormInitialData = { ...entityData };

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

  // Configuration des types avec icônes et couleurs
  const getTypeConfig = (type) => {
    const configs = {
      'media': { icon: <PlayCircleOutlined />, color: '#1890ff', label: 'Media' },
      'cte': { icon: <SettingOutlined />, color: '#52c41a', label: 'CTE' },
      'salon': { icon: <TeamOutlined />, color: '#722ed1', label: 'Salon' },
      'delegation': { icon: <UserOutlined />, color: '#fa8c16', label: 'Délégation' },
      'seminaire_jipays': { icon: <FileTextOutlined />, color: '#13c2c2', label: 'Séminaire' },
      'demarchage_direct': { icon: <PhoneOutlined />, color: '#eb2f96', label: 'Démarchage Direct' },
      'salon_sectoriel': { icon: <GlobalOutlined />, color: '#faad14', label: 'Salon Sectoriel' },
      'seminaire_jisecteur': { icon: <FileTextOutlined />, color: '#f5222d', label: 'Séminaire Secteur' },
      'visite_entreprise': { icon: <EnvironmentOutlined />, color: '#a0d911', label: 'Visite Entreprise' },
    };
    return configs[type] || { icon: <ExclamationCircleOutlined />, color: '#666', label: type };
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

    const typeConfig = getTypeConfig(selectedType);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sub-form-container"
      >
        <AnimatedFormCard
          title={`Détails spécifiques - ${typeConfig.label}`}
          icon={typeConfig.icon}
          delay={2}
        >
          <Component
            onChange={setSubFormData}
            mainDateDebut={mainDateDebut}
            initialData={subFormData}
          />
        </AnimatedFormCard>
      </motion.div>
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

      const formattedDateDebut = formatDate(allFormValues.date_debut);

      let actionPayload = {
        ...allFormValues,
        date_debut: formattedDateDebut,
        type: selectedType
      };

      console.log('Payload initial avant fusion des sous-formulaires:', { ...actionPayload });

      if (subFormData) {
        console.log('Données du sous-formulaire à fusionner:', subFormData);

        const mainFormNom = actionPayload.nom;
        const mainFormDateDebut = actionPayload.date_debut;

        Object.entries(subFormData).forEach(([key, value]) => {
          if (key === 'nom' && mainFormNom) return;
          if (key === 'date_debut' && mainFormDateDebut) return;

          actionPayload[key] = value;
        });

        if (!actionPayload.date_debut) {
          const fallbackDate = subFormData.date_debut || formattedDateDebut;
          console.log('Réapplication de la date après fusion:', fallbackDate);
          actionPayload.date_debut = fallbackDate;
        }

        ['date_fin', 'date_butoir'].forEach(dateField => {
          if (actionPayload[dateField]) {
            actionPayload[dateField] = formatDate(actionPayload[dateField]);
          }
        });
      }

      actionPayload = formatAllDateFields(actionPayload);
      console.log('Données finales avec toutes les dates formatées:', actionPayload);

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

      if (actionPayload.responsable_id) {
        actionPayload.responsable_id = Number(actionPayload.responsable_id);
      } else {
        delete actionPayload.responsable_id;
      }

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
          response = await dispatch(updateAction({ id, data: actionPayload })).unwrap();
          message.success('Action mise à jour avec succès');
        } else {
          response = await dispatch(addAction(actionPayload)).unwrap();
          message.success('Action créée avec succès');
        }

        console.log(`${isEditMode ? 'Mise à jour' : 'Création'} réussie:`, response);

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
      title: 'Informations de base',
      icon: <FormOutlined />,
      content: (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatedFormCard
            title="Informations générales"
            icon={<FormOutlined />}
            delay={0}
          >
            <Row gutter={[24, 16]}>
              <Col xs={24} lg={12}>
                <Form.Item
                  name="nom"
                  label="Nom de l'action"
                  rules={[{ required: true, message: 'Veuillez saisir le nom de l\'action' }]}
                >
                  <Input
                    prefix={<EditOutlined style={{ color: '#1890ff' }} />}
                    placeholder="Nom de l'action"
                    className="modern-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item
                  name="type"
                  label="Type d'action"
                  rules={[{ required: true, message: 'Veuillez sélectionner un type' }]}
                >
                  <Select
                    onChange={(value) => {
                      if (value !== selectedType) {
                        setSubFormData({});
                      }
                      setSelectedType(value);
                    }}
                    placeholder="Sélectionnez le type"
                    className="modern-select"
                    showSearch
                    optionFilterProp="children"
                    disabled={isEditMode}
                  >
                    <Option value="media">
                      <Space>
                        <PlayCircleOutlined style={{ color: '#1890ff' }} />
                        Media
                      </Space>
                    </Option>
                    <Option value="cte">
                      <Space>
                        <SettingOutlined style={{ color: '#52c41a' }} />
                        CTE
                      </Space>
                    </Option>
                    <Option value="salon">
                      <Space>
                        <TeamOutlined style={{ color: '#722ed1' }} />
                        Salon
                      </Space>
                    </Option>
                    <Option value="delegation">
                      <Space>
                        <UserOutlined style={{ color: '#fa8c16' }} />
                        Délégation
                      </Space>
                    </Option>
                    <Option value="seminaire_jipays">
                      <Space>
                        <FileTextOutlined style={{ color: '#13c2c2' }} />
                        Séminaire
                      </Space>
                    </Option>
                    <Option value="demarchage_direct">
                      <Space>
                        <PhoneOutlined style={{ color: '#eb2f96' }} />
                        Démarchage Direct
                      </Space>
                    </Option>
                    <Option value="salon_sectoriel">
                      <Space>
                        <GlobalOutlined style={{ color: '#faad14' }} />
                        Salon Sectoriel
                      </Space>
                    </Option>
                    <Option value="seminaire_jisecteur">
                      <Space>
                        <FileTextOutlined style={{ color: '#f5222d' }} />
                        Séminaire Secteur
                      </Space>
                    </Option>
                    <Option value="visite_entreprise">
                      <Space>
                        <EnvironmentOutlined style={{ color: '#a0d911' }} />
                        Visite Entreprise
                      </Space>
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="description" label="Description">
                  <Input.TextArea
                    placeholder="Description détaillée de l'action"
                    rows={4}
                    className="modern-textarea"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item name="statut" label="Statut">
                  <Select placeholder="Sélectionnez le statut" className="modern-select">
                    <Option value="planifiee">
                      <Badge status="default" text="Planifiée" />
                    </Option>
                    <Option value="en_preparation">
                      <Badge status="processing" text="En préparation" />
                    </Option>
                    <Option value="confirmee">
                      <Badge status="warning" text="Confirmée" />
                    </Option>
                    <Option value="en_cours">
                      <Badge status="processing" text="En cours" />
                    </Option>
                    <Option value="terminee">
                      <Badge status="success" text="Terminée" />
                    </Option>
                    <Option value="annulee">
                      <Badge status="error" text="Annulée" />
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
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
                    className="modern-select"
                  >
                    {users.map(user => (
                      <Option key={user.id} value={user.id}>
                        <Space>
                          <UserOutlined />
                          {user.name}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </AnimatedFormCard>
        </motion.div>
      )
    },
    {
      title: 'Dates et lieu',
      icon: <CalendarOutlined />,
      content: (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <AnimatedFormCard
            title="Planification et localisation"
            icon={<CalendarOutlined />}
            delay={1}
          >
            <Row gutter={[24, 16]}>
              <Col xs={24} lg={12}>
                <Form.Item
                  name="date_debut"
                  label="Date de début"
                  rules={[{ required: true, message: 'La date de début est requise' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="YYYY-MM-DD"
                    onChange={handleDateDebutChange}
                    placeholder="Sélectionnez une date"
                    className="modern-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item
                  name="date_fin"
                  label="Date de fin"
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="YYYY-MM-DD"
                    placeholder="Sélectionnez une date (optionnel)"
                    className="modern-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item name="lieu" label="Lieu">
                  <Input
                    placeholder="Lieu de l'action"
                    prefix={<EnvironmentOutlined style={{ color: '#fa8c16' }} />}
                    className="modern-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item name="ville" label="Ville">
                  <Input
                    placeholder="Ville de l'action"
                    className="modern-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item name="pays" label="Pays">
                  <Input
                    placeholder="Pays de l'action"
                    prefix={<GlobalOutlined style={{ color: '#13c2c2' }} />}
                    className="modern-input"
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="notes_internes" label="Notes internes">
                  <Input.TextArea
                    placeholder="Notes internes (visibles uniquement par l'équipe)"
                    rows={4}
                    className="modern-textarea"
                  />
                </Form.Item>
              </Col>
            </Row>
          </AnimatedFormCard>
        </motion.div>
      )
    },
    {
      title: 'Détails spécifiques',
      icon: <SettingOutlined />,
      content: (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {selectedType ? (
            renderTypeForm()
          ) : (
            <AnimatedFormCard
              title="Sélection du type requise"
              icon={<InfoCircleOutlined />}
              delay={2}
            >
              <div className="empty-type-message">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <InfoCircleOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
                </motion.div>
                <Title level={4}>Sélectionnez un type d'action</Title>
                <Text type="secondary">
                  Veuillez retourner à l'étape précédente et sélectionner un type d'action
                  pour afficher les champs spécifiques
                </Text>
              </div>
            </AnimatedFormCard>
          )}
        </motion.div>
      )
    }
  ];

  // Affichage du chargement en mode édition
  if (isEditMode && loadingData) {
    return (
      <div className="form-container-modern">
        <div className="loading-container">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ marginBottom: '16px' }}
          >
            <SyncOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          </motion.div>
          <Title level={4}>Chargement des données de l'action...</Title>
          <Text type="secondary">Veuillez patienter</Text>
        </div>
      </div>
    );
  }

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="form-container-modern">
     

      {/* En-tête principal similaire au dashboard */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="form-header"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '32px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <motion.div
          className="header-background"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }}
          animate={{
            backgroundPosition: ['0px 0px', '60px 60px']
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        <Row justify="space-between" align="middle" style={{ position: 'relative', zIndex: 1 }}>
          <Col xs={24} lg={16}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              style={{ display: 'flex', alignItems: 'center', gap: '20px' }}
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <Avatar 
                  size={64} 
                  icon={isEditMode ? <EditOutlined /> : <PlusOutlined />}
                  style={{ 
                    background: isEditMode ? 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)' : 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                    fontSize: '28px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                  }} 
                />
              </motion.div>
              
              <div>
                <Title level={1} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
                  {isEditMode ? 'Modifier l\'action' : 'Nouvelle action'}
                </Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: '8px 0 0 0' }}>
                  {isEditMode && actionData ? `Action: ${actionData.nom}` : 'Créez une nouvelle action marketing'}
                </Paragraph>
              </div>
            </motion.div>
          </Col>
          
          <Col xs={24} lg={8}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              style={{ 
                display: 'flex', 
                gap: '12px', 
                justifyContent: screens.lg ? 'flex-end' : 'flex-start',
                flexWrap: 'wrap',
                marginTop: screens.lg ? 0 : '16px'
              }}
            >
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/actions')}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)'
                }}
              >
                Retour à la liste
              </Button>
              
            </motion.div>
          </Col>
        </Row>
      </motion.div>

      {/* Contenu principal avec steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card 
          className="content-card-modern"
          style={{
            borderRadius: '16px',
            border: '1px solid #f0f0f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            overflow: 'hidden'
          }}
        >
          {/* Steps avec animations */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{ padding: '24px', borderBottom: '1px solid #f0f0f0' }}
          >
            <Steps
              current={currentStep}
              className="modern-steps"
            >
              {steps.map((step, index) => (
                <Step
                  key={step.title}
                  title={step.title}
                  icon={
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {index < currentStep ? <CheckCircleOutlined /> :
                        index === currentStep ? step.icon :
                          <ClockCircleOutlined />}
                    </motion.div>
                  }
                />
              ))}
            </Steps>
          </motion.div>

          <Form form={form} layout="vertical" className="modern-form">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="steps-content"
                style={{ padding: '24px' }}
              >
                {steps[currentStep].content}
              </motion.div>
            </AnimatePresence>

            {/* Boutons de navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              style={{ 
                padding: '24px', 
                borderTop: '1px solid #f0f0f0',
                background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)'
              }}
            >
              <Row justify="space-between" align="middle">
                <Col>
                  {currentStep > 0 && (
                    <Button
                      onClick={prevStep}
                      icon={<ArrowLeftOutlined />}
                      size="large"
                      className="modern-btn"
                    >
                      Précédent
                    </Button>
                  )}
                </Col>
                <Col>
                  <Space size="large">
                    {currentStep < steps.length - 1 && (
                      <Button
                        type="primary"
                        onClick={nextStep}
                        size="large"
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 500
                        }}
                      >
                        Suivant
                      </Button>
                    )}
                    {currentStep === steps.length - 1 && (
                      <Button
                        type="primary"
                        onClick={handleSubmit}
                        icon={isEditMode ? <EditOutlined /> : <CheckOutlined />}
                        loading={loading}
                        size="large"
                        style={{
                          background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 500
                        }}
                      >
                        {isEditMode ? 'Mettre à jour' : 'Créer l\'action'}
                      </Button>
                    )}
                  </Space>
                </Col>
              </Row>
            </motion.div>
          </Form>
        </Card>
      </motion.div>

      {/* CSS intégré */}
      <style jsx>{`
        .form-container-modern {
          padding: 24px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
          background: white;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          text-align: center;
          padding: 40px;
        }

        .form-header {
          position: relative;
        }

        .form-card-modern {
          transition: all 0.3s ease;
          margin-bottom: 24px;
        }

        .form-card-modern:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
        }

        .content-card-modern {
          transition: all 0.3s ease;
        }

        .content-card-modern:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
        }

        .modern-steps {
          padding: 24px 0;
        }

        .modern-steps .ant-steps-item-title {
          font-weight: 600;
        }

        .modern-steps .ant-steps-item-process .ant-steps-item-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;
        }

        .modern-steps .ant-steps-item-finish .ant-steps-item-icon {
          background: #52c41a;
          border-color: #52c41a;
        }

        .empty-type-message {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          text-align: center;
        }

        .modern-form .ant-form-item-label > label {
          font-weight: 500;
          color: #333;
        }

        .modern-input,
        .modern-select .ant-select-selector,
        .modern-textarea {
          border-radius: 8px;
          border: 1px solid #d9d9d9;
          transition: all 0.3s ease;
        }

        .modern-input:focus,
        .modern-select.ant-select-focused .ant-select-selector,
        .modern-textarea:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
        }

        .modern-btn {
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .modern-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .form-container-modern {
            padding: 16px;
          }

          .form-header {
            padding: 24px !important;
            border-radius: 16px !important;
            text-align: center;
          }

          .form-card-modern {
            margin-bottom: 16px;
          }

          .modern-steps {
            padding: 16px 0;
          }
        }

        @media (max-width: 576px) {
          .form-header {
            padding: 20px !important;
            border-radius: 12px !important;
          }
        }

        /* Animations */
        @keyframes shimmer {
          0% { background-position: -468px 0; }
          100% { background-position: 468px 0; }
        }

        .loading-shimmer {
          animation: shimmer 1.5s ease-in-out infinite;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 400% 100%;
        }

        /* Effet de parallaxe pour le header */
        .header-background {
          background-attachment: fixed;
        }

        /* Amélioration des sélecteurs Ant Design */
        .ant-select-dropdown {
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }

        .ant-select-item {
          border-radius: 4px;
          margin: 2px 8px;
          transition: all 0.2s ease;
        }

        .ant-select-item:hover {
          background: linear-gradient(135deg, #f0f2ff 0%, #e6f7ff 100%);
        }

        .ant-select-item-option-selected {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        /* Effet focus pour les inputs avec prefix */
        .ant-input-affix-wrapper:focus,
        .ant-input-affix-wrapper-focused {
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
        }

        /* Animation pour les badges de statut */
        .ant-badge {
          transition: all 0.3s ease;
        }

        .ant-badge:hover {
          transform: scale(1.05);
        }

        /* Amélioration des steps */
        .ant-steps-item-icon {
          transition: all 0.3s ease;
        }

        .ant-steps-item:hover .ant-steps-item-icon {
          transform: scale(1.1);
        }

        /* DatePicker styling */
        .ant-picker {
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .ant-picker:hover,
        .ant-picker-focused {
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
        }

        .ant-breadcrumb {
          font-weight: 500;
        }

        .ant-breadcrumb a {
          color: #666;
          transition: color 0.3s ease;
        }

        .ant-breadcrumb a:hover {
          color: #667eea;
        }
      `}</style>
    </div>
  );
};

export default ActionForm;