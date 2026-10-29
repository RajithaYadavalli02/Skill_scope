from sqlalchemy.orm import Session
from app.models.entities import (
    Skill,
    JobRole,
    RoleSkillRequirement,
    LearningResource,
    User,
    UserSkill,
    RoadmapMilestone,
    AnalysisHistory,
)
from app.services.roadmap_generator import generate_personalized_roadmap

SKILLS_DATA = [
    # Languages
    {"name": "Python", "category": "Languages", "description": "High-level, interpreted general-purpose programming language.", "aliases": "python3,py"},
    {"name": "JavaScript", "category": "Languages", "description": "Dynamic web scripting language ubiquitous in front-end and back-end runtimes.", "aliases": "js,es6,ecmascript"},
    {"name": "TypeScript", "category": "Languages", "description": "Typed superset of JavaScript that compiles to plain JavaScript.", "aliases": "ts"},
    {"name": "SQL", "category": "Languages", "description": "Standard language for storing, manipulating and retrieving data in relational databases.", "aliases": "structured query language,ansi sql"},
    {"name": "HTML5 & CSS3", "category": "Languages", "description": "Core building blocks of web pages, layouts, and browser styling.", "aliases": "html,css,modern web markup"},
    {"name": "Java", "category": "Languages", "description": "Object-oriented, class-based language engineered for portability and enterprise backends.", "aliases": "java core,jvm"},
    {"name": "Bash & Shell Scripting", "category": "Languages", "description": "Command line scripting language for Unix/Linux automation.", "aliases": "shell,bash,sh,terminal"},

    # Frameworks & Libraries
    {"name": "React", "category": "Frameworks", "description": "Component-based declarative UI library for building reactive web applications.", "aliases": "react.js,reactjs"},
    {"name": "FastAPI", "category": "Frameworks", "description": "Modern, fast, high-performance web framework for building APIs with Python 3.8+ based on standard type hints.", "aliases": "fast api,fastapi python"},
    {"name": "Django", "category": "Frameworks", "description": "High-level Python web framework that encourages rapid development and clean, pragmatic design.", "aliases": "django framework,django orm"},
    {"name": "Flask", "category": "Frameworks", "description": "Lightweight WSGI web application micro-framework in Python.", "aliases": "flask microframework"},
    {"name": "Node.js & Express", "category": "Frameworks", "description": "Asynchronous event-driven JavaScript runtime and minimalistic web application framework.", "aliases": "nodejs,express,express.js"},
    {"name": "Tailwind CSS", "category": "Frameworks", "description": "Utility-first CSS framework for rapid modern UI development.", "aliases": "tailwind,tailwindcss"},
    {"name": "Next.js", "category": "Frameworks", "description": "The React framework for the web, providing server-side rendering and static generation.", "aliases": "nextjs,next"},

    # Databases
    {"name": "PostgreSQL", "category": "Databases", "description": "Powerful, open source object-relational database system.", "aliases": "postgres,psql"},
    {"name": "MySQL", "category": "Databases", "description": "Widely used open-source relational database management system.", "aliases": "mysql rdbms"},
    {"name": "MongoDB", "category": "Databases", "description": "Source-available cross-platform document-oriented NoSQL database program.", "aliases": "mongo,nosql document db"},
    {"name": "Redis", "category": "Databases", "description": "In-memory data structure store, used as a distributed cache, message broker, and database.", "aliases": "redis cache,in-memory store"},
    {"name": "SQLite", "category": "Databases", "description": "Self-contained, serverless, zero-configuration SQL database engine.", "aliases": "sqlite3"},

    # Data & AI / ML
    {"name": "Pandas", "category": "Data & AI", "description": "Fast, powerful, flexible and easy to use open source data analysis and manipulation tool.", "aliases": "pandas dataframe,data manipulation"},
    {"name": "NumPy", "category": "Data & AI", "description": "Fundamental package for scientific computing with Python, offering N-dimensional array objects.", "aliases": "numpy array,linear algebra"},
    {"name": "Scikit-learn", "category": "Data & AI", "description": "Simple and efficient tools for predictive data analysis and machine learning in Python.", "aliases": "sklearn,scikit learn"},
    {"name": "PyTorch", "category": "Data & AI", "description": "Deep learning platform providing seamless path from research prototyping to production.", "aliases": "pytorch,torch,deep learning"},
    {"name": "TensorFlow & Keras", "category": "Data & AI", "description": "End-to-end open source platform for machine learning and neural networks.", "aliases": "tensorflow,keras,tf"},
    {"name": "Large Language Models & Prompt Engineering", "category": "Data & AI", "description": "Architectures, prompting strategies, OpenAI/Anthropic/HuggingFace API integrations.", "aliases": "llm,gpt,prompt engineering,generative ai"},
    {"name": "LangChain & RAG", "category": "Data & AI", "description": "Frameworks for developing applications powered by language models with Retrieval-Augmented Generation.", "aliases": "langchain,llamaindex,rag architecture,vector search"},
    {"name": "Tableau & PowerBI", "category": "Data & AI", "description": "Interactive data visualization software focused on business intelligence.", "aliases": "powerbi,tableau,bi dashboards"},
    {"name": "Statistical Analysis & Probability", "category": "Data & AI", "description": "Hypothesis testing, distributions, regression analysis, Bayesian inference.", "aliases": "statistics,inferential stats,probability"},
    {"name": "Feature Engineering & Data Cleaning", "category": "Data & AI", "description": "Handling missing values, encoding categorical variables, scaling, and feature selection.", "aliases": "data preprocessing,data wrangling"},

    # Testing & QA
    {"name": "Pytest", "category": "Testing", "description": "Robust testing framework that makes it easy to write small, readable tests.", "aliases": "pytest runner,python unit testing"},
    {"name": "Jest & React Testing Library", "category": "Testing", "description": "JavaScript testing framework with a focus on simplicity and DOM component verification.", "aliases": "jest,rtl,component testing"},
    {"name": "Selenium & Playwright", "category": "Testing", "description": "Browser automation frameworks for End-to-End web testing across multiple browsers.", "aliases": "selenium webdriver,playwright e2e"},
    {"name": "API Testing & Postman", "category": "Testing", "description": "REST API validation, status codes, contract testing, automated test collections.", "aliases": "postman,rest api testing,newman"},
    {"name": "Manual Testing & Test Case Design", "category": "Testing", "description": "Writing test plans, boundary value analysis, equivalence partitioning, defect reporting.", "aliases": "qa manual testing,test cases,bug reporting,jira"},

    # DevOps, Cloud & Tools
    {"name": "Git & GitHub", "category": "DevOps & Tools", "description": "Distributed version control system and collaborative code hosting platform.", "aliases": "git,github,version control,git branching"},
    {"name": "Docker", "category": "DevOps & Tools", "description": "Platform for developing, shipping, and running applications inside lightweight containers.", "aliases": "docker containers,dockerfile,containerization"},
    {"name": "Kubernetes", "category": "DevOps & Tools", "description": "Open-source system for automating deployment, scaling, and management of containerized apps.", "aliases": "k8s,container orchestration"},
    {"name": "CI/CD & GitHub Actions", "category": "DevOps & Tools", "description": "Continuous Integration and Continuous Delivery automation pipelines.", "aliases": "github actions,jenkins,ci cd pipeline"},
    {"name": "Cloud Basics (AWS / GCP / Azure)", "category": "DevOps & Tools", "description": "Core cloud compute, object storage (S3), serverless functions, and security roles.", "aliases": "aws,gcp,azure,cloud infrastructure"},
    {"name": "Linux Fundamentals", "category": "DevOps & Tools", "description": "File permissions, processes, system monitoring, SSH, network commands.", "aliases": "linux,unix,ubuntu,sysadmin"},

    # Core CS & Architecture
    {"name": "Data Structures & Algorithms", "category": "Core CS", "description": "Arrays, Trees, Graphs, Sorting, Hash Maps, Dynamic Programming, Big-O complexity.", "aliases": "dsa,algorithms,complexity"},
    {"name": "RESTful API Design & OpenAPI", "category": "Core CS", "description": "HTTP methods, status codes, JSON payload design, API versioning, Swagger documentation.", "aliases": "rest api,openapi,swagger,http"},
    {"name": "System Design & Microservices", "category": "Core CS", "description": "Scalability, caching, message queues, load balancing, database sharding.", "aliases": "system design,microservices,scalability"}
]

