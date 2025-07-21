import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table, Button, Space, Popconfirm, message, Card, Modal, Tabs,
  Form, Input, DatePicker, InputNumber, Select, Checkbox, Divider, Upload, Alert
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  SaveOutlined, UploadOutlined, InboxOutlined, FileOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import {
  fetchSeminairesSecteur, addSeminaireSecteur, updateSeminaireSecteur, deleteSeminaireSecteur,
  getSeminaireSecteurById, fetchPays, fetchGroupes, fetchSecteurs, fetchBinomes, fetchResponsableFipa
} from "../../../features/marketingSlice";

// Définir l'URL de l'API backend
const BACKEND_URL = 'http://localhost:8000';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Dragger } = Upload;

const SeminaireSecteur = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [fileList, setFileList] = useState([]);

  // Sélection des données depuis le Redux store
  const { items: seminairesSecteur, loading, error } = useSelector(
    (state) => state.marketing.seminairesSecteur
  );

  const { items: pays, loading: loadingPays } = useSelector(
    (state) => state.marketing.pays
  );

  const { items: secteurs, loading: loadingSecteurs } = useSelector(
    (state) => state.marketing.secteurs
  );

  const { items: groupes, loading: loadingGroupes } = useSelector(
    (state) => state.marketing.groupes
  );

  const { items: responsablesFipa, loading: loadingResponsablesFipa } = useSelector(
    (state) => state.marketing.responsableFipa
  );

  const { items: binomes, loading: loadingBinomes } = useSelector(
    (state) => state.marketing.binomes
  );

  // Récupération des données au chargement du composant
  useEffect(() => {
    dispatch(fetchSeminairesSecteur());
    dispatch(fetchPays());
    dispatch(fetchSecteurs());
    dispatch(fetchGroupes());
    dispatch(fetchResponsableFipa());
    dispatch(fetchBinomes());
  }, [dispatch]);

  // Gestion des erreurs
  useEffect(() => {
    if (error) {
      message.error(error.message || "Une erreur s'est produite");
    }
  }, [error]);

  // Options pour les selects
  const inclureOptions = [
    { label: "Comptabilisée", value: "comptabilisée" },
    { label: "Non comptabilisée", value: "non comptabilisée" }
  ];
  
  const actionConjointeOptions = [
    { label: "Conjointe", value: "conjointe" },
    { label: "Non Conjointe", value: "non conjointe" }
  ];
  
  const typeParticipationOptions = [
    { label: "Organisatrice", value: "organisatrice" },
    { label: "Co-organisateur", value: "Co-organisateur" }, // Respecter exactement la casse
    { label: "Participation active", value: "Participation active" }, // Respecter exactement la casse
    { label: "Simple présence", value: "simple présence" }
  ];
  
  const typeOrganisationOptions = [
    { label: "Partenaires étrangers", value: "partenaires étrangers" },
    { label: "Partenaires tunisiens", value: "partenaires tunisiens" },
    { label: "Les deux à la fois", value: "les deux à la fois" }
  ];
  
  const diasporaOptions = [
    { label: "Organisée pour la diaspora", value: "organisée pour la diaspora" },
    { label: "Organisée avec la diaspora", value: " organisée avec la diaspora " } // Conserver EXACTEMENT l'espace avant et après
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
      presence_dg: false,
      programme_deroulement: false,
      inclure: 'comptabilisée',
      contacts_realises: 0
    });
    setFileList([]);
    setModalVisible(true);
  };

  const handleEdit = async (id) => {
    setEditingId(id);
    setFileList([]);
    try {
      const response = await dispatch(getSeminaireSecteurById(id)).unwrap();
      const seminaireData = response.data || response;

      // Format dates for DatePicker and ensure IDs are strings
      const formattedData = {
        ...seminaireData,
        // Convertir explicitement en string les IDs pour s'assurer de la cohérence
        pays_id: seminaireData.pays_id ? String(seminaireData.pays_id) : undefined,
        secteur_id: seminaireData.secteur_id ? String(seminaireData.secteur_id) : undefined,
        groupe_id: seminaireData.groupe_id ? String(seminaireData.groupe_id) : undefined,
        responsable_fipa_id: seminaireData.responsable_fipa_id ? String(seminaireData.responsable_fipa_id) : undefined,
        binome_id: seminaireData.binome_id ? String(seminaireData.binome_id) : undefined,
        date_debut: seminaireData.date_debut ? moment(seminaireData.date_debut) : null,
        date_fin: seminaireData.date_fin ? moment(seminaireData.date_fin) : null,
        date_butoir: seminaireData.date_butoir ? moment(seminaireData.date_butoir) : null
      };

      // Si un fichier de présence existe, afficher son nom comme information
      if (seminaireData.fichier_presence) {
        // Extraire le nom du fichier du chemin
        const fileName = seminaireData.fichier_presence.split('/').pop();
        message.info(`Fichier de présence actuel: ${fileName}`);
        console.log("Fichier de présence existant:", seminaireData.fichier_presence);
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
      const response = await dispatch(getSeminaireSecteurById(id)).unwrap();
      const item = response.data || response;

      // Déboguer l'URL du PDF
      if (item.fichier_presence) {
        console.log("URL originale du fichier:", item.fichier_presence);
        const fileUrl = `${BACKEND_URL}/storage/${item.fichier_presence.replace(/^\/+/, '')}?v=${new Date().getTime()}`;
        console.log("URL complète du fichier:", fileUrl);
      }

      setSelectedItem(item);
      setViewModalVisible(true);
    } catch (err) {
      message.error("Erreur lors du chargement des détails");
      console.error(err);
    }
  };

  const handleDelete = (id) => {
    dispatch(deleteSeminaireSecteur(id))
      .unwrap()
      .then(() => {
        message.success("Séminaire secteur supprimé avec succès");
      })
      .catch(() => {
        message.error("Erreur lors de la suppression du séminaire secteur");
      });
  };

  // Gestion du téléchargement de fichiers
  const handleFileChange = info => {
    const { status } = info.file;
    let fileList = [...info.fileList];

    // Limiter à un seul fichier
    fileList = fileList.slice(-1);

    // Définir le statut des fichiers
    fileList = fileList.map(file => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });

    setFileList(fileList);

    if (status === 'done') {
      message.success(`${info.file.name} fichier téléchargé avec succès.`);
    } else if (status === 'error') {
      message.error(`${info.file.name} échec du téléchargement.`);
    }
  };

  const uploadProps = {
    name: 'fichier_presence',
    multiple: false,
    fileList,
    beforeUpload: (file) => {
      // Vérifier le type de fichier
      const isPDF = file.type === 'application/pdf';
      if (!isPDF) {
        message.error('Vous pouvez uniquement télécharger des fichiers PDF!');
        return Upload.LIST_IGNORE;
      }
      // Retourner false pour empêcher le téléchargement automatique
      return false;
    },
    onChange: handleFileChange,
    onRemove: () => {
      setFileList([]);
    },
    accept: 'application/pdf' // Spécifier explicitement que seuls les PDF sont acceptés
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

      if (!values.responsable_fipa_id) {
        message.error("Le responsable FIPA est requis");
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

      // Convertir les IDs en chaînes de caractères - TRÈS IMPORTANT
      values.pays_id = String(values.pays_id);
      values.secteur_id = String(values.secteur_id);
      values.groupe_id = String(values.groupe_id);
      values.responsable_fipa_id = String(values.responsable_fipa_id);
      values.binome_id = String(values.binome_id);

      // Gérer les champs booléens
      const booleanFields = [
        'proposee', 'programmee', 'non_programmee', 'validee',
        'realisee', 'reportee', 'annulee',
        'presence_dg', 'programme_deroulement'
      ];

      // Définir les valeurs par défaut pour les champs booléens
      booleanFields.forEach(field => {
        values[field] = values[field] === true ? 1 : 0;
      });

      // Préparer les données avec le fichier si disponible
      if (fileList.length > 0) {
        const formData = new FormData();

        // Ajouter explicitement les champs requis d'abord
        formData.append('pays_id', values.pays_id);
        formData.append('secteur_id', values.secteur_id);
        formData.append('groupe_id', values.groupe_id);
        formData.append('responsable_fipa_id', values.responsable_fipa_id);
        formData.append('binome_id', values.binome_id);
        formData.append('intitule', values.intitule);
        formData.append('date_debut', values.date_debut);

        // Ajouter le reste des valeurs du formulaire à FormData
        Object.keys(values).forEach(key => {
          // Ne pas ajouter à nouveau les champs déjà ajoutés
          if (!['pays_id', 'secteur_id', 'groupe_id', 'responsable_fipa_id', 'binome_id', 'intitule', 'date_debut', 'fichier_presence'].includes(key) && values[key] !== undefined) {
            if (booleanFields.includes(key)) {
              formData.append(key, values[key]);
            } else if (values[key] !== null) {
              formData.append(key, values[key]);
            }
          }
        });

        // Ajouter le fichier PDF avec un timestamp pour éviter le cache
        const timestamp = new Date().getTime();
        const file = fileList[0].originFileObj;
        const renamedFile = new File([file], `presence_${timestamp}_${file.name}`, {
          type: file.type,
        });
        
        formData.append('fichier_presence', renamedFile);
        formData.append('fichier_presence_updated', 'true'); 
        formData.append('timestamp', timestamp);

        console.log('Envoi avec nouveau fichier:', renamedFile.name);

        if (editingId) {
          formData.append('_method', 'PUT');
          await dispatch(updateSeminaireSecteur({ id: editingId, data: formData })).unwrap();
          message.success("Séminaire secteur mis à jour avec succès");
        } else {
          await dispatch(addSeminaireSecteur(formData)).unwrap();
          message.success("Séminaire secteur ajouté avec succès");
        }
      } else {
        // Envoyer sans fichier
        const formattedData = { ...values };
        if (editingId) {
          formattedData.keep_existing_file = true;
          await dispatch(updateSeminaireSecteur({ id: editingId, data: formattedData })).unwrap();
          message.success("Séminaire secteur mis à jour avec succès");
        } else {
          await dispatch(addSeminaireSecteur(formattedData)).unwrap();
          message.success("Séminaire secteur ajouté avec succès");
        }
      }

      setModalVisible(false);
      setFileList([]);
      // Rafraîchir la liste après ajout/modification
      setTimeout(() => {
        dispatch(fetchSeminairesSecteur());
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
      title: 'Thème',
      dataIndex: 'theme',
      key: 'theme',
      width: 200,
      ellipsis: true,
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
      title: 'Lieu',
      dataIndex: 'lieu',
      key: 'lieu',
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
            title="Êtes-vous sûr de vouloir supprimer ce séminaire secteur?"
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
          <h3 className="page-title">Gestion des Séminaires JI Secteur</h3>
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
          dataSource={seminairesSecteur}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal pour ajouter/modifier */}
      <Modal
        title={editingId ? "Modifier un séminaire secteur" : "Ajouter un séminaire secteur"}
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setFileList([]);
        }}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => {
            setModalVisible(false);
            setFileList([]);
          }}>
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
                <Input placeholder="Intitulé du séminaire" />
              </Form.Item>

              <div className="form-row">
                <Form.Item
                  name="theme"
                  label="Thème"
                  className="form-col"
                >
                  <Input placeholder="Thème du séminaire" />
                </Form.Item>

                <Form.Item
                  name="lieu"
                  label="Lieu"
                  className="form-col"
                >
                  <Input placeholder="Lieu du séminaire" />
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
                    loading={loadingSecteurs}
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
                    loading={loadingGroupes}
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
                  name="responsable_fipa_id"
                  label="Responsable FIPA"
                  rules={[{ required: true, message: "Le responsable FIPA est requis" }]}
                  className="form-col"
                >
                  <Select
                    placeholder="Sélectionnez le responsable FIPA"
                    loading={loadingResponsablesFipa}
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
                      <Select.Option key={item.id} value={String(item.id)}>
                        {item.name}
                      </Select.Option>
                    ))}
                  </Select>
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
                  name="proposee_par"
                  label="Proposé par"
                  className="form-col"
                >
                  <Input placeholder="Nom de la personne" />
                </Form.Item>
              </div>

              <Form.Item
                name="motif"
                label="Motif"
              >
                <TextArea placeholder="Motif du séminaire" rows={2} />
              </Form.Item>

              <Divider orientation="left">Statut du séminaire</Divider>

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

            <TabPane tab="Dates et participation" key="2">
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

              <div className="form-row">
                <Form.Item
                  name="action_conjointe"
                  label="Action conjointe"
                  className="form-col"
                >
                  <Select placeholder="Type d'action">
                    {actionConjointeOptions.map(option => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="type_participation"
                  label="Type de participation"
                  className="form-col"
                >
                  <Select placeholder="Sélectionnez le type">
                    {typeParticipationOptions.map(option => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <div className="form-row">
                <Form.Item
                  name="type_organisation"
                  label="Type d'organisation"
                  className="form-col"
                >
                  <Select placeholder="Sélectionnez le type">
                    {typeOrganisationOptions.map(option => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="avec_diaspora"
                  label="Relation avec la diaspora"
                  className="form-col"
                >
                  <Select placeholder="Type de relation">
                    {diasporaOptions.map(option => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <Form.Item
                name="details_participation_active"
                label="Détails de participation active"
              >
                <TextArea placeholder="Détails sur la participation" rows={2} />
              </Form.Item>

              <Form.Item
                name="objectifs"
                label="Objectifs"
              >
                <TextArea placeholder="Objectifs du séminaire" rows={3} />
              </Form.Item>
            </TabPane>

            <TabPane tab="Partenaires et organisation" key="3">
              <Form.Item
                name="partenaires_tunisiens"
                label="Partenaires tunisiens"
              >
                <TextArea placeholder="Liste des partenaires tunisiens" rows={2} />
              </Form.Item>

              <Form.Item
                name="partenaires_etrangers"
                label="Partenaires étrangers"
              >
                <TextArea placeholder="Liste des partenaires étrangers" rows={2} />
              </Form.Item>

              <Form.Item
                name="officiels"
                label="Officiels"
              >
                <TextArea placeholder="Détails sur les officiels présents" rows={2} />
              </Form.Item>

              <div className="checkbox-group">
                <Form.Item name="presence_dg" valuePropName="checked">
                  <Checkbox>Présence du DG</Checkbox>
                </Form.Item>

                <Form.Item name="programme_deroulement" valuePropName="checked">
                  <Checkbox>Programme de déroulement</Checkbox>
                </Form.Item>
              </div>

              <Form.Item
                name="diaspora_details"
                label="Détails diaspora"
              >
                <TextArea placeholder="Détails sur la participation de la diaspora" rows={2} />
              </Form.Item>

              <Form.Item
                name="location_salle"
                label="Location de salle"
              >
                <TextArea placeholder="Détails sur la location de salle" rows={2} />
              </Form.Item>

              <Form.Item
                name="media_communication"
                label="Média et communication"
              >
                <TextArea placeholder="Détails sur les médias et la communication" rows={2} />
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

              <div className="form-row">
                <Form.Item
                  name="nb_entreprises"
                  label="Nombre d'entreprises"
                  className="form-col"
                >
                  <InputNumber placeholder="Nombre" style={{ width: '100%' }} min={0} />
                </Form.Item>

                <Form.Item
                  name="nb_multiplicateurs"
                  label="Nombre de multiplicateurs"
                  className="form-col"
                >
                  <InputNumber placeholder="Nombre" style={{ width: '100%' }} min={0} />
                </Form.Item>
              </div>

              <div className="form-row">
                <Form.Item
                  name="nb_institutionnels"
                  label="Nombre d'institutionnels"
                  className="form-col"
                >
                  <InputNumber placeholder="Nombre" style={{ width: '100%' }} min={0} />
                </Form.Item>

                <Form.Item
                  name="nb_articles_presse"
                  label="Nombre d'articles de presse"
                  className="form-col"
                >
                  <InputNumber placeholder="Nombre" style={{ width: '100%' }} min={0} />
                </Form.Item>
              </div>

              <div className="form-row">
                <Form.Item
                  name="contacts_realises"
                  label="Contacts réalisés"
                  className="form-col"
                >
                  <InputNumber placeholder="Nombre" style={{ width: '100%' }} min={0} />
                </Form.Item>
              </div>

              <Form.Item
                name="fichier_presence"
                label="Fichier de présence"
              >
                {editingId && (
                  <div className="pdf-notice" style={{ marginBottom: '10px' }}>
                    {fileList.length > 0 ? (
                      <Alert 
                        message="Ce fichier remplacera le fichier existant" 
                        type="warning" 
                        showIcon 
                      />
                    ) : (
                      <Alert 
                        message="Téléchargez un nouveau fichier pour remplacer l'existant, ou laissez vide pour conserver le fichier actuel" 
                        type="info" 
                        showIcon 
                      />
                    )}
                  </div>
                )}
                <Dragger {...uploadProps}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    {editingId ? "Cliquez pour remplacer le fichier existant" : "Cliquez ou glissez-déposez un fichier PDF ici"}
                  </p>
                  <p className="ant-upload-hint">
                    Support uniquement pour les fichiers PDF
                  </p>
                </Dragger>
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
        title="Détails du séminaire secteur"
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
                  <h4>Thème:</h4>
                  <p>{selectedItem.theme || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Lieu:</h4>
                  <p>{selectedItem.lieu || 'Non spécifié'}</p>
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
                  <h4>Responsable FIPA:</h4>
                  <p>{responsablesFipa?.find(item => String(item.id) === String(selectedItem.responsable_fipa_id))?.nom || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Binôme:</h4>
                  <p>{binomes?.find(item => String(item.id) === String(selectedItem.binome_id))?.name || 'Non spécifié'}</p>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Inclusion:</h4>
                  <p>{selectedItem.inclure || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Proposé par:</h4>
                  <p>{selectedItem.proposee_par || 'Non spécifié'}</p>
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

            <TabPane tab="Dates et participation" key="2">
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

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Action conjointe:</h4>
                  <p>{selectedItem.action_conjointe || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Type de participation:</h4>
                  <p>{selectedItem.type_participation || 'Non spécifié'}</p>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Type d'organisation:</h4>
                  <p>{selectedItem.type_organisation || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Relation avec la diaspora:</h4>
                  <p>{selectedItem.avec_diaspora || 'Non spécifié'}</p>
                </div>
              </div>

              <div className="detail-item">
                <h4>Détails de participation active:</h4>
                <p>{selectedItem.details_participation_active || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Objectifs:</h4>
                <p>{selectedItem.objectifs || 'Non spécifié'}</p>
              </div>
            </TabPane>

            <TabPane tab="Partenaires et organisation" key="3">
              <div className="detail-item">
                <h4>Partenaires tunisiens:</h4>
                <p>{selectedItem.partenaires_tunisiens || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Partenaires étrangers:</h4>
                <p>{selectedItem.partenaires_etrangers || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Officiels:</h4>
                <p>{selectedItem.officiels || 'Non spécifié'}</p>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Présence du DG:</h4>
                  <p>{selectedItem.presence_dg ? 'Oui' : 'Non'}</p>
                </div>

                <div className="detail-item">
                  <h4>Programme de déroulement:</h4>
                  <p>{selectedItem.programme_deroulement ? 'Oui' : 'Non'}</p>
                </div>
              </div>

              <div className="detail-item">
                <h4>Détails diaspora:</h4>
                <p>{selectedItem.diaspora_details || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Location de salle:</h4>
                <p>{selectedItem.location_salle || 'Non spécifié'}</p>
              </div>

              <div className="detail-item">
                <h4>Média et communication:</h4>
                <p>{selectedItem.media_communication || 'Non spécifié'}</p>
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
                  <h4>Nombre d'entreprises:</h4>
                  <p>{selectedItem.nb_entreprises || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Nombre de multiplicateurs:</h4>
                  <p>{selectedItem.nb_multiplicateurs || 'Non spécifié'}</p>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <h4>Nombre d'institutionnels:</h4>
                  <p>{selectedItem.nb_institutionnels || 'Non spécifié'}</p>
                </div>

                <div className="detail-item">
                  <h4>Nombre d'articles de presse:</h4>
                  <p>{selectedItem.nb_articles_presse || 'Non spécifié'}</p>
                </div>
              </div>

              <div className="detail-item">
                <h4>Contacts réalisés:</h4>
                <p>{selectedItem.contacts_realises || 'Non spécifié'}</p>
              </div>

              {selectedItem.fichier_presence && (
                <div className="detail-item">
                  <h4>Fichier de présence:</h4>
                  <p>
                    <a
                      href={`${BACKEND_URL}/storage/${selectedItem.fichier_presence.replace(/^\/+/, '')}?v=${new Date().getTime()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pdf-link"
                    >
                      <Button type="primary" icon={<FileOutlined />}>
                        Télécharger le fichier
                      </Button>
                    </a>
                  </p>
                </div>
              )}

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

export default SeminaireSecteur;