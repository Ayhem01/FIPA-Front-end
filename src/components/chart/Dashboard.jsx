import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Spin, Alert, Card, Statistic,Table } from "antd";
import TreemapChart from "./TreemapChart";
import StatsChart from "./StatsChart";
import MapChart from "./MapChart";
import InvestmentBySectorChart from "./InvestmentBySectorChart";
import LineChart from "./lineChart";
import FunnelChart from "./FunnelChart";
import HeatmapChart from "./HeatmapChart";



import {
  fetchProjectsByStatus,
  fetchActionsTreemapData,
  fetchInvitesByCountry,
//   fetchProjectsBySector,
  fetchTotalJobs,
  fetchInvestmentBySector,
    fetchTotalBlockedProjects,
    fetchTotalInProductionProjects,
    fetchTotalInProgressProjects,
    fetchTotalIdeaProjects,
    fetchDelayedProjects,
    fetchJobsBySector,
    fetchProjectsByMonth,
    fetchProjectsByYear,
    fetchHighInvestmentProjects,
    fetchHierarchicalProjectsBySector,
    fetchPipelineProgression,
    fetchInvestmentByRegion,
} from "../../features/dashboardSlice";
import MapChartTunisie from "./MapChartTunisie";

const Dashboard = () => {
  const dispatch = useDispatch();

  const {
    projectsByStatus,
    actionsTreemapData,
    invitesByCountry,
    // projectsBySector,
    totalJobs,
    investmentBySector,
    totalBlockedProjects,
    totalInProductionProjects,
    totalInProgressProjects,
    totalIdeaProjects,
    delayedProjects,
    jobsBySector,
    projectsByMonth,
    projectsByYear,
    highInvestmentProjects,
    hierarchicalProjectsBySector,
    pipelineProgression,
    investmentByRegion,
  } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchProjectsByStatus());
    dispatch(fetchActionsTreemapData());
    dispatch(fetchInvitesByCountry());
    // dispatch(fetchProjectsBySector());
    dispatch(fetchTotalJobs());
    dispatch(fetchInvestmentBySector());
    dispatch(fetchTotalBlockedProjects());
    dispatch(fetchTotalInProductionProjects());
    dispatch(fetchTotalInProgressProjects());
    dispatch(fetchTotalIdeaProjects());
    dispatch(fetchDelayedProjects());
    dispatch(fetchJobsBySector());
    dispatch(fetchProjectsByMonth());
    dispatch(fetchProjectsByYear());
    dispatch(fetchHighInvestmentProjects());
    dispatch(fetchHierarchicalProjectsBySector());
    dispatch(fetchPipelineProgression());
    dispatch(fetchInvestmentByRegion());
  }, [dispatch]);
  const columns = [
    {
      title: "Nom du projet",
      dataIndex: "title",
      key: "name",
    },
    {
      title: "Montant de l'investissement",
      dataIndex: "investment_amount",
      key: "investment_amount",
      render: (amount) => `${amount.toLocaleString()} EUR`, // Formatage des montants
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
  ];

  return (
    <div className="dashboard-container">
      <Row gutter={[16, 16]}>
        {/* Total Jobs */}
        <Col xs={24} sm={12} lg={4}>
  <Card>
    {totalJobs.loading ? (
      <Spin size="large" />
    ) : totalJobs.error ? (
      <Alert message="Erreur" description={totalJobs.error} type="error" showIcon />
    ) : (
      <Statistic
        title="Total Jobs"
        value={totalJobs.data?.total_jobs || 0} // Accéder à `total_jobs` dans l'objet retourné
        valueStyle={{ color: "#1890ff" }}
      />
    )}
  </Card>
</Col>

<Col xs={24} sm={12} lg={4}>
  <Card>
    {totalBlockedProjects.loading ? (
      <Spin size="large" />
    ) : totalBlockedProjects.error ? (
      <Alert message="Erreur" description={totalBlockedProjects.error} type="error" showIcon />
    ) : (
      <Statistic
        title="Blocked Projects"
        value={totalBlockedProjects.data?.total_blocked_projects || 0} // Accéder à `total_blocked_projects`
        valueStyle={{ color: "#ff4d4f" }}
      />
    )}
  </Card>
</Col>

<Col xs={24} sm={12} lg={4}>
  <Card>
    {totalInProductionProjects.loading ? (
      <Spin size="large" />
    ) : totalInProductionProjects.error ? (
      <Alert
        message="Erreur"
        description={totalInProductionProjects.error}
        type="error"
        showIcon
      />
    ) : (
      <Statistic
        title="In Production Projects"
        value={totalInProductionProjects.data?.total_in_production_projects || 0} // Accéder à `total_in_production_projects`
        valueStyle={{ color: "#52c41a" }}
      />
    )}
  </Card>
</Col>

<Col xs={24} sm={12} lg={4}>
  <Card>
    {totalInProgressProjects.loading ? (
      <Spin size="large" />
    ) : totalInProgressProjects.error ? (
      <Alert
        message="Erreur"
        description={totalInProgressProjects.error}
        type="error"
        showIcon
      />
    ) : (
      <Statistic
        title="In Progress Projects"
        value={totalInProgressProjects.data?.total_in_progress_projects || 0} // Accéder à `total_in_progress_projects`
        valueStyle={{ color: "#1890ff" }}
      />
    )}
  </Card>
</Col>

<Col xs={24} sm={12} lg={4}>
  <Card>
    {totalIdeaProjects.loading ? (
      <Spin size="large" />
    ) : totalIdeaProjects.error ? (
      <Alert
        message="Erreur"
        description={totalIdeaProjects.error}
        type="error"
        showIcon
      />
    ) : (
      <Statistic
        title="Idea Projects"
        value={totalIdeaProjects.data?.total_idea_projects || 0} // Accéder à `total_idea_projects`
        valueStyle={{ color: "#faad14" }}
      />
    )}
  </Card>
</Col>
<Col xs={24} sm={12} lg={4}>
          <Card>
            {delayedProjects.loading ? (
              <Spin size="large" />
            ) : delayedProjects.error ? (
              <Alert message="Erreur" description={delayedProjects.error} type="error" showIcon />
            ) : (
              <Statistic
                title="Delayed Projects"
                value={delayedProjects.data?.total_delayed_projects || 0} // Accéder à `total_delayed_projects` dans l'objet retourné
                valueStyle={{ color: "#ff4d4f" }}
              />
            )}
          </Card>
        </Col>


        {/* Investment by Sector */}
        <Col xs={24} lg={12}>
          <Card>
            {investmentBySector.loading ? (
              <Spin size="large" />
            ) : investmentBySector.error ? (
              <Alert
                message="Erreur"
                description={investmentBySector.error}
                type="error"
                showIcon
              />
            ) : Array.isArray(investmentBySector.data) && investmentBySector.data.length > 0 ? (
              <InvestmentBySectorChart data={investmentBySector.data} />
            ) : (
              <Alert message="Aucune donnée disponible" type="info" showIcon />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
  <Card>
    {jobsBySector.loading ? (
      <Spin size="large" />
    ) : jobsBySector.error ? (
      <Alert message="Erreur" description={jobsBySector.error} type="error" showIcon />
    ) : Array.isArray(jobsBySector.data) && jobsBySector.data.length > 0 ? (
      <StatsChart
        data={jobsBySector.data.map((item) => ({
          name: item.sector, 
          value: parseInt(item.jobs, 10), 
        }))}
        title="Jobs by Sector"
        type="bar" 
      />
    ) : (
      <Alert message="Aucune donnée disponible" type="info" showIcon />
    )}
  </Card>
</Col>

        {/* Jobs by Sector */}
        {/* <Col xs={24} sm={12} lg={8}>
          <Card>
            {projectsBySector.loading ? (
              <Spin size="large" />
            ) : projectsBySector.error ? (
              <Alert message="Erreur" description={projectsBySector.error} type="error" showIcon />
            ) : (
              <StatsChart
                data={projectsBySector.data.map((item) => ({
                  name: item.sector,
                  value: item.count,
                }))}
                title="Projects by Sector"
                type="bar"
              />
            )}
          </Card>
        </Col> */}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* Treemap Chart */}
        <Col xs={24} lg={12}>
          {actionsTreemapData.loading ? (
            <Spin size="large" />
          ) : actionsTreemapData.error ? (
            <Alert message="Erreur" description={actionsTreemapData.error} type="error" showIcon />
          ) : actionsTreemapData.data.length > 0 ? (
            <TreemapChart data={actionsTreemapData.data} />
          ) : (
            <Alert message="Aucune donnée disponible" type="info" showIcon />
          )}
        </Col>
        <Col xs={24} lg={12}>
          <Card>
            {projectsByStatus.loading ? (
              <Spin size="large" />
            ) : projectsByStatus.error ? (
              <Alert message="Erreur" description={projectsByStatus.error} type="error" showIcon />
            ) : Array.isArray(projectsByStatus.data) && projectsByStatus.data.length > 0 ? (
              <StatsChart
                data={projectsByStatus.data.map((item) => ({
                  name: item.status, // Nom du statut
                  value: item.count, // Nombre de projets
                }))}
                title="Projects by Status"
                type="pie" // Type de graphique (pie, bar, etc.)
              />
            ) : (
              <Alert message="Aucune donnée disponible" type="info" showIcon />
            )}
          </Card>
        </Col>

        {/* Map Chart */}
        <Col xs={24} lg={12}>
  {invitesByCountry.loading ? (
    <Spin size="large" />
  ) : invitesByCountry.error ? (
    <Alert message="Erreur" description={invitesByCountry.error} type="error" showIcon />
  ) : Array.isArray(invitesByCountry.data) && invitesByCountry.data.length > 0 ? (
    <MapChart data={invitesByCountry.data} /> // Utiliser directement `data`
  ) : (
    <Alert message="Aucune donnée disponible" type="info" showIcon />
  )}
</Col>
<Col xs={24} lg={12}>
          <Card>
            {projectsByMonth.loading ? (
              <Spin size="large" />
            ) : projectsByMonth.error ? (
              <Alert message="Erreur" description={projectsByMonth.error} type="error" showIcon />
            ) : Array.isArray(projectsByMonth.data) && projectsByMonth.data.length > 0 ? (
              <LineChart
                data={projectsByMonth.data.map((item) => ({
                  name: item.month || "Unknown", // Utiliser "Unknown" si `month` est null
                  value: item.projects, // Nombre de projets
                }))}
                title="Projects by Month"
              />
            ) : (
              <Alert message="Aucune donnée disponible" type="info" showIcon />
            )}
          </Card>
        </Col>
         {/* Projects by Year */}
         <Col xs={24} lg={12}>
          <Card>
            {projectsByYear.loading ? (
              <Spin size="large" />
            ) : projectsByYear.error ? (
              <Alert message="Erreur" description={projectsByYear.error} type="error" showIcon />
            ) : Array.isArray(projectsByYear.data) && projectsByYear.data.length > 0 ? (
              <LineChart
                data={projectsByYear.data.map((item) => ({
                  name: item.year.toString(), // Année
                  value: item.projects, // Nombre de projets
                }))}
                title="Projects by Year"
              />
            ) : (
              <Alert message="Aucune donnée disponible" type="info" showIcon />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card>
            {highInvestmentProjects.loading ? (
              <Spin size="large" />
            ) : highInvestmentProjects.error ? (
              <Alert
                message="Erreur"
                description={highInvestmentProjects.error}
                type="error"
                showIcon
              />
            ) : Array.isArray(highInvestmentProjects.data) &&
              highInvestmentProjects.data.length > 0 ? (
              <Table
                dataSource={highInvestmentProjects.data}
                columns={columns}
                rowKey="id" // Assurez-vous que chaque projet a un identifiant unique
                pagination={{ pageSize: 5 }}
              />
            ) : (
              <Alert message="Aucune donnée disponible" type="info" showIcon />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
  <Card>
    {hierarchicalProjectsBySector.loading ? (
      <Spin size="large" />
    ) : hierarchicalProjectsBySector.error ? (
      <Alert
        message="Erreur"
        description={hierarchicalProjectsBySector.error}
        type="error"
        showIcon
      />
    ) : Array.isArray(hierarchicalProjectsBySector.data) &&
      hierarchicalProjectsBySector.data.length > 0 ? (
      <TreemapChart
        data={hierarchicalProjectsBySector.data}
        title="Hierarchical Projects by Sector"
      />
    ) : (
      <Alert message="Aucune donnée disponible" type="info" showIcon />
    )}
  </Card>
</Col>
<Col xs={24} lg={12}>
  <Card>
    {pipelineProgression.loading ? (
      <Spin size="large" />
    ) : pipelineProgression.error ? (
      <Alert
        message="Erreur"
        description={pipelineProgression.error}
        type="error"
        showIcon
      />
    ) : Array.isArray(pipelineProgression.data) &&
      pipelineProgression.data.length > 0 ? (
      <FunnelChart
        data={pipelineProgression.data} // Les données triées sont utilisées ici
        title="Pipeline Progression"
      />
    ) : (
      <Alert message="Aucune donnée disponible" type="info" showIcon />
    )}
  </Card>
</Col>

<Col xs={24} lg={12}>
  <Card>
    {investmentByRegion.loading ? (
      <Spin size="large" />
    ) : investmentByRegion.error ? (
      <Alert
        message="Erreur"
        description={investmentByRegion.error}
        type="error"
        showIcon
      />
    ) : Array.isArray(investmentByRegion.data) &&
      investmentByRegion.data.length > 0 ? (
      <MapChartTunisie
        data={investmentByRegion.data}
        title="Investment by Region"
      />
    ) : (
      <Alert message="Aucune donnée disponible" type="info" showIcon />
    )}
  </Card>
</Col>
      </Row>
    </div>
  );
};

export default Dashboard;