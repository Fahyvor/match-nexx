
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex justify-between p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-blue-600">HireFlow</h1>
        <div className="space-x-4">
          <button className="text-gray-600">Login</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">Get Started</button>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-extrabold text-gray-900 mb-6">
          Connecting Talent with <span className="text-blue-600">Top Recruiters</span>
        </h2>
        <p className="text-xl text-gray-600 mb-10">Build your CV, track applications, and find your dream job in minutes.</p>
        
        <div className="flex justify-center gap-6">
          <div className="p-8 border rounded-xl hover:shadow-lg transition">
            <h3 className="text-xl font-bold mb-2">For Applicants</h3>
            <p className="mb-4">Create a professional CV and apply to jobs.</p>
            <button className="bg-blue-100 text-blue-700 px-6 py-2 rounded">Join as Applicant</button>
          </div>
          <div className="p-8 border rounded-xl hover:shadow-lg transition">
            <h3 className="text-xl font-bold mb-2">For Recruiters</h3>
            <p className="mb-4">Post jobs and manage candidates seamlessly.</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded">Join as Recruiter</button>
          </div>
        </div>
      </main>
    </div>
  );
}