import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Layout,
  Menu,
  Dropdown,
  Button,
  Avatar,
  Space,
  Badge,
  Drawer,
  Typography,
  Tooltip,
  Input
} from "antd";
import {
  HomeFilled,
  LogoutOutlined,
  UserOutlined,
  DownOutlined,
  AppstoreOutlined,
  SearchOutlined,
  BellOutlined,
  CalendarOutlined,
  TeamOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  MenuOutlined,
  ProjectOutlined,
  DashboardOutlined,
  SettingOutlined,
  LineChartOutlined,
  UserSwitchOutlined,
  FundOutlined,
  BuildOutlined,
  PlusOutlined,
  UnorderedListOutlined,
  BarChartOutlined,
  ClusterOutlined,
  IssuesCloseOutlined,
  BankOutlined 
} from "@ant-design/icons";
import { TbLockPassword } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "../../features/userSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import '../../assets/styles/header.css';

const { Header: AntHeader } = Layout;
const { SubMenu } = Menu;
const { Text } = Typography;
const { Search } = Input;

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications] = useState(3);
  const { user: reduxUser } = useSelector((s) => s.user);


  // Effet de scroll pour le header
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate("/sign-in");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();
    const currentUser = reduxUser || storedUser;

  const isAdmin = (() => {
    const u = currentUser;
    if (!u) return false;
    const flag =
      u.is_admin === true ||
      u.is_admin === 1 ||
      u.is_admin === "1" ||
      u.is_admin === "true";
    const roleStr = String(u.role || "").toLowerCase();
    const list1 = Array.isArray(u.roles_list) ? u.roles_list.map(r => String(r?.name || r).toLowerCase()) : [];
    const list2 = Array.isArray(u.role_names) ? u.role_names.map(r => String(r).toLowerCase()) : [];
    const list3 = Array.isArray(u.roles) ? u.roles.map(r => String(r?.name || r).toLowerCase()) : [];
    return flag || [roleStr, ...list1, ...list2, ...list3].includes("admin");
  })();

  const displayName = currentUser?.name || "Utilisateur";
  const displayRole = isAdmin
    ? "Admin"
    : (currentUser?.role ||
       currentUser?.role_names?.[0] ||
       "Utilisateur");

  const userMenuItems = [
    {
      label: (
        <motion.div
          whileHover={{ x: 5 }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <UserOutlined />
          <span>Mon Profil</span>
        </motion.div>
      ),
      key: "profile",
      onClick: () => navigate("/profile")
    },
    {
      label: (
        <motion.div
          whileHover={{ x: 5 }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <TbLockPassword />
          <span>Changer le mot de passe</span>
        </motion.div>
      ),
      key: "change-password",
      onClick: () => navigate("/profile/change-password")
    },
    {
      label: (
        <motion.div
          whileHover={{ x: 5 }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <SafetyCertificateOutlined />
          <span>Sécurité 2FA</span>
        </motion.div>
      ),
      key: "security",
      onClick: () => navigate("/setup-2fa")
    },
    {
      type: 'divider'
    },
    {
      label: (
        <motion.div
          whileHover={{ x: 5 }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff4d4f' }}
        >
          <LogoutOutlined />
          <span>Déconnexion</span>
        </motion.div>
      ),
      key: "logout",
      onClick: handleLogout,
      danger: true
    },
  ];

  const NotificationDropdown = () => (
    <div style={{ width: '350px', maxHeight: '400px', overflow: 'auto' }}>
      <div style={{ 
        padding: '16px', 
        borderBottom: '1px solid #f0f0f0',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <Text strong style={{ color: 'white' }}>Notifications</Text>
        <Text style={{ float: 'right', color: 'rgba(255,255,255,0.8)' }}>
          {notifications} nouvelles
        </Text>
      </div>
      <div style={{ padding: '8px 0' }}>
        {[
          { id: 1, title: 'Nouvelle tâche assignée', desc: 'Révision du projet ABC', time: '5 min' },
          { id: 2, title: 'Prospect qualifié', desc: 'Jean Dupont est intéressé', time: '1h' },
          { id: 3, title: 'Réunion programmée', desc: 'Demain à 14h avec l\'équipe', time: '2h' }
        ].map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ backgroundColor: '#f5f5f5' }}
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #f0f0f0',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
                <BellOutlined />
              </Avatar>
              <div style={{ flex: 1 }}>
                <Text strong style={{ fontSize: '14px' }}>{item.title}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  {item.desc}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Il y a {item.time}
                </Text>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div style={{ 
        padding: '12px 16px', 
        textAlign: 'center', 
        borderTop: '1px solid #f0f0f0',
        background: '#fafafa'
      }}>
        <Button type="link" size="small" onClick={() => navigate('/notifications')}>
          Voir toutes les notifications
        </Button>
      </div>
    </div>
  );

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <>
      <motion.div
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <AntHeader 
          className="modern-header"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            background: scrolled 
              ? 'rgba(102, 126, 234, 0.95)' 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backdropFilter: 'blur(10px)',
            borderBottom: 'none',
            boxShadow: scrolled 
              ? '0 4px 20px rgba(0,0,0,0.15)' 
              : '0 2px 8px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease',
            height: '64px',
            lineHeight: '64px',
            padding: '0 24px'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '100%',
            width: '100%',
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            {/* Logo et marque */}
            <motion.div 
              className="header-brand"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              style={{ minWidth: '220px' }}
            >
              <Link to="/" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                textDecoration: 'none'
              }}>
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}
                >
                  <DashboardOutlined style={{ 
                    fontSize: '20px', 
                    color: 'white'
                  }} />
                </motion.div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text strong style={{ 
                    fontSize: '16px',
                    color: 'white',
                    fontWeight: 700,
                    lineHeight: 1.2
                  }}>
                    FIPA TUNISIE
                  </Text>
                  <Text style={{ 
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.8)',
                    lineHeight: 1
                  }}>
                    CRM System
                  </Text>
                </div>
              </Link>
            </motion.div>

            {/* Navigation principale - bureau */}
            <nav className="main-navigation" style={{ 
              flex: 1, 
              display: 'flex',
              justifyContent: 'center',
              margin: '0 20px'
            }}>
              <Menu
                mode="horizontal"
                selectedKeys={[location.pathname]}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  fontWeight: 500,
                  lineHeight: '64px'
                }}
                className="modern-menu"
              >
                <Menu.Item key="/" icon={<HomeFilled />}>
                  <Link to="/" style={{ color: 'inherit' }}>Tableau de Bord</Link>
                </Menu.Item>
                
                <SubMenu 
                  key="portefeuille" 
                  icon={<ProjectOutlined />}
                  title="Portefeuille"
                  popupClassName="modern-submenu"
                >
                  <Menu.Item key="/invites" icon={<UserSwitchOutlined />}>
                    <Link to="/invites">Invités</Link>
                  </Menu.Item>
                  <Menu.Item key="/prospects" icon={<UserOutlined />}>
                    <Link to="/prospects">Prospects</Link>
                  </Menu.Item>
                  <Menu.Item key="/investisseurs" icon={<FundOutlined />}>
                    <Link to="/investisseurs">Investisseurs</Link>
                  </Menu.Item>
                  <Menu.Item key="/projets" icon={<ProjectOutlined />}>
                    <Link to="/projets">Projets</Link>
                  </Menu.Item>
                </SubMenu>
                
                <SubMenu 
                  key="activities" 
                  icon={<AppstoreOutlined />}
                  title="Actions"
                  popupClassName="modern-submenu"
                >
                 {isAdmin && (
                  <Menu.Item key="/actions/create" icon={<PlusOutlined />}>
                    <Link to="/actions/create">Créer une action</Link>
                  </Menu.Item>
                )}
                  <Menu.Item key="/actions" icon={<UnorderedListOutlined />}>
                    <Link to="/actions">Liste des actions</Link>
                  </Menu.Item>
                </SubMenu>
                
                <SubMenu 
                  key="taches"
                  icon={<CalendarOutlined />}
                  title="Tâches"
                  popupClassName="modern-submenu"
                >
                  <Menu.Item key="/tasks/dashboard" icon={<BarChartOutlined />}>
                    <Link to="/tasks/dashboard">Tableau de bord</Link>
                  </Menu.Item>
                  <Menu.Item key="/tasks" icon={<UnorderedListOutlined />}>
                    <Link to="/tasks">Liste des tâches</Link>
                  </Menu.Item>
                  <Menu.Item key="/tasks/calendar" icon={<CalendarOutlined />}>
                    <Link to="/tasks/calendar">Calendrier</Link>
                  </Menu.Item>
                  {isAdmin && (
                    <Menu.Item key="/tasks/my-tasks" icon={<UserOutlined />}>
                    <Link to="/tasks/my-tasks">Mes tâches</Link>
                  </Menu.Item>
                  )}
                  
                </SubMenu>
                
                <SubMenu 
                  key="blockages"
                  icon={<IssuesCloseOutlined />}
                  title="Blocages"
                  popupClassName="modern-submenu"
                >
                <Menu.Item key="/blockages" icon={<BuildOutlined />}>
                  <Link to="/blockages" style={{ color: 'inherit' }}>Liste des blocages</Link>
                </Menu.Item>
                </SubMenu>
                <SubMenu 
                  key="entreprises"
                  icon={<BankOutlined />}
                  title="Entreprises"
                  popupClassName="modern-submenu"
                >
               {isAdmin && (
                  <Menu.Item key="/companies/create" icon={<PlusOutlined />}>
                    <Link to="/companies/create">Créer une entreprise</Link>
                  </Menu.Item>
                )}
                  <Menu.Item key="/companies" icon={<UnorderedListOutlined />}>
                    <Link to="/companies" style={{ color: 'inherit' }}>Liste des entreprises</Link>
                  </Menu.Item>  
                </SubMenu>
               
              </Menu>
            </nav>

            <div className="header-controls" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              minWidth: '220px',
              justifyContent: 'flex-end'
            }}>
              
              
             
              
              {/* Profil utilisateur */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Dropdown 
                  menu={{ items: userMenuItems }} 
                  trigger={["click"]} 
                  placement="bottomRight"
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,0.2)',
                    minWidth: '120px'
                  }}>
                    <Avatar 
                      size="small" 
                      icon={<UserOutlined />} 
                      style={{ 
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        border: '2px solid white'
                      }} 
                    />
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'flex-start',
                      flex: 1 
                    }}>
                    <Text 
                        strong 
                        style={{ 
                          color: 'white',
                          fontSize: '13px',
                          lineHeight: 1.2
                        }}
                      >
                        {displayName}
                      </Text>
                      <Text 
                        style={{ 
                          color: 'rgba(255,255,255,0.8)',
                          fontSize: '11px',
                          lineHeight: 1
                        }}
                      >
                        {displayRole}
                      </Text>
                    </div>
                    <DownOutlined style={{ 
                      fontSize: '10px', 
                      color: 'white' 
                    }} />
                  </div>
                </Dropdown>
              </motion.div>

              {/* Menu hamburger pour mobile */}
              <div className="mobile-only" style={{ display: 'none' }}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    type="text" 
                    icon={<MenuOutlined />} 
                    onClick={() => setMobileMenuOpen(true)}
                    style={{
                      color: 'white',
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      borderRadius: '8px',
                      width: '36px',
                      height: '36px'
                    }}
                  />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Drawer pour navigation mobile */}
          <Drawer
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <DashboardOutlined style={{ fontSize: '16px', color: 'white' }} />
                </div>
                <div>
                  <Text strong>FIPA TUNISIE</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>CRM System</Text>
                </div>
              </div>
            }
            placement="right"
            onClose={() => setMobileMenuOpen(false)}
            open={mobileMenuOpen}
            width={320}
          >
            <Menu 
              mode="inline" 
              selectedKeys={[location.pathname]}
              style={{ border: 'none' }}
            >
              <Menu.Item key="/" icon={<HomeFilled />}>
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>Tableau de Bord</Link>
              </Menu.Item>
              
              <SubMenu key="portefeuille" icon={<ProjectOutlined />} title="Portefeuille">
                <Menu.Item key="/invites" icon={<UserSwitchOutlined />}>
                  <Link to="/invites" onClick={() => setMobileMenuOpen(false)}>Invités</Link>
                </Menu.Item>
                <Menu.Item key="/prospects" icon={<UserOutlined />}>
                  <Link to="/prospects" onClick={() => setMobileMenuOpen(false)}>Prospects</Link>
                </Menu.Item>
                <Menu.Item key="/investisseurs" icon={<FundOutlined />}>
                  <Link to="/investisseurs" onClick={() => setMobileMenuOpen(false)}>Investisseurs</Link>
                </Menu.Item>
                <Menu.Item key="/projets" icon={<ProjectOutlined />}>
                  <Link to="/projets" onClick={() => setMobileMenuOpen(false)}>Projets</Link>
                </Menu.Item>
              </SubMenu>
              
              <SubMenu key="activities" icon={<AppstoreOutlined />} title="Actions">
                <Menu.Item key="/actions/create" icon={<PlusOutlined />}>
                  <Link to="/actions/create" onClick={() => setMobileMenuOpen(false)}>
                    Créer une action
                  </Link>
                </Menu.Item>
                <Menu.Item key="/actions" icon={<UnorderedListOutlined />}>
                  <Link to="/actions" onClick={() => setMobileMenuOpen(false)}>
                    Liste des actions
                  </Link>
                </Menu.Item>
              </SubMenu>
              
              <SubMenu key="taches" icon={<CalendarOutlined />} title="Tâches">
                <Menu.Item key="/tasks/dashboard" icon={<BarChartOutlined />}>
                  <Link to="/tasks/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    Tableau de bord
                  </Link>
                </Menu.Item>
                <Menu.Item key="/tasks" icon={<UnorderedListOutlined />}>
                  <Link to="/tasks" onClick={() => setMobileMenuOpen(false)}>
                    Liste des tâches
                  </Link>
                </Menu.Item>
                <Menu.Item key="/tasks/calendar" icon={<CalendarOutlined />}>
                  <Link to="/tasks/calendar" onClick={() => setMobileMenuOpen(false)}>
                    Calendrier
                  </Link>
                </Menu.Item>
                <Menu.Item key="/tasks/my-tasks" icon={<UserOutlined />}>
                  <Link to="/tasks/my-tasks" onClick={() => setMobileMenuOpen(false)}>
                    Mes tâches
                  </Link>
                </Menu.Item>
              </SubMenu>
              
              <Menu.Item key="/blockages" icon={<BuildOutlined />}>
                <Link to="/blockages" onClick={() => setMobileMenuOpen(false)}>Blocages</Link>
              </Menu.Item>
              
              <Menu.Item key="/entreprises" icon={<ShoppingOutlined />}>
                <Link to="/entreprises" onClick={() => setMobileMenuOpen(false)}>Entreprises</Link>
              </Menu.Item>
              
              <Menu.Item key="/contacts" icon={<TeamOutlined />}>
                <Link to="/contacts" onClick={() => setMobileMenuOpen(false)}>Contacts</Link>
              </Menu.Item>
              
              <Menu.Item key="/reports" icon={<FileTextOutlined />}>
                <Link to="/reports" onClick={() => setMobileMenuOpen(false)}>Rapports</Link>
              </Menu.Item>
            </Menu>
          </Drawer>
        </AntHeader>
      </motion.div>

      {/* Styles CSS améliorés */}
      <style jsx>{`
        .modern-header {
          transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1) !important;
        }

        .modern-menu.ant-menu-horizontal {
          border-bottom: none !important;
          background: transparent !important;
        }

        .modern-menu .ant-menu-item,
        .modern-menu .ant-menu-submenu-title {
          color: white !important;
          border-bottom: 2px solid transparent !important;
          transition: all 0.3s ease !important;
          font-weight: 500 !important;
          margin: 0 4px !important;
          border-radius: 6px !important;
          height: 60px !important;
          line-height: 60px !important;
          position: relative !important;
        }

        .modern-menu .ant-menu-item:hover,
        .modern-menu .ant-menu-submenu-title:hover {
          color: #ffd700 !important;
          background: rgba(255,255,255,0.1) !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
        }

        .modern-menu .ant-menu-item-selected {
          color: #ffd700 !important;
          background: rgba(255,255,255,0.15) !important;
          border-bottom: 2px solid #ffd700 !important;
          box-shadow: 0 4px 12px rgba(255,215,0,0.3) !important;
        }

        .modern-menu .ant-menu-item a,
        .modern-menu .ant-menu-submenu-title {
          color: inherit !important;
        }

        .modern-submenu {
          border-radius: 12px !important;
          overflow: hidden !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
        }

        .modern-submenu .ant-menu-item {
          color: #333 !important;
          transition: all 0.2s ease !important;
          height: auto !important;
          line-height: 1.5 !important;
          padding: 12px 16px !important;
          margin: 0 !important;
          border-radius: 0 !important;
        }

        .modern-submenu .ant-menu-item:hover {
          color: #1890ff !important;
          background: linear-gradient(90deg, #f0f7ff 0%, #e6f7ff 100%) !important;
          transform: translateX(8px) !important;
          border-left: 3px solid #1890ff !important;
        }

        .ant-dropdown {
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
          border: 1px solid #f0f0f0 !important;
          overflow: hidden !important;
        }

        .ant-menu-inline {
          border-right: none !important;
        }

        .ant-menu-inline .ant-menu-item,
        .ant-menu-inline .ant-menu-submenu-title {
          margin: 4px 8px !important;
          border-radius: 8px !important;
          transition: all 0.2s ease !important;
        }

        .ant-menu-inline .ant-menu-item:hover,
        .ant-menu-inline .ant-menu-submenu-title:hover {
          transform: translateX(8px) !important;
          background: #f0f7ff !important;
          border-left: 3px solid #1890ff !important;
        }

        .ant-menu-inline .ant-menu-item-selected {
          background: linear-gradient(90deg, #1890ff 0%, #40a9ff 100%) !important;
          color: white !important;
          border-radius: 8px !important;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .main-navigation {
            display: none !important;
          }
          
          .mobile-only {
            display: block !important;
          }
          
          .header-controls {
            min-width: auto !important;
          }
          
          .header-brand {
            min-width: auto !important;
          }
        }

        @media (max-width: 768px) {
          .header-controls > div:not(.mobile-only) {
            display: none !important;
          }
          
          .header-controls > div:nth-last-child(2) {
            display: flex !important;
          }
        }

        @media (max-width: 576px) {
          .header-brand div:last-child {
            display: none !important;
          }
          
          .modern-header {
            padding: 0 16px !important;
          }
        }

        /* Animation pour les notifications */
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        @keyframes glow {
          0% { box-shadow: 0 0 5px rgba(255,215,0,0.5); }
          50% { box-shadow: 0 0 20px rgba(255,215,0,0.8); }
          100% { box-shadow: 0 0 5px rgba(255,215,0,0.5); }
        }

        .ant-badge-count {
          animation: pulse 2s infinite !important;
          background: linear-gradient(135deg, #ff4d4f, #ff7875) !important;
        }

        /* Effet de glow pour les éléments actifs */
        .modern-menu .ant-menu-item-selected::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,215,0,0.2));
          animation: glow 2s infinite;
          border-radius: 6px;
          z-index: -1;
        }

        /* Scrollbar personnalisée */
        .ant-dropdown::-webkit-scrollbar {
          width: 4px !important;
        }

        .ant-dropdown::-webkit-scrollbar-track {
          background: #f1f1f1 !important;
        }

        .ant-dropdown::-webkit-scrollbar-thumb {
          background: #c1c1c1 !important;
          border-radius: 2px !important;
        }

        .ant-dropdown::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8 !important;
        }

        /* Animation de chargement */
        @keyframes shimmer {
          0% { background-position: -468px 0; }
          100% { background-position: 468px 0; }
        }

        .loading-shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 400% 100%;
          animation: shimmer 1.2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

export default Header;