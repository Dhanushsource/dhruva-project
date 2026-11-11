const careers = [
    ['Artificial Intelligence', 'Teach machines to think, learn and solve real-world problems.', '94% MATCH', 'blue', '⌘', 'Technology', '₹ 8–24 LPA'],
    ['Data Science', 'Turn complex information into decisions that shape the future.', '89% MATCH', 'orange', '◉', 'Technology', '₹ 7–20 LPA'],
    ['Cybersecurity', 'Protect the digital world from the threats we cannot always see.', '84% MATCH', 'purple', '✣', 'Technology', '₹ 6–18 LPA'],
    ['Product Design', 'Shape useful, beautiful experiences for the people who use them.', '72% MATCH', 'green', '✚', 'Design', '₹ 5–16 LPA'],
    ['Biotechnology', 'Use living systems to create healthier, more sustainable futures.', '68% MATCH', 'green', '✚', 'Healthcare', '₹ 4–12 LPA'],
    ['Digital Marketing', 'Connect ideas with the people who need them most.', '64% MATCH', 'orange', '◉', 'Business', '₹ 4–14 LPA']
];

const navItems = document.querySelectorAll('[data-view]');
const views = document.querySelectorAll('.view');
const viewLabels = {
    'student-login': 'Student login',
    'student-profile': 'Student profile',
    'higher-education': 'Higher education',
    'college-finder': 'College & fee finder',
    scholarships: 'Scholarships & study abroad',
    'entrance-exams': 'Entrance examinations',
    'career-scope': 'Career scope',
    'job-opportunities': 'Job opportunities',
    'salary-expectations': 'Salary expectations',
    'industry-trends': 'Industry trends'
};
const API_BASE = window.location.port === '8002' ? '' : 'http://localhost:8002';
let selectedCareer = 'Artificial Intelligence';
let selectedCareerMatch = null;
let careerRecords = careers.map(([name, description, match, color, symbol, domain, salary]) => ({
    name,
    description,
    fit_score: Number.parseInt(match, 10),
    color,
    symbol,
    domain,
    salary_range: salary,
    education_duration: '4 years'
}));
let savedCareerIds = new Set();

async function apiRequest(path, options = {}) {
    const headers = {...options.headers };
    const token = localStorage.getItem('careerCompassAccessToken');
    if (token) headers.Authorization = `Bearer ${token}`;
    if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

    const response = await fetch(`${API_BASE}${path}`, {...options, headers });
    const result = response.status === 204 ? null : await response.json().catch(() => ({}));
    if (!response.ok) {
        if (response.status === 401 && token) {
            localStorage.removeItem('careerCompassAccessToken');
            savedCareerIds = new Set();
        }
        throw new Error((result && result.detail) || `Request failed (${response.status}).`);
    }
    return result;
}

