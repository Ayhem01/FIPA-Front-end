import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table, Button, Space, Popconfirm, message, Card, Modal, Tabs,
  Form, Input, DatePicker, Select, Checkbox, Divider, InputNumber, Radio
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import {
  fetchSalons, addSalon, updateSalon, deleteSalon, getSalonById,
  fetchInitiateurs, fetchPays, fetchBinomes
} from "../../../features/marketingSlice";

const { TabPane } = Tabs;
const { TextArea } = Input;

const Salon = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Sélection des données depuis le Redux store
  const { items: salons, loading, error, selectedItem } = useSelector(
    (state) => state.marketing.salons
  );

  const { items: initiateurs, loading: loadingInitiateurs } = useSelector(
    (state) => state.marketing.initiateurs || { items: [], loading: false }
  );
  
  const { items: binomes, loading: loadingBinomes } = useSelector(
    (state) => state.marketing.binomes || { items: [], loading: false }
  );
  
  const { items: pays, loading: loadingPays } = useSelector(
    (state) => state.marketing.pays || { items: [], loading: false }
  );

  // Options constantes
  const presenceOptions = ['Conjointe', 'Non Conjointe'];
  const inclureOptions = ['Yes', 'No'];
  const categorieOptions = ['Incontournable', 'Prospection simple', 'Nouveau à prospecter'];

  // Récupération des données au chargement du composant
  useEffect(() => {
    dispatch(fetchSalons());
    dispatch(fetchInitiateurs());
    dispatch(fetchBinomes());
    dispatch(fetchPays());
  }, [dispatch]);

  // Gestion des erreurs
  useEffect(() => {
    if (error) {
      message.error(error.message || "Une erreur s'est produite");
    }
  }, [error]);

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
      inclure: 'Yes'
    });
    setModalVisible(true);
  };

  const handleEdit = async (id) => {
    setEditingId(id);
    try {
      await dispatch(getSalonById(id)).unwrap();
      // Formater les dates pour le DatePicker
      const formData = { ...selectedItem };
      if (formData.date_debut) {
        formData.date_debut = moment(formData.date_debut);
      }
      if (formData.date_fin) {
        formData.date_fin = moment(formData.date_fin);
      }
      if (formData.date_butoir) {
        formData.date_butoir = moment(formData.date_butoir);
      }
      form.setFieldsValue(formData);
      setModalVisible(true);
    } catch (err) {
      message.error("Erreur lors du chargement des données");
    }
  };

  const handleView = async (id) => {
    try {
      await dispatch(getSalonById(id)).unwrap();
      setViewModalVisible(true);
    } catch (err) {
      message.error("Erreur lors du chargement des détails");
    }
  };

  const handleDelete = (id) => {
    dispatch(deleteSalon(id))
      .unwrap()
      .then(() => {
        message.success("Salon supprimé avec succès");
      })
      .catch(() => {
        message.error("Erreur lors de la suppression du salon");
      });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log("Valeurs du formulaire avant traitement:", values);

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
      

      if (editingId) {
        await dispatch(updateSalon({ id: editingId, data: values })).unwrap();
        message.success("Salon mis à jour avec succès");
      } else {
        await dispatch(addSalon(values)).unwrap();
        message.success("Salon ajouté avec succès");
      }
      setModalVisible(false);
    } catch (error) {
      console.error("Erreur de validation ou de soumission:", error);
    }
  };

  // Helper pour afficher le statut
  const renderStatus = (record) => {
    if (record.annulee) return <span className="status-tag annulee">Annulée</span>;
    if (record.reportee) return <span className="status-tag reportee">Reportée</span>;
    if (record.realisee) return <span className="status-tag realisee">Réalisée</span>;
    if (record.validee) return <span className="status-tag validee">Validée</span>;
    if (record.programmee) return <span className="status-tag programmee">Programmée</span>;
    if (record.proposee) return <span className="status-tag proposee">Proposée</span>;
    if (record.non_programmee) return <span className="status-tag non-programmee">Non programmée</span>;
    return <span className="status-tag">Non défini</span>;
  };

  // Colonnes de la table
  const columns = [
    {
      title: 'Intitulé',
      dataIndex: 'intitule',
      key: 'intitule',
      sorter: (a, b) => a.intitule.localeCompare(b.intitule),
    },
    {
      title: 'Pays',
      dataIndex: 'pays_id',
      key: 'pays',
      render: (pays_id) => {
        const paysItem = pays?.find(item => item.id === pays_id);
        return paysItem ? paysItem.name_pays : 'N/A';
      }
    },
    {
      title: 'Dates',
      key: 'dates',
      render: (_, record) => {
        return `${record.date_debut ? moment(record.date_debut).format('DD/MM/YYYY') : 'N/A'} - 
                ${record.date_fin ? moment(record.date_fin).format('DD/MM/YYYY') : 'N/A'}`;
      }
    },
    {
      title: 'Catégorie',
      dataIndex: 'categorie',
      key: 'categorie',
    },
    {
      title: 'Statut',
      key: 'status',
      render: renderStatus
    },
    {
      title: 'Budget prévu',
      dataIndex: 'budget_prevu',
      key: 'budget_prevu',
      render: (budget) => budget ? `${budget}` : 'N/A',
    },
    {
      title: 'Actions',
      key: 'operations',
      render: (_, record) => (
        <Space size="small">
          <Button icon={<EyeOutlined />} onClick={() => handleView(record.id)} />
          <Button icon={<EditOutlined />} type="primary" onClick={() => handleEdit(record.id)} />
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce salon?"
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
          <h3 className="page-title">Gestion des Salons</h3>
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
          dataSource={salons}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal pour ajouter/modifier */}
      <Modal
        title={editingId ? "Modifier un salon" : "Ajouter un salon"}
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
                label="Intitulé du salon"
                rules={[{ required: true, message: "L'intitulé est requis" }]}
              >
                <Input placeholder="Nom du salon" />
              </Form.Item>

              <div className="form-row">
                <Form.Item
                  name="numero_edition"
                  label="Numéro d'édition"
                  className="form-col"
                >
                  <Input placeholder="Ex: 12ème édition" />
                </Form.Item>

                <Form.Item
                  name="site_web"
                  label="Site web"
                  className="form-col"
                >
                  <Input placeholder="URL du site web" />
                </Form.Item>
              </div>

              <div className="form-row">
                <Form.Item
                  name="categorie"
                  label="Catégorie"
                  className="form-col"
                >
                  <Select placeholder="Sélectionnez une catégorie">
                    {categorieOptions.map(option => (
                      <Select.Option key={option} value={option}>{option}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="presence_conjointe"
                  label="Présence conjointe"
                  className="form-col"
                >
                  <Select placeholder="Type de présence">
                    {presenceOptions.map(option => (
                      <Select.Option key={option} value={option}>{option}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <div className="form-row">
                <Form.Item
                  name="organisateur"
                  label="Organisateur"
                  className="form-col"
                >
                  <Input placeholder="Nom de l'organisateur" />
                </Form.Item>

                <Form.Item
                  name="inclure"
                  label="Inclure"
                  className="form-col"
                >
                  <Radio.Group>
                    <Radio value="Yes">Oui</Radio>
                    <Radio value="No">Non</Radio>
                  </Radio.Group>
                </Form.Item>
              </div>

              <Form.Item
                name="motif"
                label="Motif"
              >
                <TextArea rows={2} placeholder="Motif pour le salon" />
              </Form.Item>

              <Divider orientation="left">Responsabilités et Localisation</Divider>

              <div className="form-row">
                <Form.Item
                  name="initiateur_id"
                  label="Initiateur"
                  rules={[{ required: true, message: "L'initiateur est requis" }]}
                  className="form-col"
                >
                  <Select
                    placeholder="Sélectionnez l'initiateur"
                    loading={loadingInitiateurs}
                    showSearch
                    optionFilterProp="children"
                  >
                    {initiateurs?.map(item => (
                      <Select.Option key={item.id} value={item.id}>
                        {item.name}
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
                    loading={loadingBinomes}
                    showSearch
                    optionFilterProp="children"
                  >
                    {binomes?.map(item => (
                      <Select.Option key={item.id} value={item.id}>
                        {item.name}
                      </Select.Option>
                    ))}
                  </Select>
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
                    loading={loadingPays}
                    showSearch
                    optionFilterProp="children"
                  >
                    {pays?.map(item => (
                      <Select.Option key={item.id} value={item.id}>
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
                          moment(value).isAfter(getFieldValue('date_debut')) ||
                          moment(value).isSame(getFieldValue('date_debut'))) {
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
                name="theme"
                label="Thème"
              >
                <Input placeholder="Thème du salon" />
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
                  <Checkbox>Relations avec des relais</Checkbox>
                </Form.Item>
              </div>

              <Form.Item
                name="historique_edition"
                label="Historique des éditions"
              >
                <TextArea placeholder="Informations sur les éditions précédentes" rows={3} />
              </Form.Item>
            </TabPane>

            <TabPane tab="Besoins et budget" key="3">
              <Form.Item
                name="besoin_stand"
                label="Besoin en stand"
              >
                <TextArea placeholder="Description des besoins en stand" rows={2} />
              </Form.Item>

              <Form.Item
                name="besoin_media"
                label="Besoin en média"
              >
                <TextArea placeholder="Description des besoins en médias" rows={2} />
              </Form.Item>

              <Form.Item
                name="besoin_binome"
                label="Besoin en binôme"
              >
                <TextArea placeholder="Description des besoins en binôme" rows={2} />
              </Form.Item>

              <Form.Item
                name="besoin_autre_organisme"
                label="Besoin en autre organisme"
              >
                <TextArea placeholder="Description des besoins en autres organismes" rows={2} />
              </Form.Item>

              <Form.Item
                name="outils_promotionnels"
                label="Outils promotionnels"
              >
                <TextArea placeholder="Description des outils promotionnels" rows={2} />
              </Form.Item>

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
            </TabPane>

            <TabPane tab="Contacts et résultats" key="4">
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
                  name="contacts_total"
                  label="Contacts total"
                  className="form-col"
                >
                  <InputNumber placeholder="Nombre" style={{ width: '100%' }} min={0} />
                </Form.Item>

                <Form.Item
                  name="contacts_realises"
                  label="Contacts réalisés"
                  className="form-col"
                >
                  <InputNumber placeholder="Nombre" style={{ width: '100%' }} min={0} />
                </Form.Item>
              </div>

              <Form.Item
                name="resultat_veille_concurrentielle"
                label="Résultat veille concurrentielle"
              >
                <TextArea placeholder="Résultats de la veille concurrentielle" rows={3} />
              </Form.Item>

              <Form.Item
                name="resultat_veille_technologique"
                label="Résultat veille technologique"
              >
                <TextArea placeholder="Résultats de la veille technologique" rows={3} />
              </Form.Item>

              <Form.Item
                name="resultat_relation_institutions"
                label="Résultat relation avec les institutions"
              >
                <TextArea placeholder="Résultats des relations avec les institutions" rows={3} />
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
        title="Détails du salon"
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
                  <h4>Edition:</h4>
                  <p>{selectedItem.numero_edition || 'Non spécifié'}</p>
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
                  <h4>Présence conjointe:</h4>
                  <p>{selectedItem.presence_conjointe || 'Non spécifié'}</p>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Organisateur:</h4>
                  <p>{selectedItem.organisateur || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Inclure:</h4>
                  <p>{selectedItem.inclure === 'Yes' ? 'Oui' : 'Non'}</p>
                </div>
              </div>

              <div className="detail-item">
                <h4>Motif:</h4>
                <p>{selectedItem.motif || 'Non spécifié'}</p>
              </div>

              <Divider orientation="left">Responsabilités et Localisation</Divider>

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Initiateur:</h4>
                  <p>{initiateurs?.find(item => item.id === selectedItem.initiateur_id)?.name || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Binôme:</h4>
                  <p>{binomes?.find(item => item.id === selectedItem.binome_id)?.name || 'Non spécifié'}</p>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Pays:</h4>
                  <p>{pays?.find(item => item.id === selectedItem.pays_id)?.name_pays || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Région:</h4>
                  <p>{selectedItem.region || 'Non spécifié'}</p>
                </div>
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
                <h4>Thème:</h4>
                <p>{selectedItem.theme || 'Non spécifié'}</p>
              </div>

              <Divider orientation="left">Objectifs</Divider>

              <div className="detail-item">
                <h4>Objectifs visés:</h4>
                <ul className="status-list">
                  {selectedItem.objectif_contacts && <li>Contacts</li>}
                  {selectedItem.objectif_veille_concurrentielle && <li>Veille concurrentielle</li>}
                  {selectedItem.objectif_veille_technologique && <li>Veille technologique</li>}
                  {selectedItem.objectif_relation_relais && <li>Relations avec des relais</li>}
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

            <TabPane tab="Besoins et budget" key="3">
              <div className="detail-item">
                <h4>Besoin en stand:</h4>
                <p>{selectedItem.besoin_stand || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Besoin en média:</h4>
                <p>{selectedItem.besoin_media || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Besoin en binôme:</h4>
                <p>{selectedItem.besoin_binome || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Besoin en autre organisme:</h4>
                <p>{selectedItem.besoin_autre_organisme || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Outils promotionnels:</h4>
                <p>{selectedItem.outils_promotionnels || 'Non spécifié'}</p>
              </div>

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
            </TabPane>

            <TabPane tab="Contacts et résultats" key="4">
              <div className="detail-row">
                <div className="detail-item">
                  <h4>Contacts initiateur:</h4>
                  <p>{selectedItem.contacts_initiateur || '0'}</p>
                </div>

                <div className="detail-item">
                  <h4>Contacts binôme:</h4>
                  <p>{selectedItem.contacts_binome || '0'}</p>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Contacts total:</h4>
                  <p>{selectedItem.contacts_total || '0'}</p>
                </div>

                <div className="detail-item">
                  <h4>Contacts réalisés:</h4>
                  <p>{selectedItem.contacts_realises || '0'}</p>
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
                <h4>Résultat relation avec les institutions:</h4>
                <p>{selectedItem.resultat_relation_institutions || 'Non spécifié'}</p>
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

export default Salon;