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
  Progress,
  Statistic,
  Grid
} from "antd";
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  UploadOutlined,
  EditOutlined,
  SettingOutlined,
  MessageOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  LinkOutlined,
  BellOutlined,
  NotificationOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  StarOutlined,
  HeartOutlined,
  EyeOutlined,
  ShareAltOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// Images imports
import BgProfile from "../assets/images/bg-profile.jpg";
import profilavatar from "../assets/images/face-1.jpg";
import convesionImg from "../assets/images/face-3.jpg";
import convesionImg2 from "../assets/images/face-4.jpg";
import convesionImg3 from "../assets/images/face-5.jpeg";
import convesionImg4 from "../assets/images/face-6.jpeg";
import convesionImg5 from "../assets/images/face-2.jpg";
import project1 from "../assets/images/home-decor-1.jpeg";
import project2 from "../assets/images/home-decor-2.jpeg";
import project3 from "../assets/images/home-decor-3.jpeg";

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

// Composant de statistique animée
const AnimatedStatCard = ({ icon, title, value, color, loading, delay = 0, suffix = '', onClick }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!loading && value > 0) {
      const duration = 1500;
      const steps = 30;
      const increment = value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [value, loading]);

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        delay: delay * 0.1,
        ease: "easeOut"
      }
    },
    hover: {
      y: -4,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      style={{ height: '100%' }}
    >
      <Card 
        className="stat-card-modern"
        onClick={onClick}
        style={{
          height: '100%',
          background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`,
          border: `1px solid ${color}30`,
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative',
          cursor: onClick ? 'pointer' : 'default'
        }}
        bodyStyle={{ padding: '20px', textAlign: 'center' }}
      >
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '18px',
          margin: '0 auto 12px',
          boxShadow: `0 4px 16px ${color}40`
        }}>
          {icon}
        </div>
        
        <Text type="secondary" style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', display: 'block' }}>
          {title}
        </Text>
        
        <Title level={4} style={{ 
          margin: '4px 0 0 0', 
          color: color,
          fontWeight: 700,
          fontSize: '18px'
        }}>
          <motion.span
            key={displayValue}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {displayValue}{suffix}
          </motion.span>
        </Title>
      </Card>
    </motion.div>
  );
};

function Profile() {
  const navigate = useNavigate();
  const [imageURL, setImageURL] = useState(false);
  const [, setLoading] = useState(false);
  const { t } = useTranslation();
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

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("Vous ne pouvez télécharger que des fichiers JPG/PNG!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("L'image doit être inférieure à 2MB!");
    }
    return isJpgOrPng && isLt2M;
  };

  const handleChange = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      getBase64(info.file.originFileObj, (imageUrl) => {
        setLoading(false);
        setImageURL(imageUrl);
      });
    }
  };

  // Données de démonstration
  const profileStats = {
    followers: 2845,
    following: 126,
    posts: 89,
    likes: 15420
  };

  const conversationsData = [
    {
      title: "Sophie B.",
      avatar: convesionImg,
      description: "Salut! J'ai besoin de plus d'informations…",
      time: "Il y a 2min",
      unread: true
    },
    {
      title: "Anne Marie",
      avatar: convesionImg2,
      description: "Excellent travail, pouvez-vous…",
      time: "Il y a 5min",
      unread: true
    },
    {
      title: "Ivan",
      avatar: convesionImg3,
      description: "À propos des fichiers je peux…",
      time: "Il y a 1h",
      unread: false
    },
    {
      title: "Peterson",
      avatar: convesionImg4,
      description: "Passez un excellent après-midi…",
      time: "Il y a 2h",
      unread: false
    },
    {
      title: "Nick Daniel",
      avatar: convesionImg5,
      description: "Salut! J'ai besoin de plus d'informations…",
      time: "Il y a 1j",
      unread: false
    },
  ];

  const projectsData = [
    {
      img: project1,
      title: "Projet Moderne",
      subtitle: "Design d'intérieur",
      description: "Alors qu'Uber traverse une énorme quantité de troubles de gestion internes.",
      tags: ['Design', 'Moderne'],
      progress: 85,
      likes: 245,
      views: 1250
    },
    {
      img: project2,
      title: "Style Scandinave",
      subtitle: "Architecture",
      description: "La musique est quelque chose sur lequel chaque personne a sa propre opinion spécifique.",
      tags: ['Architecture', 'Scandinave'],
      progress: 92,
      likes: 189,
      views: 890
    },
    {
      img: project3,
      title: "Minimaliste",
      subtitle: "Décoration",
      description: "Différentes personnes ont des goûts différents, et divers types de musique, Zimbali Resort.",
      tags: ['Décoration', 'Minimaliste'],
      progress: 67,
      likes: 156,
      views: 674
    },
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
        variants={headerVariants}
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
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Row justify="space-between" align="middle" gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  style={{ position: 'relative' }}
                >
                  <Avatar 
                    size={screens.xs ? 80 : 100} 
                    src={profilavatar}
                    style={{
                      border: '4px solid white',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                    }}
                  />
                  <Badge 
                    status="success" 
                    style={{ 
                      position: 'absolute', 
                      bottom: '8px', 
                      right: '8px',
                      transform: 'scale(1.2)'
                    }} 
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Title level={screens.xs ? 3 : 2} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
                    Sarah Jacob
                  </Title>
                  <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', display: 'block', marginBottom: '8px' }}>
                    CEO / Co-Fondatrice
                  </Text>
                  <Space wrap>
                    <Tag color="rgba(255,255,255,0.2)" style={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                      Leadership
                    </Tag>
                    <Tag color="rgba(255,255,255,0.2)" style={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                      Innovation
                    </Tag>
                    <Tag color="rgba(255,255,255,0.2)" style={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                      Design
                    </Tag>
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
                    <Button 
                      size="large"
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        color: 'white',
                        borderRadius: '12px',
                        fontWeight: 600
                      }}
                      icon={<MessageOutlined />}
                    >
                      Message
                    </Button>
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

      {/* Statistiques */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={12} sm={6}>
          <AnimatedStatCard
            icon={<UserOutlined />}
            title="Abonnés"
            value={profileStats.followers}
            color="#1890ff"
            delay={0}
          />
        </Col>
        <Col xs={12} sm={6}>
          <AnimatedStatCard
            icon={<HeartOutlined />}
            title="Abonnements"
            value={profileStats.following}
            color="#52c41a"
            delay={1}
          />
        </Col>
        <Col xs={12} sm={6}>
          <AnimatedStatCard
            icon={<StarOutlined />}
            title="Publications"
            value={profileStats.posts}
            color="#722ed1"
            delay={2}
          />
        </Col>
        <Col xs={12} sm={6}>
          <AnimatedStatCard
            icon={<HeartOutlined />}
            title="J'aime"
            value={profileStats.likes}
            color="#fa8c16"
            delay={3}
          />
        </Col>
      </Row>

      {/* Contenu principal */}
      <Row gutter={[24, 24]}>
        {/* Paramètres de plateforme */}
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
                    <SettingOutlined />
                  </div>
                  <Title level={5} style={{ margin: 0 }}>Paramètres de la plateforme</Title>
                </div>
              }
            >
              <div className="settings-list">
                <div style={{ marginBottom: '20px' }}>
                  <Text strong style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>
                    COMPTE
                  </Text>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Text>M'envoyer un email quand quelqu'un me suit</Text>
                  <Switch defaultChecked size="small" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Text>M'envoyer un email pour les réponses</Text>
                  <Switch size="small" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Text>M'envoyer un email pour les mentions</Text>
                  <Switch defaultChecked size="small" />
                </motion.div>

                <Divider />

                <div style={{ marginBottom: '20px' }}>
                  <Text strong style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>
                    APPLICATION
                  </Text>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Text>Nouveaux lancements et projets</Text>
                  <Switch defaultChecked size="small" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Text>Mises à jour mensuelles des produits</Text>
                  <Switch defaultChecked size="small" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Text>S'abonner à la newsletter</Text>
                  <Switch defaultChecked size="small" />
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </Col>

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
                    <Title level={5} style={{ margin: 0 }}>{t("ProfileInfo")}</Title>
                  </div>
                  <Tooltip title="Modifier le profil">
                    <Button type="text" icon={<EditOutlined />} size="small" />
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
                  Salut, je suis Sarah Jacob, PDG et co-fondatrice. Si vous ne pouvez pas décider, 
                  la réponse est non. Si deux chemins également difficiles, choisissez celui qui 
                  est le plus douloureux à court terme.
                </Paragraph>
              </motion.div>

              <Divider />

              <Descriptions column={1} size="small">
                <Descriptions.Item 
                  label={
                    <Text strong style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <UserOutlined style={{ color: '#1890ff' }} />
                      {t("FullName")}
                    </Text>
                  }
                >
                  Sarah Emily Jacob
                </Descriptions.Item>
                
                <Descriptions.Item 
                  label={
                    <Text strong style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <PhoneOutlined style={{ color: '#52c41a' }} />
                      {t("Mobile")}
                    </Text>
                  }
                >
                  (44) 123 1234 123
                </Descriptions.Item>
                
                <Descriptions.Item 
                  label={
                    <Text strong style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MailOutlined style={{ color: '#fa8c16' }} />
                      {t("Email")}
                    </Text>
                  }
                >
                  sarahjacob@mail.com
                </Descriptions.Item>
                
                <Descriptions.Item 
                  label={
                    <Text strong style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <EnvironmentOutlined style={{ color: '#722ed1' }} />
                      {t("Location")}
                    </Text>
                  }
                >
                  États-Unis
                </Descriptions.Item>
                
                <Descriptions.Item 
                  label={
                    <Text strong style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <LinkOutlined style={{ color: '#13c2c2' }} />
                      {t("Social")}
                    </Text>
                  }
                >
                  <Space>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button 
                        type="text" 
                        icon={<TwitterOutlined style={{ color: '#1DA1F2' }} />} 
                        size="small"
                        style={{ padding: '4px' }}
                      />
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button 
                        type="text" 
                        icon={<FacebookOutlined style={{ color: '#1877F2' }} />} 
                        size="small"
                        style={{ padding: '4px' }}
                      />
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button 
                        type="text" 
                        icon={<InstagramOutlined style={{ color: '#E4405F' }} />} 
                        size="small"
                        style={{ padding: '4px' }}
                      />
                    </motion.div>
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </motion.div>
        </Col>

        {/* Conversations */}
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
                    background: 'linear-gradient(135deg, #fa8c16 0%, #ffa940 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <MessageOutlined />
                  </div>
                  <Title level={5} style={{ margin: 0 }}>Conversations</Title>
                </div>
              }
            >
              <List
                itemLayout="horizontal"
                dataSource={conversationsData}
                split={false}
                renderItem={(item, index) => (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <List.Item 
                      style={{ 
                        padding: '12px 0',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease'
                      }}
                      className="conversation-item"
                      actions={[
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button type="link" size="small" style={{ color: '#1890ff', fontWeight: 500 }}>
                            RÉPONDRE
                          </Button>
                        </motion.div>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Badge dot={item.unread} color="#52c41a">
                            <Avatar size={40} src={item.avatar} />
                          </Badge>
                        }
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong style={{ fontSize: '14px' }}>{item.title}</Text>
                            <Text type="secondary" style={{ fontSize: '11px' }}>{item.time}</Text>
                          </div>
                        }
                        description={
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {item.description}
                          </Text>
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

      {/* Section Projets */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        style={{ marginTop: '32px' }}
      >
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <Title level={3} style={{ margin: '0 0 8px 0' }}>Mes Projets</Title>
          <Text type="secondary">Découvrez mes dernières créations et réalisations</Text>
        </div>

        <Row gutter={[24, 24]}>
          {projectsData.map((project, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -4 }}
              >
                <Card
                  className="project-card-modern"
                  style={{
                    borderRadius: '16px',
                    border: '1px solid #f0f0f0',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}
                  bodyStyle={{ padding: 0 }}
                  cover={
                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                      <img 
                        alt={project.title} 
                        src={project.img}
                        style={{ 
                          width: '100%', 
                          height: '200px', 
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease'
                        }}
                        className="project-image"
                      />
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        display: 'flex',
                        gap: '8px'
                      }}>
                        {project.tags.map((tag, tagIndex) => (
                          <Tag key={tagIndex} color="rgba(255,255,255,0.9)" style={{ color: '#1890ff', fontWeight: 500 }}>
                            {tag}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  }
                >
                  <div style={{ padding: '20px' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase' }}>
                        {project.subtitle}
                      </Text>
                      <Title level={5} style={{ margin: '4px 0 8px 0' }}>{project.title}</Title>
                      <Text type="secondary" style={{ fontSize: '13px' }}>
                        {project.description}
                      </Text>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <Text strong style={{ fontSize: '12px' }}>Progression</Text>
                        <Text strong style={{ fontSize: '12px' }}>{project.progress}%</Text>
                      </div>
                      <Progress 
                        percent={project.progress} 
                        strokeColor="#52c41a"
                        showInfo={false}
                        size="small"
                        strokeWidth={6}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Space>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <HeartOutlined style={{ color: '#ff4d4f', fontSize: '14px' }} />
                          <Text style={{ fontSize: '12px' }}>{project.likes}</Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <EyeOutlined style={{ color: '#666', fontSize: '14px' }} />
                          <Text style={{ fontSize: '12px' }}>{project.views}</Text>
                        </div>
                      </Space>
                      
                      <Space>
                        <Tooltip title="Voir le projet">
                          <Button type="text" icon={<EyeOutlined />} size="small" />
                        </Tooltip>
                        <Tooltip title="Partager">
                          <Button type="text" icon={<ShareAltOutlined />} size="small" />
                        </Tooltip>
                      </Space>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>

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

        .stat-card-modern {
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .stat-card-modern:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
        }

        .conversation-item:hover {
          background-color: #f8f9ff !important;
          transform: translateX(4px);
        }

        .project-card-modern:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.15) !important;
        }

        .project-card-modern:hover .project-image {
          transform: scale(1.05);
        }

        .settings-list .ant-switch {
          background-color: #f0f0f0;
        }

        .settings-list .ant-switch-checked {
          background-color: #1890ff;
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
      `}</style>
    </motion.div>
  );
}

export default Profile;