import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Form, Input, Select, Button, Upload, Row, Col, Card, Typography, 
  Steps, message, Alert, Skeleton, Avatar, Progress, Space, Divider,
  Switch, InputNumber, DatePicker, TimePicker, Radio, Checkbox,
  Tooltip, Tag, Badge, Grid
} from 'antd';
import { 
  SaveOutlined, ArrowLeftOutlined, LoadingOutlined, CheckCircleOutlined,
  BankOutlined, UploadOutlined, UserOutlined, MailOutlined, PhoneOutlined,
  GlobalOutlined, EnvironmentOutlined, ApartmentOutlined, TeamOutlined,
  FileTextOutlined, DollarOutlined, CalendarOutlined, ClockCircleOutlined,
  PictureOutlined, InfoCircleOutlined, SettingOutlined, ThunderboltOutlined,
  ExclamationCircleOutlined, StarOutlined, RocketOutlined, TrophyOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  createCompany, 
  updateCompany, 
  fetchCompanyDetails,
  resetOperation,
  clearError
} from '../../features/companiesSlice';
import { fetchSecteurs } from '../../features/marketingSlice';
import { fetchAllUsers } from '../../features/userSlice';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { useBreakpoint } = Grid;

// Composant de section animée
const AnimatedFormSection = ({ title, icon, children, step, currentStep, delay = 0 }) => {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;
  
  const sectionVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: delay * 0.1,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: { duration: 0.3 }
    }
  };

  const cardStyle = {
    borderRadius: '16px',
    border: isActive ? '2px solid #1890ff' : '1px solid #f0f0f0',
    background: isActive ? 'linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%)' : 'white',
    boxShadow: isActive 
      ? '0 8px 32px rgba(24, 144, 255, 0.15)' 
      : '0 4px 20px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    marginBottom: '24px'
  };

  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Card
        style={cardStyle}
        bodyStyle={{ padding: '32px' }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <motion.div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: isCompleted 
                  ? 'linear-gradient(135deg, #52c41a, #389e0d)'
                  : isActive 
                    ? 'linear-gradient(135deg, #1890ff, #096dd9)'
                    : 'linear-gradient(135deg, #d9d9d9, #bfbfbf)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                boxShadow: isActive ? '0 4px 16px rgba(24, 144, 255, 0.4)' : 'none'
              }}
              animate={{
                scale: isActive ? [1, 1.1, 1] : 1,
                rotate: isCompleted ? [0, 360] : 0
              }}
              transition={{ 
                scale: { duration: 0.5, repeat: isActive ? Infinity : 0, repeatDelay: 2 },
                rotate: { duration: 0.8 }
              }}
            >
              {isCompleted ? <CheckCircleOutlined /> : icon}
            </motion.div>
            
            <div>
              <Title level={4} style={{ 
                margin: 0, 
                color: isActive ? '#1890ff' : '#262626',
                fontWeight: 600 
              }}>
                {title}
              </Title>
              {isCompleted && (
                <Text style={{ color: '#52c41a', fontSize: '12px' }}>
                  ✓ Section complétée
                </Text>
              )}
            </div>
          </div>
        }
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay * 0.1 + 0.2 }}
        >
          {children}
        </motion.div>
      </Card>
    </motion.div>
  );
};

// Composant de champ animé
const AnimatedFormItem = ({ children, delay = 0, ...props }) => {
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4, delay: delay * 0.05 }
    }
  };

  return (
    <motion.div variants={itemVariants} initial="hidden" animate="visible">
      <Form.Item {...props}>
        {children}
      </Form.Item>
    </motion.div>
  );
};

