// Career data is now loaded entirely from the API — no static array.

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
let selectedCareer = 'Artificial Intelligence Engineer';
let selectedCareerMatch = null;
let careerRecords = [];
let savedCareerIds = new Set();

async function apiRequest(path, options = {}, _retried = false) {
    const headers = { ...options.headers };
    const token = localStorage.getItem('careerCompassAccessToken');
    if (token) headers.Authorization = `Bearer ${token}`;
    if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

    let response;
    try {
        response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    } catch (networkError) {
        if (!_retried) return apiRequest(path, options, true);
        throw new Error('Network error — check your connection and try again.');
    }

    const result = response.status === 204 ? null : await response.json().catch(() => ({}));

    if (response.status === 401 && token && !_retried) {
        // Try to refresh the access token
        const refreshToken = localStorage.getItem('careerCompassRefreshToken');
        if (refreshToken) {
            try {
                const refreshResult = await fetch(`${API_BASE}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh_token: refreshToken }),
                });
                if (refreshResult.ok) {
                    const refreshData = await refreshResult.json();
                    localStorage.setItem('careerCompassAccessToken', refreshData.access_token);
                    localStorage.setItem('careerCompassRefreshToken', refreshData.refresh_token);
                    return apiRequest(path, options, true);
                }
            } catch {}
        }
        // Refresh failed — sign out silently
        performLogout(false);
        throw new Error('Your session has expired. Please sign in again.');
    }

    if (!response.ok) {
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
    },
    'Doctor (MBBS)': {
        match: '85%',
        symbol: '✚',
        color: 'green',
        summary: 'Prepare for NEET-UG, complete the 5.5-year MBBS curriculum, and undergo compulsory rotatory clinical internship.',
        overview: 'Medicine involves clinical diagnosis, patient care, pathology, pharmacology, surgery, and preventive public health in hospital and community environments.',
        duration: '5.5 years (4.5 academic years + 1-year mandatory rotatory internship)',
        bestCourses: ['MBBS (Bachelor of Medicine, Bachelor of Surgery)', 'BDS (Dental Surgery)', 'BAMS / BHMS (Ayurveda/Homeopathy)', 'MD / MS (Postgraduate Specialization)'],
        examFocus: ['NEET-UG (National Eligibility cum Entrance Test)', 'Biology / Zoology / Botany', 'Chemistry', 'Physics'],
        jobs: ['Medical Officer', 'Junior Resident', 'Physician', 'Specialist Doctor (post-MD/MS)', 'Public Health Administrator'],
        skillAreas: ['Clinical diagnosis', 'Patient communication', 'Pharmacology', 'Emergency medical care', 'Medical ethics & empathy'],
        firstSteps: ['Master NCERT Biology and Chemistry Class 11-12 line-by-line', 'Solve timed previous-year NEET mock tests', 'Understand hospital workflows and volunteer in community health camps'],
        entryPreparation: ['Mandatory NEET-UG qualification with minimum 50th percentile (40th for reserved categories)', 'Participate in KEA state and MCC All India Quota counselling', 'Confirm National Medical Commission (NMC) recognition of prospective colleges'],
        practiceProjects: ['Organize a community first-aid and hygiene awareness drive', 'Document comparative pathology case studies from public open journals', 'Shadow a practicing clinician during community health consultations'],
        phases: [
            { step: 'NOW · CLASS 11-12', title: 'NEET-UG Mastery', description: 'Deep study of NCERT Biology, Physics, and Chemistry with rigorous daily numerical and diagram practice.', skills: ['Biology', 'Chemistry', 'Physics', 'Time management'] },
            { step: 'YEARS 1–4.5', title: 'Pre-clinical, Para-clinical & Clinical Training', description: 'Anatomy, Physiology, Biochemistry, Pathology, Microbiology, Pharmacology, Medicine, Surgery, OB-GYN and Pediatrics.', skills: ['Anatomy', 'Pathology', 'Pharmacology', 'Clinical skills'] },
            { step: 'YEAR 5.5 & BEYOND', title: 'Compulsory Rotatory Internship & PG Prep', description: 'Hands-on clinical rotations across Casualty, Medicine, Surgery, Rural Health Centers, followed by NEXT / NEET-PG for specialization.', skills: ['Patient care', 'Emergency response', 'Clinical decision making'] }
        ]
    },
    'Chartered Accountant (CA)': {
        match: '82%',
        symbol: '₹',
        color: 'orange',
        summary: 'Progress through ICAI CA Foundation, Intermediate, 2 years of mandatory Articleship, and the CA Final examination.',
        overview: 'Chartered Accountancy is the benchmark qualification in auditing, taxation, corporate financial management, and statutory reporting under ICAI.',
        duration: '4–5 years under the Institute of Chartered Accountants of India (ICAI)',
        bestCourses: ['ICAI CA Program', 'B.Com / BBA concurrent with CA', 'CPA / CFA (post-qualification)'],
        examFocus: ['ICAI Foundation', 'ICAI Intermediate (Group 1 & 2)', 'ICAI Final', 'Corporate Law & Taxation'],
        jobs: ['Statutory Auditor', 'Tax Consultant', 'Financial Controller', 'Chief Financial Officer (CFO)', 'Forensic Accountant'],
        skillAreas: ['Financial reporting & Ind AS', 'Direct & Indirect taxation', 'Auditing standards', 'Corporate law', 'Excel & financial modeling'],
        firstSteps: ['Register for ICAI Foundation after Class 10/12', 'Master double-entry bookkeeping and accounting principles', 'Follow Union Budget, MCA circulars and GST regulatory updates'],
        entryPreparation: ['Pass Class 12 in any stream (Commerce or Mathematics preferred)', 'Register with ICAI 4 months before your intended exam session', 'Familiarize with ICAI study material and suggested answers'],
        practiceProjects: ['Prepare a model company balance sheet and cash flow analysis', 'Compute tax liabilities under old and new income tax regimes for a sample business', 'Simulate an internal audit checklist for an SME business'],
        phases: [
            { step: 'STAGE 1 · FOUNDATION', title: 'ICAI Foundation Examination', description: 'Clear 4 papers: Accounting, Business Laws, Quantitative Aptitude, and Business Economics.', skills: ['Accounting', 'Business law', 'Quantitative aptitude'] },
            { step: 'STAGE 2 · INTERMEDIATE & ARTICLESHIP', title: 'Intermediate Exams & 2-Year Articleship', description: 'Clear Group 1 & 2 exams, complete ICITSS training, and begin 2 years of rigorous practical training under a practicing CA.', skills: ['Auditing', 'Taxation', 'Financial management', 'Client audits'] },
            { step: 'STAGE 3 · FINAL & MEMBERSHIP', title: 'CA Final & ICAI Membership', description: 'Pass CA Final examinations, complete AICITSS, and enroll with ICAI as an Associate Chartered Accountant (ACA).', skills: ['Advanced auditing', 'Strategic financial management', 'Ethics'] }
        ]
    },
    'Lawyer (Advocate)': {
        match: '78%',
        symbol: '§',
        color: 'purple',
        summary: 'Complete a 5-year integrated B.A. LL.B. / B.B.A. LL.B. or 3-year LL.B., and clear the All India Bar Examination (AIBE).',
        overview: 'Advocates interpret statutory law, protect rights, draft contracts, counsel corporations, and represent clients in courts and arbitration tribunals.',
        duration: '5 years after Class 12 or 3 years after any bachelor degree',
        bestCourses: ['B.A. LL.B. (Hons)', 'B.B.A. LL.B. (Hons)', '3-Year LL.B.', 'LL.M. for specialization'],
        examFocus: ['CLAT (Common Law Admission Test)', 'AILET (NLU Delhi)', 'LSAT India', 'State Law CETs'],
        jobs: ['Litigation Advocate', 'Corporate In-house Counsel', 'Judicial Magistrate / Judge', 'Arbitration Consultant'],
        skillAreas: ['Legal research', 'Oral advocacy & Mooting', 'Drafting & Conveyancing', 'Constitutional law', 'Critical reasoning'],
        firstSteps: ['Read landmark Supreme Court judgments in summary form', 'Participate in school debates and mock parliament', 'Prepare for CLAT reading comprehension and legal reasoning'],
        entryPreparation: ['Class 12 with at least 45% marks from any recognized board', 'Consistent practice of CLAT passage-based legal reasoning and current affairs', 'Verify Bar Council of India (BCI) recognition of target law schools'],
        practiceProjects: ['Draft a model client contract and non-disclosure agreement', 'Participate in collegiate moot court or client counseling competitions', 'Intern with a district court advocate or legal aid clinic during semester breaks'],
        phases: [
            { step: 'NOW · CLASS 11-12', title: 'CLAT / Law Entrance Prep', description: 'Master legal reasoning, reading comprehension, current affairs, and logical reasoning.', skills: ['Critical reading', 'Legal awareness', 'Logical deduction'] },
            { step: 'YEARS 1–3', title: 'Foundational Law & Moot Courts', description: 'Constitutional law, contracts, criminal law (BNS), torts, and legal drafting paired with active moot court participation.', skills: ['Legal research', 'Case briefs', 'Statutory interpretation'] },
            { step: 'YEARS 4–5 & BAR', title: 'Corporate Specialization, Internships & AIBE', description: 'Internships at law firms, judicial clerkships, followed by State Bar Council enrollment and clearing the AIBE.', skills: ['Advocacy', 'Contract drafting', 'Courtroom etiquette'] }
        ]
    },
    'Civil Engineer': {
        match: '76%',
        symbol: '⌘',
        color: 'blue',
        summary: 'Complete B.Tech in Civil Engineering, master structural design software, and lead infrastructure development projects.',
        overview: 'Civil Engineers plan, design and construct residential buildings, bridges, transport highways, dams, and urban environmental infrastructure.',
        duration: '4 years for B.E. / B.Tech',
        bestCourses: ['B.E. / B.Tech in Civil Engineering', 'M.Tech in Structural / Geotechnical Engineering', 'Diploma in Civil Engineering'],
        examFocus: ['KCET / JEE Main', 'GATE (for PSUs and M.Tech)', 'AutoCAD & STAAD.Pro'],
        jobs: ['Site Engineer', 'Structural Design Engineer', 'Project Manager', 'Quantity Surveyor', 'Government PWD Engineer'],
        skillAreas: ['Structural analysis', 'AutoCAD', 'Surveying & GIS', 'Concrete technology', 'Estimation & Costing'],
        firstSteps: ['Focus on Class 12 Physics (Mechanics) and Mathematics', 'Learn basic AutoCAD 2D drafting online', 'Inspect local infrastructure and construction blueprints'],
        entryPreparation: ['Class 12 PCM with minimum 45-50%', 'Appear for state engineering entrance (KCET) or JEE Main', 'Review AICTE approved engineering institutions'],
        practiceProjects: ['Model a 2-storey residential frame in AutoCAD/STAAD.Pro', 'Calculate material estimation and BOQ (Bill of Quantities) for a small construction', 'Conduct a soil bearing and water drainage survey in your neighborhood'],
        phases: [
            { step: 'NOW · 0–6 MONTHS', title: 'Engineering Entrance & Math Prep', description: 'Strengthen mechanics, trigonometry, calculus, and spatial aptitude for engineering entrance exams.', skills: ['Physics', 'Mathematics', 'Engineering mechanics'] },
            { step: 'YEARS 1–3', title: 'Core Structural & Surveying Education', description: 'Mechanics of solids, fluid mechanics, surveying, soil mechanics, concrete technology, and CAD software training.', skills: ['Surveying', 'STAAD.Pro', 'AutoCAD', 'Structural analysis'] },
            { step: 'YEAR 4 & CAREER', title: 'On-site Internships & GATE / Placement', description: 'On-site construction supervision internships, capstone project, and preparation for GATE / PSU / PWD recruitment or structural design firms.', skills: ['Site management', 'BOQ estimation', 'Safety regulations'] }
        ]
    }
};

const careerRoadmapAliases = {
    'Artificial Intelligence Engineer': 'Artificial Intelligence',
    'Data Scientist': 'Data Science',
    'Cybersecurity Analyst': 'Cybersecurity',
    'Product Designer': 'Product Design',
    'Product Designer (UX/UI)': 'Product Design',
    'Biotechnology Researcher': 'Biotechnology',
    'Doctor': 'Doctor (MBBS)',
    'MBBS': 'Doctor (MBBS)',
    'Chartered Accountant': 'Chartered Accountant (CA)',
    'CA': 'Chartered Accountant (CA)',
    'Lawyer': 'Lawyer (Advocate)',
    'Advocate': 'Lawyer (Advocate)',
    'Mechanical Engineer': 'Civil Engineer',
    'Electrical Engineer': 'Civil Engineer',
    'Cloud Engineer': 'Software Developer',
    'Machine Learning Engineer': 'Artificial Intelligence'
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
    let roadmap = careerRoadmaps[roadmapKey];
    let resources = careerResources[roadmapKey] || [];

    if (!roadmap) {
        const found = careerRecords.find(c => c.name === careerName) || {};
        const domain = found.domain || 'Career';
        const color = domain === 'Business' ? 'orange' : domain === 'Healthcare' || domain === 'Design' || domain === 'Science' || domain === 'Agriculture' ? 'green' : 'blue';
        const symbol = domain === 'Business' ? '₹' : domain === 'Healthcare' ? '✚' : domain === 'Agriculture' || domain === 'Science' ? '◌' : domain === 'Design' ? '✦' : '⌘';
        let reqSkills = [];
        try {
            reqSkills = Object.keys(typeof found.required_skills === 'string' ? JSON.parse(found.required_skills || '{}') : (found.required_skills || {}));
        } catch {}
        if (!reqSkills.length) reqSkills = ['Problem solving', 'Domain knowledge', 'Communication'];

        roadmap = {
            match: `${found.market_demand || 80}% DEMAND`,
            symbol: symbol,
            color: color,
            summary: found.description || `Build a structured and practical path toward a career in ${careerName}.`,
            overview: `${careerName} is an impactful profession in ${domain}. ${found.description || ''}`,
            duration: found.education_duration || '3–4 years',
            bestCourses: [found.eligibility || 'Relevant Bachelor degree', 'Certified specializations', 'Applied internships'],
            examFocus: ['Core subject mastery', 'Analytical reasoning', 'Entrance examination syllabus'],
            jobs: [`Junior ${careerName}`, `${careerName}`, `Senior ${careerName}`, 'Consultant / Lead'],
            skillAreas: reqSkills,
            firstSteps: [
                `Review eligibility & entrance requirements (${found.eligibility || 'Check college notices'})`,
                'Strengthen prerequisite foundational subjects',
                'Engage in hands-on practice projects or certified foundational courses'
            ],
            entryPreparation: [
                'Review institution-specific eligibility and cutoffs',
                'Prepare a consistent study schedule',
                'Build domain-specific practical skills'
            ],
            practiceProjects: [
                `Complete 1 practical project or case study relevant to ${careerName}`,
                'Analyze real-world problem statements and industry reports',
                'Document your learning and build a portfolio'
            ],
            phases: [
                {
                    step: 'NOW · 0–6 MONTHS',
                    title: 'Foundation & Entrance Preparation',
                    description: `Focus on prerequisite subjects, entrance exam syllabus, and foundational concepts for ${careerName}.`,
                    skills: reqSkills.slice(0, 3)
                },
                {
                    step: 'NEXT · 1–3 YEARS',
                    title: 'Formal Degree & Practical Skill Building',
                    description: `Pursue ${found.education_duration || 'degree studies'} with hands-on lab work, projects, and active participation in competitions or workshops.`,
                    skills: reqSkills.slice(2, 5).length ? reqSkills.slice(2, 5) : reqSkills
                },
                {
                    step: 'THEN · FINAL YEAR & BEYOND',
                    title: 'Internships, Licensing & Career Launch',
                    description: `Complete required internships, licensing examinations or certifications to transition into professional practice. Typical starting compensation: ${found.salary_range || 'Competitive'}.`,
                    skills: ['Professional practice', 'Industry networking', 'Continuous learning']
                }
            ]
        };
    }

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
    const profileName = document.querySelector('#sidebar-name');
    const profileDetails = document.querySelector('#sidebar-details');
    const sidebarAvatar = document.querySelector('#sidebar-avatar');
    const topbarAvatar = document.querySelector('#topbar-avatar');
    const overviewName = document.querySelector('#overview-name');
    const logoutButton = document.querySelector('#logout-button');
    const greetingEl = document.querySelector('[data-dynamic-greeting]');

    const fullName = profile.fullName || profile.full_name || profile.name || '';
    const standard = profile.standard || profile.educationLevel || profile.education_level || '';
    const stream = profile.stream || '';

    const initials = fullName
        ? fullName.split(/\s+/).filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()
        : '?';

    if (profileName) profileName.textContent = fullName || 'Guest';
    if (profileDetails) profileDetails.textContent = fullName
        ? [standard, stream].filter(Boolean).join(' · ') || 'Profile'
        : 'Sign in to continue';
    if (sidebarAvatar) sidebarAvatar.textContent = initials;
    if (topbarAvatar) topbarAvatar.textContent = initials;
    if (overviewName) overviewName.textContent = fullName ? fullName.split(' ')[0] : '';
    if (greetingEl) {
        const firstName = fullName ? fullName.split(' ')[0] : '';
        greetingEl.innerHTML = firstName
            ? `Welcome to Campus AI, <span id="overview-name">${escapeHTML(firstName)}</span><span class="accent">.</span>`
            : `Welcome to Campus AI<span class="accent">.</span>`;
    }
    if (logoutButton) logoutButton.hidden = !fullName;

    const completionFields = [fullName, standard, stream, profile.board, profile.institution, profile.subjects, profile.careerGoal];
    const completedCount = completionFields.filter(v => Array.isArray(v) ? v.length > 0 : Boolean(v)).length;
    const completionStat = document.querySelector('#profile-completion-stat');
    if (completionStat) completionStat.textContent = `${Math.round(completedCount / completionFields.length * 100)}%`;
    const progressBar = completionStat?.closest('.stat-card')?.querySelector('.progress i');
    if (progressBar) progressBar.style.width = `${Math.round(completedCount / completionFields.length * 100)}%`;
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
    // Show loading skeletons while fetching
    if (exploreGrid) {
        exploreGrid.innerHTML = Array(6).fill('<div class="career-skeleton"></div>').join('');
    }
    try {
        careerRecords = await apiRequest('/careers');
        renderCareerCards(exploreGrid, careerRecords);
    } catch (error) {
        if (exploreGrid) {
            exploreGrid.innerHTML = `<div class="api-error-state"><strong>Could not load careers</strong>${escapeHTML(error.message)}</div>`;
        }
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
        if (result.refresh_token) localStorage.setItem('careerCompassRefreshToken', result.refresh_token);
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
        if (result.refresh_token) localStorage.setItem('careerCompassRefreshToken', result.refresh_token);
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
    // Set dynamic date and greeting on overview
    const dateEl = document.querySelector('.kicker[data-dynamic-date]');
    const greetingEl = document.querySelector('h1[data-dynamic-greeting]');
    if (dateEl) {
        const now = new Date();
        const days = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
        const months = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
        dateEl.textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    }

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

function performLogout(notify = true) {
    const refreshToken = localStorage.getItem('careerCompassRefreshToken');
    if (refreshToken) {
        // Fire-and-forget — don't block UI
        fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
        }).catch(() => {});
    }
    localStorage.removeItem('careerCompassAccessToken');
    localStorage.removeItem('careerCompassRefreshToken');
    savedCareerIds = new Set();
    // Reset UI
    updateStudentSummary({});
    const greetingEl = document.querySelector('[data-dynamic-greeting]');
    if (greetingEl) greetingEl.innerHTML = `Welcome to Campus AI<span class="accent">.</span>`;
    renderCareerCards(recommendationGrid, [], false);
    renderSavedCareers([]);
    const savedCountEl = document.querySelector('#saved-career-count');
    const navCountEl = document.querySelector('#nav-saved-career-count');
    if (savedCountEl) savedCountEl.textContent = '0';
    if (navCountEl) navCountEl.textContent = '0';
    if (notify) {
        showToast('You have been signed out.');
        showView('student-login');
    }
}

void initializeApp();

// Wire up logout button
const logoutButtonEl = document.querySelector('#logout-button');
if (logoutButtonEl) {
    logoutButtonEl.addEventListener('click', () => performLogout(true));
}

// Set dynamic date immediately on load
(function setDynamicDate() {
    const dateEl = document.querySelector('[data-dynamic-date]');
    if (!dateEl) return;
    const now = new Date();
    const days = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
    const months = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
    dateEl.textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const greetingEl = document.querySelector('[data-dynamic-greeting]');
    if (greetingEl && !localStorage.getItem('careerCompassAccessToken')) {
        greetingEl.innerHTML = `Welcome to Campus AI<span class="accent">.</span>`;
    }
}());

// Wire up Ask Compass AI Chat Modal
const helpButtonEl = document.querySelector('.help-button');
const chatModalEl = document.querySelector('#chat-modal');
const closeChatEl = document.querySelector('#close-chat');
const chatFormEl = document.querySelector('#chat-form');
const chatInputEl = document.querySelector('#chat-input');
const chatMessagesEl = document.querySelector('#chat-messages');

if (helpButtonEl && chatModalEl) {
    helpButtonEl.addEventListener('click', () => {
        chatModalEl.hidden = false;
        if (chatInputEl) chatInputEl.focus();
    });
}

if (closeChatEl && chatModalEl) {
    closeChatEl.addEventListener('click', () => {
        chatModalEl.hidden = true;
    });
}

if (chatModalEl) {
    chatModalEl.addEventListener('click', event => {
        if (event.target === chatModalEl) {
            chatModalEl.hidden = true;
        }
    });
}

if (chatFormEl && chatInputEl && chatMessagesEl) {
    chatFormEl.addEventListener('submit', async event => {
        event.preventDefault();
        const question = chatInputEl.value.trim();
        if (!question) return;

        // Append user message
        const userMsg = document.createElement('div');
        userMsg.className = 'chat-msg user';
        userMsg.innerHTML = `<p>${escapeHTML(question)}</p>`;
        chatMessagesEl.appendChild(userMsg);
        chatInputEl.value = '';
        chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;

        // Typing indicator / placeholder
        const botMsg = document.createElement('div');
        botMsg.className = 'chat-msg bot';
        botMsg.innerHTML = '<p><em>Thinking...</em></p>';
        chatMessagesEl.appendChild(botMsg);
        chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;

        try {
            const response = await apiRequest('/chat', {
                method: 'POST',
                body: JSON.stringify({ question })
            });
            botMsg.innerHTML = `
                <p>${escapeHTML(response.answer)}</p>
                ${response.disclaimer ? `<p class="chat-disclaimer">${escapeHTML(response.disclaimer)}</p>` : ''}
            `;
        } catch (error) {
            botMsg.innerHTML = `<p style="color:var(--coral);">Unable to get an answer right now: ${escapeHTML(error.message)}</p>`;
        }
        chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
    });
}

function showToast(message) {
    const toast = document.querySelector('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2600);
}