import { Button, Popconfirm, Space, Tag } from "antd";
import dayjs from "dayjs";

export const buildUsersColumns = ({ onView, onEdit, onDelete }) => [
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
        title: "",
        align: "right",
        render: (_, record) => (
            <Space>
                <Button size="small" onClick={() => onView(record)}>
                    Voir
                </Button>

                <Button size="small" onClick={() => onEdit(record)}>
                    Modifier
                </Button>

                <Popconfirm
                    title="Supprimer cet utilisateur ?"
                    okText="Supprimer"
                    cancelText="Annuler"
                    onConfirm={() => onDelete(record)}
                >
                    <Button size="small" danger>
                        Supprimer
                    </Button>
                </Popconfirm>
            </Space>
        ),
    },
];
