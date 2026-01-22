/**
 * WinWire Company Information File
 * Contains all company data: team, services, benefits, culture, etc.
 * This is the ONLY source of truth for employee chatbot - NO WEB SEARCH
 */
 
const winwireInfo = {
 
  company: {
    name: "WinWire Technologies",
    tagline: "Engineering Digital Transformation",
    mission:
      "To help enterprises accelerate digital transformation through cloud, data, AI, and modern engineering practices.",
    vision:
      "To be a trusted global partner delivering measurable business outcomes through technology innovation.",
    founded: "2015",
    headquarters: "Santa Clara, California, USA",
    globalPresence: ["United States", "India"],
    website: "https://www.winwire.com",
    contact: {
      general: "info@winwire.com",
      careers: "careers@winwire.com"
    },
    industry: [
      "Digital Engineering",
      "Cloud & Data Services",
      "AI & Analytics",
      "Enterprise Technology Consulting"
    ],
    companyType: "Private",
  }
  ,
 
  services: [
    {
      id: "cloud-data-ai",
      name: "Cloud, Data & AI Solutions",
      description:
        "End-to-end cloud transformation services including Azure migration, cloud-native development, data platforms, and AI-driven analytics.",
      technologies: [
        "Microsoft Azure",
        "Azure Data Factory",
        "Azure Synapse",
        "Databricks",
        "Power BI",
        "Azure AI Services"
      ],
      offerings: [
        "Cloud migration & modernization",
        "Data engineering & analytics",
        "AI/ML solutions",
        "Enterprise reporting & insights"
      ],
      primaryClients: "Mid-to-large enterprises across retail, healthcare, finance, and technology"
    },
    {
      id: "application-modernization",
      name: "Application Modernization",
      description:
        "Modernization of legacy applications into scalable, secure, cloud-native solutions.",
      technologies: [
        ".NET",
        "Java",
        "React",
        "Node.js",
        "Microservices",
        "REST APIs"
      ],
      offerings: [
        "Legacy system modernization",
        "Cloud-native application development",
        "API & microservices architecture",
        "Performance and security optimization"
      ],
      primaryClients: "Enterprises modernizing legacy platforms"
    },
    {
      id: "digital-engineering",
      name: "Digital Engineering & Product Development",
      description:
        "Design and development of digital products with strong focus on user experience and scalability.",
      technologies: [
        "React",
        "Angular",
        "Next.js",
        "Mobile (iOS / Android)",
        "UI/UX Design Tools"
      ],
      offerings: [
        "Product engineering",
        "UI/UX design",
        "MVP development",
        "Design systems"
      ],
      primaryClients: "Product companies and digital-first enterprises"
    },
    {
      id: "devops-platform",
      name: "DevOps & Platform Engineering",
      description:
        "Automation-driven DevOps and platform engineering services to improve deployment speed, reliability, and scalability.",
      technologies: [
        "Azure DevOps",
        "GitHub",
        "Docker",
        "Kubernetes",
        "Terraform",
        "CI/CD Pipelines"
      ],
      offerings: [
        "CI/CD automation",
        "Infrastructure as Code (IaC)",
        "Cloud security & governance",
        "Monitoring & reliability engineering"
      ],
      primaryClients: "Organizations adopting DevOps and cloud-native practices"
    },
    {
      id: "consulting-advisory",
      name: "Technology Consulting & Advisory",
      description:
        "Strategic consulting to help organizations plan and execute digital transformation initiatives.",
      technologies: [
        "Enterprise Architecture",
        "Data Strategy",
        "Cloud Strategy",
        "Process Automation"
      ],
      offerings: [
        "Digital transformation roadmap",
        "Cloud & data strategy",
        "Architecture assessment",
        "Technology advisory"
      ],
      primaryClients: "CXOs and IT leadership teams"
    }
  ]
  ,
 
  departments: [
    {
      name: "Engineering & Digital Delivery",
      description: "Designs, develops, and delivers cloud, data, and AI solutions with quality and scalability.",
      teams: [
        "Cloud & Azure Services",
        "Data & AI Engineering",
        "Application Modernization",
        "Quality Assurance & Testing",
        "DevOps & Platform Engineering"
      ],
      headcount: "300+ professionals",
    },
    {
      name: "Sales, Marketing & Client Success",
      description: "Drives business growth, builds relationships with enterprise clients, and ensures project success.",
      teams: [
        "Enterprise Sales",
        "Marketing & Brand",
        "Business Development",
        "Client Engagement & Solutions Consulting"
      ],
      headcount: "60+ professionals",
    },
    {
      name: "Human Resources & Talent",
      description: "Manages recruitment, onboarding, employee experience, and learning & development.",
      teams: [
        "Recruitment & Staffing",
        "Onboarding & HR Operations",
        "Learning & Development",
        "Employee Engagement"
      ],
      headcount: "40+ professionals",
    },
    {
      name: "Finance & Administration",
      description: "Handles financial planning, budgeting, compliance, and administrative operations.",
      teams: [
        "Accounting & Reporting",
        "Financial Planning & Analysis",
        "Procurement & Vendor Management",
        "Office Administration"
      ],
      headcount: "30+ professionals",
    },
    {
      name: "Product & Design Enablement",
      description: "Supports innovative product engineering services and enhances user experiences.",
      teams: [
        "Product Engineering & Strategy",
        "UX/UI Design",
        "Product Innovation & Prototyping",
        "Design Systems & Research"
      ],
      headcount: "50+ professionals",
    },
  ],
 
  adminTeam: [
    {
      name: "Ashu Goel",
      title: "Chief Executive Officer (CEO)",
      email: "", // Public emails not officially published
      phone: "", // Public phone not officially published
      background: "Co-founder of WinWire, former Microsoft and A.T. Kearney leader",
      office: "Santa Clara, California, USA",
    },
    {
      name: "Vineet Arora",
      title: "Chief Technology Officer (CTO)",
      email: "", // Public emails not officially published
      phone: "",
      background: "Long-term WinWire leader with deep experience in tech strategy and development",
      office: "San Francisco Bay Area, USA",
    },
    {
      name: "Tanmoy Chowdhury",
      title: "Chief Financial Officer (CFO)",
      email: "", // Public email not officially published
      phone: "",
      background: "Leads financial planning and operations at WinWire",
      office: "USA",
    },
    {
      name: "Kalyan Gottumukkala",
      title: "Chief Revenue Officer (CRO)",
      email: "", // Public email not officially published
      phone: "",
      background: "Drives revenue strategy and business growth",
      office: "USA",
    },
    {
      name: "Subhash Poojari",
      title: "Vice President – Global Delivery",
      email: "", // Public email not officially published
      phone: "",
      background: "Oversees delivery excellence and global delivery operations",
      office: "India",
    },
    {
      name: "Subba Rao",
      title: "Vice President – Finance & Administration",
      email: "", // Public email not officially published
      phone: "",
      background: "Leads finance and administrative functions",
      office: "USA / India",
    },
  ],
 
benefits: [
  {
    category: "Health & Wellness",
    items: [
      "Group medical insurance coverage for employees",
      "Optional dependent medical insurance",
      "Annual health check-ups",
      "Employee wellness and health awareness programs",
      "Access to mental well-being support resources"
    ],
  },
  {
    category: "Financial Benefits",
    items: [
      "Competitive and market-aligned salary structure",
      "Performance-based incentives and rewards",
      "Statutory benefits as per applicable laws (PF, gratuity, etc.)",
      "Life insurance coverage",
      "Accidental insurance coverage"
    ],
  },
  {
    category: "Work-Life Balance",
    items: [
      "Standard working hours with flexibility based on project needs",
      "Hybrid or remote work options (role and project dependent)",
      "Paid time off (earned leave, sick leave, and company holidays)",
      "Maternity and paternity leave as per company policy",
      "Leave Management System (LMS) for easy leave tracking"
    ],
  },
  {
    category: "Learning & Development",
    items: [
      "Structured onboarding and induction programs",
      "Access to internal technical and soft-skills training",
      "Certification support for relevant technologies (role-based)",
      "Continuous learning through internal knowledge sessions",
      "Career development and performance review programs"
    ],
  },
  {
    category: "Employee Engagement & Culture",
    items: [
      "Employee recognition and appreciation programs",
      "Team-building and engagement activities",
      "Inclusive and collaborative workplace culture",
      "Diversity, equity, and equal opportunity practices",
      "Open communication and feedback culture"
    ],
  },
]
,
 
  culture: {
  values: [
    "Customer Focus – We prioritize delivering measurable value to our clients",
    "Integrity – We act with honesty, transparency, and ethical responsibility",
    "Collaboration – We work as one team across functions and geographies",
    "Excellence – We strive for high quality and continuous improvement",
    "Respect & Inclusion – We value diverse perspectives and treat everyone with respect"
  ],
  workEnvironment:
    "WinWire fosters a collaborative and performance-driven work environment where employees are encouraged to take ownership, continuously learn, and contribute to impactful solutions. The company emphasizes trust, accountability, and open communication.",
  diversityAndInclusion:
    "WinWire is committed to providing an inclusive workplace with equal opportunities for all employees. Diversity and inclusion are integral to hiring, career growth, and leadership development practices.",
  socialResponsibility:
    "WinWire supports community engagement and responsible business practices through employee-driven initiatives, sustainability awareness, and participation in social impact programs as per company policies.",
},
 
culture: {
  coreValues: [
    {
      title: "People First",
      description:
        "We prioritize our people by fostering a supportive, inclusive, and respectful workplace that enables growth, well-being, and long-term success."
    },
    {
      title: "Technology Leadership",
      description:
        "We lead with technology by continuously innovating, adopting modern platforms, and delivering scalable, future-ready solutions for our clients."
    },
    {
      title: "Execution Excellence",
      description:
        "We focus on disciplined execution, quality delivery, and accountability to consistently meet and exceed customer expectations."
    }
  ],
  workEnvironment:
    "WinWire promotes a collaborative and performance-driven environment where employees are empowered to take ownership, learn continuously, and deliver impactful digital solutions.",
  diversityAndInclusion:
    "WinWire is committed to equal opportunity employment and creating an inclusive workplace across all roles and levels.",
  socialResponsibility:
    "WinWire supports responsible business practices and encourages participation in community and sustainability initiatives in line with company policies."
},
onboarding: {
  duration: "60–90 days structured onboarding program",
  phase1_firstWeek: [
    "HR induction and company overview",
    "IT access setup (email, VPN, internal tools)",
    "Introduction to manager, team, and project context",
    "Overview of company policies, code of conduct, and core values",
    "Basic security and compliance orientation"
  ],
  phase2_firstMonth: [
    "Role-specific technical training",
    "Project onboarding and knowledge transfer",
    "Shadowing team members and understanding workflows",
    "Introduction to delivery processes and quality standards",
    "Completion of mandatory compliance and security training"
  ],
  phase3_month2to3: [
    "Active contribution to assigned project(s)",
    "Independent task ownership with peer and manager support",
    "Regular check-ins and feedback from manager",
    "Performance expectations alignment",
    "Individual development plan (IDP) discussion"
  ],
  completion:
    "Onboarding is considered complete after successful role integration, compliance completion, and manager confirmation."
}
,
faqs: [
  {
    question: "What is the hiring and application process?",
    answer:
      "Candidates can apply through the WinWire careers page or via official recruitment channels. The selection process typically includes resume screening, one or more technical interviews, and a managerial or HR discussion. The process duration may vary depending on the role and business requirements."
  },
  {
    question: "How are salaries and compensation determined?",
    answer:
      "Compensation is competitive and aligned with industry standards. Salary is determined based on role, experience, skill set, location, and interview performance, in accordance with company compensation policies."
  },
  {
    question: "What is the work culture at WinWire?",
    answer:
      "WinWire promotes a collaborative, professional, and performance-driven culture. Employees are encouraged to take ownership of their work, continuously learn, and collaborate across teams while maintaining high standards of integrity and quality."
  },
  {
    question: "Do you offer remote or hybrid work options?",
    answer:
      "WinWire supports flexible work arrangements such as hybrid or remote work, depending on project requirements, role responsibilities, and business needs."
  },
  {
    question: "What career growth opportunities are available?",
    answer:
      "WinWire offers structured career progression through performance reviews, skill development programs, internal training, and role-based growth opportunities. Employees are encouraged to upskill and explore internal mobility where applicable."
  },
  {
    question: "What leave and time-off policies are available?",
    answer:
      "Employees are eligible for paid time off, company-declared holidays, and statutory leaves as per company policy and applicable labor laws. Leave details are managed through the Leave Management System (LMS)."
  },
  {
    question: "What does the interview process typically involve?",
    answer:
      "The interview process generally includes technical assessments, problem-solving discussions, and an HR or managerial round. The exact structure may vary depending on the role and level."
  },
  {
    question: "What onboarding support is provided to new employees?",
    answer:
      "New hires go through a structured onboarding program that includes HR induction, IT access setup, role-specific training, and project onboarding to ensure a smooth transition into the organization."
  },
  {
    question: "How can employees raise HR or workplace-related queries?",
    answer:
      "Employees can reach out to the HR team through official communication channels or use internal systems such as the HR portal or employee helpdesk for assistance."
  }
]
,
offices: [
  {
    location: "Hyderabad, India",
    address: "Hyderabad, Telangana, India",
    role: "Primary delivery and engineering center",
    teams: [
      "Engineering & Digital Delivery",
      "Data & AI",
      "Quality Assurance",
      "HR & Operations"
    ],
    facilities: [
      "Workstations and collaboration spaces",
      "Meeting and training rooms",
      "IT and security infrastructure"
    ]
  },
  {
    location: "Bengaluru, India",
    address: "Bengaluru, Karnataka, India",
    role: "Technology delivery and talent hub",
    teams: [
      "Application Development",
      "Cloud & DevOps",
      "Product Engineering"
    ],
    facilities: [
      "Project work areas",
      "Meeting rooms",
      "Training and onboarding spaces"
    ]
  },
  {
    location: "Santa Clara, California, USA",
    address: "Santa Clara, California, USA",
    role: "Corporate headquarters and client engagement",
    teams: [
      "Leadership & Management",
      "Sales & Client Success",
      "Technology Consulting"
    ],
    facilities: [
      "Corporate offices",
      "Client meeting rooms",
      "Collaboration spaces"
    ]
  }
]
,contactInfo: {
  recruitment: {
    email: "careers@winwire.com",
    message:
      "For job opportunities, applications, and recruitment-related queries. Please apply through official hiring channels or share your resume when requested."
  },
  hr: {
    email: "hr@winwire.com",
    message:
      "For employee-related queries such as onboarding, HR policies, benefits, leave, and internal processes."
  },
  general: {
    email: "info@winwire.com",
    message:
      "For general business inquiries, partnerships, and company-related information."
  }
}
};
 
module.exports = winwireInfo;
 