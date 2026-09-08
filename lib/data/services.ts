// Data-driven service catalogue. Demo content — GC Career Studio has not
// provided real service copy, pricing, or process detail (see
// REQUIREMENTS.md, Open Questions #5–7). This is the single source of
// truth the seed script writes into Postgres; the UI never hardcodes a
// service's copy in a component.

export type ServiceSeed = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  problem: string;
  whoFor: string;
  included: string[];
  process: { step: string; description: string }[];
  outcomes: string[];
  faq: { question: string; answer: string }[];
  order: number;
};

export const services: ServiceSeed[] = [
  {
    slug: "resume-linkedin-optimization",
    title: "Resume & LinkedIn Optimization",
    summary: "Turn your experience into a resume and profile that get you shortlisted.",
    description:
      "A structured rewrite of your resume and LinkedIn profile, focused on how recruiters and applicant tracking systems actually read them — not just wording, but positioning.",
    problem:
      "Strong candidates get filtered out before a human ever reads their resume, because their experience isn't framed around outcomes an employer can recognize at a glance.",
    whoFor:
      "Anyone actively applying who suspects their resume isn't the reason they're being overlooked — but wants a second opinion to be sure.",
    included: [
      "One structured intake session on your experience and target roles",
      "Full resume rewrite with outcome-focused bullet points",
      "LinkedIn headline, summary, and experience section rewrite",
      "One round of revisions after you review the draft",
    ],
    process: [
      { step: "Discover", description: "We review your current resume, LinkedIn, and target roles." },
      { step: "Assess", description: "We identify what's underselling your experience." },
      { step: "Strategize", description: "We map your background to the language target roles use." },
      { step: "Execute", description: "We deliver a rewritten resume and profile, then refine with you." },
    ],
    outcomes: [
      "A resume framed around outcomes, not just responsibilities",
      "A LinkedIn profile aligned with your resume and target roles",
      "Clarity on how to talk about your own experience",
    ],
    faq: [
      {
        question: "Do you write the resume for me, or coach me to write it?",
        answer: "Both — we draft it collaboratively, so it sounds like you and holds up in an interview.",
      },
      {
        question: "How long does this take?",
        answer: "Typically 1–2 weeks from intake to final draft, depending on revision rounds.",
      },
    ],
    order: 1,
  },
  {
    slug: "interview-preparation",
    title: "Interview Preparation",
    summary: "Structured practice for the interviews that actually decide the offer.",
    description:
      "Behavioral and role-specific interview preparation, including mock interviews and direct feedback, so you walk in with a clear structure for your answers.",
    problem:
      "Many strong candidates lose offers not because they lack experience, but because they can't articulate it clearly under interview conditions.",
    whoFor:
      "Candidates with interviews scheduled or expected soon, who want structured practice rather than generic tips.",
    included: [
      "Mock interview sessions with direct, specific feedback",
      "A structured framework for behavioral questions",
      "Role-specific question preparation",
      "Guidance on questions to ask the interviewer",
    ],
    process: [
      { step: "Discover", description: "We learn about the role and company you're interviewing with." },
      { step: "Assess", description: "We identify where your answers currently lose clarity or impact." },
      { step: "Strategize", description: "We build a response framework tailored to your background." },
      { step: "Execute", description: "We run mock interviews and refine until it's second nature." },
    ],
    outcomes: [
      "A repeatable structure for behavioral and situational questions",
      "Reduced interview anxiety through deliberate practice",
      "Specific, honest feedback instead of generic advice",
    ],
    faq: [
      {
        question: "Is this for a specific interview or general practice?",
        answer: "Both work — we tailor sessions to a specific upcoming interview when you have one.",
      },
    ],
    order: 2,
  },
  {
    slug: "career-strategy",
    title: "Career Strategy",
    summary: "A clear-eyed plan for where you're going and how to get there.",
    description:
      "For people who are competent at their job but unclear on the next step — this builds a concrete direction and a plan to reach it.",
    problem:
      "Being good at your job doesn't automatically produce clarity about what should come next, and drifting without a direction has a real cost over time.",
    whoFor:
      "Working professionals who feel stuck or unsure of their next move, even if their current role is fine.",
    included: [
      "A structured career assessment session",
      "Identification of 2–3 realistic direction options",
      "A written strategy with concrete next steps",
      "One follow-up check-in session",
    ],
    process: [
      { step: "Discover", description: "We understand your current role, skills, and what's unsatisfying." },
      { step: "Assess", description: "We evaluate realistic directions given your experience and goals." },
      { step: "Strategize", description: "We narrow to a direction and build a concrete plan." },
      { step: "Execute", description: "We check in as you take the first steps." },
    ],
    outcomes: [
      "A specific direction instead of vague ambition",
      "A written plan with concrete near-term actions",
      "Confidence in the reasoning behind the direction",
    ],
    faq: [
      {
        question: "What if I don't know what I want yet?",
        answer: "That's the normal starting point — the assessment session is designed to surface it.",
      },
    ],
    order: 3,
  },
  {
    slug: "job-search-strategy",
    title: "Job Search Strategy",
    summary: "A structured, prioritized search — not another 200 applications into a void.",
    description:
      "A plan for how to search efficiently: where to focus, how to prioritize roles, and how to use your network, instead of applying broadly and waiting.",
    problem:
      "Unstructured job searching burns time and motivation, especially when most applications go to systems no one reads.",
    whoFor:
      "Anyone actively searching who feels like they're applying broadly with little to show for it.",
    included: [
      "A prioritized target list of roles and companies",
      "A weekly search structure and cadence",
      "Networking and outreach guidance",
      "Application tracking setup",
    ],
    process: [
      { step: "Discover", description: "We review your target roles and current search approach." },
      { step: "Assess", description: "We identify where effort is being spent without return." },
      { step: "Strategize", description: "We build a prioritized, time-boxed search plan." },
      { step: "Execute", description: "We support you through the first weeks of the new approach." },
    ],
    outcomes: [
      "A prioritized list instead of a scattershot approach",
      "A repeatable weekly search structure",
      "Less time spent, more relevant conversations started",
    ],
    faq: [
      {
        question: "Do you apply to jobs on my behalf?",
        answer: "No — we build the strategy and structure; you (or your network) do the outreach.",
      },
    ],
    order: 4,
  },
  {
    slug: "career-transition",
    title: "Career Transition",
    summary: "A credible path into a new field, built on the skills you already have.",
    description:
      "For people changing industries or functions entirely — translating transferable skills into a credible, structured transition plan.",
    problem:
      "Switching fields is hard to do credibly without a plan that explains, to an employer, why your background is relevant to a role it doesn't obviously map to.",
    whoFor:
      "Career switchers moving into a new industry or function who need both a strategy and a way to explain it.",
    included: [
      "A transferable-skills assessment",
      "A positioning strategy for your target field",
      "Resume and narrative rework for the transition",
      "A realistic transition timeline",
    ],
    process: [
      { step: "Discover", description: "We understand your background and the field you're targeting." },
      { step: "Assess", description: "We identify genuinely transferable skills and real gaps." },
      { step: "Strategize", description: "We build the positioning and a realistic timeline." },
      { step: "Execute", description: "We rework your materials and prepare you to explain the shift." },
    ],
    outcomes: [
      "A credible narrative for why you're making the change",
      "Clarity on real skill gaps vs. perceived ones",
      "A realistic timeline instead of an open-ended search",
    ],
    faq: [
      {
        question: "Is this only for switching industries, or also roles within one?",
        answer: "Both — the same transferable-skills approach applies to functional switches too.",
      },
    ],
    order: 5,
  },
];
