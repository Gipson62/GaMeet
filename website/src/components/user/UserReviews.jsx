import { Card, Table } from "antd";
import { reviewColumns } from "./UserColumns.jsx";


const UserReviews = ({ reviews }) => {
    return (
        <Card title="Avis postés">
            <Table
                rowKey="id"
                pagination={false}
                columns={reviewColumns}
                dataSource={reviews}
            />
        </Card>
    );
}
export default UserReviews;