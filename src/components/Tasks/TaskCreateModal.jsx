import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, Card, Switch, message, Alert, Space, Avatar, Spin, Modal } from 'antd';
import { SaveOutlined, UserOutlined, CloseOutlined } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { createTask, updateTask } from '../../features/taskSlice';
import { fetchAllUsers, getCurrentUser } from '../../features/userSlice';
import { createPipelineStageTask, updatePipelineTask } from '../../features/taskSlice';

const { Option } = Select;

/**
 * Composant modal de création/modification de tâche pour les pipelines
 * @param {Object} props - Propriétés du composant
 * @param {boolean} props.visible - Si le modal est visible
 * @param {function} props.onCancel - Fonction à exécuter quand le modal est fermé
 * @param {function} props.onSuccess - Fonction à exécuter quand une tâche est créée/modifiée avec succès
 * @param {string} props.entityType - Type d'entité ('prospect', 'invite', 'investisseur', 'project')
 * @param {string|number} props.entityId - ID de l'entité (prospect, invite, etc.)
 * @param {string|number} props.stageId - ID de l'étape du pipeline
 * @param {string} props.stageName - Nom de l'étape du pipeline (pour le titre par défaut)
 * @param {Object} props.initialValues - Valeurs initiales du formulaire (pour l'édition)
 * @param {Object} props.entityName - Nom de l'entité à laquelle la tâche est associée
 */
