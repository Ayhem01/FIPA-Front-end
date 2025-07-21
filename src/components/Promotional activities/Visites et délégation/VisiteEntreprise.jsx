import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Table, Button, Space, Popconfirm, message, Card, Modal, Tabs,
    Form, Input, DatePicker, Select, Switch, InputNumber, Upload
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
    SaveOutlined, UploadOutlined, DownloadOutlined, FileOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import {
    fetchVisitesEntreprise, addVisiteEntreprise, updateVisiteEntreprise, deleteVisiteEntreprise,
    getVisiteEntrepriseById, fetchSecteurs, fetchInitiateurs, fetchNationalites,
    fetchResponsableSuivi
} from "../../../features/marketingSlice";

// Définir l'URL de l'API backend
const BACKEND_URL = 'http://localhost:8000';

const { TabPane } = Tabs;
const { TextArea } = Input;

const VisiteEntreprise = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [fileList, setFileList] = useState([]);

    // Sélection des données depuis le Redux store
    const { items: visitesEntreprise = [], loading = false, error = null } = useSelector(
        (state) => state.marketing.visitesEntreprise || {}
    );

    const { items: secteurs = [] } = useSelector((state) => state.marketing.secteurs || {});
    const { items: initiateurs = [] } = useSelector((state) => state.marketing.initiateurs || {});
    const { items: nationalites = [] } = useSelector((state) => state.marketing.nationalites || {});
    const { items: responsablesSuivi = [] } = useSelector((state) => state.marketing.responsableSuivi || {});

    // Récupération des données au chargement du composant
    useEffect(() => {
        dispatch(fetchVisitesEntreprise());
        dispatch(fetchSecteurs());
        dispatch(fetchInitiateurs());
        dispatch(fetchNationalites());
        dispatch(fetchResponsableSuivi());
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
            const response = await dispatch(getVisiteEntrepriseById(id)).unwrap();
            const visiteData = response.data || response;

            // Reset file list
            setFileList([]);

            // Format dates for DatePicker and ensure IDs are strings
            const formattedData = {
                ...visiteData,
                responsable_suivi_id: visiteData.responsable_suivi_id ? String(visiteData.responsable_suivi_id) : undefined,
                initiateur_id: visiteData.initiateur_id ? String(visiteData.initiateur_id) : undefined,
                nationalite_id: visiteData.nationalite_id ? String(visiteData.nationalite_id) : undefined,
                secteur_id: visiteData.secteur_id ? String(visiteData.secteur_id) : undefined,
                date_contact: visiteData.date_contact ? moment(visiteData.date_contact) : null,
                date_visite: visiteData.date_visite ? moment(visiteData.date_visite) : null,
                encadre_avec_programme: Boolean(visiteData.encadre_avec_programme),
                entreprise_importante: Boolean(visiteData.entreprise_importante),
            };

            // If there's a PDF file, add its info to the file list
            if (visiteData.programme_pdf) {
                const fileName = visiteData.programme_pdf.split('/').pop();
                setFileList([
                    {
                        uid: '-1',
                        name: fileName,
                        status: 'done',
                        url: `${BACKEND_URL}/storage/${visiteData.programme_pdf}`
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
            const response = await dispatch(getVisiteEntrepriseById(id)).unwrap();
            const item = response.data || response;
            setSelectedItem(item);
            setViewModalVisible(true);
        } catch (err) {
            message.error("Erreur lors du chargement des détails");
            console.error(err);
        }
    };

    const handleDelete = (id) => {
        dispatch(deleteVisiteEntreprise(id))
            .unwrap()
            .then(() => {
                message.success("Visite d'entreprise supprimée avec succès");
            })
            .catch(() => {
                message.error("Erreur lors de la suppression de la visite d'entreprise");
            });
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Vérification des champs requis
            if (!values.raison_sociale) {
                message.error("La raison sociale est requise");
                return;
            }

            // Formatter les dates pour l'API
            if (values.date_contact) {
                values.date_contact = values.date_contact.format('YYYY-MM-DD');
            }
            if (values.date_visite) {
                values.date_visite = values.date_visite.format('YYYY-MM-DD');
            }

            // Traitement des valeurs booléennes
            values.encadre_avec_programme = values.encadre_avec_programme ? 1 : 0;
            values.entreprise_importante = values.entreprise_importante ? 1 : 0;

            // Convertir les IDs en chaînes de caractères
            if (values.responsable_suivi_id) values.responsable_suivi_id = String(values.responsable_suivi_id);
            if (values.initiateur_id) values.initiateur_id = String(values.initiateur_id);
            if (values.nationalite_id) values.nationalite_id = String(values.nationalite_id);
            if (values.secteur_id) values.secteur_id = String(values.secteur_id);

            // Gérer le fichier PDF
            if (fileList.length > 0) {
                values.programme_pdf = { file: fileList[0] };
            } else {
                delete values.programme_pdf;
            }

            if (editingId) {
                // Mise à jour d'une visite d'entreprise existante
                await dispatch(updateVisiteEntreprise({ id: editingId, data: values })).unwrap();
                message.success("Visite d'entreprise mise à jour avec succès");
            } else {
                // Ajout d'une nouvelle visite d'entreprise
                await dispatch(addVisiteEntreprise(values)).unwrap();
                message.success("Visite d'entreprise ajoutée avec succès");
            }

            setModalVisible(false);
            // Rafraîchir la liste après ajout/modification
            setTimeout(() => {
                dispatch(fetchVisitesEntreprise());
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

    // Colonnes de la table
    const columns = [
        {
            title: 'Raison sociale de l’entreprise',
            dataIndex: 'raison_sociale',
            key: 'raison_sociale',
            width: 250,
            ellipsis: true,
            render: (text) => {
                const maxLength = 50;
                return text && text.length > maxLength ? `${text.substring(0, maxLength)}...` : text || 'N/A';
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
            title: 'Responsable',
            dataIndex: 'responsable',
            key: 'responsable',
            ellipsis: true,
        },
        {
            title: 'Importante',
            dataIndex: 'entreprise_importante',
            key: 'entreprise_importante',
            render: (value) => value ? 'Oui' : 'Non',
        },
        {
            title: 'Actions',
            key: 'operations',
            render: (_, record) => (
                <Space size="small">
                    <Button icon={<EyeOutlined />} onClick={() => handleView(record.id)} />
                    <Button icon={<EditOutlined />} type="primary" onClick={() => handleEdit(record.id)} />
                    <Popconfirm
                        title="Êtes-vous sûr de vouloir supprimer cette visite d'entreprise?"
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
                    <h3 className="page-title">Gestion des Visites d'Entreprises</h3>
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
                    dataSource={visitesEntreprise}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            {/* Modal pour ajouter/modifier */}
            <Modal
                title={editingId ? "Modifier une visite d'entreprise" : "Ajouter une visite d'entreprise"}
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
                                name="raison_sociale"
                                label="Raison sociale"
                                rules={[{ required: true, message: "La raison sociale est requise" }]}
                            >
                                <Input placeholder="Nom de l'entreprise" />
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
                            </div>

                            <div className="form-row">
                                <Form.Item
                                    name="activite"
                                    label="Activité"
                                    className="form-col"
                                >
                                    <Input placeholder="Activité principale" />
                                </Form.Item>

                                <Form.Item
                                    name="nombre_visites"
                                    label="Nombre de visites"
                                    rules={[{ required: true, message: "Le nombre de visites est requis" }]}
                                    className="form-col"
                                >
                                    <InputNumber min={0} style={{ width: '100%' }} placeholder="Nombre de visites" />
                                </Form.Item>
                            </div>

                            <div className="form-row">
                                <Form.Item
                                    name="date_contact"
                                    label="Date de contact"
                                    rules={[{ required: true, message: "La date de contact est requise" }]}
                                    className="form-col"
                                >
                                    <DatePicker placeholder="Sélectionnez la date" style={{ width: '100%' }} />
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
                                    name="initiateur_id"
                                    label="Initiateur"
                                    rules={[{ required: true, message: "L'initiateur est requis" }]}
                                    className="form-col"
                                >
                                    <Select
                                        placeholder="Sélectionnez l'initiateur"
                                        showSearch
                                        optionFilterProp="children"
                                        allowClear
                                    >
                                        {initiateurs?.map(item => (
                                            <Select.Option key={item.id} value={String(item.id)}>
                                                {item.name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    name="responsable_suivi_id"
                                    label="Responsable de suivi"
                                    rules={[{ required: true, message: "Le responsable de suivi est requis" }]}
                                    className="form-col"
                                >
                                    <Select
                                        placeholder="Sélectionnez le responsable"
                                        showSearch
                                        optionFilterProp="children"
                                        allowClear
                                    >
                                        {responsablesSuivi?.map(item => (
                                            <Select.Option key={item.id} value={String(item.id)}>
                                                {item.nom}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </div>

                            <div className="form-row">
                                <Form.Item
                                    name="entreprise_importante"
                                    label="Entreprise importante"
                                    valuePropName="checked"
                                    className="form-col"
                                >
                                    <Switch />
                                </Form.Item>

                                <Form.Item
                                    name="encadre_avec_programme"
                                    label="Encadrée avec programme"
                                    valuePropName="checked"
                                    className="form-col"
                                >
                                    <Switch />
                                </Form.Item>
                            </div>
                        </TabPane>

                        <TabPane tab="Contact" key="2">
                            <div className="form-row">
                                <Form.Item
                                    name="responsable"
                                    label="Responsable"
                                    rules={[{ required: true, message: "Le responsable est requis" }]}
                                    className="form-col"
                                >
                                    <Input placeholder="Nom du responsable" />
                                </Form.Item>
                                <Form.Item
                                    name="email"
                                    label="Email"
                                    rules={[{ required: true, type: 'email', message: 'L\'adresse email n\'est pas valide' }]}
                                    className="form-col"
                                >
                                    <Input placeholder="Adresse email" />
                                </Form.Item>

                                <Form.Item
                                    name="fonction"
                                    label="Fonction"
                                    className="form-col"
                                >
                                    <Input placeholder="Fonction du responsable" />
                                </Form.Item>
                            </div>

                            <Form.Item
                                name="adresse"
                                label="Adresse"
                            >
                                <Input placeholder="Adresse de l'entreprise" />
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
                                

                                
                            </div>
                        </TabPane>

                        <TabPane tab="Programme et appréciations" key="3">
                            <Form.Item
                                name="pr"
                                label="PR"
                                rules={[{ required: true, message: "Le statut PR est requis" }]}
                            >
                                <Select placeholder="Sélectionnez le statut">
                                    <Select.Option value="Prévue">Prévue</Select.Option>
                                    <Select.Option value="Réalisée">Réalisée</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="services_appreciation"
                                label="Appréciation des services"
                            >
                                <TextArea placeholder="Appréciations des services" rows={4} />
                            </Form.Item>

                            <Form.Item
                                name="programme_pdf"
                                label="Programme (PDF)"
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
                title="Détails de la visite d'entreprise"
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
                                <h4>Raison sociale:</h4>
                                <p>{selectedItem.raison_sociale || 'Non spécifié'}</p>
                            </div>

                            <div className="detail-row">
                                <div className="detail-item">
                                    <h4>Nationalité:</h4>
                                    <p>{nationalites?.find(item => String(item.id) === String(selectedItem.nationalite_id))?.name || 'Non spécifié'}</p>
                                </div>

                                <div className="detail-item">
                                    <h4>Secteur:</h4>
                                    <p>{secteurs?.find(item => String(item.id) === String(selectedItem.secteur_id))?.name || 'Non spécifié'}</p>
                                </div>
                            </div>

                            <div className="detail-row">
                                <div className="detail-item">
                                    <h4>Activité:</h4>
                                    <p>{selectedItem.activite || 'Non spécifié'}</p>
                                </div>

                                <div className="detail-item">
                                    <h4>Nombre de visites:</h4>
                                    <p>{selectedItem.nombre_visites || '0'}</p>
                                </div>
                            </div>

                            <div className="detail-row">
                                <div className="detail-item">
                                    <h4>Date de contact:</h4>
                                    <p>{selectedItem.date_contact ? moment(selectedItem.date_contact).format('DD/MM/YYYY') : 'Non spécifié'}</p>
                                </div>

                                <div className="detail-item">
                                    <h4>Date de visite:</h4>
                                    <p>{selectedItem.date_visite ? moment(selectedItem.date_visite).format('DD/MM/YYYY') : 'Non spécifié'}</p>
                                </div>
                            </div>

                            <div className="detail-row">
                                <div className="detail-item">
                                    <h4>Initiateur:</h4>
                                    <p>{initiateurs?.find(item => String(item.id) === String(selectedItem.initiateur_id))?.name || 'Non spécifié'}</p>
                                </div>

                                <div className="detail-item">
                                    <h4>Responsable de suivi:</h4>
                                    <p>{responsablesSuivi?.find(item => String(item.id) === String(selectedItem.responsable_suivi_id))?.nom || 'Non spécifié'}</p>
                                </div>
                            </div>

                            <div className="detail-row">
                                <div className="detail-item">
                                    <h4>Entreprise importante:</h4>
                                    <p>{selectedItem.entreprise_importante ? 'Oui' : 'Non'}</p>
                                </div>

                                <div className="detail-item">
                                    <h4>Encadrée avec programme:</h4>
                                    <p>{selectedItem.encadre_avec_programme ? 'Oui' : 'Non'}</p>
                                </div>
                            </div>
                        </TabPane>

                        <TabPane tab="Contact" key="2">
                            <div className="detail-row">
                                <div className="detail-item">
                                    <h4>Responsable:</h4>
                                    <p>{selectedItem.responsable || 'Non spécifié'}</p>
                                </div>
                                <div className="detail-item">
                                    <h4>Email:</h4>
                                    <p>{selectedItem.email || 'Non spécifié'}</p>
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
                                

                                
                            </div>
                        </TabPane>
                        <TabPane tab="Programme et appréciations" key="3">
                            <Form.Item
                                name="pr"
                                label="PR"
                            >
                                <Select placeholder="Sélectionnez le statut">
                                    <Select.Option value="Prévue">Prévue</Select.Option>
                                    <Select.Option value="Réalisée">Réalisée</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="services_appreciation"
                                label="Appréciation des services"
                            >
                                <TextArea placeholder="Appréciations des services" rows={4} />
                            </Form.Item>

                            <Form.Item
                                name="programme_pdf"
                                label="Programme (PDF)"
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
                )}
            </Modal>
        </div>
    );
};

export default VisiteEntreprise;