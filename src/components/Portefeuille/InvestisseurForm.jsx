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
  TrophyOutlined, CalendarOutlined
} from '@ant-design/icons';
import {
  createInvestisseur,
  updateInvestisseur,
  getInvestisseurById,
  resetOperation
} from '../../features/investisseurSlice';
import { getCurrentUser } from '../../features/userSlice';
import { fetchSecteurs, fetchPays } from '../../features/marketingSlice';
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
    <div className="crm-container">
      {/* En-tête avec le style CRM */}
      <div className="crm-header">
        <div className="crm-lead-info">
          <div className="crm-avatar">
            <Avatar icon={<FundOutlined />} size={42} style={{ backgroundColor: '#722ed1' }} />
          </div>
          <div className="crm-title">
            <div className="crm-lead-label">
              {isEditMode ? (
                <>Modifier l'investisseur: <span className="lead-name">"{investisseur?.nom}"</span></>
              ) : (
                <>Nouvel investisseur</>
              )}
            </div>
            <div className="crm-lead-actions">
              <Breadcrumb separator=">" className="crm-breadcrumb">
                <Breadcrumb.Item><Link to="/dashboard"><HomeOutlined /> Accueil</Link></Breadcrumb.Item>
                <Breadcrumb.Item><Link to="/investisseurs"><FundOutlined /> Investisseurs</Link></Breadcrumb.Item>
                <Breadcrumb.Item>{isEditMode ? 'Modifier' : 'Nouveau'}</Breadcrumb.Item>
              </Breadcrumb>
            </div>
          </div>
        </div>

        <div className="crm-header-actions">
          <Button 
            className="crm-btn" 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/investisseurs')}
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
            {investisseur?.statut || 'Nouveau'}
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
          <TabPane tab={<span><FormOutlined /> Formulaire investisseur</span>} key="form">
            <div className="crm-form-container">
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  statut: 'nouveau',
                  type_investisseur: 'individuel',
                  devise: 'EUR'
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
                            label="Nom complet"
                            rules={[{ required: true, message: 'Le nom est obligatoire' }]}
                            className="enhanced-form-item"
                          >
                            <Input 
                              prefix={<UserOutlined />} 
                              placeholder="Nom de l'investisseur"
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
                              placeholder="Email de l'investisseur"
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
                            name="type_investisseur"
                            label="Type d'investisseur"
                            rules={[{ required: true, message: 'Le type est obligatoire' }]}
                            className="enhanced-form-item"
                          >
                            <Select placeholder="Sélectionnez le type" className="enhanced-select">
                              <Option value="individuel">Individuel</Option>
                              <Option value="institutionnel">Institutionnel</Option>
                              <Option value="fonds_investissement">Fonds d'investissement</Option>
                              <Option value="business_angel">Business Angel</Option>
                              <Option value="autre">Autre</Option>
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="secteur_interet_id"
                            label="Secteur d'intérêt"
                            className="enhanced-form-item"
                          >
                            <Select 
                              placeholder="Sélectionnez le secteur d'intérêt" 
                              className="enhanced-select"
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

                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="pays_id"
                            label="Pays"
                            className="enhanced-form-item"
                          >
                            <Select 
                              placeholder="Sélectionnez le pays" 
                              className="enhanced-select"
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
                  </Col>

                  {/* Informations financières */}
                  <Col span={24}>
                    <Card title="Informations financières" className="form-section-card">
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={8}>
                          <Form.Item
                            name="capacite_investissement"
                            label="Capacité d'investissement"
                            rules={[{ required: true, message: 'La capacité est obligatoire' }]}
                            className="enhanced-form-item"
                          >
                            <InputNumber
                              min={0}
                              style={{ width: '100%' }}
                              placeholder="Capacité en devise"
                              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={value => value.replace(/\$\s?|(,*)/g, '')}
                              prefix={<DollarOutlined />}
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={8}>
                          <Form.Item
                            name="devise"
                            label="Devise"
                            rules={[{ required: true, message: 'La devise est obligatoire' }]}
                            className="enhanced-form-item"
                          >
                            <Select placeholder="Sélectionnez la devise" className="enhanced-select">
                              <Option value="EUR">EUR - Euro</Option>
                              <Option value="USD">USD - Dollar américain</Option>
                              <Option value="GBP">GBP - Livre sterling</Option>
                              <Option value="CHF">CHF - Franc suisse</Option>
                              <Option value="CAD">CAD - Dollar canadien</Option>
                              <Option value="JPY">JPY - Yen japonais</Option>
                              <Option value="AUD">AUD - Dollar australien</Option>
                              <Option value="MAD">MAD - Dirham marocain</Option>
                              <Option value="TND">TND - Dinar tunisien</Option>
                              <Option value="DZD">DZD - Dinar algérien</Option>
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={8}>
                          <Form.Item
                            name="ticket_moyen"
                            label="Ticket moyen"
                            className="enhanced-form-item"
                          >
                            <InputNumber
                              min={0}
                              style={{ width: '100%' }}
                              placeholder="Ticket moyen par investissement"
                              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="horizon_investissement"
                            label="Horizon d'investissement"
                            className="enhanced-form-item"
                          >
                            <Select placeholder="Durée d'investissement préférée" className="enhanced-select">
                              <Option value="court_terme">Court terme (1-3 ans)</Option>
                              <Option value="moyen_terme">Moyen terme (3-7 ans)</Option>
                              <Option value="long_terme">Long terme (7+ ans)</Option>
                              <Option value="flexible">Flexible</Option>
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="experience_investissement"
                            label="Expérience d'investissement"
                            className="enhanced-form-item"
                          >
                            <Select placeholder="Niveau d'expérience" className="enhanced-select">
                              <Option value="debutant">Débutant</Option>
                              <Option value="intermediaire">Intermédiaire</Option>
                              <Option value="experimente">Expérimenté</Option>
                              <Option value="expert">Expert</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  </Col>

                  {/* Statut et dates */}
                  <Col span={24}>
                    <Card title="Statut et suivi" className="form-section-card">
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
                              <Option value="en_cours">En cours</Option>
                              <Option value="actif">Actif</Option>
                              <Option value="negocie">En négociation</Option>
                              <Option value="converti">Converti</Option>
                              <Option value="perdu">Perdu</Option>
                              <Option value="inactif">Inactif</Option>
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={8}>
                          <Form.Item
                            name="date_engagement"
                            label="Date d'engagement"
                            className="enhanced-form-item"
                          >
                            <DatePicker
                              style={{ width: '100%' }}
                              placeholder="Date d'engagement"
                              format="DD/MM/YYYY"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={8}>
                          <Form.Item
                            name="date_signature"
                            label="Date de signature"
                            className="enhanced-form-item"
                          >
                            <DatePicker
                              style={{ width: '100%' }}
                              placeholder="Date de signature"
                              format="DD/MM/YYYY"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="source"
                            label="Source"
                            className="enhanced-form-item"
                          >
                            <Select placeholder="Comment avez-vous trouvé cet investisseur?" className="enhanced-select">
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
                  </Col>

                  {/* Informations détaillées */}
                  <Col span={24}>
                    <Card title="Informations détaillées" className="form-section-card">
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="interets_specifiques"
                            label="Intérêts spécifiques"
                            className="enhanced-form-item"
                          >
                            <TextArea
                              rows={3}
                              placeholder="Domaines d'investissement préférés, secteurs d'intérêt..."
                              className="enhanced-textarea"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="criteres_investissement"
                            label="Critères d'investissement"
                            className="enhanced-form-item"
                          >
                            <TextArea
                              rows={3}
                              placeholder="Critères de sélection, montants préférés, durée d'investissement..."
                              className="enhanced-textarea"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="linkedin"
                            label="Profil LinkedIn"
                            className="enhanced-form-item"
                          >
                            <Input 
                              placeholder="https://linkedin.com/in/..."
                              className="enhanced-input"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="site_web"
                            label="Site web"
                            className="enhanced-form-item"
                          >
                            <Input 
                              placeholder="https://..."
                              className="enhanced-input"
                            />
                          </Form.Item>
                        </Col>

                        <Col span={24}>
                          <Form.Item
                            name="adresse"
                            label="Adresse"
                            className="enhanced-form-item"
                          >
                            <TextArea
                              rows={2}
                              placeholder="Adresse complète"
                              className="enhanced-textarea"
                            />
                          </Form.Item>
                        </Col>

                        <Col span={24}>
                          <Form.Item
                            name="notes_internes"
                            label="Notes internes"
                            className="enhanced-form-item"
                          >
                            <TextArea
                              rows={4}
                              placeholder="Informations internes, observations, historique..."
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
                      onClick={() => navigate('/investisseurs')}
                    >
                      Annuler
                    </Button>
                    <Button 
                      type="primary"
                      icon={isEditMode ? <EditOutlined /> : <PlusOutlined />}
                      loading={isSubmitting}
                      onClick={handleSubmit}
                    >
                      {isEditMode ? 'Mettre à jour' : 'Créer l\'investisseur'}
                    </Button>
                  </Space>
                </div>
              </Form>
            </div>
          </TabPane>

          <TabPane tab={<span><InfoCircleOutlined /> Guide d'évaluation</span>} key="help">
            <div className="crm-help-container">
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Card title="Types d'investisseurs" className="help-card">
                    <ul>
                      <li><strong>Individuel :</strong> Personne physique investissant ses propres fonds</li>
                      <li><strong>Institutionnel :</strong> Banques, compagnies d'assurance, fonds de pension</li>
                      <li><strong>Fonds d'investissement :</strong> Sociétés de gestion d'actifs</li>
                      <li><strong>Business Angel :</strong> Entrepreneur expérimenté investissant dans des startups</li>
                    </ul>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title="Critères d'évaluation" className="help-card">
                    <ul>
                      <li><strong>Capacité :</strong> Montant disponible pour investir</li>
                      <li><strong>Appétit :</strong> Niveau de risque accepté</li>
                      <li><strong>Horizon :</strong> Durée d'investissement souhaitée</li>
                      <li><strong>Secteur :</strong> Domaines d'intérêt privilégiés</li>
                    </ul>
                  </Card>
                </Col>
              </Row>
              
              <Alert
                message="Bonnes pratiques"
                description="Documentez précisément les critères et préférences de chaque investisseur pour optimiser le matching avec vos projets d'investissement."
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
          color: #722ed1;
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

export default InvestisseurForm;