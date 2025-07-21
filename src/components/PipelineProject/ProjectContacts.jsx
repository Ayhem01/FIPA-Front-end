import React, { useEffect, useState } from 'react';
import { 
  Card, List, Button, Modal, Form, Input, Switch, Space, Popconfirm,
  Typography, Tag, Tooltip, Spin, Empty, Alert, Divider
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, StarOutlined, StarFilled, 
  MailOutlined, PhoneOutlined, UserOutlined, TeamOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchProjectContacts, addProjectContact, updateProjectContact,
  setContactAsPrimary, deleteProjectContact, resetContactOperation
} from '../../features/projectSlice';

const { Text, Title } = Typography;
const { TextArea } = Input;

const ProjectContacts = ({ projectId }) => {
  const dispatch = useDispatch();
  const { items: contacts, loading, error } = useSelector(state => state.projects.contacts);
  const { loading: operationLoading, success, error: operationError } = useSelector(state => state.projects.contactOperation);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [form] = Form.useForm();
  
  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectContacts(projectId));
    }
    
    return () => {
      dispatch(resetContactOperation());
    };
  }, [dispatch, projectId]);
  
  useEffect(() => {
    if (success) {
      setModalVisible(false);
      form.resetFields();
      setEditingContact(null);
      dispatch(resetContactOperation());
    }
  }, [success, dispatch, form]);
  
  const handleAddContact = () => {
    setEditingContact(null);
    form.resetFields();
    form.setFieldsValue({ project_id: projectId, is_primary: false, is_external: false });
    setModalVisible(true);
  };
  
  const handleEditContact = (contact) => {
    setEditingContact(contact);
    form.setFieldsValue({
      ...contact,
      project_id: projectId
    });
    setModalVisible(true);
  };
  
  const handleSubmitContact = (values) => {
    if (editingContact) {
      dispatch(updateProjectContact({ id: editingContact.id, data: values }));
    } else {
      dispatch(addProjectContact(values));
    }
  };
  
  const handleSetPrimary = (contactId) => {
    dispatch(setContactAsPrimary(contactId));
  };
  
  const handleDeleteContact = (contactId) => {
    dispatch(deleteProjectContact({ id: contactId, projectId }));
  };
  
  const renderContactItem = (contact) => (
    <List.Item
      key={contact.id}
      actions={[
        <Space>
          {!contact.is_primary && (
            <Tooltip title="Définir comme contact principal">
              <Button 
                icon={<StarOutlined />} 
                onClick={() => handleSetPrimary(contact.id)}
              />
            </Tooltip>
          )}
          <Tooltip title="Modifier">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEditContact(contact)}
            />
          </Tooltip>
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce contact?"
            onConfirm={() => handleDeleteContact(contact.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button
              icon={<DeleteOutlined />}
              danger
            />
          </Popconfirm>
        </Space>
      ]}
    >
      <List.Item.Meta
        avatar={
          contact.is_primary ? 
            <StarFilled style={{ fontSize: '20px', color: '#faad14' }} /> : 
            <UserOutlined style={{ fontSize: '20px' }} />
        }
        title={
          <Space>
            <Text strong>{contact.name}</Text>
            {contact.is_primary && <Tag color="gold">Principal</Tag>}
            {contact.is_external && <Tag icon={<TeamOutlined />} color="blue">Externe</Tag>}
            {contact.title && <Tag color="default">{contact.title}</Tag>}
          </Space>
        }
        description={
          <Space direction="vertical" size={1}>
            {contact.email && (
              <Space>
                <MailOutlined />
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </Space>
            )}
            {contact.phone && (
              <Space>
                <PhoneOutlined />
                <a href={`tel:${contact.phone}`}>{contact.phone}</a>
              </Space>
            )}
            {contact.notes && (
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">{contact.notes}</Text>
              </div>
            )}
          </Space>
        }
      />
    </List.Item>
  );
  
  if (error) {
    return <Alert message={error} type="error" showIcon />;
  }
  
  return (
    <div className="project-contacts">
      <Card
        title="Contacts du projet"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddContact}
          >
            Ajouter un contact
          </Button>
        }
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
          </div>
        ) : contacts.length === 0 ? (
          <Empty
            description="Aucun contact enregistré pour ce projet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={contacts}
            renderItem={renderContactItem}
          />
        )}
      </Card>
      
      <Modal
        title={editingContact ? "Modifier un contact" : "Ajouter un contact"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitContact}
        >
          <Form.Item name="project_id" hidden>
            <Input />
          </Form.Item>
          
          <Form.Item
            name="name"
            label="Nom"
            rules={[{ required: true, message: 'Veuillez entrer le nom du contact' }]}
          >
            <Input placeholder="Nom complet" />
          </Form.Item>
          
          <Form.Item
            name="title"
            label="Titre/Fonction"
          >
            <Input placeholder="Ex: Directeur Commercial" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { type: 'email', message: 'Adresse email invalide' }
            ]}
          >
            <Input type="email" placeholder="email@example.com" />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="Téléphone"
          >
            <Input placeholder="+216 XX XXX XXX" />
          </Form.Item>
          
          <Divider />
          
          <Form.Item
            name="is_primary"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Contact principal" 
              unCheckedChildren="Contact secondaire" 
            />
          </Form.Item>
          
          <Form.Item
            name="is_external"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Contact externe" 
              unCheckedChildren="Contact interne" 
            />
          </Form.Item>
          
          <Form.Item
            name="notes"
            label="Notes"
          >
            <TextArea rows={3} placeholder="Notes complémentaires sur ce contact..." />
          </Form.Item>
          
          {operationError && (
            <Alert
              message="Erreur"
              description={typeof operationError === 'object' ? Object.values(operationError).join(', ') : operationError}
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
                {editingContact ? "Mettre à jour" : "Ajouter"}
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

export default ProjectContacts;