ROLES_DATA = [
    {
        "title": "Python Developer",
        "slug": "python-developer",
        "department": "Software Engineering",
        "market_demand": "High",
        "salary_range": "₹6 LPA - ₹16 LPA / $75k - $120k",
        "description": "Designs, develops, and maintains scalable backend services, automation scripts, and server-side applications using Python and modern frameworks.",
        "overview": "Python Developers write clean, modular server-side logic, build RESTful microservices, integrate relational and caching databases, and ensure test-driven quality.",
        "key_responsibilities": "Develop REST APIs using FastAPI/Django; integrate with PostgreSQL and Redis; write unit tests using Pytest; containerize apps with Docker; maintain Git workflows.",
        "skills": [
            {"name": "Python", "is_required": True, "level": 3, "weight": 1.5, "rationale": "Primary programming language for OOP, generators, and async programming."},
            {"name": "FastAPI", "is_required": True, "level": 2, "weight": 1.3, "rationale": "High-performance framework for building modern asynchronous REST APIs."},
            {"name": "PostgreSQL", "is_required": True, "level": 2, "weight": 1.2, "rationale": "Primary transactional relational database management."},
            {"name": "Git & GitHub", "is_required": True, "level": 2, "weight": 1.0, "rationale": "Essential version control and team pull request collaboration."},
            {"name": "Pytest", "is_required": True, "level": 2, "weight": 1.1, "rationale": "Writing unit and integration tests with mocks and fixtures."},
            {"name": "RESTful API Design & OpenAPI", "is_required": True, "level": 3, "weight": 1.2, "rationale": "Industry-standard API contract design and HTTP semantics."},
            {"name": "Docker", "is_required": False, "level": 2, "weight": 0.9, "rationale": "Packaging applications for predictable container deployment."},
            {"name": "Redis", "is_required": False, "level": 2, "weight": 0.8, "rationale": "Caching and session store for backend performance optimization."},
            {"name": "Data Structures & Algorithms", "is_required": False, "level": 2, "weight": 0.8, "rationale": "Writing efficient algorithms with optimal time and space complexity."}
        ]
    },
    {
        "title": "Full Stack Developer",
        "slug": "full-stack-developer",
        "department": "Software Engineering",
        "market_demand": "Very High",
        "salary_range": "₹7 LPA - ₹20 LPA / $80k - $135k",
        "description": "Bridges frontend user interfaces and backend server architectures to deliver end-to-end web applications.",
        "overview": "Full Stack Developers create interactive user interfaces, connect them to robust backend endpoints, manage database schemas, and ensure seamless deployment.",
        "key_responsibilities": "Build responsive React components; develop backend REST APIs in Node.js or FastAPI; manage database migrations; implement authentication and CI/CD pipelines.",
        "skills": [
            {"name": "JavaScript", "is_required": True, "level": 3, "weight": 1.4, "rationale": "Core web scripting foundation for client and server execution."},
            {"name": "TypeScript", "is_required": True, "level": 2, "weight": 1.3, "rationale": "Type safety across fullstack data contracts and interfaces."},
            {"name": "React", "is_required": True, "level": 3, "weight": 1.4, "rationale": "Standard UI framework for modern single-page applications."},
            {"name": "Node.js & Express", "is_required": True, "level": 2, "weight": 1.3, "rationale": "Server-side runtime and REST service architecture."},
            {"name": "SQL", "is_required": True, "level": 2, "weight": 1.2, "rationale": "Relational query execution, schema joins, and data normalization."},
            {"name": "HTML5 & CSS3", "is_required": True, "level": 3, "weight": 1.1, "rationale": "Semantic document structures and responsive responsive layout systems."},
            {"name": "Git & GitHub", "is_required": True, "level": 2, "weight": 1.0, "rationale": "Version control and continuous integration workflows."},
            {"name": "Tailwind CSS", "is_required": False, "level": 2, "weight": 0.9, "rationale": "Rapid modern UI styling without bloated CSS stylesheets."},
            {"name": "Docker", "is_required": False, "level": 2, "weight": 0.8, "rationale": "Containerized development and production parity."},
            {"name": "MongoDB", "is_required": False, "level": 2, "weight": 0.8, "rationale": "Document-based NoSQL storage for flexible JSON documents."}
        ]
    },
    {
        "title": "Data Analyst",
        "slug": "data-analyst",
        "department": "Data & Business Intelligence",
        "market_demand": "High",
        "salary_range": "₹5 LPA - ₹14 LPA / $65k - $105k",
        "description": "Inspects, cleans, transforms, and models data to discover actionable business insights and inform strategic decision-making.",
        "overview": "Data Analysts query complex relational databases, clean messy datasets, build intuitive dashboards, and communicate trends to business stakeholders.",
        "key_responsibilities": "Write complex SQL queries; clean datasets using Python/Pandas; build executive dashboards in Tableau or PowerBI; calculate business KPIs and statistical metrics.",
        "skills": [
            {"name": "SQL", "is_required": True, "level": 3, "weight": 1.5, "rationale": "Mandatory for writing complex aggregations, window functions, and subqueries."},
            {"name": "Python", "is_required": True, "level": 2, "weight": 1.3, "rationale": "Automating data transformation and exploratory data analysis."},
            {"name": "Pandas", "is_required": True, "level": 3, "weight": 1.4, "rationale": "Core library for filtering, grouping, merging, and reshaping tabular datasets."},
            {"name": "Tableau & PowerBI", "is_required": True, "level": 3, "weight": 1.4, "rationale": "Designing interactive visual charts and business intelligence dashboards."},
            {"name": "Statistical Analysis & Probability", "is_required": True, "level": 2, "weight": 1.2, "rationale": "Understanding variance, confidence intervals, correlation, and hypothesis testing."},
            {"name": "Feature Engineering & Data Cleaning", "is_required": True, "level": 2, "weight": 1.1, "rationale": "Identifying nulls, outliers, and formatting data for analytical consistency."},
            {"name": "Git & GitHub", "is_required": False, "level": 1, "weight": 0.8, "rationale": "Documenting analytical notebooks and versioning code scripts."}
        ]
    },
    {
        "title": "Data Scientist",
        "slug": "data-scientist",
        "department": "Data & Analytics",
        "market_demand": "Very High",
        "salary_range": "₹8 LPA - ₹22 LPA / $90k - $150k",
        "description": "Extracts knowledge from structured and unstructured data using statistical modeling, machine learning, and predictive analytics.",
        "overview": "Data Scientists formulate hypotheses, engineer novel features, train predictive models, evaluate trade-offs, and translate mathematical discoveries into business value.",
        "key_responsibilities": "Conduct statistical experiments; preprocess messy multidimensional data; train regression and classification models using Scikit-learn; validate model performance.",
        "skills": [
            {"name": "Python", "is_required": True, "level": 3, "weight": 1.5, "rationale": "Primary language for the entire scientific Python stack."},
            {"name": "Pandas", "is_required": True, "level": 3, "weight": 1.3, "rationale": "Wrangling large datasets and performing time series/categorical operations."},
            {"name": "NumPy", "is_required": True, "level": 3, "weight": 1.3, "rationale": "Matrix manipulation, vectorization, and mathematical broadcasting."},
            {"name": "Scikit-learn", "is_required": True, "level": 3, "weight": 1.5, "rationale": "Training supervised and unsupervised machine learning algorithms."},
            {"name": "Statistical Analysis & Probability", "is_required": True, "level": 3, "weight": 1.4, "rationale": "Inferential statistics, A/B testing, and p-value validation."},
            {"name": "SQL", "is_required": True, "level": 2, "weight": 1.2, "rationale": "Extracting features directly from enterprise databases."},
            {"name": "Feature Engineering & Data Cleaning", "is_required": True, "level": 3, "weight": 1.3, "rationale": "Creating predictive signals and reducing dimensionality."},
            {"name": "PyTorch", "is_required": False, "level": 2, "weight": 0.9, "rationale": "Deep learning architectures for non-linear high-dimensional data."},
            {"name": "Git & GitHub", "is_required": False, "level": 2, "weight": 0.8, "rationale": "Reproducible research and collaborative versioning."}
        ]
    },
    {
        "title": "Machine Learning Engineer",
        "slug": "machine-learning-engineer",
        "department": "AI & Systems",
        "market_demand": "Very High",
        "salary_range": "₹9 LPA - ₹25 LPA / $100k - $165k",
        "description": "Researches, builds, optimizes, and productionizes machine learning models into high-availability software systems.",
        "overview": "ML Engineers bridge theoretical data science and production software engineering, turning experimental Jupyter notebooks into hardened, low-latency microservices.",
        "key_responsibilities": "Design neural network pipelines; implement model tracking and MLOps; package models with Docker; serve real-time predictions via FastAPI.",
        "skills": [
            {"name": "Python", "is_required": True, "level": 3, "weight": 1.5, "rationale": "Language of modern machine learning and tensor libraries."},
            {"name": "PyTorch", "is_required": True, "level": 3, "weight": 1.5, "rationale": "Core deep learning framework for tensor graphs and neural networks."},
            {"name": "Scikit-learn", "is_required": True, "level": 3, "weight": 1.3, "rationale": "Classic ML algorithms, preprocessing pipelines, and evaluation metrics."},
            {"name": "Docker", "is_required": True, "level": 2, "weight": 1.2, "rationale": "Packaging dependencies and GPU/CUDA environments for production."},
            {"name": "FastAPI", "is_required": True, "level": 2, "weight": 1.2, "rationale": "Building low-latency inference REST endpoints."},
            {"name": "NumPy", "is_required": True, "level": 3, "weight": 1.2, "rationale": "Efficient numerical operations and array manipulations."},
            {"name": "Git & GitHub", "is_required": True, "level": 2, "weight": 1.0, "rationale": "Tracking code, pipeline configs, and collaborative development."},
            {"name": "Linux Fundamentals", "is_required": False, "level": 2, "weight": 0.9, "rationale": "Managing cloud GPU compute instances and bash automation."},
            {"name": "CI/CD & GitHub Actions", "is_required": False, "level": 2, "weight": 0.8, "rationale": "Automated retraining and model deployment pipelines."}
        ]
    },
    {
        "title": "AI Engineer",
        "slug": "ai-engineer",
        "department": "Artificial Intelligence",
        "market_demand": "Exceptional",
        "salary_range": "₹10 LPA - ₹28 LPA / $110k - $180k",
        "description": "Architects modern generative AI applications utilizing foundation LLMs, prompt engineering, vector databases, and RAG pipelines.",
        "overview": "AI Engineers build practical, enterprise-grade AI software utilizing state-of-the-art Large Language Models, agentic workflows, and semantic retrieval systems.",
        "key_responsibilities": "Build RAG systems using LangChain and Vector Stores; engineer multi-turn prompt pipelines; integrate API gateways; handle token optimization and evaluation.",
        "skills": [
            {"name": "Python", "is_required": True, "level": 3, "weight": 1.5, "rationale": "Primary ecosystem for AI orchestration and API clients."},
            {"name": "Large Language Models & Prompt Engineering", "is_required": True, "level": 3, "weight": 1.6, "rationale": "Context window management, structured JSON outputs, chain-of-thought prompting."},
            {"name": "LangChain & RAG", "is_required": True, "level": 3, "weight": 1.5, "rationale": "Chunking documents, vector embeddings, semantic retrieval, and agent tooling."},
            {"name": "FastAPI", "is_required": True, "level": 2, "weight": 1.2, "rationale": "Serving streaming AI responses and async webhook endpoints."},
            {"name": "Git & GitHub", "is_required": True, "level": 2, "weight": 1.0, "rationale": "Version control for AI logic and system configurations."},
            {"name": "PostgreSQL", "is_required": False, "level": 2, "weight": 0.9, "rationale": "Relational storage and pgvector extension for hybrid search."},
            {"name": "Docker", "is_required": False, "level": 2, "weight": 0.9, "rationale": "Containerized isolation of AI microservices."}
        ]
    },
    {
        "title": "Frontend Developer",
        "slug": "frontend-developer",
        "department": "Software Engineering",
        "market_demand": "High",
        "salary_range": "₹6 LPA - ₹17 LPA / $70k - $125k",
        "description": "Constructs fast, accessible, aesthetically polished, and responsive web user interfaces that users love.",
        "overview": "Frontend Developers translate Figma design systems into pixel-perfect, accessible, and reactive web applications with performant client-side state management.",
        "key_responsibilities": "Build modular React UI components; write type-safe TypeScript; create fluid CSS layouts with Tailwind; optimize web vitals and bundle size.",
        "skills": [
            {"name": "JavaScript", "is_required": True, "level": 3, "weight": 1.5, "rationale": "Deep understanding of DOM, async events, closures, and promises."},
            {"name": "TypeScript", "is_required": True, "level": 3, "weight": 1.4, "rationale": "Type-safe props, state, and API response typing."},
            {"name": "React", "is_required": True, "level": 3, "weight": 1.5, "rationale": "Hooks, context, component composition, and rendering lifecycle."},
            {"name": "HTML5 & CSS3", "is_required": True, "level": 3, "weight": 1.3, "rationale": "Semantic HTML, flexbox/grid layout systems, and WCAG accessibility."},
            {"name": "Tailwind CSS", "is_required": True, "level": 2, "weight": 1.2, "rationale": "Clean, utility-driven UI styling and responsive breakpoint control."},
            {"name": "Git & GitHub", "is_required": True, "level": 2, "weight": 1.0, "rationale": "Team collaboration, pull request reviews, and branching strategy."},
            {"name": "Jest & React Testing Library", "is_required": False, "level": 2, "weight": 0.9, "rationale": "Component unit tests and user interaction validation."},
            {"name": "Next.js", "is_required": False, "level": 2, "weight": 0.9, "rationale": "Server-side rendering, routing, and SEO optimization."}
        ]
    },
    {
        "title": "Backend Developer",
        "slug": "backend-developer",
        "department": "Software Engineering",
        "market_demand": "Very High",
        "salary_range": "₹7 LPA - ₹19 LPA / $80k - $135k",
        "description": "Architects high-performance server-side systems, database schemas, API gateways, and distributed infrastructure.",
        "overview": "Backend Developers handle business logic, transactional integrity, database query optimization, security authentication, and service scalability.",
        "key_responsibilities": "Build secure RESTful APIs; design relational databases; implement token-based auth (JWT/OAuth); manage caching layers and async workers.",
        "skills": [
            {"name": "Python", "is_required": True, "level": 3, "weight": 1.4, "rationale": "Core server programming, async event loops, and clean OOP design."},
            {"name": "FastAPI", "is_required": True, "level": 3, "weight": 1.4, "rationale": "High-throughput asynchronous REST API framework."},
            {"name": "PostgreSQL", "is_required": True, "level": 3, "weight": 1.4, "rationale": "ACID compliance, schema indexes, foreign keys, and query plans."},
            {"name": "RESTful API Design & OpenAPI", "is_required": True, "level": 3, "weight": 1.3, "rationale": "Standardized endpoint contracts, status codes, and security."},
            {"name": "Git & GitHub", "is_required": True, "level": 2, "weight": 1.0, "rationale": "Version control and collaborative engineering standards."},
            {"name": "Docker", "is_required": True, "level": 2, "weight": 1.2, "rationale": "Containerized service orchestration and environment parity."},
            {"name": "Redis", "is_required": False, "level": 2, "weight": 0.9, "rationale": "Sub-millisecond latency cache and rate-limiting store."},
            {"name": "System Design & Microservices", "is_required": False, "level": 2, "weight": 1.0, "rationale": "Architecting resilient, scalable distributed backends."},
            {"name": "CI/CD & GitHub Actions", "is_required": False, "level": 2, "weight": 0.8, "rationale": "Automated build, test, and release deployment pipelines."}
        ]
    },
    {
        "title": "Software Tester / QA Engineer",
        "slug": "software-tester",
        "department": "Quality Assurance",
        "market_demand": "High",
        "salary_range": "₹5 LPA - ₹13 LPA / $60k - $100k",
        "description": "Ensures software quality, reliability, and security through systematic manual testing, automated test suites, and defect lifecycle tracking.",
        "overview": "QA Engineers design comprehensive test scenarios, automate repetitive regression tests, inspect API contracts, and guard software releases against defects.",
        "key_responsibilities": "Write structured test cases; automate End-to-End browser tests; conduct API contract testing in Postman; run regression pipelines in CI/CD.",
        "skills": [
            {"name": "Manual Testing & Test Case Design", "is_required": True, "level": 3, "weight": 1.5, "rationale": "Equivalence partitioning, boundary values, bug logging, and test plans."},
            {"name": "API Testing & Postman", "is_required": True, "level": 3, "weight": 1.4, "rationale": "Verifying JSON schemas, response status codes, and regression collections."},
            {"name": "Python", "is_required": True, "level": 2, "weight": 1.3, "rationale": "Scripting automated test suites and mock data generators."},
            {"name": "Pytest", "is_required": True, "level": 3, "weight": 1.4, "rationale": "Writing automated assertions, fixtures, and parameterized test cases."},
            {"name": "Selenium & Playwright", "is_required": True, "level": 2, "weight": 1.4, "rationale": "Automating browser interactions across Chrome, Firefox, and Safari."},
            {"name": "Git & GitHub", "is_required": True, "level": 2, "weight": 1.0, "rationale": "Reviewing PRs and storing test automation code."},
            {"name": "CI/CD & GitHub Actions", "is_required": False, "level": 2, "weight": 0.9, "rationale": "Running automated smoke and regression test suites on every pull request."}
        ]
    }
]

