import React from "react";
import { Link } from "react-router-dom";
import {
    Layout,
    Button,
    Row,
    Col,
    Typography,
    Form,
    Input,
} from "antd";
import logo from "../assets/images/logo.png";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { register } from "../features/userSlice";
import toast, { Toaster } from "react-hot-toast";

const { Title, Text } = Typography;
const { Content } = Layout;

const SignUp = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onFinish = (values) => {
        dispatch(register(values))
            .unwrap()
            .then(() => {
                toast.success(t("Utilisateur créé avec succès. Le mot de passe a été envoyé par e-mail."), {
                    position: "top-right",
                    duration: 5000,
                });
                navigate("/sign-in");
            })
            .catch((error) => {
                toast.error(t("Erreur lors de l'inscription : ") + (error.message || t("Une erreur s'est produite")), {
                    position: "top-right",
                    duration: 5000,
                });
            });
    };

    const onFinishFailed = (errorInfo) => {
        toast.error(t("Connexion échouée. Veuillez vérifier vos informations."), {
            position: "top-right",
            duration: 5000,
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
                                    alt="Sign Up Background"
                                    style={{ maxWidth: "80%", marginBottom: "150px" }}
                                />
                            </div>
                        </Col>

                        {/* Form Section */}
                        <Col xs={24} lg={8} md={12}>
                            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                                <Title level={2} style={{ fontWeight: "bold" }}>
                                    {t("CREATE ACCOUNT")}
                                </Title>
                                <Text type="secondary">{t("Please fill in the details to create your account.")}</Text>
                            </div>
                            <Form
                                onFinish={onFinish}
                                onFinishFailed={onFinishFailed}
                                layout="vertical"
                                className="row-col"
                            >
                                <Form.Item
                                    label={t("Name")}
                                    name="name"
                                    rules={[
                                        {
                                            required: true,
                                            message: t("NameRequiredMessage"),
                                        },
                                    ]}
                                >
                                    <Input placeholder={t("Enter your name")} />
                                </Form.Item>

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

                                

                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        style={{
                                            width: "100%",
                                            backgroundColor: "#ff4d4f",
                                            borderColor: "#ff4d4f",
                                        }}
                                    >
                                        {t("Sign up")}
                                    </Button>
                                </Form.Item>
                                <p className="font-semibold text-muted" style={{ textAlign: "center" }}>
                                    {t("Already have an account?")}{" "}
                                    <Link to="/sign-in" className="text-dark font-bold">
                                        {t("Sign in")}
                                    </Link>
                                </p>
                            </Form>
                        </Col>
                    </Row>
                </Content>
            </Layout>
        </>
    );
};

export default SignUp;