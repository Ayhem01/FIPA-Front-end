// src/components/Projects/ProjectDetails.jsx
import React, { useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProjectById, deleteProject, updateProjectStatus, resetOperation } from '../../features/projectSlice';
import PipelineStageSelector from './PipelineStageSelector';
import PipelineVisualizer from './PipelineVisualizer';
import ProjectBlockages from './ProjectBlockages';
import ProjectContacts from './ProjectContacts';
import {
     DeleteOutlined, ArrowLeftOutlined, ExclamationCircleOutlined,
    CheckCircleOutlined, ClockCircleOutlined, WarningOutlined, PlusOutlined,
    UserOutlined, ContactsOutlined
} from '@ant-design/icons';
import {
    Button, Card, Descriptions, Tag, Space, Row, Col, Typography, Divider, message,
    Spin, Alert, Modal, Tabs, Empty, Statistic, Badge, List
} from 'antd';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// Fonctions intégrées pour remplacer projectUtils.js
const getProjectStatus = (project) => {
    if (!project) return 'unknown';

    if (project.idea) {
        return 'idea';
    } else if (project.in_progress) {
        return 'in_progress';
    } else if (project.in_production) {
        return 'in_production';
    }
    return 'unknown';
};

const getProjectStatusLabel = (status) => {
    switch (status) {
        case 'idea':
            return 'Idée';
        case 'in_progress':
            return 'En cours';
        case 'in_production':
            return 'En production';
        default:
            return 'Indéfini';
    }
};

