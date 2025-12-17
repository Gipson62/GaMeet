import { Table, Button, Space, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const TagsTable = ({ tags, loading, onDelete }) => {
  const columns = [
    {
      title: 'Nom',
      dataIndex: 'name',
      render: text => <strong>{text}</strong>,
    },
    {
      title: '',
      render: (record) => (
        <Space>
          <Popconfirm
            title="Supprimer ce tag ?"
            onConfirm={() => onDelete(record.name)}
            okText="Oui"
            cancelText="Non"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={tags}
      rowKey={(row) => row.name}
      loading={loading}
      pagination={{ pageSize: 10 }}
    />
  );
};

export default TagsTable;
