import { Card, Rate, Button, Typography, Divider } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Text } = Typography;

const EventReviews = ({ reviews = [], onAdd, onDelete }) => {
  return (
    <Card
      title="💬 Avis / Reviews"
      extra={<Button icon={<PlusOutlined />} onClick={onAdd}>Ajouter</Button>}
      style={{ marginTop: 24 }}
    >
      {reviews.length === 0 ? (
        <p>Aucun avis pour l’instant</p>
      ) : (
        reviews.map(review => (
          <div key={review.id} style={{ marginBottom: 16 }}>
            <Text strong>
              {review.User?.pseudo} — {new Date(review.createdAt).toLocaleDateString()}
            </Text>
            <br />
            <Rate disabled value={review.rating || 0} />
            <p>{review.comment}</p>
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => onDelete && onDelete(review.id)}
            >
              Supprimer
            </Button>
            <Divider />
          </div>
        ))
      )}
    </Card>
  );
};

export default EventReviews;
