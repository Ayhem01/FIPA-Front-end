import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Typography, Avatar, Tag, Button, Space, Divider, 
  Skeleton, Alert, Descriptions, Badge, Tooltip, Modal, Form, 
  Input, Select, message, Drawer, Timeline, List, Empty, Grid,
  Statistic, Progress, Tabs
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, DeleteOutlined, MailOutlined,
  PhoneOutlined, GlobalOutlined, EnvironmentOutlined, ApartmentOutlined,
  BankOutlined, UserOutlined, CalendarOutlined, DollarOutlined,
  FileTextOutlined, HistoryOutlined, TeamOutlined, BarChartOutlined,
  ExclamationCircleOutlined, SettingOutlined, EyeOutlined,
  ShareAltOutlined, DownloadOutlined, PrinterOutlined, SendOutlined,
  ContactsOutlined, ProjectOutlined, FileAddOutlined, FolderOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import {
  fetchCompanyDetails,
  deleteCompany,
  resetOperation,
  clearError
} from '../../features/companiesSlice';

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;
const { TextArea } = Input;
const { Option } = Select;
const { useBreakpoint } = Grid;
const { TabPane } = Tabs;

// Composant d'avatar d'entreprise avec gestion d'erreur
const CompanyAvatar = ({ logo, name, size = 80 }) => {
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = () => {
    setImageError(true);
  };

  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith('http')) return logoPath;
    const baseUrl = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000';
    return `${baseUrl}/storage/${logoPath}`;
  };

  const logoUrl = getLogoUrl(logo);
  
  return (
    <Avatar 
      size={size}
      src={logoUrl && !imageError ? logoUrl : null}
      icon={(!logoUrl || imageError) ? <ApartmentOutlined /> : null}
      alt={name}
      onError={handleImageError}
      style={{ 
        backgroundColor: (!logoUrl || imageError) ? '#1890ff' : 'transparent',
        borderRadius: '12px',
        border: (logoUrl && !imageError) ? '2px solid #f0f0f0' : 'none',
        objectFit: 'cover',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}
    />
  );
};

// Composant de badge de statut
const StatusBadge = ({ status }) => {
  const statusConfig = {
    prospect: { color: 'orange', text: 'Prospect' },
    actif: { color: 'green', text: 'Actif' },
    inactif: { color: 'red', text: 'Inactif' },
    client: { color: 'blue', text: 'Client' },
    partenaire: { color: 'purple', text: 'Partenaire' }
  };

  const config = statusConfig[status] || { color: 'default', text: status };
  
  return (
    <Badge 
      status={config.color === 'green' ? 'success' : config.color === 'red' ? 'error' : 'processing'} 
      text={
        <Tag color={config.color} style={{ fontSize: '12px', padding: '4px 8px' }}>
          {config.text}
        </Tag>
      } 
    />
  );
};

// Composant de type d'entreprise
const TypeBadge = ({ type }) => {
  const typeConfig = {
    entreprise: { color: 'blue', icon: <ApartmentOutlined /> },
    organisme_public: { color: 'green', icon: <BankOutlined /> },
    association: { color: 'orange', icon: <TeamOutlined /> },
    autre: { color: 'default', icon: <FileTextOutlined /> }
  };

  const config = typeConfig[type] || typeConfig.autre;
  
  return (
    <Tag color={config.color} icon={config.icon} style={{ padding: '4px 12px' }}>
      {type?.replace('_', ' ').toUpperCase()}
    </Tag>
  );
};

// Section d'informations avec animations
const InfoSection = ({ title, icon, children, extra = null }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {icon}
            <span>{title}</span>
          </div>
        }
        extra={extra}
        style={{ 
          marginBottom: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}
        bodyStyle={{ padding: '20px' }}
      >
        {children}
      </Card>
    </motion.div>
  );
};

const CompaniesDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const screens = useBreakpoint();
  
  // États Redux
  const { selectedCompany, detailsLoading, operation } = useSelector(state => state.companies);
  
  // États locaux
  const [activeTab, setActiveTab] = useState('overview');
  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false);
  const [editNotesForm] = Form.useForm();

    const { user: reduxUser } = useSelector(state => state.user);
  const storedUser = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  }, []);
  const currentUser = reduxUser || storedUser;
  const isAdmin = React.useMemo(() => {
    const u = currentUser;
    if (!u) return false;
    const flag = [true, 1, '1', 'true'].includes(u?.is_admin);
    const roleStr = String(u?.role || '').toLowerCase();
    const list1 = Array.isArray(u?.roles_list) ? u.roles_list : [];
    const list2 = Array.isArray(u?.role_names) ? u.role_names : [];
    const list3 = Array.isArray(u?.roles) ? u.roles.map(r => r?.name || r) : [];
    const all = [roleStr, ...list1, ...list2, ...list3].map(x => String(x).toLowerCase());
    return flag || all.includes('admin');
  }, [currentUser]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Chargement des détails de l'entreprise
  useEffect(() => {
    if (id) {
      dispatch(fetchCompanyDetails(id));
    }
  }, [dispatch, id]);

  // Gestion des opérations
  useEffect(() => {
    if (operation.success && operation.type === 'delete') {
      message.success('Entreprise supprimée avec succès');
      navigate('/companies');
      dispatch(resetOperation());
    } else if (operation.error) {
      message.error(`Erreur: ${operation.error}`);
      dispatch(resetOperation());
    }
  }, [operation, navigate, dispatch]);

  // Fonction de suppression
  const handleDelete = () => {
    confirm({
      title: 'Êtes-vous sûr de vouloir supprimer cette entreprise ?',
      icon: <ExclamationCircleOutlined />,
      content: 'Cette action est irréversible.',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk() {
        dispatch(deleteCompany(id));
      },
    });
  };

  // Fonction d'édition
  const handleEdit = () => {
    navigate(`/companies/edit/${id}`);
  };

  // Sauvegarde des notes
  const handleSaveNotes = async () => {
    try {
      const values = await editNotesForm.validateFields();
      // Ici vous pouvez implémenter la sauvegarde des notes
      message.success('Notes mises à jour avec succès');
      setNotesDrawerOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des notes:', error);
    }
  };

  // Formatage des montants
  const formatAmount = (amount) => {
    if (!amount) return 'Non renseigné';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Rendu du header
  const renderHeader = () => (
    <motion.div
      variants={itemVariants}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Décoration de fond */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '200px',
        height: '200px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%',
        transform: 'translate(50%, -50%)'
      }} />
      
      <Row justify="space-between" align="top" style={{ position: 'relative', zIndex: 1 }}>
        <Col xs={24} lg={16}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: screens.xs ? 'wrap' : 'nowrap' }}>
            <CompanyAvatar 
              logo={selectedCompany?.logo}
              name={selectedCompany?.nom}
              size={screens.xs ? 60 : 80}
            />
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <Title level={1} style={{ color: 'white', margin: '0 0 8px 0', fontSize: screens.xs ? '24px' : '32px' }}>
                {selectedCompany?.nom}
              </Title>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <StatusBadge status={selectedCompany?.statut} />
                <TypeBadge type={selectedCompany?.type} />
                {selectedCompany?.taille && (
                  <Tag color="cyan" style={{ padding: '4px 8px' }}>
                    {selectedCompany.taille}
                  </Tag>
                )}
              </div>
              
              {selectedCompany?.description && (
                <Paragraph style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '16px', fontSize: '16px' }}>
                  {selectedCompany.description}
                </Paragraph>
              )}
              
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {selectedCompany?.email && (
                  <a href={`mailto:${selectedCompany.email}`} style={{ color: 'rgba(255,255,255,0.9)' }}>
                    <MailOutlined /> {selectedCompany.email}
                  </a>
                )}
                {selectedCompany?.telephone && (
                  <a href={`tel:${selectedCompany.telephone}`} style={{ color: 'rgba(255,255,255,0.9)' }}>
                    <PhoneOutlined /> {selectedCompany.telephone}
                  </a>
                )}
                {selectedCompany?.site_web && (
                  <a href={selectedCompany.site_web} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    <GlobalOutlined /> Site web
                  </a>
                )}
              </div>
            </div>
          </div>
        </Col>
        
        <Col xs={24} lg={8} style={{ textAlign: screens.xs ? 'left' : 'right', marginTop: screens.xs ? '20px' : '0' }}>
          <Space wrap>
            <Button 
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/companies')}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white'
              }}
            >
              Retour
            </Button>
            
            {isAdmin && (
              <>
                <Button 
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white'
                  }}
                >
                  Modifier
                </Button>
                
                <Button 
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                  loading={operation.loading && operation.type === 'delete'}
                  danger
                  style={{
                    backgroundColor: 'rgba(255,82,82,0.2)',
                    border: '1px solid rgba(255,82,82,0.3)',
                    color: 'white'
                  }}
                >
                  Supprimer
                </Button>
              </>
            )}
          </Space>
        </Col>
      </Row>
    </motion.div>
  );

  // Rendu de l'onglet Vue d'ensemble
  const renderOverviewTab = () => (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={12}>
        <InfoSection 
          title="Informations générales" 
          icon={<ApartmentOutlined style={{ color: '#1890ff' }} />}
        >
          <Descriptions column={1} labelStyle={{ fontWeight: 600 }}>
            <Descriptions.Item label="Nom">
              {selectedCompany?.nom}
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              <TypeBadge type={selectedCompany?.type} />
            </Descriptions.Item>
            <Descriptions.Item label="Statut">
              <StatusBadge status={selectedCompany?.statut} />
            </Descriptions.Item>
            <Descriptions.Item label="Taille">
              {selectedCompany?.taille || 'Non renseignée'}
            </Descriptions.Item>
            <Descriptions.Item label="Secteur">
              {selectedCompany?.secteur?.nom || 'Non renseigné'}
            </Descriptions.Item>
            <Descriptions.Item label="Propriétaire">
              {selectedCompany?.proprietaire ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Avatar size="small" icon={<UserOutlined />} />
                  {selectedCompany.proprietaire.name}
                </div>
              ) : 'Non assigné'}
            </Descriptions.Item>
          </Descriptions>
        </InfoSection>
      </Col>
      
      <Col xs={24} lg={12}>
        <InfoSection 
          title="Coordonnées" 
          icon={<EnvironmentOutlined style={{ color: '#52c41a' }} />}
        >
          <Descriptions column={1} labelStyle={{ fontWeight: 600 }}>
            <Descriptions.Item label="Email">
              {selectedCompany?.email ? (
                <a href={`mailto:${selectedCompany.email}`}>
                  <MailOutlined /> {selectedCompany.email}
                </a>
              ) : 'Non renseigné'}
            </Descriptions.Item>
            <Descriptions.Item label="Téléphone">
              {selectedCompany?.telephone ? (
                <a href={`tel:${selectedCompany.telephone}`}>
                  <PhoneOutlined /> {selectedCompany.telephone}
                </a>
              ) : 'Non renseigné'}
            </Descriptions.Item>
            <Descriptions.Item label="Site web">
              {selectedCompany?.site_web ? (
                <a href={selectedCompany.site_web} target="_blank" rel="noopener noreferrer">
                  <GlobalOutlined /> {selectedCompany.site_web}
                </a>
              ) : 'Non renseigné'}
            </Descriptions.Item>
            <Descriptions.Item label="Adresse">
              {selectedCompany?.adresse ? (
                <div>
                  <div>{selectedCompany.adresse}</div>
                  {(selectedCompany.ville || selectedCompany.code_postal) && (
                    <div>
                      {selectedCompany.ville} {selectedCompany.code_postal}
                    </div>
                  )}
                  {selectedCompany.pays && (
                    <div>{selectedCompany.pays}</div>
                  )}
                </div>
              ) : 'Non renseignée'}
            </Descriptions.Item>
          </Descriptions>
        </InfoSection>
      </Col>
      
      <Col xs={24} lg={12}>
        <InfoSection 
          title="Informations financières" 
          icon={<DollarOutlined style={{ color: '#fa8c16' }} />}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Statistic 
                title="Capital social"
                value={selectedCompany?.capital}
                formatter={(value) => formatAmount(value)}
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
            <Col span={12}>
              <Statistic 
                title="Chiffre d'affaires"
                value={selectedCompany?.chiffre_affaires}
                formatter={(value) => formatAmount(value)}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={24}>
              <Descriptions column={1} labelStyle={{ fontWeight: 600 }}>
                <Descriptions.Item label="Date de création">
                  {selectedCompany?.date_creation ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CalendarOutlined />
                      {dayjs(selectedCompany.date_creation).format('DD/MM/YYYY')}
                    </div>
                  ) : 'Non renseignée'}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </InfoSection>
      </Col>
      
      <Col xs={24} lg={12}>
        <InfoSection 
          title="Notes internes" 
          icon={<FileTextOutlined style={{ color: '#722ed1' }} />}
          extra={
    isAdmin && ( // n'afficher que pour admin
      <Button 
        type="link" 
        icon={<EditOutlined />}
        onClick={() => {
          editNotesForm.setFieldsValue({ notes: selectedCompany?.notes });
          setNotesDrawerOpen(true);
        }}
      >
        Modifier
      </Button>
    )
  }
