import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card, Typography, Tag, Space, Button, Tooltip, Modal, Dropdown, Menu,
  Badge, Avatar, List, Empty, Select, message
} from 'antd';
import {
  ExclamationCircleOutlined, CheckCircleOutlined, EditOutlined,
  DeleteOutlined, PlusOutlined, EllipsisOutlined, ArrowUpOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import BlockageForm from './BlockageForm';
import { resolveBlockage, deleteBlockage, escalateBlockage } from '../../features/blockageSlice';
import { fetchAllUsers } from '../../features/userSlice'; 
// import { fetchInviteProgressionById } from '../../features/blockageSlice'; // Ajoutez cet import


const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

const BlockageCard = ({ blockages = [], entityType, entityId, pipelineStageType, pipelineStageId, title = "Blocages" }) => {
  const dispatch = useDispatch();
  const [formVisible, setFormVisible] = useState(false);
  const [selectedBlockage, setSelectedBlockage] = useState(null);
  const { user: currentUser } = useSelector(state => state.user);
  // const { users = [] } = useSelector(state => state.user || {});
  const { list: usersList = [] } = useSelector(state => state.user);
  

  useEffect(() => {
    // Charger la liste des utilisateurs si elle n'existe pas déjà
    if (!usersList || usersList.length === 0) {
      dispatch(fetchAllUsers());
    }
  }, [dispatch, usersList]);

  const admins = usersList.filter(user => {
    console.log("User data:", user); // Pour déboguer
    return user.role === 'admin' || user.is_admin === true;
  });
  
  const handleResolve = (blockage) => {
    if (!blockage || !blockage.id) {
      message.error("Impossible de résoudre: Identifiant du blocage manquant");
      return;
    }
    
    confirm({
      title: 'Résoudre ce blocage',
      icon: <CheckCircleOutlined style={{ color: 'green' }} />,
      content: 'Confirmer que ce blocage a été résolu?',
      onOk() {
        dispatch(resolveBlockage({ id: blockage.id })); // Utiliser id au lieu de blockage
      }
    });
  };
  
  const handleDelete = (blockage) => {
    confirm({
      title: 'Supprimer ce blocage',
      icon: <ExclamationCircleOutlined style={{ color: 'red' }} />,
      content: 'Cette action est irréversible. Continuer?',
      okText: 'Supprimer',
      okType: 'danger',
      onOk() {
        dispatch(deleteBlockage(blockage.id));
      }
    });
  };
  
  const handleEdit = (blockage) => {
    setSelectedBlockage(blockage);
    setFormVisible(true);
  };
  
  const handleCreateBlockage = () => {
    setSelectedBlockage(null);
    setFormVisible(true);
  };

  const handleEscalate = (blockage) => {
    // ID admin fixe (admin principal)
    const adminId = 1;
    
    Modal.confirm({
      title: 'Escalader ce blocage',
      icon: <ArrowUpOutlined style={{ color: 'orange' }} />,
      content: 'Ce blocage sera escaladé à l\'administrateur principal pour une résolution prioritaire. Confirmer?',
      okText: 'Escalader',
      cancelText: 'Annuler',
      okButtonProps: {
        type: 'primary',
        danger: true
      },
      onOk: () => {
        return dispatch(escalateBlockage({ id: blockage.id, adminId }))
          .unwrap()
          .then(() => {
            message.success('Blocage escaladé avec succès');
          })
          .catch(error => {
            message.error(`Échec de l'escalade: ${error}`);
            return Promise.reject();
          });
      }
    });
  };

  const renderPriority = (priority) => {
    const priorities = {
      low: { color: 'blue', text: 'Basse' },
      medium: { color: 'orange', text: 'Moyenne' },
      high: { color: 'volcano', text: 'Haute' },
      critical: { color: 'red', text: 'Critique' }
    };
    
    return <Tag color={priorities[priority]?.color || 'default'}>
      {priorities[priority]?.text || priority}
    </Tag>;
  };
  
  const renderBlockageType = (type) => {
    const types = {
      process: { color: 'blue', text: 'Processus' },
      data: { color: 'cyan', text: 'Données' },
      technical: { color: 'orange', text: 'Technique' },
      other: { color: 'default', text: 'Autre' }
    };
    
    return <Tag color={types[type]?.color || 'default'}>
      {types[type]?.text || type}
    </Tag>;
  };

  const blockageMenu = (blockage) => (
    <Menu>
      {blockage.status === 'actif' && (
        <Menu.Item 
          key="resolve" 
          icon={<CheckCircleOutlined style={{ color: 'green' }} />}
          onClick={() => handleResolve(blockage)}
        >
          Marquer comme résolu
        </Menu.Item>
      )}
      
      <Menu.Item 
        key="edit" 
        icon={<EditOutlined />}
        onClick={() => handleEdit(blockage)}
      >
        Modifier
      </Menu.Item>
      
      {blockage.status === 'actif' && !blockage.is_escalated && (
        <Menu.Item 
          key="escalate" 
          icon={<ArrowUpOutlined style={{ color: 'orange' }} />}
          onClick={() => handleEscalate(blockage)}
        >
          Escalader
        </Menu.Item>
      )}
      
      <Menu.Divider />
      
      <Menu.Item 
        key="delete" 
        icon={<DeleteOutlined style={{ color: 'red' }} />}
        onClick={() => handleDelete(blockage)}
        danger
      >
        Supprimer
      </Menu.Item>
    </Menu>
  );
  
  return (
    <div className="blockages-container">
      <Card
        title={
          <Space>
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
            <span>{title}</span>
            {Array.isArray(blockages) && blockages.filter(b => b.status === 'actif').length > 0 && (
              <Badge count={blockages.filter(b => b.status === 'actif').length} style={{ backgroundColor: '#ff4d4f' }} />
            )}
          </Space>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreateBlockage}
            size="small"
          >
            Nouveau blocage
          </Button>
        }
      >
        {!Array.isArray(blockages) || blockages.length === 0 ? (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description="Aucun blocage signalé" 
          />
        ) : (
          <List
          dataSource={blockages}
          renderItem={blockage => (
        
              <List.Item
                actions={[
                  <Dropdown overlay={blockageMenu(blockage)} trigger={['click']}>
                    <Button 
                      type="text" 
                      icon={<EllipsisOutlined />} 
                      size="small"
                    />
                  </Dropdown>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    blockage.is_escalated ? (
                      <Badge dot color="red">
                        <Avatar style={{ backgroundColor: '#ff4d4f' }} icon={<ExclamationCircleOutlined />} />
                      </Badge>
                    ) : (
                      <Avatar style={{ backgroundColor: '#1890ff' }} icon={<InfoCircleOutlined />} />
                    )
                  }
                  title={
                    <Space>
                      <Text strong>{blockage.name}</Text>
                      {renderPriority(blockage.priority)}
                      {blockage.status !== 'actif' && (
                        <Tag color={blockage.status === 'resolu' ? 'green' : 'default'}>
                          {blockage.status === 'resolu' ? 'Résolu' : 'Annulé'}
                        </Tag>
                      )}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={0} style={{ width: '100%' }}>
                      <Text>{blockage.description}</Text>
                      <Space size="small" style={{ marginTop: 4 }}>
                        {renderBlockageType(blockage.blockage_type)}
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {moment(blockage.created_at).format('DD/MM/YYYY HH:mm')}
                        </Text>
                        {blockage.assignedUser && (
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Assigné à: {blockage.assignedUser.name}
                          </Text>
                        )}
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      <Modal
  title="Créer un nouveau blocage"
  visible={formVisible}
  footer={null}
  onCancel={() => setFormVisible(false)}
  destroyOnClose={true}
  width={700}
>
  <BlockageForm
    blockage={selectedBlockage}
    onCancel={() => setFormVisible(false)}
    entityType={entityType}
    entityId={entityId}
    pipelineStageType={pipelineStageType}
    pipelineStageId={pipelineStageId} 
  />
</Modal>
    </div>
  );
};

export default BlockageCard;