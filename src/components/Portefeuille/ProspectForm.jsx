import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Form, Input, Button, Card, Select, Row, Col, message,
  Spin, Breadcrumb, Avatar, Result, Alert, Typography, Tabs,
  InputNumber, Switch, Tooltip, Space,Badge
} from 'antd';
import {
  SaveOutlined, ArrowLeftOutlined, UserOutlined, MailOutlined,
  PhoneOutlined, BankOutlined, EditOutlined, PlusOutlined,
  InfoCircleOutlined, FormOutlined, HomeOutlined, DashboardOutlined,
  GlobalOutlined, TeamOutlined
} from '@ant-design/icons';
import {
  createProspect,
  updateProspect,
  getProspectById,
  resetOperation
} from '../../features/prospectSlice';
import { getCurrentUser } from '../../features/userSlice';
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
        entreprise: prospect.entreprise,
        secteur: prospect.secteur,
        pays: prospect.pays,
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
  }, [prospect, form, id]);

  // Gestion des succès/erreurs d'opération
  useEffect(() => {
    if (operation.success) {
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
        responsable_id: user.id
      };
      
      if (id) {
        await dispatch(updateProspect({ id, data: formattedValues })).unwrap();
      } else {
        await dispatch(createProspect(formattedValues)).unwrap();
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
                <>Modifier le prospect: <span className="lead-name">"{prospect?.nom}"</span></>
              ) : (
                <>Nouveau prospect</>
              )}
            </div>
            <div className="crm-lead-actions">
              <Breadcrumb separator=">" className="crm-breadcrumb">
                <Breadcrumb.Item><Link to="/dashboard"><HomeOutlined /> Accueil</Link></Breadcrumb.Item>
                <Breadcrumb.Item><Link to="/prospects"><UserOutlined /> Prospects</Link></Breadcrumb.Item>
                <Breadcrumb.Item>{isEditMode ? 'Modifier' : 'Nouveau'}</Breadcrumb.Item>
              </Breadcrumb>
            </div>
          </div>
        </div>

        <div className="crm-header-actions">
          <Button 
            className="crm-btn" 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/prospects')}
          >
            Retour à la liste
          </Button>
          
          <Button 
            type="primary"
            className="crm-btn"
            icon={isEditMode ? <EditOutlined /> : <PlusOutlined />}
            loading={isSubmitting}
            onClick={handleSubmit}
          >
            {isEditMode ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </div>

      {/* Informations du formulaire */}
      <div className="crm-meta-info">
        <div className="crm-meta-item">
          <div className="crm-meta-label">TYPE:</div>
          <div className="crm-meta-value">
            <Badge status="processing" text={isEditMode ? "Modification" : "Création"} />
          </div>
        </div>
        <div className="crm-meta-item">
          <div className="crm-meta-label">STATUT:</div>
          <div className="crm-meta-value">
            {prospect?.statut || 'Nouveau'}
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
          <TabPane tab={<span><FormOutlined /> Formulaire prospect</span>} key="form">
            <div className="crm-form-container">
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  statut: 'nouveau',
                  potentiel: 'moyen',
                  probabilite: 50
                }}
                className="enhanced-form"
              >
                <Row gutter={[24, 16]}>
                  {/* Informations de base */}
                  <Col span={24}>
                    <Card title="Informations de base" className="form-section-card">
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="nom"
                            label="Nom"
                            rules={[{ required: true, message: 'Le nom est obligatoire' }]}
                            className="enhanced-form-item"
                          >
                            <Input 
                              prefix={<UserOutlined />} 
                              placeholder="Nom du prospect"
                              className="enhanced-input"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                              { required: true, message: 'L\'email est obligatoire' },
                              { type: 'email', message: 'Format d\'email invalide' }
                            ]}
                            className="enhanced-form-item"
                          >
                            <Input 
                              prefix={<MailOutlined />} 
                              placeholder="Email du prospect"
                              className="enhanced-input"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="telephone"
                            label="Téléphone"
                            className="enhanced-form-item"
                          >
                            <Input 
                              prefix={<PhoneOutlined />} 
                              placeholder="Numéro de téléphone"
                              className="enhanced-input"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="entreprise"
                            label="Entreprise"
                            rules={[{ required: true, message: 'L\'entreprise est obligatoire' }]}
                            className="enhanced-form-item"
                          >
                            <Input 
                              prefix={<BankOutlined />} 
                              placeholder="Nom de l'entreprise"
                              className="enhanced-input"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="secteur"
                            label="Secteur"
                            className="enhanced-form-item"
                          >
                            <Input 
                              prefix={<GlobalOutlined />} 
                              placeholder="Secteur d'activité"
                              className="enhanced-input"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="pays"
                            label="Pays"
                            className="enhanced-form-item"
                          >
                            <Input 
                              prefix={<GlobalOutlined />} 
                              placeholder="Pays"
                              className="enhanced-input"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  </Col>

                  {/* Informations commerciales */}
                  <Col span={24}>
                    <Card title="Informations commerciales" className="form-section-card">
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={8}>
                          <Form.Item
                            name="statut"
                            label="Statut"
                            rules={[{ required: true, message: 'Le statut est obligatoire' }]}
                            className="enhanced-form-item"
                          >
                            <Select placeholder="Sélectionnez le statut" className="enhanced-select">
                              <Option value="nouveau">Nouveau</Option>
                              <Option value="qualifie">Qualifié</Option>
                              <Option value="en_negociation">En négociation</Option>
                              <Option value="en_attente">En attente</Option>
                              <Option value="converti">Converti</Option>
                              <Option value="perdu">Perdu</Option>
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={8}>
                          <Form.Item
                            name="potentiel"
                            label="Potentiel"
                            rules={[{ required: true, message: 'Le potentiel est obligatoire' }]}
                            className="enhanced-form-item"
                          >
                            <Select placeholder="Évaluez le potentiel" className="enhanced-select">
                              <Option value="faible">Faible</Option>
                              <Option value="moyen">Moyen</Option>
                              <Option value="élevé">Élevé</Option>
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={8}>
                          <Form.Item
                            name="probabilite"
                            label="Probabilité (%)"
                            className="enhanced-form-item"
                            tooltip="Probabilité de conversion en pourcentage"
                          >
                            <InputNumber
                              min={0}
                              max={100}
                              style={{ width: '100%' }}
                              placeholder="0-100"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="montant_estime"
                            label="Montant estimé"
                            className="enhanced-form-item"
                          >
                            <InputNumber
                              min={0}
                              style={{ width: '100%' }}
                              placeholder="Montant en devise locale"
                              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="source"
                            label="Source"
                            className="enhanced-form-item"
                          >
                            <Select placeholder="Comment avez-vous trouvé ce prospect?" className="enhanced-select">
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
                  </Col>

                  {/* Informations détaillées */}
                  <Col span={24}>
                    <Card title="Informations détaillées" className="form-section-card">
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="budget"
                            label="Budget disponible"
                            className="enhanced-form-item"
                          >
                            <TextArea
                              rows={3}
                              placeholder="Informations sur le budget du prospect"
                              className="enhanced-textarea"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="timeline"
                            label="Calendrier"
                            className="enhanced-form-item"
                          >
                            <TextArea
                              rows={3}
                              placeholder="Calendrier de décision/implémentation"
                              className="enhanced-textarea"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="besoins"
                            label="Besoins identifiés"
                            className="enhanced-form-item"
                          >
                            <TextArea
                              rows={3}
                              placeholder="Décrivez les besoins du prospect"
                              className="enhanced-textarea"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="decision_maker"
                            label="Décideur"
                            className="enhanced-form-item"
                          >
                            <TextArea
                              rows={3}
                              placeholder="Informations sur le décideur"
                              className="enhanced-textarea"
                            />
                          </Form.Item>
                        </Col>

                        <Col span={24}>
                          <Form.Item
                            name="concurrents"
                            label="Concurrents"
                            className="enhanced-form-item"
                          >
                            <TextArea
                              rows={2}
                              placeholder="Concurrents identifiés"
                              className="enhanced-textarea"
                            />
                          </Form.Item>
                        </Col>

                        <Col span={24}>
                          <Form.Item
                            name="notes"
                            label="Notes"
                            className="enhanced-form-item"
                          >
                            <TextArea
                              rows={4}
                              placeholder="Notes supplémentaires sur ce prospect"
                              className="enhanced-textarea"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>

                <div className="form-actions">
                  <Space size="middle">
                    <Button 
                      icon={<ArrowLeftOutlined />}
                      onClick={() => navigate('/prospects')}
                    >
                      Annuler
                    </Button>
                    <Button 
                      type="primary"
                      icon={isEditMode ? <EditOutlined /> : <PlusOutlined />}
                      loading={isSubmitting}
                      onClick={handleSubmit}
                    >
                      {isEditMode ? 'Mettre à jour' : 'Créer le prospect'}
                    </Button>
                  </Space>
                </div>
              </Form>
            </div>
          </TabPane>

          <TabPane tab={<span><InfoCircleOutlined /> Guide de qualification</span>} key="help">
            <div className="crm-help-container">
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Card title="Critères de qualification" className="help-card">
                    <ul>
                      <li><strong>Budget :</strong> Le prospect a-t-il un budget défini ?</li>
                      <li><strong>Autorité :</strong> Parlez-vous au bon décideur ?</li>
                      <li><strong>Besoin :</strong> Y a-t-il un besoin clairement identifié ?</li>
                      <li><strong>Calendrier :</strong> Quel est le délai de décision ?</li>
                    </ul>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title="Évaluation du potentiel" className="help-card">
                    <ul>
                      <li><strong>Élevé :</strong> Besoin urgent, budget confirmé, décideur identifié</li>
                      <li><strong>Moyen :</strong> Intérêt confirmé, budget probable</li>
                      <li><strong>Faible :</strong> Intérêt initial, budget incertain</li>
                    </ul>
                  </Card>
                </Col>
              </Row>
              
              <Alert
                message="Bonnes pratiques"
                description="Mettez à jour régulièrement les informations de vos prospects et documentez tous les échanges pour optimiser votre suivi commercial."
                type="info"
                showIcon
                style={{ marginTop: 24 }}
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
        
        .form-section-card {
          margin-bottom: 24px;
          border-radius: 8px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        .enhanced-form-item {
          margin-bottom: 20px;
        }
        
        .enhanced-input,
        .enhanced-select,
        .enhanced-textarea {
          border-radius: 6px;
        }
        
        .form-actions {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #f0f0f0;
          text-align: right;
        }
        
        .crm-help-container {
          padding: 24px 0;
        }
        
        .help-card {
          height: 100%;
          border-radius: 8px;
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
          
          .form-actions {
            text-align: center;
          }
          
          .form-actions .ant-space {
            width: 100%;
            flex-direction: column;
          }
          
          .form-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ProspectForm;