export default function Contact() {
  return (
    <div className="bg-gradient-to-b from-white to-gray-50">
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              Get in touch
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Feel free to share ideas or suggestions for improvements we can make on our website.
              We&apos;re all ears and would love to hear from you.
            </p>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8 transform transition hover:shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Send us an email</h2>
              <a 
                href="mailto:support@counseling.com" 
                className="inline-flex items-center text-blue-600 hover:text-blue-700 text-lg group"
              >
                <span className="group-hover:underline">marriagecounseling@gmail.com</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Our office</h2>
              <div className="text-gray-600 space-y-2">
                <p className="font-semibold text-gray-800">Counseling Service</p>
                <p className="leading-relaxed">727, Thug Shaker Street</p>
                <p className="leading-relaxed">Binh Duong, Vietnam</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Additional Resources</h2>
              <ul className="space-y-4">
                <li>
                  <a 
                    href="/faq" 
                    className="inline-flex items-center text-gray-600 hover:text-blue-600 group"
                  >
                    <span className="group-hover:underline">FAQs</span>
                    <svg className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </li>
                <li>
                  <a 
                    href="/about-us" 
                    className="inline-flex items-center text-gray-600 hover:text-blue-600 group"
                  >
                    <span className="group-hover:underline">About Us</span>
                    <svg className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
