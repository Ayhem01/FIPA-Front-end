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
  fetchDemarchagesDirect, addDemarchageDirect, updateDemarchageDirect, deleteDemarchageDirect,
  getDemarchageDirectById, fetchPays, fetchSecteurs, fetchInitiateurs
} from "../../../features/marketingSlice";

// Définir l'URL de l'API backend
const BACKEND_URL = 'http://localhost:8000';

const { TabPane } = Tabs;
const { TextArea } = Input;

const DemarchageDirect = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Sélection des données depuis le Redux store
  const { items: demarchagesDirect = [], loading = false, error = null } = useSelector(
    (state) => state.marketing.demarchagesDirect || {}
  );

  const { items: pays = [] } = useSelector((state) => state.marketing.pays || {});
  const { items: secteurs = [] } = useSelector((state) => state.marketing.secteurs || {});
  const { items: initiateurs = [] } = useSelector((state) => state.marketing.initiateurs || {});

  // Récupération des données au chargement du composant
  useEffect(() => {
    dispatch(fetchDemarchagesDirect());
    dispatch(fetchPays());
    dispatch(fetchSecteurs());
    dispatch(fetchInitiateurs());
  }, [dispatch]);

  // Gestion des erreurs
  useEffect(() => {
    if (error) {
      message.error(error.message || "Une erreur s'est produite");
    }
  }, [error]);

  // Options pour les selects
  const cadreOptions = [
    { label: "Binôme", value: "binôme" },
    { label: "Vis-à-vis du siège", value: "vis-à-vis du siège" }
  ];

  const conjointeOptions = [
    { label: "Conjointe", value: "conjointe" },
    { label: "Non Conjointe", value: "non conjointe" }
  ];

  const inclureOptions = [
    { label: "Comptabilisée", value: "comptabilisée" },
    { label: "Non comptabilisée", value: "non comptabilisée" }
  ];

  const groupeSecteurOptions = [
    { label: "Aéronautique", value: "Aéronautique" },
    { label: "Composants autos", value: "Composants autos" },
    { label: "Environnement", value: "Environnement" },
    { label: "Offshoring", value: "Offshoring" },
    { label: "Santé", value: "Santé" },
    { label: "Industrie ferroviaire", value: "Industrie ferroviaire" }
  ];

  // Gestion des actions CRUD
  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({
      proposee: false,
      programmee: false,
      realisee: false,
      reportee: false,
      annulee: false,
      inclure: 'comptabilisée'
    });
    setModalVisible(true);
  };

  const handleEdit = async (id) => {
    setEditingId(id);
    try {
      const response = await dispatch(getDemarchageDirectById(id)).unwrap();
      const demarchageData = response.data || response;

      // Format dates for DatePicker and ensure IDs are strings
      const formattedData = {
        ...demarchageData,
        // Convertir explicitement en string les IDs pour s'assurer de la cohérence
        pays_id: demarchageData.pays_id ? String(demarchageData.pays_id) : undefined,
        secteur_id: demarchageData.secteur_id ? String(demarchageData.secteur_id) : undefined,
        initiateur_id: demarchageData.initiateur_id ? String(demarchageData.initiateur_id) : undefined,
        date_debut: demarchageData.date_debut ? moment(demarchageData.date_debut) : null,
        date_fin: demarchageData.date_fin ? moment(demarchageData.date_fin) : null,
        date_butoir: demarchageData.date_butoir ? moment(demarchageData.date_butoir) : null,
        date_premier_mailing: demarchageData.date_premier_mailing ? moment(demarchageData.date_premier_mailing) : null
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
      const response = await dispatch(getDemarchageDirectById(id)).unwrap();
      const item = response.data || response;
      setSelectedItem(item);
      setViewModalVisible(true);
    } catch (err) {
      message.error("Erreur lors du chargement des détails");
      console.error(err);
    }
  };

  const handleDelete = (id) => {
    dispatch(deleteDemarchageDirect(id))
      .unwrap()
      .then(() => {
        message.success("Démarchage direct supprimé avec succès");
      })
      .catch(() => {
        message.error("Erreur lors de la suppression du démarchage direct");
      });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Vérification des champs requis
      if (!values.presentation) {
        message.error("La présentation est requise");
        return;
      }

      if (!values.date_debut) {
        message.error("La date de début est requise");
        return;
      }

      if (!values.pays_id) {
        message.error("Le pays est requis");
        return;
      }

      if (!values.secteur_id) {
        message.error("Le secteur est requis");
        return;
      }

      if (!values.initiateur_id) {
        message.error("L'initiateur est requis");
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
      if (values.date_premier_mailing) {
        values.date_premier_mailing = values.date_premier_mailing.format('YYYY-MM-DD');
      }

      // Convertir les IDs en chaînes de caractères
      values.pays_id = String(values.pays_id);
      values.secteur_id = String(values.secteur_id);
      values.initiateur_id = String(values.initiateur_id);

      // Gérer les champs booléens
      const booleanFields = [
        'proposee', 'programmee', 'realisee', 'reportee', 'annulee'
      ];

      // Définir les valeurs par défaut pour les champs booléens
      booleanFields.forEach(field => {
        values[field] = values[field] === true ? 1 : 0;
      });

      if (editingId) {
        // Mise à jour d'un démarchage existant
        await dispatch(updateDemarchageDirect({ id: editingId, data: values })).unwrap();
        message.success("Démarchage direct mis à jour avec succès");
      } else {
        // Ajout d'un nouveau démarchage
        await dispatch(addDemarchageDirect(values)).unwrap();
        message.success("Démarchage direct ajouté avec succès");
      }

      setModalVisible(false);
      // Rafraîchir la liste après ajout/modification
      setTimeout(() => {
        dispatch(fetchDemarchagesDirect());
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
    if (record.realisee) return 'Réalisée';
    if (record.reportee) return 'Reportée';
    if (record.annulee) return 'Annulée';
    return 'N/A';
  };

  // Colonnes de la table
  const columns = [
    {
      title: 'Présentation',
      dataIndex: 'presentation',
      key: 'presentation',
      width: 250,
      ellipsis: true,
      render: (text) => {
        const maxLength = 50;
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
      }
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
      title: 'Groupe Secteur',
      dataIndex: 'groupe_secteur',
      key: 'groupe_secteur',
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
            title="Êtes-vous sûr de vouloir supprimer ce démarchage direct?"
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
          <h3 className="page-title">Gestion des Démarchages Directs</h3>
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
          dataSource={demarchagesDirect}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal pour ajouter/modifier */}
      <Modal
        title={editingId ? "Modifier un démarchage direct" : "Ajouter un démarchage direct"}
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
                name="presentation"
                label="Présentation"
                rules={[{ required: true, message: "La présentation est requise" }]}
              >
                <TextArea placeholder="Présentation du démarchage direct" rows={3} />
              </Form.Item>

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
                  name="regions"
                  label="Régions"
                  className="form-col"
                >
                  <Input placeholder="Régions" />
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
              </div>

              <div className="form-row">
                <Form.Item
                  name="groupe_secteur"
                  label="Groupe secteur"
                  className="form-col"
                >
                  <Select placeholder="Sélectionnez le groupe secteur">
                    {groupeSecteurOptions.map(option => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

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
              </div>

              <div className="form-row">
                <Form.Item
                  name="coinjointe"
                  label="Conjointe"
                  className="form-col"
                >
                  <Select placeholder="Action conjointe">
                    {conjointeOptions.map(option => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="cadre_siege"
                  label="Cadre siège"
                  className="form-col"
                >
                  <Select placeholder="Cadre siège">
                    {cadreOptions.map(option => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <Divider orientation="left">Statut du démarchage</Divider>

              <div className="checkbox-group">
                <Form.Item name="proposee" valuePropName="checked">
                  <Checkbox>Proposée</Checkbox>
                </Form.Item>

                <Form.Item name="programmee" valuePropName="checked">
                  <Checkbox>Programmée</Checkbox>
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

            <TabPane tab="Dates et planification" key="2">
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

              <Form.Item
                name="date_premier_mailing"
                label="Date premier mailing"
              >
                <DatePicker placeholder="Sélectionnez la date du premier mailing" style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="dates_relances"
                label="Dates des relances"
              >
                <TextArea placeholder="Dates des relances (format: JJ/MM/AAAA, JJ/MM/AAAA, ...)" rows={2} />
              </Form.Item>
            </TabPane>

            <TabPane tab="Ciblage et démarche" key="3">
              <Form.Item
                name="nb_entreprises_ciblees"
                label="Nombre d'entreprises ciblées"
              >
                <InputNumber placeholder="Nombre" style={{ width: '100%' }} min={0} />
              </Form.Item>

              <Form.Item
                name="source_ciblage"
                label="Source du ciblage"
              >
                <TextArea placeholder="Source du ciblage des entreprises" rows={2} />
              </Form.Item>

              <Form.Item
                name="contacts_telephoniques"
                label="Contacts téléphoniques"
              >
                <InputNumber placeholder="Nombre" style={{ width: '100%' }} min={0} />
              </Form.Item>

              <Form.Item
                name="lettre_argumentaire"
                label="Lettre argumentaire"
              >
                <TextArea placeholder="Contenu de la lettre argumentaire" rows={3} />
              </Form.Item>
            </TabPane>

            <TabPane tab="Budget et logistique" key="4">
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

              <Form.Item
                name="frais_deplacement"
                label="Frais de déplacement"
              >
                <TextArea placeholder="Détails des frais de déplacement" rows={2} />
              </Form.Item>

              <Form.Item
                name="frais_mission"
                label="Frais de mission"
              >
                <TextArea placeholder="Détails des frais de mission" rows={2} />
              </Form.Item>

              <Form.Item
                name="besoins_logistiques"
                label="Besoins logistiques"
              >
                <TextArea placeholder="Détails des besoins logistiques" rows={2} />
              </Form.Item>
            </TabPane>

            <TabPane tab="Résultats et évaluation" key="5">
              <div className="form-row">
                <Form.Item
                  name="nb_reponses_positives"
                  label="Nombre de réponses positives"
                  className="form-col"
                >
                  <InputNumber placeholder="Nombre" style={{ width: '100%' }} min={0} />
                </Form.Item>

                <Form.Item
                  name="contacts_interessants_initiateur"
                  label="Contacts intéressants initiateur"
                  className="form-col"
                >
                  <InputNumber placeholder="Nombre" style={{ width: '100%' }} min={0} />
                </Form.Item>
              </div>

              <Form.Item
                name="contacts_interessants_binome"
                label="Contacts intéressants binôme"
              >
                <InputNumber placeholder="Nombre" style={{ width: '100%' }} min={0} />
              </Form.Item>

              <Form.Item
                name="resultat_action"
                label="Résultat de l'action"
              >
                <TextArea placeholder="Détails sur les résultats obtenus" rows={2} />
              </Form.Item>

              <Form.Item
                name="evaluation_action"
                label="Évaluation de l'action"
              >
                <TextArea placeholder="Évaluation générale de l'action" rows={3} />
              </Form.Item>
            </TabPane>
          </Tabs>
        </Form>
      </Modal>

      {/* Modal pour visualiser */}
      <Modal
        title="Détails du démarchage direct"
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
                <h4>Présentation:</h4>
                <p>{selectedItem.presentation || 'Non spécifié'}</p>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Pays:</h4>
                  <p>{pays?.find(item => String(item.id) === String(selectedItem.pays_id))?.name_pays || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Régions:</h4>
                  <p>{selectedItem.regions || 'Non spécifié'}</p>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Secteur:</h4>
                  <p>{secteurs?.find(item => String(item.id) === String(selectedItem.secteur_id))?.name || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Initiateur:</h4>
                  <p>{initiateurs?.find(item => String(item.id) === String(selectedItem.initiateur_id))?.nom || 'Non spécifié'}</p>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Groupe secteur:</h4>
                  <p>{selectedItem.groupe_secteur || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Inclure:</h4>
                  <p>{selectedItem.inclure || 'Non spécifié'}</p>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Action conjointe:</h4>
                  <p>{selectedItem.coinjointe || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Cadre siège:</h4>
                  <p>{selectedItem.cadre_siege || 'Non spécifié'}</p>
                </div>
              </div>

              <div className="detail-item">
                <h4>Statut:</h4>
                <ul className="status-list">
                  {selectedItem.proposee && <li>Proposée</li>}
                  {selectedItem.programmee && <li>Programmée</li>}
                  {selectedItem.realisee && <li>Réalisée</li>}
                  {selectedItem.reportee && <li>Reportée</li>}
                  {selectedItem.annulee && <li>Annulée</li>}
                  {!selectedItem.proposee && !selectedItem.programmee &&
                    !selectedItem.realisee && !selectedItem.reportee &&
                    !selectedItem.annulee && <li>Aucun statut défini</li>}
                </ul>
              </div>
            </TabPane>

            <TabPane tab="Dates et planification" key="2">
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
                <h4>Date premier mailing:</h4>
                <p>{selectedItem.date_premier_mailing ? moment(selectedItem.date_premier_mailing).format('DD/MM/YYYY') : 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Dates des relances:</h4>
                <p>{selectedItem.dates_relances || 'Non spécifié'}</p>
              </div>
            </TabPane>

            <TabPane tab="Ciblage et démarche" key="3">
              <div className="detail-item">
                <h4>Nombre d'entreprises ciblées:</h4>
                <p>{selectedItem.nb_entreprises_ciblees || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Source du ciblage:</h4>
                <p>{selectedItem.source_ciblage || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Contacts téléphoniques:</h4>
                <p>{selectedItem.contacts_telephoniques || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Lettre argumentaire:</h4>
                <p>{selectedItem.lettre_argumentaire || 'Non spécifié'}</p>
              </div>
            </TabPane>

            <TabPane tab="Budget et logistique" key="4">
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

              <div className="detail-item">
                <h4>Frais de déplacement:</h4>
                <p>{selectedItem.frais_deplacement || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Frais de mission:</h4>
                <p>{selectedItem.frais_mission || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Besoins logistiques:</h4>
                <p>{selectedItem.besoins_logistiques || 'Non spécifié'}</p>
              </div>
            </TabPane>

            <TabPane tab="Résultats et évaluation" key="5">
              <div className="detail-row">
                <div className="detail-item">
                  <h4>Nombre de réponses positives:</h4>
                  <p>{selectedItem.nb_reponses_positives || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Contacts intéressants initiateur:</h4>
                  <p>{selectedItem.contacts_interessants_initiateur || 'Non spécifié'}</p>
                </div>
              </div>

              <div className="detail-item">
                <h4>Contacts intéressants binôme:</h4>
                <p>{selectedItem.contacts_interessants_binome || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Résultat de l'action:</h4>
                <p>{selectedItem.resultat_action || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Évaluation de l'action:</h4>
                <p>{selectedItem.evaluation_action || 'Non spécifié'}</p>
              </div>
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default DemarchageDirect;