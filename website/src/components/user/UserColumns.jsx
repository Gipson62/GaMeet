import dayjs from "dayjs";


export const eventColumns = [
    {
        title: "Nom",
        dataIndex: "name",
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
];

export const reviewColumns = [
    {
        title: "Événement",
        dataIndex: "event",
        render: (event) => event?.name ?? "-",
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
