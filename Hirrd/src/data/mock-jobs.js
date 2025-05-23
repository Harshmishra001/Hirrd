// Helper function to generate random PIN code
function generateRandomPinCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function to generate random phone number
function generateRandomPhoneNumber() {
  const prefixes = ["+91 ", "+1 ", "+44 "];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(1000000000 + Math.random() * 9000000000).toString();
  return prefix + number.substring(0, 10);
}

// Mock job data for testing
export const mockJobs = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    description: "Company: Google\n\nPIN Code: " + generateRandomPinCode() + "\n\nContact Phone: " + generateRandomPhoneNumber() + "\n\nWe are looking for a Senior Frontend Developer to join our team. You will be responsible for building user interfaces and implementing features using React.js. The ideal candidate has 5+ years of experience with modern JavaScript frameworks.",
    requirements: "- 5+ years of experience with React.js\n- Strong knowledge of JavaScript, HTML, and CSS\n- Experience with state management libraries like Redux\n- Familiarity with modern frontend build tools\n- Good understanding of responsive design principles",
    location: "New York",
    isOpen: true,
    recruiter_id: "user_123",
    company: {
      name: "Google",
      logo_url: "/companies/google.webp"
    },
    pin_code: generateRandomPinCode(),
    phone_number: generateRandomPhoneNumber(),
    saved: [],
    applications: []
  },
  {
    id: 2,
    title: "Backend Engineer",
    description: "Company: Microsoft\n\nPIN Code: " + generateRandomPinCode() + "\n\nContact Phone: " + generateRandomPhoneNumber() + "\n\nJoin our backend team to build scalable and efficient server-side applications. You'll work with Node.js, Express, and MongoDB to create robust APIs and services.",
    requirements: "- 3+ years of experience with Node.js\n- Experience with Express.js framework\n- Knowledge of MongoDB or other NoSQL databases\n- Understanding of RESTful API design principles\n- Familiarity with microservices architecture",
    location: "San Francisco",
    isOpen: true,
    recruiter_id: "user_456",
    company: {
      name: "Microsoft",
      logo_url: "/companies/microsoft.webp"
    },
    pin_code: generateRandomPinCode(),
    phone_number: generateRandomPhoneNumber(),
    saved: [],
    applications: []
  },
  {
    id: 3,
    title: "Full Stack Developer",
    description: "Company: Amazon\n\nPIN Code: " + generateRandomPinCode() + "\n\nContact Phone: " + generateRandomPhoneNumber() + "\n\nWe're seeking a Full Stack Developer to work on both frontend and backend aspects of our applications. You'll collaborate with cross-functional teams to deliver high-quality software solutions.",
    requirements: "- Experience with React.js and Node.js\n- Knowledge of SQL and NoSQL databases\n- Understanding of RESTful API design\n- Familiarity with Git version control\n- Good problem-solving skills",
    location: "Remote",
    isOpen: true,
    recruiter_id: "user_789",
    company: {
      name: "Amazon",
      logo_url: "/companies/amazon.svg"
    },
    pin_code: generateRandomPinCode(),
    phone_number: generateRandomPhoneNumber(),
    saved: [],
    applications: []
  },
  {
    id: 4,
    title: "DevOps Engineer",
    description: "Company: IBM\n\nPIN Code: " + generateRandomPinCode() + "\n\nContact Phone: " + generateRandomPhoneNumber() + "\n\nLooking for a DevOps Engineer to help automate our deployment processes and maintain our cloud infrastructure. You'll work with AWS, Docker, and Kubernetes to ensure smooth operations.",
    requirements: "- Experience with AWS or other cloud platforms\n- Knowledge of Docker and Kubernetes\n- Familiarity with CI/CD pipelines\n- Understanding of infrastructure as code\n- Experience with monitoring and logging tools",
    location: "Chicago",
    isOpen: true,
    recruiter_id: "user_101",
    company: {
      name: "IBM",
      logo_url: "/companies/ibm.svg"
    },
    pin_code: generateRandomPinCode(),
    phone_number: generateRandomPhoneNumber(),
    saved: [],
    applications: []
  },
  {
    id: 5,
    title: "UI/UX Designer",
    description: "Company: Meta\n\nPIN Code: " + generateRandomPinCode() + "\n\nContact Phone: " + generateRandomPhoneNumber() + "\n\nJoin our design team to create beautiful and intuitive user interfaces. You'll work closely with product managers and developers to bring designs to life.",
    requirements: "- Portfolio showcasing UI/UX design work\n- Proficiency in design tools like Figma or Sketch\n- Understanding of user-centered design principles\n- Experience with design systems\n- Knowledge of HTML and CSS is a plus",
    location: "Los Angeles",
    isOpen: true,
    recruiter_id: "user_202",
    company: {
      name: "Meta",
      logo_url: "/companies/meta.svg"
    },
    pin_code: generateRandomPinCode(),
    phone_number: generateRandomPhoneNumber(),
    saved: [],
    applications: []
  },
  {
    id: 6,
    title: "Data Scientist",
    description: "Company: Netflix\n\nPIN Code: " + generateRandomPinCode() + "\n\nContact Phone: " + generateRandomPhoneNumber() + "\n\nWe're looking for a Data Scientist to help us extract insights from our data. You'll work with large datasets and use statistical methods to solve business problems.",
    requirements: "- Strong background in statistics and mathematics\n- Experience with Python and data analysis libraries\n- Knowledge of machine learning algorithms\n- Familiarity with SQL and data visualization tools\n- Good communication skills to present findings",
    location: "Boston",
    isOpen: true,
    recruiter_id: "user_303",
    company: {
      name: "Netflix",
      logo_url: "/companies/netflix.png"
    },
    pin_code: generateRandomPinCode(),
    phone_number: generateRandomPhoneNumber(),
    saved: [],
    applications: []
  }
];
