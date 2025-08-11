import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Layout,
  Menu,
  Dropdown,
  Button,
  Avatar,
  Space,
  Badge,
  Breadcrumb,
  Drawer
} from "antd";
import {
  HomeFilled,
  LogoutOutlined,
  UserOutlined,
  DownOutlined,
  AppstoreOutlined,
  SearchOutlined,
  BellOutlined,
  GlobalOutlined,
  CalendarOutlined,
  TeamOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  MenuOutlined
} from "@ant-design/icons";
import { TbLockPassword } from "react-icons/tb";
import { MdEvent } from "react-icons/md";
import { logout } from "../../features/userSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "../../pages/LanguageSwitcher";
import logo from "../../assets/images/logo.png";
import '../../assets/styles/header.css';

const { Header: AntHeader } = Layout;
const { SubMenu } = Menu;

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      console.log("Déconnexion réussie");
      navigate("/sign-in");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const userMenuItems = [
    {
      label: <Link to="/profile">Profile</Link>,
      key: "profile",
      icon: <UserOutlined />
    },
    {
      label: <Link to="/profile/change-password">Changer le mot de passe</Link>,
      key: "change-password",
      icon: <TbLockPassword />
    },
    {
          label: <Link to="/setup-2fa">Security</Link>,
          key: "security",
          icon: <SafetyCertificateOutlined />
        },   

    { 
      label: <Link to="/sign-in" onClick={handleLogout}>Déconnexion</Link>,
      
      key: "logout",
      icon: <LogoutOutlined />,
      danger: true
    },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <AntHeader className="main-header">
      <div className="header-container">
        {/* Logo et marque */}
        <div className="header-brand">
          <Link to="/" className="logo-container">
            {/* <img src={logo} alt="Logo" className="logo-image" /> */}
            <h1 className="brand-name">FIPA TUNISIE CRM</h1>
          </Link>
        </div>

        {/* Navigation principale - bureau */}
        <nav className="main-navigation">
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            className="main-menu"
          >
            <Menu.Item key="/" icon={<HomeFilled />}>
              <Link to="/">Dashboard</Link>
            </Menu.Item>
            
            <SubMenu key="activities" 
              icon={<AppstoreOutlined style={{ fontSize: '16px' }} />} 
              title="Action"
              // className={isActive("/marketing") || isActive("/visites") ? "ant-menu-item-selected" : ""}
            >
          
              <Menu.Item key="actions" icon={<AppstoreOutlined />}>
              <Link to="/actions/create">Créer une actions</Link>
            </Menu.Item>
              <Menu.Item key="actions" icon={<AppstoreOutlined />}>
              <Link to="/actions">Actions</Link>
            </Menu.Item>

            </SubMenu>  
            <SubMenu key="taches"
            icon={<CalendarOutlined style={{ fontSize: '16px' }} />}
            title="Tâches"
            // className={isActive("/tasks") ? "ant-menu-item-selected" : ""}
            >
              <Menu.Item key="taches" icon={<CalendarOutlined />}>
              <Link to="/tasks/dashboard">Tableau de bord</Link>
            </Menu.Item>
            <Menu.Item key="taches" icon={<CalendarOutlined />}>
              <Link to="/tasks">Liste des taches</Link>
            </Menu.Item>
            <Menu.Item key="taches" icon={<CalendarOutlined />}>
              <Link to="/tasks/calendar">Calendrier</Link>
            </Menu.Item>
            </SubMenu>
           
            
            <Menu.Item key="contacts" icon={<TeamOutlined />}>
              <Link to="/contacts">Contacts</Link>
            </Menu.Item>
            
            <Menu.Item key="entreprises" icon={<ShoppingOutlined />}>
              <Link to="/entreprises">Entreprises</Link>
            </Menu.Item>
            
            <Menu.Item key="reports" icon={<FileTextOutlined />}>
              <Link to="/reports">Rapports</Link>
            </Menu.Item>
          </Menu>
        </nav>

        {/* Contrôles à droite */}
        <div className="header-controls">
          <Button 
            type="text" 
            icon={<SearchOutlined />} 
            className="header-control-button" 
            onClick={() => navigate('/search')}
          />
          
          <Badge count={0} className="notification-badge">
            <Button 
              type="text" 
              icon={<BellOutlined />} 
              className="header-control-button" 
            />
          </Badge>
          
          {/* <div className="lang-switcher-container">
            <LanguageSwitcher />
          </div> */}
          
          <Dropdown menu={{ items: userMenuItems }} trigger={["click"]} placement="bottomRight">
            <a className="user-dropdown-link">
              <Avatar icon={<UserOutlined />} className="user-avatar" />
              <span className="username">{JSON.parse(localStorage.getItem('user'))?.name}</span>
              <DownOutlined style={{ fontSize: '12px' }} />
            </a>
          </Dropdown>
        </div>

        {/* Menu hamburger pour mobile */}
        <div className="mobile-controls">
          <Button 
            type="text" 
            icon={<MenuOutlined />} 
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(true)}
          />
        </div>

        {/* Drawer pour navigation mobile */}
        <Drawer
          title="Menu"
          placement="right"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          className="mobile-menu-drawer"
        >
          <Menu 
            mode="inline" 
            selectedKeys={[location.pathname]}
            className="mobile-menu"
          >
            <Menu.Item key="/" icon={<HomeFilled />}>
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
            </Menu.Item>
            
            {/* <SubMenu key="activities" icon={<MdEvent style={{ fontSize: '16px' }} />} title="Activités promotionnelles">
              <SubMenu key="marketing-secteurs" title="Marketing secteurs">
                <Menu.Item key="/marketing-secteurs/seminaire-secteur">
                  <Link to="/marketing-secteurs/seminaire-secteur" onClick={() => setMobileMenuOpen(false)}>
                    Séminaires Secteur
                  </Link>
                </Menu.Item>
                <Menu.Item key="/marketing-secteurs/salons-sectoriels">
                  <Link to="/marketing-secteurs/salons-sectoriels" onClick={() => setMobileMenuOpen(false)}>
                    Salons Sectoriels
                  </Link>
                </Menu.Item>
                <Menu.Item key="/marketing-secteurs/demarchage-direct">
                  <Link to="/marketing-secteurs/demarchage-direct" onClick={() => setMobileMenuOpen(false)}>
                    Démarchage Direct
                  </Link>
                </Menu.Item>
              </SubMenu> */}
              
              {/* Autres sous-menus similaires */}
            {/* </SubMenu> */}
            
            {/* Autres éléments du menu */}
            <Menu.Item key="profile" icon={<UserOutlined />}>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
            </Menu.Item>
            
            <Menu.Item key="security" icon={<SafetyCertificateOutlined />}>
              <Link to="/setup-2fa" onClick={() => setMobileMenuOpen(false)}>Security</Link>
            </Menu.Item>
          </Menu>
        </Drawer>
      </div>
    </AntHeader>
  );
}

export default Header;