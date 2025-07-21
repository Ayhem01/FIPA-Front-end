import React, { useEffect, useState } from 'react';
import {
    Form, Input, Button, Card, Select, InputNumber,Radio,
    Row, Col, Divider, Space, Spin, Alert, DatePicker,
    Switch, Typography, message
} from 'antd';
import {
    SaveOutlined, ArrowLeftOutlined, LoadingOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
    createProject, getProjectById, updateProject, resetOperation,
    fetchPipelineTypes, getPipelineStages, fetchSecteurs
} from '../../features/projectSlice';
import TextArea from 'antd/es/input/TextArea';
import { fetchAllUsers } from '../../features/userSlice';
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;

const ProjectForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedPipelineType, setSelectedPipelineType] = useState(null);

    // Sélecteurs Redux avec protection contre les valeurs undefined
    const selectedProject = useSelector(state => state.projects?.selectedProject) || {};
    const operation = useSelector(state => state.projects?.operation) || {};
    const secteurs = useSelector(state => state.projects?.secteurs?.items) || [];
    const secteursLoading = useSelector(state => state.projects?.secteurs?.loading) || false;

    const [localUsers, setLocalUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);


    const pipelineTypes = useSelector(state => state.projects?.pipelineTypes?.items) || [];
    const pipelineTypesLoading = useSelector(state => state.projects?.pipelineTypes?.loading) || false;
    const pipelineStages = useSelector(state => state.projects?.pipelineStages?.items) || [];
    const pipelineStagesLoading = useSelector(state => state.projects?.pipelineStages?.loading) || false;

    // Extraire les données du projet sélectionné
    const {
        loading: projectLoading = false,
        error: projectError = null,
        data: project = null
    } = selectedProject;

    // Extraire les données d'opération
    const {
        type: operationType = null,
        loading: operationLoading = false,
        success: operationSuccess = false,
        error: operationError = null
    } = operation;

    // Déterminer si nous sommes en mode édition
    const isEditMode = !!id;

    // Debug de l'état Redux des secteurs et des utilisateurs
    useEffect(() => {
        console.log("État Redux des secteurs:", secteurs);
    }, [secteurs]);

    // Charger les données initiales
    useEffect(() => {
        console.log("Chargement des données initiales...");

        // Chargement des données en parallèle pour plus d'efficacité
        Promise.all([
            dispatch(fetchSecteurs()),
            dispatch(fetchAllUsers()),
            dispatch(fetchPipelineTypes({ is_active: true }))
        ]).then(([secteursResponse, usersResponse, typesResponse]) => {
            console.log("Secteurs chargés:", secteursResponse.payload);
            console.log("Utilisateurs chargés:", usersResponse.payload);
        });

        // Si en mode édition, charger le projet
        if (isEditMode) {
            dispatch(getProjectById(id));
        }

        // Nettoyage
        return () => {
            dispatch(resetOperation());
        };
    }, [dispatch, isEditMode, id]);

    // Remplir le formulaire en mode édition
    useEffect(() => {
        if (isEditMode && project) {
            console.log("Préparation des données du projet pour le formulaire:", project);

            const formValues = {
                ...project,
                secteur_id: project.secteur?.id,
                responsable_id: project.responsable?.id,
                pipeline_type_id: project.pipeline_type_id,
                pipeline_stage_id: project.pipeline_stage_id,
                start_date: project.start_date ? moment(project.start_date) : null,
                expected_end_date: project.expected_end_date ? moment(project.expected_end_date) : null,
            };

            console.log("Valeurs préparées pour le formulaire:", formValues);
            form.setFieldsValue(formValues);

            if (project.pipeline_type_id) {
                setSelectedPipelineType(project.pipeline_type_id);
                dispatch(getPipelineStages(project.pipeline_type_id));
            }
        }
    }, [isEditMode, project, form, dispatch]);

    // Gérer le changement de type de pipeline
    const handlePipelineTypeChange = (value) => {
        setSelectedPipelineType(value);
        if (value) {
            dispatch(getPipelineStages(value));
        } else {
            form.setFieldValue('pipeline_stage_id', null);
        }
    };

    // Soumission du formulaire
    const handleSubmit = (values) => {
        setIsSubmitting(true);

        const formattedValues = {
            ...values,
            secteur_id: values.secteur_id,
            start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : null,
            expected_end_date: values.expected_end_date ? values.expected_end_date.format('YYYY-MM-DD') : null,
        };

        console.log("Données à envoyer:", formattedValues);

        if (isEditMode) {
            dispatch(updateProject({ id, data: formattedValues }));
        } else {
            dispatch(createProject(formattedValues));
        }
    };

    // Gérer les résultats de l'opération
    useEffect(() => {
        if (operationSuccess) {
            setIsSubmitting(false);
            message.success(`Projet ${isEditMode ? 'mis à jour' : 'créé'} avec succès`);
            navigate('/projects');
        } else if (operationError) {
            setIsSubmitting(false);
            message.error("Erreur lors de l'opération: " + operationError);
        }
    }, [operationSuccess, operationError, isEditMode, navigate]);

    useEffect(() => {
        const loadUsers = async () => {
            setUsersLoading(true);
            try {
                const response = await dispatch(fetchAllUsers()).unwrap();

                // Traitement des données selon la structure de l'API (comme dans TaskCreateModal)
                const usersList = Array.isArray(response) ? response :
                    (response.data ? response.data : []);

                console.log("Utilisateurs chargés avec succès:", usersList);
                setLocalUsers(usersList);
            } catch (error) {
                console.error("Erreur lors du chargement des utilisateurs:", error);
            } finally {
                setUsersLoading(false);
            }
        };

        if (localStorage.getItem('token')) {
            loadUsers();
        }
    }, [dispatch]);

    // Gérer l'annulation
    const handleCancel = () => {
        navigate('/projects');
    };

    // Afficher un spinner pendant le chargement
    if (isEditMode && projectLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} />
                <p>Chargement des données du projet...</p>
            </div>
        );
    }

    // Afficher une erreur si le chargement du projet a échoué
    if (isEditMode && projectError && !project) {
        return (
            <Alert
                message="Erreur"
                description={`Impossible de charger les détails du projet: ${projectError}`}
                type="error"
                showIcon
                action={<Button onClick={handleCancel}>Retour à la liste</Button>}
            />
        );
    }
    
    return (
      <div className="project-form-container" style={{ padding: '20px' }}>
        <Card>
          {/* ... code existant */}
          
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              is_active: true,
              idea: true,
              in_progress: false,
              in_production: false,
              is_blocked: false,
              market_target: 'local',
              foreign_percentage: 0,
              contact_source: 'direct'
            }}
          >
            {/* Informations de base - déjà présent */}
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="title"
                  label="Titre du projet"
                  rules={[{ required: true, message: 'Veuillez entrer le titre du projet' }]}
                >
                  <Input placeholder="Nom du projet" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="company_name"
                  label="Nom de l'entreprise"
                  rules={[{ required: true, message: "Veuillez entrer le nom de l'entreprise" }]}
                >
                  <Input placeholder="Nom de l'entreprise" />
                </Form.Item>
              </Col>
            </Row>
  
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item name="description" label="Description">
                  <TextArea rows={4} placeholder="Description détaillée du projet" />
                </Form.Item>
              </Col>
            </Row>
  
            <Divider>Classification et responsable</Divider>
  
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="secteur_id"
                  label="Secteur"
                  rules={[{ required: true, message: 'Veuillez sélectionner un secteur' }]}
                >
                  <Select
                    id="secteur_id"
                    placeholder="Sélectionner un secteur"
                    loading={secteursLoading}
                    showSearch
                    optionFilterProp="children"
                    notFoundContent={secteursLoading ? <Spin size="small" /> : "Aucun secteur disponible"}
                  >
                    {Array.isArray(secteurs) && secteurs.map(secteur => (
                      <Option key={secteur.id} value={secteur.id}>
                        {secteur.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="responsable_id"
                  label="Responsable"
                  rules={[{ required: true, message: 'Le responsable du projet est obligatoire' }]}
                >
                  <Select
                    id="responsable_id"
                    placeholder="Sélectionner un responsable"
                    loading={usersLoading}
                    showSearch
                    optionFilterProp="children"
                    allowClear
                    notFoundContent={usersLoading ? <Spin size="small" /> : "Aucun utilisateur disponible"}
                  >
                    {localUsers.length > 0 ? (
                      localUsers.map(user => (
                        <Option key={user.id} value={user.id}>
                          {user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || `Utilisateur ${user.id}`}
                        </Option>
                      ))
                    ) : (
                      <Option disabled value="no-users">Aucun utilisateur disponible</Option>
                    )}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
  
            {/* Détails de marché et investissement - NOUVEAUX CHAMPS */}
            <Divider>Détails marché et investissement</Divider>
            
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item name="market_target" label="Marché cible">
                  <Radio.Group>
                    <Radio value="local">Local</Radio>
                    <Radio value="export">Export</Radio>
                    <Radio value="both">Les deux</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="nationality" label="Nationalité">
                  <Input placeholder="Nationalité de l'entreprise" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="foreign_percentage" label="Pourcentage étranger (%)">
                  <InputNumber 
                    style={{ width: '100%' }}
                    min={0}
                    max={100}
                    formatter={value => `${value}%`}
                    parser={value => value.replace('%', '')}
                  />
                </Form.Item>
              </Col>
            </Row>
  
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item name="investment_amount" label="Montant d'investissement (DT)">
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\s?DT|\s|,/g, '')}
                    placeholder="Montant en DT"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="jobs_expected" label="Nombre d'emplois prévus">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="Nombre d'emplois"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="industrial_zone" label="Zone industrielle">
                  <Input placeholder="Zone industrielle" />
                </Form.Item>
              </Col>
            </Row>
  
            <Divider>Progression et pipeline</Divider>
  
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="pipeline_type_id" label="Type de pipeline">
                  <Select
                    placeholder="Sélectionner un type de pipeline"
                    loading={pipelineTypesLoading}
                    onChange={handlePipelineTypeChange}
                    allowClear
                    notFoundContent={pipelineTypesLoading ? <Spin size="small" /> : "Aucun type disponible"}
                  >
                    {Array.isArray(pipelineTypes) && pipelineTypes.map(type => (
                      <Option key={type.id} value={type.id}>{type.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="pipeline_stage_id" label="Étape du pipeline">
                  <Select
                    placeholder={selectedPipelineType ? "Sélectionner une étape" : "Veuillez d'abord sélectionner un type de pipeline"}
                    loading={pipelineStagesLoading}
                    disabled={!selectedPipelineType}
                    allowClear
                    notFoundContent={pipelineStagesLoading ? <Spin size="small" /> : "Aucune étape disponible"}
                  >
                    {Array.isArray(pipelineStages) && pipelineStages.map(stage => (
                      <Option key={stage.id} value={stage.id}>{stage.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
  
            <Row gutter={16}>
              <Col xs={24} md={6}>
                <Form.Item name="idea" label="Idée" valuePropName="checked">
                  <Switch checkedChildren="Oui" unCheckedChildren="Non" />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="in_progress" label="En cours" valuePropName="checked">
                  <Switch checkedChildren="Oui" unCheckedChildren="Non" />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="in_production" label="En production" valuePropName="checked">
                  <Switch checkedChildren="Oui" unCheckedChildren="Non" />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="is_blocked" label="Bloqué" valuePropName="checked">
                  <Switch checkedChildren="Oui" unCheckedChildren="Non" />
                </Form.Item>
              </Col>
            </Row>
  
            {/* Origine du projet - NOUVEAUX CHAMPS */}
            <Divider>Origine du projet</Divider>
            
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item name="contact_source" label="Source du contact">
                  <Select placeholder="Sélectionner une source">
                    <Option value="action_promo">Action promotionnelle</Option>
                    <Option value="visite">Visite</Option>
                    <Option value="reference">Référence</Option>
                    <Option value="salon">Salon</Option>
                    <Option value="direct">Direct</Option>
                    <Option value="autre">Autre</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="initial_contact_person" label="Personne de contact initial">
                  <Input placeholder="Nom de la personne" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="first_contact_date" label="Date du premier contact">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Sélectionner une date"
                  />
                </Form.Item>
              </Col>
            </Row>
  
            <Divider>Planification</Divider>
  
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item name="start_date" label="Date de début">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Sélectionner une date"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="expected_end_date" label="Date de fin prévue">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Sélectionner une date"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="end_date" label="Date de fin réelle">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Sélectionner une date"
                  />
                </Form.Item>
              </Col>
            </Row>
  
            <Form.Item name="is_active" label="Projet actif" valuePropName="checked">
              <Switch checkedChildren="Actif" unCheckedChildren="Inactif" />
            </Form.Item>
  
            <Divider />
  
            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={isSubmitting || operationLoading}
                >
                  {isEditMode ? 'Mettre à jour' : 'Créer'}
                </Button>
                <Button onClick={handleCancel}>Annuler</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    );
  };
  
  export default ProjectForm;