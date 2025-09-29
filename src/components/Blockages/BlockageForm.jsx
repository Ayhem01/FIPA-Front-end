import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Form, Input, Select, Button, Space, Typography, message, Spin, Alert
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

        if (!pipelineLoaded && entityType === 'invite' && entityId) {
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
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dispatch, entityType, entityId, pipelineLoaded]);

  // Pré-remplir formulaire si modification
  useEffect(() => {
    if (blockage) {
      form.setFieldsValue({
        name: blockage.name,
        description: blockage.description,
        blockage_type: blockage.blockage_type,
        priority: blockage.priority || 'medium',
        status: blockage.status || 'actif',
        assigned_to: blockage.assigned_to
      });
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
    if (!operation.loading) {
      if (operation.success) {
        message.success(blockage ? 'Blocage mis à jour' : 'Blocage créé');
        form.resetFields();
        dispatch(resetOperation());
        onCancel();
      } else if (operation.error) {
        message.error(`Erreur: ${operation.error}`);
        setIsSubmitting(false);
      }
    }
  }, [operation, blockage, form, dispatch, onCancel]);

  // Soumission formulaire
  const handleSubmit = (values) => {
    const effectiveStageId = currentStage?.id || pipelineStageId;

    if (!entityType || !entityId || !pipelineStageType || !effectiveStageId) {
      message.error("⚠️ Informations manquantes pour créer le blocage");
      return;
    }

    if (!currentUser || !currentUser.id) {
      message.error("⚠️ Impossible de déterminer l'utilisateur connecté");
      return;
    }

    setIsSubmitting(true);

    if (blockage) {
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
      const blockageData = {
        ...values,
        blockable_type: entityType,
        blockable_id: parseInt(entityId),
        pipeline_stageable_type: pipelineStageType,
        pipeline_stageable_id: parseInt(effectiveStageId),
        is_blocking: 1
        // ❌ pas besoin de created_by → backend le gère
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
      <Title level={4}>{blockage ? 'Modifier le blocage' : 'Créer un blocage'}</Title>

      {entityType === 'invite' && !isLoading && (
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
        disabled={isLoading || isSubmitting}
      >
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin tip="Chargement..." />
          </div>
        ) : (
          <>
            <Form.Item name="name" label="Nom du blocage" rules={[{ required: true }]}>
              <Input placeholder="Ex: Données manquantes" />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <TextArea rows={4} placeholder="Description détaillée..." />
            </Form.Item>

            <Space size="large" style={{ display: 'flex' }}>
              <Form.Item name="blockage_type" label="Type" rules={[{ required: true }]} style={{ flex: 1 }}>
                <Select>
                  <Option value="process">Processus</Option>
                  <Option value="data">Données</Option>
                  <Option value="technical">Technique</Option>
                  <Option value="other">Autre</Option>
                </Select>
              </Form.Item>

              <Form.Item name="priority" label="Priorité" style={{ flex: 1 }}>
                <Select>
                  <Option value="low">Basse</Option>
                  <Option value="medium">Moyenne</Option>
                  <Option value="high">Haute</Option>
                  <Option value="critical">Critique</Option>
                </Select>
              </Form.Item>
            </Space>

            <Space size="large" style={{ display: 'flex' }}>
              <Form.Item name="status" label="Statut" style={{ flex: 1 }}>
                <Select>
                  <Option value="actif">Actif</Option>
                  <Option value="resolu">Résolu</Option>
                  <Option value="annule">Annulé</Option>
                </Select>
              </Form.Item>

              <Form.Item name="assigned_to" label="Assigné à" style={{ flex: 1 }}>
                <Select placeholder="Assignez à un utilisateur" allowClear loading={!usersList.length}>
                  {usersList.map(user => (
                    <Option key={user.id} value={user.id}>{user.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Space>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={isSubmitting}>
                  {blockage ? 'Mettre à jour' : 'Créer'}
                </Button>
                <Button onClick={onCancel} disabled={isSubmitting}>Annuler</Button>
              </Space>
            </Form.Item>
          </>
        )}
      </Form>
    </div>
  );
};

export default BlockageForm;