RESOURCES_DATA = [
    # Python
    {"skill": "Python", "title": "Official Python 3 Documentation & Tutorial", "url": "https://docs.python.org/3/tutorial/", "provider": "Python Software Foundation", "resource_type": "Documentation", "difficulty": "Beginner", "is_free": True},
    {"skill": "Python", "title": "CS50's Introduction to Programming with Python", "url": "https://cs50.harvard.edu/python/", "provider": "Harvard University", "resource_type": "Course", "difficulty": "Beginner", "is_free": True},
    {"skill": "Python", "title": "Python for Everybody Specialization", "url": "https://www.py4e.com/", "provider": "Dr. Charles Severance (FreeCodeCamp)", "resource_type": "Video", "difficulty": "Beginner", "is_free": True},

    # JavaScript
    {"skill": "JavaScript", "title": "MDN Web Docs: JavaScript Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", "provider": "Mozilla", "resource_type": "Documentation", "difficulty": "Beginner", "is_free": True},
    {"skill": "JavaScript", "title": "The Modern JavaScript Tutorial", "url": "https://javascript.info/", "provider": "JavaScript.info", "resource_type": "Course", "difficulty": "Intermediate", "is_free": True},

    # TypeScript
    {"skill": "TypeScript", "title": "TypeScript Official Handbook", "url": "https://www.typescriptlang.org/docs/handbook/intro.html", "provider": "Microsoft", "resource_type": "Documentation", "difficulty": "Beginner", "is_free": True},
    {"skill": "TypeScript", "title": "Total TypeScript Free Tutorials", "url": "https://www.totaltypescript.com/tutorials", "provider": "Matt Pocock", "resource_type": "Course", "difficulty": "Intermediate", "is_free": True},

    # React
    {"skill": "React", "title": "React Official Interactive Documentation", "url": "https://react.dev/learn", "provider": "React Core Team", "resource_type": "Documentation", "difficulty": "Beginner", "is_free": True},
    {"skill": "React", "title": "Full React 18 Course with Projects", "url": "https://www.freecodecamp.org/news/learn-react-by-building-projects/", "provider": "freeCodeCamp", "resource_type": "Project", "difficulty": "Intermediate", "is_free": True},

    # FastAPI
    {"skill": "FastAPI", "title": "FastAPI Tutorial - User Guide", "url": "https://fastapi.tiangolo.com/tutorial/", "provider": "Tiangolo", "resource_type": "Documentation", "difficulty": "Beginner", "is_free": True},
    {"skill": "FastAPI", "title": "Building Production APIs with FastAPI", "url": "https://testdriven.io/courses/tdd-fastapi/", "provider": "TestDriven.io", "resource_type": "Course", "difficulty": "Intermediate", "is_free": True},

    # SQL & Databases
    {"skill": "SQL", "title": "SQLBolt - Interactive SQL Lessons", "url": "https://sqlbolt.com/", "provider": "SQLBolt", "resource_type": "Course", "difficulty": "Beginner", "is_free": True},
    {"skill": "SQL", "title": "PostgreSQL Tutorial for Beginners", "url": "https://www.postgresqltutorial.com/", "provider": "PostgreSQL Tutorial", "resource_type": "Documentation", "difficulty": "Beginner", "is_free": True},
    {"skill": "PostgreSQL", "title": "Official PostgreSQL Documentation", "url": "https://www.postgresql.org/docs/", "provider": "PostgreSQL Global Development Group", "resource_type": "Documentation", "difficulty": "Intermediate", "is_free": True},

    # Data Science & Machine Learning
    {"skill": "Pandas", "title": "Pandas Getting Started Tutorials", "url": "https://pandas.pydata.org/docs/getting_started/index.html", "provider": "Pandas Community", "resource_type": "Documentation", "difficulty": "Beginner", "is_free": True},
    {"skill": "NumPy", "title": "NumPy: The Absolute Basics for Beginners", "url": "https://numpy.org/doc/stable/user/absolute_beginners.html", "provider": "NumPy Developers", "resource_type": "Documentation", "difficulty": "Beginner", "is_free": True},
    {"skill": "Scikit-learn", "title": "Scikit-learn Machine Learning in Python", "url": "https://scikit-learn.org/stable/tutorial/index.html", "provider": "Scikit-learn Consortium", "resource_type": "Documentation", "difficulty": "Intermediate", "is_free": True},
    {"skill": "PyTorch", "title": "Deep Learning with PyTorch: A 60 Minute Blitz", "url": "https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html", "provider": "PyTorch Team", "resource_type": "Course", "difficulty": "Intermediate", "is_free": True},
    {"skill": "Statistical Analysis & Probability", "title": "Khan Academy Statistics and Probability", "url": "https://www.khanacademy.org/math/statistics-probability", "provider": "Khan Academy", "resource_type": "Course", "difficulty": "Beginner", "is_free": True},
    {"skill": "Tableau & PowerBI", "title": "Microsoft Power BI Guided Learning", "url": "https://learn.microsoft.com/en-us/power-bi/guided-learning/", "provider": "Microsoft Learn", "resource_type": "Course", "difficulty": "Beginner", "is_free": True},

    # AI & LLMs
    {"skill": "Large Language Models & Prompt Engineering", "title": "Prompt Engineering Guide by DAIR.AI", "url": "https://www.promptingguide.ai/", "provider": "DAIR.AI", "resource_type": "Documentation", "difficulty": "Beginner", "is_free": True},
    {"skill": "LangChain & RAG", "title": "LangChain Documentation & Architecture Guide", "url": "https://python.langchain.com/docs/get_started/introduction", "provider": "LangChain", "resource_type": "Documentation", "difficulty": "Intermediate", "is_free": True},

    # Testing & QA
    {"skill": "Pytest", "title": "Pytest Documentation & Fixture Guide", "url": "https://docs.pytest.org/en/stable/", "provider": "Holger Krekel", "resource_type": "Documentation", "difficulty": "Beginner", "is_free": True},
    {"skill": "API Testing & Postman", "title": "Postman API Fundamentals Student Expert", "url": "https://academy.postman.com/", "provider": "Postman Academy", "resource_type": "Course", "difficulty": "Beginner", "is_free": True},
    {"skill": "Selenium & Playwright", "title": "Playwright for Python Fast & Reliable E2E", "url": "https://playwright.dev/python/docs/intro", "provider": "Microsoft", "resource_type": "Documentation", "difficulty": "Intermediate", "is_free": True},
    {"skill": "Manual Testing & Test Case Design", "title": "Guru99 Software Testing Fundamentals", "url": "https://www.guru99.com/software-testing.html", "provider": "Guru99", "resource_type": "Course", "difficulty": "Beginner", "is_free": True},

    # DevOps & Tools
    {"skill": "Git & GitHub", "title": "Pro Git Book (Free Full Online Book)", "url": "https://git-scm.com/book/en/v2", "provider": "Scott Chacon & Ben Straub", "resource_type": "Book", "difficulty": "Beginner", "is_free": True},
    {"skill": "Docker", "title": "Docker Orientation and Setup Guide", "url": "https://docs.docker.com/get-started/", "provider": "Docker Inc.", "resource_type": "Documentation", "difficulty": "Beginner", "is_free": True},
    {"skill": "Tailwind CSS", "title": "Tailwind CSS Documentation", "url": "https://tailwindcss.com/docs", "provider": "Tailwind Labs", "resource_type": "Documentation", "difficulty": "Beginner", "is_free": True}
]

