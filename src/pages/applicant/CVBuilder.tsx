// src/pages/applicant/CVBuilder.tsx
import { useState } from 'react';

export default function CVBuilder() {
  const [experiences, setExperiences] = useState([{ id: 1, company: '', role: '' }]);

  const addExperience = () => {
    setExperiences([...experiences, { id: Date.now(), company: '', role: '' }]);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">My Professional CV</h2>
        <button className="bg-green-600 text-white px-6 py-2 rounded shadow">Save CV</button>
      </header>

      <section className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Work Experience</h3>
        {experiences.map((exp, index) => (
          <div key={index} className="grid grid-cols-2 gap-4 mb-4">
            <input 
              placeholder="Company Name" 
              className="border p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none" 
            />
            <input 
              placeholder="Job Title" 
              className="border p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none" 
            />
          </div>
        ))}
        <button onClick={addExperience} className="text-blue-600 font-medium">+ Add Experience</button>
      </section>

      {/* Skills & Education sections follow the same pattern */}
    </div>
  );
}