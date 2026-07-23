/**
 * Types for the Finance MCQ Prep Studio (CMT, CFA, CFP)
 */

export type CertType = 'CMT' | 'CFA' | 'CFP' | 'FRM';
export type CertLevel = 'Level 1' | 'Level 2' | 'Level 3';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  category: string;
  cert: CertType;
  level: CertLevel;
  isCustom?: boolean;
}

export interface TopicWeight {
  name: string;
  weight: string;
  description: string;
}

export interface SyllabusInfo {
  cert: CertType;
  level: CertLevel;
  topics: TopicWeight[];
  lastUpdated: string;
  summary: string;
  sourceLinks?: Array<{ title: string; uri: string }>;
}

export interface GenerationRequest {
  cert: CertType;
  level: CertLevel;
  topic?: string;
  count: number;
}

export interface CustomQuestionInput {
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  category: string;
  cert: CertType;
  level: CertLevel;
}

export interface StudentInfo {
  name: string;
  email: string;
  phone: string;
  isPaid?: boolean;
  subscriptionEndsAt?: number;
}

