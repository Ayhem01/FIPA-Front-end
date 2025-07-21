import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table, Button, Space, Popconfirm, message, Card, Modal, Tabs,
  Form, Input, DatePicker, InputNumber, Select, Checkbox, Divider
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import {
  fetchSalonsSectoriels, addSalonSectoriel, updateSalonSectoriel, deleteSalonSectoriel,
  getSalonSectorielById, fetchPays, fetchGroupes, fetchSecteurs, fetchBinomes, fetchInitiateurs
} from "../../../features/marketingSlice";

// Définir l'URL de l'API backend
const BACKEND_URL = 'http://localhost:8000';

const { TabPane } = Tabs;
const { TextArea } = Input;

const SalonsSectoriels = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Sélection des données depuis le Redux store
  const { items: salonsSectoriels = [], loading = false, error = null } = useSelector(
    (state) => state.marketing.salonsSectoriels || {}
  );

  const { items: pays = [] } = useSelector((state) => state.marketing.pays || {});
  const { items: secteurs = [] } = useSelector((state) => state.marketing.secteurs || {});
  const { items: groupes = [] } = useSelector((state) => state.marketing.groupes || {});
  const { items: initiateurs = [] } = useSelector((state) => state.marketing.initiateurs || {});
  const { items: binomes = [] } = useSelector((state) => state.marketing.binomes || {});

  // Récupération des données au chargement du composant
  useEffect(() => {
    dispatch(fetchSalonsSectoriels());
    dispatch(fetchPays());
    dispatch(fetchSecteurs());
    dispatch(fetchGroupes());
    dispatch(fetchInitiateurs());
    dispatch(fetchBinomes());
  }, [dispatch]);

  // Gestion des erreurs
  useEffect(() => {
    if (error) {
      message.error(error.message || "Une erreur s'est produite");
    }
  }, [error]);

  // Options pour les selects
  const categorieOptions = [
    { label: "Incontournable", value: "incontournable" },
    { label: "Prospection simple", value: "Prospection simple" },
    { label: "Nouveau à prospecter", value: "Nouveau à prospecter" }
  ];

  const presenceConjointeOptions = [
    { label: "Conjointe", value: "conjointe" },
    { label: "Non Conjointe", value: "non conjointe" }
  ];

  const inclureOptions = [
    { label: "Comptabiliser", value: "comptabiliser" },
    { label: "Non comptabiliser", value: "non comptabiliser" }
  ];

  // Gestion des actions CRUD
  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({
      proposee: false,
      programmee: false,
      non_programmee: false,
      validee: false,
      realisee: false,
      reportee: false,
      annulee: false,
      objectif_contacts: false,
      objectif_veille_concurrentielle: false,
      objectif_veille_technologique: false,
      objectif_relation_relais: false,
      inclure: 'comptabiliser',
      contacts_realises: 0,
      contacts_total: 0
    });
    setModalVisible(true);
  };

  const handleEdit = async (id) => {
    setEditingId(id);
    try {
      const response = await dispatch(getSalonSectorielById(id)).unwrap();
      const salonData = response.data || response;

      // Format dates for DatePicker and ensure IDs are strings
      const formattedData = {
        ...salonData,
        // Convertir explicitement en string les IDs pour s'assurer de la cohérence
        pays_id: salonData.pays_id ? String(salonData.pays_id) : undefined,
        secteur_id: salonData.secteur_id ? String(salonData.secteur_id) : undefined,
        groupe_id: salonData.groupe_id ? String(salonData.groupe_id) : undefined,
        initiateur_id: salonData.initiateur_id ? String(salonData.initiateur_id) : undefined,
        binome_id: salonData.binome_id ? String(salonData.binome_id) : undefined,
        date_debut: salonData.date_debut ? moment(salonData.date_debut) : null,
        date_fin: salonData.date_fin ? moment(salonData.date_fin) : null,
        date_butoir: salonData.date_butoir ? moment(salonData.date_butoir) : null
      };

      form.setFieldsValue(formattedData);
      setModalVisible(true);
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      message.error("Erreur lors du chargement des données");
    }
  };

  const handleView = async (id) => {
    try {
      const response = await dispatch(getSalonSectorielById(id)).unwrap();
      const item = response.data || response;
      setSelectedItem(item);
      setViewModalVisible(true);
    } catch (err) {
      message.error("Erreur lors du chargement des détails");
      console.error(err);
    }
  };

  const handleDelete = (id) => {
    dispatch(deleteSalonSectoriel(id))
      .unwrap()
      .then(() => {
        message.success("Salon sectoriel supprimé avec succès");
      })
      .catch(() => {
        message.error("Erreur lors de la suppression du salon sectoriel");
      });
  };

  // Fonction pour déboguer les valeurs du formulaire
  const logFormValues = (values) => {
    console.log("Valeurs du formulaire avant soumission:", values);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Débogage des valeurs du formulaire
      logFormValues(values);

      // Vérification des champs requis
      if (!values.pays_id) {
        message.error("Le pays est requis");
        return;
      }

      if (!values.secteur_id) {
        message.error("Le secteur est requis");
        return;
      }

      if (!values.groupe_id) {
        message.error("Le groupe est requis");
        return;
      }

      if (!values.initiateur_id) {
        message.error("L'initiateur est requis");
        return;
      }

      if (!values.binome_id) {
        message.error("Le binôme est requis");
        return;
      }

      // Formatter les dates pour l'API
      if (values.date_debut) {
        values.date_debut = values.date_debut.format('YYYY-MM-DD');
      }
      if (values.date_fin) {
        values.date_fin = values.date_fin.format('YYYY-MM-DD');
      }
      if (values.date_butoir) {
        values.date_butoir = values.date_butoir.format('YYYY-MM-DD');
      }

      // Convertir les IDs en chaînes de caractères
      values.pays_id = String(values.pays_id);
      values.secteur_id = String(values.secteur_id);
      values.groupe_id = String(values.groupe_id);
      values.initiateur_id = String(values.initiateur_id);
      values.binome_id = String(values.binome_id);

      // Gérer les champs booléens
      const booleanFields = [
        'proposee', 'programmee', 'non_programmee', 'validee',
        'realisee', 'reportee', 'annulee',
        'objectif_contacts', 'objectif_veille_concurrentielle',
        'objectif_veille_technologique', 'objectif_relation_relais'
      ];

      // Définir les valeurs par défaut pour les champs booléens
      booleanFields.forEach(field => {
        values[field] = values[field] === true ? 1 : 0;
      });

      // Calculer le total des contacts si les deux champs sont renseignés
      if (values.contacts_initiateur !== undefined && values.contacts_binome !== undefined) {
        values.contacts_total = 
          (parseInt(values.contacts_initiateur) || 0) + 
          (parseInt(values.contacts_binome) || 0);
      }

      if (editingId) {
        // Mise à jour d'un salon existant
        await dispatch(updateSalonSectoriel({ id: editingId, data: values })).unwrap();
        message.success("Salon sectoriel mis à jour avec succès");
      } else {
        // Ajout d'un nouveau salon
        await dispatch(addSalonSectoriel(values)).unwrap();
        message.success("Salon sectoriel ajouté avec succès");
      }

      setModalVisible(false);
      // Rafraîchir la liste après ajout/modification
      setTimeout(() => {
        dispatch(fetchSalonsSectoriels());
      }, 500);
    } catch (error) {
      console.error("Erreur de validation ou de soumission:", error);

      if (error.response && error.response.data) {
        console.error("Détails de l'erreur:", error.response.data);
        if (error.response.data.errors) {
          const errorMessages = Object.values(error.response.data.errors)
            .flat()
            .join(', ');
          message.error(`Erreurs de validation: ${errorMessages}`);
        } else {
          message.error(error.response.data.message || "Une erreur s'est produite");
        }
      } else {
        message.error(error.message || "Une erreur s'est produite");
      }
    }
  };

  // Helper pour afficher le statut
  const renderStatus = (record) => {
    if (record.proposee) return 'Proposée';
    if (record.programmee) return 'Programmée';
    if (record.non_programmee) return 'Non programmée';
    if (record.validee) return 'Validée';
    if (record.realisee) return 'Réalisée';
    if (record.reportee) return 'Reportée';
    if (record.annulee) return 'Annulée';
    return 'N/A';
  };

  // Colonnes de la table
  const columns = [
    {
      title: 'Intitulé',
      dataIndex: 'intitule',
      key: 'intitule',
      width: 250,
      ellipsis: true,
    },
    {
      title: 'Édition',
      dataIndex: 'numero_edition',
      key: 'numero_edition',
      width: 120,
    },
    {
      title: 'Pays',
      dataIndex: 'pays_id',
      key: 'pays',
      render: (pays_id) => {
        const paysItem = pays?.find(item => String(item.id) === String(pays_id));
        return paysItem ? paysItem.name_pays : 'N/A';
      }
    },
    {
      title: 'Secteur',
      dataIndex: 'secteur_id',
      key: 'secteur',
      render: (secteur_id) => {
        const secteurItem = secteurs?.find(item => String(item.id) === String(secteur_id));
        return secteurItem ? secteurItem.name : 'N/A';
      }
    },
    {
      title: 'Date début',
      dataIndex: 'date_debut',
      key: 'date_debut',
      render: (date) => date ? moment(date).format('DD/MM/YYYY') : 'N/A',
    },
    {
      title: 'Organisateur',
      dataIndex: 'organisateur',
      key: 'organisateur',
      ellipsis: true,
    },
    {
      title: 'Statut',
      key: 'status',
      render: renderStatus
    },
    {
      title: 'Actions',
      key: 'operations',
      render: (_, record) => (
        <Space size="small">
          <Button icon={<EyeOutlined />} onClick={() => handleView(record.id)} />
          <Button icon={<EditOutlined />} type="primary" onClick={() => handleEdit(record.id)} />
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce salon sectoriel?"
            onConfirm={() => handleDelete(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    }
  ];

  return (
    <div className="marketing-container">
      <div className="list-header">
        <Space>
          <h3 className="page-title">Gestion des Salons Sectoriels</h3>
        </Space>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Ajouter
          </Button>
        </Space>
      </div>

      <Card className="crud-table">
        <Table
          columns={columns}
          dataSource={salonsSectoriels}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal pour ajouter/modifier */}
      <Modal
        title={editingId ? "Modifier un salon sectoriel" : "Ajouter un salon sectoriel"}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Annuler
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<SaveOutlined />}
            loading={loading}
            onClick={handleSubmit}
          >
            Enregistrer
          </Button>
        ]}
      >
        <Form form={form} layout="vertical">
          <Tabs defaultActiveKey="1">
            <TabPane tab="Informations générales" key="1">
              <Form.Item
                name="intitule"
                label="Intitulé"
                rules={[{ required: true, message: "L'intitulé est requis" }]}
              >
                <Input placeholder="Intitulé du salon" />
              </Form.Item>

              <div className="form-row">
                <Form.Item
                  name="numero_edition"
                  label="Numéro d'édition"
                  className="form-col"
                >
                  <Input placeholder="Numéro d'édition" />
                </Form.Item>

                <Form.Item
                  name="organisateur"
                  label="Organisateur"
                  className="form-col"
                >
                  <Input placeholder="Organisateur du salon" />
                </Form.Item>
              </div>

              <div className="form-row">
                <Form.Item
                  name="pays_id"
                  label="Pays"
                  rules={[{ required: true, message: "Le pays est requis" }]}
                  className="form-col"
                >
                  <Select
                    placeholder="Sélectionnez le pays"
                    showSearch
                    optionFilterProp="children"
                  >
                    {pays?.map(item => (
                      <Select.Option key={item.id} value={String(item.id)}>
                        {item.name_pays}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="region"
                  label="Région"
                  className="form-col"
                >
                  <Input placeholder="Région" />
                </Form.Item>
              </div>

              <div className="form-row">
                <Form.Item
                  name="secteur_id"
                  label="Secteur"
                  rules={[{ required: true, message: "Le secteur est requis" }]}
                  className="form-col"
                >
                  <Select
                    placeholder="Sélectionnez le secteur"
                    showSearch
                    optionFilterProp="children"
                  >
                    {secteurs?.map(item => (
                      <Select.Option key={item.id} value={String(item.id)}>
                        {item.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="groupe_id"
                  label="Groupe"
                  rules={[{ required: true, message: "Le groupe est requis" }]}
                  className="form-col"
                >
                  <Select
                    placeholder="Sélectionnez le groupe"
                    showSearch
                    optionFilterProp="children"
                  >
                    {groupes?.map(item => (
                      <Select.Option key={item.id} value={String(item.id)}>
                        {item.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <div className="form-row">
                <Form.Item
                  name="initiateur_id"
                  label="Initiateur"
                  rules={[{ required: true, message: "L'initiateur est requis" }]}
                  className="form-col"
                >
                  <Select
                    placeholder="Sélectionnez l'initiateur"
                    showSearch
                    optionFilterProp="children"
                  >
                    {initiateurs?.map(item => (
                      <Select.Option key={item.id} value={String(item.id)}>
                        {item.nom}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="binome_id"
                  label="Binôme"
                  rules={[{ required: true, message: "Le binôme est requis" }]}
                  className="form-col"
                >
                  <Select
                    placeholder="Sélectionnez le binôme"
                    showSearch
                    optionFilterProp="children"
                  >
                    {binomes?.map(item => (
                      <Select.Option key={item.id} value={String(item.id)}>
                        {item.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <div className="form-row">
                <Form.Item
                  name="theme"
                  label="Thème"
                  className="form-col"
                >
                  <Input placeholder="Thème du salon" />
                </Form.Item>

                <Form.Item
                  name="site_web"
                  label="Site web"
                  className="form-col"
                >
                  <Input placeholder="Site web du salon" />
                </Form.Item>
              </div>

              <div className="form-row">
                <Form.Item
                  name="categorie"
                  label="Catégorie"
                  className="form-col"
                >
                  <Select placeholder="Sélectionnez la catégorie">
                    {categorieOptions.map(option => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="convention_affaire"
                  label="Convention d'affaire"
                  className="form-col"
                >
                  <Input placeholder="Convention d'affaire" />
                </Form.Item>
              </div>

              <div className="form-row">
                <Form.Item
                  name="inclure"
                  label="Inclure"
                  className="form-col"
                >
                  <Select placeholder="Type d'inclusion">
                    {inclureOptions.map(option => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="presence_conjointe"
                  label="Présence conjointe"
                  className="form-col"
                >
                  <Select placeholder="Type de présence">
                    {presenceConjointeOptions.map(option => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <Form.Item
                name="motif"
                label="Motif"
              >
                <TextArea placeholder="Motif du salon" rows={2} />
              </Form.Item>

              <Divider orientation="left">Statut du salon</Divider>

              <div className="checkbox-group">
                <Form.Item name="proposee" valuePropName="checked">
                  <Checkbox>Proposée</Checkbox>
                </Form.Item>

                <Form.Item name="programmee" valuePropName="checked">
                  <Checkbox>Programmée</Checkbox>
                </Form.Item>

                <Form.Item name="non_programmee" valuePropName="checked">
                  <Checkbox>Non programmée</Checkbox>
                </Form.Item>

                <Form.Item name="validee" valuePropName="checked">
                  <Checkbox>Validée</Checkbox>
                </Form.Item>

                <Form.Item name="realisee" valuePropName="checked">
                  <Checkbox>Réalisée</Checkbox>
                </Form.Item>

                <Form.Item name="reportee" valuePropName="checked">
                  <Checkbox>Reportée</Checkbox>
                </Form.Item>

                <Form.Item name="annulee" valuePropName="checked">
                  <Checkbox>Annulée</Checkbox>
                </Form.Item>
              </div>
            </TabPane>

            <TabPane tab="Dates et objectifs" key="2">
              <div className="form-row">
                <Form.Item
                  name="date_debut"
                  label="Date de début"
                  rules={[{ required: true, message: "La date de début est requise" }]}
                  className="form-col"
                >
                  <DatePicker placeholder="Sélectionnez la date" style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                  name="date_fin"
                  label="Date de fin"
                  dependencies={['date_debut']}
                  className="form-col"
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || !getFieldValue('date_debut') ||
                          value.isAfter(getFieldValue('date_debut')) ||
                          value.isSame(getFieldValue('date_debut'))) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('La date de fin doit être après ou égale à la date de début'));
                      },
                    }),
                  ]}
                >
                  <DatePicker placeholder="Sélectionnez la date" style={{ width: '100%' }} />
                </Form.Item>
              </div>

              <Form.Item
                name="date_butoir"
                label="Date butoir"
              >
                <DatePicker placeholder="Sélectionnez la date butoir" style={{ width: '100%' }} />
              </Form.Item>

              <Divider orientation="left">Objectifs</Divider>

              <div className="checkbox-group">
                <Form.Item name="objectif_contacts" valuePropName="checked">
                  <Checkbox>Contacts</Checkbox>
                </Form.Item>

                <Form.Item name="objectif_veille_concurrentielle" valuePropName="checked">
                  <Checkbox>Veille concurrentielle</Checkbox>
                </Form.Item>

                <Form.Item name="objectif_veille_technologique" valuePropName="checked">
                  <Checkbox>Veille technologique</Checkbox>
                </Form.Item>

                <Form.Item name="objectif_relation_relais" valuePropName="checked">
                  <Checkbox>Relation relais</Checkbox>
                </Form.Item>
              </div>

              <Form.Item
                name="historique_edition"
                label="Historique des éditions"
              >
                <TextArea placeholder="Historique des éditions précédentes" rows={3} />
              </Form.Item>
            </TabPane>

            <TabPane tab="Organisation et logistique" key="3">
              <Form.Item
                name="stand"
                label="Stand"
              >
                <TextArea placeholder="Informations sur le stand" rows={2} />
              </Form.Item>

              <Form.Item
                name="media"
                label="Média"
              >
                <TextArea placeholder="Informations sur les médias" rows={2} />
              </Form.Item>

              <Form.Item
                name="besoin_binome"
                label="Besoin en binôme"
              >
                <TextArea placeholder="Détails sur les besoins en binôme" rows={2} />
              </Form.Item>

              <Form.Item
                name="autre_organisme"
                label="Autre organisme"
              >
                <TextArea placeholder="Détails sur les autres organismes" rows={2} />
              </Form.Item>

              <Form.Item
                name="outils_promotionnels"
                label="Outils promotionnels"
              >
                <TextArea placeholder="Détails sur les outils promotionnels" rows={2} />
              </Form.Item>
            </TabPane>

            <TabPane tab="Budget et résultats" key="4">
              <div className="form-row">
                <Form.Item
                  name="budget_prevu"
                  label="Budget prévu"
                  className="form-col"
                >
                  <InputNumber
                    placeholder="Montant"
                    style={{ width: '100%' }}
                    min={0}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>

                <Form.Item
                  name="budget_realise"
                  label="Budget réalisé"
                  className="form-col"
                >
                  <InputNumber
                    placeholder="Montant"
                    style={{ width: '100%' }}
                    min={0}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </div>

              <Divider orientation="left">Contacts</Divider>

              <div className="form-row">
                <Form.Item
                  name="contacts_initiateur"
                  label="Contacts initiateur"
                  className="form-col"
                >
                  <InputNumber placeholder="Nombre" style={{ width: '100%' }} min={0} />
                </Form.Item>

                <Form.Item
                  name="contacts_binome"
                  label="Contacts binôme"
                  className="form-col"
                >
                  <InputNumber placeholder="Nombre" style={{ width: '100%' }} min={0} />
                </Form.Item>
              </div>

              <div className="form-row">
                <Form.Item
                  name="contacts_interessants_initiateur"
                  label="Contacts intéressants initiateur"
                  className="form-col"
                >
                  <InputNumber placeholder="Nombre" style={{ width: '100%' }} min={0} />
                </Form.Item>

                <Form.Item
                  name="contacts_interessants_binome"
                  label="Contacts intéressants binôme"
                  className="form-col"
                >
                  <InputNumber placeholder="Nombre" style={{ width: '100%' }} min={0} />
                </Form.Item>
              </div>

              <Form.Item
                name="contacts_realises"
                label="Contacts réalisés"
              >
                <InputNumber placeholder="Nombre" style={{ width: '100%' }} min={0} />
              </Form.Item>

              <Divider orientation="left">Résultats et évaluation</Divider>

              <Form.Item
                name="resultat_veille_concurrentielle"
                label="Résultat veille concurrentielle"
              >
                <TextArea placeholder="Résultats de la veille concurrentielle" rows={2} />
              </Form.Item>

              <Form.Item
                name="resultat_veille_technologique"
                label="Résultat veille technologique"
              >
                <TextArea placeholder="Résultats de la veille technologique" rows={2} />
              </Form.Item>

              <Form.Item
                name="relation_institutions"
                label="Relation avec les institutions"
              >
                <TextArea placeholder="Détails sur les relations avec les institutions" rows={2} />
              </Form.Item>

              <Form.Item
                name="evaluation_recommandations"
                label="Évaluation et recommandations"
              >
                <TextArea placeholder="Évaluation générale et recommandations" rows={3} />
              </Form.Item>
            </TabPane>
          </Tabs>
        </Form>
      </Modal>

      {/* Modal pour visualiser */}
      <Modal
        title="Détails du salon sectoriel"
        visible={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" type="primary" onClick={() => setViewModalVisible(false)}>
            Fermer
          </Button>
        ]}
      >
        {selectedItem && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Informations générales" key="1">
              <div className="detail-item">
                <h4>Intitulé:</h4>
                <p>{selectedItem.intitule || 'Non spécifié'}</p>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Numéro d'édition:</h4>
                  <p>{selectedItem.numero_edition || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Organisateur:</h4>
                  <p>{selectedItem.organisateur || 'Non spécifié'}</p>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Pays:</h4>
                  <p>{pays?.find(item => String(item.id) === String(selectedItem.pays_id))?.name_pays || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Région:</h4>
                  <p>{selectedItem.region || 'Non spécifié'}</p>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Secteur:</h4>
                  <p>{secteurs?.find(item => String(item.id) === String(selectedItem.secteur_id))?.name || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Groupe:</h4>
                  <p>{groupes?.find(item => String(item.id) === String(selectedItem.groupe_id))?.name || 'Non spécifié'}</p>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Initiateur:</h4>
                  <p>{initiateurs?.find(item => String(item.id) === String(selectedItem.initiateur_id))?.nom || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Binôme:</h4>
                  <p>{binomes?.find(item => String(item.id) === String(selectedItem.binome_id))?.name || 'Non spécifié'}</p>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Thème:</h4>
                  <p>{selectedItem.theme || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Site web:</h4>
                  <p>
                    {selectedItem.site_web ? (
                      <a href={selectedItem.site_web} target="_blank" rel="noopener noreferrer">
                        {selectedItem.site_web}
                      </a>
                    ) : 'Non spécifié'}
                  </p>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Catégorie:</h4>
                  <p>{selectedItem.categorie || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Convention d'affaire:</h4>
                  <p>{selectedItem.convention_affaire || 'Non spécifié'}</p>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Inclure:</h4>
                  <p>{selectedItem.inclure || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Présence conjointe:</h4>
                  <p>{selectedItem.presence_conjointe || 'Non spécifié'}</p>
                </div>
              </div>

              <div className="detail-item">
                <h4>Motif:</h4>
                <p>{selectedItem.motif || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Statut:</h4>
                <ul className="status-list">
                  {selectedItem.proposee && <li>Proposée</li>}
                  {selectedItem.programmee && <li>Programmée</li>}
                  {selectedItem.non_programmee && <li>Non programmée</li>}
                  {selectedItem.validee && <li>Validée</li>}
                  {selectedItem.realisee && <li>Réalisée</li>}
                  {selectedItem.reportee && <li>Reportée</li>}
                  {selectedItem.annulee && <li>Annulée</li>}
                  {!selectedItem.proposee && !selectedItem.programmee &&
                    !selectedItem.non_programmee && !selectedItem.validee &&
                    !selectedItem.realisee && !selectedItem.reportee &&
                    !selectedItem.annulee && <li>Aucun statut défini</li>}
                </ul>
              </div>
            </TabPane>

            <TabPane tab="Dates et objectifs" key="2">
              <div className="detail-row">
                <div className="detail-item">
                  <h4>Date de début:</h4>
                  <p>{selectedItem.date_debut ? moment(selectedItem.date_debut).format('DD/MM/YYYY') : 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Date de fin:</h4>
                  <p>{selectedItem.date_fin ? moment(selectedItem.date_fin).format('DD/MM/YYYY') : 'Non spécifié'}</p>
                </div>
              </div>

              <div className="detail-item">
                <h4>Date butoir:</h4>
                <p>{selectedItem.date_butoir ? moment(selectedItem.date_butoir).format('DD/MM/YYYY') : 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Objectifs:</h4>
                <ul className="objective-list">
                  {selectedItem.objectif_contacts && <li>Contacts</li>}
                  {selectedItem.objectif_veille_concurrentielle && <li>Veille concurrentielle</li>}
                  {selectedItem.objectif_veille_technologique && <li>Veille technologique</li>}
                  {selectedItem.objectif_relation_relais && <li>Relation relais</li>}
                  {!selectedItem.objectif_contacts && !selectedItem.objectif_veille_concurrentielle &&
                    !selectedItem.objectif_veille_technologique && !selectedItem.objectif_relation_relais &&
                    <li>Aucun objectif défini</li>}
                </ul>
              </div>

              <div className="detail-item">
                <h4>Historique des éditions:</h4>
                <p>{selectedItem.historique_edition || 'Non spécifié'}</p>
              </div>
            </TabPane>

            <TabPane tab="Organisation et logistique" key="3">
              <div className="detail-item">
                <h4>Stand:</h4>
                <p>{selectedItem.stand || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Média:</h4>
                <p>{selectedItem.media || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Besoin en binôme:</h4>
                <p>{selectedItem.besoin_binome || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Autre organisme:</h4>
                <p>{selectedItem.autre_organisme || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Outils promotionnels:</h4>
                <p>{selectedItem.outils_promotionnels || 'Non spécifié'}</p>
              </div>
            </TabPane>

            <TabPane tab="Budget et résultats" key="4">
              <div className="detail-row">
                <div className="detail-item">
                  <h4>Budget prévu:</h4>
                  <p>{selectedItem.budget_prevu ? selectedItem.budget_prevu : 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Budget réalisé:</h4>
                  <p>{selectedItem.budget_realise ? selectedItem.budget_realise : 'Non spécifié'}</p>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Contacts initiateur:</h4>
                  <p>{selectedItem.contacts_initiateur || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Contacts binôme:</h4>
                  <p>{selectedItem.contacts_binome || 'Non spécifié'}</p>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Contacts intéressants initiateur:</h4>
                  <p>{selectedItem.contacts_interessants_initiateur || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Contacts intéressants binôme:</h4>
                  <p>{selectedItem.contacts_interessants_binome || 'Non spécifié'}</p>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Contacts total:</h4>
                  <p>{selectedItem.contacts_total || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Contacts réalisés:</h4>
                  <p>{selectedItem.contacts_realises || 'Non spécifié'}</p>
                </div>
              </div>

              <div className="detail-item">
                <h4>Résultat veille concurrentielle:</h4>
                <p>{selectedItem.resultat_veille_concurrentielle || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Résultat veille technologique:</h4>
                <p>{selectedItem.resultat_veille_technologique || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Relation avec les institutions:</h4>
                <p>{selectedItem.relation_institutions || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Évaluation et recommandations:</h4>
                <p>{selectedItem.evaluation_recommandations || 'Non spécifié'}</p>
              </div>
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default SalonsSectoriels;