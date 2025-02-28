import { Routes, Route } from "react-router-dom";
import { HomePage } from "@pages/HomePage";
import App from "../App";
import { Suspense, lazy } from "react";
import PropTypes from "prop-types";
import GoogleCallbackHandler from "../pages/Login/GoogleCallbackHandler";

const Topics = lazy(() => import("../pages/Topics"));
const Quizzes = lazy(() => import("../pages/Quiz/Quizzes"));
const TopicDetail = lazy(() => import("../pages/Topics/TopicDetail"));
const AboutUs = lazy(() => import("../pages/AboutUs"));
const Contact = lazy(() => import("../pages/Contact"));
const PrivacyPolicy = lazy(() => import("../pages/Policy/PrivacyPolicy"));
const QuizDetail = lazy(() => import('../pages/Quiz/QuizDetail'));
const SearchTherapist = lazy(() =>
  import("../pages/Therapist/SearchTherapist")
);
const FAQs = lazy(() => import("../pages/FAQs"));
const ProfilePage = lazy(() => import("../pages/Profile"));
const LoginPage = lazy(() => import("../pages/Login"));
const RegisterPage = lazy(() => import("../pages/Register"));const CookiePolicy = lazy(() => import('../pages/Policy/CookiePolicy'));
const TermsOfService = lazy(() => import('../pages/Policy/TermsOfService'));

const LazyLoad = ({ children }) => (
  <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
);

LazyLoad.propTypes = {
  children: PropTypes.node.isRequired,
};

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<HomePage />} />
        <Route
          path="login"
          element={
            <LazyLoad>
              <LoginPage />
            </LazyLoad>
          }
        />
        <Route
          path="google-callback"
          element={
            <LazyLoad>
              <GoogleCallbackHandler />
            </LazyLoad>
          }
        />
        <Route
          path="register"
          element={
            <LazyLoad>
              <RegisterPage />
            </LazyLoad>
          }
        />
        <Route
          path="profile"
          element={
            <LazyLoad>
              <ProfilePage />
            </LazyLoad>
          }
        />
        ;
        <Route path="quizzes">
          <Route
            index
            element={
              <LazyLoad>
                <Quizzes />
              </LazyLoad>
            }
          />
          <Route
            path=":id"
            element={
              <LazyLoad>
                <QuizDetail />
              </LazyLoad>
            }
          />
        </Route>
        <Route path="topics">
          <Route
            index
            element={
              <LazyLoad>
                <Topics />
              </LazyLoad>
            }
          />
          <Route
            path=":id"
            element={
              <LazyLoad>
                <TopicDetail />
              </LazyLoad>
            }
          />
        </Route>
        <Route
          path="about-us"
          element={
            <LazyLoad>
              <AboutUs />
            </LazyLoad>
          }
        />
        <Route
          path="contact"
          element={
            <LazyLoad>
              <Contact />
            </LazyLoad>
          }
        />
        <Route
          path="privacy"
          element={
            <LazyLoad>
              <PrivacyPolicy />
            </LazyLoad>
          }
        />
        <Route path="find-a-therapist">
          <Route
            index
            element={
              <LazyLoad>
                <SearchTherapist />
              </LazyLoad>
            }
          />
          <Route
            path="search"
            element={
              <LazyLoad>
                <SearchTherapist />
              </LazyLoad>
            }
          />
        </Route>
        <Route
          path="faq"
          element={
            <LazyLoad>
              <FAQs />
            </LazyLoad>
          }
        />

        <Route path="cookies" element={
          <LazyLoad>
            <CookiePolicy />
          </LazyLoad>
        } />

        <Route path="terms" element={
          <LazyLoad>
            <TermsOfService />
          </LazyLoad>
        } />
      </Route>
    </Routes>
  );
}
