import { Card, Typography, Space } from 'antd';

const { Title, Text } = Typography;

const GameInfo = ({ description, releaseDate, studio, publisher }) => {
  return (
    <Card style={{ marginTop: 24 }}>
      {description && (
        <>
          <Title level={4}>Description</Title>
          <Text>{description}</Text>
        </>
      )}

      <Space style={{ marginTop: 16 }} direction="vertical">
        {releaseDate && (
          <Text>
            <strong>Date de sortie :</strong> {new Date(releaseDate).toLocaleDateString()}
          </Text>
        )}
        {studio && (
          <Text>
            <strong>Studio :</strong> {studio}
          </Text>
        )}
        {publisher && (
          <Text>
            <strong>Éditeur :</strong> {publisher}
          </Text>
        )}
      </Space>
    </Card>
  );
};

export default GameInfo;
