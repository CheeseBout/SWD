import { Link } from "react-router-dom";
import Spline from "@splinetool/react-spline";
import { motion } from "framer-motion";

export function HomeHero() {
  return (
    <section className="relative min-h-[95vh] overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <Spline
          scene="https://prod.spline.design/QCMeonzfSnApCzYO/scene.splinecode"
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/60 mix-blend-multiply" />
      </div>

      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center z-10">
        <div className="max-w-5xl mx-auto py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-800 font-medium text-sm mb-4">
                Mental Health Platform
              </span>
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Your Journey to{" "}
                <span className="text-blue-300">Mental Wellness</span> Begins
                Here
              </h1>
              <p className="text-lg md:text-xl text-blue-50/90 mb-8 leading-relaxed max-w-lg">
                Connect with professional therapists, explore personalized
                resources, and take the first step towards a healthier mind.
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                <Link
                  to="/find-a-therapist"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
                >
                  Find a Therapist
                </Link>
                <Link
                  to="/quizzes"
                  className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 font-medium rounded-lg transition-all duration-300"
                >
                  Take Assessment
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white/10 backdrop-blur-md p-6 lg:p-8 rounded-2xl border border-white/20"
            >
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-white">100+</div>
                  <div className="text-sm text-blue-100">Therapists</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-white">50K+</div>
                  <div className="text-sm text-blue-100">Users Helped</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-white">24/7</div>
                  <div className="text-sm text-blue-100">Support</div>
                </div>
              </div>

              <div className="relative bg-white/5 p-6 rounded-xl">
                <svg
                  className="absolute text-blue-300 w-12 h-12 -left-2 -top-4 opacity-20"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                  aria-hidden="true"
                >
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                <p className="text-blue-50 leading-relaxed mb-4">
                  &ldquo;This platform completely transformed my approach to mental
                  health. Finding my therapist was simple, and the resources
                  available have been invaluable.&rdquo;
                </p>
                <footer>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                      MK
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white">Maria K.</p>
                      <p className="text-xs text-blue-200">
                        Platform User • 3 months
                      </p>
                    </div>
                  </div>
                </footer>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-full border border-white/20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span className="text-sm font-medium text-white">
                Professional Support
              </span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-full border border-white/20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span className="text-sm font-medium text-white">
                Confidential Sessions
              </span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-full border border-white/20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400"></div>
              <span className="text-sm font-medium text-white">
                Personalized Care
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