# One-Click Persona Presets for Examiners / Viva Demonstration
PERSONA_PRESETS = [
    {
        "id": "college_junior",
        "name": "College Junior / CS Undergraduate",
        "tagline": "Fundamental programming knowledge, exploring backend roles",
        "target_role_slug": "python-developer",
        "education_level": "B.Tech Computer Science (3rd Year)",
        "years_of_experience": 0.5,
        "skills": [
            {"skill_name": "Python", "proficiency_level": 2, "years_experience": 1.0},
            {"skill_name": "SQL", "proficiency_level": 1, "years_experience": 0.5},
            {"skill_name": "Git & GitHub", "proficiency_level": 2, "years_experience": 1.0},
            {"skill_name": "Data Structures & Algorithms", "proficiency_level": 2, "years_experience": 1.0}
        ]
    },
    {
        "id": "frontend_to_fullstack",
        "name": "Frontend Developer Transitioning to Full Stack",
        "tagline": "Strong UI / React skills, looking to bridge backend and databases",
        "target_role_slug": "full-stack-developer",
        "education_level": "B.E. Information Technology",
        "years_of_experience": 1.5,
        "skills": [
            {"skill_name": "JavaScript", "proficiency_level": 3, "years_experience": 2.0},
            {"skill_name": "TypeScript", "proficiency_level": 2, "years_experience": 1.0},
            {"skill_name": "React", "proficiency_level": 3, "years_experience": 2.0},
            {"skill_name": "HTML5 & CSS3", "proficiency_level": 4, "years_experience": 2.5},
            {"skill_name": "Tailwind CSS", "proficiency_level": 3, "years_experience": 1.5},
            {"skill_name": "Git & GitHub", "proficiency_level": 2, "years_experience": 2.0}
        ]
    },
    {
        "id": "analyst_to_datascientist",
        "name": "Data Analyst Aiming for Data Science",
        "tagline": "Strong SQL, Pandas, and BI skills; building machine learning foundations",
        "target_role_slug": "data-scientist",
        "education_level": "B.Sc Statistics / Data Science",
        "years_of_experience": 1.5,
        "skills": [
            {"skill_name": "Python", "proficiency_level": 2, "years_experience": 1.5},
            {"skill_name": "SQL", "proficiency_level": 3, "years_experience": 2.0},
            {"skill_name": "Pandas", "proficiency_level": 3, "years_experience": 1.5},
            {"skill_name": "Tableau & PowerBI", "proficiency_level": 3, "years_experience": 2.0},
            {"skill_name": "Statistical Analysis & Probability", "proficiency_level": 2, "years_experience": 1.0},
            {"skill_name": "Feature Engineering & Data Cleaning", "proficiency_level": 2, "years_experience": 1.0}
        ]
    }
]

