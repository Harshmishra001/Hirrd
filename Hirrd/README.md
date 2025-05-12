# Hirrd (BOOKING LIST) - Job Portal Application

## Overview

Hirrd is a modern job portal application that connects job seekers with employers. The platform allows companies to post job listings and candidates to search and apply for jobs. Built with React, Tailwind CSS, Supabase, and Clerk, Hirrd provides a seamless experience for both job seekers and recruiters.

## Features

### For Job Seekers (Candidates)
- **Job Search**: Browse and search for jobs using filters like keywords, location, and company
- **Job Applications**: Apply to jobs with resume upload and application tracking
- **Saved Jobs**: Save interesting job listings for later review
- **Application Management**: Track all your job applications in one place
- **User Profile**: Manage your professional profile and credentials

### For Employers (Recruiters)
- **Job Posting**: Create and publish job listings with detailed descriptions, PIN codes, and contact information
- **Applicant Management**: Review and manage applications for your job postings
- **Recruiter Dashboard**: Overview of all your job postings and applications with edit and delete options
- **Hiring Status**: Update the status of job listings (open/closed)

### General Features
- **User Authentication**: Secure sign-up and sign-in with Clerk authentication
- **Role-Based Access**: Different interfaces and permissions for candidates and recruiters
- **Responsive Design**: Fully responsive interface that works on all devices
- **Dark Mode**: Built-in dark mode for comfortable viewing
- **Offline Mode**: Ability to work with mock data when API is unavailable

## Technology Stack

- **Frontend**: React.js with Vite
- **Styling**: Tailwind CSS with Shadcn UI components
- **Authentication**: Clerk for user authentication and management
- **Database**: Supabase for data storage and retrieval
- **State Management**: React hooks and context API
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: React Router for navigation
- **Storage**: Supabase storage for resume uploads

## Application Structure

The application is structured around different user roles and features:

- **Landing Page**: Introduction to the platform with quick access to job search and posting
- **Onboarding**: Role selection for new users (candidate or recruiter)
- **Job Listing**: Browse and search for available jobs with filtering options
- **Job Details**: View detailed information about a specific job including PIN code and contact information
- **Application Process**: Submit job applications with resume and details
- **My Jobs**: View and manage your job applications as a candidate
- **Saved Jobs**: Access jobs you've saved for later
- **Recruiter Dashboard**: Manage job postings and review applications as a recruiter with edit and delete options
- **Post Job**: Create new job listings as a recruiter with PIN code and contact information

## Key Features Implementation

### User Authentication and Roles

Hirrd uses Clerk for authentication and manages two primary user roles:
- **Candidates**: Users looking for jobs
- **Recruiters**: Users posting jobs and reviewing applications

The role selection happens during onboarding and is stored in the user's metadata.

### Job Application Process

When a user applies for a job:
1. They fill out an application form with experience, skills, and education
2. Upload their resume
3. The application is stored in the database
4. The job is marked as "applied" for that user

When a user signs out, all their applied jobs are cleared, allowing them to reapply after signing back in.
Applied jobs remain visible in the 'my jobs' page until the user signs out.

### Job Posting Process

When a recruiter posts a job:
1. They fill out a form with job details including title, description, requirements, location
2. They can add PIN code and phone number for contact information
3. The job is published and becomes visible to all users
4. The recruiter can edit or delete the job from their dashboard

### Recruiter Dashboard

The recruiter dashboard provides:
1. Overview of all posted jobs with edit and delete options
2. List of applicants for each job
3. Ability to toggle job status between open and closed
4. When a user applies to a job, the recruiter dashboard shows who has applied to which job

### Data Storage

The application uses both Supabase and local storage:
- **Supabase**: For persistent storage of jobs, applications, and user data
- **LocalStorage**: For temporary storage of application state and user preferences
- **Mock Data**: Fallback data when API is unavailable

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account (optional - app works with mock data)
- Clerk account (for authentication)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/hirrd.git
cd hirrd
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with the following variables:
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_CLERK_PUBLISHABLE_KEY
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open your browser and navigate to `http://localhost:5173` or the port shown in your terminal

### Using the Application

1. Sign up or log in using Clerk authentication
2. Select your role (candidate or recruiter) during onboarding
3. As a candidate:
   - Browse jobs on the Jobs page
   - Apply to jobs that interest you
   - Save jobs for later
   - View your applications in My Jobs
4. As a recruiter:
   - Post new jobs with detailed information including PIN code and contact details
   - View and manage your posted jobs in the Recruiter Dashboard
   - Edit or delete jobs as needed
   - View applications for your jobs

## Deployment

The application can be built for production using:
```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory and can be deployed to any static hosting service.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Built with guidance from [YouTube Tutorial](https://www.youtube.com/watch?v=2XF-HgauItk)
- UI components from [Shadcn UI](https://ui.shadcn.com/)
- Authentication by [Clerk](https://clerk.dev/)
- Database by [Supabase](https://supabase.io/)
- Icons from [Lucide Icons](https://lucide.dev/)

## Recent Updates

- Added PIN code and phone number fields to job postings
- Implemented edit functionality for recruiter-posted jobs
- Fixed job application persistence until user signs out
- Added highlighting for newly created and updated jobs
- Improved recruiter dashboard with better job management
- Enhanced job details page with contact information display