const getProjectStatusTag = (project) => {
    const status = getProjectStatus(project);
    let color;

    switch (status) {
        case 'idea':
            color = 'blue';
            break;
        case 'in_progress':
            color = 'orange';
            break;
        case 'in_production':
            color = 'green';
            break;
        default:
            color = 'default';
    }

    return <Tag color={color}>{getProjectStatusLabel(status)}</Tag>;
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { data: project, loading, error } = useSelector(state => state.projects.selectedProject);
    const { type: operationType, loading: operationLoading, success: operationSuccess, error: operationError } = useSelector(state => state.projects.operation);
    const currentUser = useSelector(state => state.user.user);

    const [localProject, setLocalProject] = useState(null);
    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const [confirmStatusVisible, setConfirmStatusVisible] = useState(false);
    const [pendingStatus, setPendingStatus] = useState(null);
    const [activeTabKey, setActiveTabKey] = useState('1');

    // Déterminer si l'utilisateur est un administrateur
    const isAdmin = currentUser && (
        currentUser.role === 'admin' ||
        currentUser.is_admin === true
    );

    // Charger le projet depuis l'API
    useEffect(() => {
        if (id) {
            dispatch(getProjectById(id));
        }

        return () => {
            dispatch(resetOperation());
        };
    }, [dispatch, id]);

    // Synchroniser l'état local avec les données Redux
    useEffect(() => {
        if (project) {
            setLocalProject(project);
        }
    }, [project]);

    // Gérer les résultats des opérations
    useEffect(() => {
        if (operationSuccess) {
            if (operationType === 'status') {
                message.success('Statut mis à jour avec succès');
                dispatch(resetOperation());
            } else if (operationType === 'delete') {
                message.success('Projet supprimé avec succès');
                dispatch(resetOperation());
                navigate('/projects');
            } else if (operationType === 'pipeline_stage') {
                message.success('Étape du pipeline mise à jour avec succès');
                dispatch(resetOperation());
            }
        } else if (operationError) {
            message.error(`Erreur: ${operationError}`);
            dispatch(resetOperation());
        }
    }, [operationType, operationSuccess, operationError, dispatch, navigate]);

    // Fonctions de gestion des actions
    const handleStatusChange = (newStatus) => {
        setPendingStatus(newStatus);
        setConfirmStatusVisible(true);
    };

    const confirmStatusChange = () => {
        dispatch(updateProjectStatus({ id, status: pendingStatus }));
        setConfirmStatusVisible(false);
    };

    const handleEdit = () => {
        navigate(`/projects/edit/${id}`);
    };

    const handleDelete = () => {
        setConfirmDeleteVisible(true);
    };

    const confirmDelete = () => {
        dispatch(deleteProject(id));
    };

    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };

    // Vérifier si le projet a des blocages actifs
    const hasActiveBlockages = localProject?.blockages?.some(
        blockage => blockage.status === 'active'
    );

    if (error) {
        return (
            <div className="project-details-container" style={{ padding: '20px' }}>
                <Alert
                    message="Erreur"
                    description={`Impossible de charger les détails du projet: ${error}`}
                    type="error"
                    showIcon
                />
                <Button style={{ marginTop: 16 }} onClick={() => navigate('/projects')}>
                    Retour à la liste
                </Button>
            </div>
        );
    }

    if (loading || !localProject) {
        return (
            <div className="project-details-container" style={{ padding: '20px', textAlign: 'center' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>Chargement des détails...</div>
            </div>
        );
    }

    return (
        <div className="project-details-container" style={{ padding: '20px' }}>
            {/* En-tête avec navigation et actions */}
            <div className="details-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/projects')}>
                    Retour à la liste
                </Button>

                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={handleEdit}
                    >
                        Modifier
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleDelete}
                        loading={operationLoading && operationType === 'delete'}
                    >
                        Supprimer
                    </Button>
                </Space>
            </div>

            {/* En-tête du projet avec informations principales */}
            <Card
                style={{ marginBottom: 16 }}
                className="project-header-card"
            >
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={16}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Title level={3} style={{ margin: 0 }}>{localProject.title}</Title>
                            {getProjectStatusTag(localProject)}
                            {hasActiveBlockages &&
                                <Tag color="red" icon={<WarningOutlined />}>Bloqué</Tag>
                            }
                        </div>
                        <Paragraph type="secondary" style={{ marginTop: 8 }}>
                            {localProject.company_name}
                            {localProject.sector && ` • ${localProject.sector.name}`}
                            {localProject.governorate && ` • ${localProject.governorate.name}`}
                        </Paragraph>
                    </Col>
                    <Col xs={24} md={8}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Statistic
                                    title="Étape"
                                    value={localProject.pipelineStage?.name || 'Non défini'}
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic
                                    title="Dernière mise à jour"
                                    value={formatDate(localProject.updated_at)}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Card>

            {/* Contenu principal organisé en onglets */}
            <Card>
                <Tabs activeKey={activeTabKey} onChange={handleTabChange}>
                    {/* Onglet 1: Informations générales */}
                    <TabPane
                        tab={<span>Informations générales</span>}
                        key="1"
                    >
                        <Row gutter={[16, 16]}>
                            <Col xs={24}>
                                <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
                                    <Descriptions.Item label="Secteur">
                                        {localProject.sector?.name || 'Non défini'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Gouvernorat">
                                        {localProject.governorate?.name || 'Non défini'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Responsable">
                                        {localProject.responsable?.name || 'Non défini'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Type de pipeline">
                                        {localProject.pipelineType?.name || 'Non défini'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Étape actuelle">
                                        {localProject.pipelineStage?.name || 'Non défini'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Statut">
                                        {getProjectStatusLabel(getProjectStatus(localProject))}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Date de création">
                                        {formatDate(localProject.created_at)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Dernière mise à jour">
                                        {formatDate(localProject.updated_at)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Montant d'investissement" span={3}>
                                        {localProject.investment_amount
                                            ? `${localProject.investment_amount.toLocaleString('fr-FR')} DT`
                                            : 'Non défini'
                                        }
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>

                            {/* Description détaillée si elle existe */}
                            {localProject.description && (
                                <Col xs={24}>
                                    <Card title="Description" size="small">
                                        <Paragraph>{localProject.description}</Paragraph>
                                    </Card>
                                </Col>
                            )}

                            {/* Changer le statut */}
                            <Col xs={24}>
                                <Divider orientation="left">Changer le statut</Divider>
                                <Space wrap>
                                    <Button
                                        type={getProjectStatus(localProject) === 'idea' ? 'primary' : 'default'}
                                        onClick={() => handleStatusChange('idea')}
                                        loading={operationLoading && operationType === 'status' && pendingStatus === 'idea'}
                                    >
                                        Idée
                                    </Button>
                                    <Button
                                        type={getProjectStatus(localProject) === 'in_progress' ? 'primary' : 'default'}
                                        onClick={() => handleStatusChange('in_progress')}
                                        loading={operationLoading && operationType === 'status' && pendingStatus === 'in_progress'}
                                    >
                                        En cours
                                    </Button>
                                    <Button
                                        type={getProjectStatus(localProject) === 'in_production' ? 'primary' : 'default'}
                                        style={getProjectStatus(localProject) === 'in_production' ? { background: '#52c41a', borderColor: '#52c41a' } : {}}
                                        onClick={() => handleStatusChange('in_production')}
                                        loading={operationLoading && operationType === 'status' && pendingStatus === 'in_production'}
                                    >
                                        En production
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                    </TabPane>

                    {/* Onglet 2: Pipeline */}
                    <TabPane
                        tab={<span>Pipeline</span>}
                        key="2"
                    >
                        <Row gutter={[16, 16]}>
                            <Col xs={24}>
                                <Card
                                    title="Progression dans le pipeline"
                                    className="pipeline-visualizer-card"
                                    size="small"
                                >
                                    <PipelineVisualizer
                                        project={localProject}
                                        pipelineTypeId={localProject.pipeline_type_id}
                                    />
                                </Card>
                            </Col>

                            <Col xs={24}>
                                <Card
                                    title="Changer d'étape"
                                    className="pipeline-stage-selector-card"
                                    size="small"
                                >
                                    <PipelineStageSelector
                                        projectId={localProject.id}
                                        currentStageId={localProject.pipeline_stage_id}
                                        pipelineTypeId={localProject.pipeline_type_id}
                                    />
                                </Card>
                            </Col>
                        </Row>
                    </TabPane>

                    {/* Onglet 3: Blocages */}
                    <TabPane
                        tab={
                            <span>
                                Blocages
                                {hasActiveBlockages && (
                                    <Badge count="!" style={{ backgroundColor: '#ff4d4f', marginLeft: 6 }} />
                                )}
                            </span>
                        }
                        key="3"
                    >
                        <ProjectBlockages projectId={localProject.id} />
                    </TabPane>

                    {/* Onglet 4: Suivi */}
                    <TabPane
                        tab={<span>Suivi</span>}
                        key="4"
                    >
                        {localProject.followUps && localProject.followUps.length > 0 ? (
                            <List
                                itemLayout="vertical"
                                dataSource={localProject.followUps}
                                renderItem={followUp => (
                                    <List.Item>
                                        <Card size="small" style={{ width: '100%' }}>
                                            <List.Item.Meta
                                                title={`Suivi du ${formatDate(followUp.follow_up_date)}`}
                                                description={
                                                    <Space direction="vertical">
                                                        <Text>{followUp.comments}</Text>
                                                        <div>
                                                            <Tag color="blue">{followUp.status}</Tag>
                                                            {followUp.completed_at && (
                                                                <Tag color="green" icon={<CheckCircleOutlined />}>
                                                                    Complété le {formatDate(followUp.completed_at)}
                                                                </Tag>
                                                            )}
                                                        </div>
                                                    </Space>
                                                }
                                            />
                                        </Card>
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty
                                description="Aucun suivi enregistré pour ce projet"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            >
                                <Button type="primary" icon={<PlusOutlined />}>
                                    Ajouter un suivi
                                </Button>
                            </Empty>
                        )}
                    </TabPane>
                    <TabPane
                        tab={<span><ContactsOutlined /> Contacts</span>}
                        key="5"
                    >
                        <ProjectContacts projectId={localProject.id} />
                    </TabPane>
                </Tabs>
            </Card>

            {/* Modal de confirmation pour le changement de statut */}
            <Modal
                title={<><ExclamationCircleOutlined style={{ color: '#1890ff' }} /> Confirmer le changement de statut</>}
                open={confirmStatusVisible}
                onOk={confirmStatusChange}
                onCancel={() => setConfirmStatusVisible(false)}
                okText="Oui, changer"
                cancelText="Annuler"
                okButtonProps={{ loading: operationLoading && operationType === 'status' }}
            >
                <p>Êtes-vous sûr de vouloir changer le statut de ce projet en "{pendingStatus === 'idea' ? 'Idée' : pendingStatus === 'in_progress' ? 'En cours' : 'En production'}"?</p>
            </Modal>

            {/* Modal de confirmation pour la suppression */}
            <Modal
                title={<><ExclamationCircleOutlined style={{ color: '#ff4d4f' }} /> Confirmer la suppression</>}
                open={confirmDeleteVisible}
                onOk={confirmDelete}
                onCancel={() => setConfirmDeleteVisible(false)}
                okText="Oui, supprimer"
                cancelText="Annuler"
                okButtonProps={{ danger: true, loading: operationLoading && operationType === 'delete' }}
            >
                <p>Êtes-vous sûr de vouloir supprimer ce projet?</p>
                <p>Cette action est irréversible.</p>
            </Modal>
        </div>
    );
};

export default ProjectDetails;