/**
 * Curated Synonym Groups for Semantic Keyword Matching
 *
 * Each group contains terms that a HUMAN recruiter would consider equivalent.
 * IMPORTANT: Real ATS systems (Workday, Taleo, iCIMS) typically do LITERAL
 * string matching. Synonym matches are weighted at 0.6x in the score formula
 * to reflect this reality. The UI also shows a suggestion to add the exact
 * JD phrasing when a synonym match occurs.
 */

export const SYNONYM_GROUPS = [
  // Programming Language Variants
  ['javascript', 'js', 'ecmascript', 'es6', 'es2015'],
  ['typescript', 'ts'],
  ['c#', 'csharp', 'c sharp'],
  ['c++', 'cpp'],
  ['golang', 'go'],
  ['python3', 'python 3', 'python'],
  ['ruby', 'rb'],

  // Frontend
  ['frontend', 'front-end', 'front end', 'client-side', 'client side'],
  ['react', 'reactjs', 'react.js'],
  ['angular', 'angularjs', 'angular.js'],
  ['vue', 'vuejs', 'vue.js'],
  ['next.js', 'nextjs', 'next js'],
  ['nuxt.js', 'nuxtjs', 'nuxt'],
  ['svelte', 'sveltekit'],
  ['redux', 'redux toolkit', 'rtk'],
  ['tailwind', 'tailwindcss', 'tailwind css'],
  ['sass', 'scss'],
  ['responsive design', 'responsive web design', 'mobile-first design'],
  ['single page application', 'spa'],
  ['progressive web app', 'pwa'],
  ['server-side rendering', 'ssr'],
  ['static site generation', 'ssg'],

  // Backend
  ['backend', 'back-end', 'back end', 'server-side', 'server side'],
  ['node.js', 'nodejs', 'node js', 'node'],
  ['express', 'expressjs', 'express.js'],
  ['nest.js', 'nestjs'],
  ['spring boot', 'springboot', 'spring-boot'],
  ['asp.net', 'aspnet', 'asp net'],
  ['.net', 'dotnet', 'dot net'],
  ['django', 'django rest framework', 'drf'],
  ['flask', 'flask api'],
  ['fastapi', 'fast api'],
  ['ruby on rails', 'rails', 'ror'],
  ['laravel', 'laravel php'],

  // Full Stack
  ['fullstack', 'full-stack', 'full stack'],
  ['mern', 'mern stack'],
  ['mean', 'mean stack'],
  ['lamp', 'lamp stack'],

  // Databases
  ['postgresql', 'postgres', 'psql'],
  ['mysql', 'my sql'],
  ['mongodb', 'mongo', 'mongo db'],
  ['sql server', 'mssql', 'microsoft sql server'],
  ['dynamodb', 'dynamo db', 'amazon dynamodb'],
  ['elasticsearch', 'elastic search', 'elastic'],
  ['nosql', 'non-relational', 'non relational', 'no sql'],
  ['relational database', 'rdbms', 'sql database'],

  // Cloud & Infrastructure
  ['amazon web services', 'aws'],
  ['google cloud platform', 'gcp', 'google cloud'],
  ['microsoft azure', 'azure'],
  ['infrastructure as code', 'iac'],
  ['serverless', 'faas', 'function as a service'],
  ['ec2', 'elastic compute cloud'],
  ['s3', 'simple storage service'],
  ['lambda', 'aws lambda'],
  ['cloudformation', 'aws cloudformation', 'cfn'],

  // DevOps & CI/CD
  ['devops', 'dev ops', 'dev-ops'],
  ['ci/cd', 'ci cd', 'cicd', 'continuous integration', 'continuous deployment', 'continuous delivery'],
  ['github actions', 'gh actions'],
  ['gitlab ci', 'gitlab-ci', 'gitlab ci/cd'],
  ['kubernetes', 'k8s'],
  ['docker', 'containerization', 'containers'],
  ['infrastructure automation', 'configuration management'],
  ['monitoring', 'observability', 'application monitoring'],
  ['logging', 'log management', 'centralized logging'],

  // API & Architecture
  ['rest api', 'restful api', 'restful', 'rest apis', 'rest'],
  ['graphql', 'graph ql'],
  ['microservices', 'micro-services', 'micro services', 'microservice architecture'],
  ['monolithic', 'monolith'],
  ['event-driven', 'event driven', 'event-driven architecture', 'eda'],
  ['message queue', 'message broker', 'event bus'],
  ['api gateway', 'api management'],
  ['web services', 'web apis'],
  ['grpc', 'g rpc'],

  // Testing
  ['unit testing', 'unit tests', 'unit-testing'],
  ['integration testing', 'integration tests'],
  ['end-to-end testing', 'e2e testing', 'e2e tests', 'e2e'],
  ['test-driven development', 'tdd'],
  ['behavior-driven development', 'bdd'],
  ['automated testing', 'test automation', 'qa automation'],
  ['jest', 'jest testing'],
  ['cypress', 'cypress testing'],
  ['selenium', 'selenium webdriver'],

  // Methodologies
  ['agile', 'agile methodology', 'agile development'],
  ['scrum', 'scrum framework', 'scrum methodology'],
  ['kanban', 'kanban board'],
  ['object-oriented', 'oop', 'object oriented', 'object-oriented programming'],
  ['functional programming', 'fp'],
  ['design patterns', 'software design patterns'],
  ['solid principles', 'solid'],
  ['domain-driven design', 'ddd', 'domain driven design'],
  ['clean architecture', 'clean code'],

  // Data & ML
  ['machine learning', 'ml'],
  ['artificial intelligence', 'ai'],
  ['deep learning', 'dl', 'neural networks'],
  ['natural language processing', 'nlp'],
  ['computer vision', 'cv', 'image recognition'],
  ['data science', 'data analysis', 'data analytics'],
  ['data engineering', 'data pipeline', 'data pipelines', 'etl'],
  ['data warehouse', 'data warehousing', 'dwh'],
  ['business intelligence', 'bi'],
  ['big data', 'large-scale data'],

  // Security
  ['authentication', 'auth', 'authn'],
  ['authorization', 'authz'],
  ['oauth', 'oauth2', 'oauth 2.0'],
  ['json web token', 'jwt'],
  ['single sign-on', 'sso'],
  ['role-based access control', 'rbac'],
  ['cybersecurity', 'cyber security', 'information security', 'infosec'],
  ['penetration testing', 'pen testing', 'pentesting', 'ethical hacking'],

  // Soft Skills
  ['problem-solving', 'problem solving', 'analytical thinking', 'critical thinking'],
  ['communication', 'verbal communication', 'written communication'],
  ['teamwork', 'collaboration', 'team player', 'cross-functional collaboration'],
  ['leadership', 'team leadership', 'team lead', 'tech lead'],
  ['mentoring', 'mentorship', 'coaching'],
  ['time management', 'time-management', 'prioritization'],
  ['self-motivated', 'self-starter', 'proactive', 'initiative'],
  ['attention to detail', 'detail-oriented', 'detail oriented'],
  ['stakeholder management', 'stakeholder engagement', 'client management'],
  ['project management', 'project planning', 'project coordination'],

  // Version Control
  ['git', 'version control', 'source control'],
  ['github', 'gh'],
  ['gitlab', 'gl'],
  ['bitbucket', 'bb'],

  // Tools
  ['visual studio code', 'vscode', 'vs code'],
  ['intellij', 'intellij idea'],
  ['jira', 'atlassian jira'],
  ['confluence', 'atlassian confluence'],
  ['figma', 'figma design'],
  ['postman', 'api testing tool'],
];

