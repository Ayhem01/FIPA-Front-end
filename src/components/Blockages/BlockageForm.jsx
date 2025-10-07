import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Form, Input, Select, Button, Space, Typography, message, Spin, Alert, Modal
} from 'antd';
import { createBlockage, updateBlockage, resetOperation } from '../../features/blockageSlice';
import { fetchAllUsers, getCurrentUser } from '../../features/userSlice';
import { getInvitePipeline } from '../../features/inviteSlice';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const BlockageForm = ({ blockage, onCancel, entityType, entityId, pipelineStageType, pipelineStageId }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { operation } = useSelector(state => state.blockages);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingPipeline, setLoadingPipeline] = useState(false);
  const [formChanged, setFormChanged] = useState(false);

  // Récupérer utilisateurs + user courant
  const { list: usersList = [] } = useSelector(state => state.user);
  const currentUser = useSelector(state => state.user.user);

  // Pipeline courant
  const currentStage = useSelector(state => state.invite?.pipeline?.currentStage);
  const pipelineLoaded = useSelector(
    state => !state.invite?.pipeline?.loading && state.invite?.pipeline?.stages?.length > 0
  );

  // Charger utilisateurs + pipeline si besoin
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          dispatch(getCurrentUser()).unwrap(),
          dispatch(fetchAllUsers()).unwrap()
        ]);

        // Charger pipeline seulement en mode création pour les invités
        if (!blockage && !pipelineLoaded && entityType === 'invite' && entityId) {
          setLoadingPipeline(true);
          try {
            await dispatch(getInvitePipeline(entityId)).unwrap();
          } catch (pipelineError) {
            console.error("Erreur pipeline:", pipelineError);
            message.warning("Impossible de récupérer l'étape courante du pipeline");
          } finally {
            setLoadingPipeline(false);
          }
        }
      } catch (error) {
        console.error("Erreur chargement:", error);
        message.error("Erreur lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dispatch, entityType, entityId, pipelineLoaded, blockage]);

  // Pré-remplir formulaire si modification
  useEffect(() => {
    if (blockage) {
      console.log('Pré-remplissage avec:', blockage);
      form.setFieldsValue({
        name: blockage.name,
        description: blockage.description,
        blockage_type: blockage.blockage_type,
        priority: blockage.priority || 'medium',
        status: blockage.status || 'actif',
        assigned_to: blockage.assigned_user?.id || blockage.assigned_to
      });
      setFormChanged(false); // Reset après pré-remplissage
    } else {
      form.setFieldsValue({
        priority: 'medium',
        status: 'actif',
        blockage_type: 'process'
      });
    }
  }, [blockage, form]);

  // Gérer succès/erreur API
  useEffect(() => {
    if (operation.success) {
      const action = blockage ? 'mis à jour' : 'créé';
      message.success(`Blocage ${action} avec succès`);
      form.resetFields();
      setFormChanged(false);
      dispatch(resetOperation());
      onCancel(); // Ferme le modal et recharge les données
    } else if (operation.error) {
      message.error(`Erreur: ${operation.error}`);
      setIsSubmitting(false);
      dispatch(resetOperation());
    }
  }, [operation, blockage, form, dispatch, onCancel]);

  // Fonction pour gérer les changements de formulaire
  const handleFormChange = () => {
    setFormChanged(true);
  };

  // Fonction pour gérer l'annulation avec confirmation
  const handleCancel = () => {
    if (formChanged && !isSubmitting) {
      Modal.confirm({
        title: 'Annuler les modifications ?',
        content: 'Les modifications non sauvegardées seront perdues.',
        okText: 'Oui, annuler',
        cancelText: 'Continuer à modifier',
        onOk: () => {
          form.resetFields();
          setFormChanged(false);
          onCancel();
        }
      });
    } else {
      onCancel();
    }
  };

  // Soumission formulaire
  const handleSubmit = (values) => {
    setIsSubmitting(true);

    if (blockage) {
      // MODE MODIFICATION
      console.log('Mise à jour du blocage:', { id: blockage.id, values });
      dispatch(updateBlockage({
        id: blockage.id,
        blockageData: values
      }))
      .unwrap()
      .catch(err => {
        console.error("Erreur update:", err);
        setIsSubmitting(false);
      });
    } else {
      // MODE CRÉATION
      const effectiveStageId = currentStage?.id || pipelineStageId;

      if (!entityType || !entityId || !pipelineStageType || !effectiveStageId) {
        message.error("⚠️ Informations manquantes pour créer le blocage");
        setIsSubmitting(false);
        return;
      }

      if (!currentUser || !currentUser.id) {
        message.error("⚠️ Impossible de déterminer l'utilisateur connecté");
        setIsSubmitting(false);
        return;
      }

      const blockageData = {
        ...values,
        blockable_type: entityType,
        blockable_id: parseInt(entityId),
        pipeline_stageable_type: pipelineStageType,
        pipeline_stageable_id: parseInt(effectiveStageId),
        is_blocking: 1
      };

      console.log("📤 Blocage envoyé:", blockageData);

      dispatch(createBlockage(blockageData))
      .unwrap()
      .catch(err => {
        console.error("Erreur création:", err);
        setIsSubmitting(false);
      });
    }
  };

  return (
    <div className="blockage-form">
      <Title level={4} style={{ marginBottom: 16 }}>
        {blockage ? `Modifier: ${blockage.name}` : 'Créer un blocage'}
      </Title>

      {/* Alert pour la modification */}
      {blockage && (
        <Alert
          type="info"
          style={{ marginBottom: 16 }}
          message={`Modification du blocage #${blockage.id}`}
          description={`Créé le ${new Date(blockage.created_at).toLocaleDateString('fr-FR')} - Type: ${blockage.blockable_type}`}
          showIcon
        />
      )}

      {/* Alert pour les invités seulement en mode création */}
      {!blockage && entityType === 'invite' && !isLoading && (
        <Alert
          type="info"
          style={{ marginBottom: 16 }}
          message={
            loadingPipeline
              ? "Chargement de l'étape courante..."
              : currentStage
                ? `Blocage associé à l'étape courante: ${currentStage.name}`
                : "Blocage associé à l'étape sélectionnée"
          }
          showIcon
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={handleFormChange}
        disabled={isLoading || isSubmitting}
      >
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin tip="Chargement..." />
          </div>
        ) : (
          <>
            <Form.Item 
              name="name" 
              label="Nom du blocage" 
              rules={[
                { required: true, message: 'Le nom est requis' },
                { min: 3, message: 'Le nom doit contenir au moins 3 caractères' }
              ]}
            >
              <Input placeholder="Ex: Données manquantes" />
            </Form.Item>

            <Form.Item 
              name="description" 
              label="Description"
              rules={[
                { max: 500, message: 'La description ne peut pas dépasser 500 caractères' }
              ]}
            >
              <TextArea 
                rows={4} 
                placeholder="Description détaillée du blocage..." 
                showCount
                maxLength={500}
              />
            </Form.Item>

            <Space size="large" style={{ display: 'flex', width: '100%' }}>
              <Form.Item 
                name="blockage_type" 
                label="Type de blocage" 
                rules={[{ required: true, message: 'Le type est requis' }]} 
                style={{ flex: 1 }}
              >
                <Select placeholder="Sélectionner un type">
                  <Option value="process">🔄 Processus</Option>
                  <Option value="data">📊 Données</Option>
                  <Option value="technical">⚙️ Technique</Option>
                  <Option value="other">📋 Autre</Option>
                </Select>
              </Form.Item>

              <Form.Item 
                name="priority" 
                label="Priorité" 
                rules={[{ required: true, message: 'La priorité est requise' }]}
                style={{ flex: 1 }}
              >
                <Select placeholder="Sélectionner une priorité">
                  <Option value="low">🟢 Basse</Option>
                  <Option value="medium">🟡 Moyenne</Option>
                  <Option value="high">🟠 Haute</Option>
                  <Option value="critical">🔴 Critique</Option>
                </Select>
              </Form.Item>
            </Space>

            <Space size="large" style={{ display: 'flex', width: '100%' }}>
              <Form.Item 
                name="status" 
                label="Statut" 
                rules={[{ required: true, message: 'Le statut est requis' }]}
                style={{ flex: 1 }}
              >
                <Select placeholder="Sélectionner un statut">
                  <Option value="actif">🟠 Actif</Option>
                  <Option value="in_progress">🔄 En cours</Option>
                  <Option value="resolu">✅ Résolu</Option>
                  <Option value="annule">❌ Annulé</Option>
                </Select>
              </Form.Item>

              <Form.Item 
                name="assigned_to" 
                label="Assigné à" 
                style={{ flex: 1 }}
              >
                <Select 
                  placeholder="Assignez à un utilisateur" 
                  allowClear 
                  loading={!usersList.length}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {usersList.map(user => (
                    <Option key={user.id} value={user.id}>
                      👤 {user.name} ({user.email})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Space>

            <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={isSubmitting}
                  disabled={isLoading}
                >
                  {blockage ? '📝 Mettre à jour' : '✨ Créer'}
                </Button>
                <Button 
                  onClick={handleCancel} 
                  disabled={isSubmitting}
                >
                  ❌ Annuler
                </Button>
              </Space>
            </Form.Item>
          </>
        )}
      </Form>

      <style jsx>{`
        .blockage-form {
          max-width: 100%;
        }
        
        .blockage-form .ant-form-item {
          margin-bottom: 16px;
        }
        
        .blockage-form .ant-select,
        .blockage-form .ant-input {
          border-radius: 6px;
        }
        
        .blockage-form .ant-btn {
          border-radius: 6px;
          font-weight: 500;
        }
        
        .blockage-form .ant-alert {
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default BlockageForm;