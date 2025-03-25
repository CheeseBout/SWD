import { Routes, Route } from "react-router-dom";
import { HomePage } from "@pages/HomePage";
import App from "../App";
import { Suspense, lazy } from "react";
import PropTypes from "prop-types";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import VerifyEmail from "../pages/VerifyEmail";
const Topics = lazy(() => import("../pages/Topics"));
const Quizzes = lazy(() => import("../pages/Quiz/Quizzes"));
const TopicDetail = lazy(() => import("../pages/Topics/TopicDetail"));
const AboutUs = lazy(() => import("../pages/AboutUs"));
const Contact = lazy(() => import("../pages/Contact"));
const PrivacyPolicy = lazy(() => import("../pages/Policy/PrivacyPolicy"));
const QuizDetail = lazy(() => import("../pages/Quiz/QuizDetail"));
const SearchTherapist = lazy(() =>
  import("../pages/Therapist/SearchTherapist")
);
const FAQs = lazy(() => import("../pages/FAQs"));
const ProfilePage = lazy(() => import("../pages/Profile"));
const UpdateProfile = lazy(() => import("../pages/Profile/UpdateProfile"));
const ChangePassword = lazy(() => import("../pages/Profile/ChangePassword"));
const LoginPage = lazy(() => import("../pages/Login"));
const RegisterPage = lazy(() => import("../pages/Register"));
const CookiePolicy = lazy(() => import("../pages/Policy/CookiePolicy"));
const TermsOfService = lazy(() => import("../pages/Policy/TermsOfService"));
const ForgotPasswordPage = lazy(() => import("../pages/Forgot-password"));
const TherapistDetail = lazy(() =>
  import("../pages/Therapist/TherapistDetail")
);
const BlogsPage = lazy(() => import("../pages/Blogs"));
const BlogDetailPage = lazy(() => import("../pages/Blogs/BlogDetail"));
const AdminBlogs = lazy(() => import("../pages/Admin/BlogsManagement"));
const AdminDashboard = lazy(() => import("../pages/Admin/Dashboard"));
const BlogCreate = lazy(() => import("../pages/Admin/BlogCreate"));
const BlogEdit = lazy(() => import("../pages/Admin/BlogEdit"));
const TherapistDashboard = lazy(() => import("../pages/Therapist/Dashboard"));
const Therapist = lazy(() => import("../pages/Therapist/Therapist"));
const BookReservation = lazy(() => import("../pages/BookReservation"));
const YourReservation = lazy(() => import("../pages/Reservation"));
const MemberResultDetail = lazy(() =>
  import("../pages/ReservationResult/ResultDetail")
);
const Connect = lazy(() => import("../pages/Connection/Connect"));
const TherapistReservations = lazy(() =>
  import("../pages/Therapist/Reservations")
);
const TherapistReservationsResult = lazy(() =>
  import("../pages/Therapist/ReservationResult")
);
const TherapistBlogs = lazy(() => import("../pages/Therapist/BlogsManagement"));
const TherapistCertificates = lazy(() =>
  import("../pages/Therapist/Certificates")
);
const TherapistAvailability = lazy(() =>
  import("../pages/Therapist/Availability")
);
const CertificateRequest = lazy(() =>
  import("../pages/Admin/CertificateRequest")
);
const QuizManagement = lazy(() => import("../pages/Admin/QuizzesManagement"));
const QuizCreate = lazy(() => import("../pages/Admin/QuizCreate"));
const QuizEdit = lazy(() => import("../pages/Admin/QuizEdit"));
const TopicManagement = lazy(() => import("../pages/Admin/TopicsManagement"));
const UserManagement = lazy(() => import("../pages/Admin/UsersManagement"));
const QuestionManagement = lazy(() =>
  import("../pages/Admin/QuestionsManagement")
);
const QuestionBankManagement = lazy(() =>
  import("../pages/Admin/QuestionBanksManagement")
);
const PackagesManagement = lazy(() =>
  import("../pages/Admin/PackagesManagement")
);
const ResetPassword = lazy(() => import("../pages/ResetPassword"));
const CategoryManagement = lazy(() =>
  import("../pages/Admin/CategoryManagement")
);
const LazyLoad = ({ children }) => (
  <Suspense fallback={<div></div>}>{children}</Suspense>
);
const Transactions = lazy(() => import("../pages/Admin/Transactions"));

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
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route
          path="/reset-password"
          element={
            <LazyLoad>
              <ResetPassword />
            </LazyLoad>
          }
        />
        <Route
          path="forgot-password"
          element={
            <LazyLoad>
              <ForgotPasswordPage />
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
          path="reservation-results/:reservationId/:therapistId"
          element={
            <LazyLoad>
              <MemberResultDetail />
            </LazyLoad>
          }
        />
        <Route
          path="faq"
          element={
            <LazyLoad>
              <FAQs />
            </LazyLoad>
          }
        />
        <Route
          path="cookies"
          element={
            <LazyLoad>
              <CookiePolicy />
            </LazyLoad>
          }
        />
        <Route
          path="terms"
          element={
            <LazyLoad>
              <TermsOfService />
            </LazyLoad>
          }
        />
        <Route path="blogs">
          <Route
            index
            element={
              <LazyLoad>
                <BlogsPage />
              </LazyLoad>
            }
          />
          <Route
            path=":slug"
            element={
              <LazyLoad>
                <BlogDetailPage />
              </LazyLoad>
            }
          />
        </Route>
        <Route
          path="therapist/:therapistId"
          element={
            <LazyLoad>
              <TherapistDetail />
            </LazyLoad>
          }
        />
        <Route
          path="find-therapist"
          element={
            <LazyLoad>
              <Therapist />
            </LazyLoad>
          }
        />
        <Route
          path="bookReservation/:therapistId"
          element={
            <LazyLoad>
              <BookReservation />
            </LazyLoad>
          }
        />
        <Route
          path="payment/result"
          element={
            <LazyLoad>
              <YourReservation />
            </LazyLoad>
          }
        />
        <Route
          path="quizzes"
          element={
            <LazyLoad>
              <Quizzes />
            </LazyLoad>
          }
        />
        <Route
          path="quizzes/:id"
          element={
            <LazyLoad>
              <QuizDetail />
            </LazyLoad>
          }
        />
        <Route
          path="topics"
          element={
            <LazyLoad>
              <Topics />
            </LazyLoad>
          }
        />
        <Route
          path="topics/:id"
          element={
            <LazyLoad>
              <TopicDetail />
            </LazyLoad>
          }
        />

        {/* Protected Profile Routes */}
        <Route
          path="profile"
          element={
            <ProtectedRoute
              allowedRoles={["member", "admin", "couple_therapist"]}
            />
          }
        >
          <Route
            index
            element={
              <LazyLoad>
                <ProfilePage />
              </LazyLoad>
            }
          />
          <Route
            path="your-reservations"
            element={
              <LazyLoad>
                <YourReservation />
              </LazyLoad>
            }
          />
          <Route
            path="update-profile"
            element={
              <LazyLoad>
                <UpdateProfile />
              </LazyLoad>
            }
          />
          <Route
            path="change-password"
            element={
              <LazyLoad>
                <ChangePassword />
              </LazyLoad>
            }
          />
          <Route
            path="connect"
            element={
              <LazyLoad>
                <Connect />
              </LazyLoad>
            }
          />
        </Route>

        {/* Protected Admin Routes */}
        <Route
          path="manage"
          element={
            <ProtectedRoute allowedRoles={["admin", "couple_therapist"]} />
          }
        >
          <Route
            path="blogs/create"
            element={
              <LazyLoad>
                <BlogCreate />
              </LazyLoad>
            }
          />
          <Route
            path="blogs/edit/:slug"
            element={
              <LazyLoad>
                <BlogEdit />
              </LazyLoad>
            }
          />
        </Route>

        {/* Admin Only Routes */}
        <Route path="admin" element={<ProtectedRoute allowedRoles="admin" />}>
          <Route
            path="dashboard"
            element={
              <LazyLoad>
                <AdminDashboard />
              </LazyLoad>
            }
          />
          <Route
            path="blogs"
            element={
              <LazyLoad>
                <AdminBlogs />
              </LazyLoad>
            }
          />
          <Route
            path="certificates"
            element={
              <LazyLoad>
                <CertificateRequest />
              </LazyLoad>
            }
          />
          <Route
            path="quizzes"
            element={
              <LazyLoad>
                <QuizManagement />
              </LazyLoad>
            }
          />
          <Route
            path="quizzes/create"
            element={
              <LazyLoad>
                <QuizCreate />
              </LazyLoad>
            }
          />
          <Route
            path="quizzes/edit/:id"
            element={
              <LazyLoad>
                <QuizEdit />
              </LazyLoad>
            }
          />
          <Route
            path="topics"
            element={
              <LazyLoad>
                <TopicManagement />
              </LazyLoad>
            }
          />
          <Route
            path="users"
            element={
              <LazyLoad>
                <UserManagement />
              </LazyLoad>
            }
          />
          <Route
            path="question-banks"
            element={
              <LazyLoad>
                <QuestionBankManagement />
              </LazyLoad>
            }
          />
          <Route
            path="question-banks/questions/:bankId"
            element={
              <LazyLoad>
                <QuestionManagement />
              </LazyLoad>
            }
          />
          <Route
            path="packages"
            element={
              <LazyLoad>
                <PackagesManagement />
              </LazyLoad>
            }
          />
          <Route
            path="transactions"
            element={
              <LazyLoad>
                <Transactions />
              </LazyLoad>
            }
          />
          <Route
            path="categories"
            element={
              <LazyLoad>
                <CategoryManagement />
              </LazyLoad>
            }
          />
        </Route>

        {/* Therapist Only Routes */}
        <Route
          path="therapist"
          element={<ProtectedRoute allowedRoles="couple_therapist" />}
        >
          <Route
            path="dashboard"
            element={
              <LazyLoad>
                <TherapistDashboard />
              </LazyLoad>
            }
          />
          <Route
            path="reservationResult/:reservationId"
            element={
              <LazyLoad>
                <TherapistReservationsResult />
              </LazyLoad>
            }
          />
          <Route
            path="blogs"
            element={
              <LazyLoad>
                <TherapistBlogs />
              </LazyLoad>
            }
          />
          <Route
            path="reservations"
            element={
              <LazyLoad>
                <TherapistReservations />
              </LazyLoad>
            }
          />
          <Route
            path="certificates"
            element={
              <LazyLoad>
                <TherapistCertificates />
              </LazyLoad>
            }
          />
          <Route
            path="availability"
            element={
              <LazyLoad>
                <TherapistAvailability />
              </LazyLoad>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}
