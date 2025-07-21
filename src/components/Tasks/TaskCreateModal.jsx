import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, Card, Switch, message, Alert, Space, Avatar, Spin } from 'antd';
import { SaveOutlined, UserOutlined } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { createTask, updateTask, getTaskById } from '../../features/taskSlice';
import { fetchAllUsers } from '../../features/userSlice';
import { getCurrentUser } from '../../features/userSlice'; // Ajoutez cette importation si nécessaire

const { Option } = Select;

const TaskCreateModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // États locaux
  const [form] = Form.useForm();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationError, setOperationError] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  // Récupérer l'utilisateur actuel depuis le state Redux
  const currentUser = useSelector(state => state.user.user);
  const { task: currentTask, loading: taskLoading, error: taskError } = useSelector(state => state.tasks);
  
  // S'assurer que l'utilisateur est chargé
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Si cette fonction existe dans votre code, sinon il faut la créer
        await dispatch(getCurrentUser()).unwrap();
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        message.error('Impossible de charger les informations de l\'utilisateur');
      } finally {
        setLoadingUser(false);
      }
    };

    if (!currentUser && localStorage.getItem('token')) {
      fetchUser();
    } else {
      setLoadingUser(false);
    }
  }, [dispatch, currentUser]);
  
  // Déterminer les rôles de l'utilisateur de manière plus robuste
  const isAdmin = currentUser && (
    currentUser.role === 'admin' || 
    currentUser.is_admin === true || 
    (currentUser.roles && currentUser.roles.includes('admin'))
  );
  
  const isResponsableFipa = currentUser && (
    currentUser.role === 'responsable_fipa' || 
    (currentUser.roles && currentUser.roles.includes('responsable_fipa'))
  );
  
  // Force l'évaluation des conditions pour le débogage
  const shouldShowAssignmentField = Boolean(isAdmin && !isResponsableFipa);
  
  // Débogage des rôles
  useEffect(() => {

    
    if (currentUser) {
    }
  }, [currentUser, isAdmin, isResponsableFipa, shouldShowAssignmentField]);

  // Amélioration de la gestion des utilisateurs récupérés
  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await dispatch(fetchAllUsers()).unwrap();
        
        // Traitement des données selon la structure de l'API
        const usersList = Array.isArray(response) ? response : 
                          (response.data ? response.data : []);
        
        setUsers(usersList);
      } catch (error) {
        //message.error('Impossible de charger la liste des utilisateurs');
      } finally {
        setLoadingUsers(false);
      }
    };
    
    // Toujours charger les utilisateurs pour avoir la liste prête
    if (localStorage.getItem('token')) {
      loadUsers();
    }
  }, [dispatch]);

  // Charger les détails de la tâche en mode édition
  useEffect(() => {
    if (isEditMode) {
      dispatch(getTaskById(id));
    }
  }, [dispatch, id, isEditMode]);

  // Remplir le formulaire avec les données de la tâche en mode édition
  useEffect(() => {
    if (isEditMode && currentTask) {
      const startMoment = currentTask.start ? moment(currentTask.start) : null;
      const endMoment = currentTask.end ? moment(currentTask.end) : null;

      setStartDate(startMoment);
      setEndDate(endMoment);

      form.setFieldsValue({
        title: currentTask.title,
        description: currentTask.description,
        type: currentTask.type || 'call',
        priority: currentTask.priority || 'normal',
        status: currentTask.status || 'not_started',
        all_day: currentTask.all_day || false,
        start: startMoment,
        end: endMoment,
        assignedTo: currentTask.assignee_id || null
      });
    } else if (!isEditMode) {
      // Initialiser avec la date stockée dans localStorage ou la date actuelle
      const savedDate = localStorage.getItem('newTaskDate');
      if (savedDate) {
        const initialDate = moment(savedDate);
        setStartDate(initialDate);
        form.setFieldsValue({ start: initialDate });
        // Nettoyer le localStorage
        localStorage.removeItem('newTaskDate');
      }
    }
  }, [form, isEditMode, currentTask]);

  // Fonction pour désactiver les dates passées
  const disabledDate = current => {
    // Désactiver les dates avant aujourd'hui
    return current && current < moment().startOf('day');
  };

  // Gérer le changement de date de début
  const handleStartDateChange = date => {
    setStartDate(date);
    
    // Réinitialiser la date de fin si elle est avant la nouvelle date de début
    if (endDate && date && endDate.isBefore(date)) {
      setEndDate(null);
      form.setFieldsValue({ end: null });
    }
  };

  // Gérer le changement de type de tâche
  const handleTypeChange = value => {
    // Logique spécifique par type de tâche si nécessaire
  };

  // Gérer l'annulation
  const handleCancel = () => {
    navigate('/tasks');
  };

  // Gérer la soumission du formulaire
