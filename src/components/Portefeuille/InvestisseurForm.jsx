import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Form, Input, Button, Card, Select, Row, Col, message,
  Spin, Breadcrumb, Avatar, Result, Alert, Typography, Tabs,
  InputNumber, Switch, Tooltip, Space, Badge, DatePicker
} from 'antd';
import {
  SaveOutlined, ArrowLeftOutlined, UserOutlined, MailOutlined,
  PhoneOutlined, BankOutlined, EditOutlined, PlusOutlined,
  InfoCircleOutlined, FormOutlined, HomeOutlined, DashboardOutlined,
  GlobalOutlined, TeamOutlined, FundOutlined, DollarOutlined,
  TrophyOutlined, CalendarOutlined, QuestionCircleOutlined, BookOutlined
} from '@ant-design/icons';
import {
  createInvestisseur,
  updateInvestisseur,
  getInvestisseurById,
  resetOperation
} from '../../features/investisseurSlice';
import { getCurrentUser } from '../../features/userSlice';
import { fetchSecteurs, fetchPays } from '../../features/marketingSlice';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const InvestisseurForm = () => {
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
    selectedInvestisseur: { data: investisseur, loading: investisseurLoading, error: investisseurError },
    operation
  } = useSelector(state => state.investisseurs);

  // Sélectionne l'utilisateur connecté et les données de référence
  const user = useSelector(state => state.user.user);
  const { 
    secteurs: { items: secteursList = [] },
    pays: { items: paysList = [] }
  } = useSelector(state => state.marketing);

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

  // Charger les données de référence
  useEffect(() => {
    dispatch(fetchSecteurs());
    dispatch(fetchPays());
  }, [dispatch]);

  // Charger l'investisseur en mode édition
  useEffect(() => {
    if (id) {
      setLoadingData(true);
      dispatch(getInvestisseurById(id))
        .unwrap()
        .then(() => setLoadingData(false))
        .catch((error) => {
          console.error("Erreur lors du chargement de l'investisseur:", error);
          message.error("Impossible de charger les détails de l'investisseur");
          setLoadingData(false);
        });
    }
    return () => {
      dispatch(resetOperation());
    };
  }, [dispatch, id]);

  // Mettre à jour le formulaire quand les données de l'investisseur sont chargées
  useEffect(() => {
    if (investisseur && id) {
      form.setFieldsValue({
        nom: investisseur.nom,
        email: investisseur.email,
        telephone: investisseur.telephone,
        type_investisseur: investisseur.type_investisseur,
        secteur_interet_id: investisseur.secteur_interet_id,
        pays_id: investisseur.pays_id,
        capacite_investissement: investisseur.capacite_investissement,
        devise: investisseur.devise,
        statut: investisseur.statut,
        notes_internes: investisseur.notes_internes,
        interets_specifiques: investisseur.interets_specifiques,
        criteres_investissement: investisseur.criteres_investissement,
        experience_investissement: investisseur.experience_investissement,
        horizon_investissement: investisseur.horizon_investissement,
        ticket_moyen: investisseur.ticket_moyen,
        date_engagement: investisseur.date_engagement ? moment(investisseur.date_engagement) : null,
        date_signature: investisseur.date_signature ? moment(investisseur.date_signature) : null,
        source: investisseur.source,
        linkedin: investisseur.linkedin,
        site_web: investisseur.site_web,
        adresse: investisseur.adresse
      });
    }
  }, [investisseur, form, id]);

  // Gestion des succès/erreurs d'opération
  useEffect(() => {
    if (operation.success) {
      setFormSubmitted(true);
      setIsSubmitting(false);
      
      // Redirection après un court délai pour montrer le message de succès
      setTimeout(() => {
        navigate('/investisseurs');
      }, 1500);
    } else if (operation.error) {
      message.error(operation.error);
      setIsSubmitting(false);
    }
  }, [operation, navigate]);

  // Soumission du formulaire
  const handleSubmit = async () => {
    try {
      // Valider tous les champs du formulaire
      const values = await form.validateFields();

      if (!user || !user.id) {
        message.error("Utilisateur non connecté !");
        return;
      }

      setIsSubmitting(true);
      
      const formattedValues = {
        ...values,
        responsable_id: user.id,
        date_engagement: values.date_engagement ? values.date_engagement.format('YYYY-MM-DD') : null,
        date_signature: values.date_signature ? values.date_signature.format('YYYY-MM-DD') : null
      };
      
      if (id) {
        await dispatch(updateInvestisseur({ id, data: formattedValues })).unwrap();
      } else {
        await dispatch(createInvestisseur(formattedValues)).unwrap();
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      message.error('Une erreur est survenue lors du traitement du formulaire');
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
        <Spin size="large" tip="Chargement des données..." />
      </div>
    );
  }

  // Affichage du résultat après soumission
  if (formSubmitted) {
    return (
      <Result
        status="success"
        title={isEditMode ? "Investisseur mis à jour avec succès" : "Investisseur créé avec succès"}
        subTitle="Redirection vers la liste des investisseurs..."
        extra={[
          <Button type="primary" key="list" onClick={() => navigate('/investisseurs')}>
            Voir la liste des investisseurs
          </Button>,
        ]}
      />
    );
  }

  // Affichage en cas d'erreur
  if (id && investisseurError) {
    return (
      <Result
        status="error"
        title="Une erreur est survenue"
        subTitle={investisseurError}
        extra={[
          <Button type="primary" key="back" onClick={() => navigate('/investisseurs')}>
            Retour à la liste
          </Button>,
        ]}
      />
    );
  }

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
            <Link to="/investisseurs">
              <FundOutlined /> Investisseurs
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            {isEditMode ? 'Modifier' : 'Nouvel investisseur'}
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
                  icon={<FundOutlined />} 
                  style={{ 
                    backgroundColor: isEditMode ? '#1890ff' : '#52c41a',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }} 
                />
              </motion.div>
              <div className="header-details">
                <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                  {isEditMode ? `Modifier "${investisseur?.nom}"` : 'Nouvel investisseur'}
                </Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  {isEditMode ? 'Modifiez les informations de l\'investisseur' : 'Créez un nouveau profil d\'investisseur'}
                </Text>
              </div>
            </div>
            <div className="header-actions">
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/investisseurs')}
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
                  <UserOutlined />
                  Informations de l'investisseur
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
                  initialValues={{
                    statut: 'nouveau',
                    type_investisseur: 'individuel',
                    devise: 'EUR'
                  }}
                >
                  {/* Informations de base */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="form-section-card" title={
                      <Space>
                        <UserOutlined style={{ color: '#1890ff' }} />
                        <span>Informations personnelles</span>
                      </Space>
                    }>
                      <Row gutter={[24, 16]}>
                        <Col xs={24} lg={12}>
                          <Form.Item
                            name="nom"
                            label="Nom complet"
                            rules={[{ required: true, message: 'Le nom est obligatoire' }]}
                          >
                            <Input 
                              prefix={<UserOutlined style={{ color: '#1890ff' }} />} 
                              placeholder="Nom de l'investisseur"
                              className="modern-input"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} lg={12}>
                          <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                              { required: true, message: 'L\'email est obligatoire' },
                              { type: 'email', message: 'Format d\'email invalide' }
                            ]}
                          >
                            <Input 
                              prefix={<MailOutlined style={{ color: '#52c41a' }} />} 
                              placeholder="Email de l'investisseur"
                              className="modern-input"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} lg={12}>
                          <Form.Item
                            name="telephone"
                            label="Téléphone"
                          >
                            <Input 
                              prefix={<PhoneOutlined style={{ color: '#faad14' }} />} 
                              placeholder="Numéro de téléphone"
                              className="modern-input"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} lg={12}>
                          <Form.Item
                            name="type_investisseur"
                            label="Type d'investisseur"
                            rules={[{ required: true, message: 'Le type est obligatoire' }]}
                          >
                            <Select 
                              placeholder="Sélectionnez le type"
                              className="modern-select"
                            >
                              <Option value="individuel">
                                <Space>
                                  <UserOutlined style={{ color: '#1890ff' }} />
                                  Individuel
                                </Space>
                              </Option>
                              <Option value="institutionnel">
                                <Space>
                                  <BankOutlined style={{ color: '#52c41a' }} />
                                  Institutionnel
                                </Space>
                              </Option>
                              <Option value="fonds_investissement">
                                <Space>
                                  <FundOutlined style={{ color: '#722ed1' }} />
                                  Fonds d'investissement
                                </Space>
                              </Option>
                              <Option value="business_angel">
                                <Space>
                                  <TrophyOutlined style={{ color: '#faad14' }} />
                                  Business Angel
                                </Space>
                              </Option>
                              <Option value="autre">Autre</Option>
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col xs={24} lg={12}>
                          <Form.Item
                            name="secteur_interet_id"
                            label="Secteur d'intérêt"
                          >
                            <Select 
                              placeholder="Sélectionnez le secteur d'intérêt" 
                              className="modern-select"
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

                        <Col xs={24} lg={12}>
                          <Form.Item
                            name="pays_id"
                            label="Pays"
                          >
                            <Select 
                              placeholder="Sélectionnez le pays" 
                              className="modern-select"
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
                      </Row>
                    </Card>
                  </motion.div>

                  {/* Informations financières */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
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
                            name="capacite_investissement"
                            label="Capacité d'investissement"
                            rules={[{ required: true, message: 'La capacité est obligatoire' }]}
                          >
                            <InputNumber
                              min={0}
                              style={{ width: '100%' }}
                              placeholder="Capacité en devise"
                              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={value => value.replace(/\$\s?|(,*)/g, '')}
                              className="modern-input"
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
                              placeholder="Sélectionnez la devise"
                              className="modern-select"
                            >
                              <Option value="EUR">EUR (€)</Option>
                              <Option value="USD">USD ($)</Option>
                              <Option value="GBP">GBP (£)</Option>
                              <Option value="CHF">CHF</Option>
                              <Option value="CAD">CAD</Option>
                              <Option value="JPY">JPY (¥)</Option>
                              <Option value="AUD">AUD</Option>
                              <Option value="MAD">MAD (DH)</Option>
                              <Option value="TND">TND</Option>
                              <Option value="DZD">DZD</Option>
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                          <Form.Item
                            name="ticket_moyen"
                            label="Ticket moyen"
                          >
                            <InputNumber
                              min={0}
                              style={{ width: '100%' }}
                              placeholder="Ticket moyen par investissement"
                              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={value => value.replace(/\$\s?|(,*)/g, '')}
                              className="modern-input"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} lg={12}>
                          <Form.Item
                            name="horizon_investissement"
                            label="Horizon d'investissement"
                          >
                            <Select 
                              placeholder="Durée d'investissement préférée"
                              className="modern-select"
                            >
                              <Option value="court_terme">Court terme (1-3 ans)</Option>
                              <Option value="moyen_terme">Moyen terme (3-7 ans)</Option>
                              <Option value="long_terme">Long terme (7+ ans)</Option>
                              <Option value="flexible">Flexible</Option>
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col xs={24} lg={12}>
                          <Form.Item
                            name="experience_investissement"
                            label="Expérience d'investissement"
                          >
                            <Select 
                              placeholder="Niveau d'expérience"
                              className="modern-select"
                            >
                              <Option value="debutant">Débutant</Option>
                              <Option value="intermediaire">Intermédiaire</Option>
                              <Option value="experimente">Expérimenté</Option>
                              <Option value="expert">Expert</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  </motion.div>

                  {/* Statut et suivi */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card className="form-section-card" title={
                      <Space>
                        <CalendarOutlined style={{ color: '#722ed1' }} />
                        <span>Statut et suivi</span>
                      </Space>
                    }>
                      <Row gutter={[24, 16]}>
                        <Col xs={24} md={8}>
                          <Form.Item
                            name="statut"
                            label="Statut"
                            rules={[{ required: true, message: 'Le statut est obligatoire' }]}
                          >
                            <Select 
                              placeholder="Sélectionnez le statut"
                              className="modern-select"
                            >
                              <Option value="nouveau">
                                <Badge status="default" text="Nouveau" />
                              </Option>
                              <Option value="en_cours">
                                <Badge status="processing" text="En cours" />
                              </Option>
                              <Option value="actif">
                                <Badge status="success" text="Actif" />
                              </Option>
                              <Option value="negocie">
                                <Badge status="warning" text="En négociation" />
                              </Option>
                              <Option value="converti">
                                <Badge status="success" text="Converti" />
                              </Option>
                              <Option value="perdu">
                                <Badge status="error" text="Perdu" />
                              </Option>
                              <Option value="inactif">
                                <Badge status="default" text="Inactif" />
                              </Option>
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                          <Form.Item
                            name="date_engagement"
                            label="Date d'engagement"
                          >
                            <DatePicker
                              style={{ width: '100%' }}
                              placeholder="Date d'engagement"
                              format="DD/MM/YYYY"
                              className="modern-input"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                          <Form.Item
                            name="date_signature"
                            label="Date de signature"
                          >
                            <DatePicker
                              style={{ width: '100%' }}
                              placeholder="Date de signature"
                              format="DD/MM/YYYY"
                              className="modern-input"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} lg={12}>
                          <Form.Item
                            name="source"
                            label="Source"
                          >
                            <Select 
                              placeholder="Comment avez-vous trouvé cet investisseur?"
                              className="modern-select"
                            >
                              <Option value="site_web">Site web</Option>
                              <Option value="referral">Recommandation</Option>
                              <Option value="salon">Salon/Événement</Option>
                              <Option value="reseaux_sociaux">Réseaux sociaux</Option>
                              <Option value="prospection">Prospection directe</Option>
                              <Option value="partenaire">Partenaire</Option>
                              <Option value="linkedin">LinkedIn</Option>
                              <Option value="autre">Autre</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  </motion.div>

                  {/* Informations détaillées */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card className="form-section-card" title={
                      <Space>
                        <InfoCircleOutlined style={{ color: '#fa8c16' }} />
                        <span>Informations détaillées</span>
                      </Space>
                    }>
                      <Row gutter={[24, 16]}>
                        <Col xs={24} lg={12}>
                          <Form.Item
                            name="interets_specifiques"
                            label="Intérêts spécifiques"
                          >
                            <TextArea
                              rows={3}
                              placeholder="Domaines d'investissement préférés, secteurs d'intérêt..."
                              className="modern-textarea"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} lg={12}>
                          <Form.Item
                            name="criteres_investissement"
                            label="Critères d'investissement"
                          >
                            <TextArea
                              rows={3}
                              placeholder="Critères de sélection, montants préférés, durée d'investissement..."
                              className="modern-textarea"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} lg={12}>
                          <Form.Item
                            name="linkedin"
                            label="Profil LinkedIn"
                          >
                            <Input 
                              placeholder="https://linkedin.com/in/..."
                              className="modern-input"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} lg={12}>
                          <Form.Item
                            name="site_web"
                            label="Site web"
                          >
                            <Input 
                              placeholder="https://..."
                              className="modern-input"
                            />
                          </Form.Item>
                        </Col>

                        <Col span={24}>
                          <Form.Item
                            name="adresse"
                            label="Adresse"
                          >
                            <TextArea
                              rows={2}
                              placeholder="Adresse complète"
                              className="modern-textarea"
                            />
                          </Form.Item>
                        </Col>

                        <Col span={24}>
                          <Form.Item
                            name="notes_internes"
                            label="Notes internes"
                          >
                            <TextArea
                              rows={4}
                              placeholder="Informations internes, observations, historique..."
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
                    transition={{ delay: 0.5 }}
                  >
                    <Card className="form-actions-card">
                      <Row justify="end">
                        <Space size="large">
                          <Button 
                            onClick={() => navigate('/investisseurs')}
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
                            {isEditMode ? 'Mettre à jour' : 'Créer l\'investisseur'}
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
                    <span>Guide de création d'investisseur</span>
                  </Space>
                }>
                  <Row gutter={[24, 24]}>
                    <Col xs={24} lg={12}>
                      <Card className="help-section-card" title="Types d'investisseurs">
                        <ul className="help-list">
                          <li><strong>Individuel :</strong> Personne physique investissant ses propres fonds</li>
                          <li><strong>Institutionnel :</strong> Banques, compagnies d'assurance, fonds de pension</li>
                          <li><strong>Fonds d'investissement :</strong> Sociétés de gestion d'actifs</li>
                          <li><strong>Business Angel :</strong> Entrepreneur expérimenté investissant dans des startups</li>
                        </ul>
                      </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                      <Card className="help-section-card" title="Critères d'évaluation">
                        <ul className="help-list">
                          <li><strong>Capacité :</strong> Montant disponible pour investir</li>
                          <li><strong>Appétit :</strong> Niveau de risque accepté</li>
                          <li><strong>Horizon :</strong> Durée d'investissement souhaitée</li>
                          <li><strong>Secteur :</strong> Domaines d'intérêt privilégiés</li>
                        </ul>
                      </Card>
                    </Col>

                    <Col span={24}>
                      <Card className="help-section-card" title="Conseils d'utilisation">
                        <Row gutter={[16, 16]}>
                          <Col xs={24} md={12}>
                            <Alert
                              message="Profil complet"
                              description="Renseignez un maximum d'informations pour optimiser le matching avec vos projets"
                              type="info"
                              showIcon
                            />
                          </Col>
                          <Col xs={24} md={12}>
                            <Alert
                              message="Capacité réaliste"
                              description="Assurez-vous que la capacité d'investissement correspond à la réalité"
                              type="warning"
                              showIcon
                            />
                          </Col>
                          <Col xs={24} md={12}>
                            <Alert
                              message="Suivi régulier"
                              description="Mettez à jour régulièrement le statut et les informations de contact"
                              type="success"
                              showIcon
                            />
                          </Col>
                          <Col xs={24} md={12}>
                            <Alert
                              message="Notes internes"
                              description="Documentez précisément les critères et préférences de chaque investisseur"
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

      {/* CSS intégré - identique à ProjetForm */}
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

        .ant-date-picker {
          width: 100%;
        }

        .ant-picker-dropdown {
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }

        /* Effet focus pour les inputs avec prefix */
        .ant-input-affix-wrapper:focus,
        .ant-input-affix-wrapper-focused {
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
        }

        /* Amélioration des cards d'aide */
        .help-section-card .ant-card-head {
          background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
          border-bottom: 1px solid #e6f7ff;
        }

        .help-section-card .ant-card-head-title {
          color: #1890ff;
          font-weight: 600;
        }

        /* Animation pour les badges de statut */
        .ant-badge {
          transition: all 0.3s ease;
        }

        .ant-badge:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default InvestisseurForm;