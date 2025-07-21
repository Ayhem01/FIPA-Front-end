import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Alert, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { changePassword } from '../features/userSlice';


const ChangePassword = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { loading, error, passwordChanged } = useSelector((state) => state.user);
  const [messageApi, contextHolder] = message.useMessage();
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (passwordChanged) {
      messageApi.success('Mot de passe changé avec succès');
      form.resetFields();
    }
  }, [passwordChanged, messageApi, form]);

  useEffect(() => {
    if (error) {
      if (error.errors) {
        // Handle validation errors
        const errorMessages = Object.values(error.errors).flat();
        setFormError(errorMessages.join(', '));
      } else if (error.message) {
        setFormError(error.message);
      } else {
        setFormError('Une erreur est survenue lors du changement de mot de passe');
      }
    }
  }, [error]);

  const onFinish = (values) => {
    if (values.new_password !== values.new_password_confirmation) {
      setFormError('Les mots de passe ne correspondent pas');
      return;
    }
    
    setFormError(null);
    
    dispatch(changePassword({
        current_password: values.current_password,
        new_password: values.new_password, 
        new_password_confirmation: values.new_password_confirmation 
      }));
  };

  return (
    <div className="change-password-container">
      {contextHolder}
      <Card title="Changer le mot de passe" className="auth-card">
        {formError && (
          <Alert
            message="Erreur"
            description={formError}
            type="error"
            showIcon
            className="mb-4"
          />
        )}
        
        <Form
          form={form}
          name="change_password"
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="current_password"
            label="Mot de passe actuel"
            rules={[
              {
                required: true,
                message: 'Veuillez entrer votre mot de passe actuel',
              },
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />}
              placeholder="Mot de passe actuel" 
            />
          </Form.Item>

          <Form.Item
            name="new_password"
            label="Nouveau mot de passe"
            rules={[
              {
                required: true,
                message: 'Veuillez entrer votre nouveau mot de passe',
              },
              {
                min: 8,
                message: 'Le mot de passe doit contenir au moins 8 caractères',
              },
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />}
              placeholder="Nouveau mot de passe" 
            />
          </Form.Item>

          <Form.Item
            name="new_password_confirmation"
            label="Confirmer le nouveau mot de passe"
            dependencies={['new_password']}
            rules={[
              {
                required: true,
                message: 'Veuillez confirmer votre nouveau mot de passe',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />}
              placeholder="Confirmer le mot de passe" 
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="submit-button" 
              loading={loading}
              block
            >
              Changer le mot de passe
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ChangePassword;