>
          {selectedCompany?.notes ? (
            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
              {selectedCompany.notes}
            </Paragraph>
          ) : (
            <Empty 
              description="Aucune note" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ margin: '20px 0' }}
            />
          )}
        </InfoSection>
      </Col>
    </Row>
  );

  // Rendu de l'onglet Activités (placeholder)
  const renderActivitiesTab = () => (
    <InfoSection 
      title="Historique des activités" 
      icon={<HistoryOutlined style={{ color: '#1890ff' }} />}
    >
      <Timeline>
        <Timeline.Item color="green">
          <div>
            <strong>Entreprise créée</strong>
            <div style={{ color: '#666' }}>
              {dayjs(selectedCompany?.created_at).format('DD/MM/YYYY à HH:mm')}
            </div>
          </div>
        </Timeline.Item>
        {selectedCompany?.updated_at !== selectedCompany?.created_at && (
          <Timeline.Item color="blue">
            <div>
              <strong>Dernière modification</strong>
              <div style={{ color: '#666' }}>
                {dayjs(selectedCompany?.updated_at).format('DD/MM/YYYY à HH:mm')}
              </div>
            </div>
          </Timeline.Item>
        )}
      </Timeline>
    </InfoSection>
  );

  // Rendu de l'onglet Documents (placeholder)
  const renderDocumentsTab = () => (
    <InfoSection 
      title="Documents" 
      icon={<FolderOutlined style={{ color: '#52c41a' }} />}
      extra={
        <Button type="primary" icon={<FileAddOutlined />}>
          Ajouter un document
        </Button>
      }
    >
      <Empty 
        description="Aucun document" 
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    </InfoSection>
  );

  // Chargement
  if (detailsLoading) {
    return (
      <div style={{ padding: '24px' }}>
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  // Erreur ou entreprise non trouvée
  if (!selectedCompany) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Entreprise non trouvée"
          description="L'entreprise que vous recherchez n'existe pas ou a été supprimée."
          type="error"
          showIcon
          action={
            <Button onClick={() => navigate('/companies')}>
              Retour à la liste
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        padding: '24px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh'
      }}
    >
      {renderHeader()}
      
      <motion.div variants={itemVariants}>
        <Card style={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            size="large"
            tabBarStyle={{ marginBottom: '24px' }}
          >
            <TabPane 
              tab={
                <span>
                  <EyeOutlined />
                  Vue d'ensemble
                </span>
              }
              key="overview"
            >
              {renderOverviewTab()}
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <HistoryOutlined />
                  Activités
                </span>
              }
              key="activities"
            >
              {renderActivitiesTab()}
            </TabPane>
            
            {/* <TabPane 
              tab={
                <span>
                  <FolderOutlined />
                  Documents
                </span>
              }
              key="documents"
            >
              {renderDocumentsTab()}
            </TabPane> */}
            
            {/* <TabPane 
              tab={
                <span>
                  <ContactsOutlined />
                  Contacts
                </span>
              }
              key="contacts"
            >
              <Empty description="Fonctionnalité à venir" />
            </TabPane> */}
            
            {/* <TabPane 
              tab={
                <span>
                  <ProjectOutlined />
                  Projets
                </span>
              }
              key="projects"
            >
              <Empty description="Fonctionnalité à venir" />
            </TabPane> */}
          </Tabs>
        </Card>
      </motion.div>

      {/* Drawer pour l'édition des notes */}
      <Drawer
        title="Modifier les notes"
        placement="right"
        onClose={() => setNotesDrawerOpen(false)}
        open={notesDrawerOpen}
        width={400}
        extra={
          <Space>
            <Button onClick={() => setNotesDrawerOpen(false)}>
              Annuler
            </Button>
            <Button type="primary" onClick={handleSaveNotes}>
              Sauvegarder
            </Button>
          </Space>
        }
      >
        <Form form={editNotesForm} layout="vertical">
          <Form.Item
            name="notes"
            label="Notes internes"
          >
            <TextArea
              rows={10}
              placeholder="Ajouter des notes sur cette entreprise..."
            />
          </Form.Item>
        </Form>
      </Drawer>
    </motion.div>
  );
};

export default CompaniesDetails;