import React, { useEffect, useState } from 'react';
import { 
  Card, Button, Typography, Row, Col, Alert, Spin, Modal, Input, 
  Space, Divider, Steps, QRCode, message, Grid
} from 'antd';
import { 
  SecurityScanOutlined, QrcodeOutlined, KeyOutlined, 
  SafetyOutlined, CloseOutlined, CheckCircleOutlined,
  CopyOutlined, MobileOutlined, ArrowLeftOutlined, LockOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../components/chart/configs/axiosConfig';
import Verify2FA from './Verify2FA';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { useBreakpoint } = Grid;

export default function Setup2FA() {
  const [qr, setQr] = useState(null);
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alreadyEnabled, setAlreadyEnabled] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableError, setDisableError] = useState(null);
  const [disableSuccess, setDisableSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [secretCopied, setSecretCopied] = useState(false);
  const navigate = useNavigate();
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

  useEffect(() => {
    // D'abord, vérifier si le 2FA est déjà activé
    const checkTwoFactorStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Token non disponible. Veuillez vous connecter.');
          setLoading(false);
          return;
        }
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true
        };
        
        const statusResponse = await axios.get('/api/auth/two-factor-status', config);
        
        if (statusResponse.data.enabled) {
          setAlreadyEnabled(true);
          setLoading(false);
          return;
        }
        
        // Continuer avec le chargement normal si 2FA n'est pas activé
        loadQrAndSecret(token, config);
      } catch (err) {
        console.error('Erreur lors de la vérification du statut 2FA :', err);
        setError('Impossible de vérifier le statut 2FA. Veuillez réessayer.');
        setLoading(false);
      }
    };
    
    const loadQrAndSecret = (token, config) => {
      // Vérifier si nous avons déjà chargé le QR code dans cette session
      const cachedQr = sessionStorage.getItem('temp_2fa_qr');
      const cachedSecret = sessionStorage.getItem('temp_2fa_secret');
      
      if (cachedQr && cachedSecret) {
        // Utiliser le QR code et le secret en cache
        setQr(cachedQr);
        setSecret(cachedSecret);
        setCurrentStep(1);
        setLoading(false);
        return;
      }
      
      // Sinon, charger depuis le serveur
      axios
        .post('/api/auth/enable2fa', {}, config)
        .then((res) => {
          if (res.data && res.data.qr && res.data.secret) {
            // Stocker dans l'état et dans sessionStorage
            setQr(res.data.qr);
            setSecret(res.data.secret);
            sessionStorage.setItem('temp_2fa_qr', res.data.qr);
            sessionStorage.setItem('temp_2fa_secret', res.data.secret);
            setCurrentStep(1);
          } else {
            setError('Réponse incomplète du serveur');
          }
        })
        .catch((err) => {
          console.error('Erreur lors de la récupération du QR code :', err);
          setError('Impossible de configurer 2FA. Veuillez réessayer.');
        })
        .finally(() => {
          setLoading(false);
        });
    };
    
    checkTwoFactorStatus();
  }, []);

  const handleDisable2FA = async () => {
    setDisableLoading(true);
    setDisableError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setDisableError('Token non disponible. Veuillez vous reconnecter.');
        setDisableLoading(false);
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true
      };
      
      await axios.post('/api/auth/disable2fa', { password }, config);
      
      setDisableSuccess(true);
      setShowPasswordModal(false);
      message.success('Authentification à deux facteurs désactivée avec succès');
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de la désactivation du 2FA:', err);
      
      if (err.response && err.response.data && err.response.data.message) {
        setDisableError(err.response.data.message);
      } else {
        setDisableError('Une erreur est survenue lors de la désactivation du 2FA.');
      }
    } finally {
      setDisableLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setSecretCopied(true);
    message.success('Clé secrète copiée dans le presse-papiers');
    setTimeout(() => setSecretCopied(false), 2000);
  };

  const steps = [
    {
      title: 'Installation',
      description: 'Installez une application d\'authentification',
      icon: <MobileOutlined />
    },
    {
      title: 'Configuration',
      description: 'Scannez le QR code ou entrez la clé',
      icon: <QrcodeOutlined />
    },
    {
      title: 'Vérification',
      description: 'Entrez le code généré par l\'application',
      icon: <SecurityScanOutlined />
    }
  ];

  return (
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
              <SafetyOutlined style={{ marginRight: '16px' }} />
              Authentification 2FA
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: '8px 0 0 0' }}>
              Sécurisez votre compte avec l'authentification à deux facteurs
            </Paragraph>
          </motion.div>
        </div>
      </motion.div>

      <Row justify="center" style={{ marginTop: '32px' }}>
        <Col xs={24} sm={20} md={18} lg={16} xl={14}>
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Bouton retour */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              style={{ marginBottom: '24px' }}
            >
              
            </motion.div>

            {loading && (
              <Card
                className="modern-card"
                style={{
                  borderRadius: '16px',
                  border: '1px solid #f0f0f0',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  textAlign: 'center'
                }}
                bodyStyle={{ padding: '60px 40px' }}
              >
                <Spin size="large" />
                <Title level={4} style={{ marginTop: '20px', color: '#666' }}>
                  Configuration de l'authentification 2FA...
                </Title>
                <Text type="secondary">Veuillez patienter</Text>
              </Card>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Alert
                  message="Erreur de configuration"
                  description={error}
                  type="error"
                  showIcon
                  style={{
                    borderRadius: '12px',
                    marginBottom: '24px'
                  }}
                />
              </motion.div>
            )}

            {alreadyEnabled && (
              <Card
                className="modern-card"
                style={{
                  borderRadius: '16px',
                  border: '1px solid #f0f0f0',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}
                bodyStyle={{ padding: '40px' }}
              >
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                      boxShadow: '0 8px 32px rgba(82, 196, 26, 0.3)'
                    }}
                  >
                    <CheckCircleOutlined style={{ fontSize: '32px', color: 'white' }} />
                  </motion.div>

                  <Title level={3} style={{ margin: '0 0 8px 0', color: '#52c41a' }}>
                    2FA Activée
                  </Title>
                  <Text type="secondary">
                    L'authentification à deux facteurs est déjà configurée pour votre compte
                  </Text>
                </div>

                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Alert
                    message="Compte sécurisé"
                    description="Votre compte bénéficie d'une protection renforcée grâce à l'authentification à deux facteurs."
                    type="success"
                    showIcon
                    style={{ borderRadius: '8px' }}
                  />

                  <div style={{ textAlign: 'center' }}>
                    <Space wrap size="large">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          type="primary" 
                          size="large"
                          onClick={() => navigate('/profile')}
                          style={{
                            borderRadius: '8px',
                            height: '40px',
                            fontWeight: 600
                          }}
                        >
                          Retour au profil
                        </Button>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          danger
                          size="large"
                          onClick={() => setShowPasswordModal(true)}
                          style={{
                            borderRadius: '8px',
                            height: '40px',
                            fontWeight: 600
                          }}
                        >
                          Désactiver le 2FA
                        </Button>
                      </motion.div>
                    </Space>
                  </div>
                </Space>

                {disableSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginTop: '20px' }}
                  >
                    <Alert
                      message="2FA désactivée avec succès"
                      description="Redirection en cours..."
                      type="success"
                      showIcon
                      style={{ borderRadius: '8px' }}
                    />
                  </motion.div>
                )}
              </Card>
            )}

            {!alreadyEnabled && !loading && (qr || secret) && (
              <Card
                className="modern-card"
                style={{
                  borderRadius: '16px',
                  border: '1px solid #f0f0f0',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}
                bodyStyle={{ padding: '40px' }}
              >
                {/* En-tête de la carte */}
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
                    <SafetyOutlined style={{ fontSize: '32px', color: 'white' }} />
                  </motion.div>

                  <Title level={3} style={{ margin: '0 0 8px 0' }}>
                    Configuration de l'authentification 2FA
                  </Title>
                  <Text type="secondary">
                    Suivez les étapes ci-dessous pour sécuriser votre compte
                  </Text>
                </div>

                {/* Étapes */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  style={{ marginBottom: '32px' }}
                >
                  <Steps 
                    current={currentStep} 
                    size="small"
                    direction={screens.xs ? 'vertical' : 'horizontal'}
                  >
                    {steps.map((step, index) => (
                      <Step
                        key={index}
                        title={step.title}
                        description={step.description}
                        icon={step.icon}
                      />
                    ))}
                  </Steps>
                </motion.div>

                <Divider />

                {/* Contenu selon l'étape */}
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <Row gutter={[32, 32]}>
                        {/* QR Code */}
                        <Col xs={24} md={12}>
                          <Card
                            title={
                              <Space>
                                <QrcodeOutlined style={{ color: '#1890ff' }} />
                                <span>Scanner le QR Code</span>
                              </Space>
                            }
                            style={{ height: '100%', borderRadius: '12px' }}
                            bodyStyle={{ textAlign: 'center' }}
                          >
                            {qr && (
                              <div style={{ 
                                padding: '20px',
                                background: 'white',
                                borderRadius: '8px',
                                display: 'inline-block',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                              }}>
                                <img 
                                  src={qr} 
                                  alt="QR Code 2FA" 
                                  style={{ 
                                    width: '200px', 
                                    height: '200px',
                                    borderRadius: '4px'
                                  }} 
                                />
                              </div>
                            )}
                            <Paragraph style={{ marginTop: '16px', color: '#666' }}>
                              Utilisez votre application d'authentification pour scanner ce code
                            </Paragraph>
                          </Card>
                        </Col>

                        {/* Clé manuelle */}
                        <Col xs={24} md={12}>
                          <Card
                            title={
                              <Space>
                                <KeyOutlined style={{ color: '#52c41a' }} />
                                <span>Clé manuelle</span>
                              </Space>
                            }
                            style={{ height: '100%', borderRadius: '12px' }}
                          >
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                              <div>
                                <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                                  Clé secrète :
                                </Text>
                                <div style={{
                                  background: '#f5f5f5',
                                  padding: '12px',
                                  borderRadius: '6px',
                                  wordBreak: 'break-all',
                                  fontFamily: 'monospace',
                                  fontSize: '14px',
                                  border: '1px solid #d9d9d9'
                                }}>
                                  {secret}
                                </div>
                                <Button
                                  type="link"
                                  icon={<CopyOutlined />}
                                  onClick={copySecret}
                                  style={{ 
                                    padding: '4px 0',
                                    height: 'auto',
                                    marginTop: '8px',
                                    color: secretCopied ? '#52c41a' : '#1890ff'
                                  }}
                                >
                                  {secretCopied ? 'Copié !' : 'Copier la clé'}
                                </Button>
                              </div>

                              <Alert
                                message="Information"
                                description="Si vous ne pouvez pas scanner le QR code, entrez cette clé manuellement dans votre application."
                                type="info"
                                showIcon
                                style={{ borderRadius: '6px' }}
                              />
                            </Space>
                          </Card>
                        </Col>
                      </Row>

                      <div style={{ textAlign: 'center', marginTop: '32px' }}>
                        <Button 
                          type="primary" 
                          size="large"
                          onClick={() => setCurrentStep(2)}
                          style={{
                            borderRadius: '8px',
                            height: '44px',
                            fontWeight: 600,
                            minWidth: '160px'
                          }}
                        >
                          Continuer
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <Title level={4}>Vérification du code</Title>
                        <Text type="secondary">
                          Entrez le code à 6 chiffres généré par votre application d'authentification
                        </Text>
                      </div>

                      <Verify2FA 
                        secret={secret} 
                        onSuccess={() => {
                          sessionStorage.removeItem('temp_2fa_qr');
                          sessionStorage.removeItem('temp_2fa_secret');
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Applications recommandées */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  style={{ marginTop: '32px' }}
                >
                  <Card
                    size="small"
                    title="Applications recommandées"
                    style={{ 
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #f0f2ff 0%, #f8f9ff 100%)',
                      border: '1px solid #e6f0ff'
                    }}
                    bodyStyle={{ padding: '16px' }}
                  >
                    <Space wrap>
                      <Text>• Google Authenticator</Text>
                      <Text>• Microsoft Authenticator</Text>
                      <Text>• Authy</Text>
                      <Text>• 1Password</Text>
                    </Space>
                  </Card>
                </motion.div>
              </Card>
            )}
          </motion.div>
        </Col>
      </Row>

      {/* Modal de confirmation pour désactiver 2FA */}
      <Modal
        title={
          <Space>
            <LockOutlined style={{ color: '#ff4d4f' }} />
            <span>Désactiver l'authentification 2FA</span>
          </Space>
        }
        open={showPasswordModal}
        onCancel={() => {
          setShowPasswordModal(false);
          setPassword('');
          setDisableError(null);
        }}
        footer={null}
        width={500}
        centered
        styles={{
          body: { padding: '24px' }
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Alert
            message="Attention"
            description="Désactiver l'authentification à deux facteurs réduira la sécurité de votre compte."
            type="warning"
            showIcon
            style={{ borderRadius: '8px' }}
          />

          <div>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
              Mot de passe de confirmation :
            </Text>
            <Input.Password
              placeholder="Entrez votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </div>

          {disableError && (
            <Alert
              message={disableError}
              type="error"
              showIcon
              style={{ borderRadius: '8px' }}
            />
          )}

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setDisableError(null);
                }}
                disabled={disableLoading}
              >
                Annuler
              </Button>
              <Button
                type="primary"
                danger
                loading={disableLoading}
                disabled={!password}
                onClick={handleDisable2FA}
              >
                Confirmer la désactivation
              </Button>
            </Space>
          </div>
        </Space>
      </Modal>

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

        .modern-card {
          transition: all 0.3s ease;
        }

        .modern-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.15) !important;
        }

        .ant-steps-item-icon {
          border-radius: 8px !important;
        }

        .ant-btn:hover {
          transform: translateY(-1px);
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

          .modern-card .ant-card-body {
            padding: 24px !important;
          }
        }

        @media (max-width: 576px) {
          .header-content h1 {
            font-size: 20px !important;
          }

          .modern-card .ant-card-body {
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

        .ant-card {
          animation: fadeInUp 0.5s ease-out;
        }

        .ant-steps-item {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>
    </motion.div>
  );
}