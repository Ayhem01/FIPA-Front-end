import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Form, Input, DatePicker, InputNumber, Select, Checkbox, Divider,
  Tabs, Row, Col
} from 'antd';
import moment from 'moment';
import {
  fetchPays, fetchSecteurs, fetchInitiateurs
} from "../../../features/marketingSlice";

const { TabPane } = Tabs;
const { TextArea } = Input;

const DemarchageDirect = ({ onChange, initialValues = {}, mainDateDebut }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  // Sélection des données depuis le Redux store
  const { items: pays = [] } = useSelector((state) => state.marketing.pays || {});
  const { items: secteurs = [] } = useSelector((state) => state.marketing.secteurs || {});
  const { items: initiateurs = [] } = useSelector((state) => state.marketing.initiateurs || {});

  // Récupération des données au chargement du composant
  useEffect(() => {
    dispatch(fetchPays());
    dispatch(fetchSecteurs());
    dispatch(fetchInitiateurs());
  }, [dispatch]);

  // Synchroniser mainDateDebut avec le formulaire quand il change
  useEffect(() => {
    if (mainDateDebut) {
      form.setFieldsValue({ date_debut: mainDateDebut });
      handleValuesChange({ date_debut: mainDateDebut }, form.getFieldsValue());
    }
  }, [mainDateDebut, form]);

  // Fonction pour gérer les changements de valeurs
  const handleValuesChange = (changedValues, allValues) => {
    // Formatage des valeurs
    const formattedValues = { ...allValues };

    // Formatage des dates en YYYY-MM-DD
    ['date_debut', 'date_fin', 'date_butoir', 'date_premier_mailing'].forEach(dateField => {
      if (formattedValues[dateField]) {
        if (moment.isMoment(formattedValues[dateField])) {
          formattedValues[dateField] = formattedValues[dateField].format('YYYY-MM-DD');
        } else if (typeof formattedValues[dateField] === 'string' && formattedValues[dateField].includes('T')) {
          formattedValues[dateField] = moment(formattedValues[dateField]).format('YYYY-MM-DD');
        }
      }
    });

    // Conversion des booléens en valeurs explicites
    ['proposee', 'programmee', 'realisee', 'reportee', 'annulee'].forEach(field => {
      if (formattedValues[field] !== undefined) {
        formattedValues[field] = formattedValues[field] ? true : false;
      }
    });

    console.log("Valeurs formatées du démarchage direct:", formattedValues);
    
    if (onChange) {
      onChange(formattedValues);
    }
  };

  // Options pour les selects
  const cadreOptions = [
    { label: "Binôme", value: "binôme" },
    { label: "Vis-à-vis du siège", value: "vis-à-vis du siège" }
  ];

  const conjointeOptions = [
    { label: "Conjointe", value: "conjointe" },
    { label: "Non Conjointe", value: "non conjointe" }
  ];

  const inclureOptions = [
    { label: "Comptabilisée", value: "comptabilisée" },
    { label: "Non comptabilisée", value: "non comptabilisée" }
  ];

  const groupeSecteurOptions = [
    { label: "Aéronautique", value: "Aéronautique" },
    { label: "Composants autos", value: "Composants autos" },
    { label: "Environnement", value: "Environnement" },
    { label: "Offshoring", value: "Offshoring" },
    { label: "Santé", value: "Santé" },
    { label: "Industrie ferroviaire", value: "Industrie ferroviaire" }
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        presentation: '',
        pays_id: undefined,
        regions: '',
        secteur_id: undefined,
        initiateur_id: undefined,
        groupe_secteur: undefined,
        inclure: 'comptabilisée',
        coinjointe: undefined,
        cadre_siege: undefined,
        proposee: false,
        programmee: false,
        realisee: false,
        reportee: false,
        annulee: false,
        date_debut: mainDateDebut ? moment(mainDateDebut) : null,
        ...initialValues
      }}
      onValuesChange={handleValuesChange}
    >
      <Tabs defaultActiveKey="1" type="card" tabBarGutter={32}>
        <TabPane tab="Informations générales" key="1">
          <Form.Item
            name="presentation"
            label="Présentation"
            rules={[{ required: true, message: "La présentation est requise" }]}
          >
            <TextArea placeholder="Présentation du démarchage direct" rows={3} />
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="pays_id"
                label="Pays"
                rules={[{ required: true, message: "Le pays est requis" }]}
              >
                <Select
                  placeholder="Sélectionnez le pays"
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
            </Col>
            <Col span={12}>
              <Form.Item
                name="regions"
                label="Régions"
              >
                <Input placeholder="Régions" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
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
                    <Select.Option key={item.id} value={String(item.id)}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
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
                    <Select.Option key={item.id} value={String(item.id)}>
                      {item.nom}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="groupe_secteur"
                label="Groupe secteur"
              >
                <Select placeholder="Sélectionnez le groupe secteur">
                  {groupeSecteurOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="inclure"
                label="Inclure"
              >
                <Select placeholder="Type d'inclusion">
                  {inclureOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="coinjointe"
                label="Conjointe"
              >
                <Select placeholder="Action conjointe">
                  {conjointeOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="cadre_siege"
                label="Cadre siège"
              >
                <Select placeholder="Cadre siège">
                  {cadreOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Statut du démarchage</Divider>

          <Row gutter={[16, 16]}>
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
          </Row>

          <Row gutter={[16, 16]}>
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
        </TabPane>

        <TabPane tab="Dates et planification" key="2">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="date_debut"
                label="Date de début (synchronisée avec l'action)"
              >
                <DatePicker
                  placeholder="Sélectionnez la date"
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  disabled
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="date_fin"
                label="Date de fin"
                dependencies={['date_debut']}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || !getFieldValue('date_debut')) {
                        return Promise.resolve();
                      }
                      if (moment(value).isAfter(moment(getFieldValue('date_debut'))) ||
                          moment(value).isSame(moment(getFieldValue('date_debut')))) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('La date de fin doit être après ou égale à la date de début'));
                    },
                  }),
                ]}
              >
                <DatePicker placeholder="Sélectionnez la date" style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="date_butoir"
            label="Date butoir"
          >
            <DatePicker placeholder="Sélectionnez la date butoir" style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            name="date_premier_mailing"
            label="Date premier mailing"
          >
            <DatePicker placeholder="Sélectionnez la date du premier mailing" style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            name="dates_relances"
            label="Dates des relances"
          >
            <TextArea placeholder="Dates des relances (format: JJ/MM/AAAA, JJ/MM/AAAA, ...)" rows={2} />
          </Form.Item>
        </TabPane>

        <TabPane tab="Ciblage et démarche" key="3">
          <Form.Item
            name="nb_entreprises_ciblees"
            label="Nombre d'entreprises ciblées"
          >
            <InputNumber placeholder="Nombre" style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item
            name="source_ciblage"
            label="Source du ciblage"
          >
            <TextArea placeholder="Source du ciblage des entreprises" rows={2} />
          </Form.Item>

          <Form.Item
            name="contacts_telephoniques"
            label="Contacts téléphoniques"
          >
            <InputNumber placeholder="Nombre" style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item
            name="lettre_argumentaire"
            label="Lettre argumentaire"
          >
            <TextArea placeholder="Contenu de la lettre argumentaire" rows={3} />
          </Form.Item>
        </TabPane>

        <TabPane tab="Budget et logistique" key="4">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="budget_prevu"
                label="Budget prévu"
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
            <Col span={12}>
              <Form.Item
                name="budget_realise"
                label="Budget réalisé"
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
          </Row>

          <Form.Item
            name="frais_deplacement"
            label="Frais de déplacement"
          >
            <TextArea placeholder="Détails des frais de déplacement" rows={2} />
          </Form.Item>

          <Form.Item
            name="frais_mission"
            label="Frais de mission"
          >
            <TextArea placeholder="Détails des frais de mission" rows={2} />
          </Form.Item>

          <Form.Item
            name="besoins_logistiques"
            label="Besoins logistiques"
          >
            <TextArea placeholder="Détails des besoins logistiques" rows={2} />
          </Form.Item>
        </TabPane>

        <TabPane tab="Résultats et évaluation" key="5">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="nb_reponses_positives"
                label="Nombre de réponses positives"
              >
                <InputNumber placeholder="Nombre" style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contacts_interessants_initiateur"
                label="Contacts intéressants initiateur"
              >
                <InputNumber placeholder="Nombre" style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="contacts_interessants_binome"
            label="Contacts intéressants binôme"
          >
            <InputNumber placeholder="Nombre" style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item
            name="resultat_action"
            label="Résultat de l'action"
          >
            <TextArea placeholder="Détails sur les résultats obtenus" rows={2} />
          </Form.Item>

          <Form.Item
            name="evaluation_action"
            label="Évaluation de l'action"
          >
            <TextArea placeholder="Évaluation générale de l'action" rows={3} />
          </Form.Item>
        </TabPane>
      </Tabs>
    </Form>
  );
};

export default DemarchageDirect;