import { Space, Typography, Input, Button } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Search } = Input;

const UsersHeader = ({ onRefresh, onAdd, searchValue, onSearchChange }) => {
    return (
        <Space
            style={{
                width: '100%',
                justifyContent: 'space-between',
                marginBottom: 16,
            }}
        >
            <Title level={3}>Utilisateurs</Title>

            <Space>
                <Search
                    placeholder="Rechercher un utilisateur"
                    allowClear
                    value={searchValue}
                    onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                    onSearch={(val) => onSearchChange && onSearchChange(val)}
                />
                <Button icon={<ReloadOutlined />} onClick={onRefresh}>
                    Actualiser
                </Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
                    Ajouter un utilisateur
                </Button>
            </Space>
        </Space>
    );
};

export default UsersHeader;