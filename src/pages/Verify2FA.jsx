import React, { useState, useEffect } from 'react';
import { 
  Card, Button, Typography, Input, Alert, Space, Progress, 
  Row, Col, Statistic, Grid
} from 'antd';
import { 
  SecurityScanOutlined, CheckCircleOutlined, 
  ClockCircleOutlined, WarningOutlined, ReloadOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../components/chart/configs/axiosConfig';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function Verify2FA({ secret, onSuccess }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(30);
  const screens = useBreakpoint();
  
  // Variants d'animation
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3, delay: 0.2 }
    },
    focus: {
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  // Compte à rebours pour le code TOTP
  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      const secondsRemaining = 30 - (currentTime % 30);
      setCountdown(secondsRemaining);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérifier que le code n'est pas vide
    if (!code.trim()) {
      setStatus('error');
      setErrorMessage('Veuillez entrer un code à 6 chiffres.');
      return;
    }

    if (code.length !== 6) {
      setStatus('error');
      setErrorMessage('Le code doit contenir exactement 6 chiffres.');
      return;
    }
    
    try {
      setLoading(true);
      setStatus(null);
      setErrorMessage('');
      
      // Récupérer le token d'authentification
      const token = localStorage.getItem('token');
      
      if (!token) {
        setErrorMessage('Token non disponible. Veuillez vous connecter.');
        setStatus('error');
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true
      };
      
      console.log('Données envoyées:', { 
        code: parseInt(code),
        timestamp: Math.floor(Date.now() / 1000)
      });
      
      const res = await axios.post(
        '/api/auth/verify2fa',
        { code: parseInt(code) },
        config
      );
      
      // Si on arrive ici, c'est un succès
      setStatus('success');
      localStorage.removeItem('temp_2fa_secret');
      
      // Appeler la fonction de succès après un délai
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
      
    } catch (error) {
      if (error.response) {
        // Erreur de réponse du serveur
        console.error("Détails de l'erreur:", error.response.data);
        
        if (error.response.status === 401) {
          // Code 2FA invalide - comportement normal pour un code incorrect
          setStatus('invalid-code');
          setErrorMessage('Code incorrect. Veuillez réessayer.');
        } else {
          // Autres erreurs serveur
          setStatus('error');
          setErrorMessage(error.response.data.message || 'Une erreur est survenue');
        }
      } else {
        // Erreur de réseau ou autres
        setStatus('error');
        setErrorMessage('Problème de connexion au serveur.');
        console.error('Erreur lors de la vérification 2FA:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Seulement les chiffres
    if (value.length <= 6) {
      setCode(value);
      // Réinitialiser le statut d'erreur quand l'utilisateur tape
      if (status === 'error' || status === 'invalid-code') {
        setStatus(null);
        setErrorMessage('');
      }
    }
  };

  const getCountdownColor = () => {
    if (countdown <= 5) return '#ff4d4f';
    if (countdown <= 10) return '#faad14';
    return '#52c41a';
  };

  const getProgressColor = () => {
    const percentage = (countdown / 30) * 100;
    if (percentage <= 17) return '#ff4d4f';
    if (percentage <= 33) return '#faad14';
    return '#52c41a';
  };

  return (
    <motion.div 
      className="verify-2fa-modern"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card
        className="verify-card-modern"
        style={{
          borderRadius: '16px',
          border: '1px solid #f0f0f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          maxWidth: '500px',
          margin: '0 auto'
        }}
        bodyStyle={{ padding: '32px' }}
      >
        {/* En-tête */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '15px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
            }}
          >
            <SecurityScanOutlined style={{ fontSize: '24px', color: 'white' }} />
          </motion.div>

          <Title level={4} style={{ margin: '0 0 8px 0', color: '#1a1a1a' }}>
            Vérification du code
          </Title>
          <Text type="secondary">
            Entrez le code à 6 chiffres de votre application d'authentification
          </Text>
        </div>

        {/* Compte à rebours */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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
            <Row align="middle" gutter={16}>
              <Col flex="auto">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClockCircleOutlined style={{ color: getCountdownColor() }} />
                  <Text style={{ fontSize: '13px', color: '#666' }}>
                    Code valide pendant
                  </Text>
                  <Text strong style={{ color: getCountdownColor(), fontSize: '14px' }}>
                    {countdown}s
                  </Text>
                </div>
              </Col>
              <Col flex="100px">
                <Progress
                  percent={(countdown / 30) * 100}
                  strokeColor={getProgressColor()}
                  showInfo={false}
                  size="small"
                  strokeWidth={6}
                />
              </Col>
            </Row>
          </Card>
        </motion.div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          <motion.div
            variants={inputVariants}
            initial="hidden"
            animate="visible"
            whileFocus="focus"
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text strong style={{ display: 'block', marginBottom: '8px', color: '#666' }}>
                  CODE D'AUTHENTIFICATION
                </Text>
                <Input
                  size="large"
                  placeholder="000000"
                  value={code}
                  onChange={handleCodeChange}
                  maxLength={6}
                  style={{
                    borderRadius: '12px',
                    border: '2px solid #f0f0f0',
                    fontSize: '18px',
                    fontWeight: 600,
                    textAlign: 'center',
                    letterSpacing: '4px',
                    fontFamily: 'monospace'
                  }}
                  className="code-input-modern"
                  disabled={loading || status === 'success'}
                  autoComplete="off"
                />
                <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                  Entrez les 6 chiffres affichés dans votre application
                </Text>
              </div>

              {/* Messages de statut */}
              <AnimatePresence>
                {status === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Alert
                      message="Succès"
                      description="Authentification à deux facteurs activée avec succès !"
                      type="success"
                      icon={<CheckCircleOutlined />}
                      showIcon
                      style={{
                        borderRadius: '12px',
                        border: '1px solid #b7eb8f'
                      }}
                    />
                  </motion.div>
                )}

                {status === 'invalid-code' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Alert
                      message="Code incorrect"
                      description="Vérifiez votre application d'authentification et réessayez."
                      type="warning"
                      icon={<WarningOutlined />}
                      showIcon
                      style={{
                        borderRadius: '12px',
                        border: '1px solid #ffe58f'
                      }}
                    />
                  </motion.div>
                )}

                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Alert
                      message="Erreur"
                      description={errorMessage || 'Une erreur est survenue. Veuillez réessayer.'}
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

              {/* Bouton de soumission */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  disabled={code.length !== 6 || status === 'success'}
                  block
                  size="large"
                  style={{
                    height: '48px',
                    background: status === 'success' 
                      ? 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 600,
                    boxShadow: status === 'success'
                      ? '0 4px 20px rgba(82, 196, 26, 0.4)'
                      : '0 4px 20px rgba(102, 126, 234, 0.4)',
                    transition: 'all 0.3s ease'
                  }}
                  icon={status === 'success' ? <CheckCircleOutlined /> : <SecurityScanOutlined />}
                >
                  {loading 
                    ? 'Vérification en cours...' 
                    : status === 'success' 
                      ? 'Activé avec succès !' 
                      : 'Vérifier le code'
                  }
                </Button>
              </motion.div>
            </Space>
          </motion.div>
        </form>

        {/* Conseils */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ marginTop: '24px' }}
        >
          <Card
            size="small"
            style={{
              background: '#f9f9f9',
              border: '1px solid #f0f0f0',
              borderRadius: '8px'
            }}
            bodyStyle={{ padding: '12px' }}
          >
            <Space direction="vertical" size="small">
              <Text strong style={{ fontSize: '12px', color: '#666' }}>
                CONSEILS :
              </Text>
              <ul style={{ margin: 0, paddingLeft: '16px', color: '#666', fontSize: '12px' }}>
                <li>Le code change toutes les 30 secondes</li>
                <li>Assurez-vous que l'heure de votre appareil est correcte</li>
                <li>En cas de problème, attendez le prochain code</li>
              </ul>
            </Space>
          </Card>
        </motion.div>
      </Card>

      {/* Styles CSS intégrés */}
      <style jsx>{`
        .verify-2fa-modern {
          padding: 16px;
        }

        .verify-card-modern {
          transition: all 0.3s ease;
        }

        .verify-card-modern:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.15) !important;
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
          transform: translateY(-1px) !important;
        }

        .ant-btn-primary:disabled {
          background: #f5f5f5 !important;
          border-color: #d9d9d9 !important;
          color: #00000040 !important;
          transform: none !important;
          box-shadow: none !important;
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

        /* Responsive */
        @media (max-width: 576px) {
          .verify-2fa-modern {
            padding: 8px;
          }

          .verify-card-modern .ant-card-body {
            padding: 24px !important;
          }

          .code-input-modern {
            font-size: 16px !important;
            letter-spacing: 2px !important;
          }
        }

        /* Animation de succès */
        .ant-alert-success {
          animation: successPulse 0.5s ease-out;
        }

        @keyframes successPulse {
          0% {
            transform: scale(0.95);
            opacity: 0;
          }
          50% {
            transform: scale(1.02);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </motion.div>
  );
}