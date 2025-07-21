import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout, Form, Input, Button, Typography } from "antd";
import { useTranslation } from "react-i18next";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const { Title, Text } = Typography;
const { Content } = Layout;

const ResetPassword = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token"); // Récupérer le token depuis les paramètres de requête
    const email = queryParams.get("email"); // Récupérer l'email depuis les paramètres de requête
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async (values) => {
        setLoading(true);
        try {
            const response = await axios.post("http://127.0.0.1:8000/api/auth/reset-password", {
                token, // Envoyer le token récupéré depuis l'URL
                email, // Envoyer l'email récupéré depuis l'URL
                password: values.password,
                password_confirmation: values.password_confirmation,
            });
            toast.success(response.data.message || t("Mot de passe réinitialisé avec succès."), {
                position: "top-right",
                duration: 5000,
            });
            navigate("/sign-in"); // Rediriger vers la page de connexion
        } catch (error) {
            toast.error(
                error.response?.data?.message || t("Une erreur s'est produite lors de la réinitialisation."),
                {
                    position: "top-right",
                    duration: 5000,
                }
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Toaster />
            <Layout
                className="layout-default layout-reset-password"
                style={{
                    height: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Content style={{ maxWidth: "400px", width: "100%" }}>
                    <div style={{ textAlign: "center", marginBottom: "20px" }}>
                        <Title level={3}>{t("Reset Password")}</Title>
                        <Text type="secondary">{t("Please enter your new password below.")}</Text>
                    </div>
                    <Form
                        layout="vertical"
                        onFinish={handleResetPassword}
                    >
                        <Form.Item
                            label={t("New Password")}
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: t("Veuillez entrer un nouveau mot de passe."),
                                },
                                {
                                    min: 8,
                                    message: t("Le mot de passe doit contenir au moins 8 caractères."),
                                },
                            ]}
                        >
                            <Input.Password placeholder={t("Enter your new password")} />
                        </Form.Item>
                        <Form.Item
                            label={t("Confirm Password")}
                            name="password_confirmation"
                            rules={[
                                {
                                    required: true,
                                    message: t("Veuillez confirmer votre mot de passe."),
                                },
                            ]}
                        >
                            <Input.Password placeholder={t("Confirm your new password")} />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                style={{ width: "100%" }}
                            >
                                {t("Reset Password")}
                            </Button>
                        </Form.Item>
                    </Form>
                </Content>
            </Layout>
        </>
    );
};

export default ResetPassword;