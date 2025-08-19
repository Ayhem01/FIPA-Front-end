import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card, Row, Col, Typography, Tag, Button, Space, Spin,
  Descriptions, Tabs, Table, Statistic, Divider, Tooltip,
  Timeline, Modal, Empty, Breadcrumb, Badge, Avatar, Result,
  Form, Input, Select, Radio, message
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, DeleteOutlined, CalendarOutlined,
  FileTextOutlined, UserOutlined, GlobalOutlined, TeamOutlined,
  ClockCircleOutlined, CheckCircleOutlined, InfoCircleOutlined,
  ExclamationCircleOutlined, EnvironmentOutlined, ProfileOutlined,
  PlusOutlined, MailOutlined, PhoneOutlined, FundOutlined, CloseCircleOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { getActionById, deleteAction, fetchEntreprises, 
  fetchEtapes } from '../../features/marketingSlice';
import { createInvite } from '../../features/inviteSlice';
import moment from 'moment';
import { API_BASE_URL, getAuthHeader } from '../../features/taskSlice';
import '../../../src/assets/styles/action-form.css';
import { getCurrentUser } from '../../features/userSlice';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const ActionDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Récupération de l'utilisateur courant depuis le Redux store
  const currentUser = useSelector((state) => state.user.user);

  // Récupérer les données depuis le Redux store
  const { selectedItem: action, loading } = useSelector((state) => state.marketing.actions);
  const { items: entreprises, loading: entreprisesLoading } = useSelector((state) => state.marketing.entreprises);
  const { items: etapes, loading: etapesLoading } = useSelector((state) => state.marketing.etapes);
  
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [addInviteModalVisible, setAddInviteModalVisible] = useState(false);
  const [inviteForm] = Form.useForm();
  
  // Définir le loading des dépendances sans inclure usersLoading
  const loadingDependencies = entreprisesLoading || etapesLoading;

  // Charger les détails de l'action
  useEffect(() => {
    dispatch(getActionById(id));
    dispatch(getCurrentUser());
  }, [dispatch, id]);

  // Fonction pour charger les données nécessaires pour le formulaire (sans les utilisateurs)
  const loadFormDependencies = () => {
    // Charger uniquement les entreprises et les étapes
    dispatch(fetchEntreprises());
    dispatch(fetchEtapes());
  };

  // Ouvrir le modal et charger les données
  const openAddInviteModal = () => {
    // Réinitialiser le formulaire
    inviteForm.resetFields();
    
    // Définir des valeurs initiales, avec l'utilisateur courant comme propriétaire
    inviteForm.setFieldsValue({
      type_invite: 'externe', 
      statut: 'en_attente',
      action_id: id,
      proprietaire_id: currentUser?.id  // Définir l'ID de l'utilisateur courant
    });
    
    // Charger les dépendances et afficher le modal
    loadFormDependencies();
    setAddInviteModalVisible(true);
  };

  // Gérer la suppression d'une action
  const handleDeleteAction = async () => {
    try {
      await dispatch(deleteAction(id)).unwrap();
      message.success('Action supprimée avec succès');
      navigate('/actions');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      message.error('Impossible de supprimer cette action');
    }
    setDeleteModalVisible(false);
  };

  // Gérer l'ajout d'un invité
  const handleAddInvite = () => {
    inviteForm
      .validateFields()
      .then(values => {
        // Ajout de l'action_id et proprietaire_id à l'objet invité
        const inviteData = {
          ...values,
          action_id: id,
          statut: values.statut || 'en_attente',
          proprietaire_id: currentUser?.id  // S'assurer que l'ID du propriétaire est bien défini
        };

        message.loading('Ajout de l\'invité en cours...', 0.5);
        dispatch(createInvite(inviteData))
          .unwrap()
          .then(() => {
            message.success('Invité ajouté avec succès');
            inviteForm.resetFields();
            setAddInviteModalVisible(false);
            // Rafraîchir les détails de l'action pour voir le nouvel invité
            dispatch(getActionById(id));
          })
          .catch(error => {
            console.error('Erreur complète:', error);
            
            // Afficher les messages d'erreur spécifiques si disponibles
            if (error && error.errors) {
              const errorMessages = Object.values(error.errors).flat().join(', ');
              message.error(`Erreur lors de l'ajout: ${errorMessages}`);
            } else {
              message.error(`Erreur lors de l'ajout: ${error.message || error}`);
            }
          });
      })
      .catch(info => {
        console.log('Validation échouée:', info);
      });
  };

  // Utilitaires pour l'affichage
  const getStatusColor = (status) => {
    const statusMap = {
      'planifiee': 'blue',
      'terminee': 'green',
      'annulee': 'red',
      'reportee': 'orange',
    };
    return statusMap[status] || 'default';
  };

  const getTimingBadge = (timing) => {
    const timingProps = {
      'a_venir': { status: 'processing', text: 'À venir', color: '#52c41a' },
      'en_cours': { status: 'success', text: 'En cours', color: '#1890ff' },
      'passee': { status: 'default', text: 'Passée', color: '#d9d9d9' }
    };
    
    const { status, text, color } = timingProps[timing] || { status: 'default', text: 'Inconnu', color: '#d9d9d9' };
    
    return (
      <Badge status={status} text={text} style={{ color }} />
    );
  };

  const formatType = (type) => {
    const typeLabels = {
      'media': 'Media',
      'cte': 'CTE',
      'salon': 'Salon',
      'delegation': 'Délégation',
      'seminaire_jipays': 'Séminaire JI Pays',
      'demarchage_direct': 'Démarchage Direct',
      'salon_sectoriel': 'Salon Sectoriel',
      'seminaire_jisecteur': 'Séminaire JI Secteur',
      'visite_entreprise': 'Visite Entreprise',
    };
    return typeLabels[type] || type;
  };

  const formatDate = (date) => {
    return date ? moment(date).format('DD/MM/YYYY') : '-';
  };

  const formatDateTime = (date) => {
    return date ? moment(date).format('DD/MM/YYYY HH:mm') : '-';
  };

  const getTypeIcon = (type) => {
    const typeIconMap = {
      'media': <GlobalOutlined />,
      'cte': <CalendarOutlined />,
      'salon': <FileTextOutlined />,
      'delegation': <UserOutlined />,
      'seminaire_jipays': <CalendarOutlined />,
      'demarchage_direct': <UserOutlined />,
      'salon_sectoriel': <FileTextOutlined />,
      'seminaire_jisecteur': <CalendarOutlined />,
      'visite_entreprise': <UserOutlined />,
    };
    return typeIconMap[type] || <FileTextOutlined />;
  };

  // Fonction pour afficher les détails spécifiques selon le type d'action
  const renderTypeSpecificDetails = () => {
    if (!action) return null;
    
    const typeComponentsMap = {
      'media': renderMediaDetails,
      'cte': renderCteDetails,
      'salon': renderSalonDetails,
      'delegation': renderDelegationDetails,
      'seminaire_jipays': renderSeminaireDetails,
      'demarchage_direct': renderDemarchageDirectDetails,
      'salon_sectoriel': renderSalonSectorielDetails,
      'seminaire_jisecteur': renderSeminaireSecteurDetails,
      'visite_entreprise': renderVisiteEntrepriseDetails,
    };
    
    const renderFunction = typeComponentsMap[action.type];
    return renderFunction ? renderFunction() : <Empty description="Aucun détail spécifique disponible" />;
  };
  
  // Rendus spécifiques pour chaque type d'action
  const renderMediaDetails = () => {
    const media = action.media;
    if (!media) return <Empty description="Aucune information média disponible" />;
    
    // Helper pour afficher les champs booléens
    const renderBoolean = (value) => {
      return value ? <Tag color="green">Oui</Tag> : <Tag color="red">Non</Tag>;
    };
    
    return (
      <>
        {/* Statut de l'action */}
        <div className="media-status-container">
          <h4 className="media-section-title">Statut de l'action</h4>
          <Row gutter={[16, 16]}>
            <Col span={4}>
              <Card size="small" className={`status-card ${media.proposee ? 'status-active' : ''}`}>
                <div className="status-title">Proposée</div>
                <div className="status-value">{renderBoolean(media.proposee)}</div>
              </Card>
            </Col>
            <Col span={4}>
              <Card size="small" className={`status-card ${media.programmee ? 'status-active' : ''}`}>
                <div className="status-title">Programmée</div>
                <div className="status-value">{renderBoolean(media.programmee)}</div>
              </Card>
            </Col>
            <Col span={4}>
              <Card size="small" className={`status-card ${media.realisee ? 'status-active' : ''}`}>
                <div className="status-title">Réalisée</div>
                <div className="status-value">{renderBoolean(media.realisee)}</div>
              </Card>
            </Col>
            <Col span={4}>
              <Card size="small" className={`status-card ${media.reportee ? 'status-active' : ''}`}>
                <div className="status-title">Reportée</div>
                <div className="status-value">{renderBoolean(media.reportee)}</div>
              </Card>
            </Col>
            <Col span={4}>
              <Card size="small" className={`status-card ${media.annulee ? 'status-active' : ''}`}>
                <div className="status-title">Annulée</div>
                <div className="status-value">{renderBoolean(media.annulee)}</div>
              </Card>
            </Col>
          </Row>
        </div>
  
        <Divider />
        
        <Descriptions 
          bordered 
          column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
          title="Informations générales"
        >
          <Descriptions.Item label="Action">{media.action || '-'}</Descriptions.Item>
          <Descriptions.Item label="Proposée par">{media['proposee par'] || '-'}</Descriptions.Item>
          <Descriptions.Item label="Type d'action">{media.type_action || '-'}</Descriptions.Item>
          <Descriptions.Item label="Type de média">{media.type_media || '-'}</Descriptions.Item>
          <Descriptions.Item label="Durée">{media.duree || '-'}</Descriptions.Item>
          <Descriptions.Item label="Langue">{media.langue || '-'}</Descriptions.Item>
        </Descriptions>
        
        <Divider />
        
        <Descriptions 
          bordered 
          column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
          title="Détails financiers"
        >
          <Descriptions.Item label="Budget">
            {media.budget ? `${media.budget} ${media.devise || ''}` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Devise">{media.devise || '-'}</Descriptions.Item>
          <Descriptions.Item label="Imputation financière">{media.imputation_financiere || '-'}</Descriptions.Item>
        </Descriptions>
        
        <Divider />
        
        <Descriptions 
          bordered 
          column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
          title="Informations de diffusion"
        >
          <Descriptions.Item label="Diffusion">{media.diffusion || '-'}</Descriptions.Item>
          <Descriptions.Item label="Zone d'impact">{media.zone_impact || '-'}</Descriptions.Item>
          <Descriptions.Item label="Nationalité">{media.nationalite?.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="Volume/Couverture">{media.volume_couverture || '-'}</Descriptions.Item>
          <Descriptions.Item label="Date début">{formatDate(media.date_debut)}</Descriptions.Item>
          <Descriptions.Item label="Date fin">{formatDate(media.date_fin)}</Descriptions.Item>
        </Descriptions>
        
        <Divider />
        
        <Descriptions 
          bordered 
          column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
          title="Public cible et audience"
        >
          <Descriptions.Item label="Cible" span={3}>{media.cible || '-'}</Descriptions.Item>
          <Descriptions.Item label="Tirage/Audience">{media.tirage_audience || '-'}</Descriptions.Item>
          <Descriptions.Item label="Composition du lectorat" span={2}>{media.composition_lectorat || '-'}</Descriptions.Item>
        </Descriptions>
        
        <Divider />
        
        <Descriptions 
          bordered 
          column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
          title="Objectifs et résultats"
        >
          <Descriptions.Item label="Objectif" span={3}>{media.objectif || '-'}</Descriptions.Item>
          <Descriptions.Item label="Résultats attendus" span={3}>{media.resultats_attendus || '-'}</Descriptions.Item>
          <Descriptions.Item label="Évaluation">{media.evaluation || '-'}</Descriptions.Item>
          <Descriptions.Item label="Reconduction">{media.reconduction || '-'}</Descriptions.Item>
          <Descriptions.Item label="Collaboration FIPA">{media.collaboration_fipa || '-'}</Descriptions.Item>
        </Descriptions>
        
        <Divider />
        
        <Descriptions 
          bordered 
          column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
          title="Contacts et responsables"
        >
          <Descriptions.Item label="Responsable bureau média">
            {media.responsable_bureau_media?.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="VAV siège média">
            {media.vav_siege_media?.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Régie publicitaire">{media.regie_publicitaire || '-'}</Descriptions.Item>
          <Descriptions.Item label="Contact média">{media.media_contact || '-'}</Descriptions.Item>
        </Descriptions>
        
        {media.commentaires_specifiques && (
          <>
            <Divider />
            <Descriptions 
              bordered 
              column={1}
              title="Commentaires additionnels"
            >
              <Descriptions.Item label="Commentaires spécifiques">
                {media.commentaires_specifiques}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </>
    );
  };

  const renderCteDetails = () => {
    const cte = action.cte;
    if (!cte) return <Empty description="Aucune information CTE disponible" />;
    
    return (
      <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
        <Descriptions.Item label="Date opération">{formatDate(cte.date_operation)}</Descriptions.Item>
        <Descriptions.Item label="Nombre participants">{cte.nombre_participants || '-'}</Descriptions.Item>
        <Descriptions.Item label="Entreprises visitées">{cte.nombre_entreprises_visitees || '-'}</Descriptions.Item>
        <Descriptions.Item label="Entreprises à visiter">{cte.nombre_entreprises_a_visiter || '-'}</Descriptions.Item>
        <Descriptions.Item label="Pays cible">{cte.pays?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="Secteur">{cte.secteur?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="Description" span={3}>{cte.description || '-'}</Descriptions.Item>
        <Descriptions.Item label="Observations" span={3}>{cte.observations || '-'}</Descriptions.Item>
      </Descriptions>
    );
  };

  const renderSalonDetails = () => {
    const salon = action.salon;
    if (!salon) return <Empty description="Aucune information de salon disponible" />;
    
    return (
      <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
        <Descriptions.Item label="Intitulé">{salon.intitule || '-'}</Descriptions.Item>
        <Descriptions.Item label="Édition">{salon.edition || '-'}</Descriptions.Item>
        <Descriptions.Item label="Organisateur">{salon.organisateur || '-'}</Descriptions.Item>
        <Descriptions.Item label="Lieu">{salon.lieu || '-'}</Descriptions.Item>
        <Descriptions.Item label="Pays">{salon.pays?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="Périodicité">{salon.periodicite || '-'}</Descriptions.Item>
        <Descriptions.Item label="Date début">{formatDate(salon.date_debut)}</Descriptions.Item>
        <Descriptions.Item label="Date fin">{formatDate(salon.date_fin)}</Descriptions.Item>
        <Descriptions.Item label="Coût location">{salon.cout_location || '-'}</Descriptions.Item>
        <Descriptions.Item label="Coût aménagement">{salon.cout_amenagement || '-'}</Descriptions.Item>
        <Descriptions.Item label="Surface en m²">{salon.surface_m2 || '-'}</Descriptions.Item>
        <Descriptions.Item label="Nombre exposants">{salon.nombre_exposants || '-'}</Descriptions.Item>
        <Descriptions.Item label="Description" span={3}>{salon.description || '-'}</Descriptions.Item>
      </Descriptions>
    );
  };

  const renderDelegationDetails = () => {
    const delegation = action.delegation;
    if (!delegation) return <Empty description="Aucune information de délégation disponible" />;
    
    return (
      <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
        <Descriptions.Item label="Pays origine">{delegation.pays?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="Secteur">{delegation.secteur?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="Nombre participants">{delegation.nombre_participants || '-'}</Descriptions.Item>
        <Descriptions.Item label="Initiateur">{delegation.initiateur?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="Responsable binôme">{delegation.responsable_binome?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="Responsable FIPA">{delegation.responsable_fipa?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="Description" span={3}>{delegation.description || '-'}</Descriptions.Item>
        <Descriptions.Item label="Programme" span={3}>{delegation.programme || '-'}</Descriptions.Item>
        {delegation.liste_membres_pdf && (
          <Descriptions.Item label="Liste des membres" span={3}>
            <Button type="link" icon={<FileTextOutlined />} href={delegation.liste_membres_pdf}>
              Télécharger la liste
            </Button>
          </Descriptions.Item>
        )}
      </Descriptions>
    );
  };

  const renderSeminaireDetails = () => {
    const seminaire = action.seminaire_jipays;
    if (!seminaire) return <Empty description="Aucune information de séminaire disponible" />;
    
    return (
      <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
        <Descriptions.Item label="Intitulé">{seminaire.intitule || '-'}</Descriptions.Item>
        <Descriptions.Item label="Pays">{seminaire.pays?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="Région">{seminaire.regions || '-'}</Descriptions.Item>
        <Descriptions.Item label="Lieu">{seminaire.lieu || '-'}</Descriptions.Item>
        <Descriptions.Item label="Date début">{formatDate(seminaire.date_debut)}</Descriptions.Item>
        <Descriptions.Item label="Date fin">{formatDate(seminaire.date_fin)}</Descriptions.Item>
        <Descriptions.Item label="Nombre participants">{seminaire.nombre_participants || '-'}</Descriptions.Item>
        <Descriptions.Item label="Initiateur">{seminaire.initiateur?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="Binôme">{seminaire.binome?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="Objectifs" span={3}>{seminaire.objectifs || '-'}</Descriptions.Item>
        <Descriptions.Item label="Programme" span={3}>{seminaire.programme || '-'}</Descriptions.Item>
      </Descriptions>
    );
  };

  const renderDemarchageDirectDetails = () => {
    const demarchage = action.demarchage_direct;
    if (!demarchage) return <Empty description="Aucune information de démarchage disponible" />;
    
    return (
      <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
        <Descriptions.Item label="Pays">{demarchage.pays?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="Région">{demarchage.regions || '-'}</Descriptions.Item>
        <Descriptions.Item label="Secteur">{demarchage.secteur?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="Date début">{formatDate(demarchage.date_debut)}</Descriptions.Item>
        <Descriptions.Item label="Date fin">{formatDate(demarchage.date_fin)}</Descriptions.Item>
        <Descriptions.Item label="Initiateur">{demarchage.initiateur?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="Binôme">{demarchage.binome?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="Nombre entreprises ciblées">{demarchage.nombre_entreprises_ciblees || '-'}</Descriptions.Item>
        <Descriptions.Item label="Nombre entreprises visitées">{demarchage.nombre_entreprises_visitees || '-'}</Descriptions.Item>
        <Descriptions.Item label="Description" span={3}>{demarchage.description || '-'}</Descriptions.Item>
        <Descriptions.Item label="Observations" span={3}>{demarchage.observations || '-'}</Descriptions.Item>
      </Descriptions>
    );
  };

  const renderSalonSectorielDetails = () => {
    const salon = action.salon_sectoriel;
    if (!salon) return <Empty description="Aucune information de salon sectoriel disponible" />;
    
    return (
      <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
        <Descriptions.Item label="Intitulé">{salon.intitule || '-'}</Descriptions.Item>
        <Descriptions.Item label="Édition">{salon.edition || '-'}</Descriptions.Item>
        <Descriptions.Item label="Secteur">{salon.secteur?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="Pays">{salon.pays?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="Lieu">{salon.lieu || '-'}</Descriptions.Item>
        <Descriptions.Item label="Organisateur">{salon.organisateur || '-'}</Descriptions.Item>
        <Descriptions.Item label="Date début">{formatDate(salon.date_debut)}</Descriptions.Item>
        <Descriptions.Item label="Date fin">{formatDate(salon.date_fin)}</Descriptions.Item>
        <Descriptions.Item label="Surface en m²">{salon.surface_m2 || '-'}</Descriptions.Item>
        <Descriptions.Item label="Coût participation">{salon.cout_participation || '-'}</Descriptions.Item>
        <Descriptions.Item label="Nombre exposants">{salon.nombre_exposants || '-'}</Descriptions.Item>
        <Descriptions.Item label="Nombre visiteurs">{salon.nombre_visiteurs || '-'}</Descriptions.Item>
        <Descriptions.Item label="Description" span={3}>{salon.description || '-'}</Descriptions.Item>
      </Descriptions>
    );
  };

  const renderSeminaireSecteurDetails = () => {
    const seminaire = action.seminaire_jisecteur;
    if (!seminaire) return <Empty description="Aucune information de séminaire secteur disponible" />;
    
    return (
      <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
        <Descriptions.Item label="Intitulé">{seminaire.intitule || '-'}</Descriptions.Item>
        <Descriptions.Item label="Secteur">{seminaire.secteur?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="Pays">{seminaire.pays?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="Région">{seminaire.regions || '-'}</Descriptions.Item>
        <Descriptions.Item label="Lieu">{seminaire.lieu || '-'}</Descriptions.Item>
        <Descriptions.Item label="Groupe">{seminaire.groupe?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="Date début">{formatDate(seminaire.date_debut)}</Descriptions.Item>
        <Descriptions.Item label="Date fin">{formatDate(seminaire.date_fin)}</Descriptions.Item>
        <Descriptions.Item label="Initiateur">{seminaire.initiateur?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="Binôme">{seminaire.binome?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="Nombre participants">{seminaire.nombre_participants || '-'}</Descriptions.Item>
        <Descriptions.Item label="Objectifs" span={3}>{seminaire.objectifs || '-'}</Descriptions.Item>
        <Descriptions.Item label="Programme" span={3}>{seminaire.programme || '-'}</Descriptions.Item>
      </Descriptions>
    );
  };

  const renderVisiteEntrepriseDetails = () => {
    const visite = action.visite_entreprise;
    if (!visite) return <Empty description="Aucune information de visite d'entreprise disponible" />;
    
    return (
      <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
        <Descriptions.Item label="Raison sociale">{visite.raison_sociale || '-'}</Descriptions.Item>
        <Descriptions.Item label="Nationalité">{visite.nationalite?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="Secteur">{visite.secteur?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="Activité">{visite.activite || '-'}</Descriptions.Item>
        <Descriptions.Item label="Responsable">{visite.responsable || '-'}</Descriptions.Item>
        <Descriptions.Item label="Fonction">{visite.fonction || '-'}</Descriptions.Item>
        <Descriptions.Item label="Adresse">{visite.adresse || '-'}</Descriptions.Item>
        <Descriptions.Item label="Téléphone">{visite.telephone || '-'}</Descriptions.Item>
        <Descriptions.Item label="Email">{visite.email || '-'}</Descriptions.Item>
        <Descriptions.Item label="Date visite">{formatDate(visite.date_visite)}</Descriptions.Item>
        <Descriptions.Item label="Date contact">{formatDate(visite.date_contact)}</Descriptions.Item>
        <Descriptions.Item label="Nombre visites">{visite.nombre_visites || '-'}</Descriptions.Item>
        <Descriptions.Item label="Entreprise importante">
          {visite.entreprise_importante ? <Tag color="green">Oui</Tag> : <Tag color="red">Non</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="Encadré avec programme">
          {visite.encadre_avec_programme ? <Tag color="green">Oui</Tag> : <Tag color="red">Non</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="Responsable suivi">{visite.responsable_suivi?.name || '-'}</Descriptions.Item>
        {visite.programme_pdf && (
          <Descriptions.Item label="Programme" span={3}>
            <Button type="link" icon={<FileTextOutlined />} href={visite.programme_pdf}>
              Télécharger le programme
            </Button>
          </Descriptions.Item>
        )}
      </Descriptions>
    );
  };

  // Rendu des invités avec bouton d'ajout
  const renderInvites = () => {
    const columns = [
      {
        title: 'Nom',
        dataIndex: 'nom',
        key: 'nom',
        render: (text, record) => (
          <Space>
            <Avatar icon={<UserOutlined />} />
            <Text>{text} {record.prenom}</Text>
          </Space>
        ),
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        render: email => (
          <Space>
            <MailOutlined />
            <a href={`mailto:${email}`}>{email}</a>
          </Space>
        ),
      },
      {
        title: 'Téléphone',
        dataIndex: 'telephone',
        key: 'telephone',
        render: tel => tel ? (
          <Space>
            <PhoneOutlined />
            <span>{tel}</span>
          </Space>
        ) : '-',
      },
      {
        title: 'Statut',
        dataIndex: 'statut',
        key: 'statut',
        render: statut => {
          const statusMap = {
            'confirmee': { color: 'green', text: 'Confirmé', icon: <CheckCircleOutlined /> },
            'en_attente': { color: 'gold', text: 'En attente', icon: <ClockCircleOutlined /> },
            'refusee': { color: 'red', text: 'Décliné', icon: <CloseCircleOutlined /> },
            'participee': { color: 'blue', text: 'Participé', icon: <CheckCircleOutlined /> }
          };
          
          const { color, text, icon } = statusMap[statut] || { color: 'default', text: statut, icon: <InfoCircleOutlined /> };
          
          return (
            <Tag color={color} icon={icon}>
              {text}
            </Tag>
          );
        },
      },
      {
        title: 'Date invitation',
        dataIndex: 'created_at',
        key: 'created_at',
        render: date => formatDateTime(date),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Link to={`/invites/${record.id}`}>
              <Button type="link" icon={<FileTextOutlined />}>Voir</Button>
            </Link>
          </Space>
        ),
      }
    ];

    return (
      <>
        <div style={{ marginBottom: 16, textAlign: 'right' }}>
          <Button 
            type="primary" 
            icon={<UserAddOutlined />}
            onClick={openAddInviteModal}
          >
            Ajouter un invité
          </Button>
        </div>
        
        {!action || !action.invites || action.invites.length === 0 ? (
          <Empty description="Aucun invité pour cette action" />
        ) : (
          <Table 
            dataSource={action.invites.map(invite => ({ ...invite, key: invite.id }))}
            columns={columns}
            pagination={false}
            size="middle"
            className="invites-table"
          />
        )}
      </>
    );
  };

  // Rendu des étapes si disponibles
  const renderEtapes = () => {
    if (!action || !action.etapes || action.etapes.length === 0) {
      return <Empty description="Aucune étape définie pour cette action" />;
    }
    
    return (
      <Timeline mode="left">
        {action.etapes.map((etape, index) => (
          <Timeline.Item 
            key={etape.id || index}
            color={etape.complete ? 'green' : 'blue'}
            label={formatDate(etape.date_echeance)}
          >
            <div className="timeline-item">
              <Title level={5}>{etape.titre}</Title>
              <Paragraph>{etape.description}</Paragraph>
              <div className="timeline-footer">
                <Tag color={etape.complete ? 'green' : 'processing'}>
                  {etape.complete ? 'Terminé' : 'En cours'}
                </Tag>
                {etape.responsable && (
                  <Text type="secondary">
                    <UserOutlined /> {etape.responsable.name}
                  </Text>
                )}
              </div>
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    );
  };

  // Si chargement
  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <p>Chargement des détails de l'action...</p>
      </div>
    );
  }

  // Si pas d'action trouvée
  if (!action) {
    return (
      <div className="action-not-found">
        <Result
          status="404"
          title="Action non trouvée"
          subTitle="L'action que vous recherchez n'existe pas ou a été supprimée."
          extra={
            <Button type="primary" icon={<ArrowLeftOutlined />}>
              <Link to="/actions">Retour à la liste</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="action-detail-container">
      {/* En-tête avec fil d'Ariane et boutons d'action */}
      <div className="action-detail-header">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/">Tableau de bord</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/actions">Actions</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{action.nom}</Breadcrumb.Item>
        </Breadcrumb>
        
        <div className="action-buttons">
          <Space>
            <Link to="/actions">
              <Button icon={<ArrowLeftOutlined />}>
                Retour
              </Button>
            </Link>
            <Link to={`/actions/edit/${action.id}`}>
              <Button type="primary" icon={<EditOutlined />}>
                Modifier
              </Button>
            </Link>
            <Button 
              danger 
              icon={<DeleteOutlined />}
              onClick={() => setDeleteModalVisible(true)}
            >
              Supprimer
            </Button>
          </Space>
        </div>
      </div>
      
      {/* Carte principale avec le titre et le statut */}
      <Card className="action-main-card">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={16}>
            <div className="action-title">
              <Space align="start">
                <div className="action-type-icon">
                  {getTypeIcon(action.type)}
                </div>
                <div>
                  <Title level={2}>{action.nom}</Title>
                  <Space size="large">
                    <Tag color="#004165">
                      {formatType(action.type)}
                    </Tag>
                    <Tag color={getStatusColor(action.statut)}>
                      {action.statut === 'planifiee' ? 'Planifiée' : 
                       action.statut === 'terminee' ? 'Terminée' : 
                       action.statut === 'annulee' ? 'Annulée' : 
                       action.statut === 'reportee' ? 'Reportée' : action.statut}
                    </Tag>
                    {getTimingBadge(action.timing)}
                  </Space>
                </div>
              </Space>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="action-stats">
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic 
                    title="Invités" 
                    value={action.invites_count || 0}
                    prefix={<TeamOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="Confirmés" 
                    value={action.invites_confirmes_count || 0}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Card>
      
      {/* Description et détails généraux */}
      <Card className="action-detail-card" title={
        <Space>
          <InfoCircleOutlined />
          <span>Informations générales</span>
        </Space>
      }>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={16}>
            {action.description && (
              <div className="action-description">
                <Paragraph>{action.description}</Paragraph>
              </div>
            )}
            <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}>
              <Descriptions.Item label={<Space><CalendarOutlined /> Date début</Space>}>
                {formatDate(action.date_debut)}
              </Descriptions.Item>
              <Descriptions.Item label={<Space><CalendarOutlined /> Date fin</Space>}>
                {formatDate(action.date_fin) || '-'}
              </Descriptions.Item>
              <Descriptions.Item label={<Space><UserOutlined /> Responsable</Space>}>
                {action.responsable ? action.responsable.name : '-'}
              </Descriptions.Item>
              <Descriptions.Item label={<Space><EnvironmentOutlined /> Lieu</Space>}>
                {action.lieu || '-'}
              </Descriptions.Item>
              <Descriptions.Item label={<Space><EnvironmentOutlined /> Ville</Space>}>
                {action.ville || '-'}
              </Descriptions.Item>
              <Descriptions.Item label={<Space><GlobalOutlined /> Pays</Space>}>
                {action.pays || '-'}
              </Descriptions.Item>
              {action.notes_internes && (
                <Descriptions.Item label="Notes internes" span={3}>
                  {action.notes_internes}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Créé le">
                {formatDateTime(action.created_at)}
              </Descriptions.Item>
              <Descriptions.Item label="Dernière mise à jour">
                {formatDateTime(action.updated_at)}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          
          <Col xs={24} md={8}>
            <div className="action-sidebar">
              <Card className="action-dates-card" size="small" title={
                <Space>
                  <CalendarOutlined />
                  <span>Calendrier</span>
                </Space>
              }>
                <div className="date-display">
                  <div className="date-range">
                    <div className="date-item">
                      <div className="date-label">Début</div>
                      <div className="date-value">
                        {formatDate(action.date_debut)}
                      </div>
                    </div>
                    
                    {action.date_fin && (
                      <>
                        <div className="date-separator">→</div>
                        <div className="date-item">
                          <div className="date-label">Fin</div>
                          <div className="date-value">
                            {formatDate(action.date_fin)}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="date-duration">
                    {action.date_fin ? 
                      `${moment(action.date_fin).diff(moment(action.date_debut), 'days') + 1} jour(s)` : 
                      '1 jour'}
                  </div>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </Card>
      
      {/* Détails spécifiques au type */}
      <Card className="action-detail-card" title={
        <Space>
          <ProfileOutlined />
          <span>Détails spécifiques ({formatType(action.type)})</span>
        </Space>
      }>
        {renderTypeSpecificDetails()}
      </Card>
      
      {/* Onglets pour les entités liées */}
      <Card className="action-detail-card">
        <Tabs defaultActiveKey="1">
          <TabPane 
            tab={<Space><TeamOutlined /> Invités ({action.invites_count || 0})</Space>} 
            key="1"
          >
            {renderInvites()}
          </TabPane>
          <TabPane 
            tab={<Space><ProfileOutlined /> Étapes</Space>} 
            key="2"
          >
            {renderEtapes()}
          </TabPane>
        </Tabs>
      </Card>
      
      {/* Modal de confirmation de suppression */}
      <Modal
        title="Confirmer la suppression"
        visible={deleteModalVisible}
        onOk={handleDeleteAction}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Oui, supprimer"
        cancelText="Annuler"
        okButtonProps={{ danger: true }}
      >
        <p>Êtes-vous sûr de vouloir supprimer cette action ?</p>
        <p>Cette opération est irréversible et supprimera également toutes les données associées.</p>
      </Modal>

      {/* Modal pour ajouter un invité avec les champs obligatoires */}
      <Modal
        title="Ajouter un invité"
        visible={addInviteModalVisible}
        onCancel={() => setAddInviteModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setAddInviteModalVisible(false)}>
            Annuler
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={handleAddInvite}
            loading={loadingDependencies}
            disabled={loadingDependencies}
          >
            Ajouter
          </Button>,
        ]}
        width={700}
      >
        {loadingDependencies ? (
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <Spin size="large" />
            <p>Chargement des données...</p>
          </div>
        ) : (
          <Form
            form={inviteForm}
            layout="vertical"
            initialValues={{ 
              type_invite: 'externe', 
              statut: 'en_attente',
              action_id: id,
              proprietaire_id: currentUser?.id // Initialisation avec l'utilisateur courant
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="nom"
                  label="Nom"
                  rules={[{ required: true, message: 'Veuillez entrer le nom' }]}
                >
                  <Input placeholder="Nom" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="prenom"
                  label="Prénom"
                  rules={[{ required: true, message: 'Veuillez entrer le prénom' }]}
                >
                  <Input placeholder="Prénom" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Veuillez entrer l\'email' },
                    { type: 'email', message: 'Email invalide' }
                  ]}
                >
                  <Input placeholder="Email" prefix={<MailOutlined />} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="telephone" label="Téléphone">
                  <Input placeholder="Téléphone" prefix={<PhoneOutlined />} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="entreprise_id"
                  label="Entreprise"
                  rules={[{ required: true, message: 'L\'entreprise est obligatoire' }]}
                >
                  <Select 
                    placeholder="Sélectionner une entreprise" 
                    showSearch
                    loading={entreprisesLoading}
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    notFoundContent={entreprisesLoading ? <Spin size="small" /> : <Empty description="Aucune entreprise trouvée" />}
                  >
                    {Array.isArray(entreprises?.data) 
                      ? entreprises.data.map(entreprise => (
                          <Option key={entreprise.id} value={entreprise.id}>{entreprise.nom || entreprise.name}</Option>
                        ))
                      : Array.isArray(entreprises) 
                        ? entreprises.map(entreprise => (
                            <Option key={entreprise.id} value={entreprise.id}>{entreprise.nom || entreprise.name}</Option>
                          ))
                        : null
                    }
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="etape_id"
                  label="Étape"
                  rules={[{ required: true, message: 'L\'étape est obligatoire' }]}
                >
                  <Select 
                    placeholder="Sélectionner une étape"
                    loading={etapesLoading}
                    notFoundContent={etapesLoading ? <Spin size="small" /> : <Empty description="Aucune étape trouvée" />}
                  >
                    {Array.isArray(etapes) && etapes.map(etape => (
                      <Option key={etape.id} value={etape.id}>{etape.nom}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                {/* Champ caché pour l'ID du propriétaire */}
                <Form.Item
                  name="proprietaire_id"
                  hidden
                >
                  <Input type="hidden" />
                </Form.Item>
                
                {/* Champ informatif pour afficher le nom de l'utilisateur courant */}
                <Form.Item label="Propriétaire">
                  <Input 
                    value={currentUser?.name || "Vous"} 
                    disabled 
                    prefix={<UserOutlined />} 
                    style={{ color: "#555", cursor: "default" }} 
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="fonction" label="Fonction">
                  <Input placeholder="Fonction" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="type_invite" label="Type d'invité">
                  <Radio.Group>
                    <Radio value="externe">Externe</Radio>
                    <Radio value="interne">Interne</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="statut" label="Statut">
                  <Select placeholder="Sélectionner un statut">
                    <Option value="en_attente">En attente</Option>
                    <Option value="confirmee">Confirmé</Option>
                    <Option value="refusee">Refusé</Option>
                    <Option value="participee">Participé</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="commentaires" label="Commentaires">
              <TextArea rows={4} placeholder="Commentaires" />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default ActionDetail;