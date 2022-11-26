import munkres from 'munkres-js';
import xlsx from 'xlsx';
import { dialog } from 'electron';

export const assignTeams = (_, costMatrix) => {
  return munkres(costMatrix);
};

export const importTeamInfo = () => {
  const filename = dialog.showOpenDialogSync({
    properties: ['openFile'],
    filters: [
      {
        name: 'CSV',
        extensions: ['csv'],
      },
    ],
  });

  if (filename === null || filename === undefined) {
    return null;
  }

  // Import the work workbook
  const wb = xlsx.readFile(filename[0], {
    raw: true,
  });

  // Read the csv file, hopefully...
  return xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
    range: 'A3:C100',
  });
};
