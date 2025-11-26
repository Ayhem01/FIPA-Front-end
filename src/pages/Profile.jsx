import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  List,
  Descriptions,
  Avatar,
  Switch,
  Upload,
  message,
  Typography,
  Space,
  Tooltip,
  Badge,
  Divider,
  Tag,
  Grid,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Table,
  Popconfirm,
  Image
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  SettingOutlined,
  MessageOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  CameraOutlined,
  LoadingOutlined,
  PictureOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  BarChartOutlined,
  TrophyOutlined,
  RightOutlined
} from "@ant-design/icons";
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";

// Imports des actions Redux
import {
  getCurrentUser,
  updateMyProfile,
  fetchUsers,
  deleteUserById,
  createUser,
  updateUserById,
  register,
  fetchMyActions,        
  fetchMyActionsStats    
} from "../features/userSlice";

// Images imports
import BgProfile from "../assets/images/bg-profile.jpg";


const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;
const { Option } = Select;

// Configuration API - utiliser la même que les companies
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// 👉 Composant d'upload de photo suivant la logique des companies
const PhotoUpload = ({ value, onChange, loading }) => {
  const [imageUrl, setImageUrl] = useState(value);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Fonction pour construire l'URL de l'image (MÊME logique que LogoUpload)
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Si c'est déjà une URL complète (http/https)
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Si c'est un chemin relatif, construire l'URL complète
    return `${API_BASE_URL}/storage/${imagePath}`;
  };

  // Synchroniser avec la valeur externe
  useEffect(() => {
    console.log('📷 PhotoUpload value changed:', value);
    setImageError(false);
    
    if (value && value !== null) {
      const imageUrl = getImageUrl(value);
      setImageUrl(imageUrl);
    } else {
      setImageUrl(value);
    }
  }, [value]);

  const handleImageError = () => {
    console.error('❌ Erreur chargement image:', imageUrl);
    setImageError(true);
    setImageUrl(null);
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
    if (!isJpgOrPng) {
      message.error('Vous ne pouvez télécharger que des fichiers JPG/PNG/WebP!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('L\'image doit faire moins de 2MB!');
      return false;
    }

    // 👉 CORRECTION: Prévisualiser l'image immédiatement (même logique que LogoUpload)
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrl(e.target.result);
      setImageError(false);
    };
    reader.readAsDataURL(file);

    // 👉 CORRECTION: Appeler onChange avec le fichier (même que companies)
    if (onChange) {
      onChange(file);
    }

    return false; // Empêcher l'upload automatique
  };
  const handleChange = (info) => {
    if (info.file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target.result);
        setImageError(false);
      };
      reader.readAsDataURL(info.file);

      // Appeler onChange avec le fichier
      if (onChange) {
        onChange(info.file);
      }
    }
  };
 const uploadButton = (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        border: '2px dashed #d9d9d9',
        borderRadius: '50%',
        width: '100px',
        height: '100px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
    >
      {loading || uploadLoading ? (
        <LoadingOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
      ) : (
        <>
          <PictureOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
          <Text style={{ fontSize: '10px', marginTop: '4px', color: '#666' }}>
            Photo
          </Text>
        </>
      )}
    </motion.div>
  );

  return (
    <Upload
      name="photo"
      listType="picture"
      showUploadList={false}
      beforeUpload={beforeUpload}
      onChange={handleChange} // 👈 CORRECTION: Utiliser handleChange
      accept="image/jpeg,image/png,image/webp"
      disabled={loading || uploadLoading}
    >
      <div style={{ position: 'relative', cursor: 'pointer' }}>
        {imageUrl && !imageError ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ position: 'relative' }}
          >
            <Avatar 
              size={100} 
              src={imageUrl}
              onError={handleImageError}
              style={{
                border: '4px solid white',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                backgroundColor: 'transparent'
              }}
            />
            
            {/* Overlay avec icône de caméra - même style que les companies */}
           <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.3s',
              borderRadius: '50%'
            }}
            className="upload-overlay">
              <CameraOutlined style={{ color: 'white', fontSize: '24px' }} />
            </div>
          </motion.div>
        ) : uploadButton}
        
        
        {/* Badge de statut */}
        <Badge 
          status="success" 
          style={{ 
            position: 'absolute', 
            bottom: '8px', 
            right: '8px',
            transform: 'scale(1.2)'
          }} 
        />
      </div>
    </Upload>
  );
};

// 👉 Composant Avatar pour la liste des utilisateurs (même logique que CompanyAvatar)
const UserAvatar = ({ photo, name, size = 40 }) => {
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = () => {
    setImageError(true);
  };

  // Construire l'URL de la photo (même logique que companies)
  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    
    // Si c'est déjà une URL complète (http/https)
    if (photoPath.startsWith('http')) {
      return photoPath;
    }
    
    // Si c'est un chemin relatif, construire l'URL complète
    return `${API_BASE_URL}/storage/${photoPath}`;
  };

  const photoUrl = getPhotoUrl(photo);

  return (
    <Avatar 
      size={size}
      src={photoUrl && !imageError ? photoUrl : null}
      icon={(!photoUrl || imageError) ? <UserOutlined /> : null}
      alt={name}
      onError={handleImageError}
      style={{ 
        backgroundColor: (!photoUrl || imageError) ? '#f56a00' : 'transparent',
        border: (photoUrl && !imageError) ? '1px solid #f0f0f0' : 'none',
        objectFit: 'cover'
      }}
    />
  );
};

