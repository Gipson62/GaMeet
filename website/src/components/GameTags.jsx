import { Card, Tag, Button, Space, Input, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';

const GameTags = ({ tags = [], onAdd, onRemove }) => {
  const [newTag, setNewTag] = useState('');

  const handleAddTag = (tag) => {
    if (onAdd && tag.trim()) {
      onAdd(tag);
    }
    setNewTag('');
  };

  const tagNames = Array.isArray(tags)
    ? tags.map(t => (t && (t.tag_name || t.name)) || t).filter(Boolean)
    : [];

  const header = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      <span style={{ fontWeight: 600 }}>Tags</span>
      {onAdd && (
        <Space>
          <Input
            placeholder="Ajouter un tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onPressEnter={() => handleAddTag(newTag)}
            style={{ width: 220 }}
            allowClear
          />
          <Button
            icon={<PlusOutlined />}
            onClick={() => handleAddTag(newTag)}
          >
            Ajouter
          </Button>
        </Space>
      )}
    </div>
  );

  return (
    <Card 
      title={header} 
      style={{ marginTop: 24 }}
    >
      <Space wrap style={{ marginBottom: 16 }}>
        {tagNames && tagNames.length > 0 && tagNames.map((tagName, idx) => (
          <Space key={idx}>
            <Tag>{tagName}</Tag>
            {onRemove && (
              <Popconfirm
                title="Supprimer ce tag ?"
                onConfirm={() => onRemove(idx)}
                okText="Oui"
                cancelText="Non"
              >
                <Button size="small" danger>Supprimer</Button>
              </Popconfirm>
            )}
          </Space>
        ))}
      </Space>
    </Card>
  );
};

export default GameTags;
