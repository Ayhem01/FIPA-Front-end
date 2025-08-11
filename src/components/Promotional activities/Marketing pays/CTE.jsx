import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Tabs, Form, Input, DatePicker, Select, Checkbox, Divider, Row, Col
} from 'antd';
import moment from 'moment';
import {
    fetchCtes, fetchInitiateurs, fetchPays, fetchSecteurs
} from "../../../features/marketingSlice";
import '../../../assets/styles/sub-form.css';


const { TabPane } = Tabs;
const { TextArea } = Input;

const CTE = () => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();

    // Sélection des données depuis le Redux store
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

    return (
        <Tabs defaultActiveKey="1" type="card" tabBarGutter={32}>
            <TabPane tab="Informations personnelles" key="1">
                <Row gutter={[16, 16]}>
                    <Col span={12}>
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
                    </Col>

                    <Col span={12}>
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
                    </Col>

                    <Col span={12}>
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
                    </Col>

                    <Form.Item
                        name="adresse"
                        label="Adresse"
                        rules={[{ required: true, message: 'L\'adresse est requise' }]}
                    >
                        <TextArea placeholder="Adresse complète" rows={2} />
                    </Form.Item>
                </Row>
            </TabPane>

            <TabPane tab="Informations professionnelles" key="2">
                <Row gutter={[16, 16]}>
                    <Col span={12}>
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
                    </Col>

                    <Col span={12}>
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
                    </Col>

                    <Col span={12}>
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
                    </Col>
                </Row>
            </TabPane>

            <TabPane tab="Contact et historique" key="3">
                <Row gutter={[16, 16]}>
                    <Col span={12}>
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
                    </Col>

                    <Divider orientation="left">Historique professionnel</Divider>

                    <Col span={12}>
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
                    </Col>

                    <Col span={12}>
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
                    </Col>
                </Row>
            </TabPane>
        </Tabs>
    );
};

export default CTE;