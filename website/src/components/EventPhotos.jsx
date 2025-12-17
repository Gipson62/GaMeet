import { Card, Image, Space, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const EventPhotos = ({ photos = [], onAdd }) => {
  return (
    <Card
      title="📸 Photos de l'événement"
      extra={<Button icon={<PlusOutlined />} onClick={onAdd}>Ajouter</Button>}
      style={{ marginTop: 24 }}
    >
      {photos.length === 0 ? (
        <p>Aucune photo disponible</p>
      ) : (
        <Space wrap>
          {photos.map(photo => (
            <Image
              key={photo.id}
              src={photo.url} // ou photo.path selon ce que renvoie l'API
              alt={`Photo ${photo.id}`}
              width={200}
            />
          ))}
        </Space>
      )}
    </Card>
  );
};

export default EventPhotos;
