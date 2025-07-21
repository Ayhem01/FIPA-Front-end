// src/components/Projects/ProjectFilters.jsx
import React, { useEffect, useState } from 'react';
import { Form, Select, Button, Row, Col, Card, Collapse } from 'antd';
import { FilterOutlined, ClearOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPipelineTypes, getPipelineStages } from '../../features/projectSlice';

const { Option } = Select;
const { Panel } = Collapse;

const ProjectFilters = ({ onFilterChange, onClearFilters, currentFilters }) => {
  const [form] = Form.useForm();
  const [sectors, setSectors] = useState([]);
  const [governorates, setGovernorates] = useState([]);
  const dispatch = useDispatch();
  const { pipelineTypes, pipelineStages } = useSelector(state => state.projects);
  const [loading, setLoading] = useState(false);
  
  // Charger les données de référence lors du montage du composant
  useEffect(() => {
    const fetchReferenceData = async () => {
      setLoading(true);
      try {
        // Charger les secteurs et gouvernorats via axios
        const [sectorsRes, governoratesRes] = await Promise.all([
          axios.get('/api/sectors'),
          axios.get('/api/governorates')
        ]);
        
        setSectors(sectorsRes.data);
        setGovernorates(governoratesRes.data);
        
        // Charger les types de pipeline via Redux
        dispatch(fetchPipelineTypes());
      } catch (error) {
        console.error('Erreur lors du chargement des données de référence:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReferenceData();
  }, [dispatch]);
  
  // Mettre à jour les étapes du pipeline lorsque le type de pipeline change
  useEffect(() => {
    const pipelineTypeId = form.getFieldValue('pipeline_type_id');
    if (pipelineTypeId) {
      dispatch(getPipelineStages(pipelineTypeId));
    }
  }, [form.getFieldValue('pipeline_type_id'), dispatch]);

  // Mettre à jour le formulaire lorsque les filtres externes changent
  useEffect(() => {
    form.setFieldsValue(currentFilters);
  }, [currentFilters, form]);
  
  const handleFormSubmit = (values) => {
    onFilterChange(values);
  };
  
  const handleReset = () => {
    form.resetFields();
    onClearFilters();
  };
  
  const handlePipelineTypeChange = (value) => {
    form.setFieldsValue({ pipeline_stage_id: undefined });
    if (value) {
      dispatch(getPipelineStages(value));
    }
  };
  
  return (
    <Card size="small">
      <Collapse ghost>
        <Panel 
          header={
            <span>
              <FilterOutlined /> Filtres avancés
            </span>
          } 
          key="1"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFormSubmit}
            initialValues={currentFilters}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="status" label="Statut">
                  <Select placeholder="Sélectionnez un statut" allowClear>
                    <Option value="idea">Idée</Option>
                    <Option value="in_progress">En cours</Option>
                    <Option value="in_production">En production</Option>
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="sector_id" label="Secteur">
                  <Select 
                    placeholder="Sélectionnez un secteur" 
                    allowClear
                    loading={loading}
                  >
                    {sectors.map(sector => (
                      <Option key={sector.id} value={sector.id}>{sector.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="governorate_id" label="Gouvernorat">
                  <Select 
                    placeholder="Sélectionnez un gouvernorat" 
                    allowClear
                    loading={loading}
                  >
                    {governorates.map(governorate => (
                      <Option key={governorate.id} value={governorate.id}>{governorate.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="pipeline_type_id" label="Type de pipeline">
                  <Select 
                    placeholder="Sélectionnez un type" 
                    allowClear
                    loading={pipelineTypes.loading}
                    onChange={handlePipelineTypeChange}
                  >
                    {pipelineTypes.items.map(type => (
                      <Option key={type.id} value={type.id}>{type.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="pipeline_stage_id" label="Étape du pipeline">
                  <Select 
                    placeholder="Sélectionnez une étape" 
                    allowClear
                    loading={pipelineStages.loading}
                    disabled={!form.getFieldValue('pipeline_type_id')}
                  >
                    {pipelineStages.items.map(stage => (
                      <Option key={stage.id} value={stage.id}>{stage.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24}>
                <Form.Item>
                  <Button type="primary" htmlType="submit" icon={<FilterOutlined />} style={{ marginRight: 8 }}>
                    Filtrer
                  </Button>
                  <Button onClick={handleReset} icon={<ClearOutlined />}>
                    Réinitialiser
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Panel>
      </Collapse>
    </Card>
  );
};

export default ProjectFilters;