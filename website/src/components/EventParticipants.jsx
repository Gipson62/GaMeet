import { Card, Table, Button, Modal, Form, Select } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { fetchUsers } from '../api/api';

const EventParticipants = ({ participants = [], onDelete, onAdd }) => {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [form] = Form.useForm();
  const token = localStorage.getItem('token');
  const availableUsers = Array.isArray(users) ? users.filter(
  u => !participants.some(p => p.id === u.id)
) : [];
  useEffect(() => {
    if (!open) return;

    fetchUsers(token)
      .then(setUsers)
      .catch(console.error);
  }, [open]);

  const columns = [
    { title: 'Pseudo', dataIndex: 'pseudo' },
    { title: 'Email', dataIndex: 'email' },
    {
      title: 'Actions',
      render: (_, record) => (
        <Button
          danger
          icon={<CloseOutlined />}
          onClick={() => onDelete(record.id)}
        />
      ),
    },
  ];

  const handleSubmit = async () => {
    const { user_id } = await form.validateFields();
    await onAdd(user_id);
    form.resetFields();
    setOpen(false);
  };

  return (
    <>
      <Card
        title="👥 Participants"
        extra={
          <Button icon={<PlusOutlined />} onClick={() => setOpen(true)}>
            Ajouter
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={participants.map(p => ({
            key: p.id,
            ...p,
          }))}
          pagination={false}
        />
      </Card>

      <Modal
        title="Ajouter un participant"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Utilisateur"
            name="user_id"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Sélectionnez un utilisateur"
              options={availableUsers.map(u => ({
                label: `${u.pseudo} (${u.email})`,
                value: u.id,
              }))}
            />


          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default EventParticipants;
