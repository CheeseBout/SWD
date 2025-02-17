import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <section className="relative  bg-gradient-to-b from-blue-50 to-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:bg-gradient-to-b dark:from-slate-800 dark:to-slate-900"></div>

      {/* Hero Content */}
      <div className="relative container mx-auto px-4 pt-20 pb-24 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Text Content */}
        <div className="flex-1 text-center lg:text-left max-w-2xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Find Your Path to
            <span className="block text-blue-600">Mental Wellness</span>
          </h1>
          <p className="text-lg sm:text-xl text-white mb-8 leading-relaxed">
            Connect with professional therapists, explore mental health resources, and begin your journey to a healthier mind. Expert guidance, personalized support, all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link 
              to="/find-therapist" 
              className="btn btn-primary btn-lg text-lg px-8"
            >
              Find a Therapist
            </Link>
            <Link 
              to="/mental-health-test" 
              className="btn btn-outline btn-lg text-lg px-8 text-white hover:text-black"
            >
              Take Assessment
            </Link>
          </div>
          {/* Trust Indicators */}
          <div className="mt-12 flex items-center justify-center lg:justify-start gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">100+</div>
              <div className="text-sm text-white">Therapists</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">50K+</div>
              <div className="text-sm text-white">Users Helped</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-sm text-white">Support</div>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="flex-1 relative">
          <img
            src="/Couple.jpg"
            alt="Mental Health Support"
            className="rounded-lg shadow-2xl max-w-lg mx-auto"
          />
          {/* Floating Elements */}
          <div className="absolute -top-4 -right-8 bg-blue-100 rounded-lg p-4 shadow-lg">
            <div className="text-sm font-medium">Professional Support</div>
            <div className="text-xs text-gray-600">Licensed Therapists</div>
          </div>
          <div className="absolute -bottom-4 -left-4 bg-green-100 rounded-lg p-4 shadow-lg">
            <div className="text-sm font-medium">Safe Space</div>
            <div className="text-xs text-gray-600">Confidential Sessions</div>
          </div>
        </div>
      </div>
    </section>
  );
}