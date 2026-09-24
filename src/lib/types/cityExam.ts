export type CityExamQuestionType = "verbal" | "practical";

export type CityExamQuestion = {
  topic: string;
  question: string;
  answer: string;
  type?: CityExamQuestionType;
};

export type CityExamRules = {
  format: string;
  penalty: string;
};

export type CityExamSection = {
  title: string;
  rules?: CityExamRules;
  questions: Record<string, CityExamQuestion>;
};

export type CityExamData = {
  CityExam: CityExamSection;
  BeCityExam: CityExamSection;
  CdCityExam: CityExamSection;
  CeDeCityExam: CityExamSection;
};

export type CityExamCategoryKey = "b" | "be" | "cd" | "cede";
