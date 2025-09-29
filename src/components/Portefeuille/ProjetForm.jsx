import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Form, Input, Select, Button, Card, message, Row, Col, 
  DatePicker, InputNumber, Spin, Alert, Typography, Breadcrumb,
  Tabs, Space, Divider
} from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, CheckOutlined, ProjectOutlined,
  HomeOutlined, DashboardOutlined, BankOutlined, GlobalOutlined,
  UserOutlined, DollarOutlined, CalendarOutlined, FileTextOutlined
} from '@ant-design/icons';
import {
  createProject,
  updateProject,
  getProjectById,
  resetOperation
} from '../../features/projectSlice';
import {
  fetchPays,
  fetchSecteurs,
  fetchEntreprises
} from '../../features/marketingSlice';
import { getCurrentUser } from '../../features/userSlice';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ProjetForm = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const isEditMode = !!id;
  
  // États locaux
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('form');

  // Sélection des données du store Redux
  const {
    selectedProject: { data: projet, loading: projetLoading, error: projetError },
    operation
  } = useSelector(state => state.projects);

  // Données du marketing slice
  const {
    pays: { items: paysList = [] },
    secteurs: { items: secteursList = [] },
    entreprises: { items: entreprisesList = [] }
  } = useSelector(state => state.marketing);

  // Sélectionne l'utilisateur connecté
  const user = useSelector(state => state.user.user);

  // Charger l'utilisateur connecté si non présent
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!user && localStorage.getItem('token')) {
          await dispatch(getCurrentUser()).unwrap();
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        message.error('Impossible de charger vos informations. Veuillez vous reconnecter.');
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [dispatch, user]);

  // Charger les données nécessaires
  useEffect(() => {
    dispatch(fetchPays());
    dispatch(fetchSecteurs());
    dispatch(fetchEntreprises());
  }, [dispatch]);

  // Charger le projet en mode édition
  useEffect(() => {
    if (id) {
      dispatch(getProjectById(id))
        .finally(() => setLoadingData(false));
    }
  }, [dispatch, id]);

  // Mettre à jour le formulaire quand les données du projet sont chargées
  useEffect(() => {
    if (projet && id) {
      const formData = {
        title: projet.title || projet.nom,
        description: projet.description,
        company_name: projet.company_name,
        entreprise_id: projet.entreprise_id,
        secteur_id: projet.secteur_id,
        pays_id: projet.pays_id,
        investment_amount: projet.investment_amount || projet.budget,
        devise: projet.devise || 'EUR',
        start_date: projet.start_date ? moment(projet.start_date) : null,
        end_date: projet.end_date ? moment(projet.end_date) : null,
        jobs_expected: projet.jobs_expected,
        foreign_percentage: projet.foreign_percentage,
        initial_contact_person: projet.initial_contact_person,
        status: projet.status || 'planned',
        notes: projet.notes,
        responsable_id: projet.responsable_id || user?.id
      };

      form.setFieldsValue(formData);
      setLoadingData(false);
    } else if (!id && user) {
      // En mode création, définir l'utilisateur connecté comme responsable par défaut
      form.setFieldsValue({
        responsable_id: user.id,
        status: 'planned',
        devise: 'EUR'
      });
      setLoadingData(false);
    }
  }, [projet, form, id, user]);

  // Gestion des succès/erreurs d'opération
  useEffect(() => {
    if (operation.success) {
      if (operation.type === 'create') {
        message.success('Projet créé avec succès');
        setFormSubmitted(true);
        setTimeout(() => {
          navigate('/projets');
        }, 2000);
      } else if (operation.type === 'update') {
        message.success('Projet mis à jour avec succès');
        setFormSubmitted(true);
        setTimeout(() => {
          navigate(`/projets/${id}`);
        }, 2000);
      }
    } else if (operation.error) {
      message.error(operation.error);
      setIsSubmitting(false);
    }

    return () => {
      if (operation.success || operation.error) {
        dispatch(resetOperation());
      }
    };
  }, [operation, navigate, id, dispatch]);

  // Soumission du formulaire
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const values = await form.validateFields();

      // Formater les dates
      const formattedData = {
        ...values,
        start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : null,
        end_date: values.end_date ? values.end_date.format('YYYY-MM-DD') : null,
        investment_amount: values.investment_amount || 0,
        foreign_percentage: values.foreign_percentage || 0,
        jobs_expected: values.jobs_expected || 0
      };

      if (isEditMode) {
        await dispatch(updateProject({ id, data: formattedData })).unwrap();
      } else {
        await dispatch(createProject(formattedData)).unwrap();
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      if (error.name !== 'ValidationError') {
        message.error('Erreur lors de la soumission du formulaire');
      }
      setIsSubmitting(false);
    }
  };

  // Affichage du chargement
  if (loadingUser || (id && loadingData)) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Spin size="large" tip={`Chargement ${isEditMode ? 'du projet' : 'des données'}...`} />
      </div>
    );
  }

  // Affichage du résultat après soumission
  if (formSubmitted) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        textAlign: 'center'
      }}>
        <CheckOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }} />
        <Title level={3}>
          {isEditMode ? 'Projet mis à jour avec succès!' : 'Projet créé avec succès!'}
        </Title>
        <Text type="secondary">
          Redirection en cours...
        </Text>
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (id && projetError) {
    return (
      <Alert
        message="Erreur"
        description={projetError}
        type="error"
        showIcon
        action={
          <Button onClick={() => navigate('/projets')}>
            Retour à la liste
          </Button>
        }
      />
    );
  }

  return (
    <div className="crm-container">
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <HomeOutlined /> Accueil
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <DashboardOutlined /> Dashboard
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <ProjectOutlined /> Projets
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          {isEditMode ? 'Modifier' : 'Nouveau'}
        </Breadcrumb.Item>
      </Breadcrumb>

      {/* En-tête */}
      <Card className="form-header-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
              <ProjectOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              {isEditMode ? `Modifier le projet "${projet?.title || projet?.nom}"` : 'Nouveau projet'}
            </Title>
            <Text type="secondary">
              {isEditMode ? 'Modifiez les informations du projet' : 'Créez un nouveau projet d\'investissement'}
            </Text>
          </div>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/projets')}
          >
            Retour
          </Button>
        </div>
      </Card>

      {/* Formulaire principal */}
      <Card className="form-main-card">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Informations du projet" key="form">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              disabled={isSubmitting}
            >
              <Row gutter={24}>
                {/* Informations de base */}
                <Col span={24}>
                  <Title level={4}>
                    <FileTextOutlined /> Informations générales
                  </Title>
                  <Divider />
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="title"
                    label="Titre du projet"
                    rules={[
                      { required: true, message: 'Le titre est obligatoire' },
                      { min: 3, message: 'Le titre doit contenir au moins 3 caractères' }
                    ]}
                  >
                    <Input placeholder="Ex: Développement d'une application mobile" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="status"
                    label="Statut du projet"
                    rules={[{ required: true, message: 'Le statut est obligatoire' }]}
                  >
                    <Select placeholder="Sélectionner un statut">
                      <Option value="planned">Planifié</Option>
                      <Option value="in_progress">En cours</Option>
                      <Option value="completed">Terminé</Option>
                      <Option value="abandoned">Abandonné</Option>
                      <Option value="suspended">Suspendu</Option>
                      <Option value="on_hold">En attente</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    name="description"
                    label="Description du projet"
                  >
                    <TextArea
                      rows={4}
                      placeholder="Décrivez le projet en détail..."
                    />
                  </Form.Item>
                </Col>

                {/* Informations entreprise */}
                <Col span={24}>
                  <Title level={4}>
                    <BankOutlined /> Informations de l'entreprise
                  </Title>
                  <Divider />
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="entreprise_id"
                    label="Entreprise (si existante)"
                  >
                    <Select 
                      placeholder="Sélectionner une entreprise"
                      allowClear
                      showSearch
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {entreprisesList.map(entreprise => (
                        <Option key={entreprise.id} value={entreprise.id}>
                          {entreprise.nom}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="company_name"
                    label="Nom de l'entreprise (manuel)"
                  >
                    <Input placeholder="Nom de l'entreprise si non listée" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="secteur_id"
                    label="Secteur d'activité"
                    rules={[{ required: true, message: 'Le secteur est obligatoire' }]}
                  >
                    <Select 
                      placeholder="Sélectionner un secteur"
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
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="pays_id"
                    label="Pays"
                    rules={[{ required: true, message: 'Le pays est obligatoire' }]}
                  >
                    <Select 
                      placeholder="Sélectionner un pays"
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
                  </Form.Item>
                </Col>

                {/* Informations financières */}
                <Col span={24}>
                  <Title level={4}>
                    <DollarOutlined /> Informations financières
                  </Title>
                  <Divider />
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    name="investment_amount"
                    label="Montant d'investissement"
                    rules={[{ required: true, message: 'Le montant est obligatoire' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="0"
                      min={0}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    name="devise"
                    label="Devise"
                    rules={[{ required: true, message: 'La devise est obligatoire' }]}
                  >
                    <Select placeholder="Sélectionner une devise">
                      <Option value="EUR">EUR (€)</Option>
                      <Option value="USD">USD ($)</Option>
                      <Option value="MAD">MAD (DH)</Option>
                      <Option value="GBP">GBP (£)</Option>
                      <Option value="JPY">JPY (¥)</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    name="foreign_percentage"
                    label="Pourcentage étranger (%)"
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="0"
                      min={0}
                      max={100}
                    />
                  </Form.Item>
                </Col>

                {/* Informations temporelles */}
                <Col span={24}>
                  <Title level={4}>
                    <CalendarOutlined /> Planning du projet
                  </Title>
                  <Divider />
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="start_date"
                    label="Date de début"
                  >
                    <DatePicker 
                      style={{ width: '100%' }}
                      placeholder="Sélectionner une date"
                      format="DD/MM/YYYY"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="end_date"
                    label="Date de fin estimée"
                  >
                    <DatePicker 
                      style={{ width: '100%' }}
                      placeholder="Sélectionner une date"
                      format="DD/MM/YYYY"
                    />
                  </Form.Item>
                </Col>

                {/* Autres informations */}
                <Col span={24}>
                  <Title level={4}>
                    <UserOutlined /> Informations complémentaires
                  </Title>
                  <Divider />
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="jobs_expected"
                    label="Emplois prévus"
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="0"
                      min={0}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="initial_contact_person"
                    label="Personne de contact initial"
                  >
                    <Input placeholder="Nom de la personne de contact" />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    name="notes"
                    label="Notes internes"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Notes internes sur le projet..."
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Boutons d'action */}
              <Row justify="end" style={{ marginTop: 24 }}>
                <Space>
                  <Button onClick={() => navigate('/projets')}>
                    Annuler
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={isSubmitting}
                    icon={<SaveOutlined />}
                  >
                    {isEditMode ? 'Mettre à jour' : 'Créer le projet'}
                  </Button>
                </Space>
              </Row>
            </Form>
          </TabPane>

          {/* Onglet d'aide */}
          <TabPane tab="Aide" key="help">
            <Card title="Guide de création de projet">
              <div style={{ lineHeight: '1.8' }}>
                <Title level={5}>Informations requises :</Title>
                <ul>
                  <li><strong>Titre :</strong> Nom descriptif du projet</li>
                  <li><strong>Statut :</strong> État actuel du projet</li>
                  <li><strong>Secteur :</strong> Domaine d'activité du projet</li>
                  <li><strong>Pays :</strong> Localisation géographique</li>
                  <li><strong>Montant :</strong> Budget d'investissement prévu</li>
                </ul>

                <Title level={5}>Statuts disponibles :</Title>
                <ul>
                  <li><strong>Planifié :</strong> Projet en phase de planification</li>
                  <li><strong>En cours :</strong> Projet activement développé</li>
                  <li><strong>Terminé :</strong> Projet complété avec succès</li>
                  <li><strong>Abandonné :</strong> Projet arrêté définitivement</li>
                  <li><strong>Suspendu :</strong> Projet temporairement arrêté</li>
                  <li><strong>En attente :</strong> Projet en attente de validation</li>
                </ul>

                <Title level={5}>Conseils :</Title>
                <ul>
                  <li>Utilisez des titres descriptifs et précis</li>
                  <li>Renseignez le maximum d'informations pour un meilleur suivi</li>
                  <li>Définissez des dates réalistes</li>
                  <li>Utilisez les notes internes pour le contexte important</li>
                </ul>
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      {/* CSS intégré */}
      <style jsx>{`
        .crm-container {
          background-color: #f0f2f5;
          min-height: 100vh;
          padding: 24px;
        }
        
        .form-header-card {
          margin-bottom: 16px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .form-main-card {
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        @media (max-width: 768px) {
          .crm-container {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProjetForm;