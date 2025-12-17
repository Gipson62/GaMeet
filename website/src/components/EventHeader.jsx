import { Button, Space, Typography } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const EventHeader = ({ name, date, location, onEdit, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div style={{ marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          type="link"
          onClick={() => navigate(-1)}
        >
          Retour à la liste
        </Button>

        <Title level={3} style={{ margin: 0 }}>
          {name} {date && `- ${new Date(date).toLocaleDateString()}`}
        </Title>
        {location && <Text type="secondary">{location}</Text>}

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
