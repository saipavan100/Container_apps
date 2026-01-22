/**
 * Predefined HR Prompts
 * Frontend displays these buttons, backend executes exact database queries
 * This ensures ZERO hallucination - ONLY real database data
 */

module.exports = [
  // Candidates Section
  {
    id: 'candidates_total',
    category: 'Candidates',
    label: 'Total Candidates',
    emoji: '👥',
    query: 'how many candidates',
    description: 'Count of all candidates in the system'
  },
  {
    id: 'candidates_accepted',
    category: 'Candidates',
    label: 'Accepted Offers',
    emoji: '✅',
    query: 'how many candidates with accepted offers',
    description: 'Candidates who accepted their offers'
  },
  {
    id: 'candidates_pending',
    category: 'Candidates',
    label: 'Pending Offers',
    emoji: '⏳',
    query: 'how many candidates with pending offers',
    description: 'Candidates waiting to respond'
  },
  {
    id: 'candidates_rejected',
    category: 'Candidates',
    label: 'Rejected Offers',
    emoji: '❌',
    query: 'how many candidates with rejected offers',
    description: 'Candidates who rejected offers'
  },
  {
    id: 'candidates_list',
    category: 'Candidates',
    label: 'List All Candidates',
    emoji: '📋',
    query: 'show all candidates',
    description: 'Show all candidates with details'
  },
  {
    id: 'candidates_stats',
    category: 'Candidates',
    label: 'Candidate Statistics',
    emoji: '📊',
    query: 'candidates statistics',
    description: 'Breakdown by offer status'
  },

  // Employees Section
  {
    id: 'employees_total',
    category: 'Employees',
    label: 'Total Employees',
    emoji: '👔',
    query: 'how many employees',
    description: 'Count of all active employees'
  },
  {
    id: 'employees_list',
    category: 'Employees',
    label: 'List All Employees',
    emoji: '📑',
    query: 'list all employees',
    description: 'Show all employees with departments'
  },
  {
    id: 'employees_stats',
    category: 'Employees',
    label: 'Employees by Department',
    emoji: '📈',
    query: 'employees statistics',
    description: 'Breakdown by department'
  },

  // Users Section
  {
    id: 'users_total',
    category: 'Users',
    label: 'Total User Accounts',
    emoji: '🔐',
    query: 'how many users',
    description: 'Count of all user accounts'
  },

  // Onboarding Section
  {
    id: 'onboarding_list',
    category: 'Onboarding',
    label: 'Onboarding Submissions',
    emoji: '📋',
    query: 'show all onboarding submissions',
    description: 'Check all onboarding progress'
  }
];