// Composant d'upload de logo avec preview
const LogoUpload = ({ value, onChange }) => {
  const [imageUrl, setImageUrl] = useState(value);
  const [loading, setLoading] = useState(false);

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('Vous ne pouvez télécharger que des fichiers JPG/PNG!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('L\'image doit faire moins de 2MB!');
      return false;
    }
    return false; // Empêcher l'upload automatique
  };

  const handleChange = (info) => {
    if (info.file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target.result);
        onChange(info.file);
      };
      reader.readAsDataURL(info.file);
    }
  };

  const uploadButton = (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        border: '2px dashed #d9d9d9',
        borderRadius: '12px',
        padding: '32px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
    >
      {loading ? <LoadingOutlined /> : <PictureOutlined style={{ fontSize: '32px', color: '#1890ff' }} />}
      <div style={{ marginTop: '16px' }}>
        <Text strong style={{ color: '#1890ff' }}>Cliquez pour télécharger</Text>
        <br />
        <Text type="secondary" style={{ fontSize: '12px' }}>
          PNG, JPG jusqu'à 2MB
        </Text>
      </div>
    </motion.div>
  );

  return (
    <Upload
      name="logo"
      listType="picture-card"
      className="logo-uploader"
      showUploadList={false}
      beforeUpload={beforeUpload}
      onChange={handleChange}
    >
      {imageUrl ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ position: 'relative', width: '100%', height: '100%' }}
        >
          <img src={imageUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
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
            borderRadius: '8px'
          }}
          className="upload-overlay">
            <UploadOutlined style={{ color: 'white', fontSize: '24px' }} />
          </div>
        </motion.div>
      ) : uploadButton}
    </Upload>
  );
};

const CompaniesForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const screens = useBreakpoint();
  const [form] = Form.useForm();
  
  // Sélecteurs Redux
  const { selectedCompany, operation, detailsLoading } = useSelector(state => state.companies);
  const { secteurs } = useSelector(state => state.marketing);
  const { list: users } = useSelector(state => state.user);
  
  // États locaux
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [previewLogo, setPreviewLogo] = useState(null);

  const isEditing = Boolean(id);
  const isLoading = operation.loading;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  // Configuration des étapes
  const steps = [
    {
      title: 'Informations générales',
      icon: <BankOutlined />,
      description: 'Nom, description et logo'
    },
    {
      title: 'Coordonnées',
      icon: <EnvironmentOutlined />,
      description: 'Adresse et contact'
    },
    {
      title: 'Détails business',
      icon: <ApartmentOutlined />,
      description: 'Type, secteur et propriétaire'
    },
    {
      title: 'Finalisation',
      icon: <CheckCircleOutlined />,
      description: 'Vérification et sauvegarde'
    }
  ];

  // Options de données corrigées selon la migration
  const typeOptions = [
    { value: 'entreprise', label: 'Entreprise' },
    { value: 'organisme_public', label: 'Organisme public' },
    { value: 'association', label: 'Association' },
    { value: 'autre', label: 'Autre' }
  ];

  const statutOptions = [
    { value: 'prospect', label: 'Prospect' },
    { value: 'actif', label: 'Actif' },
    { value: 'inactif', label: 'Inactif' },
    { value: 'client', label: 'Client' },
    { value: 'partenaire', label: 'Partenaire' }
  ];

  const tailleOptions = [
    { value: 'TPE', label: 'TPE (Très Petite Entreprise)' },
    { value: 'PME', label: 'PME (Petite et Moyenne Entreprise)' },
    { value: 'ETI', label: 'ETI (Entreprise de Taille Intermédiaire)' },
    { value: 'GE', label: 'GE (Grande Entreprise)' }
  ];

  // Chargement des données de référence via Redux
  useEffect(() => {
    // Charger les secteurs depuis le marketingSlice
    dispatch(fetchSecteurs());
    
    // Charger les utilisateurs depuis le userSlice
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // Chargement des données en mode édition
  useEffect(() => {
    if (isEditing && id) {
      dispatch(fetchCompanyDetails(id));
    }
  }, [dispatch, id, isEditing]);

  // Remplissage du formulaire en mode édition
  useEffect(() => {
    if (isEditing && selectedCompany) {
      const formData = {
        nom: selectedCompany.nom,
        description: selectedCompany.description,
        email: selectedCompany.email,
        telephone: selectedCompany.telephone,
        site_web: selectedCompany.site_web,
        adresse: selectedCompany.adresse,
        ville: selectedCompany.ville,
        code_postal: selectedCompany.code_postal,
        pays: selectedCompany.pays,
        type: selectedCompany.type,
        taille: selectedCompany.taille,
        secteur_id: selectedCompany.secteur_id,
        proprietaire_id: selectedCompany.proprietaire_id,
        statut: selectedCompany.statut,
        capital: selectedCompany.capital,
        chiffre_affaires: selectedCompany.chiffre_affaires,
        // date_creation: selectedCompany.date_creation,
        notes: selectedCompany.notes
      };
      form.setFieldsValue(formData);
      setFormValues(formData);
      if (selectedCompany.logo) {
        setPreviewLogo(selectedCompany.logo);
      }
    }
  }, [selectedCompany, form, isEditing]);

  // Gestion des opérations
  useEffect(() => {
    if (operation.success) {
      if (operation.type === 'create') {
        message.success('Entreprise créée avec succès!');
        navigate('/companies');
      } else if (operation.type === 'update') {
        message.success('Entreprise mise à jour avec succès!');
        navigate('/companies');
      }
      dispatch(resetOperation());
    } else if (operation.error) {
      message.error(`Erreur: ${operation.error}`);
      dispatch(resetOperation());
    }
  }, [operation, navigate, dispatch]);

  // Validation par étape
  const validateCurrentStep = async () => {
    try {
      const values = await form.validateFields();
      setFormValues({ ...formValues, ...values });
      return true;
    } catch (error) {
      return false;
    }
  };

  // Navigation entre les étapes
  const nextStep = async () => {
    if (await validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  // Soumission du formulaire
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const finalData = { ...formValues, ...values };
      
      if (logoFile) {
        finalData.logo = logoFile;
      }

      if (isEditing) {
        dispatch(updateCompany({ id, companyData: finalData }));
      } else {
        dispatch(createCompany(finalData));
      }
    } catch (error) {
      message.error('Veuillez vérifier tous les champs requis');
    }
  };

  // Rendu des étapes
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <AnimatedFormSection 
            title="Informations générales" 
            icon={<BankOutlined />}
            step={0}
            currentStep={currentStep}
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <AnimatedFormItem
                      name="nom"
                      label="Nom de l'entreprise"
                      rules={[{ required: true, message: 'Le nom est requis' }]}
                      delay={0}
                    >
                      <Input 
                        prefix={<BankOutlined />}
                        placeholder="Nom de l'entreprise"
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </AnimatedFormItem>
                  </Col>
                  
                  <Col span={24}>
                    <AnimatedFormItem
                      name="description"
                      label="Description"
                      delay={1}
                    >
                      <TextArea 
                        placeholder="Description de l'entreprise..."
                        autoSize={{ minRows: 4, maxRows: 6 }}
                        style={{ borderRadius: '8px' }}
                      />
                    </AnimatedFormItem>
                  </Col>
                </Row>
              </Col>
              
              <Col xs={24} lg={8}>
                <AnimatedFormItem
                  label="Logo de l'entreprise"
                  delay={2}
                >
                  <LogoUpload 
                    value={previewLogo}
                    onChange={setLogoFile}
                  />
                </AnimatedFormItem>
              </Col>
            </Row>
          </AnimatedFormSection>
        );

      case 1:
        return (
          <AnimatedFormSection 
            title="Coordonnées" 
            icon={<EnvironmentOutlined />}
            step={1}
            currentStep={currentStep}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <AnimatedFormItem
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'L\'email est requis' },
                    { type: 'email', message: 'Format email invalide' }
                  ]}
                  delay={0}
                >
                  <Input 
                    prefix={<MailOutlined />}
                    placeholder="email@entreprise.com"
                    size="large"
                    style={{ borderRadius: '8px' }}
                  />
                </AnimatedFormItem>
              </Col>
              
              <Col xs={24} sm={12}>
                <AnimatedFormItem
                  name="telephone"
                  label="Téléphone"
                  delay={1}
                >
                  <Input 
                    prefix={<PhoneOutlined />}
                    placeholder="+33 1 23 45 67 89"
                    size="large"
                    style={{ borderRadius: '8px' }}
                  />
                </AnimatedFormItem>
              </Col>
              
              <Col span={24}>
                <AnimatedFormItem
                  name="site_web"
                  label="Site web"
                  delay={2}
                >
                  <Input 
                    prefix={<GlobalOutlined />}
                    placeholder="https://www.entreprise.com"
                    size="large"
                    style={{ borderRadius: '8px' }}
                  />
                </AnimatedFormItem>
              </Col>
              
              <Col span={24}>
                <AnimatedFormItem
                  name="adresse"
                  label="Adresse"
                  delay={3}
                >
                  <Input 
                    prefix={<EnvironmentOutlined />}
                    placeholder="Adresse complète"
                    size="large"
                    style={{ borderRadius: '8px' }}
                  />
                </AnimatedFormItem>
              </Col>
              
              <Col xs={24} sm={8}>
                <AnimatedFormItem
                  name="ville"
                  label="Ville"
                  delay={4}
                >
                  <Input 
                    placeholder="Ville"
                    size="large"
                    style={{ borderRadius: '8px' }}
                  />
                </AnimatedFormItem>
              </Col>
              
              <Col xs={24} sm={8}>
                <AnimatedFormItem
                  name="code_postal"
                  label="Code postal"
                  delay={5}
                >
                  <Input 
                    placeholder="75001"
                    size="large"
                    style={{ borderRadius: '8px' }}
                  />
                </AnimatedFormItem>
              </Col>
              
              <Col xs={24} sm={8}>
                <AnimatedFormItem
                  name="pays"
                  label="Pays"
                  delay={6}
                >
                  <Input 
                    placeholder="France"
                    size="large"
                    style={{ borderRadius: '8px' }}
                  />
                </AnimatedFormItem>
              </Col>
            </Row>
          </AnimatedFormSection>
        );

      case 2:
        return (
          <AnimatedFormSection 
            title="Détails business" 
            icon={<ApartmentOutlined />}
            step={2}
            currentStep={currentStep}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <AnimatedFormItem
                  name="type"
                  label="Type d'entreprise"
                  rules={[{ required: true, message: 'Le type est requis' }]}
                  delay={0}
                >
                  <Select 
                    placeholder="Sélectionner un type"
                    size="large"
                    style={{ borderRadius: '8px' }}
                  >
                    {typeOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </AnimatedFormItem>
              </Col>
              
              <Col xs={24} sm={12}>
                <AnimatedFormItem
                  name="statut"
                  label="Statut"
                  rules={[{ required: true, message: 'Le statut est requis' }]}
                  delay={1}
                >
                  <Select 
                    placeholder="Sélectionner un statut"
                    size="large"
                    style={{ borderRadius: '8px' }}
                  >
                    {statutOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </AnimatedFormItem>
              </Col>
              
              <Col xs={24} sm={12}>
                <AnimatedFormItem
                  name="taille"
                  label="Taille de l'entreprise"
                  delay={2}
                >
                  <Select 
                    placeholder="Sélectionner une taille"
                    size="large"
                    style={{ borderRadius: '8px' }}
                  >
                    {tailleOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </AnimatedFormItem>
              </Col>
              
              <Col xs={24} sm={12}>
                <AnimatedFormItem
                  name="secteur_id"
                  label="Secteur d'activité"
                  delay={3}
                >
                  <Select 
                    placeholder="Sélectionner un secteur"
                    size="large"
                    style={{ borderRadius: '8px' }}
                    loading={secteurs.loading}
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {secteurs.items?.map(secteur => (
                      <Option key={secteur.id} value={secteur.id}>
                        {secteur.nom || secteur.name}
                      </Option>
                    ))}
                  </Select>
                </AnimatedFormItem>
              </Col>
              
              <Col xs={24} sm={12}>
                <AnimatedFormItem
                  name="proprietaire_id"
                  label="Propriétaire"
                  delay={4}
                >
                  <Select 
                    placeholder="Assigner un propriétaire"
                    size="large"
                    style={{ borderRadius: '8px' }}
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {users?.map(user => (
                      <Option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </Option>
                    ))}
                  </Select>
                </AnimatedFormItem>
              </Col>
              
              <Col xs={24} sm={12}>
                <AnimatedFormItem
                  name="capital"
                  label="Capital (€)"
                  delay={5}
                >
                  <InputNumber 
                    placeholder="Capital social"
                    size="large"
                    style={{ width: '100%', borderRadius: '8px' }}
                    prefix={<DollarOutlined />}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    min={0}
                  />
                </AnimatedFormItem>
              </Col>
              
              <Col xs={24} sm={12}>
                <AnimatedFormItem
                  name="chiffre_affaires"
                  label="Chiffre d'affaires (€)"
                  delay={6}
                >
                  <InputNumber 
                    placeholder="Chiffre d'affaires annuel"
                    size="large"
                    style={{ width: '100%', borderRadius: '8px' }}
                    prefix={<DollarOutlined />}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    min={0}
                  />
                </AnimatedFormItem>
              </Col>
              
              <Col xs={24} sm={12}>
                <AnimatedFormItem
                  name="date_creation"
                  label="Date de création"
                  delay={7}
                >
                  <DatePicker 
                    placeholder="Date de création"
                    size="large"
                    style={{ width: '100%', borderRadius: '8px' }}
                    format="DD/MM/YYYY"
                  />
                </AnimatedFormItem>
              </Col>
              
              <Col span={24}>
                <AnimatedFormItem
                  name="notes"
                  label="Notes internes"
                  delay={8}
                >
                  <TextArea 
                    placeholder="Notes et commentaires internes..."
                    autoSize={{ minRows: 3, maxRows: 5 }}
                    style={{ borderRadius: '8px' }}
                  />
                </AnimatedFormItem>
              </Col>
            </Row>
          </AnimatedFormSection>
        );

      case 3:
        return (
          <AnimatedFormSection 
            title="Récapitulatif" 
            icon={<CheckCircleOutlined />}
            step={3}
            currentStep={currentStep}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Alert
                message="Vérification finale"
                description="Veuillez vérifier toutes les informations avant de sauvegarder."
                type="info"
                showIcon
                style={{ 
                  marginBottom: '24px',
                  borderRadius: '8px',
                  border: '1px solid #1890ff30'
                }}
              />
              
              <Card 
                title="Résumé de l'entreprise"
                style={{ borderRadius: '12px' }}
              >
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                      {(previewLogo || logoFile) && (
                        <Avatar 
                          size={64} 
                          src={previewLogo || (logoFile && URL.createObjectURL(logoFile))}
                          style={{ borderRadius: '12px' }}
                        />
                      )}
                      <div>
                        <Title level={4} style={{ margin: 0 }}>
                          {formValues.nom || form.getFieldValue('nom')}
                        </Title>
                        <Text type="secondary">
                          {formValues.type || form.getFieldValue('type')} • {formValues.statut || form.getFieldValue('statut')}
                        </Text>
                      </div>
                    </div>
                  </Col>
                  
                  <Col xs={24} sm={12}>
                    <div style={{ marginBottom: '12px' }}>
                      <Text strong>Email: </Text>
                      <Text>{formValues.email || form.getFieldValue('email')}</Text>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <Text strong>Téléphone: </Text>
                      <Text>{formValues.telephone || form.getFieldValue('telephone')}</Text>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <Text strong>Site web: </Text>
                      <Text>{formValues.site_web || form.getFieldValue('site_web')}</Text>
                    </div>
                  </Col>
                  
                  <Col xs={24} sm={12}>
                    <div style={{ marginBottom: '12px' }}>
                      <Text strong>Adresse: </Text>
                      <Text>{formValues.adresse || form.getFieldValue('adresse')}</Text>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <Text strong>Ville: </Text>
                      <Text>{formValues.ville || form.getFieldValue('ville')} {formValues.code_postal || form.getFieldValue('code_postal')}</Text>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <Text strong>Pays: </Text>
                      <Text>{formValues.pays || form.getFieldValue('pays')}</Text>
                    </div>
                  </Col>
                </Row>
              </Card>
            </motion.div>
          </AnimatedFormSection>
        );

      default:
        return null;
    }
  };

  if (detailsLoading) {
    return (
      <div style={{ padding: '24px' }}>
        <Skeleton active />
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
      {/* Header avec animations */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '32px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }}
          animate={{
            backgroundPosition: ['0px 0px', '60px 60px']
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        <Row justify="space-between" align="middle" style={{ position: 'relative', zIndex: 1 }}>
          <Col>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Title level={1} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
                <BankOutlined style={{ marginRight: '16px' }} />
                {isEditing ? 'Modifier l\'entreprise' : 'Nouvelle entreprise'}
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: '8px 0 0 0' }}>
                {isEditing ? 'Mettre à jour les informations de l\'entreprise' : 'Créer une nouvelle entreprise partenaire'}
              </Paragraph>
            </motion.div>
          </Col>
          
          <Col>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button 
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/companies')}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  borderRadius: '8px'
                }}
              >
                Retour à la liste
              </Button>
            </motion.div>
          </Col>
        </Row>
      </motion.div>

      {/* Progress Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ marginBottom: '32px' }}
      >
        <Card style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <Steps 
            current={currentStep} 
            style={{ padding: '16px 0' }}
            responsive={false}
          >
            {steps.map((step, index) => (
              <Step 
                key={index}
                title={step.title}
                description={screens.lg ? step.description : ''}
                icon={
                  <motion.div
                    animate={{
                      scale: currentStep === index ? 1.2 : 1,
                      color: currentStep >= index ? '#1890ff' : '#d9d9d9'
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {step.icon}
                  </motion.div>
                }
              />
            ))}
          </Steps>
        </Card>
      </motion.div>

      {/* Form Content */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        size="large"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card style={{ borderRadius: '16px', marginTop: '24px' }}>
            <Row justify="space-between" align="middle">
              <Col>
                {currentStep > 0 && (
                  <Button 
                    onClick={prevStep}
                    size="large"
                    style={{ borderRadius: '8px' }}
                  >
                    Précédent
                  </Button>
                )}
              </Col>
              
              <Col>
                <Progress 
                  percent={((currentStep + 1) / steps.length) * 100}
                  size="small"
                  style={{ width: '200px' }}
                  strokeColor={{
                    '0%': '#667eea',
                    '100%': '#764ba2',
                  }}
                />
              </Col>
              
              <Col>
                <Space>
                  {currentStep < steps.length - 1 ? (
                    <Button 
                      type="primary" 
                      onClick={nextStep}
                      size="large"
                      style={{ borderRadius: '8px' }}
                    >
                      Suivant
                    </Button>
                  ) : (
                    <Button 
                      type="primary" 
                      onClick={handleSubmit}
                      loading={isLoading}
                      icon={<SaveOutlined />}
                      size="large"
                      style={{ 
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #52c41a, #389e0d)',
                        border: 'none'
                      }}
                    >
                      {isEditing ? 'Mettre à jour' : 'Créer l\'entreprise'}
                    </Button>
                  )}
                </Space>
              </Col>
            </Row>
          </Card>
        </motion.div>
      </Form>

      {/* Styles CSS intégrés */}
      <style jsx>{`
        .logo-uploader .ant-upload {
          width: 100% !important;
          height: 200px !important;
        }

        .logo-uploader .ant-upload-select {
          width: 100% !important;
          height: 100% !important;
        }

        .upload-overlay:hover {
          opacity: 1 !important;
        }

        .ant-steps-item-icon {
          border-radius: 8px !important;
        }

        .ant-form-item-label > label {
          font-weight: 600;
          color: #262626;
        }

        .ant-input-affix-wrapper,
        .ant-input,
        .ant-select-selector,
        .ant-input-number {
          border-radius: 8px !important;
          border: 1px solid #d9d9d9;
          transition: all 0.3s ease;
        }

        .ant-input-affix-wrapper:hover,
        .ant-input:hover,
        .ant-select-selector:hover,
        .ant-input-number:hover {
          border-color: #40a9ff;
          box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
        }

        .ant-input-affix-wrapper:focus,
        .ant-input:focus,
        .ant-select-focused .ant-select-selector,
        .ant-input-number:focus {
          border-color: #1890ff;
          box-shadow: 0 4px 16px rgba(24, 144, 255, 0.2);
        }

        .ant-upload-list-picture-card .ant-upload-list-item {
          border-radius: 8px;
        }

        .ant-card {
          transition: all 0.3s ease;
        }

        .ant-card:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        }

        .ant-progress-line {
          border-radius: 8px;
        }

        .ant-btn {
          transition: all 0.3s ease;
        }

        .ant-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .ant-steps-item-title {
          font-weight: 600 !important;
        }

        @media (max-width: 768px) {
          .ant-steps {
            margin: 0 -16px;
          }
          
          .ant-form-item {
            margin-bottom: 16px;
          }
        }

        /* Animations personnalisées */
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

        .fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }

        /* Gradient de fond pour les cartes actives */
        .active-section {
          background: linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%);
          border: 2px solid #1890ff;
        }

        /* Style pour les tooltips */
        .ant-tooltip-inner {
          border-radius: 8px;
        }

        /* Style pour les tags de statut */
        .status-tag {
          border-radius: 6px;
          font-weight: 500;
          padding: 4px 12px;
        }
      `}</style>
    </motion.div>
  );
};

export default CompaniesForm;