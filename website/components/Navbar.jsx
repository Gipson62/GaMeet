import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Button, Layout } from 'antd';
import { LoginOutlined, UserOutlined, LogoutOutlined, HomeOutlined } from '@ant-design/icons';

const { Header } = Layout;

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Définition des éléments du menu
    const items = [
        {
            label: <Link to="/">Accueil</Link>,
            key: '/',
            icon: <HomeOutlined />,
        },
        // On affiche conditionnellement les items selon la connexion
        ...(token ? [
            {
                label: <Link to="/profile">Mon Profil</Link>,
                key: '/profile',
                icon: <UserOutlined />,
            },
            {
                label: 'Déconnexion',
                key: 'logout',
                icon: <LogoutOutlined />,
                danger: true,
                onClick: handleLogout,
            }
        ] : [
            {
                label: <Link to="/login">Connexion</Link>,
                key: '/login',
                icon: <LoginOutlined />,
            }
        ])
    ];

    return (
        <Header style={{ display: 'flex', alignItems: 'center', padding: '0 20px', background: '#001529' }}>
            <div style={{ color: 'white', fontSize: '1.2rem', fontWeight: 'bold', marginRight: '30px' }}>
                GaMeet
            </div>
            <Menu
                theme="dark"
                mode="horizontal"
                selectedKeys={[location.pathname]}
                items={items}
                style={{ flex: 1, minWidth: 0 }}
            />
        </Header>
    );
};

export default Navbar;