function escapeHTML(value) {
    return String(value === null || value === undefined ? '' : value).replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

const careerRoadmaps = {
    'Artificial Intelligence': {
        match: '94%',
        symbol: '⌘',
        color: 'blue',
        summary: 'A practical path to become strong in coding, mathematics and applied AI systems.',
        overview: 'AI combines mathematics, logic, and software development to create systems that can learn from data, find patterns, and support decisions in real life.',
        duration: '4–5 years of study, plus projects and continuous practice.',
        bestCourses: ['B.Tech in Computer Science', 'B.Tech in Artificial Intelligence', 'B.Sc in Data Science', 'Diploma in AI and Machine Learning'],
        examFocus: ['Mathematics', 'Physics', 'Coding', 'Logical reasoning'],
        jobs: ['AI Engineer', 'Machine Learning Engineer', 'Data Scientist', 'Automation Specialist'],
        skillAreas: ['Python', 'Statistics', 'Machine learning', 'Deep learning', 'Problem solving', 'Data handling'],
        firstSteps: ['Learn Python and logic', 'Study probability and linear algebra', 'Build 2 mini AI projects'],
        entryPreparation: ['Build confidence in mathematics and logical reasoning', 'Learn basic programming before advanced AI courses', 'Check the subject and entrance requirements of each institution'],
        practiceProjects: ['Train a simple model on a public dataset', 'Create a recommendation demo and explain its limits', 'Document an AI project with clear data and evaluation notes'],
        phases: [
            { step: 'NOW · 0–3 MONTHS', title: 'Build the foundations', description: 'Strengthen Python, linear algebra, probability and problem-solving with short daily exercises and mini projects.', skills: ['Python', 'Math', 'Problem solving'] },
            { step: 'NEXT · 3–9 MONTHS', title: 'Create portfolio projects', description: 'Build 2–3 projects such as sentiment analysis, recommendation systems, or computer vision demos.', skills: ['ML projects', 'Portfolio', 'Data handling'] },
            { step: 'THEN · 9–18 MONTHS', title: 'Choose a specialization', description: 'Move into machine learning, NLP, CV, generative AI, or data engineering based on the projects that excite you.', skills: ['NLP', 'Computer vision', 'AI tools'] }
        ]
    },
    'Data Science': {
        match: '89%',
        symbol: '◉',
        color: 'orange',
        summary: 'Move from statistics and data cleaning to storytelling with decision-ready insight.',
        overview: 'Data science helps you turn large amounts of information into patterns, dashboards, and business decisions that improve results and reduce uncertainty.',
        duration: '3–4 years for a degree, followed by analytics and project-based learning.',
        bestCourses: ['B.Sc in Data Science', 'B.Tech in Computer Science', 'B.Com with analytics', 'B.Sc in Statistics'],
        examFocus: ['Mathematics', 'Statistics', 'Python', 'Business reasoning'],
        jobs: ['Data Analyst', 'Business Analyst', 'Data Scientist', 'Analytics Consultant'],
        skillAreas: ['SQL', 'Statistics', 'Visualization', 'Data cleaning', 'Machine learning', 'Business insight'],
        firstSteps: ['Learn Excel and SQL', 'Practice statistics and dashboards', 'Work on 2 data analysis projects'],
        entryPreparation: ['Strengthen mathematics and basic statistics', 'Practice spreadsheets and introductory programming', 'Compare course prerequisites, especially mathematics requirements'],
        practiceProjects: ['Build a dashboard from a public dataset', 'Write a short analysis that explains a real-world trend', 'Clean and document a small dataset before visualizing it'],
        phases: [
            { step: 'NOW · 0–3 MONTHS', title: 'Master the data core', description: 'Learn Excel, Python, SQL, statistics and visualization techniques before moving into modeling.', skills: ['SQL', 'Statistics', 'Power BI'] },
            { step: 'NEXT · 3–9 MONTHS', title: 'Solve analytics problems', description: 'Work on dashboards, customer segmentation, predictive analysis and business case studies.', skills: ['Dashboards', 'Analysis', 'Insights'] },
            { step: 'THEN · 9–18 MONTHS', title: 'Specialize by domain', description: 'Focus on business analytics, forecasting, machine learning, or AI-driven decision systems.', skills: ['Forecasting', 'ML', 'Business strategy'] }
        ]
    },
    'Cybersecurity': {
        match: '84%',
        symbol: '✣',
        color: 'purple',
        summary: 'Build secure systems with networking, digital forensics, and ethical hacking fundamentals.',
        overview: 'Cybersecurity is about protecting digital systems, networks, and confidential data from threats, vulnerabilities, and malicious attacks.',
        duration: '4 years for engineering or computer science, followed by certification paths.',
        bestCourses: ['B.Tech in Cybersecurity', 'B.Tech in CSE', 'B.Sc in Information Security', 'Diploma in Network Security'],
        examFocus: ['Networking', 'Operating systems', 'Linux', 'Ethical reasoning'],
        jobs: ['Cybersecurity Analyst', 'Ethical Hacker', 'SOC Analyst', 'Network Security Engineer'],
        skillAreas: ['Networking', 'Linux', 'Security tools', 'Forensics', 'Cloud security', 'Risk analysis'],
        firstSteps: ['Learn networking and Linux', 'Study system security basics', 'Practice hands-on lab exercises'],
        entryPreparation: ['Learn computer and network fundamentals', 'Get comfortable with Linux and operating-system concepts', 'Use only authorized training labs and systems you own'],
        practiceProjects: ['Monitor and summarize logs from a local lab', 'Write a security checklist for a personal device', 'Create an incident-response report from a safe sample dataset'],
        phases: [
            { step: 'NOW · 0–3 MONTHS', title: 'Learn the security basics', description: 'Study networking, Linux, operating system security, and cybersecurity fundamentals.', skills: ['Networking', 'Linux', 'Security basics'] },
            { step: 'NEXT · 3–9 MONTHS', title: 'Practice hands-on security', description: 'Work on labs covering web security, malware analysis, incident response and structured documentation.', skills: ['Labs', 'Threat analysis', 'Monitoring'] },
            { step: 'THEN · 9–18 MONTHS', title: 'Pick a security track', description: 'Specialize in ethical hacking, SOC operations, cloud security, or digital forensics.', skills: ['Ethical hacking', 'SOC', 'Cloud security'] }
        ]
    },
    'Product Design': {
        match: '72%',
        symbol: '✚',
        color: 'green',
        summary: 'Learn to design human-centered experiences by combining research, usability and visual thinking.',
        overview: 'Product design focuses on solving user problems through thoughtful interfaces, smooth experiences, and clear product decisions that balance function and emotion.',
        duration: '3–4 years of design-related studies plus portfolio work.',
        bestCourses: ['B.Des in Product Design', 'B.Des in Interaction Design', 'B.A in Design', 'UI/UX certificate programmes'],
        examFocus: ['Design thinking', 'Creativity', 'User research', 'Communication'],
        jobs: ['Product Designer', 'UX Designer', 'Interaction Designer', 'Design Researcher'],
        skillAreas: ['UX research', 'Wireframes', 'Prototyping', 'User testing', 'Visual design', 'Problem solving'],
        firstSteps: ['Learn user research basics', 'Practice wireframes and prototypes', 'Create 2 portfolio case studies'],
        entryPreparation: ['Practice observation, communication, and visual thinking', 'Check whether target programmes require an aptitude test or design portfolio', 'Collect feedback and show how it shaped design decisions'],
        practiceProjects: ['Redesign one everyday task after observing users', 'Prototype a simple student-planning feature', 'Write a case study with research, iterations, and usability findings'],
        phases: [
            { step: 'NOW · 0–3 MONTHS', title: 'Understand user needs', description: 'Study design principles, UX research, and basic wireframing to form good product instincts.', skills: ['UX research', 'Wireframes', 'Design thinking'] },
            { step: 'NEXT · 3–9 MONTHS', title: 'Build a design portfolio', description: 'Create case studies for mobile apps, dashboards, landing pages, and feature redesigns.', skills: ['Case studies', 'Prototyping', 'UI systems'] },
            { step: 'THEN · 9–18 MONTHS', title: 'Choose your design lane', description: 'Narrow into UX, product design, visual design, or interaction systems.', skills: ['UX', 'Interaction', 'Design systems'] }
        ]
    },
    'Biotechnology': {
        match: '68%',
        symbol: '✚',
        color: 'green',
        summary: 'Balance life sciences with research, experimentation, and innovation in healthcare or agriculture.',
        overview: 'Biotechnology blends biology, chemistry, and innovation to improve health, agriculture, sustainability, and industrial processes through scientific research.',
        duration: '3–5 years depending on the university and the specialisation chosen.',
        bestCourses: ['B.Sc in Biotechnology', 'B.Tech in Biotechnology', 'B.Pharm', 'Life sciences research programmes'],
        examFocus: ['Biology', 'Chemistry', 'Research writing', 'Analytical thinking'],
        jobs: ['Biotech Researcher', 'Lab Analyst', 'Clinical Research Associate', 'Bioprocess Engineer'],
        skillAreas: ['Biology', 'Chemistry', 'Lab methods', 'Research', 'Data analysis', 'Scientific communication'],
        firstSteps: ['Strengthen biology and chemistry', 'Read simple research papers', 'Practice lab-based observations'],
        entryPreparation: ['Study biology and chemistry for science-focused programmes', 'Check institution-specific subject and laboratory requirements', 'Build careful note-taking and scientific reading habits'],
        practiceProjects: ['Create a literature summary on a non-clinical topic', 'Analyze a small public biology dataset', 'Record a safe classroom observation with methods and limitations'],
        phases: [
            { step: 'NOW · 0–3 MONTHS', title: 'Build science foundations', description: 'Strengthen biology, chemistry, analytical thinking and scientific writing.', skills: ['Biology', 'Chemistry', 'Research'] },
            { step: 'NEXT · 3–9 MONTHS', title: 'Explore applied biotech', description: 'Practice labs, read research papers, and understand biotech tools used in healthcare or bioengineering.', skills: ['Lab work', 'Bioinformatics', 'Analysis'] },
            { step: 'THEN · 9–18 MONTHS', title: 'Focus on a domain', description: 'Choose genomics, healthcare biotech, pharmaceutical research, or agri-biotech.', skills: ['Genomics', 'Healthcare', 'Biotech labs'] }
        ]
    },
    'Digital Marketing': {
        match: '64%',
        symbol: '◉',
        color: 'orange',
        summary: 'Turn audience understanding into campaigns, brand strategy and measurable growth.',
        overview: 'Digital marketing connects ideas to audiences using content, analytics, advertising, brand strategy, and digital channels that create measurable growth.',
        duration: '3 years for most degrees plus practical growth and portfolio work.',
        bestCourses: ['BBA in Marketing', 'B.Com in Marketing', 'BA in Mass Communication', 'Digital marketing certification courses'],
        examFocus: ['Communication', 'Branding', 'Social media', 'Analytics'],
        jobs: ['Digital Marketing Executive', 'SEO Analyst', 'Brand Strategist', 'Performance Marketer'],
        skillAreas: ['SEO', 'Branding', 'Content strategy', 'Social media', 'Analytics', 'Campaign planning'],
        firstSteps: ['Learn social media and branding', 'Study SEO and content writing', 'Create 1 mock brand campaign'],
        entryPreparation: ['Build clear writing and audience research skills', 'Check programme requirements; many marketing routes accept varied academic streams', 'Practice reading campaign results and explaining what they mean'],
        practiceProjects: ['Plan a content calendar for a community organization', 'Create a sample SEO brief for a public-interest topic', 'Measure a mock campaign with clear, privacy-conscious metrics'],
        phases: [
            { step: 'NOW · 0–3 MONTHS', title: 'Learn core marketing', description: 'Cover branding, consumer psychology, SEO, social media and campaign basics.', skills: ['SEO', 'Branding', 'Content'] },
            { step: 'NEXT · 3–9 MONTHS', title: 'Create campaign experience', description: 'Run mock campaigns, content calendars, and paid marketing experiments.', skills: ['Campaigns', 'Analytics', 'Content strategy'] },
            { step: 'THEN · 9–18 MONTHS', title: 'Choose strategic depth', description: 'Move into performance marketing, brand marketing, analytics, or growth strategy.', skills: ['Growth', 'Analytics', 'Strategy'] }
        ]
    },
    'Software Developer': {
        match: '86%',
        symbol: '⌘',
        color: 'blue',
        summary: 'Learn to design, build, test, and maintain software people can rely on.',
        overview: 'Software development turns user and business needs into reliable applications, services, and tools through programming, collaboration, and iterative testing.',
        duration: '3–4 years for a degree, with continuous practice and portfolio projects.',
        bestCourses: ['B.Tech in Computer Science', 'B.Sc in Computer Science', 'BCA', 'Software development diploma programmes'],
        examFocus: ['Mathematics', 'Programming logic', 'Problem solving', 'Communication'],
        jobs: ['Software Developer', 'Backend Engineer', 'Frontend Developer', 'Quality Engineer'],
        skillAreas: ['Programming', 'Data structures', 'Version control', 'Testing', 'Databases', 'Teamwork'],
        firstSteps: ['Learn one programming language well', 'Practice data structures and debugging', 'Build and publish a small useful application'],
        entryPreparation: ['Review the subject requirements for target colleges', 'Practice logical reasoning and mathematics', 'Learn to explain technical decisions clearly'],
        practiceProjects: ['Build a task tracker with persistent storage', 'Create a small public API and document it', 'Add tests and accessibility to a simple web app'],
        phases: [
            { step: 'NOW · 0–3 MONTHS', title: 'Learn the programming basics', description: 'Choose one language and practise variables, functions, data structures, debugging, and version control.', skills: ['Programming', 'Git', 'Logic'] },
            { step: 'NEXT · 3–9 MONTHS', title: 'Build complete applications', description: 'Create small web or mobile apps that store data, handle errors, and are easy for another person to use.', skills: ['APIs', 'Databases', 'Testing'] },
            { step: 'THEN · 9–18 MONTHS', title: 'Develop an engineering focus', description: 'Explore frontend, backend, mobile, cloud, or quality engineering through projects and internships.', skills: ['Specialization', 'Portfolio', 'Collaboration'] }
        ]
    },
    'Financial Analyst': {
        match: '80%',
        symbol: '₹',
        color: 'orange',
        summary: 'Combine financial knowledge, quantitative analysis, and clear communication to support decisions.',
        overview: 'Financial analysts study company and market information, build forecasts, and explain financial risks and opportunities to decision-makers.',
        duration: '3–4 years for a finance, commerce, economics, or related degree.',
        bestCourses: ['B.Com in Finance', 'BBA in Finance', 'B.Sc in Economics', 'Finance and accounting programmes'],
        examFocus: ['Mathematics', 'Economics', 'Accounting', 'Written communication'],
        jobs: ['Financial Analyst', 'Investment Research Associate', 'Credit Analyst', 'Budget Analyst'],
        skillAreas: ['Accounting', 'Excel', 'Financial modelling', 'Statistics', 'Research', 'Communication'],
        firstSteps: ['Learn accounting and spreadsheet fundamentals', 'Follow a company and summarize its public reports', 'Practise explaining assumptions behind a simple forecast'],
        entryPreparation: ['Strengthen mathematics, economics, and written communication', 'Compare course prerequisites and professional qualification routes', 'Use public financial information for learning, not personal investment advice'],
        practiceProjects: ['Build a simple budget and variance dashboard', 'Compare public annual-report metrics across two companies', 'Create a forecast with clearly stated assumptions and risks'],
        phases: [
            { step: 'NOW · 0–3 MONTHS', title: 'Build finance foundations', description: 'Learn accounting basics, spreadsheet formulas, business vocabulary, and how to read public financial statements.', skills: ['Accounting', 'Excel', 'Economics'] },
            { step: 'NEXT · 3–9 MONTHS', title: 'Practise analysis', description: 'Create simple budgets, compare company performance, and explain the assumptions in your calculations.', skills: ['Analysis', 'Forecasting', 'Research'] },
            { step: 'THEN · 9–18 MONTHS', title: 'Choose a finance track', description: 'Explore corporate finance, risk, credit, investment research, or financial planning through supervised experience.', skills: ['Risk', 'Reporting', 'Specialization'] }
        ]
    },
    'Environmental Scientist': {
        match: '78%',
        symbol: '◌',
        color: 'green',
        summary: 'Use science, data, and field research to understand environmental challenges and solutions.',
        overview: 'Environmental scientists study ecosystems, pollution, climate, and resource use, then use evidence to inform conservation and public decisions.',
        duration: '3–4 years for an environmental science, biology, chemistry, or related degree.',
        bestCourses: ['B.Sc in Environmental Science', 'B.Sc in Biology', 'B.Sc in Chemistry', 'Environmental studies programmes'],
        examFocus: ['Biology', 'Chemistry', 'Geography', 'Statistics'],
        jobs: ['Environmental Scientist', 'Field Research Assistant', 'Environmental Consultant', 'Conservation Analyst'],
        skillAreas: ['Ecology', 'Field methods', 'Data analysis', 'GIS basics', 'Research writing', 'Communication'],
        firstSteps: ['Strengthen biology and earth science', 'Learn to record observations consistently', 'Explore local environmental data and public reports'],
        entryPreparation: ['Check science-subject requirements for each programme', 'Practise clear scientific writing and basic statistics', 'Follow safety guidance for any field or laboratory activity'],
        practiceProjects: ['Map local tree cover using public datasets', 'Summarize a public water-quality report', 'Track a local environmental indicator and document limitations'],
        phases: [
            { step: 'NOW · 0–3 MONTHS', title: 'Build the science base', description: 'Study biology, chemistry, earth systems, statistics, and careful observation methods.', skills: ['Biology', 'Ecology', 'Statistics'] },
            { step: 'NEXT · 3–9 MONTHS', title: 'Work with environmental evidence', description: 'Practise using public datasets, field notes, maps, and scientific sources to describe a local issue.', skills: ['Field methods', 'Data', 'GIS'] },
            { step: 'THEN · 9–18 MONTHS', title: 'Focus on an environmental area', description: 'Explore conservation, climate, water, environmental assessment, or sustainability research.', skills: ['Conservation', 'Climate', 'Research'] }
        ]
    }
};

const careerRoadmapAliases = {
    'Artificial Intelligence Engineer': 'Artificial Intelligence',
    'Data Scientist': 'Data Science',
    'Cybersecurity Analyst': 'Cybersecurity',
    'Product Designer': 'Product Design',
    'Biotechnology Researcher': 'Biotechnology'
};

const educationPathways = {
    after10: [{
            title: 'Science in Classes 11–12',
            icon: '⌘',
            color: 'blue',
            overview: 'Choose PCM for engineering and quantitative fields, PCB for health and life sciences, or PCMB if you want to keep both broad routes open.',
            duration: 'Usually 2 years before undergraduate study.',
            entry: 'Select subjects offered by your board and school. Check prerequisite subjects for future courses before choosing.',
            next: 'Engineering, medicine and health, basic sciences, agriculture, computing and research.',
            links: []
        },
        {
            title: 'Commerce in Classes 11–12',
            icon: '₹',
            color: 'orange',
            overview: 'Study accounting, business studies and economics. Mathematics or applied mathematics may be useful or required for some later programmes.',
            duration: 'Usually 2 years before undergraduate study.',
            entry: 'Compare the subject combinations available at your school and the prerequisites of target colleges.',
            next: 'B.Com., BBA, economics, finance, business analytics, law and entrepreneurship.',
            links: []
        },
        {
            title: 'Humanities / Arts in Classes 11–12',
            icon: '✦',
            color: 'coral',
            overview: 'Explore languages, history, political science, psychology, sociology, geography and creative subjects.',
            duration: 'Usually 2 years before undergraduate study.',
            entry: 'Subject availability varies by school. Build reading, writing, research and communication skills.',
            next: 'B.A., law, design, media, teaching, public policy, social work and civil-service preparation.',
            links: []
        },
        {
            title: 'Diploma / Polytechnic after Class 10',
            icon: '⚙',
            color: 'green',
            overview: 'A practical, branch-based technical qualification with classroom and workshop learning.',
            duration: 'Often 3 years; confirm the specific programme.',
            entry: 'Usually Class 10 completion; branch availability, marks and admission process differ by state.',
            next: 'Technician roles, apprenticeships, further study or eligible lateral entry to engineering degrees.',
            links: []
        },
        {
            title: 'ITI / Crafts training',
            icon: '⚒',
            color: 'orange',
            overview: 'Skill-focused training in trades such as electrician, fitter, welding, electronics, mechanic and computing.',
            duration: 'Commonly 1–2 years depending on trade.',
            entry: 'Entry class and trade eligibility vary. Check institute affiliation, trade availability and certification before enrolling.',
            next: 'Trade employment, apprenticeship, advanced skill training or further technical qualifications.',
            links: [{ label: 'Directorate General of Training', url: 'https://dgt.gov.in/' }]
        },
        {
            title: 'Vocational / skill pathway',
            icon: '✓',
            color: 'green',
            overview: 'Combine applied learning with industry skills in areas such as retail, tourism, healthcare support and IT.',
            duration: 'Varies by certificate, diploma and school programme.',
            entry: 'Ask how the qualification is recognized and whether credits can transfer into further study.',
            next: 'Employment, apprenticeship or progression to a related diploma or degree.',
            links: [{ label: 'National Council for Vocational Education and Training', url: 'https://ncvet.gov.in/' }]
        }
    ],
    after12: [{
            title: 'Engineering · B.E. / B.Tech',
            icon: '⌘',
            color: 'blue',
            overview: 'Choose a branch such as computer science, civil, mechanical, electrical, electronics, chemical or agricultural engineering.',
            duration: 'Typically 4 years.',
            entry: 'Most routes require Class 12 mathematics and physics; exact subject and marks criteria vary. JEE and state counselling are common routes.',
            next: 'Engineering roles, higher study, applied research or technology entrepreneurship.',
            links: [{ label: 'JEE Main information', url: 'https://jeemain.nta.nic.in/' }]
        },
        {
            title: 'Medicine · MBBS and related routes',
            icon: '✚',
            color: 'green',
            overview: 'MBBS is one medical route. Other healthcare study includes dentistry, AYUSH, physiotherapy, pharmacy and allied health; these have different eligibility and admission rules.',
            duration: 'MBBS is typically 5.5 years including internship; other courses vary.',
            entry: 'MBBS admission uses NEET-UG and counselling. Check each other course separately; do not assume every health degree has the same entrance exam.',
            next: 'Clinical practice after required training, specialization, public health or healthcare research.',
            links: [{ label: 'Official NEET-UG portal', url: 'https://neet.nta.nic.in/' }]
        },
        {
            title: 'Nursing · B.Sc. Nursing',
            icon: '✚',
            color: 'coral',
            overview: 'A professional undergraduate programme in patient care, community health and clinical practice.',
            duration: 'Typically 4 years.',
            entry: 'Class 12 science requirements and selection process vary by state and institution. Verify that the programme is recognized.',
            next: 'Registered nursing roles, community health, further specialization or graduate study.',
            links: [{ label: 'Indian Nursing Council recognized qualifications', url: 'https://www.indiannursingcouncil.org/universities-offering-recognized-nursing-qualification' }]
        },
        {
            title: 'General degrees · B.A. / B.Sc. / B.Com.',
            icon: '▤',
            color: 'orange',
            overview: 'Build subject depth in arts and humanities, science, commerce, mathematics, languages, economics or social sciences.',
            duration: 'Commonly 3–4 years depending on programme and university structure.',
            entry: 'Subject prerequisites and admission tests vary. Some degrees accept students from multiple Class 12 streams.',
            next: 'Employment, professional qualifications, postgraduate study, research or public-service exams.',
            links: [{ label: 'CUET-UG information', url: 'https://cuet.nta.nic.in/' }]
        },
        {
            title: 'Professional degrees · Law, design, architecture, business',
            icon: '✦',
            color: 'purple',
            overview: 'Options include integrated law, B.Des., B.Arch., BBA, BCA, pharmacy and other regulated or portfolio-based courses.',
            duration: 'Usually 3–5 years depending on the qualification.',
            entry: 'Law, architecture, design and pharmacy each have different subject rules, aptitude exams, entrance routes or portfolio requirements.',
            next: 'Professional roles, licensing or registration where required, further study and specialist work.',
            links: [{ label: 'CLAT admissions information', url: 'https://consortiumofnlus.ac.in/' }, { label: 'NATA information', url: 'https://www.nata.in/' }]
        },
        {
            title: 'Agriculture, forestry and environment',
            icon: '◌',
            color: 'green',
            overview: 'Study crop science, horticulture, forestry, food systems, conservation, environmental science or agricultural technology.',
            duration: 'Many undergraduate degrees are around 3–4 years; verify each course.',
            entry: 'Subject combinations and entrance routes vary by university, course and state counselling system.',
            next: 'Research, conservation, food and farming systems, environmental work or postgraduate study.',
            links: [{ label: 'University of Agricultural Sciences, Dharwad', url: 'https://uasd.edu/' }, { label: 'KSNUAHS programmes', url: 'https://uahs.edu.in/programmes/' }]
        },
        {
            title: 'Diploma and advanced skill programmes',
            icon: '⚙',
            color: 'blue',
            overview: 'Applied diplomas and certificates can provide a focused route into technical, creative or service careers.',
            duration: 'From a few months to several years.',
            entry: 'Check the awarding body, recognition, practical placement, fees and progression options.',
            next: 'Employment, apprenticeship, portfolio work or later entry to a degree where permitted.',
            links: [{ label: 'National Council for Vocational Education and Training', url: 'https://ncvet.gov.in/' }]
        }
    ],
    afterDegree: [{
            title: 'Postgraduate study',
            icon: '▤',
            color: 'blue',
            overview: 'A master’s degree can deepen a subject, support a career change or prepare for research and specialist roles.',
            duration: 'Commonly 1–2 years, depending on country and programme.',
            entry: 'Check required undergraduate subjects, grades, entrance tests, references, language scores and funding.',
            next: 'Specialist careers, research, teaching routes or doctoral study.',
            links: [{ label: 'National Scholarship Portal', url: 'https://scholarships.gov.in/' }]
        },
        {
            title: 'Professional conversion or specialization',
            icon: '⚙',
            color: 'purple',
            overview: 'Consider a recognized professional qualification, postgraduate diploma, teacher training, law degree or specialist certification.',
            duration: 'Ranges from short certificates to multi-year professional programmes.',
            entry: 'Confirm accreditation, supervised-practice requirements, licensing rules and whether the qualification is accepted by employers.',
            next: 'Professional registration where required, specialist practice or a transition into a new field.',
            links: [{ label: 'Indian Nursing Council', url: 'https://www.indiannursingcouncil.org/' }]
        },
        {
            title: 'Work, apprenticeship and portfolio',
            icon: '✓',
            color: 'green',
            overview: 'Apply for graduate roles, internships or apprenticeships and show evidence through projects, placements and work samples.',
            duration: 'Plan in cycles of applications, practical experience and skill development.',
            entry: 'Match your résumé and portfolio to role requirements; use official employer and apprenticeship portals.',
            next: 'Build experience, progress to specialist roles or return to study with a clearer goal.',
            links: [{ label: 'National Apprenticeship Training Scheme', url: 'https://nats.education.gov.in/' }, { label: 'National Career Service', url: 'https://www.ncs.gov.in/' }]
        },
        {
            title: 'Government and competitive examinations',
            icon: '§',
            color: 'orange',
            overview: 'Explore public-service, banking, teaching, research and other recruitment examinations that match your qualification.',
            duration: 'Preparation time varies; make a schedule based on the official syllabus and exam calendar.',
            entry: 'Age, degree subject, marks, category rules and attempts differ by examination. Read the current official notification.',
            next: 'Eligible government, public-sector, research or education roles.',
            links: [{ label: 'Union Public Service Commission', url: 'https://upsc.gov.in/' }, { label: 'Staff Selection Commission', url: 'https://ssc.gov.in/' }]
        }
    ]
};

function renderEducationPathways(stage = 'after10') {
    const grid = document.querySelector('#education-pathway-grid');
    const selectedTab = document.querySelector(`[data-pathway-stage="${stage}"]`);
    const pathways = educationPathways[stage] || educationPathways.after10;
    grid.innerHTML = pathways.map(pathway => `
        <article class="pathway-card">
            <span class="method-icon ${pathway.color}">${pathway.icon}</span>
            <h3>${escapeHTML(pathway.title)}</h3>
            <p>${escapeHTML(pathway.overview)}</p>
            <p><strong>Typical duration</strong>${escapeHTML(pathway.duration)}</p>
            <p><strong>Subjects and entry</strong>${escapeHTML(pathway.entry)}</p>
            <p><strong>Possible next steps</strong>${escapeHTML(pathway.next)}</p>
            ${pathway.links.length ? `<div class="pathway-links">${pathway.links.map(link => `<a href="${escapeHTML(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(link.label)} ↗</a>`).join('')}</div>` : ''}
        </article>
    `).join('');

    document.querySelectorAll('[data-pathway-stage]').forEach(tab => {
        const isSelected = tab === selectedTab;
        tab.classList.toggle('active', isSelected);
        tab.setAttribute('aria-selected', String(isSelected));
        tab.tabIndex = isSelected ? 0 : -1;
    });
    grid.setAttribute('aria-labelledby', selectedTab.id);
}

document.querySelectorAll('[data-pathway-stage]').forEach(tab => {
    tab.addEventListener('click', () => renderEducationPathways(tab.dataset.pathwayStage));
    tab.addEventListener('keydown', event => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        const tabs = [...document.querySelectorAll('[data-pathway-stage]')];
        const currentIndex = tabs.indexOf(tab);
        const offset = event.key === 'ArrowRight' ? 1 : -1;
        const nextTab = tabs[(currentIndex + offset + tabs.length) % tabs.length];
        nextTab.focus();
        nextTab.click();
    });
});

