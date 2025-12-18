import { Layout, Menu, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { AppstoreOutlined, CalendarOutlined, UserOutlined, PlayCircleOutlined, TagsOutlined } from '@ant-design/icons';

import UserWidget from '../components/UserWidget';
import { fetchMe } from '../api/api.js';

const { Header, Sider, Content } = Layout;

const MainPage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        fetchMe(token)
            .then((u) => {
                if (!u.is_admin) {
                    localStorage.removeItem('token');
                    navigate('/login');
                } else {
                    setUser(u);
                }
            })
            .catch(() => {
                localStorage.removeItem('token');
                navigate('/login');
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    if (loading) return <Spin fullscreen />;

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider width={220} style={{ position: 'fixed', height: '100vh', left: 0 }}>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    onClick={({ key }) => navigate(key)}
                    items={[
                        {
                            key: '/users',
                            icon: <UserOutlined />,
                            label: 'Utilisateurs',
                        },
                        {
                            key: '/games',
                            icon: <PlayCircleOutlined />,
                            label: 'Jeux',
                        },
                        {
                            key: '/events',
                            icon: <CalendarOutlined />,
                            label: 'Événements',
                        },
                        {
                            key: '/tags',
                            icon: <TagsOutlined />,
                            label: 'Tags',
                        }
                    ]}
                />
            </Sider>

            <Layout style={{ marginLeft: 220 }}>
                <Header
                    style={{
                        background: '#fff',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        paddingRight: 24,
                    }}
                >
                    <UserWidget user={user} />
                </Header>

                <Content style={{ padding: 24 }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainPage;