/**
 * Build a lookup map: term → group index
 * So we can quickly find which group a keyword belongs to.
 */
let _synonymLookup = null;

export function getSynonymLookup() {
  if (_synonymLookup) return _synonymLookup;

  _synonymLookup = new Map();
  for (let i = 0; i < SYNONYM_GROUPS.length; i++) {
    for (const term of SYNONYM_GROUPS[i]) {
      _synonymLookup.set(term.toLowerCase(), i);
    }
  }
  return _synonymLookup;
}

/**
 * Check if two keywords are synonyms.
 * Returns the synonym group terms if they match, null otherwise.
 */
export function areSynonyms(keyword1, keyword2) {
  const lookup = getSynonymLookup();
  const group1 = lookup.get(keyword1.toLowerCase());
  const group2 = lookup.get(keyword2.toLowerCase());

  if (group1 === undefined || group2 === undefined) return null;
  if (group1 !== group2) return null;

  return SYNONYM_GROUPS[group1];
}

/**
 * Find all synonyms for a given keyword.
 * Returns the full synonym group (excluding the keyword itself), or empty array.
 */
export function getSynonyms(keyword) {
  const lookup = getSynonymLookup();
  const groupIdx = lookup.get(keyword.toLowerCase());

  if (groupIdx === undefined) return [];

  return SYNONYM_GROUPS[groupIdx].filter(
    term => term.toLowerCase() !== keyword.toLowerCase()
  );
}
