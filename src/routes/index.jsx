import { Routes, Route } from 'react-router-dom';
import { HomePage } from '@pages/HomePage';
import App from '../App';
import { Suspense, lazy } from 'react';
import PropTypes from 'prop-types';

const Topics = lazy(() => import('../pages/Topics'));
const Quizzes = lazy(() => import('../pages/Quizzes'));
const TopicDetail = lazy(() => import('../pages/Topics/TopicDetail'));
// const QuizDetail = lazy(() => import('../pages/QuizDetail'));

const LazyLoad = ({ children }) => (
  <Suspense fallback={<div>Loading...</div>}>
    {children}
  </Suspense>
);

LazyLoad.propTypes = {
  children: PropTypes.node.isRequired
};

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<HomePage />} />
        
        <Route path="quizzes">
          <Route index element={
            <LazyLoad>
              <Quizzes />
            </LazyLoad>
          } />
          <Route path=":id" element={
            <LazyLoad>
              {/* <QuizDetail /> */}
            </LazyLoad>
          } />
        </Route>

        <Route path="topics">
          <Route index element={
            <LazyLoad>
              <Topics />
            </LazyLoad>
          } />
          <Route path=":id" element={
            <LazyLoad>
              <TopicDetail />
            </LazyLoad>
          } />
        </Route>
      </Route>
    </Routes>
  );
}