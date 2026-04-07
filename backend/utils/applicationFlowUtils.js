const PREDEFINED_FORM_LIBRARY = {
  basic_screening: {
    key: 'basic_screening',
    name: 'Basic Screening Form',
    fields: [
      { key: 'fullName', label: 'Full Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone Number', type: 'text', required: true },
      { key: 'currentLocation', label: 'Current Location', type: 'text', required: true },
      { key: 'experienceYears', label: 'Total Experience (Years)', type: 'number', required: true },
      { key: 'skills', label: 'Top Skills', type: 'textarea', required: true },
      { key: 'resumeUrl', label: 'Resume URL', type: 'text', required: true }
    ]
  },
  developer_screening: {
    key: 'developer_screening',
    name: 'Developer Screening Form',
    fields: [
      { key: 'fullName', label: 'Full Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone Number', type: 'text', required: true },
      { key: 'primaryLanguage', label: 'Primary Programming Language', type: 'text', required: true },
      { key: 'githubUrl', label: 'GitHub URL', type: 'text', required: false },
      { key: 'portfolioUrl', label: 'Portfolio URL', type: 'text', required: false },
      { key: 'resumeUrl', label: 'Resume URL', type: 'text', required: true },
      { key: 'coverLetter', label: 'Why should we hire you?', type: 'textarea', required: false }
    ]
  }
};

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'Which HTML element is used for the largest heading?',
    options: ['<h6>', '<heading>', '<h1>', '<head>'],
    answerIndex: 2
  },
  {
    id: 2,
    question: 'Which CSS property controls text size?',
    options: ['font-size', 'text-style', 'font-weight', 'text-size'],
    answerIndex: 0
  },
  {
    id: 3,
    question: 'Which JavaScript keyword declares a block-scoped variable?',
    options: ['var', 'const', 'define', 'int'],
    answerIndex: 1
  },
  {
    id: 4,
    question: 'What does SQL stand for?',
    options: ['Structured Query Language', 'Simple Query Language', 'Standard Question Language', 'System Query Logic'],
    answerIndex: 0
  },
  {
    id: 5,
    question: 'Which HTTP method is mainly used to create a new resource?',
    options: ['GET', 'PUT', 'POST', 'DELETE'],
    answerIndex: 2
  },
  {
    id: 6,
    question: 'Which React hook is used for component state?',
    options: ['useFetch', 'useState', 'useMemo', 'useStore'],
    answerIndex: 1
  },
  {
    id: 7,
    question: 'Which command initializes a new npm project?',
    options: ['npm start', 'npm init', 'npm install', 'npm create'],
    answerIndex: 1
  },
  {
    id: 8,
    question: 'What is the default port commonly used by Node.js development servers?',
    options: ['3306', '8080', '5000', '27017'],
    answerIndex: 2
  },
  {
    id: 9,
    question: 'In Git, which command stages all changed files?',
    options: ['git stage .', 'git add .', 'git push .', 'git save .'],
    answerIndex: 1
  },
  {
    id: 10,
    question: 'Which data type is used for true/false in JavaScript?',
    options: ['Boolean', 'String', 'Number', 'Object'],
    answerIndex: 0
  }
];

const getPredefinedFormOptions = () => Object.values(PREDEFINED_FORM_LIBRARY).map((item) => ({
  key: item.key,
  name: item.name
}));

const getPredefinedFormFields = (key) => PREDEFINED_FORM_LIBRARY[key]?.fields || PREDEFINED_FORM_LIBRARY.basic_screening.fields;

const getJobFormFields = (job) => {
  const applyMode = job?.apply_mode || 'direct_profile';

  if (applyMode === 'predefined_form') {
    return getPredefinedFormFields(job?.predefined_form_key || 'basic_screening');
  }

  if (applyMode === 'custom_form') {
    return Array.isArray(job?.custom_form_fields) ? job.custom_form_fields : [];
  }

  if (applyMode === 'direct_profile') {
    return [
      { key: 'fullName', label: 'Full Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone Number', type: 'text', required: true },
      { key: 'currentLocation', label: 'Current Location', type: 'text', required: false },
      { key: 'skills', label: 'Skills', type: 'textarea', required: false },
      { key: 'resumeUrl', label: 'Resume URL', type: 'text', required: true }
    ];
  }

  return [];
};

const buildPrefilledFromProfile = (user, profile) => {
  const basic = profile?.basicDetails || {};
  const workExperience = Array.isArray(profile?.workExperience) ? profile.workExperience : [];
  const skills = Array.isArray(profile?.skills) ? profile.skills : [];

  return {
    fullName: basic.fullName || profile?.displayName || user?.name || '',
    email: basic.email || user?.email || '',
    phone: basic.phone || '',
    currentLocation: basic.currentLocation || '',
    preferredLocation: basic.preferredLocation || '',
    professionalSummary: basic.professionalSummary || '',
    experienceYears: workExperience.length ? String(workExperience.length) : '',
    skills: skills.join(', '),
    resumeUrl: profile?.resumeUrl || '',
    headline: profile?.headline || ''
  };
};

const sanitizeSubmittedDetails = (fields, submittedDetails, prefilledDetails) => {
  const safeSubmitted = submittedDetails && typeof submittedDetails === 'object' ? submittedDetails : {};
  const output = {};

  fields.forEach((field) => {
    const key = field.key;
    const fromSubmitted = safeSubmitted[key];
    const fallback = prefilledDetails[key] || '';
    output[key] = typeof fromSubmitted === 'string' ? fromSubmitted.trim() : (fromSubmitted ?? fallback);
  });

  return output;
};

const evaluateQuizAnswers = (answers) => {
  const normalizedAnswers = Array.isArray(answers) ? answers : [];
  const totalQuestions = QUIZ_QUESTIONS.length;
  let correctCount = 0;

  QUIZ_QUESTIONS.forEach((question, index) => {
    const selected = Number(normalizedAnswers[index]);
    if (!Number.isNaN(selected) && selected === question.answerIndex) {
      correctCount += 1;
    }
  });

  const scorePercentage = Number(((correctCount / totalQuestions) * 100).toFixed(2));

  return {
    totalQuestions,
    correctCount,
    scorePercentage
  };
};

module.exports = {
  QUIZ_QUESTIONS,
  getPredefinedFormOptions,
  getJobFormFields,
  getPredefinedFormFields,
  buildPrefilledFromProfile,
  sanitizeSubmittedDetails,
  evaluateQuizAnswers
};
