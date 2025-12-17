import { Card, Tag, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const EventGames = ({ games = [] }) => {
  return (
    <Card
      title="🎮 Jeux liés"
      extra={<Button icon={<PlusOutlined />}>Ajouter un jeu</Button>}
      style={{ marginTop: 24 }}
    >
      {games.length === 0 ? (
        <p>Aucun jeu associé</p>
      ) : (
        games.map(game => (
          <Tag key={game.id} color="blue">
            {game.name}
          </Tag>
        ))
      )}
    </Card>
  );
};

export default EventGames;
