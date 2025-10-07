import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    Layout,
    Button,
    Row,
    Col,
    Typography,
    Form,
    Input,
    Checkbox,
    Modal,
    Spin,
    Card,
    Space,
    Alert,
    Grid
} from "antd";
import { 
    MailOutlined, LockOutlined, EyeInvisibleOutlined, 
    EyeTwoTone, UserOutlined, ArrowRightOutlined,
    SafetyOutlined, CheckCircleOutlined
} from "@ant-design/icons";
import logo from "../assets/images/logo.png";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../features/userSlice";
import toast, { Toaster } from "react-hot-toast";
import { forgotPassword } from "../features/userSlice"; 
import { motion, AnimatePresence } from 'framer-motion';
import axios from "axios";

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { useBreakpoint } = Grid;

const SignIn = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [form] = Form.useForm();
    const screens = useBreakpoint();

    // Variants d'animation
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { 
            opacity: 1, 
            scale: 1,
            transition: { duration: 0.5, delay: 0.2, ease: "easeOut" }
        }
    };

    const logoVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: { 
            opacity: 1, 
            x: 0,
            transition: { duration: 0.8, delay: 0.3, ease: "easeOut" }
        }
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await dispatch(login(values)).unwrap();
            
            // Vérifier si 2FA est requis
            if (response.requires_2fa) {
                // Rediriger vers la page de vérification 2FA
                navigate("/verify-login-2fa", { 
                    state: { 
                        tempToken: response.temp_token,
                        userEmail: values.email 
                    } 
                });
                
                toast.success("Vérification à deux facteurs requise", {
                    position: "top-right",
                    duration: 5000,
                });
            } else {
                // Authentification standard réussie
                const token = response.token;
                if (!token) {
                    throw new Error("Aucun token reçu dans la réponse");
                }
                localStorage.setItem("token", response.token);
                toast.success("Connexion réussie", {
                    position: "top-right",
                    duration: 5000,
                });
                navigate("/");
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || "Connexion échouée";
            toast.error(errorMessage, {
                position: "top-right",
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed = (errorInfo) => {
        toast.error("Connexion échouée. Veuillez vérifier vos informations.", {
            position: "top-right",
            duration: 5000,
        });
    };

    const handleForgotPassword = async () => {
        if (!email) {
            toast.error("Veuillez entrer une adresse e-mail valide.", {
                position: "top-right",
                duration: 5000,
            });
            return;
        }

        setResetLoading(true);
        try {
            const response = await dispatch(forgotPassword(email)).unwrap();
            toast.success(response.message || "Un e-mail de réinitialisation a été envoyé.", {
                position: "top-right",
                duration: 5000,
            });
            setIsModalVisible(false);
            setEmail("");
        } catch (error) {
            toast.error(error || "Une erreur s'est produite.", {
                position: "top-right",
                duration: 5000,
            });
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <>
            <Toaster />
            <motion.div 
                className="modern-signin-container"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Contenu principal */}
                <div className="signin-content">
                    <Row gutter={[48, 32]} justify="center" align="middle" style={{ minHeight: '100vh' }}>
                        {/* Section Logo */}
                        <Col xs={24} lg={12} md={12}>
                            <motion.div 
                                className="logo-section"
                                variants={logoVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <Card
                                    className="logo-card"
                                    style={{
                                        borderRadius: '20px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #f0f2ff 0%, #f8f9ff 100%)',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                        textAlign: 'center',
                                        overflow: 'hidden'
                                    }}
                                    bodyStyle={{ padding: '60px 40px' }}
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.05, rotateY: 5 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <img
                                            src={logo}
                                            alt="Logo"
                                            style={{ 
                                                maxWidth: '100%', 
                                                height: 'auto',
                                                maxHeight: '300px',
                                                filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.1))'
                                            }}
                                        />
                                    </motion.div>
                                    
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        style={{ marginTop: '32px' }}
                                    >
                                        <Title level={3} style={{ color: '#667eea', margin: '0 0 8px 0' }}>
                                            Plateforme Sécurisée
                                        </Title>
                                        <Text type="secondary" style={{ fontSize: '14px' }}>
                                            Votre solution de gestion moderne et intuitive
                                        </Text>
                                    </motion.div>
                                </Card>
                            </motion.div>
                        </Col>

                        {/* Section Formulaire */}
                        <Col xs={24} lg={10} md={12}>
                            <motion.div
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <Card
                                    className="signin-card"
                                    style={{
                                        borderRadius: '20px',
                                        border: '1px solid #f0f0f0',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                        overflow: 'hidden'
                                    }}
                                    bodyStyle={{ padding: '40px' }}
                                >
                                    {/* En-tête du formulaire */}
                                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                                            style={{
                                                width: '60px',
                                                height: '60px',
                                                borderRadius: '15px',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                margin: '0 auto 20px',
                                                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                                            }}
                                        >
                                            <LockOutlined style={{ fontSize: '24px', color: 'white' }} />
                                        </motion.div>

                                        <Title level={2} style={{ margin: '0 0 8px 0', color: '#1a1a1a', fontWeight: 700 }}>
                                            Bienvenue !
                                        </Title>
                                        <Text type="secondary">
                                            Connectez-vous pour accéder à votre compte
                                        </Text>
                                    </div>

                                    {/* Formulaire */}
                                    <Form
                                        form={form}
                                        onFinish={onFinish}
                                        onFinishFailed={onFinishFailed}
                                        layout="vertical"
                                        size="large"
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                        >
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
                                                    placeholder="Entrez votre email" 
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
                                            transition={{ delay: 0.6 }}
                                        >
                                            <Form.Item
                                                label={
                                                    <Text strong style={{ color: '#666', fontSize: '13px' }}>
                                                        MOT DE PASSE
                                                    </Text>
                                                }
                                                name="password"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: "Veuillez entrer votre mot de passe",
                                                    },
                                                ]}
                                            >
                                                <Input.Password 
                                                    prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                                                    placeholder="Entrez votre mot de passe"
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
                                            <Form.Item style={{ marginBottom: '24px' }}>
                                                <Row justify="space-between" align="middle">
                                                    <Col>
                                                        <Form.Item name="remember_me" valuePropName="checked" noStyle>
                                                            <Checkbox style={{ fontSize: '14px' }}>
                                                                Se souvenir de moi
                                                            </Checkbox>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col>
                                                        <Button
                                                            type="link"
                                                            onClick={() => setIsModalVisible(true)}
                                                            style={{ 
                                                                padding: 0, 
                                                                fontSize: '14px',
                                                                color: '#667eea'
                                                            }}
                                                        >
                                                            Mot de passe oublié ?
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            </Form.Item>
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.8 }}
                                        >
                                            <Form.Item style={{ marginBottom: '24px' }}>
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
                                                        icon={<ArrowRightOutlined />}
                                                    >
                                                        {loading ? 'Connexion en cours...' : 'Se connecter'}
                                                    </Button>
                                                </motion.div>
                                            </Form.Item>
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.9 }}
                                            style={{ textAlign: 'center' }}
                                        >
                                            <Text style={{ color: '#666', fontSize: '14px' }}>
                                                Vous n'avez pas de compte ?{" "}
                                                <Link 
                                                    to="/sign-up" 
                                                    style={{ 
                                                        color: '#667eea', 
                                                        fontWeight: 600,
                                                        textDecoration: 'none'
                                                    }}
                                                >
                                                    Créer un compte
                                                </Link>
                                            </Text>
                                        </motion.div>
                                    </Form>
                                </Card>
                            </motion.div>
                        </Col>
                    </Row>
                </div>
            </motion.div>

            {/* Modal Mot de passe oublié modernisé */}
            <Modal
                title={null}
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    setEmail("");
                }}
                footer={null}
                centered
                width={500}
                styles={{
                    body: { padding: 0 }
                }}
                className="modern-modal"
            >
                <Card
                    style={{
                        border: 'none',
                        borderRadius: '16px'
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
                                background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px',
                                boxShadow: '0 8px 32px rgba(255, 154, 158, 0.3)'
                            }}
                        >
                            <SafetyOutlined style={{ fontSize: '32px', color: 'white' }} />
                        </motion.div>

                        <Title level={3} style={{ margin: '0 0 8px 0', color: '#1a1a1a' }}>
                            Mot de passe oublié ?
                        </Title>
                        <Text type="secondary">
                            Entrez votre email pour recevoir un lien de réinitialisation
                        </Text>
                    </div>

                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <div>
                            <Text strong style={{ display: 'block', marginBottom: '8px', color: '#666', fontSize: '13px' }}>
                                ADRESSE EMAIL
                            </Text>
                            <Input
                                prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                                placeholder="Entrez votre email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                size="large"
                                style={{
                                    borderRadius: '12px',
                                    border: '2px solid #f0f0f0',
                                    fontSize: '14px',
                                    padding: '12px 16px'
                                }}
                                className="modern-input"
                            />
                        </div>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                type="primary"
                                block
                                size="large"
                                loading={resetLoading}
                                onClick={handleForgotPassword}
                                style={{
                                    height: '48px',
                                    background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    boxShadow: '0 4px 20px rgba(255, 154, 158, 0.4)'
                                }}
                                icon={<CheckCircleOutlined />}
                            >
                                {resetLoading ? 'Envoi en cours...' : 'Envoyer le lien'}
                            </Button>
                        </motion.div>

                        <div style={{ textAlign: 'center' }}>
                            <Button
                                type="link"
                                onClick={() => {
                                    setIsModalVisible(false);
                                    setEmail("");
                                }}
                                style={{ fontSize: '14px', color: '#666' }}
                            >
                                Retour à la connexion
                            </Button>
                        </div>
                    </Space>
                </Card>
            </Modal>

            {/* Styles CSS intégrés */}
            <style jsx>{`
                .modern-signin-container {
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    min-height: 100vh;
                    padding: 0;
                }

                .signin-content {
                    padding: 32px 24px;
                }

                .logo-card {
                    transition: all 0.3s ease;
                }

                .logo-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 48px rgba(0,0,0,0.15) !important;
                }

                .signin-card {
                    transition: all 0.3s ease;
                }

                .signin-card:hover {
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

                .modern-modal .ant-modal-content {
                    border-radius: 16px !important;
                    overflow: hidden !important;
                }

                /* Responsive */
                @media (max-width: 992px) {
                    .signin-content {
                        padding: 24px 16px;
                    }

                    .logo-card .ant-card-body {
                        padding: 40px 24px !important;
                    }

                    .signin-card .ant-card-body {
                        padding: 32px 24px !important;
                    }
                }

                @media (max-width: 768px) {
                    .signin-content {
                        padding: 16px;
                    }

                    .logo-card .ant-card-body {
                        padding: 32px 20px !important;
                    }

                    .signin-card .ant-card-body {
                        padding: 24px 20px !important;
                    }
                }

                @media (max-width: 576px) {
                    .logo-card .ant-card-body {
                        padding: 24px 16px !important;
                    }

                    .signin-card .ant-card-body {
                        padding: 20px 16px !important;
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

                .ant-card {
                    animation: fadeInUp 0.6s ease-out;
                }
            `}</style>
        </>
    );
};

export default SignIn;