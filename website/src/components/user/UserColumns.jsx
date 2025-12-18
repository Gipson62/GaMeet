import { Button, Typography } from "antd";
import dayjs from "dayjs";
import { Link } from "react-router-dom";

const { Text } = Typography;

export const eventColumns = [
    {
        title: "Nom",
        dataIndex: "name",
        render: (text, record) => (
            <Link to={`/event/${record.id}`}>
                {text}
            </Link>
        ),
    },
    {
        title: "Date",
        dataIndex: "scheduled_date",
        render: (d) => dayjs(d).format("DD/MM/YYYY"),
    },
    {
        title: "Lieu",
        dataIndex: "location",
    },
    {
        title: "",
        render: (_, record) => (
            <Link to={`/event/${record.id}`}>
                <Button size="small">Voir</Button>
            </Link>
        ),
    },
];

export const reviewColumns = [
    {
        title: "Événement",
        dataIndex: "event_id",
        render: (id) => <Text>{id}</Text>,
    },
    {
        title: "Note",
        dataIndex: "note",
    },
    {
        title: "Description",
        dataIndex: "description",
    },
    {
        title: "Date",
        dataIndex: "created_at",
        render: (d) => dayjs(d).format("DD/MM/YYYY"),
    },
];
