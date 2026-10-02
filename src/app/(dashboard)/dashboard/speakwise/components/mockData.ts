export interface SpeechTopic {
  id: string;
  title: string;
  instructions: string[];
  mockTranscript: string;
  analysis: {
    overallScore: number;
    breakdown: {
      confidence: number;
      eyeContact: number;
      fluency: number;
      speed: number; // WPM
      fillerWords: number;
    };
    fillerWordsBreakdown: {
      um: number;
      uh: number;
      like: number;
      basically: number;
      actually: number;
    };
    eyeContactMetrics: {
      eyeContactPct: number;
      lookingAwayPct: number;
      attentionTrend: number[]; // numbers over time
    };
    feedback: {
      strengths: string[];
      improvements: string[];
    };
  };
}

export interface PracticeMode {
  id: string;
  title: string;
  description: string;
  topics: SpeechTopic[];
}

export interface SpeakSessionLog {
  id: string;
  date: string;
  type: string;
  topic: string;
  score: number;
  duration: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  iconName: string;
}

export const SPEAKWISE_MODES: PracticeMode[] = [
  {
    id: "self-intro",
    title: "Self Introduction Coach",
    description: "Structure a powerful elevator pitch about your professional journey and career highlights.",
    topics: [
      {
        id: "intro-1",
        title: "Introduce yourself",
        instructions: [
          "State your name and current role/status clearly.",
          "Highlight 2 major achievements or key technical expertise areas.",
          "Keep the total duration between 60 to 90 seconds.",
          "Maintain central eye contact at least 80% of the time."
        ],
        mockTranscript: "Hi, my name is John. Basically, I am a software engineer with three years of experience building web applications. Um, in my previous role, I worked with React and TypeScript, where I, like, successfully optimized page load speeds by 40%. Actually, I am highly interested in full-stack cloud positions because I love working with database optimization and, uh, server architectures. In my free time, I like to build open-source tools and, you know, learn new systems.",
        analysis: {
          overallScore: 84,
          breakdown: { confidence: 82, eyeContact: 85, fluency: 80, speed: 138, fillerWords: 6 },
          fillerWordsBreakdown: { um: 1, uh: 1, like: 2, basically: 1, actually: 1 },
          eyeContactMetrics: { eyeContactPct: 86, lookingAwayPct: 14, attentionTrend: [80, 85, 88, 86, 82, 85, 90, 88, 86, 85] },
          feedback: {
            strengths: ["Clear professional scope and structural outline", "Good pace and articulate descriptions of tech stacks"],
            improvements: ["Reduce transitional fillers like 'basically' and 'actually'", "Provide a bit more detail on team-level collaborations"]
          }
        }
      },
      {
        id: "intro-2",
        title: "Tell me about yourself",
        instructions: [
          "Focus on the 'Present-Past-Future' framework.",
          "Briefly mention what you do now, a key past milestone, and what excites you next.",
          "Maintain a steady, confident posture."
        ],
        mockTranscript: "Currently, I am a frontend developer focusing on SaaS products. In the past, uh, I graduated with honors and interned at a fintech firm where I helped design transaction flows. Moving forward, like, I want to lead frontend architectural designs at a growth-stage company. Um, I believe my strong JavaScript skills and project ownership align perfectly with your core goals.",
        analysis: {
          overallScore: 88,
          breakdown: { confidence: 86, eyeContact: 88, fluency: 84, speed: 130, fillerWords: 3 },
          fillerWordsBreakdown: { um: 1, uh: 1, like: 1, basically: 0, actually: 0 },
          eyeContactMetrics: { eyeContactPct: 89, lookingAwayPct: 11, attentionTrend: [82, 86, 89, 90, 88, 89, 92, 91, 89, 90] },
          feedback: {
            strengths: ["Excellent pacing and vocal range", "Very concise present-past-future transitions"],
            improvements: ["Make sure the pitch is tailored specifically to software engineering", "Maintain strong focus when wrapping up the final sentence"]
          }
        }
      },
      {
        id: "intro-3",
        title: "Walk me through your resume",
        instructions: [
          "Summarize your professional timeline chronologically.",
          "Focus on projects with high business impact and technology choices.",
          "Limit presentation to 2 minutes maximum."
        ],
        mockTranscript: "Starting my journey, I worked as a junior programmer focusing on bug resolution. Next, basically, I moved to engineering where I owned the user dashboard codebase, which, uh, is built with React. In this role, I drove a modular components overhaul that cut bundle sizes by 30%. I then transitioned into full stack, working with Node.js. Actually, my entire trajectory has been about optimization and shipping high-value features.",
        analysis: {
          overallScore: 82,
          breakdown: { confidence: 78, eyeContact: 80, fluency: 82, speed: 145, fillerWords: 4 },
          fillerWordsBreakdown: { um: 0, uh: 1, like: 0, basically: 1, actually: 2 },
          eyeContactMetrics: { eyeContactPct: 82, lookingAwayPct: 18, attentionTrend: [75, 80, 82, 85, 78, 80, 84, 83, 85, 82] },
          feedback: {
            strengths: ["Strong description of optimization achievements", "Clear chronological timeline sequence"],
            improvements: ["Keep eyes locked on screen; noticed a few downward glances", "Slow down word pacing during explanations of complex projects"]
          }
        }
      }
    ]
  },
  {
    id: "hr-comm",
    title: "HR Communication Coach",
    description: "Align your behavioral answers with standard corporate values and cultural competency traits.",
    topics: [
      {
        id: "hr-1",
        title: "Why should we hire you?",
        instructions: [
          "Explain what makes you uniquely qualified (intersection of skills & drive).",
          "Express genuine alignment with company missions.",
          "Speak with energetic and positive inflection."
        ],
        mockTranscript: "I believe you should hire me because, um, I bring a unique combination of technical coding rigor and project management skills. In my past projects, I didn't just write code; I actively collaborated with product managers to design the features. This hybrid mindset, like, helps me identify tech blocks early. Actually, I am also highly excited about your learning-access mission, which matches my own values.",
        analysis: {
          overallScore: 86,
          breakdown: { confidence: 88, eyeContact: 85, fluency: 82, speed: 140, fillerWords: 3 },
          fillerWordsBreakdown: { um: 1, uh: 0, like: 1, basically: 0, actually: 1 },
          eyeContactMetrics: { eyeContactPct: 87, lookingAwayPct: 13, attentionTrend: [85, 88, 87, 85, 82, 84, 88, 89, 88, 87] },
          feedback: {
            strengths: ["Great projection of confidence and professional pride", "Strong alignment of values with company goals"],
            improvements: ["Avoid using 'um' at the very beginning of structural highlights", "Vary pitch slightly to emphasize major deliverables"]
          }
        }
      },
      {
        id: "hr-2",
        title: "What are your strengths?",
        instructions: [
          "State a strength, give a concrete example, and describe the outcome.",
          "Keep descriptions concise and outcome-focused."
        ],
        mockTranscript: "My main strength is adaptability. For example, in my last project, we had to switch our backend service from Firebase to AWS Node, like, in three days. Basically, I stayed late, read all docs, and completed the migration ahead of schedule. As a result, the project launched on time. Actually, I enjoy technical challenges that force me out of my comfort zone.",
        analysis: {
          overallScore: 89,
          breakdown: { confidence: 92, eyeContact: 90, fluency: 85, speed: 132, fillerWords: 4 },
          fillerWordsBreakdown: { um: 0, uh: 0, like: 1, basically: 2, actually: 1 },
          eyeContactMetrics: { eyeContactPct: 91, lookingAwayPct: 9, attentionTrend: [88, 92, 90, 89, 91, 93, 92, 90, 91, 91] },
          feedback: {
            strengths: ["Highly structured example using STAR methodology", "Excellent eye contact stability throughout"],
            improvements: ["Practice replacing 'basically' with structured transitions like 'therefore'", "Pace is good, but take deeper breaths between statements"]
          }
        }
      }
    ]
  },
  {
    id: "proj-exp",
    title: "Project Explanation Coach",
    description: "Pitch technical projects clearly to both engineering and non-technical stakeholders.",
    topics: [
      {
        id: "proj-1",
        title: "Explain your project",
        instructions: [
          "Start with the core purpose (the 'Why').",
          "Explain the architecture/stack choices (the 'How').",
          "Highlight the impact or outcome (the 'What')."
        ],
        mockTranscript: "I built a real-time collaborative workspace tool. The main goal, um, was to allow remote teams to write code docs together. We chose React and WebRTC for, uh, peer-to-peer data syncing. This avoided complex database latency. Like, the system scales up to 50 concurrent users. In the end, we deployed it on Vercel and it, basically, got 500 active sign-ups in its first week.",
        analysis: {
          overallScore: 85,
          breakdown: { confidence: 84, eyeContact: 86, fluency: 80, speed: 135, fillerWords: 5 },
          fillerWordsBreakdown: { um: 1, uh: 1, like: 1, basically: 2, actually: 0 },
          eyeContactMetrics: { eyeContactPct: 88, lookingAwayPct: 12, attentionTrend: [82, 85, 87, 89, 86, 88, 90, 89, 87, 88] },
          feedback: {
            strengths: ["Excellent description of tech stack and design trade-offs", "Great metric integration (500 active sign-ups)"],
            improvements: ["Avoid using 'like' when describing hard engineering metrics", "Improve fluency by practicing transition flow between tech stack details"]
          }
        }
      }
    ]
  },
  {
    id: "tech-comm",
    title: "Technical Communication Coach",
    description: "Practice explaining complex algorithms and architectures in plain, easy-to-follow terms.",
    topics: [
      {
        id: "tech-1",
        title: "Explain OOP",
        instructions: [
          "Define Object-Oriented Programming simply.",
          "List the 4 core pillars and give a quick analogy."
        ],
        mockTranscript: "OOP is a coding paradigm based on objects, which are like real-world entities containing data and behavior. The first pillar is encapsulation, which, um, keeps variable states private inside a class. Second is inheritance, letting subclasses extend parents, which, you know, cuts redundancy. Third is polymorphism, where a function can change form. And abstraction hides details. Basically, it makes code modular and reusable.",
        analysis: {
          overallScore: 87,
          breakdown: { confidence: 85, eyeContact: 89, fluency: 82, speed: 139, fillerWords: 3 },
          fillerWordsBreakdown: { um: 1, uh: 0, like: 1, basically: 1, actually: 0 },
          eyeContactMetrics: { eyeContactPct: 90, lookingAwayPct: 10, attentionTrend: [85, 89, 91, 90, 88, 89, 92, 91, 89, 90] },
          feedback: {
            strengths: ["Clear definitions of all four principles", "Helpful analogies and strong vocal tone"],
            improvements: ["Slow down when introducing polymorphism to allow clear processing", "Maintain eye contact when searching for definitions"]
          }
        }
      }
    ]
  },
  {
    id: "random-speech",
    title: "Random Speech Practice",
    description: "Pick a random prompt and speak on the spot to refine impromptu communication and pacing.",
    topics: [
      {
        id: "rand-1",
        title: "Artificial Intelligence",
        instructions: [
          "State your views on the rapid growth of generative AI.",
          "Discuss potential social or economic consequences.",
          "Keep speech structural, covering pros and cons."
        ],
        mockTranscript: "Artificial intelligence is reshaping everything. On one hand, uh, it automates repetitive developer scripts, boosting coding speed. On the other hand, like, it raises copyright and job safety concerns. Basically, we need ethical guidelines. I think AI won't replace engineers, but, you know, engineers using AI will replace those who don't.",
        analysis: {
          overallScore: 83,
          breakdown: { confidence: 80, eyeContact: 84, fluency: 82, speed: 142, fillerWords: 4 },
          fillerWordsBreakdown: { um: 0, uh: 1, like: 1, basically: 2, actually: 0 },
          eyeContactMetrics: { eyeContactPct: 85, lookingAwayPct: 15, attentionTrend: [78, 82, 85, 84, 80, 83, 86, 85, 87, 85] },
          feedback: {
            strengths: ["Engaging impromptu hooks and logical structure", "Relevant quote to wrap up the argument"],
            improvements: ["Reduce 'basically' usage when shifting from pros to cons", "Maintain eye contact during deep thinking periods"]
          }
        }
      }
    ]
  },
  {
    id: "group-discussion",
    title: "Group Discussion Practice",
    description: "Learn how to state opinions politely, build on other points, and steer discussions.",
    topics: [
      {
        id: "gd-1",
        title: "AI replacing jobs",
        instructions: [
          "Structure a balanced opening statement on automation.",
          "Practice phrases like 'I agree with that point, and would add...' or 'Alternatively...'",
          "Deliver arguments with calm, professional pacing."
        ],
        mockTranscript: "In my view, AI is a tool for augmentation rather than displacement. I, like, agree that certain low-level manual roles will be automated. However, actually, it opens massive demands for prompt engineering and model fine-tuning. Therefore, um, our focus should be reskilling rather than restricting technological growth.",
        analysis: {
          overallScore: 86,
          breakdown: { confidence: 85, eyeContact: 88, fluency: 85, speed: 136, fillerWords: 3 },
          fillerWordsBreakdown: { um: 1, uh: 0, like: 1, basically: 0, actually: 1 },
          eyeContactMetrics: { eyeContactPct: 89, lookingAwayPct: 11, attentionTrend: [82, 85, 88, 89, 87, 89, 91, 90, 88, 89] },
          feedback: {
            strengths: ["Professional and polite conversational phrasing", "Highly structured reskilling conclusion"],
            improvements: ["Slightly raise volume to project authority", "Eliminate 'like' when agreeing with potential drawbacks"]
          }
        }
      }
    ]
  }
];

