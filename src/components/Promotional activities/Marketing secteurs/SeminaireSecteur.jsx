import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Form, Input, DatePicker, InputNumber, Select, Checkbox, Divider,
  Tabs, Row, Col
} from 'antd';
import moment from 'moment';
import {
  fetchPays, fetchGroupes, fetchSecteurs, fetchBinomes, fetchResponsableFipa
} from "../../../features/marketingSlice";

const { TabPane } = Tabs;
const { TextArea } = Input;

const SeminaireSecteur = ({ onChange, initialValues = {}, mainDateDebut }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  // Sélection des données depuis le Redux store
  const { items: pays = [] } = useSelector((state) => state.marketing.pays || {});
  const { items: secteurs = [] } = useSelector((state) => state.marketing.secteurs || {});
  const { items: groupes = [] } = useSelector((state) => state.marketing.groupes || {});
  const { items: responsablesFipa = [] } = useSelector((state) => state.marketing.responsableFipa || {});
  const { items: binomes = [] } = useSelector((state) => state.marketing.binomes || {});

  // Récupération des données au chargement du composant
  useEffect(() => {
    dispatch(fetchPays());
    dispatch(fetchSecteurs());
    dispatch(fetchGroupes());
    dispatch(fetchResponsableFipa());
    dispatch(fetchBinomes());
  }, [dispatch]);

  // Synchroniser mainDateDebut avec le formulaire quand il change
  useEffect(() => {
    if (mainDateDebut) {
      form.setFieldsValue({ date_debut: mainDateDebut });
      handleValuesChange({ date_debut: mainDateDebut }, form.getFieldsValue());
    }
  }, [mainDateDebut, form]);

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
    { label: "Co-organisateur", value: "Co-organisateur" },
    { label: "Participation active", value: "Participation active" },
    { label: "Simple présence", value: "simple présence" }
  ];
  
  const typeOrganisationOptions = [
    { label: "Partenaires étrangers", value: "partenaires étrangers" },
    { label: "Partenaires tunisiens", value: "partenaires tunisiens" },
    { label: "Les deux à la fois", value: "les deux à la fois" }
  ];
  
  const diasporaOptions = [
    { label: "Organisée pour la diaspora", value: "organisée pour la diaspora" },
    { label: "Organisée avec la diaspora", value: "organisée avec la diaspora" }
  ];

  // Fonction pour gérer les changements de valeurs
  const handleValuesChange = (changedValues, allValues) => {
    // Formatage des valeurs
    const formattedValues = { ...allValues };

    // Formatage des dates en YYYY-MM-DD
    ['date_debut', 'date_fin', 'date_butoir'].forEach(dateField => {
      if (formattedValues[dateField]) {
        if (moment.isMoment(formattedValues[dateField])) {
          formattedValues[dateField] = formattedValues[dateField].format('YYYY-MM-DD');
        } else if (typeof formattedValues[dateField] === 'string' && formattedValues[dateField].includes('T')) {
          formattedValues[dateField] = moment(formattedValues[dateField]).format('YYYY-MM-DD');
        }
        console.log(`Date ${dateField} formatée: ${formattedValues[dateField]}`);
      }
    });

    // Conversion des booléens en valeurs explicites
    ['proposee', 'programmee', 'non_programmee', 'validee', 'realisee', 'reportee', 'annulee', 
     'presence_dg', 'programme_deroulement'].forEach(field => {
      if (formattedValues[field] !== undefined) {
        formattedValues[field] = formattedValues[field] ? true : false;
      }
    });

    console.log("Valeurs formatées du séminaire secteur:", formattedValues);
    
    if (onChange) {
      onChange(formattedValues);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        intitule: '',
        theme: '',
        lieu: '',
        pays_id: undefined,
        region: '',
        secteur_id: undefined,
        groupe_id: undefined,
        responsable_fipa_id: undefined,
        binome_id: undefined,
        inclure: 'comptabilisée',
        proposee_par: '',
        motif: '',
        proposee: false,
        programmee: false,
        non_programmee: false,
        validee: false,
        realisee: false,
        reportee: false,
        annulee: false,
        presence_dg: false,
        programme_deroulement: false,
        contacts_realises: 0,
        date_debut: mainDateDebut ? moment(mainDateDebut) : null,
        ...initialValues
      }}
      onValuesChange={handleValuesChange}
    >
      <Tabs defaultActiveKey="1" type="card" tabBarGutter={32}>
        <TabPane tab="Informations générales" key="1">
          <Form.Item
            name="intitule"
            label="Intitulé"
            rules={[{ required: true, message: "L'intitulé est requis" }]}
          >
            <Input placeholder="Intitulé du séminaire" />
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="theme"
                label="Thème"
              >
                <Input placeholder="Thème du séminaire" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lieu"
                label="Lieu"
              >
                <Input placeholder="Lieu du séminaire" />
              </Form.Item>
            </Col>
          </Row>

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
                name="region"
                label="Région"
              >
                <Input placeholder="Région" />
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
                name="groupe_id"
                label="Groupe"
                rules={[{ required: true, message: "Le groupe est requis" }]}
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
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="responsable_fipa_id"
                label="Responsable FIPA"
                rules={[{ required: true, message: "Le responsable FIPA est requis" }]}
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
            </Col>
            <Col span={12}>
              <Form.Item
                name="binome_id"
                label="Binôme"
                rules={[{ required: true, message: "Le binôme est requis" }]}
              >
                <Select
                  placeholder="Sélectionnez le binôme"
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
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
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
            <Col span={12}>
              <Form.Item
                name="proposee_par"
                label="Proposé par"
              >
                <Input placeholder="Nom de la personne" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="motif"
            label="Motif"
          >
            <TextArea placeholder="Motif du séminaire" rows={2} />
          </Form.Item>

          <Divider orientation="left">Statut du séminaire</Divider>

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
              <Form.Item name="non_programmee" valuePropName="checked">
                <Checkbox>Non programmée</Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form.Item name="validee" valuePropName="checked">
                <Checkbox>Validée</Checkbox>
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
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form.Item name="annulee" valuePropName="checked">
                <Checkbox>Annulée</Checkbox>
              </Form.Item>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Dates et participation" key="2">
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

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="action_conjointe"
                label="Action conjointe"
              >
                <Select placeholder="Type d'action">
                  {actionConjointeOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type_participation"
                label="Type de participation"
              >
                <Select placeholder="Sélectionnez le type">
                  {typeParticipationOptions.map(option => (
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
                name="type_organisation"
                label="Type d'organisation"
              >
                <Select placeholder="Sélectionnez le type">
                  {typeOrganisationOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="avec_diaspora"
                label="Relation avec la diaspora"
              >
                <Select placeholder="Type de relation">
                  {diasporaOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

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

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item name="presence_dg" valuePropName="checked">
                <Checkbox>Présence du DG</Checkbox>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="programme_deroulement" valuePropName="checked">
                <Checkbox>Programme de déroulement</Checkbox>
              </Form.Item>
            </Col>
          </Row>

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

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="nb_entreprises"
                label="Nombre d'entreprises"
              >
                <InputNumber placeholder="Nombre" style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nb_multiplicateurs"
                label="Nombre de multiplicateurs"
              >
                <InputNumber placeholder="Nombre" style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="nb_institutionnels"
                label="Nombre d'institutionnels"
              >
                <InputNumber placeholder="Nombre" style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nb_articles_presse"
                label="Nombre d'articles de presse"
              >
                <InputNumber placeholder="Nombre" style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="contacts_realises"
            label="Contacts réalisés"
          >
            <InputNumber placeholder="Nombre" style={{ width: '100%' }} min={0} />
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
  );
};

export default SeminaireSecteur;