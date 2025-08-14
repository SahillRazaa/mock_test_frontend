import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Toaster } from '../utils/Toaster';

const PageContainer = styled.div`
  padding: 2rem;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: 'Inter', sans-serif;
`;

const ContentWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  text-align: center;
  margin-bottom: 2rem;
  letter-spacing: -0.5px;
`;

const Section = styled.div`
  margin-bottom: 2rem;
  padding: 1.75rem;
  border-radius: 12px;
  background: white;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:before {
    content: '';
    display: block;
    width: 6px;
    height: 1.25rem;
    background: #3b82f6;
    border-radius: 3px;
  }
`;

const FlexContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  cursor: pointer;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: ${({ checked }) => (checked ? '#eff6ff' : '#f8fafc')};
  border: 1px solid ${({ checked }) => (checked ? '#3b82f6' : '#e2e8f0')};
  transition: all 0.2s;

  input[type="checkbox"] {
    width: 1.1rem;
    height: 1.1rem;
    accent-color: #3b82f6;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  width: 100%;

  label {
    font-size: 0.9rem;
    color: #64748b;
    font-weight: 500;
  }
`;

const StyledInput = styled.input`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 0.95rem;
  width: 100%;
  transition: border 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  gap: 1rem;
`;

const StyledButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background-color: ${({ primary }) => (primary ? '#3b82f6' : '#64748b')};
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: ${({ fullWidth }) => (fullWidth ? '1' : 'none')};
  
  &:hover {
    background-color: ${({ primary }) => (primary ? '#2563eb' : '#475569')};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
`;

const SummaryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  font-size: 0.9rem;

  th, td {
    border: 1px solid #e2e8f0;
    padding: 0.75rem;
    text-align: left;
  }
  
  th {
    background-color: #f1f5f9;
    color: #334155;
    font-weight: 600;
  }

  tr:nth-child(even) {
    background-color: #f8fafc;
  }
`;

const TopicCard = styled.div`
  margin-top: 1.5rem;
  border: 1px solid #e2e8f0;
  padding: 1.25rem;
  border-radius: 12px;
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const ProblemCard = styled.div`
  margin-top: 1rem;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: white;
`;

const Select = styled.select`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 0.95rem;
  width: 100%;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
`;

const LoadingSpinner = styled.div`
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 3px solid #3b82f6;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
  margin: 0 auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

function CreateTestPage() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState({});
  const [mcqQueries, setMcqQueries] = useState([]);
  const [codingProblems, setCodingProblems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [subtopicsLoading, setSubtopicsLoading] = useState({});

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token"); 
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/mcqs/topics`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTopics(response.data);
    } catch (error) {
      Toaster({ type: 'error', message: 'Failed to fetch topics.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubtopics = async (topic) => {
    setSubtopicsLoading(prev => ({ ...prev, [topic]: true }));
    try {
      const token = sessionStorage.getItem("token"); 
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/mcqs/subtopics`,
        {
          params: { topic },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      Toaster({ type: 'error', message: `Failed to fetch subtopics for ${topic}.` });
      return [];
    } finally {
      setSubtopicsLoading(prev => ({ ...prev, [topic]: false }));
    }
  };

  const handleTopicSelection = async (topic, isChecked) => {
    let newSelectedTopics = { ...selectedTopics };
    if (isChecked) {
      const subtopics = (topic === 'CS Funda' || topic === 'Aptitude')
        ? await fetchSubtopics(topic)
        : null;
      newSelectedTopics[topic] = {
        time: 2,
        subtopics: subtopics ? subtopics.reduce((acc, sub) => ({ ...acc, [sub]: { count: 0 } }), {}) : null,
        count: subtopics ? 0 : 5,
        difficulty: subtopics ? null : 'Medium',
      };
    } else {
      delete newSelectedTopics[topic];
    }
    setSelectedTopics(newSelectedTopics);
  };
  
  const handleNext = () => {
    if (page === 1) {
      setShowModal(true);
    } else if (page === 2) {
      const finalMcqQueries = Object.keys(selectedTopics).flatMap(topic => {
        if (selectedTopics[topic].subtopics) {
          return Object.keys(selectedTopics[topic].subtopics)
            .filter(sub => selectedTopics[topic].subtopics[sub].count > 0)
            .map(sub => ({
              topic,
              subtopic: sub,
              count: selectedTopics[topic].subtopics[sub].count,
            }));
        } else {
          return [{
            topic,
            subtopic: '',
            count: selectedTopics[topic].count,
          }];
        }
      });
      setMcqQueries(finalMcqQueries);
      setPage(3);
    }
  };

  const handleBack = () => {
    setPage(prev => Math.max(1, prev - 1));
  };
  
  const finalizeMcqs = () => {
    setShowModal(false);
    setPage(2);
  };

  const calculateTotalTime = () => {
    const mcqTime = Object.values(selectedTopics).reduce((total, topic) => {
      if (topic.subtopics) {
        const subtopicTime = Object.values(topic.subtopics).reduce((stotal, sub) => {
          return stotal + (sub.count || 0) * (topic.time || 0);
        }, 0);
        return total + subtopicTime;
      } else {
        return total + (topic.count || 0) * (topic.time || 0);
      }
    }, 0);
  
    const codingTime = codingProblems.reduce((total, p) => {
      return total + (p.time || 0);
    }, 0);
  
    return mcqTime + codingTime;
  };
  

  const prepareDataForBackend = () => {
    const mcqData = {
      queries: mcqQueries
    };

    const codingData = {
      difficulties: codingProblems.map(p => p.difficulty),
      count: 1
    };
    
    const totalTime = calculateTotalTime();

    return {
      mcqData,
      codingData,
      totalTime
    };
  };

  const handleSubmit = () => {
    const data = prepareDataForBackend();
    localStorage.setItem("testData", JSON.stringify(data));
    Toaster({ type: 'success', message: 'Test data saved!' });
    
    navigate("/start-test"); 
  };
  

  const renderMCQSelection = () => (
    <Section>
      <SectionTitle>Select MCQ Topics & Questions</SectionTitle>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <FlexContainer>
            {topics.map(topic => (
              <CheckboxLabel 
                key={topic} 
                checked={!!selectedTopics[topic]}
              >
                <input
                  type="checkbox"
                  checked={!!selectedTopics[topic]}
                  onChange={(e) => handleTopicSelection(topic, e.target.checked)}
                />
                {topic}
                {subtopicsLoading[topic] && <LoadingSpinner style={{ marginLeft: 'auto', width: '16px', height: '16px' }} />}
              </CheckboxLabel>
            ))}
          </FlexContainer>
          {Object.keys(selectedTopics).map(topic => (
            <TopicCard key={topic}>
              <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>{topic}</h4>
              <InputGroup>
                <label>Time per question (minutes)</label>
                <StyledInput
                  type="number"
                  value={selectedTopics[topic].time}
                  onChange={(e) => {
                    let newSelectedTopics = { ...selectedTopics };
                    newSelectedTopics[topic].time = parseInt(e.target.value);
                    setSelectedTopics(newSelectedTopics);
                  }}
                  min="1"
                />
              </InputGroup>
              {selectedTopics[topic].subtopics ? (
                <div style={{ marginTop: '1.5rem' }}>
                  <SectionTitle>Select Subtopics for {topic}</SectionTitle>
                  <FlexContainer>
                    {Object.keys(selectedTopics[topic].subtopics).map(subtopic => (
                      <InputGroup key={subtopic}>
                        <label>{subtopic}</label>
                        <StyledInput
                          type="number"
                          value={selectedTopics[topic].subtopics[subtopic].count}
                          onChange={(e) => {
                            let newSelectedTopics = { ...selectedTopics };
                            newSelectedTopics[topic].subtopics[subtopic].count = parseInt(e.target.value);
                            setSelectedTopics(newSelectedTopics);
                          }}
                          min="0"
                        />
                      </InputGroup>
                    ))}
                  </FlexContainer>
                </div>
              ) : (
                <InputGroup style={{ marginTop: '1.5rem' }}>
                  <label>Number of questions</label>
                  <StyledInput
                    type="number"
                    value={selectedTopics[topic].count}
                    onChange={(e) => {
                      let newSelectedTopics = { ...selectedTopics };
                      newSelectedTopics[topic].count = parseInt(e.target.value);
                      setSelectedTopics(newSelectedTopics);
                    }}
                    min="1"
                  />
                </InputGroup>
              )}
            </TopicCard>
          ))}
        </>
      )}
    </Section>
  );

  const renderCodingSelection = () => (
    <Section>
      <SectionTitle>Select Coding Problems</SectionTitle>
      <InputGroup>
        <label>Number of problems (max 20)</label>
        <StyledInput
          type="number"
          value={codingProblems.length}
          onChange={(e) => {
            const count = Math.min(parseInt(e.target.value), 20);
            const newProblems = Array.from({ length: count }, (_, i) => 
              codingProblems[i] || { difficulty: 'Medium', time: 30 }
            );
            setCodingProblems(newProblems);
          }}
          min="0"
          max="20"
        />
      </InputGroup>
      {codingProblems.map((problem, index) => (
        <ProblemCard key={index}>
          <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>Problem {index + 1}</h4>
          <InputGroup>
            <label>Difficulty</label>
            <Select
              value={problem.difficulty}
              onChange={(e) => {
                const newProblems = [...codingProblems];
                newProblems[index].difficulty = e.target.value;
                setCodingProblems(newProblems);
              }}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </Select>
          </InputGroup>
          <InputGroup>
            <label>Time (minutes)</label>
            <StyledInput
              type="number"
              value={problem.time}
              onChange={(e) => {
                const newProblems = [...codingProblems];
                newProblems[index].time = parseInt(e.target.value);
                setCodingProblems(newProblems);
              }}
              min="1"
            />
          </InputGroup>
        </ProblemCard>
      ))}
    </Section>
  );

  const renderSummary = () => (
    <Section>
      <SectionTitle>Test Summary</SectionTitle>
      <h4 style={{ color: '#334155', marginBottom: '0.5rem' }}>MCQ Questions</h4>
      <SummaryTable>
        <thead>
          <tr>
            <th>Topic</th>
            <th>Subtopic</th>
            <th>Questions</th>
            <th>Time (mins)</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(selectedTopics).map(topic => {
            if (selectedTopics[topic].subtopics) {
              return Object.keys(selectedTopics[topic].subtopics).map(subtopic => (
                <tr key={`${topic}-${subtopic}`}>
                  <td>{topic}</td>
                  <td>{subtopic}</td>
                  <td>{selectedTopics[topic].subtopics[subtopic].count}</td>
                  <td>{selectedTopics[topic].time * selectedTopics[topic].subtopics[subtopic].count}</td>
                </tr>
              ));
            } else {
              return (
                <tr key={topic}>
                  <td>{topic}</td>
                  <td>-</td>
                  <td>{selectedTopics[topic].count}</td>
                  <td>{selectedTopics[topic].time * selectedTopics[topic].count}</td>
                </tr>
              );
            }
          })}
        </tbody>
      </SummaryTable>
      {codingProblems.length > 0 && (
        <>
          <h4 style={{ color: '#334155', margin: '2rem 0 0.5rem 0' }}>Coding Problems</h4>
          <SummaryTable>
            <thead>
              <tr>
                <th>Problem #</th>
                <th>Difficulty</th>
                <th>Time (mins)</th>
              </tr>
            </thead>
            <tbody>
              {codingProblems.map((problem, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{problem.difficulty}</td>
                  <td>{problem.time}</td>
                </tr>
              ))}
            </tbody>
          </SummaryTable>
        </>
      )}
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f1f5f9', borderRadius: '8px' }}>
        <h3 style={{ color: '#1e293b', textAlign: 'center' }}>
          Total Test Time: <span style={{ color: '#3b82f6' }}>{calculateTotalTime()} minutes</span>
        </h3>
      </div>
      <ButtonGroup style={{ marginTop: '2rem' }}>
        <StyledButton onClick={handleBack}>Back</StyledButton>
        <StyledButton primary onClick={handleSubmit}>Start Test</StyledButton>
      </ButtonGroup>
    </Section>
  );

  return (
    <PageContainer>
      <ContentWrapper>
        <Title>Create New Test</Title>
        {page === 1 && renderMCQSelection()}
        {page === 2 && renderCodingSelection()}
        {page === 3 && renderSummary()}
        {page < 3 && (
          <ButtonGroup>
            {page > 1 && <StyledButton onClick={handleBack}>Back</StyledButton>}
            <StyledButton primary onClick={handleNext} fullWidth>
              {page === 1 ? 'Continue to Coding Problems' : 'Review Test Summary'}
            </StyledButton>
          </ButtonGroup>
        )}
      </ContentWrapper>
      {showModal && (
        <ModalOverlay>
          <ModalContent>
            <h3 style={{ color: '#1e293b', marginBottom: '1rem' }}>Confirm MCQ Selection</h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              Are you sure you want to finalize your MCQ selections?
            </p>
            <ButtonGroup>
              <StyledButton onClick={() => setShowModal(false)}>Cancel</StyledButton>
              <StyledButton primary onClick={finalizeMcqs}>Confirm</StyledButton>
            </ButtonGroup>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
}

export default CreateTestPage;