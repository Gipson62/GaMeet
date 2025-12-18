import { Avatar, Dropdown, Space, Typography } from 'antd';
import {
    UserOutlined,
    LogoutOutlined,
    DownOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const UserWidget = ({ user }) => {
    const navigate = useNavigate();

    if (!user) return null;

    const items = [
        {
            key: 'profile',
            label: 'Mon profil',
            icon: <UserOutlined />,
            onClick: () => navigate('/profile'),
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            label: 'Se déconnecter',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: () => {
                localStorage.removeItem('token');
                navigate('/login');
            },
        },
    ];

    return (
        <Dropdown menu={{ items }} trigger={['click']}>
            <Space
                size={12}
                style={{
                    cursor: 'pointer',
                    padding: '6px 12px',
                    borderRadius: 6,
                    transition: 'background 0.2s',
                }}
            >
                <Avatar
                    size={36}
                    src={user.photo?.url}
                    icon={<UserOutlined />}
                />
                <div style={{ lineHeight: 1.2 }}>
                    <Text strong>{user.pseudo}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {user.is_admin ? 'Administrateur' : 'Membre'}
                    </Text>
                </div>
                <DownOutlined style={{ fontSize: 12, color: '#999' }} />
            </Space>
        </Dropdown>
    );
};

export default UserWidget;
