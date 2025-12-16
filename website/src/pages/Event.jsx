import { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Input, Typography, Card } from 'antd';
import { PlusOutlined, ReloadOutlined, SettingOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Search } = Input;

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/v1/event', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();

      // Mapper les données pour correspondre aux colonnes du tableau
      const mappedData = data.map(event => ({
        id: event.id,
        name: event.name,
        date: event.scheduled_date,
        location: event.location,
        capacity: event.max_capacity,
        participants: event._count?.participant || 0, // nouveau champ
        games: event.event_game?.map(eg => eg.game.name) || [],
      }));

      setEvents(mappedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const columns = [
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
      render: text => <strong>{text}</strong>,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Lieu',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Capacité',
      dataIndex: 'capacity',
      key: 'capacity',
    },
    {
      title: 'Participants',
      dataIndex: 'participants',
      key: 'participants',
    },
    {
      title: 'Jeu(x)',
      dataIndex: 'games',
      key: 'games',
      render: games => games.map(game => <Tag key={game}>{game}</Tag>),
    },
    {
      title: '',
      key: 'actions',
      render: () => (
        <Space>
          <Button icon={<SettingOutlined />} />
          <Button danger icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ];

  return (
    <Card style={{ margin: 24 }}>
      {/* HEADER */}
      <Space
        style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}
      >
        <Title level={3}>GameEvents Admin</Title>

        <Space>
          <Search placeholder="Rechercher un événement..." allowClear />
          <Button icon={<ReloadOutlined />} onClick={fetchEvents}>
            Actualiser
          </Button>
          <Button type="primary" icon={<PlusOutlined />}>
            Ajouter un événement
          </Button>
        </Space>
      </Space>

      {/* TABLE */}
      <Table
        columns={columns}
        dataSource={events}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
      />
    </Card>
  );
};

export default AdminEvents;
