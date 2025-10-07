import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Card, Button, Typography, Input, Alert, Space, Progress, 
  Row, Col, Avatar, Grid, Statistic
} from 'antd';
import { 
  SecurityScanOutlined, CheckCircleOutlined, 
  ClockCircleOutlined, WarningOutlined, UserOutlined,
  ArrowLeftOutlined, QuestionCircleOutlined, LockOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../components/chart/configs/axiosConfig';

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const VerifyLogin2FA = () => {
  // États pour gérer le formulaire et les messages
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(300); // 5 minutes en secondes
  const [codeCountdown, setCodeCountdown] = useState(30);
  
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  
  // Récupérer le token temporaire et l'email des paramètres d'URL
  const tempToken = location.state?.tempToken || new URLSearchParams(location.search).get('token');
  const userEmail = location.state?.userEmail || new URLSearchParams(location.search).get('email');
  
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

  // Vérifier si le token est présent
  useEffect(() => {
    if (!tempToken) {
      setError('Token de vérification manquant. Veuillez vous reconnecter.');
      return;
    }
    
    // Démarrer le compte à rebours pour l'expiration du token
    const timer = setInterval(() => {
      setCountdown(prevCountdown => {
        if (prevCountdown <= 1) {
          clearInterval(timer);
          setError('Le token a expiré. Veuillez vous reconnecter.');
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [tempToken]);

  // Compte à rebours pour le code TOTP (30 secondes)
  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      const secondsRemaining = 30 - (currentTime % 30);
      setCodeCountdown(secondsRemaining);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Formater le compte à rebours
  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Soumettre le code 2FA
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation basique
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setError('Le code doit contenir exactement 6 chiffres.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Configurer les en-têtes avec le token temporaire
      const config = {
        headers: {
          'Authorization': `Bearer ${tempToken}`,
          'Content-Type': 'application/json'
        }
      };
      
      // Appeler l'API pour vérifier le code 2FA
      const response = await axios.post('/api/auth/verify-login-2fa', { code: parseInt(code) }, config);
      
      // En cas de succès, stocker le token complet et rediriger
      if (response.data && response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        
        // Stocker les infos utilisateur si disponibles
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        // Rediriger vers le tableau de bord
        navigate('/dashboard');
        localStorage.removeItem("temp_token");
      }
    } catch (err) {
      console.error('Erreur lors de la vérification du code 2FA:', err);
      
      // Gérer différentes erreurs
      if (err.response) {
        if (err.response.status === 401) {
          setError('Code 2FA invalide. Veuillez réessayer.');
        } else if (err.response.status === 403) {
          setError('Token non valide. Veuillez vous reconnecter.');
        } else {
          setError(err.response.data?.message || 'Une erreur est survenue.');
        }
      } else {
        setError('Erreur de connexion. Vérifiez votre connexion internet.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Supprimer le token temporaire et rediriger vers la page de connexion
    localStorage.removeItem('temp_token');
    localStorage.removeItem('user_email');
    navigate('/sign-in');
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Seulement les chiffres
    if (value.length <= 6) {
      setCode(value);
      // Réinitialiser l'erreur quand l'utilisateur tape
      if (error) {
        setError('');
      }
    }
  };

  const getCountdownColor = () => {
    if (codeCountdown <= 5) return '#ff4d4f';
    if (codeCountdown <= 10) return '#faad14';
    return '#52c41a';
  };

  const getProgressColor = () => {
    const percentage = (codeCountdown / 30) * 100;
    if (percentage <= 17) return '#ff4d4f';
    if (percentage <= 33) return '#faad14';
    return '#52c41a';
  };

  const getSessionColor = () => {
    if (countdown <= 60) return '#ff4d4f';
    if (countdown <= 180) return '#faad14';
    return '#52c41a';
  };

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
              <LockOutlined style={{ marginRight: '16px' }} />
              Vérification 2FA
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: '8px 0 0 0' }}>
              Sécurisation de votre connexion en cours
            </Paragraph>
          </motion.div>
        </div>
      </motion.div>

      <Row justify="center" style={{ marginTop: '32px' }}>
        <Col xs={24} sm={20} md={16} lg={12} xl={10}>
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
              <Button 
                type="text" 
                icon={<ArrowLeftOutlined />}
                onClick={handleCancel}
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

            <Card
              className="verify-card-modern"
              style={{
                borderRadius: '20px',
                border: '1px solid #f0f0f0',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                overflow: 'hidden'
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
                  <SecurityScanOutlined style={{ fontSize: '32px', color: 'white' }} />
                </motion.div>

                <Title level={3} style={{ margin: '0 0 8px 0', color: '#1a1a1a' }}>
                  Vérification à deux facteurs
                </Title>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Saisissez le code généré par votre application d'authentification
                </Text>
              </div>

              {/* Informations utilisateur */}
              {userEmail && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  style={{ marginBottom: '24px' }}
                >
                  <Card
                    size="small"
                    style={{
                      background: 'linear-gradient(135deg, #f0f2ff 0%, #f8f9ff 100%)',
                      border: '1px solid #e6f0ff',
                      borderRadius: '12px'
                    }}
                    bodyStyle={{ padding: '16px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Avatar 
                        icon={<UserOutlined />} 
                        style={{ 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          flexShrink: 0
                        }}
                      />
                      <div>
                        <Text style={{ fontSize: '12px', color: '#666', display: 'block' }}>
                          CONNECTÉ EN TANT QUE
                        </Text>
                        <Text strong style={{ fontSize: '14px' }}>
                          {userEmail}
                        </Text>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Statuts des timers */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                style={{ marginBottom: '24px' }}
              >
                <Row gutter={16}>
                  {/* Timer du code */}
                  <Col span={12}>
                    <Card
                      size="small"
                      style={{
                        background: '#fafafa',
                        border: '1px solid #f0f0f0',
                        borderRadius: '8px'
                      }}
                      bodyStyle={{ padding: '12px', textAlign: 'center' }}
                    >
                      <div style={{ marginBottom: '8px' }}>
                        <ClockCircleOutlined style={{ color: getCountdownColor(), fontSize: '16px' }} />
                      </div>
                      <Text style={{ fontSize: '11px', color: '#666', display: 'block' }}>
                        CODE VALIDE
                      </Text>
                      <Text strong style={{ color: getCountdownColor(), fontSize: '14px' }}>
                        {codeCountdown}s
                      </Text>
                      <Progress
                        percent={(codeCountdown / 30) * 100}
                        strokeColor={getProgressColor()}
                        showInfo={false}
                        size="small"
                        strokeWidth={4}
                        style={{ marginTop: '4px' }}
                      />
                    </Card>
                  </Col>

                  {/* Timer de session */}
                  <Col span={12}>
                    <Card
                      size="small"
                      style={{
                        background: '#fafafa',
                        border: '1px solid #f0f0f0',
                        borderRadius: '8px'
                      }}
                      bodyStyle={{ padding: '12px', textAlign: 'center' }}
                    >
                      <div style={{ marginBottom: '8px' }}>
                        <ClockCircleOutlined style={{ color: getSessionColor(), fontSize: '16px' }} />
                      </div>
                      <Text style={{ fontSize: '11px', color: '#666', display: 'block' }}>
                        SESSION EXPIRE
                      </Text>
                      <Text strong style={{ color: getSessionColor(), fontSize: '14px' }}>
                        {formatCountdown()}
                      </Text>
                    </Card>
                  </Col>
                </Row>
              </motion.div>

              {/* Messages d'erreur */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ marginBottom: '24px' }}
                  >
                    <Alert
                      message="Erreur de vérification"
                      description={error}
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

              {/* Formulaire */}
              <form onSubmit={handleSubmit}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div>
                      <Text strong style={{ display: 'block', marginBottom: '8px', color: '#666', fontSize: '13px' }}>
                        CODE D'AUTHENTIFICATION
                      </Text>
                      <Input
                        size="large"
                        placeholder="000000"
                        value={code}
                        onChange={handleCodeChange}
                        maxLength={6}
                        disabled={loading || countdown === 0}
                        autoFocus
                        style={{
                          borderRadius: '12px',
                          border: '2px solid #f0f0f0',
                          fontSize: '18px',
                          fontWeight: 600,
                          textAlign: 'center',
                          letterSpacing: '4px',
                          fontFamily: 'monospace',
                          padding: '12px 16px'
                        }}
                        className="code-input-modern"
                      />
                      <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                        Entrez les 6 chiffres de votre application
                      </Text>
                    </div>

                    {/* Boutons */}
                    <Row gutter={12}>
                      <Col span={12}>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button 
                            onClick={handleCancel}
                            disabled={loading}
                            block
                            size="large"
                            style={{
                              height: '48px',
                              borderRadius: '12px',
                              fontWeight: 600,
                              border: '2px solid #f0f0f0'
                            }}
                          >
                            Annuler
                          </Button>
                        </motion.div>
                      </Col>
                      <Col span={12}>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button 
                            type="primary" 
                            htmlType="submit"
                            loading={loading}
                            disabled={code.length !== 6 || countdown === 0}
                            block
                            size="large"
                            style={{
                              height: '48px',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              border: 'none',
                              borderRadius: '12px',
                              fontWeight: 600,
                              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                              transition: 'all 0.3s ease'
                            }}
                            icon={<SecurityScanOutlined />}
                          >
                            {loading ? 'Vérification...' : 'Vérifier'}
                          </Button>
                        </motion.div>
                      </Col>
                    </Row>
                  </Space>
                </motion.div>
              </form>

              {/* Aide */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                style={{ marginTop: '32px', textAlign: 'center' }}
              >
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
                    <QuestionCircleOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                    <Text style={{ fontSize: '13px', color: '#666' }}>
                      Vous n'avez pas accès à votre application?
                    </Text>
                    <Button 
                      type="link"
                      size="small"
                      onClick={() => navigate('/help-2fa')}
                      style={{ padding: 0, height: 'auto', fontSize: '13px' }}
                    >
                      Obtenir de l'aide
                    </Button>
                  </Space>
                </Card>
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

        .verify-card-modern {
          transition: all 0.3s ease;
        }

        .verify-card-modern:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 48px rgba(0,0,0,0.15) !important;
        }

        .code-input-modern {
          transition: all 0.3s ease !important;
        }

        .code-input-modern:hover {
          border-color: #40a9ff !important;
        }

        .code-input-modern:focus,
        .code-input-modern.ant-input-focused {
          border-color: #1890ff !important;
          box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1) !important;
        }

        .ant-btn-primary:hover {
          background: linear-gradient(135deg, #5a6fd8 0%, #6b4591 100%) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 6px 28px rgba(102, 126, 234, 0.5) !important;
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

          .verify-card-modern .ant-card-body {
            padding: 24px !important;
          }

          .code-input-modern {
            font-size: 16px !important;
            letter-spacing: 2px !important;
          }
        }

        @media (max-width: 576px) {
          .header-content h1 {
            font-size: 20px !important;
          }

          .verify-card-modern .ant-card-body {
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

        .ant-alert {
          animation: fadeInUp 0.3s ease-out;
        }

        /* Animation pour le focus sur l'input */
        .code-input-modern:focus {
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
      `}</style>
    </motion.div>
  );
};

export default VerifyLogin2FA;