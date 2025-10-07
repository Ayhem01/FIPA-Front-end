import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Form, Input, Select, Button, Card, message, Row, Col, 
  DatePicker, InputNumber, Spin, Alert, Typography, Breadcrumb,
  Tabs, Space, Divider, Avatar
} from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, CheckOutlined, ProjectOutlined,
  HomeOutlined, DashboardOutlined, BankOutlined, GlobalOutlined,
  UserOutlined, DollarOutlined, CalendarOutlined, FileTextOutlined,
  QuestionCircleOutlined, BookOutlined
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
import { motion, AnimatePresence } from 'framer-motion';

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

  // ...existing code...

return (
  <div className="modern-container">
    {/* Breadcrumb */}
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Breadcrumb style={{ marginBottom: 24 }}>
        <Breadcrumb.Item>
          <Link to="/dashboard">
            <HomeOutlined /> Dashboard
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/projets">
            <ProjectOutlined /> Projets
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          {isEditMode ? 'Modifier' : 'Nouveau projet'}
        </Breadcrumb.Item>
      </Breadcrumb>
    </motion.div>

    {/* En-tête */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="modern-header-card">
        <div className="header-content">
          <div className="header-info">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Avatar 
                size={64} 
                icon={<ProjectOutlined />} 
                style={{ 
                  backgroundColor: isEditMode ? '#1890ff' : '#52c41a',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }} 
              />
            </motion.div>
            <div className="header-details">
              <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                {isEditMode ? `Modifier "${projet?.title || projet?.nom}"` : 'Nouveau projet'}
              </Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                {isEditMode ? 'Modifiez les informations du projet' : 'Créez un nouveau projet d\'investissement'}
              </Text>
            </div>
          </div>
          <div className="header-actions">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/projets')}
              className="modern-btn"
              size="large"
            >
              Retour
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>

    {/* Formulaire principal */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="modern-content-card">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          className="modern-tabs"
          type="card"
        >
          <TabPane 
            tab={
              <Space>
                <FileTextOutlined />
                Informations du projet
              </Space>
            } 
            key="form"
          >
            <div className="tab-content">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                disabled={isSubmitting}
                className="modern-form"
              >
                {/* Informations de base */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="form-section-card" title={
                    <Space>
                      <FileTextOutlined style={{ color: '#1890ff' }} />
                      <span>Informations générales</span>
                    </Space>
                  }>
                    <Row gutter={[24, 16]}>
                      <Col xs={24} lg={12}>
                        <Form.Item
                          name="title"
                          label="Titre du projet"
                          rules={[
                            { required: true, message: 'Le titre est obligatoire' },
                            { min: 3, message: 'Le titre doit contenir au moins 3 caractères' }
                          ]}
                        >
                          <Input 
                            placeholder="Ex: Développement d'une application mobile"
                            className="modern-input"
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} lg={12}>
                        <Form.Item
                          name="status"
                          label="Statut du projet"
                          rules={[{ required: true, message: 'Le statut est obligatoire' }]}
                        >
                          <Select 
                            placeholder="Sélectionner un statut"
                            className="modern-select"
                          >
                            <Option value="planned">
                              <Space>
                                <div className="status-indicator planned"></div>
                                Planifié
                              </Space>
                            </Option>
                            <Option value="in_progress">
                              <Space>
                                <div className="status-indicator in-progress"></div>
                                En cours
                              </Space>
                            </Option>
                            <Option value="completed">
                              <Space>
                                <div className="status-indicator completed"></div>
                                Terminé
                              </Space>
                            </Option>
                            <Option value="abandoned">
                              <Space>
                                <div className="status-indicator abandoned"></div>
                                Abandonné
                              </Space>
                            </Option>
                            <Option value="suspended">
                              <Space>
                                <div className="status-indicator suspended"></div>
                                Suspendu
                              </Space>
                            </Option>
                            <Option value="on_hold">
                              <Space>
                                <div className="status-indicator on-hold"></div>
                                En attente
                              </Space>
                            </Option>
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
                            className="modern-textarea"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                </motion.div>

                {/* Informations entreprise */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="form-section-card" title={
                    <Space>
                      <BankOutlined style={{ color: '#52c41a' }} />
                      <span>Informations de l'entreprise</span>
                    </Space>
                  }>
                    <Row gutter={[24, 16]}>
                      <Col xs={24} lg={12}>
                        <Form.Item
                          name="entreprise_id"
                          label="Entreprise (si existante)"
                        >
                          <Select 
                            placeholder="Sélectionner une entreprise"
                            allowClear
                            showSearch
                            className="modern-select"
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

                      <Col xs={24} lg={12}>
                        <Form.Item
                          name="company_name"
                          label="Nom de l'entreprise (manuel)"
                        >
                          <Input 
                            placeholder="Nom de l'entreprise si non listée"
                            className="modern-input"
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} lg={12}>
                        <Form.Item
                          name="secteur_id"
                          label="Secteur d'activité"
                          rules={[{ required: true, message: 'Le secteur est obligatoire' }]}
                        >
                          <Select 
                            placeholder="Sélectionner un secteur"
                            showSearch
                            className="modern-select"
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

                      <Col xs={24} lg={12}>
                        <Form.Item
                          name="pays_id"
                          label="Pays"
                          rules={[{ required: true, message: 'Le pays est obligatoire' }]}
                        >
                          <Select 
                            placeholder="Sélectionner un pays"
                            showSearch
                            className="modern-select"
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
                    </Row>
                  </Card>
                </motion.div>

                {/* Informations financières */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="form-section-card" title={
                    <Space>
                      <DollarOutlined style={{ color: '#13c2c2' }} />
                      <span>Informations financières</span>
                    </Space>
                  }>
                    <Row gutter={[24, 16]}>
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
                            className="modern-input"
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
                          <Select 
                            placeholder="Sélectionner une devise"
                            className="modern-select"
                          >
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
                            className="modern-input"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                </motion.div>

                {/* Informations temporelles */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="form-section-card" title={
                    <Space>
                      <CalendarOutlined style={{ color: '#722ed1' }} />
                      <span>Planning du projet</span>
                    </Space>
                  }>
                    <Row gutter={[24, 16]}>
                      <Col xs={24} lg={12}>
                        <Form.Item
                          name="start_date"
                          label="Date de début"
                        >
                          <DatePicker 
                            style={{ width: '100%' }}
                            placeholder="Sélectionner une date"
                            format="DD/MM/YYYY"
                            className="modern-input"
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} lg={12}>
                        <Form.Item
                          name="end_date"
                          label="Date de fin estimée"
                        >
                          <DatePicker 
                            style={{ width: '100%' }}
                            placeholder="Sélectionner une date"
                            format="DD/MM/YYYY"
                            className="modern-input"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                </motion.div>

                {/* Autres informations */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="form-section-card" title={
                    <Space>
                      <UserOutlined style={{ color: '#fa8c16' }} />
                      <span>Informations complémentaires</span>
                    </Space>
                  }>
                    <Row gutter={[24, 16]}>
                      <Col xs={24} lg={12}>
                        <Form.Item
                          name="jobs_expected"
                          label="Emplois prévus"
                        >
                          <InputNumber
                            style={{ width: '100%' }}
                            placeholder="0"
                            min={0}
                            className="modern-input"
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} lg={12}>
                        <Form.Item
                          name="initial_contact_person"
                          label="Personne de contact initial"
                        >
                          <Input 
                            placeholder="Nom de la personne de contact"
                            className="modern-input"
                          />
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
                            className="modern-textarea"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                </motion.div>

                {/* Boutons d'action */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card className="form-actions-card">
                    <Row justify="end">
                      <Space size="large">
                        <Button 
                          onClick={() => navigate('/projets')}
                          size="large"
                          className="modern-btn"
                        >
                          Annuler
                        </Button>
                        <Button 
                          type="primary" 
                          htmlType="submit" 
                          loading={isSubmitting}
                          icon={<SaveOutlined />}
                          size="large"
                          className="modern-btn-primary"
                        >
                          {isEditMode ? 'Mettre à jour' : 'Créer le projet'}
                        </Button>
                      </Space>
                    </Row>
                  </Card>
                </motion.div>
              </Form>
            </div>
          </TabPane>

          {/* Onglet d'aide */}
          <TabPane 
            tab={
              <Space>
                <QuestionCircleOutlined />
                Guide d'aide
              </Space>
            } 
            key="help"
          >
            <div className="tab-content">
              <Card className="help-card" title={
                <Space>
                  <BookOutlined style={{ color: '#1890ff' }} />
                  <span>Guide de création de projet</span>
                </Space>
              }>
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={12}>
                    <Card className="help-section-card" title="Informations requises">
                      <ul className="help-list">
                        <li><strong>Titre :</strong> Nom descriptif du projet</li>
                        <li><strong>Statut :</strong> État actuel du projet</li>
                        <li><strong>Secteur :</strong> Domaine d'activité du projet</li>
                        <li><strong>Pays :</strong> Localisation géographique</li>
                        <li><strong>Montant :</strong> Budget d'investissement prévu</li>
                      </ul>
                    </Card>
                  </Col>

                  <Col xs={24} lg={12}>
                    <Card className="help-section-card" title="Statuts disponibles">
                      <div className="status-help-list">
                        <div className="status-help-item">
                          <div className="status-indicator planned"></div>
                          <div>
                            <strong>Planifié :</strong> Projet en phase de planification
                          </div>
                        </div>
                        <div className="status-help-item">
                          <div className="status-indicator in-progress"></div>
                          <div>
                            <strong>En cours :</strong> Projet activement développé
                          </div>
                        </div>
                        <div className="status-help-item">
                          <div className="status-indicator completed"></div>
                          <div>
                            <strong>Terminé :</strong> Projet complété avec succès
                          </div>
                        </div>
                        <div className="status-help-item">
                          <div className="status-indicator abandoned"></div>
                          <div>
                            <strong>Abandonné :</strong> Projet arrêté définitivement
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Col>

                  <Col span={24}>
                    <Card className="help-section-card" title="Conseils d'utilisation">
                      <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                          <Alert
                            message="Titre descriptif"
                            description="Utilisez des titres clairs et précis pour faciliter l'identification du projet"
                            type="info"
                            showIcon
                          />
                        </Col>
                        <Col xs={24} md={12}>
                          <Alert
                            message="Dates réalistes"
                            description="Définissez des dates de début et de fin cohérentes avec la complexité du projet"
                            type="warning"
                            showIcon
                          />
                        </Col>
                        <Col xs={24} md={12}>
                          <Alert
                            message="Informations complètes"
                            description="Plus vous renseignez d'informations, meilleur sera le suivi du projet"
                            type="success"
                            showIcon
                          />
                        </Col>
                        <Col xs={24} md={12}>
                          <Alert
                            message="Notes internes"
                            description="Utilisez les notes pour contextualiser et documenter les spécificités du projet"
                            type="info"
                            showIcon
                          />
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>
              </Card>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </motion.div>

    {/* CSS intégré */}
    <style jsx>{`
      .modern-container {
        padding: 24px;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        min-height: 100vh;
      }

      .modern-header-card {
        border-radius: 16px;
        border: 1px solid #f0f0f0;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        margin-bottom: 24px;
        overflow: hidden;
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px;
      }

      .header-info {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .header-details {
        flex: 1;
      }

      .header-actions {
        display: flex;
        align-items: center;
      }

      .modern-content-card {
        border-radius: 16px;
        border: 1px solid #f0f0f0;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        overflow: hidden;
      }

      .modern-tabs .ant-tabs-tab {
        padding: 12px 24px;
        font-weight: 500;
      }

      .modern-tabs .ant-tabs-tab-active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white !important;
        border-radius: 8px 8px 0 0;
      }

      .tab-content {
        padding: 24px;
      }

      .form-section-card {
        border-radius: 12px;
        border: 1px solid #f0f0f0;
        margin-bottom: 24px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        transition: all 0.3s ease;
      }

      .form-section-card:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        transform: translateY(-2px);
      }

      .form-section-card .ant-card-head {
        background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
        border-bottom: 1px solid #e8e8e8;
      }

      .form-section-card .ant-card-head-title {
        font-weight: 600;
        color: #333;
      }

      .form-actions-card {
        border-radius: 12px;
        border: 1px solid #f0f0f0;
        background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      }

      .help-card {
        border-radius: 12px;
        border: 1px solid #f0f0f0;
      }

      .help-section-card {
        border-radius: 8px;
        border: 1px solid #f0f0f0;
        height: 100%;
      }

      .help-list {
        line-height: 2;
        margin: 0;
        padding-left: 20px;
      }

      .help-list li {
        margin-bottom: 8px;
      }

      .status-help-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .status-help-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px;
        border-radius: 6px;
        background: #fafafa;
      }

      .status-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .status-indicator.planned {
        background-color: #faad14;
      }

      .status-indicator.in-progress {
        background-color: #1890ff;
      }

      .status-indicator.completed {
        background-color: #52c41a;
      }

      .status-indicator.abandoned {
        background-color: #ff4d4f;
      }

      .status-indicator.suspended {
        background-color: #722ed1;
      }

      .status-indicator.on-hold {
        background-color: #13c2c2;
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

      .modern-btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 8px;
        font-weight: 500;
        transition: all 0.3s ease;
      }

      .modern-btn-primary:hover {
        background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .modern-container {
          padding: 16px;
        }

        .header-content {
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
        }

        .header-actions {
          width: 100%;
          justify-content: flex-end;
        }

        .tab-content {
          padding: 16px;
        }

        .form-section-card {
          margin-bottom: 16px;
        }
      }

      @media (max-width: 576px) {
        .header-info {
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .status-help-item {
          flex-direction: column;
          text-align: center;
          gap: 8px;
        }
      }

      /* Animations */
      .ant-card {
        transition: all 0.3s ease;
      }

      .ant-form-item {
        margin-bottom: 20px;
      }

      .ant-alert {
        border-radius: 8px;
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

export default ProjetForm;