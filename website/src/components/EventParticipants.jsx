import { Card, Table, Button, Space, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const EventParticipants = ({ participants = [], onDelete, onAdd }) => {
  const columns = [
    {
      title: 'Pseudo',
      dataIndex: 'pseudo',
      key: 'pseudo',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Rôle',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Retirer ce participant ?"
            onConfirm={() => onDelete(record.id)} // ✅ user.id
            okText="Oui"
            cancelText="Non"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const dataSource = participants.map(user => ({
    key: user.id,
    id: user.id, // ✅ user_id
    pseudo: user.pseudo,
    email: user.email,
    role: user.role || 'Participant',
  }));

  return (
    <Card
      title="👥 Participants"
      extra={
        <Button
          icon={<PlusOutlined />}
          onClick={() => {
            const userId = prompt('ID utilisateur à ajouter');
            if (userId) onAdd(Number(userId));
          }}
        >
          Ajouter
        </Button>
      }
      style={{ marginTop: 24 }}
    >
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
      />
    </Card>
  );
};

export default EventParticipants;
