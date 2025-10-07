import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Form, Input, Button, Card, Select, DatePicker, Space, message,
  Spin, Row, Col, Steps, Breadcrumb, Switch, Tooltip,
  Avatar, Result, Alert, Progress, Typography, Tabs, Badge
} from 'antd';
import {
  SaveOutlined, ArrowLeftOutlined, UserOutlined, MailOutlined,
  PhoneOutlined, CalendarOutlined, TeamOutlined, FileTextOutlined,
  EditOutlined, PlusOutlined, CheckOutlined, BuildOutlined,
  BankOutlined, AuditOutlined, GlobalOutlined, ScheduleOutlined,
  HomeOutlined, FormOutlined, QuestionCircleOutlined, BookOutlined,
  InfoCircleOutlined
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
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
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
        if (!user && localStorage.getItem('token')) {
          await dispatch(getCurrentUser()).unwrap();
        }
      } catch (error) {
        console.error('Erreur chargement utilisateur:', error);
        message.error('Impossible de charger les informations de l\'utilisateur');
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [dispatch, user]);

  // Charger l'invité en mode édition
  useEffect(() => {
    if (id) {
      dispatch(getInviteById(id))
        .finally(() => setLoadingData(false));
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
        statut: invite.statut,
        suivi_requis: invite.suivi_requis,
        date_invitation: invite.date_invitation ? moment(invite.date_invitation) : null,
        date_evenement: invite.date_evenement ? moment(invite.date_evenement) : null,
        commentaires: invite.commentaires,
      });
      
      if (invite.action_id) {
        dispatch(fetchEtapesByAction(invite.action_id));
      }
      setLoadingData(false);
    } else if (!id && user) {
      form.setFieldsValue({
        proprietaire_id: user.id,
        statut: 'en_attente',
        type_invite: 'externe',
        suivi_requis: false
      });
      setLoadingData(false);
    }
  }, [invite, form, id, user, dispatch]);

  // Gestion des succès/erreurs d'opération
  useEffect(() => {
    if (operation.success) {
      setFormSubmitted(true);
      setIsSubmitting(false);
      
      setTimeout(() => {
        navigate('/invites');
      }, 1500);
    } else if (operation.error) {
      message.error(operation.error);
      setIsSubmitting(false);
    }
  }, [operation, navigate]);

  // Soumission du formulaire
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!user || !user.id) {
        message.error("Utilisateur non connecté !");
        return;
      }

      setIsSubmitting(true);
      
      const formattedValues = {
        ...values,
        date_invitation: values.date_invitation ? values.date_invitation.format('YYYY-MM-DD HH:mm:ss') : null,
        date_evenement: values.date_evenement ? values.date_evenement.format('YYYY-MM-DD HH:mm:ss') : null,
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

  // Affichage du chargement
  if (loadingUser || (id && loadingData)) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Spin size="large" tip={`Chargement ${isEditMode ? 'de l\'invité' : 'des données'}...`} />
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
          {isEditMode ? 'Invité mis à jour avec succès!' : 'Invité créé avec succès!'}
        </Title>
        <Text type="secondary">
          Redirection en cours...
        </Text>
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (id && inviteError) {
    return (
      <Alert
        message="Erreur"
        description={inviteError}
        type="error"
        showIcon
        action={
          <Button onClick={() => navigate('/invites')}>
            Retour à la liste
          </Button>
        }
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
            <Link to="/invites">
              <TeamOutlined /> Invités
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            {isEditMode ? 'Modifier' : 'Nouvel invité'}
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
                  {isEditMode ? `Modifier "${invite?.nom} ${invite?.prenom}"` : 'Nouvel invité'}
                </Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  {isEditMode ? 'Modifiez les informations de l\'invité' : 'Créez une nouvelle invitation'}
                </Text>
              </div>
            </div>
            <div className="header-actions">
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/invites')}
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
                  Informations de l'invité
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
                  {/* Informations personnelles */}
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
                              placeholder="Nom de l'invité"
                              className="modern-input"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} lg={12}>
                          <Form.Item 
                            name="prenom" 
                            label="Prénom"
                            rules={[{ required: true, message: 'Le prénom est obligatoire' }]}
                          >
                            <Input 
                              prefix={<UserOutlined style={{ color: '#1890ff' }} />} 
                              placeholder="Prénom de l'invité" 
                              className="modern-input"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      
                      <Row gutter={[24, 16]}>
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
                              placeholder="Email de l'invité" 
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
                      </Row>
                      
                      <Row gutter={[24, 16]}>
                        <Col xs={24} lg={12}>
                          <Form.Item
                            name="fonction"
                            label="Fonction"
                          >
                            <Input 
                              prefix={<BuildOutlined style={{ color: '#722ed1' }} />} 
                              placeholder="Fonction de l'invité" 
                              className="modern-input"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} lg={12}>
                          <Form.Item
                            name="type_invite"
                            label="Type d'invité"
                            rules={[{ required: true, message: 'Le type est obligatoire' }]}
                          >
                            <Select 
                              placeholder="Sélectionnez le type d'invité"
                              className="modern-select"
                            >
                              <Option value="interne">
                                <Space>
                                  <TeamOutlined style={{ color: '#1890ff' }} />
                                  Interne
                                </Space>
                              </Option>
                              <Option value="externe">
                                <Space>
                                  <GlobalOutlined style={{ color: '#52c41a' }} />
                                  Externe
                                </Space>
                              </Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  </motion.div>

                  {/* Informations entreprise et action */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="form-section-card" title={
                      <Space>
                        <BankOutlined style={{ color: '#52c41a' }} />
                        <span>Entreprise et action</span>
                      </Space>
                    }>
                      <Row gutter={[24, 16]}>
                        <Col xs={24} lg={12}>
                          <Form.Item
                            name="entreprise_id"
                            label="Entreprise"
                            rules={[{ required: true, message: 'L\'entreprise est obligatoire' }]}
                          >
                            <Select
                              placeholder="Sélectionnez une entreprise"
                              loading={entreprises.loading}
                              showSearch
                              optionFilterProp="children"
                              className="modern-select"
                            >
                              {Array.isArray(entreprises.items) && entreprises.items.map(entreprise => (
                                <Option key={entreprise.id} value={entreprise.id}>
                                  <Space>
                                    <BankOutlined style={{ color: '#1890ff' }} />
                                    {entreprise.nom}
                                  </Space>
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} lg={12}>
                          <Form.Item
                            name="action_id"
                            label="Action"
                            rules={[{ required: true, message: 'L\'action est obligatoire' }]}
                          >
                            <Select
                              placeholder="Sélectionnez une action"
                              loading={actions.loading}
                              onChange={handleActionChange}
                              showSearch
                              optionFilterProp="children"
                              className="modern-select"
                            >
                              {Array.isArray(actions.items) && actions.items.map(action => (
                                <Option key={action.id} value={action.id}>
                                  <Space>
                                    <AuditOutlined style={{ color: '#52c41a' }} />
                                    {action.nom}
                                  </Space>
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  </motion.div>

                  {/* Statut et dates */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card className="form-section-card" title={
                      <Space>
                        <CalendarOutlined style={{ color: '#722ed1' }} />
                        <span>Statut et planification</span>
                      </Space>
                    }>
                      <Row gutter={[24, 16]}>
                        <Col xs={24} lg={12}>
                          <Form.Item
                            name="statut"
                            label="Statut"
                            rules={[{ required: true, message: 'Le statut est obligatoire' }]}
                          >
                            <Select 
                              placeholder="Sélectionnez un statut"
                              className="modern-select"
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
                        <Col xs={24} lg={12}>
                          <Form.Item
                            name="suivi_requis"
                            label="Suivi requis"
                            valuePropName="checked"
                            tooltip="Indiquez si un suivi est nécessaire après l'invitation"
                          >
                            <Switch 
                              checkedChildren="✓ Oui" 
                              unCheckedChildren="✗ Non"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      
                      <Row gutter={[24, 16]}>
                        <Col xs={24} lg={12}>
                          <Form.Item
                            name="date_invitation"
                            label="Date d'invitation"
                          >
                            <DatePicker 
                              style={{ width: '100%' }} 
                              showTime 
                              format="DD/MM/YYYY HH:mm"
                              placeholder="Sélectionnez la date d'invitation" 
                              className="modern-input"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} lg={12}>
                          <Form.Item
                            name="date_evenement"
                            label="Date de l'événement"
                          >
                            <DatePicker 
                              style={{ width: '100%' }} 
                              showTime 
                              format="DD/MM/YYYY HH:mm" 
                              placeholder="Sélectionnez la date de l'événement"
                              className="modern-input"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      
                      <Row gutter={[24, 16]}>
                        <Col span={24}>
                          <Form.Item
                            name="commentaires"
                            label="Commentaires"
                          >
                            <TextArea 
                              rows={4} 
                              placeholder="Commentaires concernant cet invité..."
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
                            onClick={() => navigate('/invites')}
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
                            {isEditMode ? 'Mettre à jour' : 'Créer l\'invité'}
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
                    <span>Guide de création d'invité</span>
                  </Space>
                }>
                  <Row gutter={[24, 24]}>
                    <Col xs={24} lg={12}>
                      <Card className="help-section-card" title="Informations requises">
                        <ul className="help-list">
                          <li><strong>Nom/Prénom :</strong> Identité complète de l'invité</li>
                          <li><strong>Email :</strong> Adresse de contact obligatoire</li>
                          <li><strong>Type :</strong> Interne ou externe à l'organisation</li>
                          <li><strong>Entreprise :</strong> Entreprise d'appartenance</li>
                          <li><strong>Action :</strong> Événement ou action associé</li>
                          <li><strong>Statut :</strong> État de l'invitation</li>
                        </ul>
                      </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                      <Card className="help-section-card" title="Statuts disponibles">
                        <div className="status-help-list">
                          <div className="status-help-item">
                            <Badge status="warning" />
                            <div>
                              <strong>En attente :</strong> Invitation non encore envoyée
                            </div>
                          </div>
                          <div className="status-help-item">
                            <Badge status="processing" />
                            <div>
                              <strong>Envoyée :</strong> Invitation transmise à l'invité
                            </div>
                          </div>
                          <div className="status-help-item">
                            <Badge status="success" />
                            <div>
                              <strong>Confirmée :</strong> Participation confirmée
                            </div>
                          </div>
                          <div className="status-help-item">
                            <Badge status="error" />
                            <div>
                              <strong>Refusée :</strong> Invitation déclinée
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
                              message="Email valide"
                              description="Assurez-vous que l'adresse email est correcte pour les communications"
                              type="info"
                              showIcon
                            />
                          </Col>
                          <Col xs={24} md={12}>
                            <Alert
                              message="Suivi requis"
                              description="Activez le suivi pour les invités nécessitant une attention particulière"
                              type="warning"
                              showIcon
                            />
                          </Col>
                          <Col xs={24} md={12}>
                            <Alert
                              message="Dates précises"
                              description="Renseignez les dates pour faciliter la planification des événements"
                              type="success"
                              showIcon
                            />
                          </Col>
                          <Col xs={24} md={12}>
                            <Alert
                              message="Commentaires"
                              description="Utilisez les commentaires pour noter des informations importantes"
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

  .ant-date-picker {
    width: 100%;
  }

  .ant-picker-dropdown {
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  }

  .ant-switch-checked {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .ant-badge-status-dot {
    width: 8px;
    height: 8px;
  }

  /* Effet focus pour les inputs avec prefix */
  .ant-input-affix-wrapper:focus,
  .ant-input-affix-wrapper-focused {
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
  }

  /* Style pour les tooltips */
  .ant-tooltip-inner {
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.85);
  }

  /* Style pour les messages d'erreur */
  .ant-form-item-explain-error {
    color: #ff4d4f;
    font-size: 12px;
    margin-top: 4px;
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

  /* Style pour les espacements */
  .ant-space {
    width: 100%;
  }

  .ant-space-item {
    display: flex;
    align-items: center;
  }

  /* Amélioration visuelle des switches */
  .ant-switch {
    background: #bfbfbf;
    border-radius: 100px;
    transition: all 0.3s ease;
  }

  .ant-switch:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }

  /* Style pour les loading states */
  .ant-spin-container {
    transition: opacity 0.3s ease;
  }

  .ant-spin-blur {
    opacity: 0.5;
    user-select: none;
    pointer-events: none;
  }

  /* Amélioration des tabs */
  .modern-tabs .ant-tabs-content-holder {
    background: white;
    border-radius: 0 0 16px 16px;
  }

  .modern-tabs .ant-tabs-tab:hover {
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
  }

  /* Style pour les dividers */
  .ant-divider {
    border-color: #f0f0f0;
  }

  /* Améliorations finales */
  .ant-typography {
    color: #333;
  }

  .ant-typography.ant-typography-secondary {
    color: #666;
  }

  /* Animation d'entrée pour les éléments */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .modern-container > * {
    animation: fadeInUp 0.5s ease-out;
  }
`}</style>
</div>
);
};

export default InviteForm;