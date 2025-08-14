import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Toaster } from '../utils/Toaster';

const TestContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: 'Inter', sans-serif;
`;

const Sidebar = styled.div`
  width: 280px;
  background: white;
  border-right: 1px solid #e2e8f0;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
`;

const QuestionList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h4`
  margin: 1.5rem 0 0.5rem 0;
  color: #64748b;
`;

const QuestionButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid #e2e8f0;
  background: ${({ status }) => 
    status === 'answered' ? '#10b981' : 
    status === 'current' ? '#3b82f6' : 
    status === 'visited' ? '#dbeafe' : 'white'};
  color: ${({ status }) => 
    status === 'answered' ? 'white' : 
    status === 'current' ? 'white' : '#1e293b'};
`;

const Timer = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ timeLeft }) => timeLeft < 600 ? '#ef4444' : '#1e293b'};
`;

const QuestionSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const MCQSection = styled.div`
  margin-bottom: 3rem;
`;

const CodingSection = styled.div`
  margin-bottom: 3rem;
`;

const OptionsList = styled.div`
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const OptionLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ selected, showResults, correct }) => 
    showResults ? 
      (correct ? '#10b981' : selected ? '#ef4444' : '#e2e8f0') : 
      selected ? '#3b82f6' : '#e2e8f0'};
  background: ${({ selected, showResults, correct }) => 
    showResults ? 
      (correct ? '#ecfdf5' : selected ? '#fee2e2' : 'white') : 
      selected ? '#eff6ff' : 'white'};
  cursor: ${({ showResults }) => showResults ? 'default' : 'pointer'};
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: flex-end;
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

const NavigationButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: space-between;
`;

const ActionButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  background: ${({ primary }) => primary ? '#3b82f6' : '#e2e8f0'};
  color: ${({ primary }) => primary ? 'white' : '#1e293b'};
`;

const SubmitButton = styled(ActionButton)`
  margin-top: 2rem;
  width: 100%;
  background: #10b981;
  color: white;
`;

const CheckAnswersButton = styled(ActionButton)`
  margin-top: 2rem;
  width: 100%;
  background: #f59e0b;
  color: white;
`;

const GoGoneButton = styled(ActionButton)`
  margin-top: 1rem;
  width: 100%;
  background: #ef4444;
  color: white;
`;

const ResultBadge = styled.span`
  margin-left: auto;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ correct }) => correct ? '#ecfdf5' : '#fee2e2'};
  color: ${({ correct }) => correct ? '#065f46' : '#b91c1c'};
`;

