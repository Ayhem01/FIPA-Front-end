// src/components/Projects/ProjectList.jsx
import React, { useEffect, useState } from 'react';
import { Table, Space, Button, Input, Select, Card, Row, Col, Tag, Tooltip, message, Modal } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProjects, setFilters, clearFilters, deleteProject, resetOperation } from '../../features/projectSlice';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import ProjectFilters from './ProjectFilters';

const { Search } = Input;
const { Option } = Select;

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

const ProjectList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error, pagination, filters, operation } = useSelector(state => state.projects);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Charger les projets depuis l'API
  useEffect(() => {
    loadProjects();
    // Nettoyer l'état des opérations
    return () => {
      dispatch(resetOperation());
    };
  }, [dispatch]);

  // Surveiller les résultats des opérations
  useEffect(() => {
    if (operation.type === 'delete' && operation.success) {
      message.success('Projet supprimé avec succès');
      dispatch(resetOperation());
    }
  }, [operation, dispatch]);

  const loadProjects = (page = 1, pageSize = pagination.pageSize) => {
    const params = {
      ...filters,
      page,
      per_page: pageSize
    };
    dispatch(fetchProjects(params));
  };

  const handleTableChange = (pagination, filters, sorter) => {
    const params = {
      page: pagination.current,
      per_page: pagination.pageSize,
      sort_by: sorter.field,
      sort_direction: sorter.order === 'ascend' ? 'asc' : 'desc'
    };
    
    dispatch(setFilters(params));
    loadProjects(pagination.current, pagination.pageSize);
  };

  const handleSearch = (value) => {
    dispatch(setFilters({ search: value }));
    loadProjects(1);
  };

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
    loadProjects(1);
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    loadProjects(1);
  };

  const handleViewProject = (record) => {
    navigate(`/projects/${record.id}`);
  };

  const handleEditProject = (record) => {
    navigate(`/projects/edit/${record.id}`);
  };

  const showDeleteConfirm = (record) => {
    setProjectToDelete(record);
    setDeleteModalVisible(true);
  };

  const handleDeleteProject = () => {
    if (projectToDelete) {
      dispatch(deleteProject(projectToDelete.id));
      setDeleteModalVisible(false);
    }
  };

  const columns = [
    {
      title: 'Titre',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
      render: (text, record) => (
        <a onClick={() => handleViewProject(record)}>{text}</a>
      ),
    },
    {
      title: 'Entreprise',
      dataIndex: 'company_name',
      key: 'company_name',
      sorter: true,
    },
    {
      title: 'Secteur',
      dataIndex: ['sector', 'name'],
      key: 'sector',
      render: (text, record) => record.sector?.name || 'N/A',
    },
    {
      title: 'Gouvernorat',
      dataIndex: ['governorate', 'name'],
      key: 'governorate',
      render: (text, record) => record.governorate?.name || 'N/A',
    },
    {
      title: 'Étape',
      dataIndex: ['pipelineStage', 'name'],
      key: 'pipeline_stage',
      render: (text, record) => record.pipelineStage?.name || 'N/A',
    },
    {
      title: 'Statut',
      key: 'status',
      render: (_, record) => getProjectStatusTag(record),
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Voir les détails">
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => handleViewProject(record)} 
            />
          </Tooltip>
          <Tooltip title="Modifier">
            <Button 
              icon={<EditOutlined />} 
              onClick={() => handleEditProject(record)} 
            />
          </Tooltip>
          <Tooltip title="Supprimer">
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => showDeleteConfirm(record)}
              loading={operation.loading && operation.type === 'delete' && operation.targetId === record.id}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="project-list-container">
      <Card title="Liste des projets" extra={
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => navigate('/projects/new')}
        >
          Nouveau projet
        </Button>
      }>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Search
              placeholder="Rechercher par titre ou entreprise"
              onSearch={handleSearch}
              enterButton
              allowClear
              style={{ marginBottom: 16 }}
            />
          </Col>
          <Col xs={24}>
            <ProjectFilters 
              onFilterChange={handleFilterChange} 
              onClearFilters={handleClearFilters} 
              currentFilters={filters}
            />
          </Col>
          <Col xs={24}>
            <Table
              columns={columns}
              dataSource={items}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
              }}
              onChange={handleTableChange}
              scroll={{ x: 'max-content' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Modal de confirmation pour la suppression */}
      <Modal
        title={<><ExclamationCircleOutlined style={{ color: '#ff4d4f' }} /> Confirmer la suppression</>}
        open={deleteModalVisible}
        onOk={handleDeleteProject}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Oui, supprimer"
        cancelText="Annuler"
        okButtonProps={{ danger: true, loading: operation.loading && operation.type === 'delete' }}
      >
        <p>Êtes-vous sûr de vouloir supprimer ce projet?</p>
        {projectToDelete && (
          <p>
            <strong>Titre:</strong> {projectToDelete.title}<br />
            <strong>Entreprise:</strong> {projectToDelete.company_name}
          </p>
        )}
        <p>Cette action est irréversible.</p>
      </Modal>
    </div>
  );
};

export default ProjectList;