import { Button, Input, Space, Typography } from "antd";
import { ReloadOutlined, PlusOutlined } from "@ant-design/icons";

const { Title } = Typography;

const UsersHeader = ({title = "Users Admin", searchValue,onSearchChange, onRefresh, onAdd }) =>{
    return (
        <Space
            align="start"
            style={{
                width: "100%",
                justifyContent: "space-between",
                marginBottom: 16,
            }}
        >
            <Title level={3} style={{ margin: 0 }}>
                {title}
            </Title>

            <Space>
                <Input
                    placeholder="Rechercher un utilisateur..."
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    style={{ width: 260 }}
                    allowClear
                />

                <Button icon={<ReloadOutlined />} onClick={onRefresh}>
                    Actualiser
                </Button>

                <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
                    Ajouter un utilisateur
                </Button>
            </Space>
        </Space>
    );
}
export default UsersHeader;