import { useState } from 'react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    id: 1,
    question: "What is Marriage Counseling?",
    answer: "Marriage counseling is a type of psychotherapy that helps couples identify and resolve conflicts, improve their relationship, and make thoughtful decisions about strengthening their bond or navigating separation."
  },
  {
    id: 2,
    question: "How do online therapy sessions work?",
    answer: "Online therapy sessions are conducted through our secure video platform. You'll meet with your therapist virtually at scheduled times, just like an in-person session, but from the comfort of your home."
  },
  {
    id: 3,
    question: "How long does each counseling session last?",
    answer: "Each counseling session typically lasts 1-3 hours. The frequency of sessions will be determined based on your specific needs and goals, in consultation with your therapist."
  },
  {
    id: 4,
    question: "Is my information confidential?",
    answer: "Yes, we take confidentiality very seriously. All communications between you and your therapist are protected by strict privacy policies and encryption. Your information is never shared without your explicit consent."
  },
  {
    id: 5,
    question: "How do I get started?",
    answer: "Getting started is simple. Browse our therapist profiles, select someone you feel comfortable with, and schedule your first session. You can also take our matching quiz to find the right therapist for your needs."
  }
];

export default function FAQs() {
  const [openId, setOpenId] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-gray-600">
              Find answers to common questions about our marriage counseling services
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
                      openId === faq.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`transition-all duration-200 ${openId === faq.id ? 'block' : 'hidden'}`}>
                  <div className="px-6 py-4 bg-gray-50 border-t">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Still have questions?
            </h2>
            <p className="text-gray-600 mb-6">
              We&apos;re here to help! Reach out to our support team for assistance.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Us
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
