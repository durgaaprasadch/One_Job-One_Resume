// Curated skill dictionaries for intelligent categorization

export const TECHNICAL_SKILLS = new Set([
  // Programming Languages
  'javascript', 'typescript', 'python', 'java', 'c', 'c++', 'c#', 'csharp',
  'ruby', 'go', 'golang', 'rust', 'swift', 'kotlin', 'scala', 'php',
  'perl', 'r', 'matlab', 'dart', 'lua', 'haskell', 'elixir', 'clojure',
  'objective-c', 'assembly', 'fortran', 'cobol', 'groovy', 'julia',
  'solidity', 'verilog', 'vhdl',

  // Frontend
  'react', 'reactjs', 'react.js', 'angular', 'angularjs', 'vue', 'vuejs',
  'vue.js', 'svelte', 'nextjs', 'next.js', 'nuxt', 'nuxtjs', 'gatsby',
  'remix', 'astro', 'ember', 'backbone', 'jquery', 'bootstrap', 'tailwind',
  'tailwindcss', 'material-ui', 'mui', 'chakra', 'ant-design', 'antd',
  'styled-components', 'sass', 'scss', 'less', 'webpack', 'vite', 'parcel',
  'rollup', 'babel', 'eslint', 'prettier', 'storybook', 'redux', 'zustand',
  'mobx', 'recoil', 'tanstack', 'react-query', 'swr', 'framer-motion',
  'three.js', 'threejs', 'd3', 'd3.js', 'chart.js', 'highcharts',
  'cypress', 'playwright', 'puppeteer', 'jest', 'vitest', 'mocha',
  'jasmine', 'karma', 'enzyme', 'testing-library', 'rtl',

  // Backend
  'node', 'nodejs', 'node.js', 'express', 'expressjs', 'fastify', 'koa',
  'nestjs', 'nest.js', 'django', 'flask', 'fastapi', 'tornado',
  'spring', 'springboot', 'spring-boot', 'hibernate', 'quarkus', 'micronaut',
  'rails', 'ruby-on-rails', 'laravel', 'symfony', 'codeigniter',
  'asp.net', 'aspnet', '.net', 'dotnet', 'blazor', 'wpf', 'winforms',
  'gin', 'echo', 'fiber', 'actix', 'rocket', 'axum',
  'graphql', 'grpc', 'protobuf', 'websocket', 'websockets',
  'microservices', 'monolith', 'serverless', 'lambda', 'event-driven',

  // Databases
  'mysql', 'postgresql', 'postgres', 'sqlite', 'oracle', 'mssql',
  'sql-server', 'mariadb', 'mongodb', 'mongoose', 'dynamodb', 'cassandra',
  'couchdb', 'couchbase', 'neo4j', 'redis', 'memcached', 'elasticsearch',
  'opensearch', 'solr', 'influxdb', 'timescaledb', 'cockroachdb',
  'firestore', 'supabase', 'prisma', 'sequelize', 'typeorm', 'knex',
  'drizzle', 'hibernate', 'mybatis', 'jpa',

  // Cloud & DevOps
  'aws', 'azure', 'gcp', 'google-cloud', 'heroku', 'vercel', 'netlify',
  'digitalocean', 'linode', 'cloudflare', 'ec2', 's3', 'lambda', 'ecs',
  'eks', 'fargate', 'rds', 'sqs', 'sns', 'cloudwatch', 'cloudformation',
  'terraform', 'pulumi', 'ansible', 'puppet', 'chef', 'saltstack',
  'docker', 'kubernetes', 'k8s', 'helm', 'istio', 'envoy', 'nginx',
  'apache', 'caddy', 'traefik', 'haproxy', 'consul', 'vault',
  'jenkins', 'github-actions', 'gitlab-ci', 'circleci', 'travis',
  'argo', 'argocd', 'tekton', 'spinnaker', 'bamboo',
  'prometheus', 'grafana', 'datadog', 'splunk', 'elk', 'logstash',
  'kibana', 'new-relic', 'newrelic', 'jaeger', 'zipkin', 'opentelemetry',

  // Mobile
  'android', 'ios', 'react-native', 'flutter', 'xamarin', 'ionic',
  'cordova', 'capacitor', 'swiftui', 'jetpack-compose', 'compose',

  // Data & ML/AI
  'pandas', 'numpy', 'scipy', 'scikit-learn', 'sklearn', 'tensorflow',
  'pytorch', 'keras', 'xgboost', 'lightgbm', 'catboost', 'opencv',
  'nlp', 'natural-language-processing', 'computer-vision', 'deep-learning',
  'machine-learning', 'reinforcement-learning', 'neural-network',
  'cnn', 'rnn', 'lstm', 'transformer', 'bert', 'gpt', 'llm',
  'langchain', 'llamaindex', 'huggingface', 'openai',
  'spark', 'hadoop', 'hive', 'kafka', 'flink', 'airflow', 'dagster',
  'dbt', 'snowflake', 'bigquery', 'redshift', 'databricks', 'delta-lake',
  'tableau', 'power-bi', 'powerbi', 'looker', 'metabase', 'superset',
  'etl', 'elt', 'data-pipeline', 'data-warehouse', 'data-lake',
  'data-engineering', 'data-science', 'data-analytics',

  // Security
  'oauth', 'oauth2', 'jwt', 'saml', 'ldap', 'sso', 'rbac', 'iam',
  'encryption', 'tls', 'ssl', 'https', 'cors', 'csrf', 'xss',
  'owasp', 'penetration-testing', 'pen-testing', 'siem', 'soar',
  'firewall', 'vpn', 'zero-trust', 'soc', 'compliance',

  // Version Control & Collaboration
  'git', 'github', 'gitlab', 'bitbucket', 'svn', 'mercurial',
  'jira', 'confluence', 'trello', 'asana', 'notion', 'slack',
  'figma', 'sketch', 'adobe-xd', 'invision', 'zeplin',

  // Testing
  'unit-testing', 'integration-testing', 'e2e-testing', 'tdd', 'bdd',
  'selenium', 'appium', 'loadrunner', 'jmeter', 'gatling', 'k6',
  'postman', 'insomnia', 'swagger', 'openapi',

  // Architecture & Patterns
  'solid', 'dry', 'kiss', 'yagni', 'design-patterns', 'singleton',
  'factory', 'observer', 'strategy', 'decorator', 'adapter', 'proxy',
  'clean-architecture', 'hexagonal', 'ddd', 'domain-driven-design',
  'cqrs', 'event-sourcing', 'saga',
  'system-design', 'high-availability', 'fault-tolerance',
  'load-balancing', 'caching', 'cdn', 'rate-limiting',
  'horizontal-scaling', 'vertical-scaling', 'sharding', 'replication',
  'api', 'rest', 'restful', 'soap', 'graphql', 'grpc', 'webhook',

  // Methodologies & General Tech
  'agile', 'scrum', 'kanban', 'lean', 'waterfall', 'sprint',
  'ci/cd', 'continuous-integration', 'continuous-deployment',
  'html', 'html5', 'css', 'css3', 'frontend', 'backend', 'fullstack', 'full-stack',
  'ui', 'ux', 'user-interface', 'user-experience', 'wireframing', 'prototyping',
  'unit-testing', 'e2e', 'qa', 'quality-assurance', 'automation',

  // Other
  'linux', 'unix', 'windows', 'macos', 'bash', 'powershell', 'shell',
  'regex', 'vim', 'emacs', 'vscode',
  'blockchain', 'web3', 'ethereum', 'smart-contracts',
  'iot', 'embedded', 'rtos', 'fpga',
  'ar', 'vr', 'xr', 'unity', 'unreal',
]);

