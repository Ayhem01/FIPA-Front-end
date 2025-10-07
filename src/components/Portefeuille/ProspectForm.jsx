import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Form, Input, Button, Card, Select, Row, Col, message,
  Spin, Breadcrumb, Avatar, Result, Alert, Typography, Tabs,
  InputNumber, Switch, Tooltip, Space, Badge
} from 'antd';
import {
  SaveOutlined, ArrowLeftOutlined, UserOutlined, MailOutlined,
  PhoneOutlined, BankOutlined, EditOutlined, PlusOutlined,
  InfoCircleOutlined, FormOutlined, HomeOutlined, DashboardOutlined,
  GlobalOutlined, TeamOutlined, DollarOutlined, TrophyOutlined,
  CalendarOutlined, QuestionCircleOutlined, BookOutlined
} from '@ant-design/icons';
import {
  createProspect,
  updateProspect,
  getProspectById,
  resetOperation
} from '../../features/prospectSlice';
import { getCurrentUser } from '../../features/userSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchSecteurs, fetchPays, fetchEntreprises } from '../../features/marketingSlice';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ProspectForm = () => {
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
    selectedProspect: { data: prospect, loading: prospectLoading, error: prospectError },
    operation
  } = useSelector(state => state.prospects);

  // Sélectionne l'utilisateur connecté
  const user = useSelector(state => state.user.user);
  const {
    secteurs: { items: secteursList = [] },
    pays: { items: paysList = [] },
    entreprises: { items: entreprisesList = [] }
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
  useEffect(() => {
    dispatch(fetchSecteurs());
    dispatch(fetchPays());
    dispatch(fetchEntreprises());
  }, [dispatch]);

  // Charger le prospect en mode édition
  useEffect(() => {
    if (id) {
      setLoadingData(true);
      dispatch(getProspectById(id))
        .unwrap()
        .then(() => setLoadingData(false))
        .catch((error) => {
          console.error("Erreur lors du chargement du prospect:", error);
          message.error("Impossible de charger les détails du prospect");
          setLoadingData(false);
        });
    }
    return () => {
      dispatch(resetOperation());
    };
  }, [dispatch, id]);

  // Mettre à jour le formulaire quand les données du prospect sont chargées
  useEffect(() => {
    if (prospect && id) {
      form.setFieldsValue({
        nom: prospect.nom,
        email: prospect.email,
        telephone: prospect.telephone,
        entreprise_id: prospect.entreprise_id, 
        secteur_id: prospect.secteur_id, 
        pays_id: prospect.pays_id, 
        potentiel: prospect.potentiel,
        statut: prospect.statut,
        montant_estime: prospect.montant_estime,
        probabilite: prospect.probabilite,
        source: prospect.source,
        notes: prospect.notes,
        besoins: prospect.besoins,
        budget: prospect.budget,
        timeline: prospect.timeline,
        decision_maker: prospect.decision_maker,
        concurrents: prospect.concurrents,
      });
    }
  }, [prospect, form, id, entreprisesList, secteursList, paysList]);


  // Gestion des succès/erreurs d'opération
  useEffect(() => {
    if (operation.success) {
      message.success(isEditMode ? 'Prospect mis à jour avec succès' : 'Prospect créé avec succès');
      setFormSubmitted(true);
      setIsSubmitting(false);
      
      // Redirection après un court délai pour montrer le message de succès
      setTimeout(() => {
        navigate('/prospects');
      }, 1500);
    } else if (operation.error) {
      message.error(operation.error);
      setIsSubmitting(false);
    }
  }, [operation, navigate, isEditMode]);


  // Soumission du formulaire
  const handleSubmit = async (values) => {
    try {
      if (!user || !user.id) {
        message.error("Utilisateur non connecté !");
        return;
      }

      setIsSubmitting(true);
      
      const formattedValues = {
        ...values,
        responsable_id: user.id
      };

      console.log('Données à soumettre:', formattedValues); // Debug
      console.log('Mode édition:', isEditMode, 'ID:', id); // Debug
      
      if (id) {
        const result = await dispatch(updateProspect({ id, data: formattedValues })).unwrap();
        console.log('Résultat mise à jour:', result); // Debug
      } else {
        const result = await dispatch(createProspect(formattedValues)).unwrap();
        console.log('Résultat création:', result); // Debug
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
        title={isEditMode ? "Prospect mis à jour avec succès" : "Prospect créé avec succès"}
        subTitle="Redirection vers la liste des prospects..."
        extra={[
          <Button type="primary" key="list" onClick={() => navigate('/prospects')}>
            Voir la liste des prospects
          </Button>,
        ]}
      />
    );
  }

  // Affichage en cas d'erreur
  if (id && prospectError) {
    return (
      <Result
        status="error"
        title="Une erreur est survenue"
        subTitle={prospectError}
        extra={[
          <Button type="primary" key="back" onClick={() => navigate('/prospects')}>
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
            <Link to="/prospects">
              <UserOutlined /> Prospects
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            {isEditMode ? 'Modifier' : 'Nouveau prospect'}
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
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: isEditMode ? '#1890ff' : '#52c41a',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                />
              </motion.div>
              <div className="header-details">
                <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                  {isEditMode ? `Modifier "${prospect?.nom}"` : 'Nouveau prospect'}
                </Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  {isEditMode ? 'Modifiez les informations du prospect' : 'Créez un nouveau profil de prospect'}
                </Text>
              </div>
            </div>
            <div className="header-actions">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/prospects')}
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
                  Informations du prospect
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
                    potentiel: 'moyen',
                    probabilite: 50
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
                            label="Nom"
                            rules={[{ required: true, message: 'Le nom est obligatoire' }]}
                          >
                            <Input
                              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                              placeholder="Nom du prospect"
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
                              placeholder="Email du prospect"
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
                            name="entreprise_id"
                            label="Entreprise"
                            rules={[{ required: true, message: 'L\'entreprise est obligatoire' }]}
                          >
                            <Select
                              placeholder="Sélectionnez une entreprise"
                              className="modern-select"
                              showSearch
                              allowClear
                              filterOption={(input, option) =>
                                option.children.props.children[1].toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                            >
                              {entreprisesList.map(entreprise => (
                                <Option key={entreprise.id} value={entreprise.id}>
                                  <Space>
                                    <BankOutlined style={{ color: '#722ed1' }} />
                                    {entreprise.nom}
                                  </Space>
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col xs={24} lg={12}>
                          <Form.Item
                            name="secteur_id"
                            label="Secteur"
                          >
                            <Select
                              placeholder="Sélectionnez le secteur d'activité"
                              className="modern-select"
                              showSearch
                              allowClear
                              filterOption={(input, option) =>
                                option.children.props.children[1].toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                            >
                              {secteursList.map(secteur => (
                                <Option key={secteur.id} value={secteur.id}>
                                  <Space>
                                    <GlobalOutlined style={{ color: '#13c2c2' }} />
                                    {secteur.name}
                                  </Space>
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
                              allowClear
                              filterOption={(input, option) =>
                                option.children.props.children[1].toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                            >
                              {paysList.map(pays => (
                                <Option key={pays.id} value={pays.id}>
                                  <Space>
                                    <GlobalOutlined style={{ color: '#eb2f96' }} />
                                    {pays.name_pays}
                                  </Space>
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>

                      </Row>
                    </Card>
                  </motion.div>

                  {/* Informations commerciales */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="form-section-card" title={
                      <Space>
                        <DollarOutlined style={{ color: '#13c2c2' }} />
                        <span>Informations commerciales</span>
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
                              <Option value="qualifie">
                                <Badge status="processing" text="Qualifié" />
                              </Option>
                              <Option value="en_negociation">
                                <Badge status="warning" text="En négociation" />
                              </Option>
                              <Option value="en_attente">
                                <Badge status="warning" text="En attente" />
                              </Option>
                              <Option value="converti">
                                <Badge status="success" text="Converti" />
                              </Option>
                              <Option value="perdu">
                                <Badge status="error" text="Perdu" />
                              </Option>
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                          <Form.Item
                            name="potentiel"
                            label="Potentiel"
                            rules={[{ required: true, message: 'Le potentiel est obligatoire' }]}
                          >
                            <Select
                              placeholder="Évaluez le potentiel"
                              className="modern-select"
                            >
                              <Option value="faible">
                                <Space>
                                  <span style={{ color: '#ff4d4f' }}>●</span>
                                  Faible
                                </Space>
                              </Option>
                              <Option value="moyen">
                                <Space>
                                  <span style={{ color: '#faad14' }}>●</span>
                                  Moyen
                                </Space>
                              </Option>
                              <Option value="élevé">
                                <Space>
                                  <span style={{ color: '#52c41a' }}>●</span>
                                  Élevé
                                </Space>
                              </Option>
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                          <Form.Item
                            name="probabilite"
                            label="Probabilité (%)"
                            tooltip="Probabilité de conversion en pourcentage"
                          >
                            <InputNumber
                              min={0}
                              max={100}
                              style={{ width: '100%' }}
                              placeholder="0-100"
                              className="modern-input"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} lg={12}>
                          <Form.Item
                            name="montant_estime"
                            label="Montant estimé"
                          >
                            <InputNumber
                              min={0}
                              style={{ width: '100%' }}
                              placeholder="Montant en devise locale"
                              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={value => value.replace(/\$\s?|(,*)/g, '')}
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
                              placeholder="Comment avez-vous trouvé ce prospect?"
                              className="modern-select"
                            >
                              <Option value="site_web">Site web</Option>
                              <Option value="referral">Recommandation</Option>
                              <Option value="salon">Salon/Événement</Option>
                              <Option value="reseaux_sociaux">Réseaux sociaux</Option>
                              <Option value="prospection">Prospection directe</Option>
                              <Option value="partenaire">Partenaire</Option>
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
                    transition={{ delay: 0.3 }}
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
                            name="budget"
                            label="Budget disponible"
                          >
                            <TextArea
                              rows={3}
                              placeholder="Informations sur le budget du prospect"
                              className="modern-textarea"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} lg={12}>
                          <Form.Item
                            name="timeline"
                            label="Calendrier"
                          >
                            <TextArea
                              rows={3}
                              placeholder="Calendrier de décision/implémentation"
                              className="modern-textarea"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} lg={12}>
                          <Form.Item
                            name="besoins"
                            label="Besoins identifiés"
                          >
                            <TextArea
                              rows={3}
                              placeholder="Décrivez les besoins du prospect"
                              className="modern-textarea"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} lg={12}>
                          <Form.Item
                            name="decision_maker"
                            label="Décideur"
                          >
                            <TextArea
                              rows={3}
                              placeholder="Informations sur le décideur"
                              className="modern-textarea"
                            />
                          </Form.Item>
                        </Col>

                        <Col span={24}>
                          <Form.Item
                            name="concurrents"
                            label="Concurrents"
                          >
                            <TextArea
                              rows={2}
                              placeholder="Concurrents identifiés"
                              className="modern-textarea"
                            />
                          </Form.Item>
                        </Col>

                        <Col span={24}>
                          <Form.Item
                            name="notes"
                            label="Notes"
                          >
                            <TextArea
                              rows={4}
                              placeholder="Notes supplémentaires sur ce prospect"
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
                    transition={{ delay: 0.4 }}
                  >
                    <Card className="form-actions-card">
                      <Row justify="end">
                        <Space size="large">
                          <Button
                            onClick={() => navigate('/prospects')}
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
                            {isEditMode ? 'Mettre à jour le prospect' : 'Créer le prospect'}
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
                  Guide de qualification
                </Space>
              }
              key="help"
            >
              <div className="tab-content">
                <Card className="help-card" title={
                  <Space>
                    <BookOutlined style={{ color: '#1890ff' }} />
                    <span>Guide de qualification des prospects</span>
                  </Space>
                }>
                  <Row gutter={[24, 24]}>
                    <Col xs={24} lg={12}>
                      <Card className="help-section-card" title="Critères de qualification">
                        <ul className="help-list">
                          <li><strong>Budget :</strong> Le prospect a-t-il un budget défini ?</li>
                          <li><strong>Autorité :</strong> Parlez-vous au bon décideur ?</li>
                          <li><strong>Besoin :</strong> Y a-t-il un besoin clairement identifié ?</li>
                          <li><strong>Calendrier :</strong> Quel est le délai de décision ?</li>
                        </ul>
                      </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                      <Card className="help-section-card" title="Évaluation du potentiel">
                        <div className="status-help-list">
                          <div className="status-help-item">
                            <span style={{ color: '#52c41a', fontSize: '16px' }}>●</span>
                            <div>
                              <strong>Élevé :</strong> Besoin urgent, budget confirmé, décideur identifié
                            </div>
                          </div>
                          <div className="status-help-item">
                            <span style={{ color: '#faad14', fontSize: '16px' }}>●</span>
                            <div>
                              <strong>Moyen :</strong> Intérêt confirmé, budget probable
                            </div>
                          </div>
                          <div className="status-help-item">
                            <span style={{ color: '#ff4d4f', fontSize: '16px' }}>●</span>
                            <div>
                              <strong>Faible :</strong> Intérêt initial, budget incertain
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
                              message="Qualification BANT"
                              description="Budget, Autorité, Besoin, Timing - Les 4 critères essentiels pour qualifier un prospect"
                              type="info"
                              showIcon
                            />
                          </Col>
                          <Col xs={24} md={12}>
                            <Alert
                              message="Suivi régulier"
                              description="Mettez à jour régulièrement les informations et documentez tous les échanges"
                              type="warning"
                              showIcon
                            />
                          </Col>
                          <Col xs={24} md={12}>
                            <Alert
                              message="Probabilité réaliste"
                              description="Évaluez la probabilité de conversion de manière objective"
                              type="success"
                              showIcon
                            />
                          </Col>
                          <Col xs={24} md={12}>
                            <Alert
                              message="Notes détaillées"
                              description="Documentez précisément chaque interaction pour optimiser le suivi"
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

      {/* CSS intégré - identique aux autres formulaires */}
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

export default ProspectForm;