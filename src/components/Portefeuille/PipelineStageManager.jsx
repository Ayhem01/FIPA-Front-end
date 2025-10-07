import React, { useState, useEffect, useCallback } from 'react';
import {
    Button, Modal, Form, Input, InputNumber, Checkbox, message, Typography,
    Space, Popconfirm, Card, Steps, Badge, Progress, Tabs, Spin, Empty,
    List, Timeline, Drawer, Tag, Row, Col, Collapse, Alert, Divider, Descriptions, DatePicker,
    Grid
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, ArrowUpOutlined,
    ArrowDownOutlined, InfoCircleOutlined, CheckCircleOutlined,
    ClockCircleOutlined, WarningOutlined, FileTextOutlined,
    OrderedListOutlined, SwapOutlined, SortAscendingOutlined,
    RightOutlined, DownOutlined, UserOutlined, LinkOutlined, PlayCircleOutlined,
    TrophyOutlined, CalendarOutlined, AuditOutlined, SettingOutlined, SyncOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchPipelineStages,
    addPipelineStage,
    updatePipelineStage,
    deletePipelineStage,
    getStageDetails
} from '../../features/pipelineStageSlice';
import moment from 'moment';
import axios from 'axios';
import { getAuthHeader, getPipelineStageTasks } from '../../features/taskSlice';
import { fetchBlockagesForStage } from '../../features/blockageSlice';
import { motion, AnimatePresence } from 'framer-motion';

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Step } = Steps;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { useBreakpoint } = Grid;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Composant réutilisable pour gérer et visualiser les étapes du pipeline
 */
