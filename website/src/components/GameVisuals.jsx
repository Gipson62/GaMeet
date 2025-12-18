import { Card, Image, Space, Typography, Row, Col } from 'antd';

const { Title, Text } = Typography;

const GameVisuals = ({ banner, grid, logo }) => {
  return (
    <Card style={{ marginTop: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={20}>
        {banner && (
          <div>
            <Title level={4} style={{ marginBottom: 8 }}>Bannière</Title>
            <div className="ratio-box ratio-banner">
              <img src={banner.url} alt="Bannière" />
            </div>
          </div>
        )}

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Title level={5} style={{ marginBottom: 8 }}>Grid</Title>
            {grid ? (
              <div className="ratio-box ratio-grid">
                <img src={grid.url} alt="Grid" />
              </div>
            ) : (
              <Text type="secondary">Aucune image grid</Text>
            )}
          </Col>
          <Col xs={24} md={12}>
            <Title level={5} style={{ marginBottom: 8 }}>Logo</Title>
            {logo ? (
              <div className="logo-box">
                <img src={logo.url} alt="Logo" />
              </div>
            ) : (
              <Text type="secondary">Aucun logo</Text>
            )}
          </Col>
        </Row>

        {!banner && !grid && !logo && (
          <Text type="secondary">Aucune image disponible</Text>
        )}
      </Space>
    </Card>
  );
};

export default GameVisuals;
