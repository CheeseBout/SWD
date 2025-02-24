import React from 'react';

export default function AboutUs() {
  return (
    <div className="bg-white">
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About Marriage Counseling
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              We&apos;re dedicated to supporting mental wellness and healthy relationships through expert guidance, 
              resources, and a supportive community.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/2">
                <img
                  src="CouplesTherapist.jpg"
                  alt="Our Mission"
                  className="rounded-lg shadow-lg w-full h-full object-cover"
                />
              </div>
              
              <div className="w-full md:w-1/2">
                <h2 className="text-3xl font-bold mb-8">Our Mission</h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  At Marriage Counseling, we believe everyone deserves access to quality mental health support 
                  and guidance. Our platform connects individuals with professional therapists and provides 
                  comprehensive resources for mental wellness.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  We strive to break down barriers to mental health care and create a supportive environment 
                  where everyone can find the help they need to thrive.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-blue-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
              <div className="text-gray-600">Licensed Therapists</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">50K+</div>
              <div className="text-gray-600">People Helped</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6">
              <div className="mb-6 h-64 rounded-lg overflow-hidden">
                <img
                  src="compassion.jpg"
                  alt="Compassion"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-blue-600 text-4xl mb-4">
                <i className="fas fa-heart"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Compassion</h3>
              <p className="text-gray-600">
                We approach every individual with understanding and empathy
              </p>
            </div>

            <div className="text-center p-6">
              <div className="mb-6 h-64 rounded-lg overflow-hidden">
                <img
                  src="trust.jpg"
                  alt="Trust"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-blue-600 text-4xl mb-4">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Trust</h3>
              <p className="text-gray-600">
                Your privacy and security are our top priorities
              </p>
            </div>

            <div className="text-center p-6">
              <div className="mb-6 h-64 rounded-lg overflow-hidden">
                <img
                  src="excellence.jpg"
                  alt="Excellence"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-blue-600 text-4xl mb-4">
                <i className="fas fa-star"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Excellence</h3>
              <p className="text-gray-600">
                We maintain high standards in all our services
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
