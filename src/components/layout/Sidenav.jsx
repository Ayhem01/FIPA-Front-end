import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from "../../assets/images/logo.png";
import { AiOutlineHome, AiOutlineCreditCard, AiOutlineHistory } from 'react-icons/ai';
import { FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { BsBookmark } from 'react-icons/bs';
import { RiServiceLine } from 'react-icons/ri';
import { MdDashboard, MdEvent, MdSecurity } from "react-icons/md";
import { CgProfile } from "react-icons/cg";

import '../../assets/styles/sidenav.css';

const Sidenav = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState('service');
  const [expandedSubMenu, setExpandedSubMenu] = useState('marketing-pays'); // État pour le sous-menu
  const location = useLocation();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMenu = (menu) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };

  const toggleSubMenu = (submenu, e) => {
    e.preventDefault();
    e.stopPropagation(); // Empêche le parent de se fermer
    setExpandedSubMenu(expandedSubMenu === submenu ? null : submenu);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-logo">
          <img src={logo} alt="logo" className="logo-icon" />
        </div>
      </div>

      <div className="sidebar-toggle" onClick={toggleSidebar}>
        {collapsed ? <FiChevronsRight size={14} /> : <FiChevronsLeft size={14} />}
      </div>

      <div className="sidebar-menu">
        <div className={`menu-item ${isActive('/') ? 'active' : ''}`}>
          <Link to="/">
            <div className="item-icon">
              <MdDashboard size={20} />
            </div>
            <span className="item-text">Dashboard</span>
          </Link>
        </div>

        <div
          className={`menu-item ${expandedMenu === 'service' ? 'expanded' : ''}`}
          onClick={() => toggleMenu('service')}
        >
          <Link to="#" onClick={(e) => e.preventDefault()}>
            <div className="item-icon">
              <MdEvent size={20} />
            </div>
            <span className="item-text">Activités promotionnelle</span>
            <div className="dropdown-indicator">
              {collapsed ? null : expandedMenu === 'service' ? '▲' : '▼'}
            </div>
          </Link>
        </div>

        {expandedMenu === 'service' && !collapsed && (
          <div className="submenu-container open">
            <div className="submenu">
              {/* Marketing secteurs avec sous-menu */}
              <div className={`submenu-item nested ${expandedSubMenu === 'marketing-secteurs' ? 'expanded' : ''}`}>
                <Link
                  to="#"
                  onClick={(e) => toggleSubMenu('marketing-secteurs', e)}
                  className="submenu-toggle"
                >
                  Marketing secteurs
                  <span className="nested-dropdown-indicator">
                    {expandedSubMenu === 'marketing-secteurs' ? '▲' : '▼'}
                  </span>
                </Link>

                {expandedSubMenu === 'marketing-secteurs' && (
                  <div className="nested-submenu">
                    <div className="nested-submenu-item">
                      <Link to="/marketing-secteurs/seminaire-secteur">Séminaires Secteur</Link>
                    </div>
                    <div className="nested-submenu-item">
                      <Link to="/marketing-secteurs/salons-sectoriels">Salons Sectoriels</Link>
                    </div>
                    <div className="nested-submenu-item">
                      <Link to="/marketing-secteurs/demarchage-direct">Démarchage Direct</Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Marketing pays avec sous-menu */}
              <div className={`submenu-item nested ${expandedSubMenu === 'marketing-pays' ? 'expanded' : ''}`}>
                <Link
                  to="#"
                  onClick={(e) => toggleSubMenu('marketing-pays', e)}
                  className="submenu-toggle"
                >
                  Marketing pays
                  <span className="nested-dropdown-indicator">
                    {expandedSubMenu === 'marketing-pays' ? '▲' : '▼'}
                  </span>
                </Link>

                {expandedSubMenu === 'marketing-pays' && (
                  <div className="nested-submenu">
                    <div className="nested-submenu-item">
                      <Link to="/marketing-pays/media">Média</Link>
                    </div>
                    <div className="nested-submenu-item">
                      <Link to="/marketing-pays/cte">CTE</Link>
                    </div>
                    <div className="nested-submenu-item">
                      <Link to="/marketing-pays/salon">Salons</Link>
                    </div>
                    <div className="nested-submenu-item">
                      <Link to="/marketing-pays/seminaire">Séminaire et JI</Link>
                    </div>
                  </div>
                )}
              </div>


              {/* Visites et délégations avec sous-menu */}
              <div className={`submenu-item nested ${expandedSubMenu === 'visites-delegations' ? 'expanded' : ''}`}>
                <Link
                  to="#"
                  onClick={(e) => toggleSubMenu('visites-delegations', e)}
                  className="submenu-toggle"
                >
                  Visites et délégations
                  <span className="nested-dropdown-indicator">
                    {expandedSubMenu === 'visites-delegations' ? '▲' : '▼'}
                  </span>
                </Link>

                {expandedSubMenu === 'visites-delegations' && (
                  <div className="nested-submenu">
                    <div className="nested-submenu-item">
                      <Link to="/visites-delegations/delegations">Délégations</Link>
                    </div>
                    <div className="nested-submenu-item">
                      <Link to="/visites-delegations/visites-entreprises">Visites d'entreprises</Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className={`menu-item ${isActive('/profile') ? 'active' : ''}`}>
          <Link to="/profile">
            <div className="item-icon">
              <CgProfile size={20} />
            </div>
            <span className="item-text">Profile </span>
          </Link>
        </div>

        <div className={`menu-item ${isActive('/security') ? 'active' : ''}`}>
          <Link to="/setup-2fa">
            <div className="item-icon">
              <MdSecurity size={20} />
            </div>
            <span className="item-text">Secutity</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidenav;