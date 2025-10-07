import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  Row, Col, Spin, Alert, Card, Statistic, Table, Typography, 
  Button, Space, Input, Select, DatePicker, Tooltip, Badge,
  Progress, Avatar, Tag, Skeleton, Empty, Divider, Grid
} from "antd";
import {
  TrophyOutlined, ProjectOutlined, TeamOutlined, DollarOutlined,
  RiseOutlined, FallOutlined, EyeOutlined, ReloadOutlined,
  SearchOutlined, FilterOutlined, CalendarOutlined, ExportOutlined,
  ArrowUpOutlined, ArrowDownOutlined, PlusOutlined, SettingOutlined,
  ThunderboltOutlined, ClockCircleOutlined, CheckCircleOutlined,
  ExclamationCircleOutlined, SyncOutlined, FireOutlined,
  UserOutlined, ContactsOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";

import MapChart from "./MapChart";
import {
  fetchInvitesByCountry,
  fetchInviteStats,
} from "../../features/dashboardSlice";

const { Title } = Typography;

const DashboardInvite = () => {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);

  const {
    invitesByCountry,
    inviteStats,
  } = useSelector((state) => state.dashboard);

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const loadData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchInvitesByCountry()),
        dispatch(fetchInviteStats()),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // Add your AnimatedChartCard component here or import it
  const AnimatedChartCard = ({ title, loading, delay, children }) => (
    <Card title={title} loading={loading}>
      {children}
    </Card>
  );

  // Function to get percentage change color and icon
  const getChangeDisplay = (current, previous) => {
    if (!previous || previous === 0) return { icon: null, color: 'default' };
    
    const percentage = ((current - previous) / previous) * 100;
    const isPositive = percentage > 0;
    
    return {
      icon: isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />,
      color: isPositive ? 'green' : 'red',
      percentage: Math.abs(percentage).toFixed(1)
    };
  };

 // ...existing code...

 return (
    <div>
      {/* Statistics Cards */}
      {inviteStats.data && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Invités"
                value={inviteStats.data.total || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Convertis"
                value={inviteStats.data.convertis || 0}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
                suffix={
                  inviteStats.data.total > 0 && (
                    <span style={{ fontSize: '14px', color: '#666' }}>
                      ({Math.round((inviteStats.data.convertis / inviteStats.data.total) * 100)}%)
                    </span>
                  )
                }
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Nouveaux ce mois"
                value={inviteStats.data.ce_mois || 0}
                prefix={<PlusOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Taux de Conversion"
                value={inviteStats.data.taux_conversion || 0}
                precision={1}
                suffix="%"
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Map Chart */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <AnimatedChartCard
            title="Invités par Pays"
            loading={invitesByCountry.loading || inviteStats.loading}
            delay={1}
          >
            {invitesByCountry.error ? (
              <Alert 
                message="Erreur" 
                description={invitesByCountry.error} 
                type="error" 
                showIcon 
              />
            ) : Array.isArray(invitesByCountry.data) && invitesByCountry.data.length > 0 ? (
              <MapChart data={invitesByCountry.data} />
            ) : (
              <Empty description="Aucune donnée disponible" />
            )}
          </AnimatedChartCard>
        </Col>

        {/* Additional Stats Card */}
        <Col xs={24} lg={12}>
          <AnimatedChartCard
            title="Détails des Statistiques"
            loading={inviteStats.loading}
            delay={2}
          >
            {inviteStats.error ? (
              <Alert 
                message="Erreur" 
                description={inviteStats.error} 
                type="error" 
                showIcon 
              />
            ) : inviteStats.data ? (
              <div>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic
                      title="En Pipeline"
                      value={inviteStats.data.en_pipeline || 0}
                      prefix={<ClockCircleOutlined />}
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Col>
                  
                  <Col span={12}>
                    <Statistic
                      title="Suivi Requis"
                      value={inviteStats.data.suivi_requis || 0}
                      prefix={<ExclamationCircleOutlined />}
                      valueStyle={{ color: '#f5222d' }}
                    />
                  </Col>
                  
                  <Col span={12}>
                    <Statistic
                      title="Aujourd'hui"
                      value={inviteStats.data.aujourd_hui || 0}
                      prefix={<ContactsOutlined />}
                      valueStyle={{ color: '#13c2c2' }}
                    />
                  </Col>
                  
                  <Col span={12}>
                    <Statistic
                      title="Moyenne par Jour"
                      value={inviteStats.data.moyenne_par_jour || 0}
                      precision={1}
                      prefix={<SyncOutlined />}
                      valueStyle={{ color: '#eb2f96' }}
                    />
                  </Col>
                  
                  <Col span={12}>
                    <Statistic
                      title="Cette Semaine"
                      value={inviteStats.data.cette_semaine || 0}
                      prefix={<CalendarOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                </Row>
              </div>
            ) : (
              <Empty description="Aucune statistique disponible" />
            )}
          </AnimatedChartCard>
        </Col>
      </Row>
    </div>
  );

};

export default DashboardInvite;