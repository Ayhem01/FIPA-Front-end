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
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

function Tables() {
  const { t } = useTranslation();
  const changeLanguage = (checked) => {
    const language = checked ? 'fr' : 'en'; 
    i18n.changeLanguage(language); 
  };

  const columns = [
    {
      title: t('NomTable'), 
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
      title: t('AdressTable'), 
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: t('TagsTable'), 
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
      title: t('ActionTable'), 
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

  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="tabled">
        
        <Row gutter={[24, 0]}>
          <Col span={24}>
            <Card
              bordered={true}
              className="criclebox tablespace mb-24"
              title={t('CardTitle')} 
              extra={
                <Button
                  onClick={() => setOpen(true)}
                  type="primary"
                >
                  {t('Button')} 
                </Button>
              }
            >
              <div className="table-responsive">
                <Table columns={columns} dataSource={data} />
              </div>
            </Card>
          </Col>
        </Row>
        <Modal
          title={t('Button')} 
          centered
          open={open}
          onOk={() => {
            setOpen(false);
            toast.success(t('Addsuccess')); 
          }}
          onCancel={() => setOpen(false)}
          width={750}
        >
          <p>des ...</p> 
          <p>des ...</p>
          <p>des ...</p>
        </Modal>
      </div>
    </>
  );
}

export default Tables;