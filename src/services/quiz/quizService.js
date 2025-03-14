import { api } from '../apiConfig';

export const quizService = {
  getAllQuizzes: async () => {
    const response = await api.get("/api/v1/quiz");
    return response.data;
  },

  getQuizById: async (id) => {
    try {
      const response = await api.get(`/api/v1/quiz/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching quiz with ID ${id}:`, error);
      throw error;
    }
  },

  saveTemporaryResult: (quizId, score, answers) => {
    const tempResults = JSON.parse(localStorage.getItem('tempQuizResults') || '{}');
    tempResults[quizId] = {
      quizId,
      score,
      answers,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('tempQuizResults', JSON.stringify(tempResults));
    
    // Save the quiz ID for redirection after login
    localStorage.setItem('pendingQuizRedirect', quizId);
  },
  
  getTemporaryResults: () => {
    return JSON.parse(localStorage.getItem('tempQuizResults') || '{}');
  },
  
  clearTemporaryResult: (quizId) => {
    const tempResults = JSON.parse(localStorage.getItem('tempQuizResults') || '{}');
    if (tempResults[quizId]) {
      delete tempResults[quizId];
      localStorage.setItem('tempQuizResults', JSON.stringify(tempResults));
    }
  },
  
  submitQuizResult: async (quizId, score, answers) => {
    try {
      const response = await api.post('/api/v1/quiz-results', {
        quizId,
        score,
        answers
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting quiz result:', error);
      throw error;
    }
  },
  
  getPendingRedirectQuiz: () => {
    return localStorage.getItem('pendingQuizRedirect') || null;
  },
  
  clearPendingRedirectQuiz: () => {
    localStorage.removeItem('pendingQuizRedirect');
  }
};
