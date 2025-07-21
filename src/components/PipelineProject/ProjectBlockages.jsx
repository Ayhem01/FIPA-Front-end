import React, { useEffect, useState } from 'react';
import {
  List, Card, Tag, Button, Space, Modal, Form, Input, Select, Spin, 
  Alert, Typography, Popconfirm, Divider, DatePicker, Empty
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined,
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBlockages, addBlockage, updateBlockage, resolveBlockage,
  deleteBlockage, resetBlockageOperation
} from '../../features/projectSlice';
import moment from 'moment';

const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ProjectBlockages = ({ projectId }) => {
  const dispatch = useDispatch();
  const { 
    items: blockages, loading, error, pagination 
  } = useSelector(state => state.projects.blockages);
  const { loading: operationLoading, success, error: operationError, type: operationType } = 
    useSelector(state => state.projects.blockageOperation);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBlockage, setEditingBlockage] = useState(null);
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (projectId) {
      loadBlockages();
    }
    return () => {
      dispatch(resetBlockageOperation());
    };
  }, [projectId, dispatch]);

  useEffect(() => {
    if (success) {
      setModalVisible(false);
      form.resetFields();
      setEditingBlockage(null);
      loadBlockages();
      dispatch(resetBlockageOperation());
    }
  }, [success, dispatch, form]);

  const loadBlockages = (page = 1) => {
    setCurrentPage(page);
    dispatch(fetchBlockages({ 
      projectId, 
      page,
      per_page: pagination.pageSize || 10,
      sort_by: 'created_at',
      sort_direction: 'desc',
      with: 'project,assignedUser'
    }));
  };

  const handleAddBlockage = () => {
    setEditingBlockage(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditBlockage = (blockage) => {
    setEditingBlockage(blockage);
    form.setFieldsValue({
      title: blockage.title,
      description: blockage.description,
      priority: blockage.priority,
      assigned_to: blockage.assigned_to,
      blocks_progress: blockage.blocks_progress,
      expected_resolution_date: blockage.expected_resolution_date 
        ? moment(blockage.expected_resolution_date) 
        : undefined
    });
    setModalVisible(true);
  };

  const handleSubmitBlockage = (values) => {
    const blockageData = {
      ...values,
      expected_resolution_date: values.expected_resolution_date?.format('YYYY-MM-DD')
    };

    if (editingBlockage) {
      dispatch(updateBlockage({ id: editingBlockage.id, data: blockageData }));
    } else {
      dispatch(addBlockage({ projectId, blockageData }));
    }
  };

  const handleResolveBlockage = (blockageId) => {
    dispatch(resolveBlockage(blockageId));
  };

  const handleDeleteBlockage = (blockageId) => {
    dispatch(deleteBlockage(blockageId));
  };

  const getPriorityTag = (priority) => {
    switch (priority) {
      case 'high':
        return <Tag color="red">Haute</Tag>;
      case 'medium':
        return <Tag color="orange">Moyenne</Tag>;
      case 'low':
        return <Tag color="green">Basse</Tag>;
      default:
        return <Tag>Inconnue</Tag>;
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'active':
        return <Tag color="volcano" icon={<CloseCircleOutlined />}>Actif</Tag>;
      case 'in_progress':
        return <Tag color="blue" icon={<ClockCircleOutlined />}>En cours</Tag>;
      case 'resolved':
        return <Tag color="green" icon={<CheckCircleOutlined />}>Résolu</Tag>;
      default:
        return <Tag>Inconnu</Tag>;
    }
  };

  if (error) {
    return <Alert message={error} type="error" showIcon />;
  }

  return (
    <div className="project-blockages">
      <Card 
        title="Blocages du projet" 
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddBlockage}
          >
            Ajouter un blocage
          </Button>
        }
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
          </div>
        ) : blockages.length === 0 ? (
          <Empty description="Aucun blocage enregistré pour ce projet" />
        ) : (
          <List
            itemLayout="vertical"
            dataSource={blockages}
            pagination={{
              onChange: (page) => loadBlockages(page),
              pageSize: pagination.pageSize || 10,
              total: pagination.total,
              current: currentPage,
            }}
            renderItem={blockage => (
              <List.Item
                key={blockage.id}
                actions={[
                  <Space>
                    {blockage.status !== 'resolved' && (
                      <Button
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleResolveBlockage(blockage.id)}
                        loading={operationLoading && operationType === 'resolve' && operationType.targetId === blockage.id}
                      >
                        Résoudre
                      </Button>
                    )}
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => handleEditBlockage(blockage)}
                      disabled={blockage.status === 'resolved'}
                    >
                      Modifier
                    </Button>
                    <Popconfirm
                      title="Êtes-vous sûr de vouloir supprimer ce blocage?"
                      onConfirm={() => handleDeleteBlockage(blockage.id)}
                      okText="Oui"
                      cancelText="Non"
                    >
                      <Button 
                        icon={<DeleteOutlined />} 
                        danger
                        loading={operationLoading && operationType === 'delete' && operationType.targetId === blockage.id}
                      >
                        Supprimer
                      </Button>
                    </Popconfirm>
                  </Space>
                ]}
              >
                <List.Item.Meta
                  title={<>
                    <Text strong>{blockage.title}</Text>
                    <Space style={{ marginLeft: 10 }}>
                      {getStatusTag(blockage.status)}
                      {getPriorityTag(blockage.priority)}
                      {blockage.blocks_progress && <Tag color="red">Bloque la progression</Tag>}
                    </Space>
                  </>}
                  description={<>
                    <Text>{blockage.description}</Text>
                    <Divider style={{ margin: '10px 0' }} />
                    <Space>
                      <Text type="secondary">Créé le: {moment(blockage.created_at).format('DD/MM/YYYY')}</Text>
                      {blockage.expected_resolution_date && (
                        <Text type="secondary">Résolution prévue: {moment(blockage.expected_resolution_date).format('DD/MM/YYYY')}</Text>
                      )}
                      {blockage.assigned_to && blockage.assignedUser && (
                        <Text type="secondary">Assigné à: {blockage.assignedUser.name}</Text>
                      )}
                    </Space>
                  </>}
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      <Modal
        title={editingBlockage ? "Modifier un blocage" : "Ajouter un blocage"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitBlockage}
        >
          <Form.Item
            name="title"
            label="Titre"
            rules={[{ required: true, message: 'Veuillez entrer le titre du blocage' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Veuillez entrer une description' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priorité"
            rules={[{ required: true, message: 'Veuillez sélectionner la priorité' }]}
          >
            <Select>
              <Option value="low">Basse</Option>
              <Option value="medium">Moyenne</Option>
              <Option value="high">Haute</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="blocks_progress"
            label="Bloque la progression du projet"
            valuePropName="checked"
          >
            <Select>
              <Option value={true}>Oui</Option>
              <Option value={false}>Non</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="assigned_to"
            label="Assigné à"
          >
            <Select placeholder="Sélectionner un utilisateur">
              {/* Cette liste devrait être chargée dynamiquement */}
              <Option value={1}>Utilisateur 1</Option>
              <Option value={2}>Utilisateur 2</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="expected_resolution_date"
            label="Date de résolution prévue"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          {operationError && (
            <Alert
              message="Erreur"
              description={operationError}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={operationLoading}
              >
                {editingBlockage ? "Mettre à jour" : "Ajouter"}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Annuler
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectBlockages;