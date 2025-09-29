import React, { useState } from 'react';
import { Layout, Tabs, Typography, Row, Col } from 'antd';
import BlockageList from './BlockageList';
import BlockageForm from './BlockageForm';

const { Title } = Typography;
const { Content } = Layout;
const { TabPane } = Tabs;

const BlockagesPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [formVisible, setFormVisible] = useState(false);

  return (
    <Layout>
      <Content className="site-layout-content">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Title level={2}>Gestion des blocages</Title>
          </Col>
          
          <Col span={24}>
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              tabBarExtraContent={
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setFormVisible(true)}
                >
                  Créer un blocage
                </Button>
              }
            >
              <TabPane tab="Tous les blocages" key="all">
                <BlockageList />
              </TabPane>
              <TabPane tab="Mes blocages" key="my">
                <BlockageList filterByCurrentUser={true} />
              </TabPane>
              <TabPane tab="Blocages critiques" key="critical">
                <BlockageList filterByPriority="critical" />
              </TabPane>
            </Tabs>
          </Col>
        </Row>

        <Modal
          visible={formVisible}
          footer={null}
          onCancel={() => setFormVisible(false)}
          destroyOnClose={true}
          width={700}
        >
          <BlockageForm
            onCancel={() => setFormVisible(false)}
            // Note: cette page nécessite de sélectionner l'entité et l'étape à bloquer
            // Vous pouvez ajouter des sélecteurs dans le formulaire pour cette page
          />
        </Modal>
      </Content>
    </Layout>
  );
};

export default BlockagesPage;