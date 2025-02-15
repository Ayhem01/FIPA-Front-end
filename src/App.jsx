import { Route, BrowserRouter, Routes } from "react-router-dom";
import Tables from "./pages/Tables";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import Main from "./components/layout/Main";
import "./assets/styles/main.css";
import "./assets/styles/responsive.css";
import { ConfigProvider } from "antd";

function App() {
  return (
    <ConfigProvider>
      <BrowserRouter>
        <Routes>

            <Route path="/" element={<Main />}>
              <Route path="/tables" element={<Tables />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="/sign-in" element={<SignIn />} />

          <Route path="*" element={<Main />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
