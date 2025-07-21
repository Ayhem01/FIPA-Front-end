import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table, Button, Space, Popconfirm, message, Card, Modal, Tabs,
  Form, Input, DatePicker, Select, Divider, Upload
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  SaveOutlined, UploadOutlined, DownloadOutlined, FileOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import {
  fetchDelegations, addDelegation, updateDelegation, deleteDelegation,
  getDelegationById, fetchSecteurs, fetchGroupes, fetchInitiateurs,
  fetchResponsableFipa, fetchNationalites
} from "../../../features/marketingSlice";

// Définir l'URL de l'API backend
const BACKEND_URL = 'http://localhost:8000';

const { TabPane } = Tabs;
const { TextArea } = Input;

const Delegations = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [fileList, setFileList] = useState([]);

  // Sélection des données depuis le Redux store
  const { items: delegations = [], loading = false, error = null } = useSelector(
    (state) => state.marketing.delegations || {}
  );

  const { items: secteurs = [] } = useSelector((state) => state.marketing.secteurs || {});
  const { items: groupes = [] } = useSelector((state) => state.marketing.groupes || {});
  const { items: initiateurs = [] } = useSelector((state) => state.marketing.initiateurs || {});
  const { items: responsablesFipa = [] } = useSelector((state) => state.marketing.responsableFipa || {});
  const { items: nationalites = [] } = useSelector((state) => state.marketing.nationalites || {});

  // Récupération des données au chargement du composant
  useEffect(() => {
    dispatch(fetchDelegations());
    dispatch(fetchSecteurs());
    dispatch(fetchGroupes());
    dispatch(fetchInitiateurs());
    dispatch(fetchResponsableFipa());
    dispatch(fetchNationalites());
  }, [dispatch]);

  // Gestion des erreurs
  useEffect(() => {
    if (error) {
      message.error(error.message || "Une erreur s'est produite");
    }
  }, [error]);

  // Configuration de l'upload des fichiers
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const uploadProps = {
    onRemove: (file) => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      const isPDF = file.type === 'application/pdf';
      if (!isPDF) {
        message.error('Vous ne pouvez uploader que des fichiers PDF!');
        return Upload.LIST_IGNORE;
      }
      setFileList([file]);
      return false; // Prevent auto upload
    },
    fileList,
  };

  // Gestion des actions CRUD
  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setFileList([]);
    setModalVisible(true);
  };

  const handleEdit = async (id) => {
    setEditingId(id);
    try {
      const response = await dispatch(getDelegationById(id)).unwrap();
      const delegationData = response.data || response;

      // Reset file list
      setFileList([]);

      // Format dates for DatePicker and ensure IDs are strings
      const formattedData = {
        ...delegationData,
        // Convertir explicitement en string les IDs pour s'assurer de la cohérence
        responsable_fipa_id: delegationData.responsable_fipa_id ? String(delegationData.responsable_fipa_id) : undefined,
        initiateur_id: delegationData.initiateur_id ? String(delegationData.initiateur_id) : undefined,
        nationalite_id: delegationData.nationalite_id ? String(delegationData.nationalite_id) : undefined,
        groupe_id: delegationData.groupe_id ? String(delegationData.groupe_id) : undefined,
        secteur_id: delegationData.secteur_id ? String(delegationData.secteur_id) : undefined,
        date_visite: delegationData.date_visite ? moment(delegationData.date_visite) : null,
      };

      // If there's a PDF file, add its info to the file list
      if (delegationData.liste_membres_pdf) {
        const fileName = delegationData.liste_membres_pdf.split('/').pop();
        setFileList([
          {
            uid: '-1',
            name: fileName,
            status: 'done',
            url: `${BACKEND_URL}/storage/${delegationData.liste_membres_pdf}`
          }
        ]);
      }

      form.setFieldsValue(formattedData);
      setModalVisible(true);
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      message.error("Erreur lors du chargement des données");
    }
  };

  const handleView = async (id) => {
    try {
      const response = await dispatch(getDelegationById(id)).unwrap();
      const item = response.data || response;
      setSelectedItem(item);
      setViewModalVisible(true);
    } catch (err) {
      message.error("Erreur lors du chargement des détails");
      console.error(err);
    }
  };

  const handleDelete = (id) => {
    dispatch(deleteDelegation(id))
      .unwrap()
      .then(() => {
        message.success("Délégation supprimée avec succès");
      })
      .catch(() => {
        message.error("Erreur lors de la suppression de la délégation");
      });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Vérification des champs requis
      if (!values.delegation) {
        message.error("Le nom de la délégation est requis");
        return;
      }

      if (!values.programme_visite) {
        message.error("Le programme de visite est requis");
        return;
      }

      if (!values.evaluation_suivi) {
        message.error("L'évaluation et suivi sont requis");
        return;
      }

      if (!values.date_visite) {
        message.error("La date de visite est requise");
        return;
      }

      // Traitement spécial pour le champ email_site: s'il est vide ou contient uniquement des espaces, le définir comme null
      if (values.email_site !== undefined) {
        values.email_site = values.email_site.trim() === '' ? null : values.email_site.trim();
      }

      // Formatter la date pour l'API
      if (values.date_visite) {
        values.date_visite = values.date_visite.format('YYYY-MM-DD');
      }
      if (values.liste_membres === undefined) {
        values.liste_membres = null;
      }

      // Convertir les IDs en chaînes de caractères
      values.responsable_fipa_id = String(values.responsable_fipa_id);
      values.initiateur_id = String(values.initiateur_id);
      values.nationalite_id = String(values.nationalite_id);
      values.groupe_id = String(values.groupe_id);
      values.secteur_id = String(values.secteur_id);

      // Gérer le fichier PDF
      if (fileList.length > 0) {
        values.liste_membres_pdf = { file: fileList[0] };
      } else {
        delete values.liste_membres_pdf;
      }

      if (editingId) {
        // Mise à jour d'une délégation existante
        await dispatch(updateDelegation({ id: editingId, data: values })).unwrap();
        message.success("Délégation mise à jour avec succès");
      } else {
        // Ajout d'une nouvelle délégation
        await dispatch(addDelegation(values)).unwrap();
        message.success("Délégation ajoutée avec succès");
      }

      setModalVisible(false);
      // Rafraîchir la liste après ajout/modification
      setTimeout(() => {
        dispatch(fetchDelegations());
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

  const downloadPDF = (url) => {
    if (url) {
      window.open(`${BACKEND_URL}/storage/${url}`, '_blank');
    } else {
      message.error("Aucun fichier PDF disponible");
    }
  };

  // Helper pour obtenir les noms à partir des IDs
  const getInitiateurName = (id) => {
    const initiateur = initiateurs?.find(item => String(item.id) === String(id));
    return initiateur ? initiateur.name : 'N/A';
  };

  const getResponsableFipaName = (id) => {
    const responsable = responsablesFipa?.find(item => String(item.id) === String(id));
    return responsable ? responsable.name : 'N/A';
  };

  // Colonnes de la table
  const columns = [
    {
      title: 'Délégation',
      dataIndex: 'delegation',
      key: 'delegation',
      width: 250,
      ellipsis: true,
      render: (text) => {
        const maxLength = 50;
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
      }
    },
    {
      title: 'Nationalité',
      dataIndex: 'nationalite_id',
      key: 'nationalite',
      render: (nationalite_id) => {
        const nationaliteItem = nationalites?.find(item => String(item.id) === String(nationalite_id));
        return nationaliteItem ? nationaliteItem.name : 'N/A';
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
      title: 'Date visite',
      dataIndex: 'date_visite',
      key: 'date_visite',
      render: (date) => date ? moment(date).format('DD/MM/YYYY') : 'N/A',
    },
    {
      title: 'Initiateur',
      dataIndex: 'initiateur_id',
      key: 'initiateur',
      render: (id) => getInitiateurName(id)
    },
    {
      title: 'Actions',
      key: 'operations',
      render: (_, record) => (
        <Space size="small">
          <Button icon={<EyeOutlined />} onClick={() => handleView(record.id)} />
          <Button icon={<EditOutlined />} type="primary" onClick={() => handleEdit(record.id)} />
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer cette délégation?"
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
          <h3 className="page-title">Gestion des Délégations</h3>
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
          dataSource={delegations}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal pour ajouter/modifier */}
      <Modal
        title={editingId ? "Modifier une délégation" : "Ajouter une délégation"}
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
                name="delegation"
                label="Délégation"
                rules={[{ required: true, message: "Le nom de la délégation est requis" }]}
              >
                <Input placeholder="Nom de la délégation" />
              </Form.Item>

              <div className="form-row">
                <Form.Item
                  name="nationalite_id"
                  label="Nationalité"
                  rules={[{ required: true, message: "La nationalité est requise" }]}
                  className="form-col"
                >
                  <Select
                    placeholder="Sélectionnez la nationalité"
                    showSearch
                    optionFilterProp="children"
                  >
                    {nationalites?.map(item => (
                      <Select.Option key={item.id} value={String(item.id)}>
                        {item.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="date_visite"
                  label="Date de visite"
                  rules={[{ required: true, message: "La date de visite est requise" }]}
                  className="form-col"
                >
                  <DatePicker placeholder="Sélectionnez la date" style={{ width: '100%' }} />
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
                        {item.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="responsable_fipa_id"
                  label="Responsable FIPA"
                  rules={[{ required: true, message: "Le responsable FIPA est requis" }]}
                  className="form-col"
                >
                  <Select
                    placeholder="Sélectionnez le responsable FIPA"
                    showSearch
                    optionFilterProp="children"
                  >
                    {responsablesFipa?.map(item => (
                      <Select.Option key={item.id} value={String(item.id)}>
                        {item.nom}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </TabPane>

            <TabPane tab="Coordonnées" key="2">
              <div className="form-row">
                <Form.Item
                  name="contact"
                  label="Contact"
                  className="form-col"
                >
                  <Input placeholder="Personne à contacter" />
                </Form.Item>

                <Form.Item
                  name="fonction"
                  label="Fonction"
                  className="form-col"
                >
                  <Input placeholder="Fonction du contact" />
                </Form.Item>
              </div>

              <Form.Item
                name="adresse"
                label="Adresse"
              >
                <Input placeholder="Adresse" />
              </Form.Item>

              <div className="form-row">
                <Form.Item
                  name="telephone"
                  label="Téléphone"
                  className="form-col"
                >
                  <Input placeholder="Numéro de téléphone" />
                </Form.Item>

                <Form.Item
                  name="fax"
                  label="Fax"
                  className="form-col"
                >
                  <Input placeholder="Numéro de fax" />
                </Form.Item>
              </div>

              <div className="form-row">
                <Form.Item
                  name="email_site"
                  label="Email : "
                  rules={[{ required: true}]}
                  className="form-col"
                >
                  <Input placeholder="Email ou site web" />
                </Form.Item>

                <Form.Item
                  name="activite"
                  label="Activité"
                  className="form-col"
                >
                  <Input placeholder="Activité principale" />
                </Form.Item>
              </div>
            </TabPane>

            <TabPane tab="Programme et membres" key="3">
              <Form.Item
                name="programme_visite"
                label="Programme de visite"
                rules={[{ required: true, message: "Le programme de visite est requis" }]}
              >
                <TextArea placeholder="Détails du programme de visite" rows={4} />
              </Form.Item>

              <Form.Item
                name="evaluation_suivi"
                label="Évaluation et suivi"
                rules={[{ required: true, message: "L'évaluation et suivi sont requis" }]}
              >
                <TextArea placeholder="Évaluation et suivi de la délégation" rows={4} />
              </Form.Item>

              

              <Form.Item
                name="liste_membres_pdf"
                label="Liste des membres (PDF)"
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <Upload {...uploadProps} maxCount={1}>
                  <Button icon={<UploadOutlined />}>Sélectionner un fichier PDF</Button>
                </Upload>
              </Form.Item>
              {fileList.length > 0 && fileList[0].url && (
                <Button
                  type="link"
                  icon={<FileOutlined />}
                  onClick={() => window.open(fileList[0].url, '_blank')}
                >
                  Voir le document actuel
                </Button>
              )}
            </TabPane>
          </Tabs>
        </Form>
      </Modal>

      {/* Modal pour visualiser */}
      <Modal
        title="Détails de la délégation"
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
                <h4>Délégation:</h4>
                <p>{selectedItem.delegation || 'Non spécifié'}</p>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Nationalité:</h4>
                  <p>{nationalites?.find(item => String(item.id) === String(selectedItem.nationalite_id))?.name || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Date de visite:</h4>
                  <p>{selectedItem.date_visite ? moment(selectedItem.date_visite).format('DD/MM/YYYY') : 'Non spécifié'}</p>
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
                  <p>{initiateurs?.find(item => String(item.id) === String(selectedItem.initiateur_id))?.name || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Responsable FIPA:</h4>
                  <p>{responsablesFipa?.find(item => String(item.id) === String(selectedItem.responsable_fipa_id))?.name || 'Non spécifié'}</p>
                </div>
              </div>
            </TabPane>

            <TabPane tab="Coordonnées" key="2">
              <div className="detail-row">
                <div className="detail-item">
                  <h4>Contact:</h4>
                  <p>{selectedItem.contact || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Fonction:</h4>
                  <p>{selectedItem.fonction || 'Non spécifié'}</p>
                </div>
              </div>

              <div className="detail-item">
                <h4>Adresse:</h4>
                <p>{selectedItem.adresse || 'Non spécifié'}</p>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Téléphone:</h4>
                  <p>{selectedItem.telephone || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Fax:</h4>
                  <p>{selectedItem.fax || 'Non spécifié'}</p>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Email :</h4>
                  <p>{selectedItem.email_site || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Activité:</h4>
                  <p>{selectedItem.activite || 'Non spécifié'}</p>
                </div>
              </div>
            </TabPane>

            <TabPane tab="Programme et membres" key="3">
              <div className="detail-item">
                <h4>Programme de visite:</h4>
                <p>{selectedItem.programme_visite || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Évaluation et suivi:</h4>
                <p>{selectedItem.evaluation_suivi || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Liste des membres:</h4>
                <p>{selectedItem.liste_membres || 'Non spécifié'}</p>
              </div>

              {selectedItem.liste_membres_pdf && (
                <div className="detail-item">
                  <h4>Document PDF:</h4>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={() => downloadPDF(selectedItem.liste_membres_pdf)}
                  >
                    Télécharger la liste des membres (PDF)
                  </Button>
                </div>
              )}
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default Delegations;