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
} from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import logo from "../assets/images/logo.png";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../features/userSlice";
import toast, { Toaster } from "react-hot-toast";
import { forgotPassword } from "../features/userSlice"; 
import axios from "axios"; // Assurez-vous d'importer axios

const { Title, Text } = Typography;
const { Content } = Layout;

const SignIn = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await dispatch(login(values)).unwrap();
            
            // Vérifier si 2FA est requis
            if (response.requires_2fa) {
                // Stocker temporairement le token 2FA
                
                // Rediriger vers la page de vérification 2FA
                navigate("/verify-login-2fa", { 
                    state: { 
                        tempToken: response.temp_token,
                        userEmail: values.email 
                    } 
                });
                
                toast.success(t("Vérification à deux facteurs requise"), {
                    position: "top-right",
                    duration: 5000,
                });
            } else {
                // Authentification standard réussie
                const token =  response.token;
                if (!token) {
                    throw new Error("Aucun token reçu dans la réponse");
                }
                localStorage.setItem("token", response.token);
                toast.success(t("Connexion réussie"), {
                    position: "top-right",
                    duration: 5000,
                });
                navigate("/");
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || t("Connexion échouée");
            toast.error(errorMessage, {
                position: "top-right",
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed = (errorInfo) => {
        toast.error(t("Connexion échouée. Veuillez vérifier vos informations."), {
            position: "top-right",
            duration: 5000,
        });
    };

    const handleForgotPassword = () => {
        if (!email) {
          toast.error(t("Veuillez entrer une adresse e-mail valide."), {
            position: "top-right",
            duration: 5000,
          });
          return;
        }
      
        // Appeler l'asyncThunk pour envoyer l'e-mail
        dispatch(forgotPassword(email))
          .unwrap()
          .then((response) => {
            toast.success(response.message || t("Un e-mail de réinitialisation a été envoyé."), {
              position: "top-right",
              duration: 5000,
            });
            setIsModalVisible(false); // Fermer le modal
          })
          .catch((error) => {
            toast.error(error || t("Une erreur s'est produite."), {
              position: "top-right",
              duration: 5000,
            });
          });
    };

    return (
        <>
            <Toaster />
            <Layout
                className="layout-default layout-signin"
                style={{
                    height: "100vh", // Occuper toute la hauteur de la fenêtre
                    overflow: "hidden", // Empêcher le défilement
                }}
            >
                <Content
                    className="signin"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%", // S'assurer que le contenu occupe toute la hauteur
                    }}
                >
                    <Row gutter={[24, 0]} justify="center" align="middle" style={{ width: "100%" }}>
                        {/* Logo Section */}
                        <Col xs={24} lg={12} md={12} className="sign-img">
                            <div style={{ textAlign: "center" }}>
                                <img
                                    src={logo}
                                    alt="Sign In Background"
                                    style={{ maxWidth: "80%", marginBottom: "20px" }}
                                />
                            </div>
                        </Col>

                        {/* Form Section */}
                        <Col xs={24} lg={8} md={12}>
                            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                                <Title level={2} style={{ fontWeight: "bold" }}>
                                    {t("WELCOME BACK")}
                                </Title>
                                <Text type="secondary">{t("Welcome back! Please enter your details.")}</Text>
                            </div>
                            <Form
                                onFinish={onFinish}
                                onFinishFailed={onFinishFailed}
                                layout="vertical"
                                className="row-col"
                            >
                                <Form.Item
                                    label={t("Email")}
                                    name="email"
                                    rules={[
                                        {
                                            required: true,
                                            type: "email",
                                            message: t("EmailRequiredMessage"),
                                        },
                                    ]}
                                >
                                    <Input placeholder={t("Enter your email")} />
                                </Form.Item>

                                <Form.Item
                                    label={t("Password")}
                                    name="password"
                                    rules={[
                                        {
                                            required: true,
                                            message: t("PasswordRequiredMessage"),
                                        },
                                    ]}
                                >
                                    <Input.Password placeholder={t("Enter your password")} />
                                </Form.Item>

                                <Form.Item>
                                    <Row justify="space-between" align="middle">
                                        <Col>
                                            <Checkbox name="remember_me">{t("Remember me")}</Checkbox>
                                        </Col>
                                        <Col>
                                            <span
                                                onClick={() => setIsModalVisible(true)}
                                                style={{ cursor: "pointer", color: "#1890ff" }}
                                            >
                                                {t("Forgot password")}
                                            </span>
                                        </Col>
                                    </Row>
                                </Form.Item>

                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        style={{
                                            width: "100%",
                                            backgroundColor: "#ff4d4f",
                                            borderColor: "#ff4d4f",
                                        }}
                                    >
                                        {loading ? t("Connexion...") : t("Sign in")}
                                    </Button>
                                </Form.Item>
                                <p className="font-semibold text-muted" style={{ textAlign: "center" }}>
                                    {t("NoAccount")}{" "}
                                    <Link to="/sign-up" className="text-dark font-bold">
                                        {t("Sign up")}
                                    </Link>
                                </p>
                            </Form>
                        </Col>
                    </Row>
                </Content>
            </Layout>

            {/* Modal for Forgot Password */}
            <Modal
                title={null}
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                centered
                bodyStyle={{
                    padding: "30px",
                    textAlign: "center",
                    borderRadius: "8px",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <div
                        style={{
                            fontSize: "40px",
                            color: "#ff4d4f",
                            marginBottom: "10px",
                        }}
                    >
                       <LockOutlined />
                    </div>
                    <Title level={3} style={{ fontWeight: "bold" }}>
                        {t("Forgot Password?")}
                    </Title>
                    <Text type="secondary">{t("Enter your email to reset your password.")}</Text>
                </div>
                <Form layout="vertical">
                    <Form.Item
                        label={t("Email Address")}
                        rules={[
                            {
                                required: true,
                                type: "email",
                                message: t("EmailRequiredMessage"),
                            },
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined />}
                            placeholder={t("Enter your email")}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Form.Item>
                    <Button
                        type="primary"
                        block
                        style={{
                            backgroundColor: "#ff4d4f",
                            color: "#fff",
                            marginBottom: "10px",
                        }}
                        onClick={handleForgotPassword}
                    >
                        {t("Reset Password")}
                    </Button>
                    <Link to="/sign-in" style={{ color: "#1890ff" }}>
                        {t("Back to Login")}
                    </Link>
                </Form>
            </Modal>
        </>
    );
};

export default SignIn;