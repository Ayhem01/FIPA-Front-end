import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Table, Button, Space, Popconfirm, message, Card, Modal, Tabs,
    Form, Input, DatePicker, Select, Checkbox, Divider
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
    SaveOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import {
    fetchCtes, addCte, updateCte, deleteCte, getCteById,
    fetchInitiateurs, fetchPays, fetchSecteurs
} from "../../../features/marketingSlice";

const { TabPane } = Tabs;
const { TextArea } = Input;

const CTE = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Sélection des données depuis le Redux store
    const { items: ctes, loading, error, selectedItem } = useSelector(
        (state) => state.marketing.ctes
    );

    const { items: initiateurs, loading: loadingInitiateurs } = useSelector(
        (state) => state.marketing.initiateurs || { items: [], loading: false }
    );

    const { items: pays, loading: loadingPays } = useSelector(
        (state) => state.marketing.pays || { items: [], loading: false }
    );

    const { items: secteurs, loading: loadingSecteurs } = useSelector(
        (state) => state.marketing.secteurs || { items: [], loading: false }
    );

    // Récupération des données au chargement du composant
    useEffect(() => {
        dispatch(fetchCtes());
        dispatch(fetchInitiateurs());
        dispatch(fetchPays());
        dispatch(fetchSecteurs());
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
            historique_ste: false
        });
        setModalVisible(true);
    };

    const handleEdit = async (id) => {
        setEditingId(id);
        try {
            await dispatch(getCteById(id)).unwrap();
            // Formater les dates pour le DatePicker
            const formData = { ...selectedItem };
            if (formData.date_contact) {
                formData.date_contact = moment(formData.date_contact);
            }
            if (formData.historique_date_debut) {
                formData.historique_date_debut = moment(formData.historique_date_debut);
            }
            if (formData.historique_date_fin) {
                formData.historique_date_fin = moment(formData.historique_date_fin);
            }
            form.setFieldsValue(formData);
            setModalVisible(true);
        } catch (err) {
            message.error("Erreur lors du chargement des données");
        }
    };

    const handleView = async (id) => {
        try {
            await dispatch(getCteById(id)).unwrap();
            setViewModalVisible(true);
        } catch (err) {
            message.error("Erreur lors du chargement des détails");
        }
    };

    const handleDelete = (id) => {
        dispatch(deleteCte(id))
            .unwrap()
            .then(() => {
                message.success("CTE supprimé avec succès");
            })
            .catch(() => {
                message.error("Erreur lors de la suppression du CTE");
            });
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Formatter les dates pour l'API
            if (values.date_contact) {
                values.date_contact = values.date_contact.format('YYYY-MM-DD');
            }
            if (values.historique_date_debut) {
                values.historique_date_debut = values.historique_date_debut.format('YYYY-MM-DD');
            }
            if (values.historique_date_fin) {
                values.historique_date_fin = values.historique_date_fin.format('YYYY-MM-DD');
            }

            if (editingId) {
                await dispatch(updateCte({ id: editingId, data: values })).unwrap();
                message.success("CTE mis à jour avec succès");
            } else {
                await dispatch(addCte(values)).unwrap();
                message.success("CTE ajouté avec succès");
            }
            setModalVisible(false);
        } catch (error) {
            console.error("Erreur de validation ou de soumission:", error);
        }
    };

    // Colonnes de la table
    const columns = [
        {
            title: 'Nom',
            dataIndex: 'nom',
            key: 'nom',
            render: (nom, record) => `${record.prenom || ''} ${nom}`,
            sorter: (a, b) => a.nom.localeCompare(b.nom),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Téléphone',
            dataIndex: 'tel',
            key: 'tel',
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
            title: 'Secteur',
            dataIndex: 'secteur_id',
            key: 'secteur',
            render: (secteur_id) => {
                const secteurItem = secteurs?.find(item => item.id === secteur_id);
                return secteurItem ? secteurItem.name : 'N/A';
            }
        },
        {
            title: 'Date de contact',
            dataIndex: 'date_contact',
            key: 'date_contact',
            render: (date) => date ? moment(date).format('DD/MM/YYYY') : 'N/A',
        },
        {
            title: 'Actions',
            key: 'operations',
            render: (_, record) => (
                <Space size="small">
                    <Button icon={<EyeOutlined />} onClick={() => handleView(record.id)} />
                    <Button icon={<EditOutlined />} type="primary" onClick={() => handleEdit(record.id)} />
                    <Popconfirm
                        title="Êtes-vous sûr de vouloir supprimer ce CTE?"
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
                    <h3 className="page-title">Gestion des CTE</h3>
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
                    dataSource={ctes}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            {/* Modal pour ajouter/modifier */}
            <Modal
                title={editingId ? "Modifier un CTE" : "Ajouter un CTE"}
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
                        <TabPane tab="Informations personnelles" key="1">
                            <div className="form-row">
                                <Form.Item
                                    name="prenom"
                                    label="Prénom"
                                    className="form-col"
                                >
                                    <Input placeholder="Prénom" />
                                </Form.Item>

                                <Form.Item
                                    name="nom"
                                    label="Nom"
                                    rules={[{ required: true, message: 'Le nom est requis' }]}
                                    className="form-col"
                                >
                                    <Input placeholder="Nom" />
                                </Form.Item>
                            </div>

                            <div className="form-row">
                                <Form.Item
                                    name="age"
                                    label="Âge"
                                    rules={[{ required: true, message: 'L\'âge est requis' }]}
                                    className="form-col"
                                >
                                    <Input placeholder="Âge" />
                                </Form.Item>

                                <Form.Item
                                    name="email"
                                    label="Email"
                                    rules={[
                                        { required: true, message: 'L\'email est requis' },
                                        { type: 'email', message: 'Format d\'email invalide' }
                                    ]}
                                    className="form-col"
                                >
                                    <Input placeholder="Email" />
                                </Form.Item>
                            </div>

                            <div className="form-row">
                                <Form.Item
                                    name="tel"
                                    label="Téléphone"
                                    rules={[{ required: true, message: 'Le téléphone est requis' }]}
                                    className="form-col"
                                >
                                    <Input placeholder="Téléphone" />
                                </Form.Item>

                                <Form.Item
                                    name="fax"
                                    label="Fax"
                                    rules={[{ required: true, message: 'Le fax est requis' }]}
                                    className="form-col"
                                >
                                    <Input placeholder="Fax" />
                                </Form.Item>
                            </div>

                            <Form.Item
                                name="adresse"
                                label="Adresse"
                                rules={[{ required: true, message: 'L\'adresse est requise' }]}
                            >
                                <TextArea placeholder="Adresse complète" rows={2} />
                            </Form.Item>
                        </TabPane>

                        <TabPane tab="Informations professionnelles" key="2">
                            <div className="form-row">
                                <Form.Item
                                    name="pays_id"
                                    label="Pays"
                                    rules={[{ required: true, message: 'Le pays est requis' }]}
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
                                    name="lieu"
                                    label="Lieu"
                                    className="form-col"
                                >
                                    <Input placeholder="Lieu" />
                                </Form.Item>
                            </div>

                            <div className="form-row">
                                <Form.Item
                                    name="poste"
                                    label="Poste actuel"
                                    className="form-col"
                                >
                                    <Input placeholder="Poste occupé" />
                                </Form.Item>

                                <Form.Item
                                    name="ste"
                                    label="Société"
                                    className="form-col"
                                >
                                    <Input placeholder="Nom de la société" />
                                </Form.Item>
                            </div>

                            <div className="form-row">
                                <Form.Item
                                    name="diplome"
                                    label="Diplôme"
                                    className="form-col"
                                >
                                    <Input placeholder="Diplôme" />
                                </Form.Item>

                                <Form.Item
                                    name="secteur_id"
                                    label="Secteur d'activité"
                                    rules={[{ required: true, message: 'Le secteur est requis' }]}
                                    className="form-col"
                                >
                                    <Select
                                        placeholder="Sélectionnez le secteur"
                                        loading={loadingSecteurs}
                                        showSearch
                                        optionFilterProp="children"
                                    >
                                        {secteurs?.map(item => (
                                            <Select.Option key={item.id} value={item.id}>
                                                {item.name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </div>
                        </TabPane>

                        <TabPane tab="Contact et historique" key="3">
                            <div className="form-row">
                                <Form.Item
                                    name="date_contact"
                                    label="Date de contact"
                                    rules={[{ required: true, message: 'La date de contact est requise' }]}
                                    className="form-col"
                                >
                                    <DatePicker placeholder="Date de contact" style={{ width: '100%' }} />
                                </Form.Item>

                                <Form.Item
                                    name="initiateur_id"
                                    label="Initiateur"
                                    rules={[{ required: true, message: 'L\'initiateur est requis' }]}
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
                            </div>

                            <Divider orientation="left">Historique professionnel</Divider>

                            <div className="form-row">
                                <Form.Item
                                    name="historique_date_debut"
                                    label="Date de début"
                                    className="form-col"
                                >
                                    <DatePicker placeholder="Date de début" style={{ width: '100%' }} />
                                </Form.Item>

                                <Form.Item
                                    name="historique_date_fin"
                                    label="Date de fin"
                                    dependencies={['historique_date_debut']}
                                    className="form-col"
                                    rules={[
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || !getFieldValue('historique_date_debut') ||
                                                    moment(value).isAfter(getFieldValue('historique_date_debut')) ||
                                                    moment(value).isSame(getFieldValue('historique_date_debut'))) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('La date de fin doit être après ou égale à la date de début'));
                                            },
                                        }),
                                    ]}
                                >
                                    <DatePicker placeholder="Date de fin" style={{ width: '100%' }} />
                                </Form.Item>
                            </div>

                            <div className="form-row">
                                <Form.Item
                                    name="historique_poste"
                                    label="Poste précédent"
                                    className="form-col"
                                >
                                    <Input placeholder="Poste précédemment occupé" />
                                </Form.Item>

                                <Form.Item
                                    name="historique_ste"
                                    valuePropName="checked"
                                    className="form-col"
                                >
                                    <Checkbox>Même société que l'actuelle</Checkbox>
                                </Form.Item>
                            </div>
                        </TabPane>
                    </Tabs>
                </Form>
            </Modal>

            {/* Modal pour visualiser */}
            <Modal
                title="Détails du CTE"
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
                        <TabPane tab="Informations personnelles" key="1">
                            <div className="detail-row">
                                <div className="detail-item">
                                    <h4>Nom complet:</h4>
                                    <p>{`${selectedItem.prenom || ''} ${selectedItem.nom || 'Non spécifié'}`}</p>
                                </div>

                                <div className="detail-item">
                                    <h4>Âge:</h4>
                                    <p>{selectedItem.age || 'Non spécifié'}</p>
                                </div>
                            </div>

                            <div className="detail-row">
                                <div className="detail-item">
                                    <h4>Email:</h4>
                                    <p>{selectedItem.email || 'Non spécifié'}</p>
                                </div>

                                <div className="detail-item">
                                    <h4>Téléphone:</h4>
                                    <p>{selectedItem.tel || 'Non spécifié'}</p>
                                </div>
                            </div>

                            <div className="detail-row">
                                <div className="detail-item">
                                    <h4>Fax:</h4>
                                    <p>{selectedItem.fax || 'Non spécifié'}</p>
                                </div>

                                <div className="detail-item">
                                    <h4>Adresse:</h4>
                                    <p>{selectedItem.adresse || 'Non spécifié'}</p>
                                </div>
                            </div>
                        </TabPane>

                        <TabPane tab="Informations professionnelles" key="2">
                            <div className="detail-row">
                                <div className="detail-item">
                                    <h4>Pays:</h4>
                                    <p>{pays?.find(item => item.id === selectedItem.pays_id)?.name_pays || 'Non spécifié'}</p>
                                </div>

                                <div className="detail-item">
                                    <h4>Lieu:</h4>
                                    <p>{selectedItem.lieu || 'Non spécifié'}</p>
                                </div>
                            </div>

                            <div className="detail-row">
                                <div className="detail-item">
                                    <h4>Poste actuel:</h4>
                                    <p>{selectedItem.poste || 'Non spécifié'}</p>
                                </div>

                                <div className="detail-item">
                                    <h4>Société:</h4>
                                    <p>{selectedItem.ste || 'Non spécifié'}</p>
                                </div>
                            </div>

                            <div className="detail-row">
                                <div className="detail-item">
                                    <h4>Diplôme:</h4>
                                    <p>{selectedItem.diplome || 'Non spécifié'}</p>
                                </div>

                                <div className="detail-item">
                                    <h4>Secteur d'activité:</h4>
                                    <p>{secteurs?.find(item => item.id === selectedItem.secteur_id)?.name || 'Non spécifié'}</p>
                                </div>
                            </div>
                        </TabPane>

                        <TabPane tab="Contact et historique" key="3">
                            <div className="detail-row">
                                <div className="detail-item">
                                    <h4>Date de contact:</h4>
                                    <p>{selectedItem.date_contact ? moment(selectedItem.date_contact).format('DD/MM/YYYY') : 'Non spécifié'}</p>
                                </div>

                                <div className="detail-item">
                                    <h4>Initiateur:</h4>
                                    <p>{initiateurs?.find(item => item.id === selectedItem.initiateur_id)?.name || 'Non spécifié'}</p>
                                </div>
                            </div>

                            <Divider orientation="left">Historique professionnel</Divider>

                            <div className="detail-row">
                                <div className="detail-item">
                                    <h4>Période:</h4>
                                    <p>
                                        {selectedItem.historique_date_debut ? moment(selectedItem.historique_date_debut).format('DD/MM/YYYY') : 'Non spécifié'}
                                        {' - '}
                                        {selectedItem.historique_date_fin ? moment(selectedItem.historique_date_fin).format('DD/MM/YYYY') : 'Non spécifié'}
                                    </p>
                                </div>
                            </div>

                            <div className="detail-row">
                                <div className="detail-item">
                                    <h4>Poste précédent:</h4>
                                    <p>{selectedItem.historique_poste || 'Non spécifié'}</p>
                                </div>

                                <div className="detail-item">
                                    <h4>Même société:</h4>
                                    <p>{selectedItem.historique_ste ? 'Oui' : 'Non'}</p>
                                </div>
                            </div>
                        </TabPane>
                    </Tabs>
                )}
            </Modal>
        </div>
    );
};

export default CTE;