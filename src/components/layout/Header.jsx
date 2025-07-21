import { useEffect } from "react";
import {
  Row,
  Col,
  Breadcrumb,
  Badge,
  Dropdown,
  Button,
  notification,
  Space
} from "antd";
import {
  HomeFilled, 
  LogoutOutlined, 
  UserOutlined, 
  MenuFoldOutlined, 
  MenuUnfoldOutlined  // Add these icons
} from '@ant-design/icons';
import { useNavigate, useLocation } from "react-router-dom";
import LanguageSwitcher from "../../pages/LanguageSwitcher";
import { logout } from "../../features/userSlice";
import { useDispatch } from "react-redux";
import '../../assets/styles/header.css';
import { TbLockPassword } from "react-icons/tb";

function Header({ onPress, collapsed }) {
  const navigate = useNavigate();
  useEffect(() => window.scrollTo(0, 0));
  const { pathname } = useLocation();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      console.log("Déconnexion réussie");
      navigate("/sign-in"); 
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const menu = JSON.parse(localStorage.getItem('menu'));
  useEffect(() => { }, [pathname])

  const items = [
    {
      label: <a href="/profile/change-password">Change password</a>,
      key: "0",
      icon: <TbLockPassword/>
    },
    {
      label: <a href="#" onClick={handleLogout}>  Logout  </a>,
      key: "1",
      icon:<LogoutOutlined />,
      danger:true
    },
  ];

  // Define a user avatar placeholder if needed
  const profile = <UserOutlined style={{ fontSize: '20px' }} />;

  return (
    <div className={`header-container ${collapsed ? 'collapsed' : ''}`}>
      <div className="header-content">
        <div className="header-breadcrumb">
          <Breadcrumb
            items={[
              {
                href: "/dashboard",
                title: <Space><HomeFilled /> Dashboard </Space>,
              },
            ]}
          />
        </div>
        
        <div className="header-control">
          <Button
            type="ghost"
            className="sidebar-toggler"
            onClick={() => onPress()}
          >
            {/* Replace toggler with proper conditional icon */}
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
          
          <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
            <a
              className="ant-dropdown-link"
              onClick={(e) => e.preventDefault()}
            >
              <div className="user-avatar">
                {profile}
              </div>
              <span>{JSON.parse(localStorage.getItem('user'))?.name}</span>
            </a>
          </Dropdown>
          
          <div className="lang-switcher">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;