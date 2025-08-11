import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table, Button, Space, Popconfirm, message, Card, Modal,Col, Tabs,
  Form, Input, DatePicker, Select, Checkbox, Divider, InputNumber, Radio
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import {
  fetchSalons, 
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

  

  return (
          <Tabs defaultActiveKey="1" type="card" tabBarGutter={32}>
            <TabPane tab="Informations générales" key="1">
              <Form.Item
                name="intitule"
                label="Intitulé du salon"
                rules={[{ required: true, message: "L'intitulé est requis" }]}
              >
                <Input placeholder="Nom du salon" />
              </Form.Item>

              <Col span={12}>
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
              </Col>

              <Col span={12}>
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
              </Col>

              <Col span={12}>
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
              </Col>

              <Form.Item
                name="motif"
                label="Motif"
              >
                <TextArea rows={2} placeholder="Motif pour le salon" />
              </Form.Item>

              <Divider orientation="left">Responsabilités et Localisation</Divider>

              <Col span={12}>
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
              </Col>

              <Col span={12}>
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
              </Col>

              <Divider orientation="left">Statut du salon</Divider>

              <Col span={12}>
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
              </Col>
            </TabPane>

            <TabPane tab="Dates et objectifs" key="2">
            <Col span={12}>
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
              </Col>

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

              <Col span={12}>
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
              </Col>

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

              <Col span={12}>
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
              </Col>
            </TabPane>

            <TabPane tab="Contacts et résultats" key="4">
            <Col span={12}>
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
              </Col>

              <Col span={12}>
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
              </Col>

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
       

     
      
  );
};

export default Salon;