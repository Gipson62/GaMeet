import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Alert, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();


    const onFinish = async (values) => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:3001/v1/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur de connexion');
            }

            // Stockage du token et redirection
            localStorage.setItem('token', data.token);
            //navigate('/profile');

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh',
            background: '#f0f2f5'
        }}>
            <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 8 }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={3}>Connexion GaMeet</Title>
                </div>

                {error && (
                    <Alert
                        title={error}
                        type="error"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />
                )}

                <Form
                    name="login_form"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                    initialValues={{ remember: true }}
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Veuillez entrer votre email !' },
                            { type: 'email', message: 'Email invalide !' }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                            placeholder="Email (ex: test@test.com)"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Veuillez entrer votre mot de passe !' }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                            placeholder="Mot de passe"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            Se connecter
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;