export const INITIAL_SPEAK_HISTORY: SpeakSessionLog[] = [
  {
    id: "log-1",
    date: "2026-06-03",
    type: "Self Introduction",
    topic: "Introduce yourself",
    score: 84,
    duration: "1m 15s"
  },
  {
    id: "log-2",
    date: "2026-05-28",
    type: "HR Communication",
    topic: "Why should we hire you?",
    score: 86,
    duration: "1m 30s"
  },
  {
    id: "log-3",
    date: "2026-05-20",
    type: "Project Explanation",
    topic: "Explain your project",
    score: 85,
    duration: "2m 05s"
  },
  {
    id: "log-4",
    date: "2026-05-12",
    type: "Technical Communication",
    topic: "Explain OOP",
    score: 87,
    duration: "1m 40s"
  }
];

export const SPEAKWISE_ACHIEVEMENTS: AchievementBadge[] = [
  {
    id: "badge-1",
    title: "First Session",
    description: "Completed your first speech practice session with full metrics validation.",
    earned: true,
    iconName: "Mic"
  },
  {
    id: "badge-2",
    title: "7 Day Streak",
    description: "Maintained a speaking practice streak of 7 consecutive days.",
    earned: true,
    iconName: "Flame"
  },
  {
    id: "badge-3",
    title: "Communication Expert",
    description: "Achieved an overall communication score of 85+ in any practice mode.",
    earned: true,
    iconName: "Award"
  },
  {
    id: "badge-4",
    title: "Confidence Builder",
    description: "Maintained a confidence indicator score of 90+ in a single speech.",
    earned: false,
    iconName: "Zap"
  },
  {
    id: "badge-5",
    title: "Presentation Master",
    description: "Completed at least one practice topic in all six coaching domains.",
    earned: false,
    iconName: "Crown"
  }
];
