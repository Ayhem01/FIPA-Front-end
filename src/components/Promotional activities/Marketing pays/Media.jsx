import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table, Button, Space, Popconfirm, message, Card, Modal, Tabs,
  Form, Input, DatePicker, InputNumber, Select, Checkbox, Divider
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  ArrowLeftOutlined, ReloadOutlined, SaveOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import {
  fetchMedias, addMedia, updateMedia, deleteMedia, getMediaById, fetchNationalites, fetchVavSiege,
  fetchResponsablesBureaux
} from "../../../features/marketingSlice";

const { TabPane } = Tabs;
const { TextArea } = Input;

const Media = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);



  // Sélection des données depuis le Redux store
  const { items: medias, loading, error, selectedItem } = useSelector(
    (state) => state.marketing.medias
  );

  const { items: nationalites, loading: loadingNationalites } = useSelector(
    (state) => state.marketing.nationalites
  );
  const { items: responsablesBureaux, loading: loadingResponsablesBureaux } = useSelector(
    (state) => state.marketing.responsablesBureaux
  );
  const { items: vavSiege, loading: loadingVavSiege } = useSelector(
    (state) => state.marketing.vavSiege
  );


  // Récupération des données au chargement du composant
  useEffect(() => {
    dispatch(fetchMedias());
    dispatch(fetchNationalites());
    dispatch(fetchResponsablesBureaux());
    dispatch(fetchVavSiege());
  }, [dispatch]);


  // Gestion des erreurs
  useEffect(() => {
    if (error) {
      message.error(error.message || "Une erreur s'est produite");
    }
  }, [error]);

  // Options pour les selects
  const typeActionOptions = [
    "Annonce presse", 
    "Communique de presse", 
    "Article de presse", 
    "Interview",
    "Reportage", 
    "Spécial pays",       
    "Conférence de presse", 
    "Affiche", 
    "Spot TV",           
    "Reportage TV",      
    "Film institutionnel", 
    "Spot radio", 
    "Bannière web" 
  ];

  const typeMediaOptions = [
    "Magasine", "Journal", "Groupe de publications", "Newsletter externe",
    "Bulletin d info", "Chaine TV", "Radios", "Site internet", "Espace d affichage"
  ];

  const deviseOptions = ["USD", "EUR", "TND", "Yen"];
  const imputationOptions = ["Régie au siège", "Régie au RE"];
  const diffusionOptions = ["Locale", "Régionale", "Internationale"];
  const evaluationOptions = ["Satisfaisante", "Non satisfaisante", "Tres satisfaisante"];
  const reconductionOptions = ["Fortement recommandée", "Déconseillée", "Sans intéret"];

  // Gestion des actions CRUD
  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    // Initialiser les champs booléens à false
    form.setFieldsValue({
      proposee: false,
      programmee: false,
      realisee: false,
      reportee: false,
      annulee: false
    });
    setModalVisible(true);
  };

  const handleEdit = async (id) => {
    setEditingId(id);
    try {
      await dispatch(getMediaById(id)).unwrap();
      // Formater les dates pour le DatePicker
      const formData = { ...selectedItem };
      if (formData.date_debut) {
        formData.date_debut = moment(formData.date_debut);
      }
      if (formData.date_fin) {
        formData.date_fin = moment(formData.date_fin);
      }
      form.setFieldsValue(formData);
      setModalVisible(true);
    } catch (err) {
      message.error("Erreur lors du chargement des données");
    }
  };

  const handleView = async (id) => {
    try {
      await dispatch(getMediaById(id)).unwrap();
      setViewModalVisible(true);
    } catch (err) {
      message.error("Erreur lors du chargement des détails");
    }
  };

  const handleDelete = (id) => {
    dispatch(deleteMedia(id))
      .unwrap()
      .then(() => {
        message.success("Média supprimé avec succès");
      })
      .catch(() => {
        message.error("Erreur lors de la suppression du média");
      });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Formatter les dates pour l'API
     
      if (values.date_debut) {
        values.date_debut = values.date_debut.format('YYYY-MM-DD');
      }
      if (values.date_fin) {
        values.date_fin = values.date_fin.format('YYYY-MM-DD');
      }

      if (editingId) {
        await dispatch(updateMedia({ id: editingId, data: values })).unwrap();
        message.success("Média mis à jour avec succès");
      } else {
        await dispatch(addMedia(values)).unwrap();
        message.success("Média ajouté avec succès");
      }
      setModalVisible(false);
    } catch (error) {
      console.error("Erreur de validation ou de soumission:", error);
    }
  };

  // Colonnes de la table
  const columns = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      ellipsis: true,
    },
    {
      title: 'Type d\'action',
      dataIndex: 'type_action',
      key: 'type_action',
    },
    {
      title: 'Type média',
      dataIndex: 'type_media',
      key: 'type_media',
    },
    {
      title: 'Date de début',
      dataIndex: 'date_debut',
      key: 'date_debut',
      render: (date) => date ? moment(date).format('DD/MM/YYYY') : 'N/A',
    },
    {
      title: 'Budget',
      dataIndex: 'budget',
      key: 'budget',
      render: (budget, record) => budget ? `${budget} ${record.devise || ''}` : 'N/A',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        if (record.proposee) return 'Proposée';
        if (record.programmee) return 'Programmée';
        if (record.realisee) return 'Réalisée';
        if (record.reportee) return 'Reportée';
        if (record.annulee) return 'Annulée';
        return 'N/A';
      }
    },
    {
      title: 'Actions',
      key: 'operations',
      render: (_, record) => (
        <Space size="small">
          <Button icon={<EyeOutlined />} onClick={() => handleView(record.id)} />
          <Button icon={<EditOutlined />} type="primary" onClick={() => handleEdit(record.id)} />
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce média?"
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
          
          <h3 className="page-title">Gestion des Médias</h3>
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
          dataSource={medias}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal pour ajouter/modifier */}
      <Modal
        title={editingId ? "Modifier un média" : "Ajouter un média"}
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
              <div className="form-row">
                <Form.Item
                  name="action"
                  label="Action"
                  rules={[{ required: !editingId, message: 'Le champ action est requis' }]}
                  className="form-col"
                >
                  <Input placeholder="Nom de l'action" />
                </Form.Item>

                <Form.Item
                  name="duree"
                  label="Durée"
                  rules={[{ required: !editingId, message: 'Le champ durée est requis' }]}
                  className="form-col"
                >
                  <Input placeholder="Ex: 30 jours" />
                </Form.Item>
              </div>

              <div className="form-row">
                <Form.Item
                  name="type_action"
                  label="Type d'action"
                  rules={[{ required: !editingId, message: 'Le type d\'action est requis' }]}
                  className="form-col"
                >
                  <Select placeholder="Sélectionnez le type d'action">
                    {typeActionOptions.map(option => (
                      <Select.Option key={option} value={option}>{option}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="type_media"
                  label="Type de média"
                  rules={[{ required: !editingId, message: 'Le type de média est requis' }]}
                  className="form-col"
                >
                  <Select placeholder="Sélectionnez le type de média">
                    {typeMediaOptions.map(option => (
                      <Select.Option key={option} value={option}>{option}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <div className="form-row">
                <Form.Item
                  name="nationalite_id"
                  label="Nationalité"
                  rules={[{ required: !editingId, message: 'La nationalité est requise' }]}
                  className="form-col"
                >
                  <Select
                    placeholder="Sélectionnez la nationalité"
                    loading={loadingNationalites}
                    showSearch
                    optionFilterProp="children"
                  >
                    {nationalites.map(nationalite => (
                      <Select.Option key={nationalite.id} value={nationalite.id}>
                        {nationalite.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="responsable_bureau_media_id"
                  label="Responsable bureau"
                  rules={[{ required: !editingId, message: 'Le responsable est requis' }]}
                  className="form-col"
                >
                  <Select
                    placeholder="Sélectionnez le responsable"
                    loading={loadingResponsablesBureaux}
                    showSearch
                    optionFilterProp="children">
                    {responsablesBureaux.map(responsable => (
                      <Select.Option key={responsable.id} value={responsable.id}>
                        {responsable.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="vav_siege_id"
                  label="VAV siège"
                  rules={[{ required: !editingId, message: 'Le VAV siège est requis' }]}
                  className="form-col"
                >
                  <Select
                    placeholder="Sélectionnez le VAV siège"
                    loading={loadingVavSiege}
                    showSearch
                    optionFilterProp="children"
                  >
                    {vavSiege.map(vavSiege => (
                      <Select.Option key={vavSiege.id} value={vavSiege.id}>
                        {vavSiege.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <Form.Item
                name="proposee par"
                label="Proposé par"
              >
                <Input placeholder="Nom de la personne qui propose" />
              </Form.Item>

              <Divider orientation="left">Statut de l'action</Divider>

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

            <TabPane tab="Dates et budget" key="2">
              <div className="form-row">
                <Form.Item
                  name="date_debut"
                  label="Date de début"
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

              <div className="form-row">
                <Form.Item
                  name="budget"
                  label="Budget"
                  className="form-col"
                  rules={[
                    {
                      type: 'number',
                      min: 0,
                      message: 'Le budget doit être un nombre positif',
                    },
                  ]}
                >
                  <InputNumber placeholder="Montant" style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                  name="devise"
                  label="Devise"
                  className="form-col"
                >
                  <Select placeholder="Sélectionnez la devise">
                    {deviseOptions.map(option => (
                      <Select.Option key={option} value={option}>{option}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="imputation_financiere"
                  label="Imputation financière"
                  className="form-col"
                >
                  <Select placeholder="Sélectionnez l'imputation">
                    {imputationOptions.map(option => (
                      <Select.Option key={option} value={option}>{option}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </TabPane>

            <TabPane tab="Détails média" key="3">
              <div className="form-row">
                <Form.Item
                  name="diffusion"
                  label="Diffusion"
                  className="form-col"
                >
                  <Select placeholder="Type de diffusion">
                    {diffusionOptions.map(option => (
                      <Select.Option key={option} value={option}>{option}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="langue"
                  label="Langue"
                  className="form-col"
                >
                  <Input placeholder="Langue de diffusion" />
                </Form.Item>
              </div>

              <div className="form-row">
                <Form.Item
                  name="tirage_audience"
                  label="Tirage / Audience"
                  className="form-col"
                >
                  <Input placeholder="Ex: 100,000 exemplaires" />
                </Form.Item>

                <Form.Item
                  name="zone_impact"
                  label="Zone d'impact"
                  className="form-col"
                >
                  <Input placeholder="Zone géographique" />
                </Form.Item>
              </div>

              <Form.Item name="cible" label="Cible">
                <TextArea placeholder="Public ciblé" rows={2} />
              </Form.Item>

              <Form.Item name="composition_lectorat" label="Composition du lectorat">
                <TextArea placeholder="Détails sur le lectorat" rows={2} />
              </Form.Item>

              <Form.Item name="media_contact" label="Contact média">
                <Input placeholder="Coordonnées du contact" />
              </Form.Item>

              <Form.Item name="regie_publicitaire" label="Régie publicitaire">
                <Input placeholder="Informations sur la régie" />
              </Form.Item>
            </TabPane>

            <TabPane tab="Objectifs et résultats" key="4">
              <Form.Item name="objectif" label="Objectif">
                <TextArea placeholder="Objectifs de l'action média" rows={3} />
              </Form.Item>

              <Form.Item name="resultats_attendus" label="Résultats attendus">
                <TextArea placeholder="Résultats espérés" rows={3} />
              </Form.Item>

              <Form.Item name="volume_couverture" label="Volume de couverture">
                <TextArea placeholder="Détails sur la couverture" rows={2} />
              </Form.Item>

              <Form.Item name="collaboration_fipa" label="Collaboration FIPA">
                <TextArea placeholder="Détails sur la collaboration" rows={2} />
              </Form.Item>

              <div className="form-row">
                <Form.Item
                  name="evaluation"
                  label="Évaluation"
                  className="form-col"
                >
                  <Select placeholder="Évaluation de l'action">
                    {evaluationOptions.map(option => (
                      <Select.Option key={option} value={option}>{option}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="reconduction"
                  label="Reconduction"
                  className="form-col"
                >
                  <Select placeholder="Recommandation pour reconduction">
                    {reconductionOptions.map(option => (
                      <Select.Option key={option} value={option}>{option}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <Form.Item name="commentaires_specifiques" label="Commentaires spécifiques">
                <TextArea placeholder="Commentaires additionnels" rows={3} />
              </Form.Item>
            </TabPane>
          </Tabs>
        </Form>
      </Modal>

      {/* Modal pour visualiser */}
      <Modal
        title="Détails du média"
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
                <h4>Action:</h4>
                <p>{selectedItem.action || 'Non spécifié'}</p>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Type d'action:</h4>
                  <p>{selectedItem.type_action || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Type de média:</h4>
                  <p>{selectedItem.type_media || 'Non spécifié'}</p>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Durée:</h4>
                  <p>{selectedItem.duree || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Proposé par:</h4>
                  <p>{selectedItem['proposee par'] || 'Non spécifié'}</p>
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

            <TabPane tab="Dates et budget" key="2">
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

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Budget:</h4>
                  <p>{selectedItem.budget ? `${selectedItem.budget} ${selectedItem.devise || ''}` : 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Imputation financière:</h4>
                  <p>{selectedItem.imputation_financiere || 'Non spécifié'}</p>
                </div>
              </div>
            </TabPane>

            <TabPane tab="Détails média" key="3">
              <div className="detail-row">
                <div className="detail-item">
                  <h4>Diffusion:</h4>
                  <p>{selectedItem.diffusion || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Langue:</h4>
                  <p>{selectedItem.langue || 'Non spécifié'}</p>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Tirage / Audience:</h4>
                  <p>{selectedItem.tirage_audience || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Zone d'impact:</h4>
                  <p>{selectedItem.zone_impact || 'Non spécifié'}</p>
                </div>
              </div>

              <div className="detail-item">
                <h4>Cible:</h4>
                <p>{selectedItem.cible || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Composition du lectorat:</h4>
                <p>{selectedItem.composition_lectorat || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Contact média:</h4>
                <p>{selectedItem.media_contact || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Régie publicitaire:</h4>
                <p>{selectedItem.regie_publicitaire || 'Non spécifié'}</p>
              </div>
            </TabPane>

            <TabPane tab="Objectifs et résultats" key="4">
              <div className="detail-item">
                <h4>Objectif:</h4>
                <p>{selectedItem.objectif || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Résultats attendus:</h4>
                <p>{selectedItem.resultats_attendus || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Volume de couverture:</h4>
                <p>{selectedItem.volume_couverture || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Collaboration FIPA:</h4>
                <p>{selectedItem.collaboration_fipa || 'Non spécifié'}</p>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Évaluation:</h4>
                  <p>{selectedItem.evaluation || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Reconduction:</h4>
                  <p>{selectedItem.reconduction || 'Non spécifié'}</p>
                </div>
              </div>

              <div className="detail-item">
                <h4>Commentaires spécifiques:</h4>
                <p>{selectedItem.commentaires_specifiques || 'Non spécifié'}</p>
              </div>
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default Media;