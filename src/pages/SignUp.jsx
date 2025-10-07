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
    Card,
    Space,
    Grid
} from "antd";
import { 
    UserOutlined, MailOutlined, ArrowRightOutlined,
    CheckCircleOutlined, UserAddOutlined
} from "@ant-design/icons";
import logo from "../assets/images/logo.png";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { register } from "../features/userSlice";
import toast, { Toaster } from "react-hot-toast";
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { useBreakpoint } = Grid;

const SignUp = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
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
            await dispatch(register(values)).unwrap();
            toast.success("Utilisateur créé avec succès. Le mot de passe a été envoyé par e-mail.", {
                position: "top-right",
                duration: 5000,
            });
            navigate("/sign-in");
        } catch (error) {
            toast.error("Erreur lors de l'inscription : " + (error.message || "Une erreur s'est produite"), {
                position: "top-right",
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed = (errorInfo) => {
        toast.error("Inscription échouée. Veuillez vérifier vos informations.", {
            position: "top-right",
            duration: 5000,
        });
    };

    return (
        <>
            <Toaster />
            <motion.div 
                className="modern-signup-container"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Contenu principal */}
                <div className="signup-content">
                <Row gutter={[48, 32]} justify="center" align="top" style={{ minHeight: 'calc(100vh - 64px)', paddingTop: '40px' }}>
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
                                            Rejoignez-nous
                                        </Title>
                                        <Text type="secondary" style={{ fontSize: '14px' }}>
                                            Créez votre compte et accédez à notre plateforme sécurisée
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
                                    className="signup-card"
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

                                        <Title level={2} style={{ margin: '0 0 8px 0', color: '#1a1a1a', fontWeight: 700 }}>
                                            Créer un compte
                                        </Title>
                                        <Text type="secondary">
                                            Remplissez les informations ci-dessous pour vous inscrire
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
                                                        NOM COMPLET
                                                    </Text>
                                                }
                                                name="name"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: "Veuillez entrer votre nom complet",
                                                    },
                                                    {
                                                        min: 2,
                                                        message: "Le nom doit contenir au moins 2 caractères",
                                                    },
                                                ]}
                                            >
                                                <Input 
                                                    prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                                                    placeholder="Entrez votre nom complet" 
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
                                                    placeholder="Entrez votre adresse email" 
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

                                        {/* Information sur le mot de passe */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.7 }}
                                            style={{ marginBottom: '24px' }}
                                        >
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
                                                            background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                                                            border: 'none',
                                                            borderRadius: '12px',
                                                            fontSize: '16px',
                                                            fontWeight: 600,
                                                            boxShadow: '0 4px 20px rgba(82, 196, 26, 0.4)',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                        icon={<ArrowRightOutlined />}
                                                    >
                                                        {loading ? 'Création du compte...' : 'Créer mon compte'}
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
                                                Vous avez déjà un compte ?{" "}
                                                <Link 
                                                    to="/sign-in" 
                                                    style={{ 
                                                        color: '#52c41a', 
                                                        fontWeight: 600,
                                                        textDecoration: 'none'
                                                    }}
                                                >
                                                    Se connecter
                                                </Link>
                                            </Text>
                                        </motion.div>
                                    </Form>

                                    {/* Informations supplémentaires */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1 }}
                                        style={{ marginTop: '32px' }}
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
                                                <Text strong style={{ fontSize: '12px', color: '#666' }}>
                                                    PROCESSUS D'INSCRIPTION :
                                                </Text>
                                                <ul style={{ margin: 0, paddingLeft: '16px', color: '#666', fontSize: '12px' }}>
                                                    <li>Validation de votre adresse email</li>
                                                    <li>Envoi d'un mot de passe temporaire</li>
                                                    <li>Première connexion pour personnaliser</li>
                                                </ul>
                                            </Space>
                                        </Card>
                                    </motion.div>
                                </Card>
                            </motion.div>
                        </Col>
                    </Row>
                </div>
            </motion.div>

            {/* Styles CSS intégrés */}
            <style jsx>{`
                .modern-signup-container {
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    min-height: 100vh;
                    padding: 0;
                }

                .signup-content {
                    padding: 32px 24px;
                }

                .logo-card {
                    transition: all 0.3s ease;
                }

                .logo-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 48px rgba(0,0,0,0.15) !important;
                }

                .signup-card {
                    transition: all 0.3s ease;
                }

                .signup-card:hover {
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
                    border-color: #52c41a !important;
                    box-shadow: 0 0 0 3px rgba(82, 196, 26, 0.1) !important;
                }

                .ant-form-item-label > label {
                    font-weight: 600 !important;
                    color: #666 !important;
                }

                .ant-btn-primary:hover {
                    background: linear-gradient(135deg, #389e0d 0%, #52c41a 100%) !important;
                    transform: translateY(-1px) !important;
                    box-shadow: 0 6px 28px rgba(82, 196, 26, 0.5) !important;
                }

                /* Responsive */
                @media (max-width: 992px) {
                    .signup-content {
                        padding: 24px 16px;
                    }

                    .logo-card .ant-card-body {
                        padding: 40px 24px !important;
                    }

                    .signup-card .ant-card-body {
                        padding: 32px 24px !important;
                    }
                }

                @media (max-width: 768px) {
                    .signup-content {
                        padding: 16px;
                    }

                    .logo-card .ant-card-body {
                        padding: 32px 20px !important;
                    }

                    .signup-card .ant-card-body {
                        padding: 24px 20px !important;
                    }
                }

                @media (max-width: 576px) {
                    .logo-card .ant-card-body {
                        padding: 24px 16px !important;
                    }

                    .signup-card .ant-card-body {
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

                /* Animation pour le focus sur l'input */
                .modern-input:focus {
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
        </>
    );
};

export default SignUp;