import { Card, Typography, Descriptions } from 'antd';

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

      <Descriptions
        bordered
        column={1}
        size="middle"
        style={{ marginTop: 16 }}
        labelStyle={{ width: 160, fontWeight: 600 }}
      >
        {releaseDate && (
          <Descriptions.Item label="Date de sortie">
            {new Date(releaseDate).toLocaleDateString()}
          </Descriptions.Item>
        )}
        {studio && (
          <Descriptions.Item label="Studio">{studio}</Descriptions.Item>
        )}
        {publisher && (
          <Descriptions.Item label="Éditeur">{publisher}</Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );
};

export default GameInfo;
