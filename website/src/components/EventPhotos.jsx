import { Card, Image, Space, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const EventPhotos = ({ photos = [] }) => {
  return (
    <Card
<<<<<<< HEAD
      title="Photos de l'événement"
      
=======
      title="📸 Photos de l'événement"

>>>>>>> c55304d293126b1d98634b7bed9e5e73f21e1629
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
