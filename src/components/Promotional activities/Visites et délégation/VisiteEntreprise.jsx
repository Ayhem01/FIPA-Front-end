import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Form, Input, DatePicker, Select, Switch, InputNumber, Tabs,
    Row, Col, Divider
} from 'antd';
import moment from 'moment';
import {
    fetchSecteurs, fetchInitiateurs, fetchNationalites,
    fetchResponsableSuivi
} from "../../../features/marketingSlice";

const { TabPane } = Tabs;
const { TextArea } = Input;

// Renommé pour correspondre au nom de fichier (important pour l'import)
const VisiteEntreprise = ({ onChange, initialValues = {}, mainDateDebut }) => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();

    // Sélection des données depuis le Redux store
    const { items: secteurs = [] } = useSelector((state) => state.marketing.secteurs || {});
    const { items: initiateurs = [] } = useSelector((state) => state.marketing.initiateurs || {});
    const { items: nationalites = [] } = useSelector((state) => state.marketing.nationalites || {});
    const { items: responsablesSuivi = [] } = useSelector((state) => state.marketing.responsableSuivi || {});

    // Récupération des données au chargement du composant
    useEffect(() => {
        dispatch(fetchSecteurs());
        dispatch(fetchInitiateurs());
        dispatch(fetchNationalites());
        dispatch(fetchResponsableSuivi());
    }, [dispatch]);

    // Synchroniser mainDateDebut avec le formulaire quand il change
    useEffect(() => {
        if (mainDateDebut) {
            form.setFieldsValue({ date_visite: mainDateDebut });
            
            // IMPORTANT: Utiliser la syntaxe la plus simple possible pour minimiser les transformations
            if (onChange) {
                const allValues = form.getFieldsValue();
                allValues.date_visite = moment(mainDateDebut).format('YYYY-MM-DD');
                onChange(allValues);
            }
        }
    }, [mainDateDebut, form, onChange]);

    // SIMPLIFIER la fonction handleValuesChange pour éviter les transformations qui pourraient causer des problèmes
    const handleValuesChange = (changedValues, allValues) => {
        // Copier les valeurs sans transformation excessive
        const formattedValues = { ...allValues };
        
        // Formater uniquement les dates si nécessaire
        if (formattedValues.date_visite && moment.isMoment(formattedValues.date_visite)) {
            formattedValues.date_visite = formattedValues.date_visite.format('YYYY-MM-DD');
        }
        
        if (formattedValues.date_contact && moment.isMoment(formattedValues.date_contact)) {
            formattedValues.date_contact = formattedValues.date_contact.format('YYYY-MM-DD');
        }
        
        // Ne pas mettre programme_pdf à null explicitement - laissez le backend gérer cette valeur
        
        if (onChange) {
            onChange(formattedValues);
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={{
                raison_sociale: '',
                nationalite_id: undefined,
                secteur_id: undefined,
                activite: '',
                nombre_visites: 1,
                date_contact: null,
                date_visite: mainDateDebut ? moment(mainDateDebut) : null,
                initiateur_id: undefined,
                responsable_suivi_id: undefined,
                entreprise_importante: false,
                encadre_avec_programme: false,
                responsable: '',
                email: '',
                fonction: '',
                adresse: '',
                telephone: '',
                fax: '',
                site_web: '',
                pr: 'Prévue',
                services_appreciation: '',
                ...initialValues
            }}
            onValuesChange={handleValuesChange}
        >
            <Tabs defaultActiveKey="1" type="card" tabBarGutter={32}>
                <TabPane tab="Informations générales" key="1">
                    <Form.Item
                        name="raison_sociale"
                        label="Raison sociale"
                        rules={[{ required: true, message: "La raison sociale est requise" }, { max: 255, message: "La raison sociale ne doit pas dépasser 255 caractères" }]}
                    >
                        <Input placeholder="Nom de l'entreprise" />
                    </Form.Item>

                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Form.Item
                                name="nationalite_id"
                                label="Nationalité"
                                rules={[{ required: true, message: "La nationalité est requise" }]}
                            >
                                <Select
                                    placeholder="Sélectionnez la nationalité"
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {nationalites?.map(item => (
                                        <Select.Option key={item.id} value={item.id}>
                                            {item.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="secteur_id"
                                label="Secteur"
                                rules={[{ required: true, message: "Le secteur est requis" }]}
                            >
                                <Select
                                    placeholder="Sélectionnez le secteur"
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

                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Form.Item
                                name="activite"
                                label="Activité"
                            >
                                <Input placeholder="Activité principale" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="nombre_visites"
                                label="Nombre de visites"
                                rules={[{ type: 'integer', min: 0, message: "Le nombre de visites doit être un nombre positif" }]}
                            >
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="Nombre de visites" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Form.Item
                                name="date_contact"
                                label="Date de contact"
                            >
                                <DatePicker placeholder="Sélectionnez la date" style={{ width: '100%' }} format="YYYY-MM-DD" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="date_visite"
                                label="Date de visite (synchronisée avec l'action)"
                                rules={[{ required: true, message: "La date de visite est requise" }]}
                            >
                                <DatePicker 
                                    placeholder="Sélectionnez la date" 
                                    style={{ width: '100%' }} 
                                    format="YYYY-MM-DD"
                                    disabled
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Form.Item
                                name="initiateur_id"
                                label="Initiateur"
                                rules={[{ required: true, message: "L'initiateur est requis" }]}
                            >
                                <Select
                                    placeholder="Sélectionnez l'initiateur"
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

                        <Col span={12}>
                            <Form.Item
                                name="responsable_suivi_id"
                                label="Responsable de suivi"
                            >
                                <Select
                                    placeholder="Sélectionnez le responsable"
                                    showSearch
                                    optionFilterProp="children"
                                    allowClear
                                >
                                    {responsablesSuivi?.map(item => (
                                        <Select.Option key={item.id} value={item.id}>
                                            {item.nom}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left">Options</Divider>

                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Form.Item
                                name="entreprise_importante"
                                label="Entreprise importante"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="encadre_avec_programme"
                                label="Encadrée avec programme"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>
                        </Col>
                    </Row>
                </TabPane>

                <TabPane tab="Contact" key="2">
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Form.Item
                                name="responsable"
                                label="Responsable"
                                rules={[{ max: 255, message: "Le nom du responsable ne doit pas dépasser 255 caractères" }]}
                            >
                                <Input placeholder="Nom du responsable" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="fonction"
                                label="Fonction"
                                rules={[{ max: 255, message: "La fonction ne doit pas dépasser 255 caractères" }]}
                            >
                                <Input placeholder="Fonction du responsable" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[{ type: 'email', message: 'L\'adresse email n\'est pas valide' }, { max: 255, message: "L'email ne doit pas dépasser 255 caractères" }]}
                    >
                        <Input placeholder="Adresse email" />
                    </Form.Item>

                    <Form.Item
                        name="site_web"
                        label="Site Web"
                        rules={[{ type: 'url', message: 'L\'URL du site web n\'est pas valide' }, { max: 255, message: "L'URL ne doit pas dépasser 255 caractères" }]}
                    >
                        <Input placeholder="https://www.exemple.com" />
                    </Form.Item>

                    <Form.Item
                        name="adresse"
                        label="Adresse"
                        rules={[{ max: 255, message: "L'adresse ne doit pas dépasser 255 caractères" }]}
                    >
                        <Input placeholder="Adresse de l'entreprise" />
                    </Form.Item>

                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Form.Item
                                name="telephone"
                                label="Téléphone"
                                rules={[{ max: 20, message: "Le téléphone ne doit pas dépasser 20 caractères" }]}
                            >
                                <Input placeholder="Numéro de téléphone" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="fax"
                                label="Fax"
                                rules={[{ max: 20, message: "Le fax ne doit pas dépasser 20 caractères" }]}
                            >
                                <Input placeholder="Numéro de fax" />
                            </Form.Item>
                        </Col>
                    </Row>
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
                </TabPane>
            </Tabs>
        </Form>
    );
};

// IMPORTANT: Exporter à la fois le nom original et le nouveau nom pour assurer la compatibilité
export { VisiteEntreprise as VisiteEntrepriseForm };
export default VisiteEntreprise;