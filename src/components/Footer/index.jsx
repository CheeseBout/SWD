import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <div className="bg-gray-100">
      {/* Main Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* Company Info */}
          <div className="md:max-w-xs">
            <Link to="/" className="inline-block">
              <img src="/KetHon.png" alt="KetHon Logo" className="h-30 w-40" />
            </Link>
          </div>

          {/* Links sections */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-16">
            {/* Quick Links */}
            <div>
              <h6 className="font-semibold text-gray-900 mb-4">Support & Resources</h6>
              <ul className="space-y-3">
                <li><Link to="/blogs" className="text-gray-600 hover:text-gray-900">Blog Articles</Link></li>
                <li><Link to="/courses" className="text-gray-600 hover:text-gray-900">Online Courses</Link></li>
                <li><Link to="/faq" className="text-gray-600 hover:text-gray-900">FAQs</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h6 className="font-semibold text-gray-900 mb-4">Services</h6>
              <ul className="space-y-3">
                <li><Link to="/find-therapist" className="text-gray-600 hover:text-gray-900">Find a Therapist</Link></li>
                <li><Link to="/counseling" className="text-gray-600 hover:text-gray-900">Online Counseling</Link></li>
                <li><Link to="/assessments" className="text-gray-600 hover:text-gray-900">Mental Health Tests</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h6 className="font-semibold text-gray-900 mb-4">Company</h6>
              <ul className="space-y-3">
                <li><Link to="/about" className="text-gray-600 hover:text-gray-900">About Us</Link></li>
                <li><Link to="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link></li>
                <li><Link to="/privacy" className="text-gray-600 hover:text-gray-900">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom Footer */}
      <div className="border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} KetHon. All rights reserved.
            </div>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-6 text-sm text-gray-500">
                <li><Link to="/terms" className="hover:text-gray-900">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-gray-900">Privacy Policy</Link></li>
                <li><Link to="/cookies" className="hover:text-gray-900">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}