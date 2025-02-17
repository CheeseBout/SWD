import { Routes, Route } from 'react-router-dom';
import { HomePage } from '@pages/HomePage';
import App from '../App';
import { Suspense, lazy } from 'react';

// Lazy load components
// const FindTherapist = lazy(() => import('../pages/FindTherapist'));
// const TherapistProfile = lazy(() => import('../pages/TherapistProfile'));
// const Quizzes = lazy(() => import('../pages/Quizzes'));
// const QuizDetail = lazy(() => import('../pages/QuizDetail'));
// const Blogs = lazy(() => import('../pages/Blogs'));
// const BlogPost = lazy(() => import('../pages/BlogPost'));
// const Courses = lazy(() => import('../pages/Courses'));
// const CourseDetail = lazy(() => import('../pages/CourseDetail'));
// const About = lazy(() => import('../pages/About'));
// const Contact = lazy(() => import('../pages/Contact'));
// const Login = lazy(() => import('../pages/Login'));
// const SignUp = lazy(() => import('../pages/SignUp'));

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<HomePage />} />
        {/* <Route
          path="find-therapist"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <FindTherapist />
            </Suspense>
          }
        />
        <Route
          path="therapist/:id"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <TherapistProfile />
            </Suspense>
          }
        />
        <Route
          path="quizzes"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <Quizzes />
            </Suspense>
          }
        />
        <Route
          path="quiz/:id"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <QuizDetail />
            </Suspense>
          }
        />
        <Route
          path="blogs"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <Blogs />
            </Suspense>
          }
        />
        <Route
          path="blog/:id"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <BlogPost />
            </Suspense>
          }
        />
        <Route
          path="courses"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <Courses />
            </Suspense>
          }
        />
        <Route
          path="course/:id"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <CourseDetail />
            </Suspense>
          }
        />
        <Route
          path="about"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <About />
            </Suspense>
          }
        />
        <Route
          path="contact"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <Contact />
            </Suspense>
          }
        />
        <Route
          path="login"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <Login />
            </Suspense>
          }
        />
        <Route
          path="signup"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <SignUp />
            </Suspense>
          }
        /> */}
      </Route>
    </Routes>
  );
}