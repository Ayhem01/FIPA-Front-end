import { useLocation, Outlet } from "react-router-dom";
import { Layout } from "antd";
import Header from "./Header";
import Footer from "./Footer";
import { Toaster } from 'react-hot-toast';

const { Content } = Layout;

function Main() {
  let { pathname } = useLocation();
  pathname = pathname.replace("/", "");

  return (
    <Layout className="layout-container">
      <Header 
        name={pathname}
        subName={pathname}
      />
      <Content className="site-content">
        <div className="site-content-wrapper">
          <Outlet />
          <Toaster position="top-right" />
        </div>
      </Content>
      <Footer />
    </Layout>
  );
}

export default Main;