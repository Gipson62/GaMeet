import { Card, Tag, Button, Space, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';

const GameTags = ({ tags = [], onAdd, onRemove }) => {
  const [newTag, setNewTag] = useState('');

  const commonTags = ['RPG', 'Action', 'Adventure', 'Indie', 'Platformer', 'Puzzle', 'Sports', 'Stratégie', 'Simulation', 'Difficile'];

  const handleAddTag = (tag) => {
    if (onAdd && tag.trim()) {
      onAdd(tag);
    }
    setNewTag('');
  };

  const tagNames = tags && tags.map(t => t.tag_name);

  return (
    <Card 
      title="Tags" 
      style={{ marginTop: 24 }}
    >
      <Space wrap style={{ marginBottom: 16 }}>
        {tagNames && tagNames.length > 0 && tagNames.map((tagName, idx) => (
          <Tag
            key={idx}
            closable={!!onRemove}
            onClose={() => onRemove && onRemove(idx)}
          >
            {tagName}
          </Tag>
        ))}
      </Space>

      {onAdd && (
        <Space style={{ marginTop: 16 }}>
          <Input
            placeholder="Ajouter un tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onPressEnter={() => handleAddTag(newTag)}
          />
          <Button
            icon={<PlusOutlined />}
            onClick={() => handleAddTag(newTag)}
          >
            Ajouter
          </Button>
        </Space>
      )}

      {onAdd && (
        <div style={{ marginTop: 12 }}>
          <small style={{ color: '#999' }}>Suggestions :</small>
          <Space wrap style={{ marginTop: 8 }}>
            {commonTags
              .filter(t => !tagNames || !tagNames.includes(t))
              .map((t) => (
                <Tag
                  key={t}
                  onClick={() => handleAddTag(t)}
                  style={{ cursor: 'pointer' }}
                >
                  + {t}
                </Tag>
              ))}
          </Space>
        </div>
      )}
    </Card>
  );
};

export default GameTags;
