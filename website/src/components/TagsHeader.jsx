import { Space, Typography, Input, Button } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Search } = Input;

const TagsHeader = ({ onRefresh, onAdd }) => {
  return (
    <Space
      style={{
        width: '100%',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}
    >
      <Title level={3}>Tags</Title>

      <Space>
        <Search placeholder="Rechercher un tag..." allowClear disabled />
        <Button icon={<ReloadOutlined />} onClick={onRefresh}>
          Actualiser
        </Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          Ajouter un tag
        </Button>
      </Space>
    </Space>
  );
};

export default TagsHeader;