export const SOFT_SKILLS = new Set([
  'leadership', 'communication', 'teamwork', 'collaboration',
  'problem-solving', 'problem solving', 'critical-thinking', 'critical thinking',
  'analytical', 'analytical-thinking', 'creative', 'creativity',
  'innovation', 'innovative', 'adaptability', 'flexibility',
  'time-management', 'time management', 'prioritization',
  'multitasking', 'multi-tasking', 'organization', 'organizational',
  'attention-to-detail', 'attention to detail', 'detail-oriented',
  'self-motivated', 'self-starter', 'proactive', 'initiative',
  'decision-making', 'decision making', 'strategic-thinking',
  'strategic thinking', 'strategic', 'visionary',
  'negotiation', 'persuasion', 'presentation', 'public-speaking',
  'writing', 'written-communication', 'verbal-communication',
  'interpersonal', 'relationship-building', 'networking',
  'conflict-resolution', 'mediation', 'empathy', 'emotional-intelligence',
  'mentoring', 'coaching', 'training', 'onboarding',
  'cross-functional', 'stakeholder-management', 'client-facing',
  'customer-oriented', 'customer-focused', 'user-centric',
  'ownership', 'accountability', 'reliability', 'dependability',
  'resilience', 'persistence', 'patience', 'curiosity',
  'growth-mindset', 'continuous-learning', 'self-improvement',
  'agile-mindset', 'results-driven', 'goal-oriented',
  'fast-paced', 'high-pressure', 'deadline-driven',
]);

