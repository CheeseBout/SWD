import { Link } from 'react-router-dom';
import { ClockIcon, ChartBarIcon, UserGroupIcon } from '@heroicons/react/outline';

const quizzes = [
  {
    id: 1,
    title: "Relationship Compatibility Test",
    description: "Discover your relationship patterns and compatibility factors with our comprehensive assessment.",
    duration: "15 mins",
    questions: 20,
    takenBy: "50K+",
    image: "/quizzes/compatibility-test.jpg",
    category: "Relationships"
  },
  {
    id: 2,
    title: "Anxiety Assessment",
    description: "Evaluate your anxiety levels and get personalized recommendations for managing stress.",
    duration: "10 mins",
    questions: 15,
    takenBy: "75K+",
    image: "/quizzes/anxiety-test.jpg",
    category: "Mental Health"
  },
  {
    id: 3,
    title: "Marriage Readiness Quiz",
    description: "Are you ready for marriage? Take this quiz to assess your emotional preparedness.",
    duration: "12 mins",
    questions: 18,
    takenBy: "30K+",
    image: "/quizzes/marriage-quiz.jpg",
    category: "Pre-Marriage"
  }
];

export function FeaturedQuizzes() {
  return (
    <section className="py-16 bg-base-200">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Mental Health & Relationship Quizzes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Take our expert-designed assessments to gain insights into your mental health and relationships.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <figure>
                <img
                  src={quiz.image}
                  alt={quiz.title}
                  className="w-full h-48 object-cover"
                />
              </figure>
              <div className="card-body">
                <div className="badge badge-secondary mb-2">{quiz.category}</div>
                <h3 className="card-title text-xl">{quiz.title}</h3>
                <p className="text-gray-600 text-sm">{quiz.description}</p>
                
                <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {quiz.duration}
                  </div>
                  <div className="flex items-center">
                    <ChartBarIcon className="h-4 w-4 mr-1" />
                    {quiz.questions} Questions
                  </div>
                  <div className="flex items-center">
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    {quiz.takenBy} Taken
                  </div>
                </div>

                <div className="card-actions justify-end mt-4">
                  <Link 
                    to={`/quiz/${quiz.id}`}
                    className="btn btn-primary btn-block"
                  >
                    Take Quiz
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link 
            to="/quizzes" 
            className="btn btn-outline btn-primary btn-lg"
          >
            View All Quizzes
          </Link>
        </div>
      </div>
    </section>
  );
}