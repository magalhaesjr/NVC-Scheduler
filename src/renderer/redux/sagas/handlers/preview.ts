import { put, select } from 'redux-saga/effects';
import { selectSchedule } from '../../schedule';
import type { LeagueNight } from '../../schedule';
import type { Week } from '../../../../domain/schedule';
import type { Team } from '../../../../domain/teams';
import { generateTeamPreview, TeamPreview } from '../../../../domain/preview';
import { selectTeams } from '../../teams';
import { setTeamPreviews } from '../../preview';

export default function* handleGeneratePreviews() {
  const schedule: LeagueNight[] = yield select(selectSchedule);
  const teams: Team[] = yield select(selectTeams);

  // Convert schedule weeks to string
  const weeks: Week<string>[] = schedule.map((w) => {
    return { ...w, date: w.date ? w.date.toJSON() : '' };
  });

  // Create previews for all teams
  const teamPreviews: TeamPreview[] = teams.map((t) =>
    generateTeamPreview(t.teamNumber, weeks)
  );

  // Send all team previews to the stores
  yield put(setTeamPreviews(teamPreviews));
}
