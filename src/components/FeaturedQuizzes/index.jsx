import { Link } from "react-router-dom";
import {
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
} from "@heroicons/react/outline";
import { useEffect, useState } from "react";
import { quizService } from "../../services/quiz/quizService";

export function FeaturedQuizzes() {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      const response = await quizService.getAllQuizzes();
      setQuizzes(response.data.quizzes);
    };
    fetchQuizzes();
  }, []);

  return (
    <section className="py-16 bg-base-200">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Mental Health & Relationship Quizzes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Take our expert-designed assessments to gain insights into your
            mental health and relationships.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <figure>
                <img
                  src={quiz.imageUrl}
                  alt={quiz.quizName}
                  className="w-full h-48 object-cover"
                />
              </figure>
              <div className="card-body">
                <h3 className="card-title text-xl">{quiz.quizName}</h3>
                <p className="text-gray-600 text-sm line-clamp-3">
                  {quiz.quizDescription}
                </p>

                <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <ChartBarIcon className="h-4 w-4 mr-1" />
                    {quiz.questions.length} Questions
                  </div>
                  <div className="flex items-center">
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    {quiz.userAnswer.length} Taken
                  </div>
                </div>

                <div className="card-actions justify-end mt-4">
                  <Link
                    to={`/quizzes/${quiz._id}`}
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
          <Link to="/quizzes" className="btn btn-outline btn-primary btn-lg">
            View All Quizzes
          </Link>
        </div>
      </div>
    </section>
  );
}
