import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Button,
  Space,
  Spin,
  Tag,
  Tabs,
  Typography,
  Modal,
  message,
  Divider
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { 
  getInviteById, 
  deleteInvite, 
  updateInviteStatus,
  resetOperation 
} from '../../features/inviteSlice';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;

const InviteDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { 
    selectedInvite: { data: invite, loading, error },
    operation 
  } = useSelector(state => state.invites);

  // Charger les données de l'invité
  useEffect(() => {
    if (id) {
      dispatch(getInviteById(id));
    }
    
    return () => {
      dispatch(resetOperation());
    };
  }, [dispatch, id]);

  // Gérer les opérations réussies ou échouées
  useEffect(() => {
    if (operation.success && operation.type === 'delete') {
      message.success('Invité supprimé avec succès');
      navigate('/invites');
    } else if (operation.success && operation.type === 'update_status') {
      message.success('Statut mis à jour avec succès');
    } else if (operation.error) {
      message.error(operation.error);
    }
  }, [operation, navigate]);

  // Confirmation de suppression
  const showDeleteConfirm = () => {
    confirm({
      title: `Êtes-vous sûr de vouloir supprimer cet invité?`,
      icon: <ExclamationCircleOutlined />,
      content: 'Cette action est irréversible.',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk() {
        dispatch(deleteInvite(id));
      }
    });
  };

  // Modifier le statut
  const handleStatusChange = (newStatus) => {
dispatch(updateInviteStatus({ id, statut: newStatus }));  };


  const renderStatus = (statut) => {
    let color, text;
    switch (statut) {
      case 'en_attente':
        color = 'gold'; text = 'En attente'; break;
      case 'confirmee':
        color = 'green'; text = 'Confirmée'; break;
      case 'refusee':
        color = 'red'; text = 'Refusée'; break;
      case 'participation_confirmee':
        color = 'blue'; text = 'Participation confirmée'; break;
      case 'absente':
        color = 'volcano'; text = 'Absente'; break;
      default:
        color = 'default'; text = statut || 'Inconnu';
    }
    return <Tag color={color}>{text}</Tag>;
  };

  // Affichage pendant le chargement
  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" tip="Chargement des détails de l'invité..." />
        </div>
      </Card>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <Card>
        <div className="error-message">
          {error}
          <Button type="primary" onClick={() => navigate('/invites')}>
            Retour à la liste
          </Button>
        </div>
      </Card>
    );
  }

  // Affichage si l'invité n'est pas trouvé
  if (!invite) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Title level={4}>Invité non trouvé</Title>
          <Button type="primary" onClick={() => navigate('/invites')}>
            Retour à la liste
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card
  title={
    <Space>
      <UserOutlined />
      <span>Détails de l'invité: {invite.nom} {invite.prenom}</span>
    </Space>
  }
  extra={
    <Space>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/invites')}>Retour</Button>
      <Button icon={<EditOutlined />} onClick={() => navigate(`/invites/${id}/edit`)}>Modifier</Button>
      <Button danger icon={<DeleteOutlined />} onClick={showDeleteConfirm}>Supprimer</Button>
    </Space>
  }
>
  <Descriptions bordered column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
    
    <Descriptions.Item label="Nom">{invite.nom} {invite.prenom}</Descriptions.Item>
    <Descriptions.Item label="Email">
      <a href={`mailto:${invite.email}`}>
        <MailOutlined /> {invite.email}
      </a>
    </Descriptions.Item>
    <Descriptions.Item label="Téléphone">
      {invite.telephone ? (
        <a href={`tel:${invite.telephone}`}>
          <PhoneOutlined /> {invite.telephone}
        </a>
      ) : 'Non renseigné'}
    </Descriptions.Item>
    <Descriptions.Item label="Fonction">{invite.fonction || 'Non renseignée'}</Descriptions.Item>
    <Descriptions.Item label="Type">{invite.type_invite === 'interne' ? 'Interne' : 'Externe'}</Descriptions.Item>
    <Descriptions.Item label="Entreprise">{invite.entreprise?.nom || 'Non assignée'}</Descriptions.Item>
    <Descriptions.Item label="Action">{invite.action?.nom || 'Non assignée'}</Descriptions.Item>
    <Descriptions.Item label="Étape">{invite.etape?.nom || 'Non assignée'}</Descriptions.Item>
    <Descriptions.Item label="Statut">
      {renderStatus(invite.statut)}
      <Divider type="vertical" />
      <Button type="link" onClick={() => Modal.info({
        title: 'Changer le statut',
        content: (
          <Space direction="vertical" style={{ width: '100%' }}>
            {/* Adapte les valeurs selon tes statuts backend */}
            <Button block onClick={() => { handleStatusChange('en_attente'); Modal.destroyAll(); }} disabled={invite.statut === 'en_attente'}>En attente</Button>
            <Button block type="primary" onClick={() => { handleStatusChange('confirmee'); Modal.destroyAll(); }} disabled={invite.statut === 'confirmee'}>Confirmée</Button>
            <Button block danger onClick={() => { handleStatusChange('refusee'); Modal.destroyAll(); }} disabled={invite.statut === 'refusee'}>Refusée</Button>
            <Button block type="primary" onClick={() => { handleStatusChange('participation_confirmee'); Modal.destroyAll(); }} disabled={invite.statut === 'participation_confirmee'}>Participation confirmée</Button>
            <Button block danger onClick={() => { handleStatusChange('absente'); Modal.destroyAll(); }} disabled={invite.statut === 'absente'}>Absente</Button>
          </Space>
        ),
        width: 300,
      })}>Changer</Button>
    </Descriptions.Item>
    <Descriptions.Item label="Date d'invitation">{invite.date_invitation ? new Date(invite.date_invitation).toLocaleString() : 'Non définie'}</Descriptions.Item>
    <Descriptions.Item label="Date d'événement">{invite.date_evenement ? new Date(invite.date_evenement).toLocaleString() : 'Non définie'}</Descriptions.Item>
    <Descriptions.Item label="Commentaires">{invite.commentaires || ''}</Descriptions.Item>
    <Descriptions.Item label="Propriétaire">{invite.proprietaire?.name || ''}</Descriptions.Item>
    <Descriptions.Item label="Créé le">{invite.created_at ? new Date(invite.created_at).toLocaleString() : ''}</Descriptions.Item>
    <Descriptions.Item label="Mis à jour le">{invite.updated_at ? new Date(invite.updated_at).toLocaleString() : ''}</Descriptions.Item>
  </Descriptions>

  {invite.commentaires && (
    <Card title={<><FileTextOutlined /> Commentaires</>} style={{ marginTop: 20 }} type="inner">
      <Typography.Paragraph>{invite.commentaires}</Typography.Paragraph>
    </Card>
  )}
</Card>

      <Card style={{ marginTop: 16 }}>
        <Tabs defaultActiveKey="history">
          <TabPane tab="Historique des statuts" key="history">
            <div style={{ padding: '10px 0' }}>
              <Text type="secondary">
                L'historique des changements de statut sera affiché ici.
              </Text>
            </div>
          </TabPane>
          <TabPane tab="Communications" key="communications">
            <div style={{ padding: '10px 0' }}>
              <Text type="secondary">
                Les communications avec cet invité seront affichées ici.
              </Text>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </>
  );
};

export default InviteDetails;