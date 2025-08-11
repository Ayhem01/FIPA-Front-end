import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Tabs, Form, Input, DatePicker, InputNumber, Select, Checkbox, Divider, Row, Col, Upload, Alert, Typography
} from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import moment from 'moment';
import {
  fetchSeminaires, fetchPays, fetchResponsableFipa, fetchBinomes
} from "../../../features/marketingSlice";

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Dragger } = Upload;
const { Text } = Typography;

const Seminaire = ({ onChange, initialValues = {}, mainDateDebut }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  // Sélection des données depuis le Redux store
  const { items: pays, loading: loadingPays } = useSelector((state) =>
    state.marketing.pays || { items: [], loading: false }
  );
  const { items: responsablesFipa, loading: loadingResponsablesFipa } = useSelector((state) =>
    state.marketing.responsableFipa || { items: [], loading: false }
  );
  const { items: binomes, loading: loadingBinomes } = useSelector((state) =>
    state.marketing.binomes || { items: [], loading: false }
  );

  // Récupération des données au chargement du composant
  useEffect(() => {
    dispatch(fetchSeminaires());
    dispatch(fetchPays());
    dispatch(fetchResponsableFipa());
    dispatch(fetchBinomes());
  }, [dispatch]);

  // Effet pour synchroniser la date depuis le formulaire principal
  useEffect(() => {
    if (mainDateDebut) {
      console.log("Mise à jour de la date de début du séminaire:", mainDateDebut);
      form.setFieldsValue({ date_debut: mainDateDebut });

      // Déclencher manuellement une mise à jour pour notifier le parent
      const allValues = form.getFieldsValue();
      handleValuesChange({ date_debut: mainDateDebut }, allValues);
    }
  }, [mainDateDebut, form]);

  // Fonction pour gérer les changements de valeurs
  const handleValuesChange = (changedValues, allValues) => {
    // Formatage des valeurs
    const formattedValues = { ...allValues };

    // Formatage amélioré des dates en YYYY-MM-DD
    ['date_debut', 'date_fin', 'date_butoir'].forEach(dateField => {
      if (formattedValues[dateField]) {
        if (moment.isMoment(formattedValues[dateField])) {
          // Date de Moment.js - format explicite
          formattedValues[dateField] = formattedValues[dateField].format('YYYY-MM-DD');
        } else if (typeof formattedValues[dateField] === 'string' && formattedValues[dateField].includes('T')) {
          // Format ISO - convertir en YYYY-MM-DD
          formattedValues[dateField] = moment(formattedValues[dateField]).format('YYYY-MM-DD');
        }
        // Ajouter un log pour s'assurer que la date est correcte
        console.log(`Date ${dateField} formatée: ${formattedValues[dateField]}`);
      }
    });

    // Conversion des booléens en valeurs explicites
    ['proposee', 'programmee', 'non_programmee', 'validee', 'realisee',
      'reportee', 'annulee', 'presence_dg', 'programme_deroulement'].forEach(field => {
        if (formattedValues[field] !== undefined) {
          formattedValues[field] = formattedValues[field] ? true : false;
        }
      });

    // Majuscule pour la première lettre dans "inclure"
    if (formattedValues.inclure === 'yes') {
      formattedValues.inclure = 'Yes';
    } else if (formattedValues.inclure === 'no') {
      formattedValues.inclure = 'No';
    }

    // Conversion du type de présence conjointe (si nécessaire)
    if (formattedValues.presence_conjointe) {
      formattedValues.presence_conjointe =
        formattedValues.presence_conjointe.charAt(0).toUpperCase() +
        formattedValues.presence_conjointe.slice(1);
    }

    console.log("Valeurs formatées du séminaire:", formattedValues);

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
        responsable_fipa_id: undefined,
        binome_id: undefined,
        inclure: 'yes',
        proposee_par: '',
        motif: '',
        proposee: false,
        programmee: false,
        non_programmee: false,
        validee: false,
        realisee: false,
        reportee: false,
        annulee: false,
        presence_conjointe: undefined,
        type_participation: undefined,
        type_organisation: undefined,
        diaspora: undefined,
        objectifs: '',
        partenaires_tunisiens: '',
        partenaires_etrangers: '',
        officiels: '',
        presence_dg: false,
        programme_deroulement: false,
        diaspora_details: '',
        location_salle: '',
        media_communication: '',
        besoin_binome: '',
        autre_organisme: '',
        outils_promotionnels: '',
        details_participation_active: '',
        budget_prevu: 0,
        budget_realise: 0,
        nb_entreprises: 0,
        nb_multiplicateurs: 0,
        nb_institutionnels: 0,
        nb_articles_presse: 0,
        evalutation_recommandation: '',
        date_debut: mainDateDebut ? moment(mainDateDebut) : null,
        ...initialValues
      }}
      onValuesChange={handleValuesChange}
    >
      <Tabs defaultActiveKey="1" type="card" tabBarGutter={32}>
        {/* Onglet 1 : Informations générales */}
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
                name="responsable_fipa_id"
                label="Responsable FIPA"
                rules={[{ required: true, message: "Le responsable FIPA est requis" }]}
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
            </Col>
            <Col span={12}>
              <Form.Item
                name="binome_id"
                label="Binôme"
                rules={[{ required: true, message: "Le binôme est requis" }]}
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
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="inclure"
                label="Inclure"
              >
                <Select placeholder="Inclure ou non">
                  <Select.Option value="yes">Oui</Select.Option>
                  <Select.Option value="no">Non</Select.Option>
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

        {/* Onglet 2 : Dates et participation */}
        <TabPane tab="Dates et participation" key="2">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              {/* DatePicker pour date_debut */}
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

                      // Convertir en moment pour la comparaison
                      const dateDebut = moment(getFieldValue('date_debut'));
                      const dateFin = moment(value);

                      if (dateFin.isSameOrAfter(dateDebut, 'day')) {
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
                  onChange={(date) => {
                    // Force le formatage correct immédiatement
                    if (date) {
                      console.log("Date fin sélectionnée:", date.format('YYYY-MM-DD'));
                    }
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="date_butoir"
            label="Date butoir"
          >
            <DatePicker
              placeholder="Sélectionnez la date butoir"
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              onChange={(date) => {
                if (date) {
                  console.log("Date butoir sélectionnée:", date.format('YYYY-MM-DD'));
                }
              }}
            />
          </Form.Item>

          <Form.Item
            name="objectifs"
            label="Objectifs"
          >
            <TextArea placeholder="Objectifs du séminaire" rows={3} />
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="presence_conjointe"
                label="Présence conjointe"
              >
                <Select placeholder="Sélectionnez le type de présence">
                  <Select.Option value="Conjointe">Conjointe</Select.Option>
                  <Select.Option value="Non Conjointe">Non Conjointe</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type_participation"
                label="Type de participation"
              >
                <Select placeholder="Sélectionnez le type de participation">
                  <Select.Option value="Co-organisateur">Co-organisateur</Select.Option>
                  <Select.Option value="Participation active">Participation active</Select.Option>
                  <Select.Option value="Simple présence">Simple présence</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="details_participation_active"
            label="Détails de la participation active"
          >
            <TextArea placeholder="Détails sur la participation active" rows={2} />
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
        </TabPane>

        {/* Onglet 3 : Partenaires et organisation */}
        <TabPane tab="Partenaires et organisation" key="3">
          <Form.Item
            name="type_organisation"
            label="Type d'organisation"
          >
            <Select placeholder="Sélectionnez le type d'organisation">
              <Select.Option value="partenaires étrangers">Partenaires étrangers</Select.Option>
              <Select.Option value="partenaires tunisiens">Partenaires tunisiens</Select.Option>
              <Select.Option value="les deux à la fois">Les deux à la fois</Select.Option>
            </Select>
          </Form.Item>

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

          <Form.Item
            name="autre_organisme"
            label="Autres organismes"
          >
            <TextArea placeholder="Détails sur les autres organismes impliqués" rows={2} />
          </Form.Item>

          <Divider orientation="left">Logistique</Divider>

          <Form.Item
            name="location_salle"
            label="Location de salle"
          >
            <TextArea placeholder="Informations sur la location de salle" rows={2} />
          </Form.Item>

          <Form.Item
            name="outils_promotionnels"
            label="Outils promotionnels"
          >
            <TextArea placeholder="Description des outils promotionnels utilisés" rows={2} />
          </Form.Item>

          <Form.Item
            name="media_communication"
            label="Médias et communication"
          >
            <TextArea placeholder="Plan médias et communication" rows={2} />
          </Form.Item>

          <Form.Item
            name="besoin_binome"
            label="Besoins du binôme"
          >
            <TextArea placeholder="Besoins spécifiques du binôme" rows={2} />
          </Form.Item>
        </TabPane>

        {/* Onglet 4 : Budget et résultats */}
        <TabPane tab="Budget et résultats" key="4">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="budget_prevu"
                label="Budget prévu"
              >
                <InputNumber placeholder="Montant" style={{ width: '100%' }} min={0} step={0.01} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="budget_realise"
                label="Budget réalisé"
              >
                <InputNumber placeholder="Montant" style={{ width: '100%' }} min={0} step={0.01} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Diaspora</Divider>

          <Form.Item
            name="diaspora"
            label="Diaspora"
          >
            <Select placeholder="Sélectionnez le type de relation avec la diaspora">
              <Select.Option value="Pour la diaspora">Pour la diaspora</Select.Option>
              <Select.Option value="Avec la diaspora">Avec la diaspora</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="diaspora_details"
            label="Détails de la diaspora"
          >
            <TextArea placeholder="Détails sur l'implication de la diaspora" rows={2} />
          </Form.Item>
        </TabPane>

        {/* Nouvel onglet 5 : Évaluation et statistiques */}
        <TabPane tab="Évaluation et statistiques" key="5">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="nb_entreprises"
                label="Nombre d'entreprises participantes"
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
            name="evalutation_recommandation"
            label="Évaluation et recommandations"
          >
            <TextArea placeholder="Évaluation et recommandations pour les prochains événements" rows={4} />
          </Form.Item>
        </TabPane>
      </Tabs>
    </Form>
  );
};

export default Seminaire;