import { Card, Table, Button } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';

const EventParticipants = ({ participants = [], onRemove, onAdd }) => {
  // Colonnes dynamiques
  const columns = [
    { title: 'Pseudo', dataIndex: 'pseudo', key: 'pseudo' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Rôle', dataIndex: 'role', key: 'role' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          danger
          icon={<CloseOutlined />}
          onClick={() => onRemove && onRemove(record.id)}
        />
      ),
    },
  ];

  // DataSource
  const dataSource = participants.map(p => ({
    key: p.id,
    pseudo: p.pseudo,
    email: p.email,
    role: p.role || 'Participant',
    id: p.id,
  }));

  return (
    <Card
      title="👥 Participants"
      extra={
        <Button icon={<PlusOutlined />} onClick={onAdd}>
          Ajouter
        </Button>
      }
      style={{ marginTop: 24 }}
    >
      <Table columns={columns} dataSource={dataSource} pagination={false} />
    </Card>
  );
};

export default EventParticipants;
