/* eslint-disable @typescript-eslint/no-explicit-any */
const fetchTeams = async () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const teamSheets = await window.api.importTeamInfo();

  if (teamSheets === null) {
    return null;
  }

  return teamSheets
    .filter((s: any) => s['Page Type'] === 'Team')
    .map((s: any, ind: number) => ({
      teamName: s['Page Title'],
      teamNumber: ind + 1,
      mappingCode: s['Mapping Code'],
    }));
};

export default fetchTeams;
