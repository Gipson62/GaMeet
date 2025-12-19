import { Table, Button, Tag, Space, Popconfirm } from 'antd';
import { SettingOutlined, DeleteOutlined, FileSearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
const EventsTable = ({ events, loading, onDelete }) => {
  const navigate = useNavigate();
  const columns = [
    {
      title: 'Nom',
      dataIndex: 'name',
      render: text => <strong>{text}</strong>,
    },
    {
      title: 'Date',
      dataIndex: 'date',
    },
    {
      title: 'Lieu',
      dataIndex: 'location',
    },
    {
      title: 'Capacité',
      dataIndex: 'capacity',
    },
    {
      title: 'Participants',
      dataIndex: 'participants',
    },
    {
      title: 'Jeu(x)',
      dataIndex: 'games',
      render: games =>
        games.map(game => <Tag key={game}>{game}</Tag>),
    },
    {
      title: '',
      render: (record) => (
        <Space>

          <Button icon={<SettingOutlined />} onClick={() => navigate(`/event/${record.id}`)} />
          <Popconfirm
            title="Voulez-vous vraiment supprimer cet événement ?"
            onConfirm={() => onDelete(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={events}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 5 }}
    />
  );
};

export default EventsTable;
