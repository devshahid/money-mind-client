import { useState } from "react";
import "../styles/Dashboard.css";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faBell } from "@fortawesome/free-solid-svg-icons";
import BalanceCard from "./BalanceCard";

const SectionRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr; /* Two columns */
  gap: 20px;
  margin-bottom: 30px;
`;

const Section = styled.div`
  background-color: ${(props) => props.theme.headerBg};
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h3 {
    font-size: 1.5rem;
    font-weight: bold;
  }

  .dropdown {
    padding: 5px 10px;
    font-size: 1rem;
    border-radius: 5px;
    border: 1px solid ${(props) => props.theme.text};
    background-color: ${(props) => props.theme.background};
    color: ${(props) => props.theme.text};
  }
`;

const DataContent = styled.div`
  font-size: 1rem;
  color: ${(props) => props.theme.text};
`;

interface ProfileHeaderProps {
  userName: string;
  profilePicture: string; // URL to the profile picture
  notificationCount: number; // Number of notifications
}

const Dashboard: React.FC<ProfileHeaderProps> = ({
  userName,
  profilePicture,
  notificationCount,
}) => {
  const [selectedAccount, setSelectedAccount] = useState("All Accounts");
  const [selectedYear, setSelectedYear] = useState("This Year");
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
  };
  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <div className="root-header">
        <div className="dashboard-header">
          <h1>Welcome back, Adaline!</h1>
          <p>It is the best time to manage your finances</p>
        </div>
        <div className="profile-header">
          <div className="search-bar">
            <FontAwesomeIcon
              icon={faSearch}
              className="search-icon"
              onClick={toggleSearch}
            />
            {isSearchVisible && (
              <input
                type="text"
                placeholder="Search..."
                className="search-input"
                onBlur={() => setIsSearchVisible(false)} // Hide input when it loses focus
              />
            )}
          </div>

          <div className="notification">
            <FontAwesomeIcon icon={faBell} className="notification-icon" />
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
          </div>

          <div className="profile">
            <img
              src={profilePicture}
              alt={`${userName}'s profile`}
              className="profile-picture"
            />
            <span className="profile-name">{userName}</span>
          </div>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="metrics">
        <BalanceCard
          heading="Total balance"
          amount="₹15,700.00"
          percentChange="+12%"
          subheading="vs last month"
        />
        <BalanceCard
          heading="Income"
          amount="₹8,500.00"
          percentChange="+6.3%"
          subheading="vs last month"
        />
        <BalanceCard
          heading="Expense"
          amount="₹6,222.00"
          percentChange="-2.4%"
          subheading="vs last month"
        />
        <BalanceCard
          heading="Total Savings"
          amount="₹32,913.00"
          percentChange="+12.1%"
          subheading="vs last month"
        />
      </div>

      {/*  */}
      {/* First Row */}
      <SectionRow>
        {/* Money Flow Section */}
        <Section>
          <SectionHeader>
            <h3>Money Flow</h3>
            <div>
              <select
                className="dropdown"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
              >
                <option>All Accounts</option>
                <option>Savings Account</option>
                <option>Checking Account</option>
              </select>
              <select
                className="dropdown"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                style={{ marginLeft: "10px" }}
              >
                <option>This Year</option>
                <option>Last Year</option>
              </select>
            </div>
          </SectionHeader>
          <DataContent>
            {/* Example content */}
            Total Income: ₹50,000 <br />
            Total Expense: ₹30,000
          </DataContent>
        </Section>

        {/* Budget Section */}
        <Section>
          <SectionHeader>
            <h3>Budget</h3>
          </SectionHeader>
          <DataContent>
            {/* Example content */}
            Monthly Budget: ₹5,000 <br />
            Remaining: ₹2,000
          </DataContent>
        </Section>
      </SectionRow>

      {/* Second Row */}
      <SectionRow>
        {/* Recent Transactions Section */}
        <Section>
          <SectionHeader>
            <h3>Recent Transactions</h3>
          </SectionHeader>
          <DataContent>
            <ul>
              <li>Grocery: ₹50</li>
              <li>Electricity Bill: ₹120</li>
              <li>Dining: ₹40</li>
            </ul>
          </DataContent>
        </Section>

        {/* Saving Goals Section */}
        <Section>
          <SectionHeader>
            <h3>Saving Goals</h3>
          </SectionHeader>
          <DataContent>
            {/* Example content */}
            <ul>
              <li>Vacation Fund: ₹3,000 / ₹5,000</li>
              <li>Emergency Fund: ₹8,000 / ₹10,000</li>
            </ul>
          </DataContent>
        </Section>
      </SectionRow>
    </div>
  );
};

export default Dashboard;
