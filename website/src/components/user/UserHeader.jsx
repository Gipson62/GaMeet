import { Card, Space, Typography, Tag } from "antd";
import dayjs from "dayjs";


const { Title, Text } = Typography;


const UserHeader = ({ user }) => {
    return (
        <Card>
            <Space direction="vertical" size={4}>
                <Space align="center">
                    <Title level={3} style={{ margin: 0 }}>{user.pseudo}</Title>
                    <Tag color="blue">{user.is_admin ? "Administrateur" : "Utilisateur"}</Tag>
                </Space>
                <Text type="secondary">{user.email}</Text>
                <Text>{user.bio}</Text>
                <Text type="secondary">Membre depuis : {dayjs(user.creation_date).format("DD/MM/YYYY")}</Text>
            </Space>
        </Card>
    );
}
export default UserHeader;