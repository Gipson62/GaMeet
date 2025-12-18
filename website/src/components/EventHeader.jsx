import { Button, Space, Typography } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const EventHeader = ({ onEdit, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div style={{ marginBottom: 16 }}>
      <Space style={{ width: '100%' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          type="link"
          onClick={() => navigate(-1)}
        >
          Retour à la liste
        </Button>

        <Space>
          <Button icon={<EditOutlined />} onClick={onEdit}>
            Modifier
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={onDelete}>
            Supprimer
          </Button>
        </Space>
      </Space>
    </div>
  );
};

export default EventHeader;
