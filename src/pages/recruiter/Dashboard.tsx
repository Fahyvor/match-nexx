// src/pages/recruiter/Dashboard.tsx
export default function RecruiterDashboard() {
  const stats = [
    { label: 'Active Jobs', value: 12 },
    { label: 'Total Applicants', value: 450 },
    { label: 'Interviews Scheduled', value: 8 },
  ];

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Recruiter Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map(s => (
          <div key={s.label} className="bg-white p-6 border rounded-lg shadow-sm">
            <p className="text-gray-500">{s.label}</p>
            <p className="text-3xl font-bold text-blue-600">{s.value}</p>
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4">Job Title</th>
              <th className="p-4">Applicants</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-4">Senior Frontend Engineer</td>
              <td className="p-4">42</td>
              <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">Active</span></td>
              <td className="p-4 text-blue-600 cursor-pointer">View Candidates</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}