const StartTestPage = () => {
  const navigate = useNavigate();
  const [testData, setTestData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(null);
  const timerRef = useRef(null);
  const [homeModal, setHomeModal] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('testData');
    if (!savedData) {
      navigate('/create-test');
      return;
    }
    const data = JSON.parse(savedData);
    const storedQuestions = sessionStorage.getItem('testQuestions');
    if (storedQuestions) {
      const parsedQuestions = JSON.parse(storedQuestions);
      setTestData(parsedQuestions);
      setTimeLeft(parsedQuestions.totalTime * 60);
    } else {
      fetchQuestions(data);
      setTimeLeft(data.totalTime * 60);
    }
  }, [navigate]);

  const fetchQuestions = async (data) => {
    const token = sessionStorage.getItem('token');
  
    if (!token) {
      Toaster({ title: 'Error', type: 'error', message: 'Please Relogin!!' });
      return;
    }
  
    try {
      const promises = [];

      if (data.mcqData?.queries?.length > 0) {
        promises.push(
          axios.post(
            `${import.meta.env.VITE_API_URL}/api/mcqs`,
            { queries: data.mcqData.queries },
            { headers: { authorization: `Bearer ${token}` } }
          )
        );
      } else {
        promises.push(Promise.resolve({ data: [] }));
      }
  
      if (data.codingData?.count > 0 && data.codingData?.difficulties?.length > 0) {
        promises.push(
          axios.post(
            `${import.meta.env.VITE_API_URL}/api/codings`,
            {
              difficulties: data.codingData.difficulties,
              count: data.codingData.count
            },
            { headers: { authorization: `Bearer ${token}` } }
          )
        );
      } else {
        promises.push(Promise.resolve({ data: [] }));
      }
  
      const [mcqResponse, codingResponse] = await Promise.all(promises);
  
      const fullData = {
        ...data,
        mcqQuestions: mcqResponse.data || [],
        codingQuestions: codingResponse.data || []
      };
  
      setTestData(fullData);
      sessionStorage.setItem('testQuestions', JSON.stringify(fullData));
    } catch {
      Toaster({ type: 'error', message: 'Failed to load test questions' });
    }
  };

  useEffect(() => {
    if (timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft]);

  const handleAnswerSelect = (questionId, answer) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleAutoSubmit = () => {
    clearInterval(timerRef.current);
    submitTest();
  };

  const handleManualSubmit = () => setShowSubmitModal(true);

  const checkAnswers = () => {
    if (!testData) return;
    let correct = 0;
    let totalMcqs = testData.mcqQuestions?.length || 0;
    testData.mcqQuestions?.forEach(q => {
      if (answers[q.id] === q.correct_answer) correct++;
    });
    const codingAttempted = testData.codingQuestions?.filter(q => answers[q.id]).length || 0;
    const scorePercentage = Math.round((correct / totalMcqs) * 100);
    setScore({ mcqCorrect: correct, mcqTotal: totalMcqs, codingAttempted, codingTotal: testData.codingQuestions?.length || 0, scorePercentage });
    setShowResults(true);
  };

  const submitTest = () => {
    checkAnswers();
    setShowSubmitModal(false);
  };

  const goHome = () => {
    sessionStorage.removeItem("testQuestions"); 
    localStorage.removeItem("testData"); 
    setHomeModal(false);
    navigate('/my-test');
  };



  const getQuestionByIndex = (index) => {
    if (index < (testData.mcqQuestions?.length || 0)) return testData.mcqQuestions[index];
    return testData.codingQuestions[index - (testData.mcqQuestions?.length || 0)];
  };

  const getQuestionStatus = (index) => {
    if (index === currentQuestion) return 'current';
    const question = getQuestionByIndex(index);
    if (answers[question.id]) return 'answered';
    if (index < currentQuestion) return 'visited';
    return 'unvisited';
  };

  const renderMCQSection = () => {
    const question = getQuestionByIndex(currentQuestion);
    return (
      <MCQSection>
        <h2>MCQ Questions</h2>
        <QuestionSection>
          <h3>Question {currentQuestion + 1}</h3>
          <div dangerouslySetInnerHTML={{ __html: question.question }} />
          <OptionsList>
            {question.options.map((option, idx) => {
              const isSelected = answers[question.id] === option;
              const isCorrect = option === question.correct_answer;
              return (
                <OptionLabel key={idx} selected={isSelected} showResults={showResults} correct={isCorrect}>
                  <input type="radio" checked={isSelected} onChange={() => handleAnswerSelect(question.id, option)} disabled={showResults} />
                  {option}
                  {showResults && isSelected && <ResultBadge correct={isCorrect}>{isCorrect ? 'Correct' : 'Incorrect'}</ResultBadge>}
                  {showResults && !isSelected && isCorrect && <ResultBadge correct>Correct Answer</ResultBadge>}
                </OptionLabel>
              );
            })}
          </OptionsList>
          {showResults && <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}><p><strong>Explanation:</strong> {question.explanation || 'No explanation available.'}</p></div>}
        </QuestionSection>
      </MCQSection>
    );
  };

  const renderCodingSection = () => {
    const question = getQuestionByIndex(currentQuestion);
    const questionNumber = currentQuestion + 1 - (testData.mcqQuestions?.length || 0);
    return (
      <CodingSection>
        <h2>Coding Problems</h2>
        <QuestionSection>
          <h3>Problem {questionNumber}</h3>
          <div dangerouslySetInnerHTML={{ __html: question.content || <></> }} />
          <p>Difficulty: {question.difficulty}</p>
          <p>Acceptance Rate: {question.acceptance_rate}%</p>
          <a href={`https://leetcode.com/problems/${question.title_slug}`} target="_blank" rel="noopener noreferrer">Solve on LeetCode</a>
          <div style={{ marginTop: '1rem' }}>
            <label>
              <input type="checkbox" checked={!!answers[question.id]} onChange={(e) => handleAnswerSelect(question.id, e.target.checked ? 'attempted' : null)} disabled={showResults} />
              I attempted this problem
            </label>
          </div>
        </QuestionSection>
      </CodingSection>
    );
  };

  if (!testData) return <div>Loading test data...</div>;

  return (
    <TestContainer>
      <Sidebar>
        <h3>Test Navigation</h3>
        <Timer timeLeft={timeLeft}>Time: {`${Math.floor(timeLeft/60).toString().padStart(2,'0')}:${(timeLeft%60).toString().padStart(2,'0')}`}</Timer>
        <SectionTitle>MCQ Questions</SectionTitle>
        <QuestionList>
          {testData.mcqQuestions?.map((_, index) => (
            <QuestionButton key={index} onClick={() => setCurrentQuestion(index)} status={getQuestionStatus(index)}>{index + 1}</QuestionButton>
          ))}
        </QuestionList>
        <SectionTitle>Coding Problems</SectionTitle>
        <QuestionList>
          {testData.codingQuestions?.map((_, index) => (
            <QuestionButton key={index + (testData.mcqQuestions?.length || 0)} onClick={() => setCurrentQuestion(index + (testData.mcqQuestions?.length || 0))} status={getQuestionStatus(index + (testData.mcqQuestions?.length || 0))}>{index + 1}</QuestionButton>
          ))}
        </QuestionList>
        {!showResults ? (
          <SubmitButton onClick={handleManualSubmit}>Submit Test</SubmitButton>
        ) : (
          <>
            <GoGoneButton onClick={() => {setHomeModal(true)}}>Go Gone</GoGoneButton>
            <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
              <h4>Test Summary</h4>
              <p>MCQ Score: {score?.mcqCorrect || 0}/{score?.mcqTotal || 0}</p>
              <p>Coding Attempted: {score?.codingAttempted || 0}/{score?.codingTotal || 0}</p>
              <p>Overall Score: {score?.scorePercentage || 0}%</p>
            </div>
          </>
        )}
      </Sidebar>
      <MainContent>
        {currentQuestion < (testData.mcqQuestions?.length || 0) ? renderMCQSection() : renderCodingSection()}
        <NavigationButtons>
          {currentQuestion > 0 && <ActionButton onClick={() => setCurrentQuestion(prev => prev - 1)}>Previous</ActionButton>}
          {currentQuestion < ((testData.mcqQuestions?.length || 0) + (testData.codingQuestions?.length || 0)) - 1 && <ActionButton primary onClick={() => setCurrentQuestion(prev => prev + 1)}>Next</ActionButton>}
        </NavigationButtons>
      </MainContent>
      {showSubmitModal && (
        <ModalOverlay>
          <ModalContent>
            <h3>Submit Test?</h3>
            <p>Are you sure you want to submit your test?</p>
            <p>Time Remaining: {`${Math.floor(timeLeft/60).toString().padStart(2,'0')}:${(timeLeft%60).toString().padStart(2,'0')}`}</p>
            <ButtonGroup>
              <ActionButton onClick={() => setShowSubmitModal(false)}>Cancel</ActionButton>
              <ActionButton primary onClick={submitTest}>Submit</ActionButton>
            </ButtonGroup>
          </ModalContent>
        </ModalOverlay>
      )}
      {homeModal && (
        <ModalOverlay>
          <ModalContent>
            <h3 style={{ color: '#1e293b', marginBottom: '1rem' }}>Quit the Test</h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              Are you sure you want to quit the test?
            </p>
            <ButtonGroup>
              <StyledButton onClick={() => setHomeModal(false)}>Cancel</StyledButton>
              <StyledButton primary onClick={goHome}>Confirm</StyledButton>
            </ButtonGroup>
          </ModalContent>
        </ModalOverlay>
      )}
    </TestContainer>
  );
};

export default StartTestPage;
