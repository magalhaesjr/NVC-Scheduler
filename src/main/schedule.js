/* eslint-disable no-console */
import { dialog } from 'electron';
import fs from 'fs';

const saveSchedule = (_, channel, msg) => {
  // Pull data from message
  const { outputData, byeData } = msg;

  // Open a file dialog to determine the output file
  let filename = dialog.showSaveDialogSync({
    filters: [
      {
        name: 'CSV',
        extensions: ['csv'],
      },
    ],
  });

  if (typeof filename === 'undefined') {
    return;
  }
  // Write all of the data at once
  fs.writeFile(filename, outputData, (err) => {
    if (err) {
      console.log(
        'Some error occured - file either not saved or corrupted file saved.'
      );
      console.log(filename);
    } else {
      console.log("It's saved!");
    }
  });

  filename = filename.replace('.csv', '_ByeTable.csv');
  // Write all of the data at once
  fs.writeFile(filename, byeData, (err) => {
    if (err) {
      console.error(
        'Some error occured - file either not saved or corrupted file saved.'
      );
      console.log(filename);
    } else {
      console.log("It's saved!");
    }
  });
};

export default saveSchedule;
