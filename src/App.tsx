import React, { useState, useEffect } from 'react';
import { Search, Briefcase, BookmarkPlus, ExternalLink } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Builder, By, until } from 'selenium-webdriver';
import puppeteer from 'puppeteer-core';
import dotenv from 'dotenv';
dotenv.config();

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  postedDate: string;
};

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'saved'>('search');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);

  // خواندن فایل اکسل و استخراج شرکت‌ها
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        const companyList = json.map((row: any) => row.Company);
        setCompanies(companyList);
      };
      reader.readAsBinaryString(file);
    }
  };

  // وب‌اسکرپینگ لینکدین با puppeteer
  const fetchJobsFromLinkedIn = async (company: string) => {
    const browser = await puppeteer.launch({ 
      executablePath: '',
      headless: true,
     });
    const page = await browser.newPage();

    try {
      // ورود به لینکدین
      await page.goto('https://www.linkedin.com/login');
      await page.type('#username', process.env.LINKEDIN_USERNAME!);
      await page.type('#password', process.env.LINKEDIN_PASSWORD!);
      await page.click('button[type="submit"]');
      await page.waitForNavigation();

      // جستجوی شرکت
      await page.goto(`https://www.linkedin.com/jobs/search/?keywords=${company}`);
      await page.waitForSelector('.jobs-search__results-list');

      // استخراج داده‌ها
      const jobs = await page.evaluate(() => {
        const jobElements = document.querySelectorAll('.jobs-search__results-list li');
        const jobs: Job[] = [];
        jobElements.forEach((element) => {
          const title = element.querySelector('.job-result-card__title')?.textContent?.trim();
          const company = element.querySelector('.job-result-card__company')?.textContent?.trim();
          const location = element.querySelector('.job-result-card__location')?.textContent?.trim();
          const salary = element.querySelector('.job-result-card__salary-info')?.textContent?.trim() || 'Not specified';
          const description = element.querySelector('.job-result-card__snippet')?.textContent?.trim() || 'No description available';
          const postedDate = element.querySelector('.job-result-card__listdate')?.textContent?.trim() || 'Unknown';

          if (title && company && location) {
            jobs.push({
              id: Math.random().toString(36).substring(7), // یک ID تصادفی
              title,
              company,
              location,
              salary,
              description,
              postedDate,
            });
          }
        });
        return jobs;
      });

      return jobs;
    } finally {
      await browser.close();
    }
  };

  useEffect(() => {
    const loadJobs = async () => {
      const allJobs: Job[] = [];
      for (const company of companies) {
        const jobs = await fetchJobsFromLinkedIn(company);
        allJobs.push(...jobs);
      }
      setJobs(allJobs);
    };
    if (companies.length > 0) {
      loadJobs();
    }
  }, [companies]);

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayJobs = activeTab === 'search' 
    ? filteredJobs 
    : jobs.filter(job => savedJobs.includes(job.id));

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
        {/* Upload Excel File */}
        <div className="mb-8">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
          />
        </div>

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