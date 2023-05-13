/* eslint-disable @typescript-eslint/no-explicit-any */
const fetchTeams = async () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const teamSheets = await window.api.importTeamInfo();

  if (teamSheets === null) {
    return null;
  }

  // Find the mapping code cell, since they change the name every so many years
  let col = '';

  ['Mapping Code', 'Team/Division IDs'].forEach((cName) => {
    if (cName in teamSheets[0]) {
      col = cName;
    }
  });

  if (col.length === 0) {
    throw new Error('Could not find mapping codes in csv');
  }

  return teamSheets
    .filter((s: any) => s['Page Type'] === 'Team')
    .map((s: any, ind: number) => ({
      teamName: s['Page Title'],
      teamNumber: ind + 1,
      mappingCode: s[col],
    }));
};

export default fetchTeams;
