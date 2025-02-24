export function TherapyProcess() {
  return (
    <div className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 mb-24">
        <div className="flex flex-col md:flex-row items-center gap-16 max-w-6xl mx-auto">
          <div className="w-full md:w-2/5 h-[350px]">
            <img
              src="/find-therapists.png"
              alt="Find a Therapist"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="w-full md:w-3/5">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Find a Therapist</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Everyone has unique needs when it comes to relationship help or mental health condition. 
              Search by name, city or zip and we will display the best therapists in your locale from our list.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row-reverse items-center gap-16 max-w-6xl mx-auto">
            <div className="w-full md:w-1/2 h-[400px]">
              <img
                src="/Connect.png"
                alt="Connect with Therapists"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Found therapists that seem right for you? Great! You can connect with them directly 
                on their profile page. Get to know them better by reading their advisory articles. 
                Contact them and take back control of your life.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row items-center gap-16 max-w-6xl mx-auto">
          <div className="w-full md:w-2/5 h-[350px]">
            <img
              src="/seekadvice.png"
              alt="Seek Advice"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="w-full md:w-3/5">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Seek Advice</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Now that you&apos;ve found your perfect therapist, don&apos;t wait to seek advice and therapy. 
              Talk 1-on-1 as your therapist helps you uncover strengths to cope with life challenges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
