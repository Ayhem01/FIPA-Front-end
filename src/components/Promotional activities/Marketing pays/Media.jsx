import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Tabs,
  Form, 
  Input, 
  DatePicker, 
  InputNumber, 
  Row, 
  Col, 
  Select, 
  Checkbox, 
  Divider,
  Space
} from 'antd';
import {
  GlobalOutlined,
  DollarOutlined,
  CalendarOutlined,
  SoundOutlined,
  AimOutlined,
  TeamOutlined,
  FileTextOutlined,
  UserOutlined,
  BankOutlined
} from '@ant-design/icons';
import moment from 'moment';
import {
  fetchNationalites, 
  fetchVavSiege,
  fetchResponsablesBureaux
} from "../../../features/marketingSlice";
import '../../../assets/styles/sub-form.css';

const { TabPane } = Tabs;
const { TextArea } = Input;

const Media = ({ onChange, mainDateDebut }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const { items: nationalites, loading: loadingNationalites } = useSelector(
    (state) => state.marketing.nationalites
  );
  const { items: responsablesBureaux, loading: loadingResponsablesBureaux } = useSelector(
    (state) => state.marketing.responsablesBureaux
  );
  const { items: vavSiege, loading: loadingVavSiege } = useSelector(
    (state) => state.marketing.vavSiege
  );

  // Options pour les selects
  const typeActionOptions = [
    "Annonce presse", "Communique de presse", "Article de presse",
    "Interview", "Reportage", "Spécial pays", "Conférence de presse",
    "Affiche", "Spot TV", "Reportage TV", "Film institutionnel",
    "Spot radio", "Bannière web"
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

  // Récupération des données au chargement du composant
  useEffect(() => {
    dispatch(fetchNationalites());
    dispatch(fetchResponsablesBureaux());
    dispatch(fetchVavSiege());
  }, [dispatch]);

  // Mettre à jour les valeurs du formulaire quand mainDateDebut change
  useEffect(() => {
    if (mainDateDebut) {
      form.setFieldsValue({
        date_debut: mainDateDebut
      });
      
      // Propager la date au parent
      const values = form.getFieldsValue();
      values.date_debut = mainDateDebut;
      onChange && onChange(values);
    }
  }, [mainDateDebut, form]);

  // Mettre à jour les données parent quand le formulaire change
  const handleValuesChange = (changedValues, allValues) => {
    onChange && onChange(allValues);
  };

  return (
    <div className="media-form sub-form">
      <Form 
        form={form} 
        layout="vertical"
        onValuesChange={handleValuesChange}
        initialValues={{
          date_debut: mainDateDebut
        }}
      >
        <Tabs 
          defaultActiveKey="1" 
          type='card' 
          className="custom-tabs gold-tabs"
          tabBarGutter={8}
        >
          <TabPane 
            tab={
              <Space>
                <GlobalOutlined />
                <span>Informations générales</span>
              </Space>
            } 
            key="1"
          >
            <div className="tab-content-wrapper">
              <Row gutter={[24, 16]}>
                <Col span={12}>
                  <Form.Item
                    name="action"
                    label="Action"
                    rules={[{ required: true, message: 'Le champ action est requis' }]}
                    className="required-field"
                  >
                    <Input placeholder="Nom de l'action" />
                  </Form.Item>

                  <Form.Item
                    name="duree"
                    label="Durée"
                    rules={[{ required: true, message: 'Le champ durée est requis' }]}
                    className="required-field"
                  >
                    <Input placeholder="Ex: 30 jours" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="type_action"
                    label="Type d'action"
                    rules={[{ required: true, message: 'Le type d\'action est requis' }]}
                    className="required-field"
                  >
                    <Select 
                      placeholder="Sélectionnez le type d'action"
                      showSearch
                      optionFilterProp="children"
                    >
                      {typeActionOptions.map(option => (
                        <Select.Option key={option} value={option}>{option}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="type_media"
                    label="Type de média"
                    rules={[{ required: true, message: 'Le type de média est requis' }]}
                    className="required-field"
                  >
                    <Select 
                      placeholder="Sélectionnez le type de média"
                      showSearch
                      optionFilterProp="children"
                    >
                      {typeMediaOptions.map(option => (
                        <Select.Option key={option} value={option}>{option}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="nationalite_id"
                    label="Nationalité"
                    rules={[{ required: true, message: 'La nationalité est requise' }]}
                    className="required-field"
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
                    rules={[{ required: true, message: 'Le responsable est requis' }]}
                    className="required-field"
                  >
                    <Select
                      placeholder="Sélectionnez le responsable"
                      loading={loadingResponsablesBureaux}
                      showSearch
                      optionFilterProp="children"
                    >
                      {responsablesBureaux.map(responsable => (
                        <Select.Option key={responsable.id} value={responsable.id}>
                          {responsable.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="vav_siege_id"
                    label="VAV siège"
                    rules={[{ required: true, message: 'Le VAV siège est requis' }]}
                    className="required-field"
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

                  <Form.Item
                    name="proposee_par"
                    label="Proposé par"
                  >
                    <Input placeholder="Nom de la personne qui propose" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left" className="custom-divider">
                <Space>
                  <FileTextOutlined />
                  <span>Statut de l'action</span>
                </Space>
              </Divider>

              <Row gutter={[24, 8]} className="checkbox-group">
                <Col span={8}>
                  <Form.Item name="proposee" valuePropName="checked">
                    <Checkbox>Proposée</Checkbox>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="programmee" valuePropName="checked">
                    <Checkbox>Programmée</Checkbox>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="realisee" valuePropName="checked">
                    <Checkbox>Réalisée</Checkbox>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="reportee" valuePropName="checked">
                    <Checkbox>Reportée</Checkbox>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="annulee" valuePropName="checked">
                    <Checkbox>Annulée</Checkbox>
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </TabPane>

          <TabPane 
            tab={
              <Space>
                <CalendarOutlined />
                <span>Dates et budget</span>
              </Space>
            } 
            key="2"
          >
            <div className="tab-content-wrapper">
              <Row gutter={[24, 16]}>
                <Col span={12}>
                  <Form.Item
                    name="date_debut"
                    label="Date de début"
                    rules={[{ required: true, message: 'La date de début est requise' }]}
                    className="required-field"
                  >
                    <DatePicker 
                      placeholder="Sélectionnez la date" 
                      style={{ width: '100%' }} 
                      format="YYYY-MM-DD"
                    />
                  </Form.Item>

                  <Form.Item
                    name="date_fin"
                    label="Date de fin"
                    dependencies={['date_debut']}
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
                    <DatePicker 
                      placeholder="Sélectionnez la date" 
                      style={{ width: '100%' }} 
                      format="YYYY-MM-DD"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="budget"
                    label="Budget"
                    rules={[
                      {
                        type: 'number',
                        min: 0,
                        message: 'Le budget doit être un nombre positif',
                      },
                    ]}
                  >
                    <InputNumber 
                      placeholder="Montant" 
                      style={{ width: '100%' }} 
                      prefix={<DollarOutlined />}
                    />
                  </Form.Item>

                  <Form.Item
                    name="devise"
                    label="Devise"
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
                  >
                    <Select placeholder="Sélectionnez l'imputation">
                      {imputationOptions.map(option => (
                        <Select.Option key={option} value={option}>{option}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </TabPane>

          <TabPane 
            tab={
              <Space>
                <SoundOutlined />
                <span>Détails média</span>
              </Space>
            } 
            key="3"
          >
            <div className="tab-content-wrapper">
              <Row gutter={[24, 16]}>
                <Col span={12}>
                  <Form.Item
                    name="diffusion"
                    label="Diffusion"
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
                  >
                    <Input placeholder="Langue de diffusion" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="tirage_audience"
                    label="Tirage / Audience"
                  >
                    <Input placeholder="Ex: 100,000 exemplaires" />
                  </Form.Item>

                  <Form.Item
                    name="zone_impact"
                    label="Zone d'impact"
                  >
                    <Input 
                      placeholder="Zone géographique" 
                      prefix={<AimOutlined />}
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item name="cible" label="Cible">
                    <TextArea 
                      placeholder="Public ciblé" 
                      rows={2}
                      prefix={<TeamOutlined />}
                    />
                  </Form.Item>

                  <Form.Item name="composition_lectorat" label="Composition du lectorat">
                    <TextArea placeholder="Détails sur le lectorat" rows={2} />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="media_contact" label="Contact média">
                    <Input 
                      placeholder="Coordonnées du contact" 
                      prefix={<UserOutlined />}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="regie_publicitaire" label="Régie publicitaire">
                    <Input 
                      placeholder="Informations sur la régie" 
                      prefix={<BankOutlined />}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </TabPane>

          <TabPane 
            tab={
              <Space>
                <FileTextOutlined />
                <span>Objectifs et résultats</span>
              </Space>
            } 
            key="4"
          >
            <div className="tab-content-wrapper">
              <Row gutter={[24, 16]}>
                <Col span={24}>
                  <Form.Item name="objectif" label="Objectif">
                    <TextArea 
                      placeholder="Objectifs de l'action média" 
                      rows={3}
                      className="styled-textarea"
                    />
                  </Form.Item>

                  <Form.Item name="resultats_attendus" label="Résultats attendus">
                    <TextArea 
                      placeholder="Résultats espérés" 
                      rows={3}
                      className="styled-textarea"
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item name="volume_couverture" label="Volume de couverture">
                    <TextArea 
                      placeholder="Détails sur la couverture" 
                      rows={2}
                      className="styled-textarea"
                    />
                  </Form.Item>

                  <Form.Item name="collaboration_fipa" label="Collaboration FIPA">
                    <TextArea 
                      placeholder="Détails sur la collaboration" 
                      rows={2}
                      className="styled-textarea"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="evaluation"
                    label="Évaluation"
                  >
                    <Select placeholder="Évaluation de l'action">
                      {evaluationOptions.map(option => (
                        <Select.Option key={option} value={option}>{option}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="reconduction"
                    label="Reconduction"
                  >
                    <Select placeholder="Recommandation pour reconduction">
                      {reconductionOptions.map(option => (
                        <Select.Option key={option} value={option}>{option}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item name="commentaires_specifiques" label="Commentaires spécifiques">
                    <TextArea 
                      placeholder="Commentaires additionnels" 
                      rows={3}
                      className="styled-textarea"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </TabPane>
        </Tabs>
      </Form>
    </div>
  );
};

export default Media;