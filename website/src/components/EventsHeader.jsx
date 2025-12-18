import { Space, Typography, Input, Button } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Search } = Input;

const EventsHeader = ({ onRefresh, onAdd, q, onSearchChange }) => {
  return (
    <Space
      style={{
        width: '100%',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}
    >
      <Title level={3}>GameEvents Admin</Title>

      <Space>
        <Search
          placeholder="Rechercher un événement..."
          allowClear
          value={q}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          onSearch={(val) => onSearchChange && onSearchChange(val)}
        />
        <Button icon={<ReloadOutlined />} onClick={onRefresh}>
          Actualiser
        </Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          Ajouter un événement
        </Button>
      </Space>
    </Space>
  );
};

export default EventsHeader;
