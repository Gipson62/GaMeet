import { Button, Space, Typography, Tag, Popconfirm } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const GameHeader = ({ name, studio, publisher, is_approved, release_date, logo_id, onEdit, onDelete }) => {
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

        <Space>
          <Title level={2} style={{ margin: 0 }}>
            {name}
          </Title>
          {is_approved && <Tag color="green">Approuvé</Tag>}
        </Space>

        {(studio || publisher || release_date) && (
          <Text type="secondary">
            {studio && `Studio: ${studio} `}
            {publisher && `| Éditeur: ${publisher} `}
            {release_date && `| Date de sortie: ${new Date(release_date).toLocaleDateString()}`}
          </Text>
        )}

        <Space>
          <Button icon={<EditOutlined />} onClick={onEdit}>
            Modifier
          </Button>
          <Popconfirm
            title="Voulez-vous vraiment supprimer cet événement ?"
            onConfirm={() => onDelete()}
            okText="Oui"
            cancelText="Non"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      </Space>
    </div>
  );
};

export default GameHeader;
