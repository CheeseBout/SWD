import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <div className="bg-gradient-to-b from-gray-100 to-gray-200">
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="md:max-w-xs">
            <Link to="/" className="inline-block pl-8 mb-4">
              <img src="/logo.png" alt="KetHon Logo" className="h-30 w-40" />
            </Link>            
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-16">
            <div>
              <h6 className="font-semibold text-gray-900 mb-4 text-lg border-b border-gray-300 pb-2">Support & Resources</h6>
              <ul className="space-y-3">
                <li><Link to="/blogs" className="text-gray-600 hover:text-blue-600 transition-colors">Blog Articles</Link></li>
                <li><Link to="/courses" className="text-gray-600 hover:text-blue-600 transition-colors">Online Courses</Link></li>
                <li><Link to="/faq" className="text-gray-600 hover:text-blue-600 transition-colors">FAQs</Link></li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold text-gray-900 mb-4 text-lg border-b border-gray-300 pb-2">Services</h6>
              <ul className="space-y-3">
                <li><Link to="/find-a-therapist" className="text-gray-600 hover:text-blue-600 transition-colors">Find a Therapist</Link></li>
                <li><Link to="/counseling" className="text-gray-600 hover:text-blue-600 transition-colors">Online Counseling</Link></li>
                <li><Link to="/quizzes" className="text-gray-600 hover:text-blue-600 transition-colors">Mental Health Tests</Link></li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold text-gray-900 mb-4 text-lg border-b border-gray-300 pb-2">Company</h6>
              <ul className="space-y-3">
                <li><Link to="/about-us" className="text-gray-600 hover:text-blue-600 transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</Link></li>
                <li><Link to="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      <div className="border-t border-gray-300 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} MarriageCounseling. All rights reserved.
            </div>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-6 text-sm text-gray-500">
                <li><Link to="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/cookies" className="hover:text-blue-600 transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}