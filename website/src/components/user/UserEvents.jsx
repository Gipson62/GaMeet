import { Card, Table } from "antd";
import { eventColumns } from "./userColumns";

const UserEventsCard = ({ title, events, emptyText }) => {
    return (
        <Card title={title}>
            <Table
                rowKey="id"
                pagination={false}
                locale={emptyText ? { emptyText: "Aucun événement" } : undefined}
                columns={eventColumns}
                dataSource={events}
            />
        </Card>
    );
}
export default UserEventsCard;
