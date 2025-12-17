import { Card, Tag, Button, Space, Input } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { useState } from 'react';

const GamePlatforms = ({ platforms = [], onAdd, onRemove }) => {
  const [newPlatform, setNewPlatform] = useState('');

  const commonPlatforms = ['PC', 'Switch', 'PlayStation', 'Xbox', 'Steam', 'Mobile', 'Mac', 'Linux'];

  const handleAddPlatform = (platform) => {
    if (onAdd && !platforms.includes(platform)) {
      onAdd(platform);
    }
    setNewPlatform('');
  };

  return (
    <Card 
      title="Platformes" 
      style={{ marginTop: 24 }}
    >
      <Space wrap style={{ marginBottom: 16 }}>
        {platforms && platforms.length > 0 && platforms.map((platform, idx) => (
          <Tag
            key={idx}
            closable={!!onRemove}
            onClose={() => onRemove && onRemove(idx)}
          >
            {platform}
          </Tag>
        ))}
      </Space>

      {onAdd && (
        <Space style={{ marginTop: 16 }}>
          <Input
            placeholder="Ajouter une platforme..."
            value={newPlatform}
            onChange={(e) => setNewPlatform(e.target.value)}
            onPressEnter={() => handleAddPlatform(newPlatform)}
          />
          <Button
            icon={<PlusOutlined />}
            onClick={() => handleAddPlatform(newPlatform)}
          >
            Ajouter
          </Button>
        </Space>
      )}

      {onAdd && (
        <div style={{ marginTop: 12 }}>
          <small style={{ color: '#999' }}>Suggestions :</small>
          <Space wrap style={{ marginTop: 8 }}>
            {commonPlatforms
              .filter(p => !platforms || !platforms.includes(p))
              .map((p) => (
                <Tag
                  key={p}
                  onClick={() => handleAddPlatform(p)}
                  style={{ cursor: 'pointer' }}
                >
                  + {p}
                </Tag>
              ))}
          </Space>
        </div>
      )}
    </Card>
  );
};

export default GamePlatforms;