// Dans la fonction handleSubmit du composant TaskCreateModal.jsx
const handleSubmit = async () => {
  try {
    const values = await form.validateFields();
    setOperationLoading(true);
    setOperationError(null);

    // Formater les données pour l'API
    const taskData = {
      ...values,
      start: values.start ? values.start.format('YYYY-MM-DD HH:mm:ss') : null,
      end: values.end ? values.end.format('YYYY-MM-DD HH:mm:ss') : null,
      user_id: currentUser?.id,
      assignee_id: values.assignedTo || null,
      assignedTo: undefined
    };

    try {
      if (isEditMode) {
        await dispatch(updateTask({ id, data: taskData })).unwrap();
        message.success('Tâche mise à jour avec succès');
      } else {
        await dispatch(createTask(taskData)).unwrap();
        message.success('Tâche créée avec succès');
      }
      
      // Marquer qu'une tâche vient d'être créée pour forcer le rafraîchissement
      sessionStorage.setItem('task_just_created', 'true');
      
      navigate('/tasks');
    } catch (error) {
      setOperationError(error.message || 'Une erreur est survenue');
    } finally {
      setOperationLoading(false);
    }
  } catch (error) {
    console.error('Validation failed:', error);
  }
};

  // Afficher un indicateur de chargement pendant le chargement de l'utilisateur
  if (loadingUser) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Spin size="large" tip="Chargement des informations utilisateur..." />
      </div>
    );
  }

  return (
    <div className="task-create-container" style={{ padding: '20px' }}>
      <h2>{isEditMode ? 'Modifier une tâche' : 'Ajouter une nouvelle tâche'}</h2>

      {operationError && (
        <Alert
          message="Erreur"
          description={operationError}
          type="error"
          showIcon
          style={{ marginBottom: '20px' }}
        />
      )}

      {!currentUser && (
        <Alert
          message="Attention"
          description="Vous n'êtes pas connecté ou vos informations utilisateur n'ont pas pu être chargées. Certaines fonctionnalités peuvent être limitées."
          type="warning"
          showIcon
          style={{ marginBottom: '20px' }}
        />
      )}

      <Card loading={isEditMode && taskLoading}>
        <Form form={form} layout="vertical">
          <Form.Item
            name="type"
            label="Type de tâche"
            rules={[{ required: true, message: 'Veuillez sélectionner un type de tâche' }]}
            initialValue="call"
          >
            <Select onChange={handleTypeChange}>
              <Option value="call">Appel</Option>
              <Option value="meeting">Réunion</Option>
              <Option value="email_journal">Journal des e-mails</Option>
              <Option value="note">Note</Option>
              <Option value="todo">À faire</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="Titre"
            rules={[{ required: true, message: 'Veuillez entrer un titre' }]}
          >
            <Input placeholder="Entrez le titre de la tâche" />
          </Form.Item>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="start"
              label="Date de début"
              style={{ flex: 1 }}
              rules={[{ required: true, message: 'Veuillez sélectionner une date de début' }]}
            >
              <DatePicker
                disabledDate={disabledDate}
                onChange={handleStartDateChange}
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item
              name="end"
              label="Date de fin"
              style={{ flex: 1 }}
              rules={[
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    if (startDate && value.isBefore(startDate)) {
                      return Promise.reject(new Error('La date de fin doit être après la date de début'));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <DatePicker
                disabled={!startDate}
                disabledDate={(current) => {
                  // Désactiver les dates avant la date de début
                  return startDate && current && current.isBefore(startDate, 'day');
                }}
                showTime={{
                  format: 'HH:mm',
                  hideDisabledOptions: true,
                  disabledHours: () => {
                    // Désactiver les heures seulement si c'est le même jour
                    const currentDate = form.getFieldValue('end');
                    
                    if (startDate && currentDate && 
                        moment(currentDate).format('YYYY-MM-DD') === startDate.format('YYYY-MM-DD')) {
                      return Array.from({ length: startDate.hour() }, (_, i) => i);
                    }
                    return [];
                  },
                  disabledMinutes: (h) => {
                    // Désactiver les minutes seulement si même jour et même heure
                    const currentDate = form.getFieldValue('end');
                    
                    if (startDate && currentDate && 
                        moment(currentDate).format('YYYY-MM-DD') === startDate.format('YYYY-MM-DD') && 
                        h === startDate.hour()) {
                      return Array.from({ length: startDate.minute() }, (_, i) => i);
                    }
                    return [];
                  }
                }}
                format="YYYY-MM-DD HH:mm"
                placeholder="Sélectionnez après avoir choisi la date de début"
                style={{ width: '100%' }}
                onChange={(date) => {
                  // Validation explicite à chaque changement
                  if (!date) {
                    setEndDate(null);
                    form.setFieldsValue({ end: null });
                    return;
                  }

                  if (startDate && date.isBefore(startDate)) {
                    // Automatiquement corriger la date si elle est invalide
                    const correctedDate = moment(startDate).add(30, 'minutes');
                    message.warning('La date de fin a été ajustée pour être après la date de début');
                    setEndDate(correctedDate);
                    form.setFieldsValue({ end: correctedDate });
                    return;
                  }

                  // Si la date est valide, l'enregistrer
                  setEndDate(date);
                  form.setFieldsValue({ end: date });
                }}
              />
            </Form.Item>
          </div>
          
          {/* Affichage conditionnel du sélecteur d'affectation */}
          {currentUser && shouldShowAssignmentField && (
            <Form.Item
              name="assignedTo"
              label="Affecter à"
              style={{ marginBottom: '20px' }}
              help="Sélectionnez l'utilisateur à qui cette tâche sera assignée"
            >
              <Select
                placeholder="Sélectionner un utilisateur"
                loading={loadingUsers}
                allowClear
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) => 
                  option.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {users.length > 0 ? (
                  users.map(user => (
                    <Select.Option key={user.id} value={user.id}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {user.avatar ? (
                          <Avatar src={user.avatar} size="small" style={{ marginRight: 8 }} />
                        ) : (
                          <Avatar icon={<UserOutlined />} size="small" style={{ marginRight: 8 }} />
                        )}
                        {user.name || `${user.first_name} ${user.last_name}`} ({user.email})
                      </div>
                    </Select.Option>
                  ))
                ) : (
                  <Select.Option disabled value="no-users">Aucun utilisateur disponible</Select.Option>
                )}
              </Select>
            </Form.Item>
          )}

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="priority"
              label="Priorité"
              style={{ flex: 1 }}
              initialValue="normal"
            >
              <Select>
                <Option value="low">Basse</Option>
                <Option value="normal">Normale</Option>
                <Option value="high">Haute</Option>
                <Option value="urgent">Urgente</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label="Statut"
              style={{ flex: 1 }}
              initialValue="not_started"
            >
              <Select>
                <Option value="not_started">Non commencé</Option>
                <Option value="in_progress">En cours</Option>
                <Option value="completed">Terminé</Option>
                <Option value="deferred">Reporté</Option>
                <Option value="waiting">En attente</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="all_day"
            label="Toute la journée"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSubmit}
                loading={operationLoading}
              >
                {isEditMode ? 'Mettre à jour' : 'Enregistrer'}
              </Button>
              <Button onClick={handleCancel}>
                Annuler
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default TaskCreateModal;