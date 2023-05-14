import fs from 'fs';
import xlsx from 'xlsx';

// Load templates from stored file
export const importTemplates = (templateFile) => {
  // Read the templates from the json file into a raw buffer
  const rawBuffer = fs.readFileSync(templateFile);

  // Parse into JSON objects
  const storedTemplates = JSON.parse(rawBuffer);
  // Sort templates by numTeams
  storedTemplates.sort((a, b) => {
    return a.numTeams - b.numTeams;
  });
  // Round Byes to be reasonable
  return storedTemplates.map((t) => {
    t.numByes = Math.round(t.numByes * 10) / 10;
    return t;
  });
};

// Write a new template to file
export const writeTemplate = (templateFile, template) => {
  fs.writeFileSync(templateFile, template);
};

// Reads a sheet from a template
export const readSheet = (_, sheet) => {
  return xlsx.utils.sheet_to_json(sheet);
};
