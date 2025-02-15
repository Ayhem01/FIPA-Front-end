import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Space,
  Modal,
  Tag,
} from "antd";
import { useState } from "react";
import toast from "react-hot-toast";

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text) => <a>{text}</a>,
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: 'Tags',
    key: 'tags',
    dataIndex: 'tags',
    render: (_, { tags }) => (
      <>
        {tags.map((tag) => {
          let color = tag.length > 5 ? 'geekblue' : 'green';
          if (tag === 'loser') {
            color = 'volcano';
          }
          return (
            <Tag color={color} key={tag}>
              {tag.toUpperCase()}
            </Tag>
          );
        })}
      </>
    ),
  },
  {
    title: 'Action',
    key: 'action',
    render: (_, record) => (
      <Space size="middle">
        <a>Invite {record.name}</a>
        <a>Delete</a>
      </Space>
    ),
  },
];
const data = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    tags: ['loser'],
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sydney No. 1 Lake Park',
    tags: ['cool', 'teacher'],
  },
];
function Tables() {

  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="tabled">
      <Row gutter={[24, 0]}>
  <Col span={24}>
    <Card
      bordered={true}
      className="criclebox tablespace mb-24"
      title="Titre"
      extra={<Button
        onClick={() => setOpen(true)}
        type="primary"
        // icon={<PlusOutlined />}
      >
        Ajouter...
      </Button>}
    >
      <div className="table-responsive">
      <Table columns={columns} dataSource={data} />
      </div>
    </Card>
  </Col>
</Row>
<Modal
        title="Ajouter..."
        centered
        open={open}
        onOk={() => {setOpen(false);toast.success("Ajouter avec succès")}}
        onCancel={() => setOpen(false)}
        width={750}
      >
        <p> desc...</p>
        <p> desc...</p>
        <p> desc...</p>
      </Modal>
      </div>
    </>
  );
}

export default Tables;