const TaskCreateModal = ({
  visible = false,
  onCancel,
  onSuccess,
  entityType = '',
  entityId = null,
  stageId = null,
  stageName = '',
  initialValues = null,
  entityName = ''
}) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  
  const currentUser = useSelector(state => state.user.user);
  const { list: usersList = [] } = useSelector(state => state.user);
  const isEditMode = !!initialValues;

  // S'assurer que l'utilisateur est chargé
  useEffect(() => {
    const fetchUserIfNeeded = async () => {
      if (!currentUser?.id && localStorage.getItem('token')) {
        try {
          await dispatch(getCurrentUser()).unwrap();
        } catch (error) {
          console.error('Erreur lors du chargement de l\'utilisateur:', error);
        }
      }
    };
    
    fetchUserIfNeeded();
  }, [dispatch, currentUser]);

  // Charger la liste des utilisateurs pour l'affectation
  useEffect(() => {
    if (visible && (!usersList || usersList.length === 0)) {
      dispatch(fetchAllUsers());
    }
  }, [dispatch, visible, usersList]);

  // Initialiser le formulaire lorsque le modal s'ouvre ou quand les valeurs changent
  useEffect(() => {
    if (visible) {
      form.resetFields();
      
      const defaultValues = {
        title: `Tâche pour ${entityName || entityType} - ${stageName || 'étape'}`,
        start: moment(),
        end: moment().add(1, 'hours'),
        type: 'todo',
        priority: 'normal',
        description: '',
        all_day: false,
      };
      
      if (isEditMode) {
        // Si on est en mode édition, utiliser les valeurs fournies
        const editValues = {
          ...initialValues,
          start: initialValues.start ? moment(initialValues.start) : moment(),
          end: initialValues.end ? moment(initialValues.end) : moment().add(1, 'hours')
        };
        form.setFieldsValue(editValues);
        setStartDate(editValues.start);
        setEndDate(editValues.end);
      } else {
        // Sinon, utiliser les valeurs par défaut
        form.setFieldsValue(defaultValues);
        setStartDate(defaultValues.start);
        setEndDate(defaultValues.end);
      }
    }
  }, [visible, form, entityName, entityType, stageName, isEditMode, initialValues]);

  // Gérer le changement de date de début
  const handleStartDateChange = date => {
    setStartDate(date);
    
    // Réinitialiser la date de fin si elle est avant la nouvelle date de début
    if (endDate && date && endDate.isBefore(date)) {
      setEndDate(null);
      form.setFieldsValue({ end: null });
    }
  };

  // Fonction pour soumettre le formulaire
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      setErrorMessage('');
  
      // Vérifier si l'utilisateur est connecté
      if (!currentUser?.id) {
        setErrorMessage('Utilisateur non connecté. Veuillez vous reconnecter.');
        setLoading(false);
        return;
      }
  
      // Préparation des données
      const taskData = {
        title: values.title,
        description: values.description || '',
        start: values.start?.format('YYYY-MM-DD HH:mm:ss'),
        end: values.end?.format('YYYY-MM-DD HH:mm:ss'),
        all_day: values.all_day || false,
        type: values.type || 'todo',
        priority: values.priority || 'medium',
        user_id: currentUser.id,
        assignee_id: values.assignedTo || null
      };
  
      let actionResult;
      
      if (isEditMode) {
        // Utiliser la nouvelle fonction pour mettre à jour
        actionResult = await dispatch(updatePipelineTask({ 
          taskId: initialValues.id,
          taskData 
        })).unwrap();
      } else {
        // Utiliser la nouvelle fonction pour créer
        const payload = {
          entityType,
          entityId,
          stageId,
          taskData
        };
        
        actionResult = await dispatch(createPipelineStageTask(payload)).unwrap();
      }
  
      setLoading(false);
      message.success(isEditMode ? 'Tâche mise à jour avec succès' : 'Tâche créée avec succès');
      
      if (onSuccess) {
        onSuccess(actionResult);
      }
    } catch (error) {
      setLoading(false);
      console.error('Erreur lors de la création/mise à jour de la tâche:', error);
      setErrorMessage(error.message || 'Une erreur est survenue lors de la création de la tâche');
    }
  };

  // Si l'entité ou l'étape n'est pas définie, on ne peut pas créer de tâche
  const isFormDisabled = !entityId || !stageId;

  return (
    <Modal
      title={isEditMode ? "Modifier la tâche" : "Créer une nouvelle tâche"}
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Annuler
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={loading}
          disabled={isFormDisabled}
        >
          {isEditMode ? 'Mettre à jour' : 'Créer'}
        </Button>
      ]}
      width={700}
      destroyOnClose={true}
    >
      {errorMessage && (
        <Alert
          message="Erreur"
          description={errorMessage}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      {isFormDisabled && (
        <Alert
          message="Information manquante"
          description="Impossible de créer une tâche: entité ou étape de pipeline non définie."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      {!currentUser && (
        <Alert
          message="Non connecté"
          description="Vous n'êtes pas connecté. Veuillez vous reconnecter pour créer une tâche."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="Titre de la tâche"
          rules={[{ required: true, message: 'Veuillez entrer un titre' }]}
        >
          <Input placeholder="Ex: Contacter le client pour présenter le projet" />
        </Form.Item>

        <div style={{ display: 'flex', gap: '16px' }}>
          <Form.Item
            name="start"
            label="Date de début"
            style={{ flex: 1 }}
            rules={[{ required: true, message: 'Veuillez sélectionner une date de début' }]}
          >
            <DatePicker
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
              onChange={handleStartDateChange}
            />
          </Form.Item>
          <Form.Item
            name="end"
            label="Date de fin"
            style={{ flex: 1 }}
          >
            <DatePicker
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
              disabled={!startDate}
              disabledDate={(current) => {
                return startDate && current && current.isBefore(startDate, 'day');
              }}
            />
          </Form.Item>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <Form.Item
            name="type"
            label="Type de tâche"
            style={{ flex: 1 }}
            initialValue="todo"
          >
            <Select>
              <Option value="call">Appel</Option>
              <Option value="meeting">Réunion</Option>
              <Option value="email_journal">Email</Option>
              <Option value="todo">À faire</Option>
              <Option value="note">Note</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priorité"
            style={{ flex: 1 }}
            initialValue="medium"
          >
            <Select>
              <Option value="low">Basse</Option>
              <Option value="medium">Normale</Option>
              <Option value="high">Haute</Option>
              <Option value="urgent">Urgente</Option>
            </Select>
          </Form.Item>
        </div>
        
        {usersList && usersList.length > 0 && (
          <Form.Item
            name="assignedTo"
            label="Assigné à"
          >
            <Select
              placeholder="Sélectionner un utilisateur"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {usersList.map(user => (
                <Option key={user.id} value={user.id}>
                  <Space>
                    <Avatar size="small" icon={<UserOutlined />} />
                    {user.name || `${user.first_name || ''} ${user.last_name || ''}`}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item
          name="all_day"
          label="Toute la journée"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <TextArea
            rows={4}
            placeholder="Description détaillée de la tâche à effectuer..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskCreateModal;