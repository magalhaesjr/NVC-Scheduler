/**
 * Defines types and functions related to NVC template usage
 */
import { Schedule } from './schedule';

export interface DbTemplate {
  id: string;
  numTeams: number;
  numWeeks: number;
  numCourts: number;
  numByes: number;
  hasPools: boolean;
  minMatches: number;
  balanced: boolean;
  equalMatches: boolean;
  description: string;
  title: string;
  season: string;
  schedule: Schedule;
}

export type Season = 'beach' | 'indoor';
export const TEMPLATE_CHANGE = 'scheduler:changeSeason';

export const buildSchedule = (template: DbTemplate) => {
  return template;
};

export const importFromDatabase = (dbTemplate: DbTemplate) => {
  return dbTemplate;
};
