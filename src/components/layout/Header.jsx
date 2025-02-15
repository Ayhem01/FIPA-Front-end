import { useEffect, useState } from "react";
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
import {HomeFilled, LogoutOutlined, UserOutlined} from '@ant-design/icons';

import { useNavigate, useLocation } from "react-router-dom";
const bell = [
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    key={0}
  >
    <path
      d="M10 2C6.68632 2 4.00003 4.68629 4.00003 8V11.5858L3.29292 12.2929C3.00692 12.5789 2.92137 13.009 3.07615 13.3827C3.23093 13.7564 3.59557 14 4.00003 14H16C16.4045 14 16.7691 13.7564 16.9239 13.3827C17.0787 13.009 16.9931 12.5789 16.7071 12.2929L16 11.5858V8C16 4.68629 13.3137 2 10 2Z"
      fill="#111827"
    ></path>
    <path
      d="M10 18C8.34315 18 7 16.6569 7 15H13C13 16.6569 11.6569 18 10 18Z"
      fill="#111827"
    ></path>
  </svg>,
];

const profile = [
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    key={0}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM12 7C12 8.10457 11.1046 9 10 9C8.89543 9 8 8.10457 8 7C8 5.89543 8.89543 5 10 5C11.1046 5 12 5.89543 12 7ZM9.99993 11C7.98239 11 6.24394 12.195 5.45374 13.9157C6.55403 15.192 8.18265 16 9.99998 16C11.8173 16 13.4459 15.1921 14.5462 13.9158C13.756 12.195 12.0175 11 9.99993 11Z"
      fill="#111827"
    ></path>
  </svg>,
];

const toggler = [
  <svg
    width="20"
    height="20"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 448 512"
    key={0}
  >
    <path d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"></path>
  </svg>,
];



function Header({ onPress }) {
  const [api] = notification.useNotification();
  const navigate = useNavigate();
  useEffect(() => window.scrollTo(0, 0));
  const { pathname } = useLocation();

  const openNotificationWithIcon = (type) => {
    api[type]({
      message: "Erreur de lors de déconnexion",
      description: " Erreur de lors de déconnexion.",
    });
  };
  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());
  const filterSort = (optionA, optionB) =>
    (optionA?.label ?? "")
      .toLowerCase()
      .localeCompare((optionB?.label ?? "").toLowerCase());


  const handleLogout = (e) => {
        navigate("/sign-in", { replace: true });
  };

  const menu = JSON.parse(localStorage.getItem('menu'));
  useEffect(() => { }, [pathname])

  const items = [
    {
      label: <a href="/profile"> Profile </a>,
      key: "0",
      icon: <UserOutlined/>
    },
    {
      label: <a href="#" onClick={(e) => handleLogout(e)}>  Logout  </a>,
      key: "1",
      icon:<LogoutOutlined />,
      danger:true
    },
  ];

  return (
    <>
      <Row gutter={[24, 0]} style={{background: "#fff"}}>
        <Col span={24} md={12}>
          <Breadcrumb
            items={[
              {
                href: "/dashboard",
                title: <Space><HomeFilled /> Dashboard </Space>,
              },
            ]}
          ></Breadcrumb>

        </Col>
        <Col span={24} md={12} className="header-control">
          <Button
            type="link"
            className="sidebar-toggler"
            onClick={() => onPress()}
          >
            {toggler}
          </Button>
          <Badge size="small" count={0}>
            <Dropdown menu={{ items }} trigger={["click"]} placement="bottomLeft">
              <a
                className="ant-dropdown-link"
                onClick={(e) => e.preventDefault()}
              >
                {/*{bell}*/}
                {profile}
                <span style={{ color: '#8c8c8c', fontWeight: '600' }}> {JSON.parse(localStorage.getItem('user'))?.name}</span>
              </a>
            </Dropdown>
          </Badge>
        </Col>
      </Row>
    </>
  );
}

export default Header;
