import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Layout, Form, Input, Button, Typography, Card, Alert, 
  Space, Row, Col, Progress, Grid
} from "antd";
import { 
  LockOutlined, EyeInvisibleOutlined, EyeTwoTone, 
  CheckCircleOutlined, CloseCircleOutlined, SafetyOutlined,
  SecurityScanOutlined, KeyOutlined, ArrowLeftOutlined
} from '@ant-design/icons';
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from 'framer-motion';
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { useBreakpoint } = Grid;

// Composant pour vérifier la force du mot de passe
const PasswordStrengthIndicator = ({ password }) => {
  const [strength, setStrength] = useState(0);
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  useEffect(() => {
    if (!password) {
      setStrength(0);
      setRequirements({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
      });
      return;
    }

    const newRequirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    setRequirements(newRequirements);

    const score = Object.values(newRequirements).filter(Boolean).length;
    setStrength((score / 5) * 100);
  }, [password]);

  const getStrengthColor = () => {
    if (strength < 40) return '#ff4d4f';
    if (strength < 80) return '#faad14';
    return '#52c41a';
  };

  const getStrengthText = () => {
    if (strength < 40) return 'Faible';
    if (strength < 80) return 'Moyen';
    return 'Fort';
  };

  const RequirementItem = ({ met, text }) => (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
        color: met ? '#52c41a' : '#999'
      }}
    >
      {met ? (
        <CheckCircleOutlined style={{ color: '#52c41a' }} />
      ) : (
        <CloseCircleOutlined style={{ color: '#d9d9d9' }} />
      )}
      <span style={{ textDecoration: met ? 'line-through' : 'none' }}>
        {text}
      </span>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {password && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            marginTop: '12px',
            padding: '16px',
            background: '#fafafa',
            borderRadius: '8px',
            border: '1px solid #f0f0f0'
          }}
        >
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <Text strong style={{ fontSize: '12px', color: '#666' }}>
                FORCE DU MOT DE PASSE
              </Text>
              <Text style={{ fontSize: '12px', fontWeight: 600, color: getStrengthColor() }}>
                {getStrengthText()}
              </Text>
            </div>
            <Progress
              percent={strength}
              strokeColor={getStrengthColor()}
              showInfo={false}
              size="small"
              strokeWidth={6}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <RequirementItem met={requirements.length} text="8 caractères min" />
            <RequirementItem met={requirements.uppercase} text="1 majuscule" />
            <RequirementItem met={requirements.lowercase} text="1 minuscule" />
            <RequirementItem met={requirements.number} text="1 chiffre" />
            <RequirementItem met={requirements.special} text="1 caractère spécial" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ResetPassword = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  const email = queryParams.get("email");
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [newPassword, setNewPassword] = useState('');
  const [formError, setFormError] = useState(null);
  const screens = useBreakpoint();

  // Variants d'animation
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4, delay: 0.2, ease: "easeOut" }
    }
  };

  // Vérifier la validité du token au chargement
  useEffect(() => {
    if (!token || !email) {
      setFormError('Lien de réinitialisation invalide ou expiré');
    }
  }, [token, email]);

  const handleResetPassword = async (values) => {
    if (!token || !email) {
      setFormError('Lien de réinitialisation invalide ou expiré');
      return;
    }

    if (values.password !== values.password_confirmation) {
      setFormError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    setFormError(null);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/auth/reset-password", {
        token,
        email,
        password: values.password,
        password_confirmation: values.password_confirmation,
      });

      toast.success(response.data.message || "Mot de passe réinitialisé avec succès.", {
        position: "top-right",
        duration: 5000,
      });

      // Redirection avec délai pour permettre à l'utilisateur de voir le message
      setTimeout(() => {
        navigate("/sign-in");
      }, 2000);

    } catch (error) {
      const errorMessage = error.response?.data?.message || "Une erreur s'est produite lors de la réinitialisation.";
      setFormError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleBackToLogin = () => {
    navigate("/sign-in");
  };

  return (
    <>
      <Toaster />
      <motion.div 
        className="modern-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* En-tête moderne */}
        <motion.div
          className="modern-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            className="header-background"
            animate={{
              backgroundPosition: ['0px 0px', '60px 60px']
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          <div className="header-content">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Title level={1} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
                <SecurityScanOutlined style={{ marginRight: '16px' }} />
                Réinitialisation
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: '8px 0 0 0' }}>
                Créez un nouveau mot de passe sécurisé
              </Paragraph>
            </motion.div>
          </div>
        </motion.div>

        {/* Contenu principal */}
        <Row justify="center" style={{ marginTop: '32px' }}>
          <Col xs={24} sm={20} md={16} lg={12} xl={10}>
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <Card 
                className="reset-password-card-modern"
                style={{
                  borderRadius: '20px',
                  border: '1px solid #f0f0f0',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  overflow: 'hidden'
                }}
                bodyStyle={{ padding: '40px' }}
              >
                {/* Bouton retour */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{ marginBottom: '24px' }}
                >
                  <Button 
                    type="text" 
                    icon={<ArrowLeftOutlined />}
                    onClick={handleBackToLogin}
                    style={{ 
                      color: '#666',
                      padding: '4px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    Retour à la connexion
                  </Button>
                </motion.div>

                {/* Icône et titre de la carte */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    <KeyOutlined style={{ fontSize: '32px', color: 'white' }} />
                  </motion.div>

                  <Title level={3} style={{ margin: '0 0 8px 0', color: '#1a1a1a' }}>
                    Nouveau mot de passe
                  </Title>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    Votre mot de passe doit être fort et unique
                  </Text>
                </div>

                {/* Alertes */}
                <AnimatePresence>
                  {formError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ marginBottom: '24px' }}
                    >
                      <Alert
                        message="Erreur"
                        description={formError}
                        type="error"
                        showIcon
                        style={{
                          borderRadius: '12px',
                          border: '1px solid #ffccc7'
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {(!token || !email) ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Alert
                      message="Lien invalide"
                      description="Ce lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien."
                      type="warning"
                      showIcon
                      style={{
                        borderRadius: '12px',
                        marginBottom: '24px'
                      }}
                    />
                    <Button 
                      type="primary" 
                      block 
                      size="large"
                      onClick={() => navigate("/forgot-password")}
                      style={{
                        height: '56px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: 600
                      }}
                    >
                      Demander un nouveau lien
                    </Button>
                  </motion.div>
                ) : (
                  // Formulaire
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleResetPassword}
                    size="large"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Form.Item
                        name="password"
                        label={
                          <Text strong style={{ color: '#666', fontSize: '13px' }}>
                            NOUVEAU MOT DE PASSE
                          </Text>
                        }
                        rules={[
                          {
                            required: true,
                            message: "Veuillez entrer un nouveau mot de passe.",
                          },
                          {
                            min: 8,
                            message: "Le mot de passe doit contenir au moins 8 caractères.",
                          },
                        ]}
                      >
                        <Input.Password 
                          prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                          placeholder="Entrez votre nouveau mot de passe" 
                          iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                          onChange={handleNewPasswordChange}
                          style={{
                            borderRadius: '12px',
                            border: '2px solid #f0f0f0',
                            fontSize: '14px',
                            padding: '12px 16px'
                          }}
                          className="modern-input"
                        />
                      </Form.Item>

                      {/* Indicateur de force du mot de passe */}
                      <PasswordStrengthIndicator password={newPassword} />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Form.Item
                        name="password_confirmation"
                        label={
                          <Text strong style={{ color: '#666', fontSize: '13px' }}>
                            CONFIRMER LE MOT DE PASSE
                          </Text>
                        }
                        dependencies={['password']}
                        rules={[
                          {
                            required: true,
                            message: "Veuillez confirmer votre mot de passe.",
                          },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                              }
                              return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
                            },
                          }),
                        ]}
                      >
                        <Input.Password 
                          prefix={<CheckCircleOutlined style={{ color: '#bfbfbf' }} />}
                          placeholder="Confirmez votre nouveau mot de passe" 
                          iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                          style={{
                            borderRadius: '12px',
                            border: '2px solid #f0f0f0',
                            fontSize: '14px',
                            padding: '12px 16px'
                          }}
                          className="modern-input"
                        />
                      </Form.Item>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <Form.Item style={{ marginTop: '32px', marginBottom: 0 }}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button 
                            type="primary" 
                            htmlType="submit" 
                            loading={loading}
                            block
                            size="large"
                            style={{
                              height: '56px',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              border: 'none',
                              borderRadius: '12px',
                              fontSize: '16px',
                              fontWeight: 600,
                              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                              transition: 'all 0.3s ease'
                            }}
                            icon={<SecurityScanOutlined />}
                          >
                            {loading ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe'}
                          </Button>
                        </motion.div>
                      </Form.Item>
                    </motion.div>
                  </Form>
                )}

                {/* Conseils de sécurité */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  style={{
                    marginTop: '32px',
                    padding: '20px',
                    background: 'linear-gradient(135deg, #f0f2ff 0%, #f8f9ff 100%)',
                    borderRadius: '12px',
                    border: '1px solid #e6f0ff'
                  }}
                >
                  <Title level={5} style={{ margin: '0 0 12px 0', color: '#1890ff' }}>
                    <SafetyOutlined style={{ marginRight: '8px' }} />
                    Conseils de sécurité
                  </Title>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
                    <li style={{ marginBottom: '4px', fontSize: '13px' }}>
                      Utilisez un mot de passe unique et fort
                    </li>
                    <li style={{ marginBottom: '4px', fontSize: '13px' }}>
                      Combinez lettres, chiffres et caractères spéciaux
                    </li>
                    <li style={{ marginBottom: '4px', fontSize: '13px' }}>
                      Évitez les informations personnelles évidentes
                    </li>
                    <li style={{ fontSize: '13px' }}>
                      Ne partagez jamais votre mot de passe
                    </li>
                  </ul>
                </motion.div>
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* Styles CSS intégrés */}
        <style jsx>{`
          .modern-container {
            padding: 24px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
          }

          .modern-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            padding: 40px;
            margin-bottom: 0;
            color: white;
            position: relative;
            overflow: hidden;
          }

          .header-background {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            opacity: 0.1;
            background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          }

          .header-content {
            position: relative;
            z-index: 1;
            text-align: center;
          }

          .header-content h1 {
            margin: 0 !important;
            font-size: 32px !important;
          }

          .reset-password-card-modern {
            transition: all 0.3s ease;
          }

          .reset-password-card-modern:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 48px rgba(0,0,0,0.15) !important;
          }

          .modern-input {
            transition: all 0.3s ease !important;
          }

          .modern-input:hover {
            border-color: #40a9ff !important;
          }

          .modern-input:focus,
          .modern-input.ant-input-focused {
            border-color: #1890ff !important;
            box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1) !important;
          }

          .ant-form-item-label > label {
            font-weight: 600 !important;
            color: #666 !important;
          }

          .ant-btn-primary:hover {
            background: linear-gradient(135deg, #5a6fd8 0%, #6b4591 100%) !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 6px 28px rgba(102, 126, 234, 0.5) !important;
          }

          /* Responsive */
          @media (max-width: 768px) {
            .modern-container {
              padding: 16px;
            }

            .modern-header {
              padding: 24px;
              border-radius: 16px;
            }

            .header-content h1 {
              font-size: 24px !important;
            }

            .reset-password-card-modern .ant-card-body {
              padding: 24px !important;
            }

            .modern-input {
              padding: 10px 14px !important;
            }
          }

          @media (max-width: 576px) {
            .header-content h1 {
              font-size: 20px !important;
            }

            .reset-password-card-modern .ant-card-body {
              padding: 20px !important;
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

          .ant-form-item {
            animation: fadeInUp 0.5s ease-out;
          }

          .ant-alert {
            animation: fadeInUp 0.3s ease-out;
          }
        `}</style>
      </motion.div>
    </>
  );
};

export default ResetPassword;