import { Route, BrowserRouter, Routes } from "react-router-dom";
import Tables from "./pages/Tables";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import Main from "./components/layout/Main";
import "./assets/styles/main.css";
import "./assets/styles/responsive.css";
import { ConfigProvider } from "antd";
import SignUp from "./pages/SignUp";
import ResetPassword from "./pages/ResetPassword";
import Setup2FA from "./pages/Setup2FA"; // Importer le composant Setup2FA
import Verify2FA from "./pages/Verify2FA"; // Importer le composant Verify2FA
import VerifyLogin2FA from "./pages/VerifyLogin2FA"; // Importer le composant VerifyLogin2FA
import PrivateRoute from "./components/PrivateRoute"; // Importer le composant PrivateRoute
import ChangePassword from './pages/ChangePassword';
import Media from "./components/Promotional activities/Marketing pays/Media"; // Importer le composant MediaList
import CTE from "./components/Promotional activities/Marketing pays/CTE"; // Importer le composant CTE
import Salon from "./components/Promotional activities/Marketing pays/Salon"; // Importer le composant Salons
import Seminaire from './components/Promotional activities/Marketing pays/Seminaire';
import SeminaireSecteur from "./components/Promotional activities/Marketing secteurs/SeminaireSecteur";
import SalonsSectoriels from "./components/Promotional activities/Marketing secteurs/SalonsSectoriels"; // Importer le composant SalonsSectoriels
import DemarchageDirect from './components/Promotional activities/Marketing secteurs/DemarchageDirect';
import Delegations from './components/Promotional activities/Visites et délégation/Delegations';
import VisiteEntreprise from './components/Promotional activities/Visites et délégation/VisiteEntreprise';
import TasksList from "./components/Tasks/TasksList";
import TaskCreateModal from "./components/Tasks/TaskCreateModal";
import MyTasks from "./components/Tasks/MyTasks";
import TaskDetails from "./components/Tasks/TaskDetails";
import TasksDashboard from "./components/Tasks/TasksDashboard";
import TaskCalendar from "./components/Tasks/TaskCalendar";

import InvitesList from './components/Portefeuille/InvitesList';
import InviteForm from './components/Portefeuille/InviteForm';
import InviteDetails from './components/Portefeuille/InviteDetails';


import ProjectList from "./components/PipelineProject/ProjectList";
import ProjectDetails from "./components/PipelineProject/ProjectDetails";
import ProjectForm from "./components/PipelineProject/ProjectForm";
// import ProjectDashboard from "./components/PipelineProject/ProjectDashboard";
import PipelineVisualizer from "./components/PipelineProject/PipelineVisualizer";
import ProjectStats from "./components/PipelineProject/ProjectStats";
import ProjectTasksTab from "./components/Tasks/ProjectTasksTab";
// import PipelineTypesList from "./components/PipelineProject/PipelineTypesList";
// import PipelineTypeDetails from "./components/PipelineProject/PipelineTypeDetails";
// import PipelineTypeForm from "./components/PipelineProject/PipelineTypeForm";
// import PipelineStagesList from "./components/PipelineProject/PipelineStagesList";
// import PipelineStageDetails from "./components/PipelineProject/PipelineStageDetails";
// import PipelineStageForm from "./components/PipelineProject/PipelineStageForm";
// import PipelineDashboard from "./components/PipelineProject/PipelineDashboard";
// import BlockagesList from "./components/PipelineProject/BlockagesList";
// import UpcomingFollowUps from "./components/PipelineProject/UpcomingFollowUps";



function App() {
  return (
    <ConfigProvider>
      <BrowserRouter>
        <Routes>

          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-login-2fa" element={<VerifyLogin2FA />} />


          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Main />}>
              <Route path="/tables" element={<Tables />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/setup-2fa" element={<Setup2FA />} />
              <Route path="/verify-2fa" element={<Verify2FA />} />
              <Route path="/profile/change-password" element={<ChangePassword />} />
              <Route path="/marketing-pays/media" element={<Media />} />
              <Route path="/marketing-pays/cte" element={<CTE />} />
              <Route path="/marketing-pays/salon" element={<Salon />} />
              <Route path="/marketing-pays/seminaire" element={<Seminaire />} />
              <Route path="/marketing-secteurs/seminaire-secteur" element={<SeminaireSecteur />} />
              <Route path="/marketing-secteurs/salons-sectoriels" element={<SalonsSectoriels />} />
              <Route path="/marketing-secteurs/demarchage-direct" element={<DemarchageDirect />} />
              <Route path="/visites-delegations/delegations" element={<Delegations />} />
              <Route path="/visites-delegations/visites-entreprises" element={<VisiteEntreprise />} />
              <Route path="/tasks" element={<TasksList />} />
              <Route path="/tasks/create" element={<TaskCreateModal />} />
              <Route path="/tasks/edit/:id" element={<TaskCreateModal />} />
              <Route path="/tasks/details/:id" element={<TaskDetails />} />
              <Route path="/tasks/my-tasks" element={<MyTasks />} />
              <Route path="/tasks/dashboard" element={<TasksDashboard />} />
              <Route path="/tasks/calendar" element={<TaskCalendar />} />

              <Route path="/invites" element={<InvitesList />} />
              <Route path="/invites/create" element={<InviteForm />} />
              <Route path="/invites/:id" element={<InviteDetails />} />
              <Route path="/invites/:id/edit" element={<InviteForm />} />






              <Route path="/tasks/projects" element={<ProjectTasksTab />} />

              <Route path="/projects" element={<ProjectList />} />
              <Route path="/projects/new" element={<ProjectForm />} />
              <Route path="/projects/:id" element={<ProjectDetails />} />
              <Route path="/projects/edit/:id" element={<ProjectForm />} />
              <Route path="/pipeline-visualizer" element={<PipelineVisualizer />} />
              <Route path="/projects/stats" element={<ProjectStats />} />
              {/* <Route path="/pipeline/types" element={<PipelineTypesList />} /> */}
              {/* <Route path="/pipeline/types/new" element={<PipelineTypeForm />} /> */}
              {/* <Route path="/pipeline/types/:id" element={<PipelineTypeDetails />} /> */}
              {/* <Route path="/pipeline/types/edit/:id" element={<PipelineTypeForm />} />
              <Route path="/pipeline/stages" element={<PipelineStagesList />} />
              <Route path="/pipeline/stages/new" element={<PipelineStageForm />} />
              <Route path="/pipeline/stages/:id" element={<PipelineStageDetails />} />
              <Route path="/pipeline/stages/edit/:id" element={<PipelineStageForm />} /> */}
              {/* <Route path="/dashboard/projects" element={<ProjectDashboard />} /> */}
              {/* <Route path="/dashboard/pipeline" element={<PipelineDashboard />} />
              <Route path="/blockages" element={<BlockagesList />} />
              <Route path="/follow-ups/upcoming" element={<UpcomingFollowUps />} /> */}


















            </Route>
          </Route>






          <Route path="*" element={<Main />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