function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const screens = useBreakpoint();

  // Redux state - ajouter les nouveaux états
  const {
    user: currentUser,
    loading,
    profileUpdating,
    usersPage,
    users,
    error,
    myActions,
    myActionsStats
  } = useSelector((state) => state.user);

   const isAdmin = React.useMemo(() => {
    return !!(
      currentUser?.is_admin === true ||
      currentUser?.role === 'admin' ||
      (Array.isArray(currentUser?.roles_list) && currentUser.roles_list.includes('admin')) ||
      (Array.isArray(currentUser?.roles) && currentUser.roles.some(r => r?.name === 'admin'))
    );
  }, [currentUser]);

  // Local state
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [editVisible, setEditVisible] = useState(false);
  const [profileForm] = Form.useForm();
  
  // Admin users state
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [userForm] = Form.useForm();
  const [editingUser, setEditingUser] = useState(null);
  const [q, setQ] = useState('');
  const [perPage, setPerPage] = useState(10);

  // State pour le modal signup
  const [signupModalVisible, setSignupModalVisible] = useState(false);
  const [signupForm] = Form.useForm();
  const [signupLoading, setSignupLoading] = useState(false);

  // 👉 NOUVEAU: Local state pour les filtres d'actions
  const [actionsFilters, setActionsFilters] = useState({
    periode: 'a_venir',
    statut: '',
    type: ''
  });

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchUsers({ q: '', page: 1, per_page: perPage }));
    }
  }, [dispatch, perPage, isAdmin]);

  // Effects
  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchUsers({ q: '', page: 1, per_page: perPage }));
  }, [dispatch, perPage]);

  // 👉 NOUVEAU: Charger les actions et stats de l'utilisateur
  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchMyActions({ 
        ...actionsFilters, 
        per_page: 5,
        sort_by: 'date_debut',
        sort_direction: 'asc'
      }));
      dispatch(fetchMyActionsStats());
    }
  }, [dispatch, currentUser?.id, actionsFilters]);

  // Synchroniser la photo avec currentUser
  useEffect(() => {
    if (currentUser?.photo) {
      console.log('🔄 Synchronisation photo utilisateur:', currentUser.photo);
      setPreviewPhoto(currentUser.photo);
    } else {
      console.log('📸 Aucune photo utilisateur');
      setPreviewPhoto(null);
    }
  }, [currentUser?.photo]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  // Construction de l'URL de l'avatar pour l'affichage principal
  const avatarSrc = React.useMemo(() => {
    if (previewPhoto) {
      // Si c'est un fichier local (preview)
      if (previewPhoto.startsWith('blob:') || previewPhoto.startsWith('data:')) {
        return previewPhoto;
      }
      // Si c'est un chemin serveur
      if (previewPhoto.startsWith('http')) {
        return previewPhoto;
      }
      // Construire l'URL complète
      return `${API_BASE_URL}/storage/${previewPhoto}`;
    }
    
    return null;
  }, [previewPhoto]);

  // 👉 NOUVEAU: Fonction pour formater les types d'actions
  const getActionTypeLabel = (type) => {
    const types = {
      'seminaire_jipays': 'Séminaire JI Pays',
      'salon': 'Salon',
      'cte': 'CTE',
      'media': 'Média',
      'seminaire_ji_secteur': 'Séminaire JI Secteur',
      'salon_sectoriel': 'Salon Sectoriel',
      'demarchage_direct': 'Démarchage Direct',
      'delegation': 'Délégation',
      'visite_entreprise': 'Visite Entreprise'
    };
    return types[type] || type;
  };

  // 👉 NOUVEAU: Fonction pour obtenir la couleur du statut
  const getStatusColor = (statut) => {
    const colors = {
      'planifiee': 'blue',
      'en_cours': 'orange',
      'terminee': 'green',
      'annulee': 'red',
      'reportee': 'yellow'
    };
    return colors[statut] || 'default';
  };

  // 👉 NOUVEAU: Fonction pour formater les dates
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  // Upload photo handler - suivre la logique des companies
 // 👉 CORRECTION: Upload photo handler - suivre EXACTEMENT la logique des companies
const handlePhotoChange = (file) => {
  console.log('🔄 Photo sélectionnée:', file.name);
  setPhotoFile(file);
  
  // 👉 CORRECTION: Créer FormData et uploader immédiatement (même logique que companies)
  const formData = new FormData();
  formData.append('photo', file);
  
  // 👉 AMÉLIORATION: Ajouter _method pour Laravel (comme dans updateCompany)
  formData.append('_method', 'PUT');
  
  dispatch(updateMyProfile(formData))
    .unwrap()
    .then((response) => {
      console.log('✅ Réponse serveur:', response);
      message.success('Photo mise à jour avec succès');
      
      // 👉 CORRECTION: Mettre à jour la preview locale (même logique)
      if (response?.photo) {
        console.log('📸 Nouveau chemin photo:', response.photo);
        setPreviewPhoto(response.photo);
      }
      
      // Recharger les données utilisateur et la liste des utilisateurs
      setTimeout(() => {
        dispatch(getCurrentUser());
        dispatch(fetchUsers({ q, page: usersPage?.current_page || 1, per_page: perPage }));
      }, 500);
    })
    .catch((err) => {
      console.error('❌ Photo upload error:', err);
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          "Erreur lors du téléversement de la photo";
      message.error(errorMessage);
    });
};

  // Profile edit handlers
  const openEditProfile = () => {
    profileForm.setFieldsValue({
      name: currentUser?.name || '',
      phone: currentUser?.phone || '',
      position: currentUser?.position || '',
      address: currentUser?.address || '',
      birth_date: currentUser?.birth_date ? dayjs(currentUser.birth_date) : null,
      gender: currentUser?.gender || undefined,
    });
    setEditVisible(true);
  };

  const saveProfile = async () => {
    try {
      const values = await profileForm.validateFields();
      const payload = {
        name: values.name,
        phone: values.phone || null,
        position: values.position || null,
        address: values.address || null,
        birth_date: values.birth_date ? values.birth_date.format('YYYY-MM-DD') : null,
        gender: values.gender || null,
      };
      
      await dispatch(updateMyProfile(payload)).unwrap();
      message.success('Profil mis à jour avec succès');
      setEditVisible(false);
      dispatch(getCurrentUser());
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      
      let errorMessage = 'Erreur lors de la mise à jour du profil';
      if (error?.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        errorMessage = errors.join(', ');
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage);
    }
  };

  // Fonctions pour le signup intégré
  const openSignupModal = () => {
    signupForm.resetFields();
    setSignupModalVisible(true);
  };

  const handleSignupSubmit = async () => {
    try {
      setSignupLoading(true);
      const values = await signupForm.validateFields();
      
      // Utiliser l'action register du userSlice
      await dispatch(register(values)).unwrap();
      
      message.success("Utilisateur créé avec succès. Un mot de passe temporaire a été envoyé par email.");
      setSignupModalVisible(false);
      signupForm.resetFields();
      
      // Recharger la liste des utilisateurs
      dispatch(fetchUsers({ q, page: usersPage?.current_page || 1, per_page: perPage }));
      
    } catch (error) {
      console.error('Erreur signup:', error);
      let errorMessage = 'Erreur lors de la création du compte';
      
      if (error?.errors) {
        const errors = Object.values(error.errors).flat();
        errorMessage = errors.join(', ');
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage);
    } finally {
      setSignupLoading(false);
    }
  };

  // Admin users handlers
  const openUserModal = (record = null) => {
    setEditingUser(record);
    if (record) {
      userForm.setFieldsValue({
        name: record.name,
        email: record.email,  
        phone: record.phone,
        position: record.position,
        address: record.address,
        birth_date: record.birth_date ? dayjs(record.birth_date) : null,
        gender: record.gender || undefined,
        roles: Array.from(record.roles_list || []),
        permissions: Array.from(record.permissions_list || [])
      });
    } else {
      userForm.resetFields();
    }
    setUserModalVisible(true);
  };

  const saveUser = async () => {
    try {
      const values = await userForm.validateFields();
      const payload = {
        ...values,
        birth_date: values.birth_date ? values.birth_date.format('YYYY-MM-DD') : null
      };

      if (editingUser) {
        await dispatch(updateUserById({ id: editingUser.id, payload })).unwrap();
        message.success('Utilisateur mis à jour avec succès');
      } else {
        if (!payload.password) {
          message.error("Le mot de passe est requis pour créer un utilisateur");
          return;
        }
        await dispatch(createUser(payload)).unwrap();
        message.success('Utilisateur créé avec succès');
      }

      setUserModalVisible(false);
      dispatch(fetchUsers({ q, page: usersPage?.current_page || 1, per_page: perPage }));
    } catch (err) {
      message.error(err?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const removeUser = (id) => {
    dispatch(deleteUserById(id))
      .unwrap()
      .then(() => {
        message.success('Utilisateur supprimé avec succès');
        dispatch(fetchUsers({ q, page: usersPage?.current_page || 1, per_page: perPage }));
      })
      .catch((err) => {
        message.error(err?.message || 'Erreur lors de la suppression');
      });
  };

  const onSearchUsers = (value) => {
    setQ(value);
    dispatch(fetchUsers({ q: value, page: 1, per_page: perPage }));
  };

  const onChangeUsersPage = (pagination) => {
    dispatch(fetchUsers({ 
      q, 
      page: pagination.current, 
      per_page: pagination.pageSize 
    }));
  };

  // Colonnes pour le tableau des utilisateurs avec photos
  const usersColumns = [
    {
      title: 'Photo',
      dataIndex: 'photo',
      key: 'photo',
      width: 80,
      render: (photo, record) => (
        <UserAvatar 
          photo={photo}
          name={record.name}
          size={50}
        />
      )
    },
    { 
      title: 'Nom', 
      dataIndex: 'name', 
      key: 'name',
      render: (text) => <Text strong>{text}</Text>
    },
    { 
      title: 'Email', 
      dataIndex: 'email', 
      key: 'email',
      ellipsis: true
    },
    { 
      title: 'Téléphone', 
      dataIndex: 'phone', 
      key: 'phone',
      render: (text) => text || '-'
    },
    {
      title: 'Rôles',
      dataIndex: 'roles_list',
      key: 'roles_list',
      render: (roles) => (
        <Space wrap>
          {Array.from(roles || []).map((role, i) => (
            <Tag key={i} color="blue" size="small">{role}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Modifier">
            <Button 
              size="small" 
              icon={<EditOutlined />} 
              onClick={() => openUserModal(record)}
            />
          </Tooltip>
          <Popconfirm 
            title="Supprimer cet utilisateur ?" 
            description="Cette action est irréversible."
            onConfirm={() => removeUser(record.id)}
            okText="Supprimer"
            cancelText="Annuler"
          >
            <Tooltip title="Supprimer">
              <Button 
                size="small" 
                danger 
                icon={<DeleteOutlined />} 
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <motion.div 
      className="modern-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* En-tête de profil moderne */}
      <motion.div
        className="profile-header-modern"
        style={{
          background: `linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9)), url(${BgProfile}) center/cover`,
          borderRadius: '20px',
          padding: '40px',
          marginBottom: '32px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Row justify="space-between" align="middle" gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                {/* Avatar avec upload amélioré */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  style={{ position: 'relative' }}
                >
                  <PhotoUpload 
                    value={avatarSrc}
                    onChange={handlePhotoChange}
                    loading={profileUpdating}
                  />
                </motion.div>

                {/* Informations utilisateur */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Title level={screens.xs ? 3 : 2} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
                    {currentUser?.name || 'Utilisateur'}
                  </Title>
                  <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', display: 'block', marginBottom: '8px' }}>
                    {currentUser?.position || 'Membre'}
                  </Text>
                  <Space wrap>
                    {Array.from(currentUser?.roles_list || []).map((role, i) => (
                      <Tag key={i} color="rgba(255,255,255,0.2)" style={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                        {role}
                      </Tag>
                    ))}
                  </Space>
                </motion.div>
              </div>
            </Col>

            <Col xs={24} lg={8}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                style={{ textAlign: screens.xs ? 'center' : 'right' }}
              >
                <Space wrap size="large">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                   
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      type="primary"
                      size="large"
                      style={{
                        background: 'white',
                        border: 'none',
                        color: '#667eea',
                        borderRadius: '12px',
                        fontWeight: 600,
                        boxShadow: '0 4px 16px rgba(255,255,255,0.3)'
                      }}
                      icon={<EditOutlined />}
                      onClick={openEditProfile}
                      loading={profileUpdating}
                    >
                      Modifier
                    </Button>
                  </motion.div>
                </Space>
              </motion.div>
            </Col>
          </Row>
        </div>
      </motion.div>

      {/* Contenu principal */}
      <Row gutter={[24, 24]}>
        {/* Informations de profil */}
        <Col xs={24} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card
              className="modern-card"
              style={{
                borderRadius: '16px',
                border: '1px solid #f0f0f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                height: '100%'
              }}
              bodyStyle={{ padding: '24px' }}
              title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      <UserOutlined />
                    </div>
                    <Title level={5} style={{ margin: 0 }}>Informations du profil</Title>
                  </div>
                  <Tooltip title="Modifier le profil">
                    <Button type="text" icon={<EditOutlined />} size="small" onClick={openEditProfile} />
                  </Tooltip>
                </div>
              }
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Paragraph style={{ color: '#666', marginBottom: '24px' }}>
                  {currentUser?.bio || "Bienvenue sur votre profil. Vous pouvez mettre à jour vos informations personnelles et gérer vos paramètres."}
                </Paragraph>
              </motion.div>

              <Divider />

              <Descriptions column={1} size="small">
                <Descriptions.Item 
                  label={
                    <Text strong style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <UserOutlined style={{ color: '#1890ff' }} />
                      Nom complet
                    </Text>
                  }
                >
                  {currentUser?.name || '-'}
                </Descriptions.Item>
                
                <Descriptions.Item 
                  label={
                    <Text strong style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <PhoneOutlined style={{ color: '#52c41a' }} />
                      Téléphone
                    </Text>
                  }
                >
                  {currentUser?.phone || '-'}
                </Descriptions.Item>
                
                <Descriptions.Item 
                  label={
                    <Text strong style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MailOutlined style={{ color: '#fa8c16' }} />
                      Email
                    </Text>
                  }
                >
                  {currentUser?.email || '-'}
                </Descriptions.Item>
                
                <Descriptions.Item 
                  label={
                    <Text strong style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <EnvironmentOutlined style={{ color: '#722ed1' }} />
                      Adresse
                    </Text>
                  }
                >
                  {currentUser?.address || '-'}
                </Descriptions.Item>

                <Descriptions.Item 
                  label={
                    <Text strong style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <EnvironmentOutlined style={{ color: '#13c2c2' }} />
                      Poste
                    </Text>
                  }
                >
                  {currentUser?.position || '-'}
                </Descriptions.Item>

                <Descriptions.Item 
                  label={
                    <Text strong style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <UserOutlined style={{ color: '#f759ab' }} />
                      Genre
                    </Text>
                  }
                >
                  {currentUser?.gender === 'male' ? 'Homme' : 
                   currentUser?.gender === 'female' ? 'Femme' : 
                   currentUser?.gender === 'other' ? 'Autre' : '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </motion.div>
        </Col>

        {/* 👉 NOUVEAU: Mes Statistiques (remplace Paramètres) */}
        <Col xs={24} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card
              className="modern-card"
              style={{
                borderRadius: '16px',
                border: '1px solid #f0f0f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                height: '100%'
              }}
              bodyStyle={{ padding: '24px' }}
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <BarChartOutlined />
                  </div>
                  <Title level={5} style={{ margin: 0 }}>Mes Statistiques</Title>
                </div>
              }
            >
              {myActionsStats?.loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <LoadingOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                  <div style={{ marginTop: '16px', color: '#666' }}>Chargement des statistiques...</div>
                </div>
              ) : myActionsStats?.data ? (
                <div>
                  {/* Statistiques rapides */}
                  <Row gutter={8}>
                    <Col span={8}>
                      <div style={{ 
                        textAlign: 'center', 
                        padding: '12px 8px',
                        background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%)',
                        borderRadius: '8px'
                      }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
                          {myActionsStats.data.total_actions || 0}
                        </div>
                        <div style={{ fontSize: '10px', color: '#666' }}>Total actions</div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ 
                        textAlign: 'center', 
                        padding: '12px 8px',
                        background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)',
                        borderRadius: '8px'
                      }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>
                          {myActionsStats.data.actions_a_venir || 0}
                        </div>
                        <div style={{ fontSize: '10px', color: '#666' }}>À venir</div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ 
                        textAlign: 'center', 
                        padding: '12px 8px',
                        background: 'linear-gradient(135deg, #fff2e8 0%, #fff7e6 100%)',
                        borderRadius: '8px'
                      }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fa8c16' }}>
                          {myActionsStats.data.invites_confirmes || 0}
                        </div>
                        <div style={{ fontSize: '10px', color: '#666' }}>Confirmés</div>
                      </div>
                    </Col>
                  </Row>

                  <Divider style={{ margin: '16px 0' }} />

                  {/* Actions par statut */}
                  <div style={{ marginBottom: '16px' }}>
                    <Text strong style={{ fontSize: '12px', color: '#666' }}>RÉPARTITION PAR STATUT</Text>
                    <div style={{ marginTop: '8px' }}>
                      {Object.entries(myActionsStats.data.actions_par_statut || {}).map(([statut, count]) => (
                        <div key={statut} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          padding: '4px 8px',
                          marginBottom: '4px',
                          background: '#fafafa',
                          borderRadius: '4px'
                        }}>
                          <Tag color={getStatusColor(statut)} size="small">{statut}</Tag>
                          <Text strong style={{ fontSize: '12px' }}>{count}</Text>
                        </div>
                      ))}
                    </div>
                  </div>

                 
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  Aucune statistique disponible
                </div>
              )}
            </Card>
          </motion.div>
        </Col>

        {/* 👉 NOUVEAU: Mes Actions (remplace Conversations) */}
        <Col xs={24} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card
              className="modern-card"
              style={{
                borderRadius: '16px',
                border: '1px solid #f0f0f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                height: '100%'
              }}
              bodyStyle={{ padding: '24px' }}
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <CalendarOutlined />
                  </div>
                  <Title level={5} style={{ margin: 0 }}>Mes Actions</Title>
                </div>
              }
              extra={
                <Select
                  size="small"
                  value={actionsFilters.periode}
                  onChange={(value) => setActionsFilters(prev => ({ ...prev, periode: value }))}
                  style={{ width: 100 }}
                >
                  <Option value="a_venir">À venir</Option>
                  <Option value="passees">Passées</Option>
                  <Option value="semaine">Semaine</Option>
                  <Option value="mois">Mois</Option>
                </Select>
              }
            >
              {/* Liste des actions */}
             <List
  itemLayout="horizontal"
  dataSource={myActions?.items || []}
  loading={myActions?.loading}
  split={false}
  locale={{ emptyText: 'Aucune action trouvée' }}
  renderItem={(action, index) => (
    <motion.div
      key={action.id} // Ajouter une clé unique
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index }}
    >
      <List.Item 
        style={{ 
          padding: '12px 0',
          borderRadius: '8px',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        className="action-item"
        // 👉 AJOUT: Clic sur tout l'élément pour naviguer
        onClick={() => navigate(`/marketing/actions/${action.id}`)}
        actions={[
          <Button 
            type="link" 
            size="small" 
            style={{ color: '#1890ff', fontWeight: 500, fontSize: '10px' }}
            icon={<RightOutlined />}
            key="details"
            // 👉 CORRECTION: Navigation vers l'action spécifique
            onClick={(e) => {
              e.stopPropagation(); // Empêcher la propagation du clic
              navigate(`/actions/${action.id}`);
            }}
          >
            VOIR
          </Button>
        ]}
      >
        <List.Item.Meta
          avatar={
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: `linear-gradient(135deg, ${
                action.statut === 'terminee' ? '#52c41a' :
                action.statut === 'en_cours' ? '#fa8c16' :
                action.statut === 'annulee' ? '#ff4d4f' : '#1890ff'
              } 0%, ${
                action.statut === 'terminee' ? '#73d13d' :
                action.statut === 'en_cours' ? '#ffa940' :
                action.statut === 'annulee' ? '#ff7875' : '#40a9ff'
              } 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              {action.statut === 'terminee' ? <CheckCircleOutlined style={{ fontSize: '14px' }} /> :
               action.statut === 'en_cours' ? <ClockCircleOutlined style={{ fontSize: '14px' }} /> :
               action.statut === 'annulee' ? <ExclamationCircleOutlined style={{ fontSize: '14px' }} /> :
               <CalendarOutlined style={{ fontSize: '14px' }} />}
            </div>
          }
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong style={{ fontSize: '13px' }}>{action.nom}</Text>
              <Tag color={getStatusColor(action.statut)} size="small" style={{ fontSize: '10px', margin: 0 }}>
                {action.statut}
              </Tag>
            </div>
          }
          description={
            <div>
              <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>
                {getActionTypeLabel(action.type)}
              </Text>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <Text type="secondary" style={{ fontSize: '10px' }}>
                  <CalendarOutlined style={{ marginRight: '4px' }} />
                  {formatDate(action.date_debut)}
                </Text>
                {action.lieu && (
                  <Text type="secondary" style={{ fontSize: '10px' }}>
                    📍 {action.lieu.substring(0, 10)}...
                  </Text>
                )}
              </div>
            </div>
          }
        />
      </List.Item>
    </motion.div>
  )}
/>
              
             
              
            </Card>
          </motion.div>
        </Col>
      </Row>

       {/* Gestion des utilisateurs (Admin) */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          style={{ marginTop: '32px' }}
        >
          <Card
            className="modern-card"
            style={{ borderRadius: '16px', border: '1px solid #f0f0f0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
            title={
              <Space>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #722ed1 0%, #b37feb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <UserOutlined />
                </div>
                <Title level={5} style={{ margin: 0 }}>Gestion des utilisateurs</Title>
              </Space>
            }
            extra={
              <Space>
                <Input.Search
                  placeholder="Rechercher (nom, email, téléphone)"
                  allowClear
                  enterButton={<SearchOutlined />}
                  onSearch={onSearchUsers}
                  loading={loading}
                  style={{ width: 250 }}
                />
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={openSignupModal}
                  style={{ background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)', border: 'none', borderRadius: '8px', fontWeight: 600 }}
                >
                  Créer un compte
                </Button>
              </Space>
            }
          >
            <Table
              rowKey="id"
              columns={usersColumns}
              dataSource={users}
              loading={loading}
              pagination={{
                current: usersPage?.current_page || 1,
                pageSize: usersPage?.per_page || perPage,
                total: usersPage?.total || users?.length || 0,
                onChange: (page, pageSize) => {
                  setPerPage(pageSize);
                  dispatch(fetchUsers({ q, page, per_page: pageSize }));
                }
              }}
              onChange={onChangeUsersPage}
              scroll={{ x: 800 }}
            />
          </Card>
        </motion.div>
      )}

      {/* Modal édition profil */}
      <Modal
        title="Modifier mon profil"
        open={editVisible}
        onCancel={() => setEditVisible(false)}
        onOk={saveProfile}
        confirmLoading={profileUpdating}
        okText="Enregistrer"
        cancelText="Annuler"
        width={600}
      >
        <Form layout="vertical" form={profileForm}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="name" 
                label="Nom complet" 
                rules={[{ required: true, message: 'Le nom est requis' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Téléphone">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="position" label="Poste">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gender" label="Genre">
                <Select allowClear placeholder="Sélectionner">
                  <Option value="male">Homme</Option>
                  <Option value="female">Femme</Option>
                  <Option value="other">Autre</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Adresse">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item name="birth_date" label="Date de naissance">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal signup intégré */}
      {isAdmin && (
        <Modal
          title={null}
          open={signupModalVisible}
          onCancel={() => setSignupModalVisible(false)}
          footer={null}
          width={600}
          centered
          style={{ borderRadius: '20px' }}
        >
        <div style={{ padding: '20px 0' }}>
          {/* En-tête du formulaire */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '15px',
                background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 8px 32px rgba(82, 196, 26, 0.3)'
              }}
            >
              <UserAddOutlined style={{ fontSize: '24px', color: 'white' }} />
            </motion.div>

            <Title level={3} style={{ margin: '0 0 8px 0', color: '#1a1a1a', fontWeight: 700 }}>
              Créer un compte utilisateur
            </Title>
            <Text type="secondary">
              Remplissez les informations ci-dessous pour créer un nouveau compte
            </Text>
          </div>

          {/* Formulaire signup */}
          <Form
            form={signupForm}
            onFinish={handleSignupSubmit}
            layout="vertical"
            size="large"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={
                    <Text strong style={{ color: '#666', fontSize: '13px' }}>
                      NOM COMPLET
                    </Text>
                  }
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: "Veuillez entrer le nom complet",
                    },
                    {
                      min: 2,
                      message: "Le nom doit contenir au moins 2 caractères",
                    },
                  ]}
                >
                  <Input 
                    prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                    placeholder="Nom complet" 
                    style={{
                      borderRadius: '8px',
                      border: '2px solid #f0f0f0',
                      fontSize: '14px'
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <Text strong style={{ color: '#666', fontSize: '13px' }}>
                      ADRESSE EMAIL
                    </Text>
                  }
                  name="email"
                  rules={[
                    {
                      required: true,
                      type: "email",
                      message: "Veuillez entrer une adresse email valide",
                    },
                  ]}
                >
                  <Input 
                    prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                    placeholder="Adresse email" 
                    style={{
                      borderRadius: '8px',
                      border: '2px solid #f0f0f0',
                      fontSize: '14px'
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Information sur le mot de passe */}
            <div style={{ marginBottom: '24px' }}>
              <Card
                size="small"
                style={{
                  background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%)',
                  border: '1px solid #bae7ff',
                  borderRadius: '8px'
                }}
                bodyStyle={{ padding: '12px 16px' }}
              >
                <Space>
                  <CheckCircleOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                  <Text style={{ fontSize: '13px', color: '#666' }}>
                    Un mot de passe temporaire sera envoyé par email
                  </Text>
                </Space>
              </Card>
            </div>

            <Form.Item style={{ marginBottom: '16px' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={signupLoading}
                block
                size="large"
                style={{
                  height: '48px',
                  background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  boxShadow: '0 4px 20px rgba(82, 196, 26, 0.4)'
                }}
              >
                {signupLoading ? 'Création en cours...' : 'Créer le compte'}
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              <Button
                type="text"
                onClick={() => setSignupModalVisible(false)}
                style={{ color: '#666' }}
              >
                Annuler
              </Button>
            </div>
          </Form>

          {/* Informations supplémentaires */}
          <div style={{ marginTop: '24px' }}>
            <Card
              size="small"
              style={{
                background: '#f9f9f9',
                border: '1px solid #f0f0f0',
                borderRadius: '8px'
              }}
              bodyStyle={{ padding: '16px' }}
            >
              <Space direction="vertical" size="small">
                <Text strong style={{ fontSize: '12px', color: '#666' }}>
                  PROCESSUS DE CRÉATION :
                </Text>
                <ul style={{ margin: 0, paddingLeft: '16px', color: '#666', fontSize: '12px' }}>
                  <li>Validation automatique de l'adresse email</li>
                  <li>Génération et envoi d'un mot de passe temporaire</li>
                  <li>L'utilisateur devra se connecter pour personnaliser son profil</li>
                </ul>
              </Space>
            </Card>
          </div>
        </div>
      </Modal>
       )}

      {/* Modal création / édition utilisateur (ancien modal) */}
      {isAdmin && (
        <Modal
          title={editingUser ? "Modifier l'utilisateur" : "Créer un utilisateur"}
          open={userModalVisible}
          onCancel={() => setUserModalVisible(false)}
          onOk={saveUser}
          okText={editingUser ? "Enregistrer" : "Créer"}
          cancelText="Annuler"
          confirmLoading={loading}
          width={700}
        >
        <Form layout="vertical" form={userForm}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="name" 
                label="Nom complet" 
                rules={[{ required: true, message: 'Le nom est requis' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="email" 
                label="Email" 
                rules={[
                  { required: true, message: 'L\'email est requis' },
                  { type: 'email', message: 'Format email invalide' }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {!editingUser && (
            <Form.Item 
              name="password" 
              label="Mot de passe" 
              rules={[
                { required: true, message: 'Le mot de passe est requis' },
                { min: 8, message: 'Minimum 8 caractères' }
              ]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="Téléphone">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="position" label="Poste">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="birth_date" label="Date de naissance">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gender" label="Genre">
                <Select allowClear placeholder="Sélectionner">
                  <Option value="male">Homme</Option>
                  <Option value="female">Femme</Option>
                  <Option value="other">Autre</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Adresse">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
          <Form.Item name="roles" label="Rôles">
                <Select 
                  mode="tags" 
                  placeholder="Entrer ou sélectionner des rôles"
                  tokenSeparators={[',']}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="permissions" label="Permissions">
                <Select 
                  mode="tags" 
                  placeholder="Entrer ou sélectionner des permissions"
                  tokenSeparators={[',']}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
      )}

      {/* Styles CSS intégrés */}
      <style jsx>{`
        .modern-container {
          padding: 24px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
        }

        .profile-header-modern {
          transition: all 0.3s ease;
        }

        .profile-header-modern:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 48px rgba(0,0,0,0.15) !important;
        }

        .modern-card {
          transition: all 0.3s ease;
        }

        .modern-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
        }

        .action-item:hover {
          background-color: #f8f9ff !important;
          transform: translateX(4px);
        }

        .action-item .ant-list-item-meta-avatar {
          margin-right: 12px;
        }

        .action-item .ant-list-item-action {
          margin-left: 16px;
        }

        .settings-list .ant-switch {
          background-color: #f0f0f0;
        }

        .settings-list .ant-switch-checked {
          background-color: #1890ff;
        }

        /* Style pour l'upload overlay - même que les companies */
        .upload-overlay:hover {
          opacity: 1 !important;
        }

        /* Styles pour le modal signup */
        .ant-modal-content {
          border-radius: 16px !important;
          overflow: hidden;
        }

        .ant-form-item-label > label {
          font-weight: 600 !important;
          color: #666 !important;
        }

        .ant-input:focus,
        .ant-input-focused {
          border-color: #52c41a !important;
          box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.1) !important;
        }

        .ant-btn-primary:hover {
          background: linear-gradient(135deg, #389e0d 0%, #52c41a 100%) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 6px 28px rgba(82, 196, 26, 0.5) !important;
        }

        /* Animation pour les statistiques */
        .stats-card {
          transition: all 0.3s ease;
        }

        .stats-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .modern-container {
            padding: 16px;
          }

          .profile-header-modern {
            padding: 24px !important;
            border-radius: 16px !important;
          }

          .modern-card .ant-card-body {
            padding: 16px !important;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }

        @media (max-width: 576px) {
          .profile-header-modern {
            padding: 20px !important;
          }

          .modern-card .ant-card-body {
            padding: 12px !important;
          }
        }

        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .ant-card {
          animation: fadeInUp 0.5s ease-out;
        }

        .ant-descriptions-item {
          animation: fadeInUp 0.3s ease-out;
        }

        /* Animation pour le focus sur l'input */
        .ant-input:focus {
          animation: inputFocus 0.3s ease-out;
        }

        @keyframes inputFocus {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
          100% {
            transform: scale(1);
          }
        }

        /* Styles pour les tags de statut */
        .ant-tag {
          border-radius: 6px;
          font-weight: 500;
        }

        /* Hover effect pour les boutons */
        .ant-btn:hover {
          transform: translateY(-1px);
          transition: all 0.3s ease;
        }

        /* Styles pour les listes d'actions */
        .ant-list-item {
          border-bottom: none !important;
        }

        .ant-list-item:last-child {
          border-bottom: none !important;
        }

        /* Animation de chargement */
        .ant-spin-dot {
          animation: antSpinMove 1s infinite linear;
        }

        @keyframes antSpinMove {
          to {
            opacity: 1;
          }
        }

        /* Gradient backgrounds pour les cartes de stats */
        .stats-card-blue {
          background: linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%);
          border: 1px solid #bae7ff;
        }

        .stats-card-green {
          background: linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%);
          border: 1px solid #b7eb8f;
        }

        .stats-card-orange {
          background: linear-gradient(135deg, #fff2e8 0%, #fff7e6 100%);
          border: 1px solid #ffd591;
        }

        /* Effet de survol pour les éléments de liste */
        .ant-list-item-meta:hover {
          background-color: rgba(24, 144, 255, 0.02);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        /* Styles pour les badges */
        .ant-badge-status-dot {
          width: 8px;
          height: 8px;
        }

        /* Animation pour les icônes */
        .icon-animated {
          transition: all 0.3s ease;
        }

        .icon-animated:hover {
          transform: scale(1.1);
          color: #1890ff;
        }

        /* Styles pour les descriptions */
        .ant-descriptions-item-label {
          font-weight: 600;
          color: #666;
        }

        /* Styles pour les modals */
        .ant-modal-header {
          border-bottom: 1px solid #f0f0f0;
          padding: 20px 24px;
        }

        .ant-modal-body {
          padding: 24px;
        }

        .ant-modal-footer {
          border-top: 1px solid #f0f0f0;
          padding: 16px 24px;
        }

        /* Styles pour les formulaires */
        .ant-form-item-label {
          padding-bottom: 4px;
        }

        .ant-form-item-explain {
          margin-top: 4px;
        }

        /* Animation pour les cartes */
        .modern-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .modern-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
        }

        /* Styles pour les boutons */
        .ant-btn-primary {
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .ant-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(24, 144, 255, 0.3);
        }

        /* Styles pour les avatars */
        .ant-avatar {
          transition: all 0.3s ease;
        }

        .ant-avatar:hover {
          transform: scale(1.05);
        }

        /* Styles pour le header de profil */
        .profile-header-modern::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%);
          pointer-events: none;
        }

        /* Animation de pulsation pour les badges */
        .ant-badge-status-processing {
          animation: antStatusProcessing 1.2s infinite ease-in-out;
        }

        @keyframes antStatusProcessing {
          0% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          100% {
            transform: scale(2.4);
            opacity: 0;
          }
        }

        /* Styles pour les selecteurs */
        .ant-select-selector {
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .ant-select-focused .ant-select-selector {
          border-color: #1890ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
        }

        /* Styles pour les inputs */
        .ant-input {
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .ant-input:hover {
          border-color: #40a9ff;
        }

        /* Styles pour les date pickers */
        .ant-picker {
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .ant-picker:hover {
          border-color: #40a9ff;
        }

        /* Styles pour les text areas */
        .ant-input {
          resize: vertical;
        }

        /* Animation d'apparition */
        @keyframes slideInFromBottom {
          0% {
            transform: translateY(50px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .slide-in {
          animation: slideInFromBottom 0.5s ease-out;
        }

        /* Styles pour les tooltips */
        .ant-tooltip-inner {
          border-radius: 6px;
          font-size: 12px;
        }

        /* Styles pour les popconfirms */
        .ant-popover-inner-content {
          border-radius: 8px;
        }

        /* Styles pour les messages */
        .ant-message-notice {
          border-radius: 8px;
        }

        /* Styles pour les notifications */
        .ant-notification-notice {
          border-radius: 8px;
        }

        /* Styles pour les dividers */
        .ant-divider {
          margin: 16px 0;
        }

        /* Styles pour les spaces */
        .ant-space-item {
          transition: all 0.3s ease;
        }

        /* Optimisation des performances */
        .modern-container * {
          box-sizing: border-box;
        }

        /* Print styles */
        @media print {
          .modern-container {
            background: white !important;
            padding: 0 !important;
          }
          
          .profile-header-modern {
            background: #f5f5f5 !important;
            color: black !important;
          }
          
          .modern-card {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
        }
      `}</style>
    </motion.div>
  );
}

export default Profile;
