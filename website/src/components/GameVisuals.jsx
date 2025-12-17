import { Card, Image, Space, Button, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const GameVisuals = ({ banner, grid, logo, onAdd }) => {
  return (
    <Card style={{ marginTop: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        {banner && (
          <>
            <div>
              <Title level={4} style={{ marginBottom: 8 }}>Banner</Title>
              <Image
                src={banner.url}
                alt="Banner"
                width={500}
              />
            </div>
          </>
        )}

        {grid && (
          <>
            <div>
              <Title level={4} style={{ marginBottom: 8 }}>Grid</Title>
              <Image
                src={grid.url}
                alt="Grid"
                width={300}
              />
            </div>
          </>
        )}

        {logo && (
          <>
            <div>
              <Title level={4} style={{ marginBottom: 8 }}>Logo</Title>
              <Image
                src={logo.url}
                alt="Logo"
                width={150}
              />
            </div>
          </>
        )}

        {!banner && !grid && !logo && (
          <Text type="secondary">Aucune image disponible</Text>
        )}

        {onAdd && <Button icon={<PlusOutlined />} onClick={onAdd}>Ajouter une image</Button>}
      </Space>
    </Card>
  );
};

export default GameVisuals;