export const CERTIFICATIONS = new Set([
  'aws-certified', 'aws certified', 'solutions-architect', 'solutions architect',
  'cloud-practitioner', 'cloud practitioner', 'developer-associate', 'developer associate',
  'sysops', 'devops-engineer', 'devops engineer',
  'azure-certified', 'azure certified', 'az-900', 'az-104', 'az-204', 'az-305', 'az-400',
  'google-cloud-certified', 'gcp-certified', 'associate-cloud-engineer',
  'professional-cloud-architect', 'professional-data-engineer',
  'comptia', 'a+', 'network+', 'security+', 'cysa+', 'casp+',
  'cissp', 'cism', 'cisa', 'ceh', 'oscp', 'ccna', 'ccnp', 'ccie',
  'pmp', 'prince2', 'itil', 'six-sigma', 'six sigma', 'lean',
  'scrum-master', 'scrum master', 'csm', 'psm', 'safe',
  'product-owner', 'product owner', 'cspo', 'pspo',
  'togaf', 'cobit', 'soc2', 'iso-27001', 'gdpr', 'hipaa', 'pci-dss',
  'ckad', 'cka', 'cks', 'terraform-associate', 'hashicorp',
  'salesforce', 'servicenow', 'oracle-certified', 'java-certified',
  'microsoft-certified', 'mcse', 'mcsa',
]);

export const ACTION_VERBS = new Set([
  'achieved', 'administered', 'analyzed', 'architected', 'automated',
  'built', 'championed', 'collaborated', 'configured', 'consolidated',
  'created', 'debugged', 'delivered', 'deployed', 'designed', 'developed',
  'directed', 'documented', 'drove', 'enabled', 'engineered',
  'enhanced', 'established', 'evaluated', 'executed', 'expanded',
  'facilitated', 'founded', 'generated', 'headed', 'identified',
  'implemented', 'improved', 'increased', 'influenced', 'initiated',
  'innovated', 'integrated', 'introduced', 'launched', 'led',
  'managed', 'mentored', 'migrated', 'modernized', 'monitored',
  'negotiated', 'operated', 'optimized', 'orchestrated', 'overhauled',
  'partnered', 'piloted', 'pioneered', 'planned', 'presented',
  'produced', 'programmed', 'proposed', 'provided', 'published',
  'rebuilt', 'reduced', 'refactored', 'refined', 'remodeled',
  'resolved', 'restructured', 'revamped', 'revolutionized', 'scaled',
  'secured', 'simplified', 'spearheaded', 'standardized', 'streamlined',
  'strengthened', 'supervised', 'supported', 'surpassed', 'synthesized',
  'tested', 'trained', 'transformed', 'troubleshot', 'unified',
  'upgraded', 'utilized', 'validated', 'verified',
]);

// Categorize a keyword
export function categorizeKeyword(keyword) {
  const lower = keyword.toLowerCase().replace(/\s+/g, '-');
  const lowerSpace = keyword.toLowerCase();

  if (TECHNICAL_SKILLS.has(lower) || TECHNICAL_SKILLS.has(lowerSpace)) return 'technical';
  if (SOFT_SKILLS.has(lower) || SOFT_SKILLS.has(lowerSpace)) return 'soft';
  if (CERTIFICATIONS.has(lower) || CERTIFICATIONS.has(lowerSpace)) return 'certification';
  if (ACTION_VERBS.has(lower)) return 'action';
  return 'other';
}
