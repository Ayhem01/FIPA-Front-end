import React, { useState, useEffect, useCallback } from 'react';
import {
    Button, Modal, Form, Input, InputNumber, Checkbox, message, Typography,
    Space, Popconfirm, Card, Steps, Badge, Progress, Tabs, Spin, Empty,
    List, Timeline, Drawer, Tag, Row, Col, Collapse, Alert, Divider, Descriptions, DatePicker
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, ArrowUpOutlined,
    ArrowDownOutlined, InfoCircleOutlined, CheckCircleOutlined,
    ClockCircleOutlined, WarningOutlined, FileTextOutlined,
    OrderedListOutlined, SwapOutlined, SortAscendingOutlined,
    RightOutlined, DownOutlined, UserOutlined, LinkOutlined
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

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Step } = Steps;
const { TabPane } = Tabs;
const { Panel } = Collapse;
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
    buttonText = "Add stage",
    buttonType = "default",
    buttonClassName = "",
    showVisualizer = false,
    visualizerStyle = "boxes", // 'boxes', 'steps', ou 'both'
    pipelineCompletedAt = null // Nouvelle prop pour indiquer si le pipeline est terminé
}) => {
    const dispatch = useDispatch();

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

            // Si les détails contiennent des tâches, les utiliser
            if (stageDetailsFromStore.tasks && Array.isArray(stageDetailsFromStore.tasks)) {
                console.log('Tâches trouvées dans le store:', stageDetailsFromStore.tasks);
                setStageTasks(stageDetailsFromStore.tasks);
            }

            // Si les détails contiennent des blocages, les utiliser
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
                    // 🔹 Mettre à jour une étape existante
                    dispatch(updatePipelineStage({
                        entityType,   // ex: "invite" | "prospect" | "investor" | "projet"
                        id: editingStage.id,
                        stageData: values
                    }))
                        .unwrap()
                        .then(() => {
                            message.success('Étape mise à jour avec succès');
                            setStageModalVisible(false);
                            setEditingStage(null);

                            // 🔹 Recharger la liste des étapes
                            dispatch(fetchPipelineStages(entityType));

                            if (onStagesChange) onStagesChange();
                        })
                        .catch(err => {
                            console.error("Erreur lors de la mise à jour de l'étape:", err);
                            message.error(`Erreur lors de la mise à jour de l'étape: ${err}`);
                        });

                } else {
                    // 🔹 Ajouter une nouvelle étape
                    dispatch(addPipelineStage({
                        entityType,   // ex: "invite"
                        stageData: values
                    }))
                        .unwrap()
                        .then(() => {
                            message.success('Étape ajoutée avec succès');
                            setStageModalVisible(false);

                            // 🔹 Recharger la liste des étapes
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
                    getAuthHeader() // ✅ Envoi du token d'authentification ici
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
        // Vérifier si on peut avancer à cette étape (seulement les étapes suivantes)
        if (stage.order <= (effectiveCurrentStage?.order || 0)) {
            // Si c'est l'étape actuelle ou une étape précédente, juste afficher les détails
            handleViewStageDetails(stage);
            return;
        }

        // Si c'est une étape future, proposer d'y avancer
        setNextStage(stage);
        advanceForm.resetFields();
        setAdvanceModalVisible(true);
    };



    const handleViewStageDetails = (stage) => {
        setSelectedStage(stage);
        setStageDetailsVisible(true);
        setLoading(true);

        // Fonction pour charger les détails de base
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

        // Si c'est l'étape actuelle, on utilise getStageDetails
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
                    // Note: les données seront mises à jour par l'useEffect lié à stageDetailsFromStore
                })
                .catch(error => {
                    console.error('Erreur lors du chargement des détails:', error);
                    message.error(`Erreur: ${error}`);
                    loadBasicDetails(); // Fallback aux détails de base
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            // Pour les autres étapes, charger les informations de base
            console.log('Chargement des détails de base pour l\'étape non courante:', stage.id);
            loadBasicDetails();
        }
    };


    const loadStageTasks = async (stageId) => {
        setLoadingTasks(true);
        try {
            console.log(`Chargement des tâches pour l'étape ${stageId}`);

            // Utiliser directement l'URL qui fonctionne
            const response = await axios.get(
                `${API_URL}/pipeline-tasks/${entityType}/${entityId}/${stageId}`,
                getAuthHeader()
            );

            console.log("Tâches récupérées:", response.data);

            // Extraire les tâches selon la structure de la réponse
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
            // Vérifier si les blocages sont déjà disponibles dans stageDetailsFromStore
            if (stageDetailsFromStore && stageDetailsFromStore.blockages && stageDetailsFromStore.blockages.length > 0) {
                console.log('Utilisation des blocages du store:', stageDetailsFromStore.blockages);
                setStageBlockages(stageDetailsFromStore.blockages);
                setLoadingBlockages(false);
                return;
            }

            console.log(`Chargement des blocages pour l'étape ${stageId} de ${entityType} #${entityId}`);

            // Utiliser le nouveau thunk avec la bonne URL
            const result = await dispatch(fetchBlockagesForStage({
                entityType: entityType,
                entityId: entityId,
                stageId: stageId
            })).unwrap();

            console.log('Blocages récupérés:', result);
            setStageBlockages(result);
        } catch (error) {
            console.error('Erreur lors du chargement des blocages:', error);
            setStageBlockages([]); // En cas d'erreur, initialiser avec un tableau vide
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
                <Alert
                    message="Aucune étape définie"
                    description="Ce pipeline ne contient pas encore d'étapes."
                    type="info"
                    showIcon
                    action={
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={handleAddStage}
                        >
                            Ajouter une étape
                        </Button>
                    }
                />
            );
        }

        // Vérifier si le pipeline est complètement terminé
        const isPipelineCompleted = pipelineCompletedAt !== null && pipelineCompletedAt !== undefined;

        // Calculer le pourcentage de progression amélioré
        let progressPercent = 0;
        
        if (isPipelineCompleted) {
            // Si le pipeline est terminé, forcer 100%
            progressPercent = 100;
        } else {
            // Nouvelle logique de calcul de progression
            if (effectiveCurrentStage && stages.length > 0) {
                // Calculer basé sur l'ordre de l'étape actuelle
                const currentOrder = effectiveCurrentStage.order || 1;
                const maxOrder = Math.max(...stages.map(s => s.order), 1);
                
                // Si on est à l'étape finale, 100%
                if (effectiveCurrentStage.is_final) {
                    progressPercent = 100;
                } else {
                    // Calcul basé sur la position dans le pipeline
                    progressPercent = Math.round(((currentOrder - 1) / Math.max(maxOrder - 1, 1)) * 100);
                }
            } else {
                // Méthode alternative : compter les étapes avec progression complétée
                const completedStages = progression?.filter(prog => prog.completed).length || 0;
                const totalStages = stages.length;
                progressPercent = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;
            }
            
            // S'assurer que le pourcentage est dans la plage valide
            progressPercent = Math.min(Math.max(progressPercent, 0), 100);
        }

        return (
            <>
                <div className="pipeline-manager-header">
                    <Title level={5}>
                        {isPipelineCompleted ? "Pipeline terminé" : "Progression du pipeline"}
                        {!isPipelineCompleted && effectiveCurrentStage && (
                            <span style={{ fontSize: '14px', color: '#666', marginLeft: '10px' }}>
                                (Étape {effectiveCurrentStage.order || 1} sur {stages.length})
                            </span>
                        )}
                    </Title>
                    <Space>
                        <Button
                            icon={<OrderedListOutlined />}
                            size="small"
                            onClick={() => setStageListVisible(true)}
                        >
                            Liste des étapes
                        </Button>
                        {!isPipelineCompleted && nextStage && (
                            <Button
                                type="primary"
                                size="small"
                                icon={<RightOutlined />}
                                onClick={handleOpenAdvanceModal}
                            >
                                Advance
                            </Button>
                        )}
                        {!isPipelineCompleted && showAddButton && (
                            <Button
                                type={buttonType}
                                icon={<PlusOutlined />}
                                size="small"
                                onClick={handleAddStage}
                                className={buttonClassName}
                            >
                                {buttonText}
                            </Button>
                        )}
                    </Space>
                </div>

                <Progress
                    percent={progressPercent}
                    status={isPipelineCompleted ? "success" : "active"}
                    strokeColor={isPipelineCompleted ? {
                        '0%': '#52c41a',
                        '100%': '#52c41a',
                    } : {
                        '0%': '#108ee9',
                        '100%': '#87d068',
                    }}
                />

                {/* Affichage des étapes sous forme de cases cliquables */}
                <div className="pipeline-stages-boxes">
                    {stages.map(stage => {
                        // Logique améliorée pour déterminer l'état des étapes
                        let isCompleted = false;
                        let isActive = false;
                        let isPending = false;

                        if (isPipelineCompleted) {
                            // Si le pipeline est terminé, toutes les étapes sont complétées
                            isCompleted = true;
                        } else if (effectiveCurrentStage) {
                            // Étape complétée : ordre inférieur à l'étape actuelle
                            isCompleted = stage.order < effectiveCurrentStage.order;
                            // Étape active : même ID ou même ordre que l'étape actuelle
                            isActive = stage.id === effectiveCurrentStage.id || stage.order === effectiveCurrentStage.order;
                            // Étape en attente : ordre supérieur à l'étape actuelle
                            isPending = stage.order > effectiveCurrentStage.order;
                        } else {
                            // Fallback : vérifier dans la progression
                            const stageProgression = progression?.find(prog => prog.stage_id === stage.id);
                            isCompleted = stageProgression?.completed || false;
                            isActive = !isCompleted && stage.order === 1; // Par défaut, première étape active
                            isPending = !isCompleted && !isActive;
                        }

                        return (
                            <div
                                key={stage.id}
                                className={`pipeline-stage-box ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isPending ? 'pending' : ''}`}
                                onClick={() => isActive ? handleViewStageDetails(stage) : handleAdvanceToStage(stage)}
                            >
                                <div className="stage-name">{stage.name}</div>
                                <div className="stage-order">Étape {stage.order}</div>
                                {stage.is_final && (
                                    <div className="stage-final-indicator">Finale</div>
                                )}
                                {/* Ne pas afficher le bouton Advance si le pipeline est terminé ou l'étape est complétée */}
                                {isActive && nextStage && !isCompleted && !isPipelineCompleted && (
                                    <Button
                                        className="advance-button"
                                        icon={<RightOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenAdvanceModal();
                                        }}
                                    >
                                        Advance
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Indicateurs de progression */}
                <div className="pipeline-indicators">
                    {stages.map(stage => {
                        const isCompleted = isPipelineCompleted || (effectiveCurrentStage && stage.order < effectiveCurrentStage.order);
                        const isActive = !isPipelineCompleted && effectiveCurrentStage && stage.id === effectiveCurrentStage.id;

                        return (
                            <div
                                key={stage.id}
                                className={`pipeline-indicator ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                            >
                                <div className="indicator-label">{stage.name}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Visualisation des étapes en mode Steps (optionnel selon visualizerStyle) */}
                {(visualizerStyle === 'steps' || visualizerStyle === 'both') && (
                    <Steps
                        current={isPipelineCompleted ? stages.length : (effectiveCurrentStage ? effectiveCurrentStage.order - 1 : 0)}
                        direction="horizontal"
                        size="small"
                        className="pipeline-steps"
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
                                        >
                                            Détails
                                        </Button>
                                    }
                                    status={isPipelineCompleted ? 'finish' : isCompleted ? 'finish' : isActive ? 'process' : 'wait'}
                                />
                            );
                        })}
                    </Steps>
                )}

                {/* Alert pour afficher le statut du pipeline */}
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
                    style={{ marginTop: 16 }}
                    action={
                        !isPipelineCompleted && nextStage && (
                            <Button
                                size="small"
                                type="primary"
                                onClick={handleOpenAdvanceModal}
                            >
                                Avancer
                            </Button>
                        )
                    }
                />
            </>
        );
    };

    // Modal pour la liste des étapes
    const StageListModal = () => (
        <Modal
            title="Liste des étapes du pipeline"
            open={stageListVisible}
            onCancel={() => setStageListVisible(false)}
            footer={null}
            width={700}
        >
            <div className="pipeline-stage-list">
                {stages.map((stage) => (
                    <div key={stage.id} className="pipeline-stage-item">
                        <div className="stage-info">
                            <div className="stage-name">{stage.name}</div>
                            <div className="stage-description">{stage.description}</div>
                            <div className="stage-order">Ordre: {stage.order}</div>
                            {stage.is_final && <div className="stage-final-badge">Étape finale</div>}
                        </div>

                        <Space>
                            <Button
                                icon={<ArrowUpOutlined />}
                                size="small"
                                disabled={stage.order <= 1}
                                onClick={() => handleMoveStage(stage, 'up')}
                            />
                            <Button
                                icon={<ArrowDownOutlined />}
                                size="small"
                                disabled={stage.order >= stages.length}
                                onClick={() => handleMoveStage(stage, 'down')}
                            />
                            <Button
                                icon={<EditOutlined />}
                                size="small"
                                onClick={() => {
                                    handleEditStage(stage);
                                    setStageListVisible(false);
                                }}
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
                                />
                            </Popconfirm>
                        </Space>
                    </div>
                ))}
            </div>
        </Modal>
    );

    return (
        <div className="pipeline-stage-manager">
            {/* Bouton d'ajout d'étape (si pas en mode visualisation) */}
            {!showVisualizer && showAddButton && (
                <Button
                    type={buttonType}
                    icon={<PlusOutlined />}
                    onClick={handleAddStage}
                    className={buttonClassName}
                >
                    {buttonText}
                </Button>
            )}

            {/* Mode visualisation (si activé) */}
            {showVisualizer && renderPipelineVisualizer()}

            {/* Modal pour ajouter/modifier une étape */}
            <Modal
                title={editingStage ? "Modifier l'étape" : "Nouvelle étape"}
                open={stageModalVisible}
                onCancel={() => {
                    setEditingStage(null);
                    setStageModalVisible(false);
                }}
                onOk={handleSaveStage}
                okText={editingStage ? "Mettre à jour" : "Ajouter"}
                cancelText="Annuler"
            >
                <Form form={stageForm} layout="vertical" initialValues={editingStage || {}}>
                    <Form.Item
                        name="name"
                        label="Nom de l'étape"
                        rules={[{ required: true, message: "Nom obligatoire" }]}
                    >
                        <Input placeholder="Nom de l'étape" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <TextArea
                            rows={3}
                            placeholder="Description de cette étape du pipeline"
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
                        />
                    </Form.Item>

                    <Form.Item name="is_final" valuePropName="checked">
                        <Checkbox>Étape finale</Checkbox>
                        <Text type="secondary" style={{ marginLeft: 8 }}>
                            (L'étape finale marque la fin du pipeline)
                        </Text>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Drawer pour afficher les détails d'une étape */}
            <Drawer
                title={`Détails de l'étape: ${selectedStage?.name || ''}`}
                placement="right"
                width={600}
                onClose={() => setStageDetailsVisible(false)}
                open={stageDetailsVisible}
            >
                {loading || stageLoading ? (
                    <div style={{ textAlign: 'center', padding: '50px 0' }}>
                        <Spin tip="Chargement des détails..." />
                    </div>
                ) : stageError ? (
                    <Alert
                        message="Erreur"
                        description={`Impossible de charger les détails: ${stageError}`}
                        type="error"
                        showIcon
                    />
                ) : (
                    <Tabs defaultActiveKey="info">
                        <TabPane tab={<span><InfoCircleOutlined /> Informations</span>} key="info">
                            <Card bordered={false}>
                                <Descriptions column={1} bordered>
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

                                    {/* Afficher la progression si disponible */}
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
                                        <Button icon={<DeleteOutlined />} danger>
                                            Supprimer
                                        </Button>
                                    </Popconfirm>
                                </Space>
                            </Card>
                        </TabPane>

                        <TabPane tab={<span><ClockCircleOutlined /> Tâches ({stageTasks?.length || 0})</span>} key="tasks">
                            {loadingTasks ? (
                                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                                    <Spin size="small" />
                                </div>
                            ) : stageTasks && stageTasks.length > 0 ? (
                                <List
                                    dataSource={stageTasks}
                                    renderItem={task => (
                                        <List.Item
                                            actions={[
                                                <Button
                                                    key="view"
                                                    type="link"
                                                    size="small"
                                                    onClick={() => window.open(`/tasks/${task.id}`, '_blank')}
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
                                <Empty description="Aucune tâche associée à cette étape" />
                            )}
                        </TabPane>

                        <TabPane tab={<span><WarningOutlined /> Blocages ({stageBlockages.length})</span>} key="blockages">
                            {loadingBlockages ? (
                                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                                    <Spin size="small" />
                                </div>
                            ) : stageBlockages.length > 0 ? (
                                <List
                                    dataSource={stageBlockages}
                                    renderItem={blockage => (
                                        <List.Item>
                                            <List.Item.Meta
                                                title={
                                                    <Space>
                                                        <Tag color="red">Blocage</Tag>
                                                        {blockage.name} {/* Utiliser name au lieu de title */}
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
                                <Empty description="Aucun blocage pour cette étape" />
                            )}
                        </TabPane>

                        <TabPane tab={<span><FileTextOutlined /> Notes</span>} key="notes">
                            {stageDetailsFromStore?.notes ? (
                                <Card bordered={false}>
                                    <Paragraph>{stageDetailsFromStore.notes}</Paragraph>
                                </Card>
                            ) : (
                                <Empty description="Aucune note pour cette étape" />
                            )}
                        </TabPane>
                    </Tabs>
                )}
            </Drawer>

            {/* Modal pour avancer dans le pipeline */}
            <Modal
                title={`Passer à l'étape: ${nextStage?.name || ''}`}
                open={advanceModalVisible}
                onCancel={() => setAdvanceModalVisible(false)}
                onOk={handleAdvancePipeline}
                okText="Confirmer l'avancement"
                cancelText="Annuler"
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
                        />
                    </Form.Item>

                    <Form.Item
                        name="notes"
                        label="Notes"
                    >
                        <TextArea rows={4} placeholder="Informations complémentaires sur cette étape" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal pour la liste des étapes */}
            <StageListModal />

            <style jsx>{`
        .pipeline-stage-manager {
          margin-bottom: 20px;
        }
        
        .pipeline-manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .pipeline-steps {
          margin-top: 20px;
          margin-bottom: 20px;
        }

        .pipeline-stages-boxes {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin: 20px 0;
        }
        
        .pipeline-stage-box {
          padding: 12px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          background-color: #f5f5f5;
          border: 1px solid #e8e8e8;
          flex: 1;
          min-width: 180px;
          text-align: center;
          position: relative;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        
        .pipeline-stage-box.completed {
          background-color: #e6f7ff;
          border-color: #91d5ff;
          color: #1890ff;
        }
        
        .pipeline-stage-box.active {
          background-color: #1890ff;
          border-color: #096dd9;
          color: white;
        }
        
        .pipeline-stage-box.pending {
          background-color: #f5f5f5;
          color: #8c8c8c;
        }
        
        .pipeline-stage-box:hover {
          transform: translateY(-2px);
          box-shadow: 0 3px 6px rgba(0,0,0,0.1);
        }
        
        .advance-button {
          position: absolute;
          top: 50%;
          right: 10px;
          transform: translateY(-50%);
          background-color: white;
          color: #1890ff;
          border: 1px solid #1890ff;
          font-size: 12px;
          padding: 2px 8px;
          opacity: 0;
          transition: opacity 0.2s;
        }
        
        .pipeline-stage-box.active:hover .advance-button {
          opacity: 1;
        }

        .pipeline-indicators {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          margin: 30px 0 40px;
        }
        
        .pipeline-indicators::after {
          content: '';
          position: absolute;
          top: 7px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: #e8e8e8;
          z-index: 1;
        }
        
        .pipeline-indicator {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .pipeline-indicator::before {
          content: '';
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: #f0f0f0;
          border: 2px solid #d9d9d9;
        }
        
        .pipeline-indicator.completed::before {
          background-color: #52c41a;
          border-color: #52c41a;
        }
        
        .pipeline-indicator.active::before {
          background-color: #1890ff;
          border-color: #1890ff;
          box-shadow: 0 0 0 4px rgba(24, 144, 255, 0.2);
        }
        
        .indicator-label {
          margin-top: 10px;
          font-size: 12px;
          color: #8c8c8c;
          text-align: center;
          max-width: 100px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pipeline-stage-list {
          margin-top: 16px;
        }
        
        .pipeline-stage-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background-color: #f9f9f9;
          border-radius: 4px;
          margin-bottom: 8px;
          border-left: 3px solid #1890ff;
        }
        
        .stage-name {
          font-weight: 600;
          font-size: 14px;
        }
        
        .stage-description {
          color: #666;
          font-size: 12px;
          margin-top: 4px;
        }
        
        .stage-order {
          font-size: 12px;
          color: #888;
          margin-top: 4px;
        }
        
        .stage-final-badge {
          display: inline-block;
          background-color: #52c41a;
          color: white;
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 10px;
          margin-top: 4px;
        }
      `}</style>
        </div>
    );
};

/**
 * Composant pour afficher la visualisation d'un pipeline
 */
export const PipelineVisualizer = ({
    stages = [],
    currentStage,
    progression = []
}) => {
    // Déterminer l'étape actuelle
    const effectiveCurrentStage = currentStage ||
        (stages && stages.length > 0 ? stages[0] : null);

    // Fonction pour formater la date
    const formatDate = (dateString) => {
        if (!dateString) return 'Non définie';
        return moment(dateString).format('DD/MM/YYYY HH:mm');
    };

    // S'il n'y a pas d'étapes, afficher un message
    if (!stages || stages.length === 0) {
        return (
            <div className="pipeline-empty">
                Aucune étape définie dans ce pipeline.
            </div>
        );
    }

    // Calculer le pourcentage de progression
    const completedStages = stages.filter(
        stage => stage.order < (effectiveCurrentStage?.order || 1)
    ).length;

    const progressPercent = Math.round(
        (completedStages / Math.max(1, stages.length)) * 100
    );

    return (
        <div className="pipeline-visualizer">
            <Progress
                percent={progressPercent}
                status="active"
                strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                }}
            />

            <Steps
                current={effectiveCurrentStage ? effectiveCurrentStage.order - 1 : 0}
                direction="vertical"
                className="pipeline-steps"
            >
                {stages.map(stage => {
                    // Trouver les informations de progression pour cette étape
                    const stageProgression = progression.find(p => p.stage_id === stage.id);
                    const isCompleted = stage.order < (effectiveCurrentStage?.order || 1);

                    return (
                        <Step
                            key={stage.id}
                            title={stage.name}
                            description={
                                <div>
                                    <p>{stage.description}</p>
                                    {stageProgression && (
                                        <Text type="success">
                                            <CheckCircleOutlined /> Complété le {formatDate(stageProgression.created_at)}
                                        </Text>
                                    )}
                                </div>
                            }
                            status={isCompleted ? 'finish' : stage.id === effectiveCurrentStage?.id ? 'process' : 'wait'}
                        />
                    );
                })}
            </Steps>

            <style jsx>{`
        .pipeline-visualizer {
          margin: 20px 0;
        }
        
        .pipeline-steps {
          margin-top: 24px;
        }
        
        .pipeline-empty {
          text-align: center;
          padding: 24px;
          color: #999;
        }
      `}</style>
        </div>
    );
};

/**
 * Composant pour afficher la liste des étapes avec options de gestion
 */
export const PipelineStageList = ({
    stages = [],
    entityType,
    onStagesChange,
    showActions = true
}) => {
    const dispatch = useDispatch();

    // Gérer la suppression d'une étape
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

    // Gérer l'édition d'une étape
    const handleEditStage = (stage) => {
        // À implémenter en coordination avec le composant parent
        if (onStagesChange) {
            onStagesChange('edit', stage);
        }
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

    return (
        <div className="pipeline-stage-list">
            {stages.map((stage) => (
                <div key={stage.id} className="pipeline-stage-item">
                    <div className="stage-info">
                        <div className="stage-name">{stage.name}</div>
                        <div className="stage-description">{stage.description}</div>
                        <div className="stage-order">Ordre: {stage.order}</div>
                        {stage.is_final && <div className="stage-final-badge">Étape finale</div>}
                    </div>

                    {showActions && (
                        <Space>
                            <Button
                                icon={<ArrowUpOutlined />}
                                size="small"
                                disabled={stage.order <= 1}
                                onClick={() => handleMoveStage(stage, 'up')}
                            />
                            <Button
                                icon={<ArrowDownOutlined />}
                                size="small"
                                disabled={stage.order >= stages.length}
                                onClick={() => handleMoveStage(stage, 'down')}
                            />
                            <Button
                                icon={<EditOutlined />}
                                size="small"
                                onClick={() => handleEditStage(stage)}
                            />
                            <Popconfirm
                                title="Êtes-vous sûr de vouloir supprimer cette étape?"
                                onConfirm={() => handleDeleteStage(stage.id)}
                                okText="Oui"
                                cancelText="Non"
                            >
                                <Button
                                    icon={<DeleteOutlined />}
                                    size="small"
                                    danger
                                />
                            </Popconfirm>
                        </Space>
                    )}
                </div>
            ))}

            <style jsx>{`
        .pipeline-stage-list {
          margin-top: 16px;
        }
        
        .pipeline-stage-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background-color: #f9f9f9;
          border-radius: 4px;
          margin-bottom: 8px;
          border-left: 3px solid #1890ff;
        }
        
        .stage-name {
          font-weight: 600;
          font-size: 14px;
        }
        
        .stage-description {
          color: #666;
          font-size: 12px;
          margin-top: 4px;
        }
        
        .stage-order {
          font-size: 12px;
          color: #888;
          margin-top: 4px;
        }
        
        .stage-final-badge {
          display: inline-block;
          background-color: #52c41a;
          color: white;
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 10px;
          margin-top: 4px;
        }
      `}</style>
        </div>
    );
};

export default PipelineStageManager;