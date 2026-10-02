export interface TechnicalQuestion {
  id: number;
  question: string;
  difficulty: string;
  answer: string;
  subject: string;
  companies: string[];
}

export const technicalSubjects = [
  "DBMS",
  "Operating System",
  "Computer Networks",
  "OOP",
  "SQL",
] as const;

export const technicalQuestions: TechnicalQuestion[] = [
  {
    id: 1,
    subject: "DBMS",
    question: "What is normalization? Explain different normal forms.",
    difficulty: "Medium",
    answer: "Normalization is the process of organizing data to reduce redundancy. 1NF: Atomic values. 2NF: No partial dependency. 3NF: No transitive dependency. BCNF: Every determinant is a candidate key.",
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra"],
  },
  {
    id: 2,
    subject: "DBMS",
    question: "What is the difference between SQL and NoSQL databases?",
    difficulty: "Easy",
    answer: "SQL databases are relational with predefined schemas, support ACID transactions. NoSQL databases are non-relational with dynamic schemas, support horizontal scaling, and are suitable for unstructured data.",
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra"],
  },
  {
    id: 3,
    subject: "Operating System",
    question: "What is deadlock? Explain the necessary conditions for deadlock.",
    difficulty: "Medium",
    answer: "Deadlock is a state where processes are blocked waiting for each other. Conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.",
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra"],
  },
  {
    id: 4,
    subject: "Operating System",
    question: "Explain paging and segmentation.",
    difficulty: "Medium",
    answer: "Paging divides memory into fixed-size pages. Segmentation divides memory into variable-sized segments based on logical divisions.",
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra"],
  },
  {
    id: 5,
    subject: "Computer Networks",
    question: "Explain the OSI model layers.",
    difficulty: "Easy",
    answer: "Physical, Data Link, Network, Transport, Session, Presentation, Application (7 layers). Each layer has specific functions in network communication.",
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra"],
  },
  {
    id: 6,
    subject: "Computer Networks",
    question: "What is TCP and UDP? What is the difference?",
    difficulty: "Easy",
    answer: "TCP is connection-oriented, reliable, ensures ordered delivery. UDP is connectionless, faster, no guarantee of delivery. TCP used for web, email. UDP used for streaming, DNS.",
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra"],
  },
  {
    id: 7,
    subject: "OOP",
    question: "What are the four pillars of OOP?",
    difficulty: "Easy",
    answer: "Encapsulation: binding data and methods. Inheritance: deriving new classes. Polymorphism: same interface different implementations. Abstraction: hiding implementation details.",
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra"],
  },
  {
    id: 8,
    subject: "OOP",
    question: "What is the difference between overloading and overriding?",
    difficulty: "Easy",
    answer: "Overloading: same method name, different parameters (compile-time). Overriding: redefining parent class method in child class (runtime).",
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra"],
  },
  {
    id: 9,
    subject: "SQL",
    question: "Write a query to find the second highest salary from an Employee table.",
    difficulty: "Medium",
    answer: "SELECT MAX(salary) FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee); Or use DENSE_RANK().",
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra"],
  },
  {
    id: 10,
    subject: "SQL",
    question: "What is the difference between INNER JOIN and LEFT JOIN?",
    difficulty: "Easy",
    answer: "INNER JOIN returns only matching rows from both tables. LEFT JOIN returns all rows from left table and matching rows from right table (NULL for non-matching).",
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra"],
  },
  {
    id: 11,
    subject: "DBMS",
    question: "Explain ACID properties with examples.",
    difficulty: "Hard",
    answer: "Atomicity: All or nothing. Consistency: Valid state before and after. Isolation: Concurrent transactions don't interfere. Durability: Committed changes persist.",
    companies: ["amazon", "google", "microsoft", "adobe"],
  },
  {
    id: 12,
    subject: "DBMS",
    question: "How would you design a database schema for Amazon's product catalog?",
    difficulty: "Expert",
    answer: "Consider products, categories, sellers, inventory, pricing tables with proper indexing, partitioning for scalability, and read replicas for high traffic.",
    companies: ["amazon", "google", "microsoft", "adobe"],
  },
  {
    id: 13,
    subject: "Operating System",
    question: "Explain virtual memory and how it works.",
    difficulty: "Hard",
    answer: "Virtual memory allows execution of processes not completely in memory using paging. Page table maps virtual to physical addresses. Page faults trigger loading from disk.",
    companies: ["amazon", "google", "microsoft", "adobe"],
  },
  {
    id: 14,
    subject: "Operating System",
    question: "What is the difference between process and thread?",
    difficulty: "Medium",
    answer: "Process: independent, separate memory space, heavy. Thread: lightweight, shares memory within process, faster context switching.",
    companies: ["amazon", "google", "microsoft", "adobe"],
  },
  {
    id: 15,
    subject: "Computer Networks",
    question: "Explain how DNS resolution works.",
    difficulty: "Medium",
    answer: "Browser checks cache -> queries DNS resolver -> root server -> TLD server -> authoritative nameserver -> returns IP address -> browser connects.",
    companies: ["amazon", "google", "microsoft", "adobe"],
  },
  {
    id: 16,
    subject: "Computer Networks",
    question: "Explain load balancing and its algorithms.",
    difficulty: "Hard",
    answer: "Load balancing distributes traffic across servers. Algorithms: Round Robin, Least Connections, IP Hash, Weighted Round Robin. ELB, NGINX, HAProxy are common tools.",
    companies: ["amazon", "google", "microsoft", "adobe"],
  },
  {
    id: 17,
    subject: "OOP",
    question: "What is the diamond problem in multiple inheritance?",
    difficulty: "Medium",
    answer: "The diamond problem occurs when a class inherits from two classes that share a common ancestor, causing ambiguity. Java solves this with interfaces, C++ with virtual inheritance.",
    companies: ["amazon", "google", "microsoft", "adobe"],
  },
  {
    id: 18,
    subject: "OOP",
    question: "Explain the SOLID principles.",
    difficulty: "Hard",
    answer: "S: Single Responsibility. O: Open/Closed. L: Liskov Substitution. I: Interface Segregation. D: Dependency Inversion.",
    companies: ["amazon", "google", "microsoft", "adobe"],
  },
  {
    id: 19,
    subject: "SQL",
    question: "Write a query to find departments with more than 5 employees.",
    difficulty: "Medium",
    answer: "SELECT department_id, COUNT(*) FROM employees GROUP BY department_id HAVING COUNT(*) > 5;",
    companies: ["amazon", "google", "microsoft", "adobe"],
  },
  {
    id: 20,
    subject: "SQL",
    question: "Explain indexing and different types of indexes.",
    difficulty: "Hard",
    answer: "Indexes speed up data retrieval. Types: B-Tree, Hash, Bitmap, Clustered, Non-clustered, Composite, Unique, Full-text. Trade-off: faster reads, slower writes.",
    companies: ["amazon", "google", "microsoft", "adobe"],
  },
];

export function getTechnicalQuestionsByCompany(companyId: string): TechnicalQuestion[] {
  return technicalQuestions.filter(q => q.companies.includes(companyId));
}

export function getTechnicalQuestionsBySubject(subject: string): TechnicalQuestion[] {
  return technicalQuestions.filter(q => q.subject === subject);
}
