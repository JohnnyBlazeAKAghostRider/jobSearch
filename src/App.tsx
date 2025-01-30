import React, { useState } from 'react';
import { Search, Briefcase, BookmarkPlus, ExternalLink } from 'lucide-react';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  postedDate: string;
};

// Mock data - replace with real API calls in production
const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp',
    location: 'Remote',
    salary: '$120k - $150k',
    description: 'Looking for an experienced frontend developer with React expertise...',
    postedDate: '2024-03-10'
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    company: 'StartupX',
    location: 'New York, NY',
    salary: '$130k - $160k',
    description: 'Join our fast-growing team to build innovative solutions...',
    postedDate: '2024-03-12'
  },
  {
    id: '3',
    title: 'DevOps Engineer',
    company: 'CloudTech',
    location: 'San Francisco, CA',
    salary: '$140k - $170k',
    description: 'Help us scale our cloud infrastructure and implement CI/CD...',
    postedDate: '2024-03-13'
  }
];

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'saved'>('search');

  const filteredJobs = mockJobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayJobs = activeTab === 'search' 
    ? filteredJobs 
    : mockJobs.filter(job => savedJobs.includes(job.id));

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">JobFinder</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('search')}
                className={`px-4 py-2 rounded-md ${
                  activeTab === 'search'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Search Jobs
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-4 py-2 rounded-md ${
                  activeTab === 'saved'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Saved Jobs ({savedJobs.length})
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search jobs by title, company, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-6">
          {displayJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition duration-150 ease-in-out hover:shadow-md"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                  <div className="mt-1 text-gray-600">{job.company}</div>
                  <div className="mt-1 text-gray-500">{job.location}</div>
                  <div className="mt-2 text-indigo-600 font-medium">{job.salary}</div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleSaveJob(job.id)}
                    className={`p-2 rounded-full hover:bg-gray-100 ${
                      savedJobs.includes(job.id) ? 'text-indigo-600' : 'text-gray-400'
                    }`}
                  >
                    <BookmarkPlus className="h-6 w-6" />
                  </button>
                  <a
                    href="#"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Apply Now <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </div>
              </div>
              <p className="mt-4 text-gray-600">{job.description}</p>
              <div className="mt-4 text-sm text-gray-500">
                Posted on {new Date(job.postedDate).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;