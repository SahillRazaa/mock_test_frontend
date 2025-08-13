import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 3rem;
  color: #333;
  margin-bottom: 1rem;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 3rem;
  font-family: 'Inter', sans-serif;
`;

const Button = styled.button`
  padding: 1rem 2rem;
  border: none;
  border-radius: 10px;
  background-color: #007bff;
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  margin: 0.5rem;
  transition: background-color 0.3s;
  font-family: 'Inter', sans-serif;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);

  &:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
  }
`;

function HomePage() {
  const navigate = useNavigate();

  const handleCreateTest = () => {
    navigate('/create-test');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    navigate('/');
  };

  return (
    <PageContainer>
      <Title>Welcome Back!</Title>
      <Subtitle>Ready to prepare for your placements? Let's create a custom test.</Subtitle>
      <div>
        <Button onClick={handleCreateTest}>Create Test</Button>
        <Button onClick={handleLogout} style={{ backgroundColor: '#dc3545' }}>Logout</Button>
      </div>
    </PageContainer>
  );
}

export default HomePage;
