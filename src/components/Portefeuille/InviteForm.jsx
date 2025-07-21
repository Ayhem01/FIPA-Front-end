import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  DatePicker,
  Space,
  message,
  Spin,
  Row,
  Col
} from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import {
  createInvite,
  updateInvite,
  getInviteById,
  resetOperation,
  fetchEntreprises,
  fetchActions,
  fetchEtapesByAction
} from '../../features/inviteSlice';
import { getCurrentUser } from '../../features/userSlice'; // Assure-toi que cette action existe
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;

const InviteForm = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

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

  // Charger l'invité en mode édition
  useEffect(() => {
    if (id) {
      dispatch(getInviteById(id));
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
        etape_id: invite.etape_id,
        statut: invite.statut,
        suivi_requis: invite.suivi_requis,
        date_invitation: invite.date_invitation ? moment(invite.date_invitation) : null,
        date_evenement: invite.date_evenement ? moment(invite.date_evenement) : null,
        commentaires: invite.commentaires,
      });
      if (invite.action_id) {
        dispatch(fetchEtapesByAction(invite.action_id));
      }
    }
  }, [invite, form, id, dispatch]);

  // Gestion des succès/erreurs d'opération
  useEffect(() => {
    if (operation.success) {
      message.success(id ? 'Invité mis à jour avec succès' : 'Invité créé avec succès');
      setIsSubmitting(false);
      navigate('/invites');
    } else if (operation.error) {
      message.error(operation.error);
      setIsSubmitting(false);
    }
  }, [operation, navigate, id]);

  // Soumission du formulaire
  const handleSubmit = (values) => {
    setIsSubmitting(true);
    if (!user || !user.id) {
      message.error("Utilisateur non connecté !");
      setIsSubmitting(false);
      return;
    }
    const formattedValues = {
      ...values,
      date_invitation: values.date_invitation ? values.date_invitation.format('YYYY-MM-DD HH:mm:ss') : null,
      date_evenement: values.date_evenement ? values.date_evenement.format('YYYY-MM-DD HH:mm:ss') : null,
      proprietaire_id: user.id
    };
    if (id) {
      dispatch(updateInvite({ id, inviteData: formattedValues }));
    } else {
      dispatch(createInvite(formattedValues));
    }
  };

  const handleCancel = () => {
    navigate('/invites');
  };

  if (loadingUser) {
    return <Card><Spin tip="Chargement de l'utilisateur..." /></Card>;
  }

  if (id && inviteLoading) {
    return <Card><Spin tip="Chargement de l'invité..." /></Card>;
  }

  if (id && inviteError) {
    return (
      <Card>
        <div className="error-message">
          {inviteError}
          <Button type="primary" onClick={() => navigate('/invites')}>
            Retour à la liste
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={id ? "Modifier un invité" : "Ajouter un nouvel invité"}
      extra={
        <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
          Retour
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          statut: 'en_attente',
          type_invite: 'externe',
          suivi_requis: false
        }}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="nom"
              label="Nom"
              rules={[{ required: true, message: 'Veuillez saisir le nom' }]}
            >
              <Input placeholder="Nom de l'invité" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="prenom"
              label="Prénom"
              rules={[{ required: true, message: 'Veuillez saisir le prénom' }]}
            >
              <Input placeholder="Prénom de l'invité" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="fonction"
              label="Fonction"
            >
              <Input placeholder="Fonction" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Veuillez saisir l\'email' },
                { type: 'email', message: 'Format d\'email invalide' }
              ]}
            >
              <Input placeholder="Email de l'invité" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="telephone"
              label="Téléphone"
            >
              <Input placeholder="Numéro de téléphone" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="type_invite"
              label="Type d'invité"
              rules={[{ required: true, message: 'Veuillez sélectionner le type' }]}
            >
              <Select>
                <Option value="interne">Interne</Option>
                <Option value="externe">Externe</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="entreprise_id"
              label="Entreprise"
              rules={[{ required: true, message: 'Veuillez sélectionner une entreprise' }]}
            >
              <Select
                placeholder="Sélectionnez une entreprise"
                loading={entreprises.loading}
                showSearch
                optionFilterProp="children"
              >
                {Array.isArray(entreprises.items) && entreprises.items.map(entreprise => (
                  <Option key={entreprise.id} value={entreprise.id}>
                    {entreprise.nom}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="action_id"
              label="Action"
              rules={[{ required: true, message: 'Veuillez sélectionner une action' }]}
            >
              <Select
                placeholder="Sélectionnez une action"
                loading={actions.loading}
                onChange={handleActionChange}
                showSearch
                optionFilterProp="children"
              >
                {Array.isArray(actions.items) && actions.items.map(action => (
                  <Option key={action.id} value={action.id}>
                    {action.nom}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="etape_id"
              label="Étape"
              rules={[{ required: true, message: 'Veuillez sélectionner une étape' }]}
            >
              <Select
                placeholder="Sélectionnez une étape"
                loading={etapes.loading}
                disabled={!Array.isArray(etapes.items) || etapes.items.length === 0}
                showSearch
                optionFilterProp="children"
              >
                {Array.isArray(etapes.items) && etapes.items.map(etape => (
                  <Option key={etape.id} value={etape.id}>
                    {etape.nom}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="statut"
              label="Statut"
              rules={[{ required: true, message: 'Veuillez sélectionner un statut' }]}
            >
              <Select placeholder="Sélectionnez un statut">
                <Option value="en_attente">En attente</Option>
                <Option value="envoyee">Envoyée</Option>
                <Option value="confirmee">Confirmée</Option>
                <Option value="refusee">Refusée</Option>
                <Option value="details_envoyes">Détails envoyés</Option>
                <Option value="participation_confirmee">Participation confirmée</Option>
                <Option value="participation_sans_suivi">Participation sans suivi</Option>
                <Option value="absente">Absente</Option>
                <Option value="aucune_reponse">Aucune réponse</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="suivi_requis"
              label="Suivi requis"
              valuePropName="checked"
            >
              <Select>
                <Option value={true}>Oui</Option>
                <Option value={false}>Non</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="date_invitation"
              label="Date d'invitation"
            >
              <DatePicker style={{ width: '100%' }} showTime />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="date_evenement"
              label="Date de l'événement"
            >
              <DatePicker style={{ width: '100%' }} showTime />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="commentaires"
          label="Commentaires"
        >
          <TextArea rows={4} placeholder="Commentaires concernant cet invité" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              icon={<SaveOutlined />}
            >
              {id ? "Mettre à jour" : "Enregistrer"}
            </Button>
            <Button onClick={handleCancel}>
              Annuler
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default InviteForm;