import React, { useState } from "react";
import { ThemeProvider, DefaultTheme } from "styled-components";
import styled from "styled-components";
import {
  FaTachometerAlt,
  FaWallet,
  FaExchangeAlt,
  FaBullseye,
  FaChartPie,
  FaCog,
  FaSignOutAlt,
  FaQuestionCircle,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authService";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";

// Light and Dark Theme Definitions
const lightTheme: DefaultTheme = {
  background: "#f9f9f9",
  text: "#333",
  headerBg: "#e6e6e6",
  hoverBg: "#dcdcdc",
};

const darkTheme: DefaultTheme = {
  background: "#292b2f",
  text: "#fff",
  headerBg: "#1f2023",
  hoverBg: "#3a3b3f",
};

// Styled Components for Sidebar
const SidebarContainer = styled.div<{ isOpen: boolean }>`
  width: ${(props) => (props.isOpen ? "250px" : "80px")};
  height: 100vh;
  background-color: ${(props) => props.theme.background};
  color: ${(props) => props.theme.text};
  display: flex;
  flex-direction: column;
  position: fixed;
  transition: width 0.3s;
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: ${(props) => props.theme.headerBg};
  font-size: 1.2rem;
`;

const Logo = styled.div`
  font-weight: bold;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.text};
  font-size: 1.2rem;
  cursor: pointer;
`;

const Menu = styled.div`
  flex-grow: 1;
  padding: 20px 0;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  gap: 15px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${(props) => props.theme.hoverBg};
  }

  span {
    font-size: 1rem;
  }
`;

const OtherOptions = styled.div`
  margin-top: auto;
  padding-bottom: 20px;
`;

const ThemeToggle = styled.div`
  padding: 15px 20px;
  background-color: ${(props) => props.theme.headerBg};
  cursor: pointer;
`;

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isLightTheme, setIsLightTheme] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleTheme = () => setIsLightTheme(!isLightTheme);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handelLogout = async () => {
    try {
      await logoutUser();
      dispatch(logout());
      localStorage.removeItem("accessToken");
      navigate("/login");
    } catch (error) {
      console.error("Login failed", error);
    }
  };
  return (
    <ThemeProvider theme={isLightTheme ? lightTheme : darkTheme}>
      <SidebarContainer isOpen={isOpen}>
        {/* Section 1: Logo and Toggle */}
        <SidebarHeader>
          <Logo>{isOpen ? "MoneyMind" : "MM"}</Logo>
          <ToggleButton onClick={toggleSidebar}>
            {isOpen ? "←" : "→"}
          </ToggleButton>
        </SidebarHeader>

        {/* Section 2: Main Options */}
        <Menu>
          <MenuItem>
            <FaTachometerAlt />
            {isOpen && (
              <Link to="/">
                <span>Dashboard</span>
              </Link>
            )}
          </MenuItem>
          <MenuItem>
            <FaExchangeAlt />
            {isOpen && (
              <Link to="/table">
                <span>Transactions</span>
              </Link>
            )}
          </MenuItem>
          <MenuItem>
            <FaWallet />
            {isOpen && (
              <Link to="/debt">
                <span>Debts</span>
              </Link>
            )}
          </MenuItem>
          <MenuItem>
            <FaBullseye />
            {isOpen && <span>Goals</span>}
          </MenuItem>
          <MenuItem>
            <FaChartPie />
            {isOpen && <span>Budget</span>}
          </MenuItem>
          <MenuItem>
            <FaCog />
            {isOpen && <span>Settings</span>}
          </MenuItem>
        </Menu>

        {/* Section 3: Other Options */}
        <OtherOptions>
          <MenuItem>
            <FaQuestionCircle />
            {isOpen && <span>Help</span>}
          </MenuItem>
          <MenuItem onClick={handelLogout}>
            <FaSignOutAlt />
            {isOpen && <span>Log out</span>}
          </MenuItem>
        </OtherOptions>

        {/* Bottom Section: Theme Toggle */}
        <ThemeToggle onClick={toggleTheme}>
          {isLightTheme ? <FaMoon /> : <FaSun />}
          {isOpen && <span>{isLightTheme ? "Dark Mode" : "Light Mode"}</span>}
        </ThemeToggle>
      </SidebarContainer>
    </ThemeProvider>
  );
};

export default Sidebar;
