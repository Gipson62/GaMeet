import {Button, Popconfirm, Space, Table, Tag} from "antd";
import dayjs from "dayjs";
import {DeleteOutlined, SettingOutlined} from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';

const UsersTable = ({ users, loading, onDelete }) => {
    const navigate = useNavigate();
    const columns = [
    {
        title: "Pseudo",
        dataIndex: "pseudo",
        render: (v) => v || "-",
    },
    {
        title: "Date de naissance",
        dataIndex: "birth_date",
        render: (d) => (d ? dayjs(d).format("DD/MM/YYYY") : "-"),
    },
    {
        title: "Email",
        dataIndex: "email",
        render: (v) => v || "-",
    },
    {
        title: "Rôle",
        dataIndex: "is_admin",
        render: (v) =>
            v ? <Tag color="blue">Administrateur</Tag> : <Tag>Membre</Tag>,
    },
    {
        title: '',
        render: (record) => (
            <Space>
                <Button icon={<SettingOutlined />} onClick={() => navigate(`/user/${record.id}`)} />
                <Popconfirm
                    title="Voulez-vous vraiment supprimer cette utilisateur ?"
                    onConfirm={() => onDelete(record.id)}
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
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
    />
);
};

export default UsersTable;
