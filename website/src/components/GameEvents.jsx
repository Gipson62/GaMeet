import { Card, Table, Button, Space } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const GameEvents = ({ events = [] }) => {
  const navigate = useNavigate();

  const columns = [
    {
      title: 'Nom',
      dataIndex: ['event', 'name'],
      key: 'name',
    },
    {
      title: 'Date',
      dataIndex: ['event', 'scheduled_date'],
      key: 'date',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Lieu',
      dataIndex: ['event', 'location'],
      key: 'location',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => navigate(`/event/${record.event.id}`)}
          >
            Voir
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Événements liés"
      style={{ marginTop: 24 }}
    >
      {events && events.length > 0 ? (
        <Table
          dataSource={events}
          columns={columns}
          rowKey={(record) => record.event.id}
          pagination={false}
        />
      ) : (
        <p>Aucun événement associé</p>
      )}
    </Card>
  );
};

export default GameEvents;