renderEducationPathways();

const careerResources = {
    'Artificial Intelligence': [
        { title: 'Python Tutorial', provider: 'Python.org', focus: 'Programming foundations', url: 'https://docs.python.org/3/tutorial/' },
        { title: 'Machine Learning Crash Course', provider: 'Google for Developers', focus: 'Core machine-learning concepts', url: 'https://developers.google.com/machine-learning/crash-course' },
        { title: 'scikit-learn User Guide', provider: 'scikit-learn', focus: 'Practical model building', url: 'https://scikit-learn.org/stable/user_guide.html' },
        { title: 'Hugging Face Course', provider: 'Hugging Face', focus: 'Natural language processing', url: 'https://huggingface.co/learn/nlp-course' }
    ],
    'Data Science': [
        { title: 'SQLBolt Lessons', provider: 'SQLBolt', focus: 'Interactive SQL fundamentals', url: 'https://sqlbolt.com/' },
        { title: 'Python Data Analysis', provider: 'Kaggle Learn', focus: 'Hands-on data analysis', url: 'https://www.kaggle.com/learn' },
        { title: 'pandas Getting Started', provider: 'pandas', focus: 'Data cleaning and analysis', url: 'https://pandas.pydata.org/docs/getting_started/index.html' },
        { title: 'Power BI Training', provider: 'Microsoft Learn', focus: 'Dashboards and reporting', url: 'https://learn.microsoft.com/training/powerplatform/power-bi/' }
    ],
    Cybersecurity: [
        { title: 'Introduction to Cybersecurity', provider: 'Cisco Skills for All', focus: 'Security foundations', url: 'https://skillsforall.com/course/introduction-to-cybersecurity' },
        { title: 'NICE Workforce Framework', provider: 'NIST', focus: 'Cybersecurity roles and skills', url: 'https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center' },
        { title: 'OWASP Top 10', provider: 'OWASP', focus: 'Common web application risks', url: 'https://owasp.org/www-project-top-ten/' },
        { title: 'Pre Security Learning Path', provider: 'TryHackMe', focus: 'Foundations in authorized practice labs', url: 'https://tryhackme.com/path/outline/presecurity' }
    ],
    'Product Design': [
        { title: 'Figma Learn', provider: 'Figma', focus: 'Interface design and prototyping', url: 'https://help.figma.com/hc/en-us/categories/360002051613-Learn-design' },
        { title: 'Material Design Guidelines', provider: 'Google', focus: 'Accessible interface patterns', url: 'https://m3.material.io/' },
        { title: '10 Usability Heuristics', provider: 'Nielsen Norman Group', focus: 'Usability review fundamentals', url: 'https://www.nngroup.com/articles/ten-usability-heuristics/' },
        { title: 'Design Kit', provider: 'IDEO.org', focus: 'Human-centered design methods', url: 'https://www.designkit.org/methods.html' }
    ],
    Biotechnology: [
        { title: 'Biology Library', provider: 'Khan Academy', focus: 'Biology foundations', url: 'https://www.khanacademy.org/science/biology' },
        { title: 'Bookshelf', provider: 'National Center for Biotechnology Information', focus: 'Open biomedical textbooks', url: 'https://www.ncbi.nlm.nih.gov/books/' },
        { title: 'Training', provider: 'EMBL-EBI', focus: 'Bioinformatics and life-science data', url: 'https://www.ebi.ac.uk/training/' },
        { title: 'iBiology', provider: 'iBiology', focus: 'Research talks and lab methods', url: 'https://www.ibiology.org/' }
    ],
    'Digital Marketing': [
        { title: 'Google Skillshop', provider: 'Google', focus: 'Google Ads and analytics training', url: 'https://skillshop.withgoogle.com/' },
        { title: 'SEO Starter Guide', provider: 'Google Search Central', focus: 'Search-friendly content basics', url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide' },
        { title: 'Digital Marketing Courses', provider: 'HubSpot Academy', focus: 'Content, email, and inbound strategy', url: 'https://academy.hubspot.com/courses/digital-marketing' },
        { title: 'Meta Blueprint', provider: 'Meta', focus: 'Social media marketing fundamentals', url: 'https://www.facebook.com/business/learn' }
    ],
    'Software Developer': [
        { title: 'Learn Web Development', provider: 'MDN', focus: 'HTML, CSS, and JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development' },
        { title: 'GitHub Skills', provider: 'GitHub', focus: 'Git and collaborative workflows', url: 'https://skills.github.com/' },
        { title: 'Python Tutorial', provider: 'Python.org', focus: 'Programming practice', url: 'https://docs.python.org/3/tutorial/' },
        { title: 'freeCodeCamp Curriculum', provider: 'freeCodeCamp', focus: 'Project-based web development', url: 'https://www.freecodecamp.org/learn/' }
    ],
    'Financial Analyst': [
        { title: 'Accounting and Financial Statements', provider: 'Khan Academy', focus: 'Accounting foundations', url: 'https://www.khanacademy.org/economics-finance-domain/core-finance/accounting-and-financial-stateme' },
        { title: 'Introduction to Financial Statements', provider: 'U.S. Securities and Exchange Commission', focus: 'Reading company reports', url: 'https://www.sec.gov/about/reports-publications/investorpubsbegfinstmtguidehtm' },
        { title: 'Excel Training', provider: 'Microsoft Support', focus: 'Spreadsheet skills', url: 'https://support.microsoft.com/excel' },
        { title: 'Investment Foundations', provider: 'CFA Institute', focus: 'Investment industry basics', url: 'https://www.cfainstitute.org/programs/investment-foundations' }
    ],
    'Environmental Scientist': [
        { title: 'Earthdata', provider: 'NASA', focus: 'Open Earth science data', url: 'https://www.earthdata.nasa.gov/' },
        { title: 'Environmental Topics', provider: 'U.S. Environmental Protection Agency', focus: 'Environmental science and policy', url: 'https://www.epa.gov/environmental-topics' },
        { title: 'QGIS Training Manual', provider: 'QGIS', focus: 'Mapping and spatial data', url: 'https://docs.qgis.org/latest/en/docs/training_manual/' },
        { title: 'Science Explorer', provider: 'U.S. Geological Survey', focus: 'Earth and ecosystem science', url: 'https://www.usgs.gov/science-explorer' }
    ]
};

function renderRoadmap(careerName = selectedCareer) {
    const roadmapKey = careerRoadmaps[careerName] ? careerName : careerRoadmapAliases[careerName] || careerName;
    const roadmap = careerRoadmaps[roadmapKey] || careerRoadmaps['Artificial Intelligence'];
    const resources = careerResources[roadmapKey] || [];
    const roadmapPanel = document.querySelector('.roadmap-panel');
    const intro = document.querySelector('#roadmap .subhead');
    const title = document.querySelector('#roadmap h1');
    const panelHeader = roadmapPanel.querySelector('.roadmap-header');
    const timeline = roadmapPanel.querySelector('.timeline');

    if (intro) intro.textContent = roadmap.summary;
    if (title) title.innerHTML = `From curious to <i>${careerName}</i>.`;

    if (panelHeader) {
        panelHeader.innerHTML = `
            <div>
                <span class="pill">${selectedCareerMatch ? `TOP MATCH · ${selectedCareerMatch}%` : `CAREER PATH · ${roadmap.match}`}</span>
                <h2>${careerName}</h2>
                <p>${roadmap.summary}</p>
            </div>
            <span class="career-symbol ${roadmap.color} large">${roadmap.symbol}</span>
        `;
    }

    const detailMarkup = `
        <div class="roadmap-details">
            <div class="detail-card">
                <h4>Career overview</h4>
                <p>${roadmap.overview}</p>
            </div>
            <div class="detail-card">
                <h4>Best study routes</h4>
                <ul>
                    ${roadmap.bestCourses.map(course => `<li>${course}</li>`).join('')}
                </ul>
            </div>
            <div class="detail-card">
                <h4>Typical duration</h4>
                <p>${roadmap.duration}</p>
            </div>
            <div class="detail-card">
                <h4>Exam focus</h4>
                <div class="roadmap-tags">
                    ${roadmap.examFocus.map(item => `<span>${item}</span>`).join('')}
                </div>
            </div>
            <div class="detail-card">
                <h4>Common roles</h4>
                <ul>
                    ${roadmap.jobs.map(job => `<li>${job}</li>`).join('')}
                </ul>
            </div>
            <div class="detail-card">
                <h4>Key skill areas</h4>
                <div class="roadmap-tags">
                    ${roadmap.skillAreas.map(item => `<span>${item}</span>`).join('')}
                </div>
            </div>
            <div class="detail-card">
                <h4>Start here</h4>
                <ul>
                    ${roadmap.firstSteps.map(step => `<li>${step}</li>`).join('')}
                </ul>
            </div>
            <div class="detail-card">
                <h4>Entry preparation</h4>
                <ul>
                    ${roadmap.entryPreparation.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
            <div class="detail-card">
                <h4>Practice projects</h4>
                <ul>
                    ${roadmap.practiceProjects.map(project => `<li>${project}</li>`).join('')}
                </ul>
            </div>
            <div class="detail-card resource-detail-card">
                <h4>Recommended resources</h4>
                <ul class="resource-list">
                    ${resources.map(resource => `<li><a href="${escapeHTML(resource.url)}" target="_blank" rel="noopener noreferrer"><span>${escapeHTML(resource.title)}</span><small>${escapeHTML(resource.provider)} · ${escapeHTML(resource.focus)}</small></a></li>`).join('')}
                </ul>
            </div>
        </div>
    `;

    const existingDetails = roadmapPanel.querySelector('.roadmap-details');
    if (existingDetails) existingDetails.remove();
    roadmapPanel.insertAdjacentHTML('beforeend', detailMarkup);

    if (timeline) {
        timeline.innerHTML = roadmap.phases.map((phase, index) => `
            <div class="timeline-item ${index === 1 ? 'current' : index < 1 ? 'done' : ''}">
                <span class="timeline-dot">${index < 1 ? '✓' : String(index + 1).padStart(2, '0')}</span>
                <div>
                    <small>${phase.step}</small>
                    <h3>${phase.title}</h3>
                    <p>${phase.description}</p>
                    <div class="roadmap-tags">
                        ${phase.skills.map(skill => `<span>${skill}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    selectedCareer = careerName;
}

document.querySelector('#download-roadmap-button').addEventListener('click', () => {
    const roadmapKey = careerRoadmaps[selectedCareer] ? selectedCareer : careerRoadmapAliases[selectedCareer] || selectedCareer;
    const roadmap = careerRoadmaps[roadmapKey] || careerRoadmaps['Artificial Intelligence'];
    const resources = careerResources[roadmapKey] || [];
    const contents = [
        `# ${selectedCareer} career roadmap`,
        '',
        roadmap.summary,
        '',
        '## Roadmap phases',
        ...roadmap.phases.flatMap(phase => [`### ${phase.step}: ${phase.title}`, phase.description, `Skills: ${phase.skills.join(', ')}`, '']),
        '## Recommended resources',
        ...resources.map(resource => `- [${resource.title}](${resource.url}) — ${resource.provider}: ${resource.focus}`),
        '',
        'Guidance is informational. Verify current course and admission requirements with each institution.'
    ].join('\n');
    const objectUrl = URL.createObjectURL(new Blob([contents], { type: 'text/markdown;charset=utf-8' }));
    const downloadLink = document.createElement('a');
    downloadLink.href = objectUrl;
    downloadLink.download = `${selectedCareer.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-roadmap.md`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    showToast('Roadmap downloaded.');
});

function showView(id) {
    views.forEach(view => view.classList.toggle('active-view', view.id === id));
    document.querySelectorAll('.nav-item[data-view]').forEach(item => item.classList.toggle('active', item.dataset.view === id));
    const label = viewLabels[id] || id.replace('-', ' ');
    document.querySelector('.breadcrumb strong').textContent = label.charAt(0).toUpperCase() + label.slice(1);
    if (id === 'roadmap') renderRoadmap(selectedCareer);
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    window.scrollTo({ top: 0, behavior });
}
navItems.forEach(item => item.addEventListener('click', event => {
    event.preventDefault();
    showView(item.dataset.view);
}));

function careerCard(career, featured = false) {
    const careerName = escapeHTML(career.name);
    const description = escapeHTML(career.description);
    const route = careerRoadmaps[career.name] || careerRoadmaps[careerRoadmapAliases[career.name]];
    const domain = career.domain || 'Career';
    const color = career.color || (route && route.color) || (domain === 'Business' ? 'orange' : domain === 'Design' || domain === 'Healthcare' || domain === 'Science' ? 'green' : 'blue');
    const symbol = career.symbol || (route && route.symbol) || (domain === 'Business' ? '₹' : domain === 'Design' || domain === 'Healthcare' ? '✚' : domain === 'Science' ? '◌' : '⌘');
    const scoreValue = career.fit_score !== undefined && career.fit_score !== null ? career.fit_score : career.match || 0;
    const score = Number(scoreValue);
    const scoreLabel = score ? `${Math.round(score)}% MATCH` : 'CAREER PATH';
    const duration = escapeHTML(career.education_duration || 'Varies by course');
    const salary = escapeHTML(career.salary_range || 'Varies by role');
    const careerDomain = escapeHTML(domain);
    const careerId = Number(career.id) || '';
    const isSaved = careerId && savedCareerIds.has(careerId);
    const fitAttribute = score ? `data-fit-score="${score}"` : '';

    return `<article class="career-card ${featured ? 'featured' : ''}"><div class="career-top"><span class="career-symbol ${color}">${symbol}</span><button class="save-button ${isSaved ? 'saved-state' : ''}" data-career-id="${careerId}" data-career-name="${careerName}" aria-label="${isSaved ? 'Remove' : 'Save'} ${careerName}" aria-pressed="${Boolean(isSaved)}">${isSaved ? '♥' : '♡'}</button></div><div class="match-score">${scoreLabel}</div><h4>${careerName}</h4><p>${description}</p><div class="career-meta"><span>${duration}</span><span>${careerDomain}</span><span>${salary}</span></div><button class="card-link" data-career="${careerName}" ${fitAttribute}>View career path <span>↗</span></button></article>`;
}

function renderCareerCards(container, list, featureFirst = false) {
    if (!container) return;
    container.innerHTML = list.map((career, index) => careerCard(career, featureFirst && index === 0)).join('');
}

const exploreGrid = document.querySelector('#explore-grid');
const recommendationGrid = document.querySelector('#recommendation-grid');
renderCareerCards(exploreGrid, careerRecords);
renderCareerCards(recommendationGrid, careerRecords.slice(0, 3), true);
document.querySelector('#career-search').addEventListener('input', event => {
    const query = event.target.value.toLowerCase();
    const matches = careerRecords.filter(career => `${career.name} ${career.domain} ${career.description}`.toLowerCase().includes(query));
    renderCareerCards(exploreGrid, matches);
    if (!matches.length) exploreGrid.innerHTML = '<p class="subhead">No careers found. Try a subject or skill.</p>';
});

function updateSaveButtons() {
    document.querySelectorAll('.save-button[data-career-id]').forEach(button => {
        const isSaved = savedCareerIds.has(Number(button.dataset.careerId));
        button.classList.toggle('saved-state', isSaved);
        button.textContent = isSaved ? '♥' : '♡';
        button.setAttribute('aria-pressed', String(isSaved));
        button.setAttribute('aria-label', `${isSaved ? 'Remove' : 'Save'} ${button.dataset.careerName}`);
    });
}

function renderSavedCareers(savedCareers) {
    const savedList = document.querySelector('#saved-careers-list');
    if (!savedList) return;
    if (!localStorage.getItem('careerCompassAccessToken')) {
        savedList.innerHTML = '<p class="saved-note">Sign in to save and sync career paths.</p>';
        return;
    }
    if (!savedCareers.length) {
        savedList.innerHTML = '<p class="saved-note">Your shortlist is empty. Save a career to keep it here.</p>';
        return;
    }

    savedList.innerHTML = savedCareers.map(career => {
        const route = careerRoadmaps[career.name] || careerRoadmaps[careerRoadmapAliases[career.name]];
        const color = (route && route.color) || 'blue';
        const symbol = (route && route.symbol) || '⌘';
        const name = escapeHTML(career.name);
        return `<div class="saved-row"><span class="career-symbol ${color}">${symbol}</span><div><h3>${name}</h3><p>${escapeHTML(career.domain)} · ${escapeHTML(career.salary_range)}</p><button class="save-button saved-state" data-career-id="${career.id}" data-career-name="${name}" aria-label="Remove ${name}" aria-pressed="true">♥</button></div><span class="saved-note">Saved to your shortlist</span><button class="card-link" data-career="${name}">Open ↗</button></div>`;
    }).join('');
}

function updateSavedCareerCount(count) {
    const navCount = document.querySelector('#nav-saved-career-count');
    const overviewCount = document.querySelector('#saved-career-count');
    if (navCount) navCount.textContent = String(count);
    if (overviewCount) overviewCount.textContent = String(count);
}

async function loadSavedCareers() {
    if (!localStorage.getItem('careerCompassAccessToken')) {
        savedCareerIds = new Set();
        updateSavedCareerCount(0);
        renderSavedCareers([]);
        return;
    }
    const savedCareers = await apiRequest('/saved-careers');
    savedCareerIds = new Set(savedCareers.map(career => Number(career.id)));
    updateSavedCareerCount(savedCareers.length);
    renderSavedCareers(savedCareers);
    updateSaveButtons();
}

async function toggleSavedCareer(button) {
    if (!localStorage.getItem('careerCompassAccessToken')) {
        showToast('Sign in to save careers to your shortlist.');
        showView('student-login');
        return;
    }
    const careerName = button.dataset.careerName;
    const matchedCareer = careerRecords.find(career => career.name === careerName);
    const careerId = Number(button.dataset.careerId) || Number(matchedCareer && matchedCareer.id);
    if (!careerId) {
        showToast('This career is not available in the service catalog.');
        return;
    }
    const isSaved = savedCareerIds.has(careerId);
    try {
        await apiRequest(`/saved-careers/${careerId}`, { method: isSaved ? 'DELETE' : 'POST' });
        if (isSaved) savedCareerIds.delete(careerId);
        else savedCareerIds.add(careerId);
        updateSaveButtons();
        await loadSavedCareers();
        showToast(isSaved ? 'Career removed from your shortlist.' : 'Career saved to your shortlist.');
    } catch (error) {
        showToast(error.message);
    }
}

document.addEventListener('click', async event => {
    const save = event.target.closest('.save-button');
    if (save) {
        event.preventDefault();
        await toggleSavedCareer(save);
        return;
    }

    const careerButton = event.target.closest('[data-career]');
    if (careerButton) {
        const careerName = careerButton.dataset.career;
        if (careerName) {
            selectedCareer = careerName;
            selectedCareerMatch = Number(careerButton.dataset.fitScore) || null;
            renderRoadmap(careerName);
            showView('roadmap');
        }
    }
});
document.querySelectorAll('.choice').forEach(choice => choice.addEventListener('click', () => choice.classList.toggle('selected')));

const stagePathways = {
    'Class 10': [
        { title: 'PU Science · PCM', subjects: ['Mathematics', 'Physics', 'Computer Science'], summary: 'A two-year PU route with physics, chemistry and mathematics for engineering, computing, architecture and quantitative degrees.', exams: 'KCET or JEE may apply later for engineering; architecture has separate admission rules.' },
        { title: 'PU Science · PCB / PCMB', subjects: ['Biology', 'Physics'], summary: 'A two-year PU route with biology for medicine, nursing, allied health, biotechnology, agriculture and life sciences.', exams: 'NEET-UG for MBBS; nursing and agriculture admissions use their own current rules.' },
        { title: 'PU Commerce', subjects: ['Economics'], summary: 'Accounting, economics and business studies prepare for B.Com., BBA, finance, management and entrepreneurship.', exams: 'Many programmes use merit or university selection; check each college.' },
        { title: 'PU Humanities / Arts', subjects: ['Design', 'Economics'], summary: 'Languages and social sciences can lead to arts, law, design, media, policy and public-service pathways.', exams: 'Law and design may require separate entrance tests, aptitude tests or portfolios.' },
        { title: 'Diploma / Polytechnic', subjects: ['Mathematics', 'Physics', 'Computer Science'], summary: 'A practical technical diploma after Class 10 can lead to technician work, apprenticeships or eligible engineering lateral entry.', exams: 'Karnataka DTE publishes diploma admissions; DCET is used for eligible lateral-entry routes.' },
        { title: 'ITI / Skill trade', subjects: [], summary: 'Trade-based training such as electrician, fitter, mechanic, electronics or computing focuses on practical skills and workshop experience.', exams: 'Trade eligibility and admission vary by institute; verify NCVT/SCVT recognition.' }
    ],
    'Class 12 / PUC': [
        { title: 'Engineering · B.E. / B.Tech', subjects: ['Mathematics', 'Physics', 'Computer Science'], summary: 'Choose a branch such as computer science, civil, electronics, mechanical or agricultural engineering.', exams: 'KCET for Karnataka counselling and JEE for participating national institutes; rules vary.' },
        { title: 'Medical · MBBS and health', subjects: ['Biology', 'Physics'], summary: 'Compare MBBS with nursing, pharmacy, physiotherapy, AYUSH and allied-health courses; these are different programmes.', exams: 'NEET-UG for MBBS. Other health courses may use CET, merit or institution-specific selection.' },
        { title: 'Agriculture & forestry', subjects: ['Biology', 'Mathematics', 'Physics'], summary: 'Farm universities offer agriculture, horticulture and forestry degrees, with course-specific subject and quota routes.', exams: 'Karnataka farm-university admissions use KEA CET (PCMB); ICAR and farmer quota have separate rules.' },
        { title: 'Nursing · B.Sc. Nursing', subjects: ['Biology'], summary: 'A professional undergraduate route into clinical and community care; check programme recognition and seat category.', exams: 'KEA CET/UGCET or state/institution process as published for the current year.' },
        { title: 'Commerce, arts & professional degrees', subjects: ['Economics', 'Design'], summary: 'B.Com., BBA, B.A., law, design, BCA and other degrees can accept different subject combinations.', exams: 'Admission may use merit, CUET, CLAT, aptitude tests or portfolios depending on course.' },
        { title: 'Diploma / ITI / apprenticeship', subjects: [], summary: 'Applied skills, diplomas and apprenticeship routes remain options after Class 12 too.', exams: 'Check the trade or course entry rules and recognized awarding body.' }
    ],
    'afterDegree': [
        { title: 'Postgraduate study', subjects: [], summary: 'A master’s can deepen subject expertise, support a career change or prepare for research.', exams: 'Entrance tests and subject prerequisites depend on programme and university.' },
        { title: 'Professional qualification', subjects: [], summary: 'Consider accredited professional training, a conversion degree or specialist certification for a clear target role.', exams: 'Confirm licensing, accreditation and supervised-practice requirements with the regulator.' },
        { title: 'Work, internship or apprenticeship', subjects: [], summary: 'Build practical evidence through entry-level roles, placements, projects or apprenticeships.', exams: 'Use employer and government apprenticeship portals; tailor applications to role requirements.' },
        { title: 'Competitive examinations', subjects: [], summary: 'Government, banking, teaching and research examinations can be options depending on your qualification.', exams: 'Always read the current official notification for age, subject, marks and attempt rules.' }
    ]
};

const collegeOptions = [
    { name: 'Karnataka PU College Directory', program: 'PU Science, Commerce and Arts', type: 'Government directory · public and private', city: 'Karnataka', stages: ['Class 10'], subjects: [], exams: [], url: 'https://dpue-pragathi.karnataka.gov.in/college_mst/College_Details' },
    { name: 'Karnataka Diploma / Polytechnic Directory', program: 'Diploma engineering and technology', type: 'Government directory · public and private', city: 'Karnataka', stages: ['Class 10', 'Class 12 / PUC'], subjects: ['Mathematics', 'Physics', 'Computer Science'], exams: ['KCET'], url: 'https://dtek.karnataka.gov.in/english', cutoffUrl: 'https://cetonline.karnataka.gov.in/kea/ugcet2025' },
    { name: 'NCVT MIS ITI Directory', program: 'ITI trades and crafts training', type: 'Government directory · public and private', city: 'India', stages: ['Class 10', 'Class 12 / PUC'], subjects: [], exams: [], url: 'https://www.ncvtmis.gov.in/' },
    { name: 'University Visvesvaraya College of Engineering', program: 'B.E. engineering', type: 'Public', city: 'Bengaluru', stages: ['Class 12 / PUC'], subjects: ['Mathematics', 'Physics', 'Computer Science'], exams: ['KCET'], url: 'https://uvce.ac.in/', cutoffUrl: 'https://cetonline.karnataka.gov.in/kea/ugcet2025' },
    { name: 'National Institute of Technology Karnataka', program: 'B.Tech engineering', type: 'Central public institute', city: 'Surathkal', stages: ['Class 12 / PUC'], subjects: ['Mathematics', 'Physics', 'Computer Science'], exams: ['JEE'], url: 'https://www.nitk.ac.in/', cutoffUrl: 'https://josaa.nic.in/' },
    { name: 'Indian Institute of Technology Dharwad', program: 'B.Tech engineering', type: 'Central public institute', city: 'Dharwad', stages: ['Class 12 / PUC'], subjects: ['Mathematics', 'Physics', 'Computer Science'], exams: ['JEE'], url: 'https://iitdh.ac.in/', cutoffUrl: 'https://josaa.nic.in/' },
    { name: 'Bangalore Medical College and Research Institute', program: 'MBBS', type: 'Government', city: 'Bengaluru', stages: ['Class 12 / PUC'], subjects: ['Biology', 'Physics'], exams: ['NEET'], url: 'https://bmcri.karnataka.gov.in/', cutoffUrl: 'https://cetonline.karnataka.gov.in/kea/ugneet2025' },
    { name: 'JSS Medical College', program: 'MBBS', type: 'Private · deemed university', city: 'Mysuru', stages: ['Class 12 / PUC'], subjects: ['Biology', 'Physics'], exams: ['NEET'], url: 'https://jssuni.edu.in/jssaher/medical-college/medical-college-home.html', cutoffUrl: 'https://mcc.nic.in/ug-medical-counselling/' },
    { name: 'Karnataka B.Sc. Nursing College List', program: 'B.Sc. Nursing', type: 'Government directory · public and private', city: 'Karnataka', stages: ['Class 12 / PUC'], subjects: ['Biology'], exams: ['KCET'], url: 'https://cetonline.karnataka.gov.in/kea/ugcet2026', cutoffUrl: 'https://cetonline.karnataka.gov.in/kea/ugcet2025' },
    { name: 'University of Agricultural Sciences, Dharwad', program: 'B.Sc. Agriculture and Forestry', type: 'Public farm university', city: 'Dharwad', stages: ['Class 12 / PUC'], subjects: ['Biology', 'Mathematics', 'Physics'], exams: ['KCET', 'ICAR'], url: 'https://uasd.edu/', cutoffUrl: 'https://sites.google.com/a/uasd.in/admission/ug-admissions' },
    { name: 'Keladi Shivappa Nayaka University of Agricultural and Horticultural Sciences', program: 'B.Sc. Agriculture, Horticulture and Forestry', type: 'Public farm university', city: 'Shivamogga', stages: ['Class 12 / PUC'], subjects: ['Biology', 'Mathematics', 'Physics'], exams: ['KCET', 'ICAR'], url: 'https://uahs.edu.in/programmes/', cutoffUrl: 'https://cetonline.karnataka.gov.in/kea/ugcet2025' },
    { name: 'IIM Bangalore · BBA in Digital Business and Entrepreneurship', program: 'BBA', type: 'Public institute', city: 'Bengaluru', stages: ['Class 12 / PUC'], subjects: ['Economics', 'Mathematics'], exams: [], url: 'https://dbe.iimb.ac.in/' },
    { name: 'Dr. Manmohan Singh Bengaluru City University', program: 'B.A., B.Com. and other undergraduate degrees', type: 'Public university', city: 'Bengaluru', stages: ['Class 12 / PUC'], subjects: ['Economics', 'Design'], exams: [], url: 'https://bcu.ac.in/' },
    { name: 'National Law School of India University', program: 'B.A. LL.B. (Hons)', type: 'Public university', city: 'Bengaluru', stages: ['Class 12 / PUC'], subjects: ['Economics', 'Design'], exams: ['CLAT'], url: 'https://www.nls.ac.in/programme/ba-llb-hons/', cutoffUrl: 'https://consortiumofnlus.ac.in/' },
    { name: 'Srishti Manipal Institute of Art, Design and Technology', program: 'B.Des. and creative programmes', type: 'Private', city: 'Bengaluru', stages: ['Class 12 / PUC'], subjects: ['Design'], exams: [], url: 'https://srishtimanipalinstitute.in/academics-overview/programs-courses/4-year-ug-professional-program/' },
    { name: 'National Law School of India University · 3-Year LL.B.', program: 'LL.B. (Hons)', type: 'Public university', city: 'Bengaluru', stages: ['afterDegree'], subjects: [], exams: [], url: 'https://www.nls.ac.in/programme/3-year-llb-hons/' },
    { name: 'IIM Bangalore · MBA programmes', program: 'MBA / postgraduate management', type: 'Public institute', city: 'Bengaluru', stages: ['afterDegree'], subjects: [], exams: ['CAT'], url: 'https://www.iimb.ac.in/programmes/pgp' },
    { name: 'University of Agricultural Sciences, Dharwad · Postgraduate', program: 'M.Sc. Agriculture and Forestry', type: 'Public farm university', city: 'Dharwad', stages: ['afterDegree'], subjects: [], exams: [], url: 'https://uasd.edu/' }
];

function getCollegeSuggestions(assessment, stageKey, subjects) {
    const enteredRankExams = [];
    if (assessment.kcetRank) enteredRankExams.push('KCET');
    if (assessment.neetRank) enteredRankExams.push('NEET');

    return collegeOptions
        .filter(college => college.stages.includes(stageKey))
        .map(college => {
            const matchedSubjects = college.subjects.filter(subject => subjects.includes(subject));
            const matchingRankExam = college.exams.find(exam => enteredRankExams.includes(exam));
            const matchScore = matchedSubjects.length * 2 + (matchingRankExam ? 3 : 0);
            return { ...college, matchedSubjects, matchingRankExam, matchScore };
        })
        .sort((first, second) => second.matchScore - first.matchScore || first.name.localeCompare(second.name))
        .slice(0, 8);
}

function renderAssessmentGuidance(assessment, recommendations = []) {
    const container = document.querySelector('#assessment-guidance');
    const stage = assessment.educationLevel || 'Class 12 / PUC';
    const stageKey = stage === 'Class 10' ? 'Class 10' : stage === 'afterDegree' || stage === 'Degree completed' || stage === 'Undergraduate' ? 'afterDegree' : 'Class 12 / PUC';
    const subjects = Array.isArray(assessment.subjects) ? assessment.subjects : [];
    const pathways = [...stagePathways[stageKey]].sort((first, second) => {
        const firstMatches = first.subjects.filter(subject => subjects.includes(subject)).length;
        const secondMatches = second.subjects.filter(subject => subjects.includes(subject)).length;
        return secondMatches - firstMatches;
    });
    const collegeSuggestions = getCollegeSuggestions(assessment, stageKey, subjects);
    const markSummary = [
        assessment.class10Percent ? `Class 10: ${escapeHTML(assessment.class10Percent)}%` : '',
        assessment.class12Percent ? `Class 12 / PUC: ${escapeHTML(assessment.class12Percent)}%` : ''
    ].filter(Boolean).join(' · ');
    const rankLinks = [];

    if (assessment.kcetRank) {
        rankLinks.push(`<a href="https://cetonline.karnataka.gov.in/kea/ugcet2025" target="_blank" rel="noopener noreferrer">Compare KCET rank ${escapeHTML(assessment.kcetRank)} with KEA 2025 cutoff and allotment notices ↗</a>`);
    }
    if (assessment.neetRank) {
        rankLinks.push(`<a href="https://cetonline.karnataka.gov.in/kea/ugneet2025" target="_blank" rel="noopener noreferrer">Compare NEET rank ${escapeHTML(assessment.neetRank)} with Karnataka UGNEET 2025 notices ↗</a>`);
        rankLinks.push('<a href="https://mcc.nic.in/ug-medical-counselling/" target="_blank" rel="noopener noreferrer">Check MCC All India counselling notices ↗</a>');
    }

    const routeMarkup = pathways.map(pathway => `
        <article class="assessment-route-card">
            <h3>${escapeHTML(pathway.title)}</h3>
            <p>${escapeHTML(pathway.summary)}</p>
            <p><strong>Entrance / selection</strong>${escapeHTML(pathway.exams)}</p>
        </article>
    `).join('');
    const recommendationMarkup = recommendations.length
        ? `<h2>Career matches from your profile</h2><div class="career-grid">${recommendations.slice(0, 3).map((career, index) => careerCard(career, index === 0)).join('')}</div>`
        : '<p>Sign in to calculate and sync personalized career matches. Pathway suggestions above are available without an account.</p>';
    const collegeMarkup = collegeSuggestions.map(college => {
        const reasons = college.matchedSubjects.length ? `Interest overlap: ${college.matchedSubjects.map(escapeHTML).join(', ')}` : 'Related next-step option';
        const enteredRank = college.matchingRankExam === 'KCET' ? assessment.kcetRank : assessment.neetRank;
        const rankContext = [assessment.admissionCategory, assessment.seatQuota].filter(Boolean).map(escapeHTML).join(' · ');
        const rankNote = college.matchingRankExam ? `${college.matchingRankExam} rank ${escapeHTML(enteredRank)} entered${rankContext ? ` · ${rankContext}` : ''}. Compare with the official cutoff for the exact year and counselling round.` : '';
        return `<article class="assessment-route-card"><h3>${escapeHTML(college.name)}</h3><p><strong>${escapeHTML(college.type)} · ${escapeHTML(college.city)}</strong></p><p>${escapeHTML(college.program)} · ${reasons}</p>${rankNote ? `<p>${escapeHTML(rankNote)}</p>` : ''}<a href="${escapeHTML(college.url)}" target="_blank" rel="noopener noreferrer">Official institution / directory ↗</a>${college.cutoffUrl ? `<a href="${escapeHTML(college.cutoffUrl)}" target="_blank" rel="noopener noreferrer">Cutoff / counselling records ↗</a>` : ''}</article>`;
    }).join('');

    container.innerHTML = `
        <p class="kicker">YOUR NEXT-STEP GUIDE</p>
        <h2>Routes to explore after ${escapeHTML(stage)}${markSummary ? ` · ${markSummary}` : ''}</h2>
        <p>These suggestions use your selected interests and current stage. Marks help you organize your profile, but eligibility depends on the specific board, course, category and institution.</p>
        ${subjects.length ? `<p><strong>Your selected interests:</strong> ${subjects.map(escapeHTML).join(', ')}</p>` : ''}
        <div class="assessment-route-grid">${routeMarkup}</div>
        <div class="assessment-college-results"><h2>College suggestions to explore</h2><p>Sorted by selected-subject overlap and the entrance exam you entered. These are exploratory matches, not admission chances; verify course, seat quota and eligibility with each institution.</p><div class="assessment-route-grid">${collegeMarkup}</div></div>
        ${rankLinks.length ? `<div class="cutoff-guidance"><h3>Historical cutoff comparison</h3><p>Your rank is not a guaranteed admission prediction. Compare the same course, college, category, quota and counselling round. The official tables are year-specific.</p>${rankLinks.join('')}</div>` : '<p class="assessment-data-note">Add a KCET or NEET rank to get links to the relevant official previous-year cutoff notices. Exact college matching requires category, quota, round and course-specific cutoff data.</p>'}
        <div class="assessment-recommendations">${recommendationMarkup}</div>
    `;
    container.hidden = false;
}

document.querySelector('#assessment-form').addEventListener('submit', async event => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const subjects = formData.getAll('subjects');
    const workPreferences = formData.getAll('workPreference');
    const assessment = {
        educationLevel: formData.get('educationLevel'),
        class10Percent: formData.get('class10Percent'),
        class12Percent: formData.get('class12Percent'),
        kcetRank: formData.get('kcetRank'),
        neetRank: formData.get('neetRank'),
        admissionCategory: formData.get('admissionCategory'),
        seatQuota: formData.get('seatQuota'),
        subjects,
        interests: subjects,
        work_preference: workPreferences.join(', ')
    };
    localStorage.setItem('careerCompassAssessment', JSON.stringify(assessment));

    if (!localStorage.getItem('careerCompassAccessToken')) {
        renderAssessmentGuidance(assessment);
        showToast('Assessment saved on this device. Sign in to sync career matches.');
        return;
    }

    try {
        await apiRequest('/profile', { method: 'PUT', body: JSON.stringify(assessment) });
        const recommendations = await loadAuthenticatedData();
        renderAssessmentGuidance(assessment, recommendations);
        showToast('Assessment saved and matches refreshed.');
    } catch (error) {
        renderAssessmentGuidance(assessment);
        showToast(error.message);
    }
});

const savedAssessment = JSON.parse(localStorage.getItem('careerCompassAssessment') || 'null');
if (savedAssessment) {
    const assessmentForm = document.querySelector('#assessment-form');
    for (const fieldName of ['educationLevel', 'class10Percent', 'class12Percent', 'kcetRank', 'neetRank', 'admissionCategory', 'seatQuota']) {
        const field = assessmentForm.elements[fieldName];
        if (field && savedAssessment[fieldName] !== undefined && savedAssessment[fieldName] !== null) field.value = savedAssessment[fieldName];
    }
    assessmentForm.querySelectorAll('[name="subjects"], [name="workPreference"]').forEach(input => {
        const selectedValues = input.name === 'subjects' ? savedAssessment.subjects || [] : (savedAssessment.work_preference || '').split(', ');
        input.checked = selectedValues.includes(input.value);
        input.closest('.choice').classList.toggle('selected', input.checked);
    });
    renderAssessmentGuidance(savedAssessment);
}

renderRoadmap(selectedCareer);

const studentProfileForm = document.querySelector('#student-profile-form');
const studentProfileFields = studentProfileForm.querySelectorAll('input, select');
const savedStudentProfile = JSON.parse(localStorage.getItem('careerCompassStudentProfile') || '{}');

function applyProfileToForm(profile) {
    const fieldAliases = {
        standard: 'educationLevel',
        dateOfBirth: 'dateOfBirth',
        phone: 'phone',
        completionYear: 'completionYear',
        studyLocation: 'studyLocation'
    };
    studentProfileFields.forEach(field => {
        const key = fieldAliases[field.name] || field.name;
        const value = profile[key] !== undefined && profile[key] !== null ? profile[key] : profile[field.name];
        if (value !== undefined && value !== null) field.value = Array.isArray(value) ? value.join(', ') : value;
    });
}

applyProfileToForm(savedStudentProfile);

function updateStudentSummary(profile) {
    const profileName = document.querySelector('.profile-mini strong');
    const profileDetails = document.querySelector('.profile-mini div:nth-child(2) span');
    const avatar = document.querySelector('.profile-mini .avatar');
    const fullName = profile.fullName || profile.full_name;
    const standard = profile.standard || profile.educationLevel || profile.education_level;
    if (fullName) {
        profileName.textContent = fullName;
        avatar.textContent = fullName.split(/\s+/).filter(Boolean).slice(0, 2).map(name => name[0]).join('').toUpperCase();
    }
    if (standard || profile.stream) profileDetails.textContent = [standard, profile.stream].filter(Boolean).join(' · ');
    const completionFields = [fullName, standard, profile.stream, profile.board, profile.institution, profile.subjects, profile.careerGoal];
    const completedFields = completionFields.filter(value => Array.isArray(value) ? value.length > 0 : Boolean(value)).length;
    const completionStat = document.querySelector('#profile-completion-stat');
    if (completionStat) completionStat.textContent = `${Math.round(completedFields / completionFields.length * 100)}%`;
}

updateStudentSummary(savedStudentProfile);
studentProfileForm.addEventListener('submit', async event => {
    event.preventDefault();
    const formValues = Object.fromEntries(new FormData(studentProfileForm));
    const profile = {
        fullName: formValues.fullName,
        dateOfBirth: formValues.dateOfBirth,
        gender: formValues.gender,
        phone: formValues.phone,
        educationLevel: formValues.standard,
        stream: formValues.stream,
        board: formValues.board,
        institution: formValues.institution,
        completionYear: formValues.completionYear,
        studyLocation: formValues.studyLocation,
        location: formValues.location,
        subjects: formValues.subjects.split(',').map(subject => subject.trim()).filter(Boolean),
        careerGoal: formValues.careerGoal
    };
    localStorage.setItem('careerCompassStudentProfile', JSON.stringify({ ...formValues, subjects: profile.subjects }));
    updateStudentSummary(profile);
    if (!localStorage.getItem('careerCompassAccessToken')) {
        showToast('Saved on this device. Sign in to sync your profile.');
        return;
    }
    try {
        await apiRequest('/profile', { method: 'PUT', body: JSON.stringify(profile) });
        showToast('Student profile synced successfully.');
    } catch (error) {
        showToast(error.message);
    }
});

const studentLoginForm = document.querySelector('#student-login-form');
const loginMessage = document.querySelector('#login-message');
const studentRegisterForm = document.querySelector('#student-register-form');
const registerMessage = document.querySelector('#register-message');

document.querySelectorAll('[data-auth-mode]').forEach(button => button.addEventListener('click', () => {
    const registerMode = button.dataset.authMode === 'register';
    studentLoginForm.hidden = registerMode;
    studentRegisterForm.hidden = !registerMode;
}));

async function loadCareerCatalog() {
    try {
        careerRecords = await apiRequest('/careers');
        renderCareerCards(exploreGrid, careerRecords);
    } catch (error) {
        console.warn('Career catalog could not be loaded:', error.message);
    }
}

async function loadAuthenticatedData() {
    const [profile, recommendations] = await Promise.all([
        apiRequest('/profile'),
        apiRequest('/recommendations')
    ]);
    applyProfileToForm(profile);
    updateStudentSummary(profile);
    renderCareerCards(recommendationGrid, recommendations.slice(0, 3), true);
    const matchCount = document.querySelector('#career-match-count');
    if (matchCount) matchCount.textContent = String(recommendations.length);
    await loadSavedCareers();
    return recommendations;
}

studentLoginForm.addEventListener('submit', async event => {
    event.preventDefault();
    loginMessage.textContent = 'Signing in...';
    loginMessage.style.color = '#688278';
    const credentials = Object.fromEntries(new FormData(studentLoginForm));
    try {
        const result = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        localStorage.setItem('careerCompassAccessToken', result.access_token);
        studentProfileForm.elements.email.value = result.user.email;
        await loadAuthenticatedData();
        loginMessage.textContent = `Welcome back, ${result.user.name}.`;
        showToast('Student login successful.');
        showView('overview');
    } catch (error) {
        loginMessage.style.color = '#bd5d4d';
        loginMessage.textContent = error.message === 'Failed to fetch' ? 'The student service is unavailable. Start the backend and try again.' : error.message;
    }
});

studentRegisterForm.addEventListener('submit', async event => {
    event.preventDefault();
    registerMessage.textContent = 'Creating your student account...';
    registerMessage.style.color = '#688278';
    const registration = Object.fromEntries(new FormData(studentRegisterForm));
    if (registration.password !== registration.confirmPassword) {
        registerMessage.style.color = '#bd5d4d';
        registerMessage.textContent = 'Passwords do not match.';
        return;
    }
    try {
        const result = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name: registration.name, email: registration.email, password: registration.password })
        });
        localStorage.setItem('careerCompassAccessToken', result.access_token);
        await apiRequest('/profile', {
            method: 'PUT',
            body: JSON.stringify({ fullName: registration.name, educationLevel: registration.education_level, stream: registration.stream })
        });
        studentProfileForm.elements.email.value = result.user.email;
        await loadAuthenticatedData();
        registerMessage.textContent = 'Account created. Opening your student dashboard...';
        showToast('Student account created successfully.');
        updateStudentSummary({ fullName: result.user.name, standard: registration.education_level, stream: registration.stream });
        showView('overview');
    } catch (error) {
        registerMessage.style.color = '#bd5d4d';
        registerMessage.textContent = error.message === 'Failed to fetch' ? 'The student service is unavailable. Start the backend and try again.' : error.message;
    }
});

async function initializeApp() {
    await loadCareerCatalog();
    if (localStorage.getItem('careerCompassAccessToken')) {
        try {
            const recommendations = await loadAuthenticatedData();
            if (savedAssessment) renderAssessmentGuidance(savedAssessment, recommendations);
        } catch (error) {
            showToast(error.message);
        }
    } else {
        renderSavedCareers([]);
    }
}

void initializeApp();

function showToast(message) {
    const toast = document.querySelector('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2600);
}