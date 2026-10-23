// ============================================================
// Login Page – HR Letter Generator
// ============================================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Space,
  Divider,
} from 'antd';
import {
  MailOutlined,
  LockOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useApp } from '../contexts/AppContext';

const { Title, Text, Paragraph } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useApp();
  const [form] = Form.useForm<LoginFormValues>();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const success = await login(values.email, values.password);
      if (success) {
        message.success('Welcome back!');
        navigate('/', { replace: true });
      } else {
        message.error('Invalid email or password. Please try again.');
      }
    } catch {
      message.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    form.setFieldsValue({
      email: 'admin@demo.com',
      password: 'admin123',
    });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 24,
      }}
    >
      {/* Decorative background circles */}
      <div
        style={{
          position: 'fixed',
          top: -120,
          right: -120,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: -80,
          left: -80,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }}
      />

      <Card
        style={{
          width: 440,
          maxWidth: '100%',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          border: 'none',
        }}
        bodyStyle={{ padding: '40px 36px 32px' }}
      >
        {/* Branding */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              marginBottom: 16,
            }}
          >
            <FileTextOutlined style={{ fontSize: 32, color: '#fff' }} />
          </div>
          <Title level={3} style={{ marginBottom: 4 }}>
            HR Letter Generator
          </Title>
          <Text type="secondary">
            Sign in to manage your HR documents
          </Text>
        </div>

        {/* Login Form */}
        <Form<LoginFormValues>
          form={form}
          layout="vertical"
          onFinish={handleLogin}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#bbb' }} />}
              placeholder="admin@demo.com"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bbb' }} />}
              placeholder="Enter your password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: 46,
                borderRadius: 8,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
              }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>
          <Text type="secondary" style={{ fontSize: 12 }}>
            DEMO ACCESS
          </Text>
        </Divider>

        {/* Demo credentials */}
        <div
          style={{
            background: '#f6f8ff',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 16,
          }}
        >
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <Space>
              <InfoCircleOutlined style={{ color: '#667eea' }} />
              <Text strong style={{ fontSize: 13 }}>
                Demo Credentials
              </Text>
            </Space>
            <Paragraph
              style={{ marginBottom: 0, fontSize: 13, color: '#666' }}
            >
              Email: <Text code>admin@demo.com</Text>
              <br />
              Password: <Text code>admin123</Text>
            </Paragraph>
          </Space>
        </div>

        <Button
          type="dashed"
          block
          onClick={fillDemoCredentials}
          style={{ borderRadius: 8 }}
        >
          Auto-fill Demo Credentials
        </Button>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            © {new Date().getFullYear()} HR Letter Generator. All rights
            reserved.
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;
