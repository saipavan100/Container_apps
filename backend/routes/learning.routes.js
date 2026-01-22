const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');

// Hard-coded learning materials data - Complete from Excel files
const learningMaterials = [
  {
    fileName: 'CI-CD Fundamentals (1)',
    level: 'Advanced',
    rowCount: 22,
    data: [
      { Module: " Introduction", Topics: "Introduction to CI/CD", Duration: 1.5, Type: "Link", Link: "https://www.youtube.com/watch?v=M4CXOocovZ4" },
      { Module: "Continuous Integration (CI)", Topics: "Version Control (Git)", Duration: "", Type: "Link", Link: "https://www.youtube.com/watch?v=2HatFLh4xoA&t=320s" },
      { Module: "Continuous Integration (CI)", Topics: "Build Automation", Duration: "", Type: "Link", Link: "https://www.youtube.com/watch?v=qi_0t1PrM3o" },
      { Module: "Continuous Integration (CI)", Topics: "CI Workflow", Duration: "", Type: "Link", Link: "https://www.youtube.com/watch?v=zb8Jty7mvdc" },
      { Module: "Continuous Delivery & Deployment (CD)", Topics: "Automated Releases", Duration: "", Type: "Link", Link: "https://www.youtube.com/watch?v=C9Hmjz5haCA" },
      { Module: "Continuous Delivery & Deployment (CD)", Topics: "Manual Approvals", Duration: "", Type: "Link", Link: "https://www.youtube.com/watch?v=B2frx9R8VKU" },
      { Module: "Continuous Delivery & Deployment (CD)", Topics: "Rollbacks", Duration: "", Type: "Link", Link: "https://www.youtube.com/watch?v=HY4KJ8tL0uI" },
      { Module: "CI/CD Pipeline Components", Topics: "Pipeline Stages", Duration: 1.5, Type: "Link", Link: "https://www.youtube.com/watch?v=dHDdcEGFIQ4" },
      { Module: "CI/CD Pipeline Components", Topics: "Triggers & Events", Duration: "", Type: "Link", Link: "https://www.youtube.com/watch?v=e_jlv2h37UM" },
      { Module: "CI/CD Pipeline Components", Topics: "Environments", Duration: "", Type: "Link", Link: "https://www.youtube.com/watch?v=gN4j65w7wIM" },
      { Module: "Tools and Platforms Overview", Topics: "Jenkins", Duration: "", Type: "Link", Link: "https://www.youtube.com/watch?v=TwTvsfgO_aM" },
      { Module: "Tools and Platforms Overview", Topics: "GitHub Actions", Duration: "", Type: "Link", Link: "https://www.youtube.com/watch?v=mFFXuXjVgkU" },
      { Module: "Tools and Platforms Overview", Topics: "GitLab CI", Duration: "", Type: "Link", Link: "https://www.youtube.com/watch?v=z7nLsJvEyMY" },
      { Module: "Testing in CI/CD", Topics: "Unit Testing", Duration: 1, Type: "Link", Link: "https://www.youtube.com/watch?v=clNsdafDesA" },
      { Module: "Testing in CI/CD", Topics: "Automation Test", Duration: "", Type: "Link", Link: "https://www.youtube.com/watch?v=FFxww1-M25E" },
      { Module: "Deployment Strategies Basics", Topics: "Blue-Green Deployment", Duration: "", Type: "Link", Link: "https://www.youtube.com/watch?v=23EghFNQdj4" },
      { Module: "Deployment Strategies Basics", Topics: "Canary Releases", Duration: "", Type: "Link", Link: "https://www.youtube.com/watch?v=dRAJVUaV958" },
      { Module: "Monitoring & Feedback Basics", Topics: "Logging Basics", Duration: 1.5, Type: "Link", Link: "https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/usage-monitoring?view=azure-devops" },
      { Module: "Monitoring & Feedback Basics", Topics: "Feedback Loops", Duration: "", Type: "Link", Link: "https://www.youtube.com/watch?v=MOyZrtFRlbg&t=1s" },
      { Module: "Security Basics in CI/CD", Topics: "DevSecOps Introduction", Duration: "", Type: "Link", Link: "https://www.youtube.com/watch?v=G6Fv4B0UQTY" },
      { Module: "Security Basics in CI/CD", Topics: "Secrets Management", Duration: "", Type: "Link", Link: "https://www.youtube.com/watch?v=vyknUCoTT64" },
      { Module: "Security Basics in CI/CD", Topics: "Total hrs", Duration: 5.5, Type: "", Link: "" }
    ]
  },
  {
    fileName: 'SDLC - Software Development Life Cycle',
    level: 'Intermediate',
    rowCount: 11,
    data: [
      { Module: "SDLC", Topics: "Introduction", Duration: 12.3, Link: "https://www.youtube.com/watch?v=SaCYkPD4_K0\r\nhttps://www.geeksforgeeks.org/software-development-process/" },
      { Module: "SDLC", Topics: "Waterfall Model", Duration: 2.33, Link: "https://www.youtube.com/watch?v=bNLcRdrSQAU\r\nhttps://www.geeksforgeeks.org/waterfall-model/" },
      { Module: "SDLC", Topics: "Iterative", Duration: 5.25, Link: "https://www.youtube.com/watch?v=wlEu3i9giUg\r\nhttps://www.geeksforgeeks.org/sdlc-models-types-phases-use/#2-iterative-sdlc-models" },
      { Module: "SDLC", Topics: "Incremental", Duration: 4.28, Link: "https://www.youtube.com/watch?v=W2CD_sUHtOo\r\nhttps://www.geeksforgeeks.org/sdlc-models-types-phases-use/#8-incremental-sdlc-models" },
      { Module: "SDLC", Topics: "Spiral", Duration: 2.21, Link: "https://www.youtube.com/watch?v=8GkYPCQzE8E\r\nhttps://www.geeksforgeeks.org/sdlc-models-types-phases-use/#4-spiral-sdlc-models" },
      { Module: "SDLC", Topics: "Prototype", Duration: 7.04, Link: "https://www.youtube.com/watch?v=dpiClb7S9Jc\r\nhttps://www.geeksforgeeks.org/software-engineering-prototyping-model/" },
      { Module: "SDLC", Topics: "V-model (Verification and Validation)", Duration: 6.58, Link: "https://www.youtube.com/watch?v=P06yeFsTHxA\r\nhttps://www.geeksforgeeks.org/sdlc-models-types-phases-use/#3-vmodels-verification-and-validation-models-in-sdlc" },
      { Module: "SDLC", Topics: "RAD (Rapid Application Development)", Duration: 9.14, Link: "https://www.youtube.com/watch?v=U5uv81UmU-k\r\nhttps://www.geeksforgeeks.org/sdlc-models-types-phases-use/#7-rapid-application-development-rad-sdlc-models" },
      { Module: "SDLC", Topics: "Capability Maturity", Duration: 6.03, Link: "https://www.youtube.com/watch?v=uPBtBUwDiGU" },
      { Module: "SDLC", Topics: "Rational Unified", Duration: 2.29, Link: "https://www.youtube.com/watch?v=caLs9vlqSs4" },
      { Module: "SDLC", Topics: "Agile Methodology", Duration: 6.22, Link: "https://www.youtube.com/watch?v=8eVXTyIZ1Hs\r\nhttps://www.geeksforgeeks.org/sdlc-models-types-phases-use/#5-agile-sdlc-models" }
    ]
  },
  {
    fileName: 'Git Fundamentals_Repository_PullRequest',
    level: 'Beginner',
    rowCount: 30,
    data: [
      { Module: "Git Fundamentals", Topics: "Intro", Duration: 120, Link: "https://www.youtube.com/watch?v=vwj89i2FmG0" },
      { Module: "Git Fundamentals", Topics: "git version control", Duration: "", Link: "" },
      { Module: "Git Fundamentals", Topics: "history of git", Duration: "", Link: "" },
      { Module: "Git Fundamentals", Topics: "git Setup", Duration: "", Link: "" },
      { Module: "Git Fundamentals", Topics: "git Init", Duration: "", Link: "" },
      { Module: "Git Fundamentals", Topics: "git commit", Duration: "", Link: "" },
      { Module: "Git Fundamentals", Topics: "skipping the staging area", Duration: "", Link: "" },
      { Module: "Git Fundamentals", Topics: "git diff command", Duration: "", Link: "" },
      { Module: "Git Fundamentals", Topics: "git remove file", Duration: "", Link: "" },
      { Module: "Git Fundamentals", Topics: "github repository", Duration: "", Link: "" },
      { Module: "Git Fundamentals", Topics: "adding files to remote repository", Duration: "", Link: "" },
      { Module: "Git Fundamentals", Topics: "working with tags", Duration: "", Link: "" },
      { Module: "Git Fundamentals", Topics: "clone a project", Duration: "", Link: "" },
      { Module: "Git Fundamentals", Topics: "git branch create", Duration: "", Link: "" },
      { Module: "Git Fundamentals", Topics: "git delete branch", Duration: "", Link: "" },
      { Module: "Git Fundamentals", Topics: "branch pushing to remote repository", Duration: "", Link: "" },
      { Module: "Git Fundamentals", Topics: "branch-how it works", Duration: "", Link: "" },
      { Module: "Git Fundamentals", Topics: "git merge", Duration: "", Link: "" },
      { Module: "Azure Repository and Pull Requests", Topics: "Introduction to Source Control and Azure Repos", Duration: 33.26, Link: "https://www.youtube.com/watch?v=vN6iY5y4h9Y" },
      { Module: "Azure Repository and Pull Requests", Topics: "Git vs. TFVC", Duration: "", Link: "" },
      { Module: "Azure Repository and Pull Requests", Topics: "Integrate Visual code with Azure Repos", Duration: "", Link: "" },
      { Module: "Azure Repository and Pull Requests", Topics: "Cloning the repo", Duration: "", Link: "" },
      { Module: "Azure Repository and Pull Requests", Topics: "Commit changes through VSCode", Duration: "", Link: "" },
      { Module: "Azure Repository and Pull Requests", Topics: "Reviewing history from Azure Repos", Duration: "", Link: "" },
      { Module: "Azure Repository and Pull Requests", Topics: "Working with branches in Azure Repos", Duration: "", Link: "" },
      { Module: "Azure Repository and Pull Requests", Topics: "Tagging a release in Azure Repos", Duration: "", Link: "" },
      { Module: "Azure Repository and Pull Requests", Topics: "Managing repositories", Duration: "", Link: "" },
      { Module: "Azure Repository and Pull Requests", Topics: "Managing Pull requests", Duration: "", Link: "" },
      { Module: "Azure Repository and Pull Requests", Topics: "Sample application code to load the dummy data", Duration: "", Link: "" },
      { Module: "Azure Repository and Pull Requests", Topics: "Total", Duration: 153.26, Link: "" }
    ]
  }
];

// @route   GET /api/learning/materials
// @desc    Get all learning materials with complete table data
// @access  Private/Employee
router.get('/materials', protect, async (req, res) => {
  try {
    console.log('📚 Learning materials request received');
    console.log(`✅ Returning ${learningMaterials.length} learning materials`);
    
    res.json({
      success: true,
      count: learningMaterials.length,
      materials: learningMaterials
    });
  } catch (error) {
    console.error('❌ Error fetching learning materials:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching learning materials',
      error: error.message
    });
  }
});

module.exports = router;