def seed_database(db: Session) -> None:
    """
    Idempotent seeding function. Populates skills, roles, requirements, resources,
    and initializes the default demo user.
    """
    # 1. Seed Skills
    skill_lookup = {}
    for item in SKILLS_DATA:
        existing = db.query(Skill).filter(Skill.name == item["name"]).first()
        if not existing:
            new_skill = Skill(
                name=item["name"],
                category=item["category"],
                description=item["description"],
                aliases=item["aliases"]
            )
            db.add(new_skill)
            db.flush()
            skill_lookup[item["name"]] = new_skill
        else:
            skill_lookup[item["name"]] = existing

    db.commit()

    # 2. Seed Job Roles and Requirements
    for role_item in ROLES_DATA:
        existing_role = db.query(JobRole).filter(JobRole.slug == role_item["slug"]).first()
        if not existing_role:
            new_role = JobRole(
                title=role_item["title"],
                slug=role_item["slug"],
                department=role_item["department"],
                market_demand=role_item["market_demand"],
                salary_range=role_item["salary_range"],
                description=role_item["description"],
                overview=role_item["overview"],
                key_responsibilities=role_item["key_responsibilities"]
            )
            db.add(new_role)
            db.flush()
            current_role = new_role
        else:
            current_role = existing_role

        # Seed requirements
        for req in role_item["skills"]:
            target_skill = skill_lookup.get(req["name"])
            if target_skill:
                existing_req = db.query(RoleSkillRequirement).filter(
                    RoleSkillRequirement.role_id == current_role.id,
                    RoleSkillRequirement.skill_id == target_skill.id
                ).first()
                if not existing_req:
                    new_req = RoleSkillRequirement(
                        role_id=current_role.id,
                        skill_id=target_skill.id,
                        is_required=req["is_required"],
                        required_level=req["level"],
                        weight=req["weight"],
                        importance_rationale=req["rationale"]
                    )
                    db.add(new_req)

    db.commit()

    # 3. Seed Learning Resources
    for res in RESOURCES_DATA:
        target_skill = skill_lookup.get(res["skill"])
        if target_skill:
            existing_res = db.query(LearningResource).filter(
                LearningResource.skill_id == target_skill.id,
                LearningResource.title == res["title"]
            ).first()
            if not existing_res:
                new_res = LearningResource(
                    skill_id=target_skill.id,
                    title=res["title"],
                    url=res["url"],
                    provider=res["provider"],
                    resource_type=res["resource_type"],
                    difficulty=res["difficulty"],
                    is_free=res["is_free"]
                )
                db.add(new_res)

    db.commit()

    # 4. Initialize Default Demo User if not exists
    user = db.query(User).first()
    if not user:
        python_role = db.query(JobRole).filter(JobRole.slug == "python-developer").first()
        user = User(
            name="Arun Sharma",
            email="arun.student@skillscope.edu",
            target_role_id=python_role.id if python_role else 1,
            education_level="B.Tech Computer Science & Engineering",
            years_of_experience=1.0
        )
        db.add(user)
        db.flush()

        # Seed default starting skills (College Junior preset)
        preset = PERSONA_PRESETS[0]
        for s in preset["skills"]:
            target_s = skill_lookup.get(s["skill_name"])
            if target_s:
                us = UserSkill(
                    user_id=user.id,
                    skill_id=target_s.id,
                    proficiency_level=s["proficiency_level"],
                    years_experience=s["years_experience"]
                )
                db.add(us)

        db.commit()

        # Generate initial roadmap for default user
        if python_role:
            reqs = db.query(RoleSkillRequirement).filter(RoleSkillRequirement.role_id == python_role.id).all()
            user_skills = db.query(UserSkill).filter(UserSkill.user_id == user.id).all()
            generate_personalized_roadmap(db, user.id, python_role, reqs, user_skills)

