export {
  aptitudeQuestions,
  getAptitudeQuestionsByCompany,
  getAptitudeQuestionsByTopic,
  getAptitudeQuestionsByCategory,
} from "./aptitude/questions";
export type { AptitudeQuestion } from "./aptitude/questions";

export {
  codingProblems,
  getCodingProblemsByCompany,
  getCodingProblemsByTopic,
} from "./coding/problems";
export type { CodingProblem } from "./coding/problems";

export {
  technicalQuestions,
  technicalSubjects,
  getTechnicalQuestionsByCompany,
  getTechnicalQuestionsBySubject,
} from "./technical/questions";
export type { TechnicalQuestion } from "./technical/questions";

export {
  hrQuestions,
  hrQuestionCategories,
  getHRQuestionsByCompany,
} from "./hr/questions";
export type { HRQuestion } from "./hr/questions";

export {
  getCompanyAptitudeQuestions,
  getCompanyCodingProblems,
  getCompanyTechnicalQuestions,
  getCompanyHRQuestions,
  getCompanyAptitudeCategories,
  getCompanyCodingTopics,
  getCompanyTechnicalSubjects,
} from "./companies/mappings";
