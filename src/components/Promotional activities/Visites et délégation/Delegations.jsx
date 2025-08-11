import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Input, Select, DatePicker, Upload, Button, Tabs, Row, Col } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import moment from 'moment';
import {
  fetchNationalites,
  fetchSecteurs,
  fetchGroupes,
  fetchInitiateurs,
  fetchResponsableFipa,
} from '../../../features/marketingSlice';

const { TabPane } = Tabs;
const { TextArea } = Input;

const Delegations = ({ onChange }) => {
  const dispatch = useDispatch();

  // Sélection des données depuis le Redux store
  const { items: nationalites, loading: loadingNationalites } = useSelector(
    (state) => state.marketing.nationalites
  );
  const { items: secteurs, loading: loadingSecteurs } = useSelector(
    (state) => state.marketing.secteurs
  );
  const { items: groupes, loading: loadingGroupes } = useSelector(
    (state) => state.marketing.groupes
  );
  const { items: initiateurs, loading: loadingInitiateurs } = useSelector(
    (state) => state.marketing.initiateurs
  );
  const { items: responsableFipa, loading: loadingResponsableFipa } = useSelector(
    (state) => state.marketing.responsableFipa
  );

  // Récupération des données au chargement du composant
  useEffect(() => {
    dispatch(fetchNationalites());
    dispatch(fetchSecteurs());
    dispatch(fetchGroupes());
    dispatch(fetchInitiateurs());
    dispatch(fetchResponsableFipa());
  }, [dispatch]);

  return (
    <Tabs defaultActiveKey="1" type="card" tabBarGutter={32}>
      <TabPane tab="Informations générales" key="1">
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              name="delegation"
              label="Délégation"
              rules={[{ required: true, message: 'Le champ Délégation est requis' }]}
            >
              <Input placeholder="Nom de la délégation" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="nationalite_id"
              label="Nationalité"
              rules={[{ required: true, message: 'Le champ Nationalité est requis' }]}
            >
              <Select
                placeholder="Sélectionnez la nationalité"
                loading={loadingNationalites}
                showSearch
                optionFilterProp="children"
              >
                {nationalites.map((item) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="date_visite"
              label="Date de visite"
              rules={[{ required: true, message: 'Le champ Date de visite est requis' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                onChange={(date) => onChange({ date_visite: date ? moment(date).format('YYYY-MM-DD') : null })}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="secteur_id"
              label="Secteur"
              rules={[{ required: true, message: 'Le champ Secteur est requis' }]}
            >
              <Select
                placeholder="Sélectionnez le secteur"
                loading={loadingSecteurs}
                showSearch
                optionFilterProp="children"
              >
                {secteurs.map((item) => (
                  <Select.Option key={item.id} value={item.id}>
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
              rules={[{ required: true, message: 'Le champ Groupe est requis' }]}
            >
              <Select
                placeholder="Sélectionnez le groupe"
                loading={loadingGroupes}
                showSearch
                optionFilterProp="children"
              >
                {groupes.map((item) => (
                  <Select.Option key={item.id} value={item.id}>
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
              rules={[{ required: true, message: 'Le champ Initiateur est requis' }]}
            >
              <Select
                placeholder="Sélectionnez l'initiateur"
                loading={loadingInitiateurs}
                showSearch
                optionFilterProp="children"
              >
                {initiateurs.map((item) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="responsable_fipa_id"
              label="Responsable FIPA"
              rules={[{ required: true, message: 'Le champ Responsable FIPA est requis' }]}
            >
              <Select
                placeholder="Sélectionnez le responsable FIPA"
                loading={loadingResponsableFipa}
                showSearch
                optionFilterProp="children"
              >
                {responsableFipa.map((item) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.nom}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </TabPane>
      <TabPane tab="Coordonnées" key="2">
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <label>Contact</label>
            <Input
              name="contact"
              placeholder="Personne à contacter"
              onChange={(e) => handleValuesChange('contact', e.target.value)}
            />
          </Col>
          <Col span={12}>
            <label>Fonction</label>
            <Input
              name="fonction"
              placeholder="Fonction du contact"
              onChange={(e) => handleValuesChange('fonction', e.target.value)}
            />
          </Col>
          <Col span={24}>
            <label>Adresse</label>
            <Input
              name="adresse"
              placeholder="Adresse"
              onChange={(e) => handleValuesChange('adresse', e.target.value)}
            />
          </Col>
          <Col span={12}>
            <label>Téléphone</label>
            <Input
              name="telephone"
              placeholder="Numéro de téléphone"
              onChange={(e) => handleValuesChange('telephone', e.target.value)}
            />
          </Col>
          <Col span={12}>
            <label>Fax</label>
            <Input
              name="fax"
              placeholder="Numéro de fax"
              onChange={(e) => handleValuesChange('fax', e.target.value)}
            />
          </Col>
          <Col span={24}>
            <label>Email</label>
            <Input
              name="email_site"
              placeholder="Email ou site web"
              onChange={(e) => handleValuesChange('email_site', e.target.value)}
            />
          </Col>
          <Col span={24}>
            <label>Activité</label>
            <Input
              name="activite"
              placeholder="Activité principale"
              onChange={(e) => handleValuesChange('activite', e.target.value)}
            />
          </Col>
        </Row>
      </TabPane>
      <TabPane tab="Programme et membres" key="3">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              name="programme_visite"
              label="Programme de visite"
              rules={[{ required: true, message: 'Le champ Programme de visite est requis' }]}
            >
              <TextArea rows={4} placeholder="Détails du programme de visite" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="evaluation_suivi"
              label="Évaluation et suivi"
              rules={[{ required: true, message: 'Le champ Évaluation et suivi est requis' }]}
            >
              <TextArea rows={4} placeholder="Évaluation et suivi de la délégation" />
            </Form.Item>
          </Col>
        </Row>
      </TabPane>
    </Tabs>
  );
};

export default Delegations;