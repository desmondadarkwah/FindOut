import React, { createContext, useContext, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

const VerificationContext = createContext();

export const useVerification = () => {
  const context = useContext(VerificationContext);
  if (!context) {
    throw new Error('useVerification must be used within VerificationProvider');
  }
  return context;
};

const VerificationProvider = ({ children }) => {
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch verification status
  const fetchVerificationStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/api/verification/status');
      
      if (response.data.success) {
        setVerificationStatus(response.data);
        return response.data;
      }
    } catch (err) {
      console.error('Error fetching verification status:', err);
      setError(err.response?.data?.message || 'Failed to fetch verification status');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Start a quiz
  const startQuiz = async (subject) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.post('/api/verification/start-quiz', { subject });
      
      if (response.data.success) {
        return response.data;
      }
    } catch (err) {
      console.error('Error starting quiz:', err);
      setError(err.response?.data?.message || 'Failed to start quiz');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Submit quiz answers
  const submitQuiz = async (quizSessionId, answers) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.post('/api/verification/submit-quiz', {
        quizSessionId,
        answers
      });
      
      if (response.data.success) {
        // Refresh verification status
        await fetchVerificationStatus();
        return response.data;
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError(err.response?.data?.message || 'Failed to submit quiz');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get quiz history
  const getQuizHistory = async (subject = null) => {
    try {
      setLoading(true);
      setError(null);
      const params = subject ? { subject } : {};
      const response = await axiosInstance.get('/api/verification/history', { params });
      
      if (response.data.success) {
        return response.data.verifications;
      }
    } catch (err) {
      console.error('Error fetching quiz history:', err);
      setError(err.response?.data?.message || 'Failed to fetch quiz history');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const value = {
    verificationStatus,
    loading,
    error,
    fetchVerificationStatus,
    startQuiz,
    submitQuiz,
    getQuizHistory,
    setError
  };

  return (
    <VerificationContext.Provider value={value}>
      {children}
    </VerificationContext.Provider>
  );
};

export default VerificationProvider;