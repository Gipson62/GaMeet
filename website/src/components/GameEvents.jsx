import { Card, List, Button, Tag } from 'antd';
import { EyeOutlined, CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const GameEvents = ({ events = [] }) => {
  const navigate = useNavigate();

  return (
    <Card
      title="Événements liés"
      style={{ marginTop: 24 }}
    >
      {events && events.length > 0 ? (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }}
          dataSource={events}
          rowKey={(record) => record.event.id}
          renderItem={(record) => (
            <List.Item>
              <div style={{
                padding: 12,
                border: '1px solid #d9d9d9',
                borderRadius: '8px',
                background: '#fff',
                height: '100%'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Tag color="blue">Event</Tag>
                  <strong style={{ color: '#000' }}>{record.event.name}</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, color: '#666', fontSize: '13px', marginBottom: 12 }}>
                  <span><CalendarOutlined /> {record.event.scheduled_date ? new Date(record.event.scheduled_date).toLocaleDateString() : '-'}</span>
                  <span><EnvironmentOutlined /> {record.event.location || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/event/${record.event.id}`)}>Voir</Button>
                </div>
              </div>
            </List.Item>
          )}
        />
      ) : (
        <p>Aucun événement associé</p>
      )}
    </Card>
  );
};

export default GameEvents;