const PipelineStageManager = ({
    entityType,
    entityId,
    stages = [],
    currentStage,
    progression = [],
    onStagesChange,
    showAddButton = true,
    buttonText = "Ajouter une étape",
    buttonType = "default",
    buttonClassName = "",
    showVisualizer = false,
    visualizerStyle = "boxes",
    pipelineCompletedAt = null
}) => {
    const dispatch = useDispatch();
    const screens = useBreakpoint();

    // Sélecteurs Redux pour les détails d'étape
    const stageDetailsFromStore = useSelector(state => state.pipelineStages?.stageDetails || null);
    const stageLoading = useSelector(state => state.pipelineStages?.loading || false);
    const stageError = useSelector(state => state.pipelineStages?.error || null);

    const [stageForm] = Form.useForm();
    const [stageModalVisible, setStageModalVisible] = useState(false);
    const [editingStage, setEditingStage] = useState(null);
    const [selectedStage, setSelectedStage] = useState(null);
    const [stageDetailsVisible, setStageDetailsVisible] = useState(false);
    const [stageDetails, setStageDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    // État pour stocker les tâches et blocages
    const [stageTasks, setStageTasks] = useState([]);
    const [stageBlockages, setStageBlockages] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [loadingBlockages, setLoadingBlockages] = useState(false);
    const [stageListVisible, setStageListVisible] = useState(false);

    // États pour l'avancement du pipeline
    const [advanceModalVisible, setAdvanceModalVisible] = useState(false);
    const [advanceForm] = Form.useForm();
    const [nextStage, setNextStage] = useState(null);
    const [stagesBoxVisible, setStagesBoxVisible] = useState(true);
    const effectiveCurrentStage = currentStage ||
        (stages && stages.length > 0 ? stages[0] : null);

    useEffect(() => {
        if (stageDetailsFromStore && selectedStage) {
            console.log('Mise à jour des détails depuis le store:', stageDetailsFromStore);
            setStageDetails(stageDetailsFromStore);

            if (stageDetailsFromStore.tasks && Array.isArray(stageDetailsFromStore.tasks)) {
                console.log('Tâches trouvées dans le store:', stageDetailsFromStore.tasks);
                setStageTasks(stageDetailsFromStore.tasks);
            }

            if (stageDetailsFromStore.blockages && Array.isArray(stageDetailsFromStore.blockages)) {
                console.log('Blocages trouvés dans le store:', stageDetailsFromStore.blockages);
                setStageBlockages(stageDetailsFromStore.blockages);
            }
        }
    }, [stageDetailsFromStore, selectedStage]);

    // Déterminer la prochaine étape
    useEffect(() => {
        if (stages && stages.length > 0 && effectiveCurrentStage) {
            const next = stages.find(
                stage => stage.order === (effectiveCurrentStage.order + 1)
            );
            setNextStage(next || null);
        } else {
            setNextStage(null);
        }
    }, [stages, effectiveCurrentStage]);

    // Ouvrir le modal pour ajouter une nouvelle étape
    const handleAddStage = () => {
        setEditingStage(null);
        stageForm.resetFields();
        stageForm.setFieldsValue({
            order: stages.length > 0 ? stages.length + 1 : 1,
            is_final: false
        });
        setStageModalVisible(true);
    };

    // Ouvrir le modal pour modifier une étape existante
    const handleEditStage = (stage) => {
        setEditingStage(stage);
        stageForm.resetFields();
        stageForm.setFieldsValue({
            name: stage.name,
            description: stage.description,
            order: stage.order,
            is_final: stage.is_final
        });
        setStageModalVisible(true);
    };

    // Sauvegarder une étape (ajout ou modification)
    const handleSaveStage = () => {
        stageForm.validateFields()
            .then(values => {
                if (editingStage) {
                    dispatch(updatePipelineStage({
                        entityType,
                        id: editingStage.id,
                        stageData: values
                    }))
                        .unwrap()
                        .then(() => {
                            message.success('Étape mise à jour avec succès');
                            setStageModalVisible(false);
                            setEditingStage(null);
                            dispatch(fetchPipelineStages(entityType));
                            if (onStagesChange) onStagesChange();
                        })
                        .catch(err => {
                            console.error("Erreur lors de la mise à jour de l'étape:", err);
                            message.error(`Erreur lors de la mise à jour de l'étape: ${err}`);
                        });

                } else {
                    dispatch(addPipelineStage({
                        entityType,
                        stageData: values
                    }))
                        .unwrap()
                        .then(() => {
                            message.success('Étape ajoutée avec succès');
                            setStageModalVisible(false);
                            dispatch(fetchPipelineStages(entityType));
                            if (onStagesChange) onStagesChange();
                        })
                        .catch(err => {
                            console.error("Erreur lors de l'ajout de l'étape:", err);
                            message.error(`Erreur lors de l'ajout de l'étape: ${err}`);
                        });
                }
            })
            .catch(() => {
                message.error("Veuillez corriger les erreurs dans le formulaire");
            });
    };

    // Supprimer une étape
    const handleDeleteStage = (stageId) => {
        dispatch(deletePipelineStage({
            entityType,
            id: stageId
        })).unwrap()
            .then(() => {
                message.success('Étape supprimée avec succès');
                if (onStagesChange) onStagesChange();
            })
            .catch(err => {
                message.error(`Erreur lors de la suppression de l'étape: ${err}`);
            });
    };

    // Changer l'ordre d'une étape (monter ou descendre)
    const handleMoveStage = (stage, direction) => {
        const newOrder = direction === 'up' ? stage.order - 1 : stage.order + 1;

        if (newOrder < 1 || newOrder > stages.length) {
            return;
        }

        dispatch(updatePipelineStage({
            entityType,
            id: stage.id,
            stageData: {
                ...stage,
                order: newOrder
            }
        })).unwrap()
            .then(() => {
                message.success('Ordre modifié avec succès');
                if (onStagesChange) onStagesChange();
            })
            .catch(err => {
                message.error(`Erreur lors du déplacement de l'étape: ${err}`);
            });
    };

    // Avancer dans le pipeline
    const handleAdvancePipeline = () => {
        advanceForm.validateFields()
            .then(values => {
                const apiUrl = `${API_URL}/${entityType}s/${entityId}/pipeline/advance`;

                axios.post(
                    apiUrl,
                    {
                        stage_id: nextStage?.id,
                        notes: values.notes,
                        date: values.date?.format('YYYY-MM-DD HH:mm:ss')
                    },
                    getAuthHeader()
                )
                    .then(response => {
                        if (response.data.success) {
                            message.success('Progression dans le pipeline enregistrée avec succès');
                            setAdvanceModalVisible(false);
                            advanceForm.resetFields();
                            if (onStagesChange) onStagesChange();
                        } else {
                            message.error(response.data.message || 'Erreur lors de l\'avancement');
                        }
                    })
                    .catch(error => {
                        console.error('Erreur lors de l\'avancement:', error);
                        message.error(`Erreur lors de l'avancement: ${error.response?.data?.message || error.message}`);
                    });
            });
    };

    // Ouvrir le modal d'avancement
    const handleOpenAdvanceModal = () => {
        if (!nextStage) {
            message.info("Vous êtes déjà à la dernière étape du pipeline");
            return;
        }
        advanceForm.resetFields();
        setAdvanceModalVisible(true);
    };

    // Avancer directement à une étape spécifique
    const handleAdvanceToStage = (stage) => {
        if (stage.order <= (effectiveCurrentStage?.order || 0)) {
            handleViewStageDetails(stage);
            return;
        }

        setNextStage(stage);
        advanceForm.resetFields();
        setAdvanceModalVisible(true);
    };

    const handleViewStageDetails = (stage) => {
        setSelectedStage(stage);
        setStageDetailsVisible(true);
        setLoading(true);

        const loadBasicDetails = async () => {
            try {
                console.log('Chargement des détails de base pour l\'étape:', stage.id);
                await loadStageTasks(stage.id);
                await loadStageBlockages(stage.id);
            } catch (error) {
                console.error('Erreur lors du chargement des détails de base:', error);
            } finally {
                setLoading(false);
            }
        };

        if (stage.id === effectiveCurrentStage?.id) {
            console.log('Chargement des détails complets pour l\'étape courante:', stage.id);
            dispatch(getStageDetails({
                entityType,
                entityId,
                stageId: stage.id
            }))
                .unwrap()
                .then(response => {
                    console.log('Détails de l\'étape récupérés avec succès:', response);
                })
                .catch(error => {
                    console.error('Erreur lors du chargement des détails:', error);
                    message.error(`Erreur: ${error}`);
                    loadBasicDetails();
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            console.log('Chargement des détails de base pour l\'étape non courante:', stage.id);
            loadBasicDetails();
        }
    };

    const loadStageTasks = async (stageId) => {
        setLoadingTasks(true);
        try {
            console.log(`Chargement des tâches pour l'étape ${stageId}`);

            const response = await axios.get(
                `${API_URL}/pipeline-tasks/${entityType}/${entityId}/${stageId}`,
                getAuthHeader()
            );

            console.log("Tâches récupérées:", response.data);

            let tasksData = [];
            if (response.data.success) {
                tasksData = response.data.data || [];
            } else if (response.data.status === 'success') {
                tasksData = response.data.data || [];
            }

            console.log("Tâches formatées:", tasksData);
            setStageTasks(tasksData);
        } catch (error) {
            console.error("Erreur lors du chargement des tâches:", error);
            setStageTasks([]);
        } finally {
            setLoadingTasks(false);
        }
    };

    const loadStageBlockages = async (stageId) => {
        setLoadingBlockages(true);
        try {
            if (stageDetailsFromStore && stageDetailsFromStore.blockages && stageDetailsFromStore.blockages.length > 0) {
                console.log('Utilisation des blocages du store:', stageDetailsFromStore.blockages);
                setStageBlockages(stageDetailsFromStore.blockages);
                setLoadingBlockages(false);
                return;
            }

            console.log(`Chargement des blocages pour l'étape ${stageId} de ${entityType} #${entityId}`);

            const result = await dispatch(fetchBlockagesForStage({
                entityType: entityType,
                entityId: entityId,
                stageId: stageId
            })).unwrap();

            console.log('Blocages récupérés:', result);
            setStageBlockages(result);
        } catch (error) {
            console.error('Erreur lors du chargement des blocages:', error);
            setStageBlockages([]);
        } finally {
            setLoadingBlockages(false);
        }
    };

    // Formatter une date
    const formatDate = (dateString) => {
        if (!dateString) return 'Non définie';
        return moment(dateString).format('DD/MM/YYYY HH:mm');
    };

    // Rendu de la visualisation du pipeline
    const renderPipelineVisualizer = () => {
        if (!stages || stages.length === 0) {
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <Alert
                        message="Aucune étape définie"
                        description="Ce pipeline ne contient pas encore d'étapes."
                        type="info"
                        showIcon
                        className="modern-alert"
                        action={
                            <Button
                                type="primary"
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={handleAddStage}
                                className="modern-btn-primary"
                            >
                                Ajouter une étape
                            </Button>
                        }
                    />
                </motion.div>
            );
        }

        const isPipelineCompleted = pipelineCompletedAt !== null && pipelineCompletedAt !== undefined;

        let progressPercent = 0;
        
        if (isPipelineCompleted) {
            progressPercent = 100;
        } else {
            if (effectiveCurrentStage && stages.length > 0) {
                const currentOrder = effectiveCurrentStage.order || 1;
                const maxOrder = Math.max(...stages.map(s => s.order), 1);
                
                if (effectiveCurrentStage.is_final) {
                    progressPercent = 100;
                } else {
                    progressPercent = Math.round(((currentOrder - 1) / Math.max(maxOrder - 1, 1)) * 100);
                }
            } else {
                const completedStages = progression?.filter(prog => prog.completed).length || 0;
                const totalStages = stages.length;
                progressPercent = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;
            }
            
            progressPercent = Math.min(Math.max(progressPercent, 0), 100);
        }

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="modern-pipeline-visualizer"
            >
                <div className="pipeline-manager-header">
                    <div className="header-info">
                        <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                            <AuditOutlined style={{ marginRight: 8 }} />
                            {isPipelineCompleted ? "Pipeline terminé" : "Progression du pipeline"}
                        </Title>
                        {!isPipelineCompleted && effectiveCurrentStage && (
                            <Text type="secondary" style={{ fontSize: '14px' }}>
                                Étape {effectiveCurrentStage.order || 1} sur {stages.length}
                            </Text>
                        )}
                    </div>
                    <Space size="middle">
                        <Button
                            icon={<OrderedListOutlined />}
                            onClick={() => setStageListVisible(true)}
                            className="modern-btn"
                        >
                            {screens.xs ? '' : 'Liste des étapes'}
                        </Button>
                        {!isPipelineCompleted && nextStage && (
                            <Button
                                type="primary"
                                icon={<RightOutlined />}
                                onClick={handleOpenAdvanceModal}
                                className="modern-btn-primary"
                            >
                                {screens.xs ? 'Avancer' : 'Étape suivante'}
                            </Button>
                        )}
                        {!isPipelineCompleted && showAddButton && (
                            <Button
                                type={buttonType}
                                icon={<PlusOutlined />}
                                onClick={handleAddStage}
                                className={`modern-btn ${buttonClassName}`}
                            >
                                {screens.xs ? '' : buttonText}
                            </Button>
                        )}
                    </Space>
                </div>

                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1, delay: 0.3 }}
                >
                    <Progress
                        percent={progressPercent}
                        status={isPipelineCompleted ? "success" : "active"}
                        strokeColor={isPipelineCompleted ? {
                            '0%': '#52c41a',
                            '100%': '#52c41a',
                        } : {
                            '0%': '#667eea',
                            '100%': '#764ba2',
                        }}
                        strokeWidth={8}
                        className="modern-progress"
                    />
                </motion.div>

                {/* Affichage des étapes sous forme de cartes modernes */}
                <div className="pipeline-stages-grid">
                    {stages.map((stage, index) => {
                        let isCompleted = false;
                        let isActive = false;
                        let isPending = false;

                        if (isPipelineCompleted) {
                            isCompleted = true;
                        } else if (effectiveCurrentStage) {
                            isCompleted = stage.order < effectiveCurrentStage.order;
                            isActive = stage.id === effectiveCurrentStage.id || stage.order === effectiveCurrentStage.order;
                            isPending = stage.order > effectiveCurrentStage.order;
                        } else {
                            const stageProgression = progression?.find(prog => prog.stage_id === stage.id);
                            isCompleted = stageProgression?.completed || false;
                            isActive = !isCompleted && stage.order === 1;
                            isPending = !isCompleted && !isActive;
                        }

                        return (
                            <motion.div
                                key={stage.id}
                                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ 
                                    duration: 0.4, 
                                    delay: index * 0.1,
                                    ease: "easeOut" 
                                }}
                                whileHover={{ 
                                    y: -5, 
                                    scale: 1.02,
                                    transition: { duration: 0.2 }
                                }}
                                className={`modern-pipeline-stage-card ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isPending ? 'pending' : ''}`}
                                onClick={() => isActive ? handleViewStageDetails(stage) : handleAdvanceToStage(stage)}
                            >
                                <div className="stage-header">
                                    <div className="stage-icon">
                                        {isCompleted ? (
                                            <CheckCircleOutlined />
                                        ) : isActive ? (
                                            <PlayCircleOutlined />
                                        ) : stage.is_final ? (
                                            <TrophyOutlined />
                                        ) : (
                                            <ClockCircleOutlined />
                                        )}
                                    </div>
                                    <div className="stage-order">
                                        Étape {stage.order}
                                    </div>
                                </div>

                                <div className="stage-content">
                                    <Title level={5} className="stage-name">
                                        {stage.name}
                                    </Title>
                                    {stage.description && (
                                        <Text type="secondary" className="stage-description">
                                            {stage.description}
                                        </Text>
                                    )}
                                </div>

                                <div className="stage-footer">
                                    {stage.is_final && (
                                        <Tag color="gold" className="final-tag">
                                            <TrophyOutlined /> Finale
                                        </Tag>
                                    )}
                                    {isActive && nextStage && !isCompleted && !isPipelineCompleted && (
                                        <Button
                                            size="small"
                                            type="primary"
                                            icon={<RightOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenAdvanceModal();
                                            }}
                                            className="advance-btn-small"
                                        >
                                            Avancer
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Visualisation des étapes en mode Steps (optionnel) */}
                {(visualizerStyle === 'steps' || visualizerStyle === 'both') && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="modern-steps-container"
                    >
                        <Steps
                            current={isPipelineCompleted ? stages.length : (effectiveCurrentStage ? effectiveCurrentStage.order - 1 : 0)}
                            direction={screens.xs ? "vertical" : "horizontal"}
                            size="small"
                            className="modern-pipeline-steps"
                            labelPlacement="vertical"
                            status={isPipelineCompleted ? "finish" : "process"}
                        >
                            {stages.map(stage => {
                                const stageProgression = progression.find(p => p.stage_id === stage.id);
                                const isCompleted = isPipelineCompleted || (effectiveCurrentStage && stage.order < effectiveCurrentStage.order);
                                const isActive = !isPipelineCompleted && effectiveCurrentStage && stage.id === effectiveCurrentStage.id;

                                return (
                                    <Step
                                        key={stage.id}
                                        title={stage.name}
                                        description={
                                            <Button
                                                type="link"
                                                size="small"
                                                onClick={() => handleViewStageDetails(stage)}
                                                className="details-btn"
                                            >
                                                Détails
                                            </Button>
                                        }
                                        status={isPipelineCompleted ? 'finish' : isCompleted ? 'finish' : isActive ? 'process' : 'wait'}
                                    />
                                );
                            })}
                        </Steps>
                    </motion.div>
                )}

                {/* Alert pour afficher le statut du pipeline */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <Alert
                        message={
                            isPipelineCompleted
                                ? "Pipeline complété avec succès"
                                : effectiveCurrentStage
                                    ? `Étape actuelle: ${effectiveCurrentStage.name} (${progressPercent}% complété)`
                                    : "Pipeline en attente de démarrage"
                        }
                        description={
                            isPipelineCompleted
                                ? `Complété le ${moment(pipelineCompletedAt).format('DD/MM/YYYY HH:mm')}`
                                : nextStage
                                    ? `Prochaine étape: ${nextStage.name}`
                                    : "Vous êtes à la dernière étape du pipeline"
                        }
                        type={isPipelineCompleted ? "success" : nextStage ? "info" : "success"}
                        showIcon
                        className="modern-pipeline-alert"
                        action={
                            !isPipelineCompleted && nextStage && (
                                <Button
                                    size="small"
                                    type="primary"
                                    onClick={handleOpenAdvanceModal}
                                    className="modern-btn-primary"
                                >
                                    Avancer
                                </Button>
                            )
                        }
                    />
                </motion.div>
            </motion.div>
        );
    };

    // Modal pour la liste des étapes
    const StageListModal = () => (
        <Modal
            title={
                <Space>
                    <OrderedListOutlined />
                    Liste des étapes du pipeline
                </Space>
            }
            open={stageListVisible}
            onCancel={() => setStageListVisible(false)}
            footer={null}
            width={800}
            className="modern-modal"
        >
            <div className="modern-pipeline-stage-list">
                <AnimatePresence>
                    {stages.map((stage, index) => (
                        <motion.div
                            key={stage.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                            className="modern-pipeline-stage-item"
                        >
                            <div className="stage-info">
                                <div className="stage-header-info">
                                    <Title level={5} className="stage-name">{stage.name}</Title>
                                    <Tag color="blue">Ordre: {stage.order}</Tag>
                                </div>
                                <Text type="secondary" className="stage-description">
                                    {stage.description || 'Aucune description'}
                                </Text>
                                {stage.is_final && (
                                    <Tag color="gold" className="final-badge">
                                        <TrophyOutlined /> Étape finale
                                    </Tag>
                                )}
                            </div>

                            <Space>
                                <Button
                                    icon={<ArrowUpOutlined />}
                                    size="small"
                                    disabled={stage.order <= 1}
                                    onClick={() => handleMoveStage(stage, 'up')}
                                    className="modern-btn"
                                />
                                <Button
                                    icon={<ArrowDownOutlined />}
                                    size="small"
                                    disabled={stage.order >= stages.length}
                                    onClick={() => handleMoveStage(stage, 'down')}
                                    className="modern-btn"
                                />
                                <Button
                                    icon={<EditOutlined />}
                                    size="small"
                                    onClick={() => {
                                        handleEditStage(stage);
                                        setStageListVisible(false);
                                    }}
                                    className="modern-btn"
                                />
                                <Popconfirm
                                    title="Êtes-vous sûr de vouloir supprimer cette étape?"
                                    onConfirm={() => {
                                        handleDeleteStage(stage.id);
                                        setStageListVisible(false);
                                    }}
                                    okText="Oui"
                                    cancelText="Non"
                                >
                                    <Button
                                        icon={<DeleteOutlined />}
                                        size="small"
                                        danger
                                        className="modern-btn-danger"
                                    />
                                </Popconfirm>
                            </Space>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </Modal>
    );

    return (
        <div className="modern-pipeline-stage-manager">
            {/* Bouton d'ajout d'étape (si pas en mode visualisation) */}
            {!showVisualizer && showAddButton && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                >
                    <Button
                        type={buttonType}
                        icon={<PlusOutlined />}
                        onClick={handleAddStage}
                        className={`modern-btn-primary ${buttonClassName}`}
                    >
                        {buttonText}
                    </Button>
                </motion.div>
            )}

            {/* Mode visualisation (si activé) */}
            {showVisualizer && renderPipelineVisualizer()}

            {/* Modal pour ajouter/modifier une étape */}
            <Modal
                title={
                    <Space>
                        {editingStage ? <EditOutlined /> : <PlusOutlined />}
                        {editingStage ? "Modifier l'étape" : "Nouvelle étape"}
                    </Space>
                }
                open={stageModalVisible}
                onCancel={() => {
                    setEditingStage(null);
                    setStageModalVisible(false);
                }}
                onOk={handleSaveStage}
                okText={editingStage ? "Mettre à jour" : "Ajouter"}
                cancelText="Annuler"
                className="modern-modal"
                okButtonProps={{ className: 'modern-btn-primary' }}
                cancelButtonProps={{ className: 'modern-btn' }}
            >
                <Form form={stageForm} layout="vertical" initialValues={editingStage || {}}>
                    <Form.Item
                        name="name"
                        label="Nom de l'étape"
                        rules={[{ required: true, message: "Nom obligatoire" }]}
                    >
                        <Input placeholder="Nom de l'étape" className="modern-input" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <TextArea
                            rows={3}
                            placeholder="Description de cette étape du pipeline"
                            className="modern-textarea"
                        />
                    </Form.Item>

                    <Form.Item
                        name="order"
                        label="Ordre"
                        rules={[
                            { required: true, message: "Ordre obligatoire" },
                            {
                                type: 'number',
                                min: 1,
                                message: "L'ordre doit être un nombre positif"
                            }
                        ]}
                    >
                        <InputNumber
                            min={1}
                            precision={0}
                            style={{ width: '100%' }}
                            placeholder="Position dans le pipeline"
                            className="modern-input-number"
                        />
                    </Form.Item>

                    <Form.Item name="is_final" valuePropName="checked">
                        <Checkbox className="modern-checkbox">
                            Étape finale
                        </Checkbox>
                        <Text type="secondary" style={{ marginLeft: 8 }}>
                            (L'étape finale marque la fin du pipeline)
                        </Text>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Drawer pour afficher les détails d'une étape */}
            <Drawer
                title={
                    <Space>
                        <InfoCircleOutlined />
                        Détails de l'étape: {selectedStage?.name || ''}
                    </Space>
                }
                placement="right"
                width={screens.xs ? '100%' : 600}
                onClose={() => setStageDetailsVisible(false)}
                open={stageDetailsVisible}
                className="modern-drawer"
            >
                {loading || stageLoading ? (
                    <div className="loading-container">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                            <SyncOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                        </motion.div>
                        <Text style={{ marginTop: 16, color: '#666' }}>
                            Chargement des détails...
                        </Text>
                    </div>
                ) : stageError ? (
                    <Alert
                        message="Erreur"
                        description={`Impossible de charger les détails: ${stageError}`}
                        type="error"
                        showIcon
                        className="modern-alert"
                    />
                ) : (
                    <Tabs defaultActiveKey="info" className="modern-tabs">
                        <TabPane tab={<span><InfoCircleOutlined /> Informations</span>} key="info">
                            <Card bordered={false} className="modern-card">
                                <Descriptions column={1} bordered className="modern-descriptions">
                                    <Descriptions.Item label="Nom">{selectedStage?.name}</Descriptions.Item>
                                    <Descriptions.Item label="Description">
                                        {selectedStage?.description || 'Aucune description'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ordre">
                                        {selectedStage?.order}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Étape finale">
                                        <Tag color={selectedStage?.is_final ? 'green' : 'default'}>
                                            {selectedStage?.is_final ? 'Oui' : 'Non'}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Date de création">
                                        {formatDate(selectedStage?.created_at)}
                                    </Descriptions.Item>

                                    {stageDetailsFromStore && stageDetailsFromStore.progression && (
                                        <Descriptions.Item label="Dernière progression">
                                            {formatDate(stageDetailsFromStore.progression.created_at)}
                                        </Descriptions.Item>
                                    )}
                                </Descriptions>

                                <Divider />

                                <Space>
                                    <Button
                                        icon={<EditOutlined />}
                                        onClick={() => {
                                            handleEditStage(selectedStage);
                                            setStageDetailsVisible(false);
                                        }}
                                        className="modern-btn"
                                    >
                                        Modifier
                                    </Button>
                                    <Popconfirm
                                        title="Êtes-vous sûr de vouloir supprimer cette étape?"
                                        onConfirm={() => {
                                            handleDeleteStage(selectedStage.id);
                                            setStageDetailsVisible(false);
                                        }}
                                        okText="Oui"
                                        cancelText="Non"
                                    >
                                        <Button icon={<DeleteOutlined />} danger className="modern-btn-danger">
                                            Supprimer
                                        </Button>
                                    </Popconfirm>
                                </Space>
                            </Card>
                        </TabPane>

                        <TabPane tab={<span><ClockCircleOutlined /> Tâches ({stageTasks?.length || 0})</span>} key="tasks">
                            {loadingTasks ? (
                                <div className="loading-container-small">
                                    <Spin size="small" />
                                </div>
                            ) : stageTasks && stageTasks.length > 0 ? (
                                <List
                                    dataSource={stageTasks}
                                    renderItem={task => (
                                        <List.Item
                                            className="modern-list-item"
                                            actions={[
                                                <Button
                                                    key="view"
                                                    type="link"
                                                    size="small"
                                                    onClick={() => window.open(`/tasks/${task.id}`, '_blank')}
                                                    className="modern-btn-link"
                                                >
                                                    Voir
                                                </Button>
                                            ]}
                                        >
                                            <List.Item.Meta
                                                title={task.title || 'Tâche sans titre'}
                                                description={
                                                    <>
                                                        <Tag color={task.status === 'completed' ? 'green' : 'blue'}>
                                                            {task.status === 'completed' ? 'Terminé' : 'En cours'}
                                                        </Tag>
                                                        <Text type="secondary"> {formatDate(task.start || task.created_at)}</Text>
                                                    </>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                <Empty description="Aucune tâche associée à cette étape" className="modern-empty" />
                            )}
                        </TabPane>

                        <TabPane tab={<span><WarningOutlined /> Blocages ({stageBlockages.length})</span>} key="blockages">
                            {loadingBlockages ? (
                                <div className="loading-container-small">
                                    <Spin size="small" />
                                </div>
                            ) : stageBlockages.length > 0 ? (
                                <List
                                    dataSource={stageBlockages}
                                    renderItem={blockage => (
                                        <List.Item className="modern-list-item">
                                            <List.Item.Meta
                                                title={
                                                    <Space>
                                                        <Tag color="red">Blocage</Tag>
                                                        {blockage.name}
                                                    </Space>
                                                }
                                                description={
                                                    <>
                                                        <Paragraph>{blockage.description}</Paragraph>
                                                        <Space>
                                                            <Tag color={blockage.status === 'resolu' ? 'green' : 'red'}>
                                                                {blockage.status}
                                                            </Tag>
                                                            {blockage.assigned_user && (
                                                                <Tag icon={<UserOutlined />}>
                                                                    {blockage.assigned_user.name}
                                                                </Tag>
                                                            )}
                                                        </Space>
                                                        <div style={{ marginTop: '8px' }}>
                                                            <Text type="secondary">Créé le {formatDate(blockage.created_at)}</Text>
                                                        </div>
                                                    </>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                <Empty description="Aucun blocage pour cette étape" className="modern-empty" />
                            )}
                        </TabPane>

                        <TabPane tab={<span><FileTextOutlined /> Notes</span>} key="notes">
                            {stageDetailsFromStore?.notes ? (
                                <Card bordered={false} className="modern-card">
                                    <Paragraph>{stageDetailsFromStore.notes}</Paragraph>
                                </Card>
                            ) : (
                                <Empty description="Aucune note pour cette étape" className="modern-empty" />
                            )}
                        </TabPane>
                    </Tabs>
                )}
            </Drawer>

            {/* Modal pour avancer dans le pipeline */}
            <Modal
                title={
                    <Space>
                        <RightOutlined />
                        Passer à l'étape: {nextStage?.name || ''}
                    </Space>
                }
                open={advanceModalVisible}
                onCancel={() => setAdvanceModalVisible(false)}
                onOk={handleAdvancePipeline}
                okText="Confirmer l'avancement"
                cancelText="Annuler"
                className="modern-modal"
                okButtonProps={{ className: 'modern-btn-primary' }}
                cancelButtonProps={{ className: 'modern-btn' }}
            >
                <Form form={advanceForm} layout="vertical">
                    <Form.Item
                        name="date"
                        label="Date de réalisation"
                    >
                        <DatePicker
                            showTime
                            style={{ width: '100%' }}
                            placeholder="Sélectionner une date (optionnel)"
                            className="modern-date-picker"
                        />
                    </Form.Item>

                    <Form.Item
                        name="notes"
                        label="Notes"
                    >
                        <TextArea 
                            rows={4} 
                            placeholder="Informations complémentaires sur cette étape" 
                            className="modern-textarea"
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal pour la liste des étapes */}
            <StageListModal />

            {/* CSS Styles */}
            <style jsx>{`
                .modern-pipeline-stage-manager {
                    margin-bottom: 20px;
                }

                .modern-pipeline-visualizer {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                    border: 1px solid #f0f0f0;
                }

                .pipeline-manager-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .header-info {
                    flex: 1;
                }

                .modern-progress {
                    margin-bottom: 32px;
                }

                .modern-progress .ant-progress-bg {
                    border-radius: 8px;
                }

                .pipeline-stages-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 20px;
                    margin: 24px 0 32px;
                }

                .modern-pipeline-stage-card {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: 2px solid #f0f0f0;
                    position: relative;
                    overflow: hidden;
                }

                .modern-pipeline-stage-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: #f0f0f0;
                    transition: all 0.3s ease;
                }

                .modern-pipeline-stage-card.completed {
                    border-color: #52c41a;
                    background: linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%);
                }

                .modern-pipeline-stage-card.completed::before {
                    background: linear-gradient(90deg, #52c41a, #73d13d);
                }

                .modern-pipeline-stage-card.active {
                    border-color: #1890ff;
                    background: linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%);
                    box-shadow: 0 4px 20px rgba(24, 144, 255, 0.2);
                }

                .modern-pipeline-stage-card.active::before {
                    background: linear-gradient(90deg, #667eea, #764ba2);
                }

                .modern-pipeline-stage-card.pending {
                    border-color: #d9d9d9;
                    background: #fafafa;
                    color: #8c8c8c;
                }

                .modern-pipeline-stage-card.pending::before {
                    background: #d9d9d9;
                }

                .modern-pipeline-stage-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
                }

                .stage-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }

                .stage-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                }

                .modern-pipeline-stage-card.completed .stage-icon {
                    background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
                    box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
                }

                .modern-pipeline-stage-card.pending .stage-icon {
                    background: #d9d9d9;
                    color: #8c8c8c;
                    box-shadow: none;
                }

                .stage-order {
                    font-size: 12px;
                    color: #666;
                    font-weight: 500;
                }

                .stage-content {
                    margin-bottom: 16px;
                }

                .stage-name {
                    margin: 0 0 8px 0;
                    color: #333;
                    font-weight: 600;
                }

                .stage-description {
                    display: block;
                    font-size: 13px;
                    line-height: 1.4;
                }

                .stage-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    min-height: 24px;
                }

                .final-tag {
                    border-radius: 12px;
                }

                .advance-btn-small {
                    border-radius: 6px;
                    font-size: 12px;
                    height: 24px;
                    padding: 0 8px;
                }

                .modern-steps-container {
                    margin: 32px 0;
                    padding: 24px;
                    background: #fafafa;
                    border-radius: 12px;
                }

                .modern-pipeline-steps .ant-steps-item-title {
                    font-weight: 500;
                }

                .modern-pipeline-alert {
                    border-radius: 12px;
                    border: 1px solid;
                }

                .modern-alert {
                    border-radius: 8px;
                }

                .modern-modal .ant-modal-header {
                    border-radius: 16px 16px 0 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }

                .modern-modal .ant-modal-title {
                    color: white;
                }

                .modern-modal .ant-modal-content {
                    border-radius: 16px;
                    overflow: hidden;
                }

                .modern-drawer .ant-drawer-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }

                .modern-drawer .ant-drawer-title {
                    color: white;
                }

                .modern-pipeline-stage-list {
                    margin-top: 16px;
                }

                .modern-pipeline-stage-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px;
                    background: #fafafa;
                    border-radius: 8px;
                    margin-bottom: 12px;
                    border-left: 4px solid #1890ff;
                    transition: all 0.3s ease;
                }

                .modern-pipeline-stage-item:hover {
                    background: #f0f5ff;
                    transform: translateX(4px);
                }

                .stage-header-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 8px;
                }

                .stage-header-info .stage-name {
                    margin: 0;
                }

                .final-badge {
                    margin-top: 8px;
                }

                .modern-btn {
                    border-radius: 8px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }

                .modern-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }

                .modern-btn-primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }

                .modern-btn-primary:hover {
                    background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                }

                .modern-btn-danger:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(255, 77, 79, 0.4);
                }

                .modern-input,
                .modern-textarea,
                .modern-input-number,
                .modern-date-picker {
                    border-radius: 8px;
                    transition: all 0.3s ease;
                }

                .modern-input:focus,
                .modern-textarea:focus,
                .modern-input-number:focus,
                .modern-date-picker:focus {
                    border-color: #667eea;
                    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
                }

                .modern-checkbox .ant-checkbox {
                    border-radius: 4px;
                }

                .modern-tabs .ant-tabs-tab {
                    padding: 12px 16px;
                    font-weight: 500;
                    border-radius: 8px 8px 0 0;
                }

                .modern-tabs .ant-tabs-tab-active {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white !important;
                }

                .modern-card {
                    border-radius: 12px;
                    border: 1px solid #f0f0f0;
                }

                .modern-descriptions .ant-descriptions-item-label {
                    background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
                    font-weight: 600;
                }

                .modern-list-item {
                    border-radius: 8px;
                    margin-bottom: 8px;
                    padding: 12px;
                    background: #fafafa;
                    transition: all 0.3s ease;
                }

                .modern-list-item:hover {
                    background: #f0f5ff;
                    transform: translateX(4px);
                }

                .modern-btn-link {
                    color: #1890ff;
                    font-weight: 500;
                }

                .modern-empty {
                    padding: 40px 0;
                }

                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 0;
                }

                .loading-container-small {
                    text-align: center;
                    padding: 30px 0;
                }

                @media (max-width: 768px) {
                    .pipeline-manager-header {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .pipeline-stages-grid {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }

                    .modern-pipeline-stage-card {
                        padding: 16px;
                    }

                    .modern-pipeline-stage-item {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 12px;
                    }

                    .modern-steps-container {
                        padding: 16px;
                    }
                }

                @media (max-width: 576px) {
                    .modern-pipeline-visualizer {
                        padding: 16px;
                    }

                    .stage-header-info {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 8px;
                    }
                }
            `}</style>
        </div>
    );
};

export default PipelineStageManager;