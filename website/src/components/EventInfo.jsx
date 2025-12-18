import { Card, Typography, Space } from 'antd';

const { Title, Text } = Typography;

const EventInfo = ({ name, description, date, location, capacity, participantsCount }) => {
  return (
    <Card style={{ marginTop: 24 }}>
      <Title level={3}>{name}</Title>
      {description && <Text>{description}</Text>}

      <Space style={{ marginTop: 16 }}>
        
        {date && <Text><strong>Date :</strong> {new Date(date).toLocaleString()}</Text>}
        {location && <Text><strong>Lieu :</strong> {location}</Text>}
        {capacity !== undefined && participantsCount !== undefined && (
          <Text>
            <strong>Capacité :</strong> {participantsCount} / {capacity} participants
          </Text>
        )}
      </Space>
    </Card>
  );
};

export default EventInfo;
