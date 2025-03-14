export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Terms of Service</h1>
          <p className="text-gray-600 mb-12 text-center">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-lg max-w-none space-y-8">
            {/* Agreement to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <p className="text-gray-600 leading-relaxed mb-4">
                  By accessing or using our marriage counseling platform, you agree to be bound by these Terms of Service 
                  and our Privacy Policy. If you disagree with any part of these terms, you may not access our services.
                </p>
              </div>
            </section>

            {/* User Responsibilities */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User Responsibilities</h2>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <ul className="list-disc pl-6 space-y-3 text-gray-600">
                  <li>Provide accurate and complete information when creating an account</li>
                  <li>Maintain the confidentiality of your account credentials</li>
                  <li>Not share your account access with third parties</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Respect the privacy and rights of other users</li>
                </ul>
              </div>
            </section>

            {/* Service Description */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Service Description</h2>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <p className="text-gray-600 leading-relaxed mb-4">
                  We provide an online platform connecting users with licensed mental health professionals. 
                  While we strive to maintain high-quality services, we do not guarantee specific outcomes 
                  from counseling sessions.
                </p>
              </div>
            </section>

            {/* Privacy and Confidentiality */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Privacy and Confidentiality</h2>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <p className="text-gray-600 leading-relaxed mb-4">
                  We are committed to protecting your privacy and maintaining the confidentiality of your 
                  information. Please review our Privacy Policy for detailed information about how we 
                  collect, use, and protect your data.
                </p>
              </div>
            </section>

            {/* Payment Terms */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Payment Terms</h2>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <p className="text-gray-600 leading-relaxed mb-4">
                  Users are responsible for all fees associated with services rendered. Payments are 
                  processed securely through our platform, and refunds are subject to our refund policy.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <p className="text-gray-600 leading-relaxed">
                  Our platform is provided &quot;as is&quot; without any warranties. We are not liable for any 
                  damages arising from your use of our services or any advice provided through our platform.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-blue-50 rounded-lg p-6 mt-12">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Questions About the Terms?</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about these Terms of Service, please contact our support team.
              </p>
              <a 
                href="/contact" 
                className="inline-flex items-center text-blue-600 hover:text-blue-700"
              >
                Contact Support
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
