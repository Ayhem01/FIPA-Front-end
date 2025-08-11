import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Form, Input, DatePicker, InputNumber, Select, Checkbox, Divider,
  Tabs, Row, Col
} from 'antd';
import moment from 'moment';
import {
  fetchPays, fetchGroupes, fetchSecteurs, fetchBinomes, fetchInitiateurs
} from "../../../features/marketingSlice";

const { TabPane } = Tabs;
const { TextArea } = Input;

const SalonsSectoriels = ({ onChange, initialValues = {}, mainDateDebut }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  // Sélection des données depuis le Redux store
  const { items: pays = [] } = useSelector((state) => state.marketing.pays || {});
  const { items: secteurs = [] } = useSelector((state) => state.marketing.secteurs || {});
  const { items: groupes = [] } = useSelector((state) => state.marketing.groupes || {});
  const { items: initiateurs = [] } = useSelector((state) => state.marketing.initiateurs || {});
  const { items: binomes = [] } = useSelector((state) => state.marketing.binomes || {});

  // Récupération des données au chargement du composant
  useEffect(() => {
    dispatch(fetchPays());
    dispatch(fetchSecteurs());
    dispatch(fetchGroupes());
    dispatch(fetchInitiateurs());
    dispatch(fetchBinomes());
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
    ['date_debut', 'date_fin', 'date_butoir'].forEach(dateField => {
      if (formattedValues[dateField]) {
        if (moment.isMoment(formattedValues[dateField])) {
          formattedValues[dateField] = formattedValues[dateField].format('YYYY-MM-DD');
        } else if (typeof formattedValues[dateField] === 'string' && formattedValues[dateField].includes('T')) {
          formattedValues[dateField] = moment(formattedValues[dateField]).format('YYYY-MM-DD');
        }
        // Ajouter un log pour s'assurer que la date est correcte
        console.log(`Date ${dateField} formatée: ${formattedValues[dateField]}`);
      }
    });

    // Conversion des booléens en valeurs explicites
    ['proposee', 'programmee', 'non_programmee', 'validee', 'realisee', 'reportee', 'annulee',
     'objectif_contacts', 'objectif_veille_concurrentielle', 'objectif_veille_technologique', 'objectif_relation_relais']
      .forEach(field => {
        if (formattedValues[field] !== undefined) {
          formattedValues[field] = formattedValues[field] ? true : false;
        }
      });

    // Calculer le total des contacts si les deux champs sont renseignés
    if (formattedValues.contacts_initiateur !== undefined && formattedValues.contacts_binome !== undefined) {
      formattedValues.contacts_total = 
        (parseInt(formattedValues.contacts_initiateur) || 0) + 
        (parseInt(formattedValues.contacts_binome) || 0);
    }

    console.log("Valeurs formatées du salon sectoriel:", formattedValues);
    
    if (onChange) {
      onChange(formattedValues);
    }
  };

  // Options pour les selects
  const categorieOptions = [
    { label: "Incontournable", value: "incontournable" },
    { label: "Prospection simple", value: "Prospection simple" },
    { label: "Nouveau à prospecter", value: "Nouveau à prospecter" }
  ];

  const presenceConjointeOptions = [
    { label: "Conjointe", value: "conjointe" },
    { label: "Non Conjointe", value: "non conjointe" }
  ];

  const inclureOptions = [
    { label: "Comptabiliser", value: "comptabiliser" },
    { label: "Non comptabiliser", value: "non comptabiliser" }
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        intitule: '',
        numero_edition: '',
        organisateur: '',
        pays_id: undefined,
        region: '',
        secteur_id: undefined,
        groupe_id: undefined,
        initiateur_id: undefined,
        binome_id: undefined,
        theme: '',
        site_web: '',
        categorie: undefined,
        convention_affaire: '',
        inclure: 'comptabiliser',
        presence_conjointe: undefined,
        motif: '',
        proposee: false,
        programmee: false,
        non_programmee: false,
        validee: false,
        realisee: false,
        reportee: false,
        annulee: false,
        objectif_contacts: false,
        objectif_veille_concurrentielle: false,
        objectif_veille_technologique: false,
        objectif_relation_relais: false,
        contacts_realises: 0,
        contacts_total: 0,
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
            <Input placeholder="Intitulé du salon" />
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="numero_edition"
                label="Numéro d'édition"
              >
                <Input placeholder="Numéro d'édition" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="organisateur"
                label="Organisateur"
              >
                <Input placeholder="Organisateur du salon" />
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
                name="theme"
                label="Thème"
              >
                <Input placeholder="Thème du salon" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="site_web"
                label="Site web"
              >
                <Input placeholder="Site web du salon" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="categorie"
                label="Catégorie"
              >
                <Select placeholder="Sélectionnez la catégorie">
                  {categorieOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="convention_affaire"
                label="Convention d'affaire"
              >
                <Input placeholder="Convention d'affaire" />
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
                name="presence_conjointe"
                label="Présence conjointe"
              >
                <Select placeholder="Type de présence">
                  {presenceConjointeOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="motif"
            label="Motif"
          >
            <TextArea placeholder="Motif du salon" rows={2} />
          </Form.Item>

          <Divider orientation="left">Statut du salon</Divider>

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

        <TabPane tab="Dates et objectifs" key="2">
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

          <Divider orientation="left">Objectifs</Divider>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item name="objectif_contacts" valuePropName="checked">
                <Checkbox>Contacts</Checkbox>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="objectif_veille_concurrentielle" valuePropName="checked">
                <Checkbox>Veille concurrentielle</Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item name="objectif_veille_technologique" valuePropName="checked">
                <Checkbox>Veille technologique</Checkbox>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="objectif_relation_relais" valuePropName="checked">
                <Checkbox>Relation relais</Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="historique_edition"
            label="Historique des éditions"
          >
            <TextArea placeholder="Historique des éditions précédentes" rows={3} />
          </Form.Item>
        </TabPane>

        <TabPane tab="Organisation et logistique" key="3">
          <Form.Item
            name="stand"
            label="Stand"
          >
            <TextArea placeholder="Informations sur le stand" rows={2} />
          </Form.Item>

          <Form.Item
            name="media"
            label="Média"
          >
            <TextArea placeholder="Informations sur les médias" rows={2} />
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

          <Divider orientation="left">Contacts</Divider>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="contacts_initiateur"
                label="Contacts initiateur"
              >
                <InputNumber placeholder="Nombre" style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contacts_binome"
                label="Contacts binôme"
              >
                <InputNumber placeholder="Nombre" style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="contacts_interessants_initiateur"
                label="Contacts intéressants initiateur"
              >
                <InputNumber placeholder="Nombre" style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contacts_interessants_binome"
                label="Contacts intéressants binôme"
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

          <Divider orientation="left">Résultats et évaluation</Divider>

          <Form.Item
            name="resultat_veille_concurrentielle"
            label="Résultat veille concurrentielle"
          >
            <TextArea placeholder="Résultats de la veille concurrentielle" rows={2} />
          </Form.Item>

          <Form.Item
            name="resultat_veille_technologique"
            label="Résultat veille technologique"
          >
            <TextArea placeholder="Résultats de la veille technologique" rows={2} />
          </Form.Item>

          <Form.Item
            name="relation_institutions"
            label="Relation avec les institutions"
          >
            <TextArea placeholder="Détails sur les relations avec les institutions" rows={2} />
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

export default SalonsSectoriels;