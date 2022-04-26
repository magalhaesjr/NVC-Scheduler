/*Import required modules*/
const electron = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const munkres = require('munkres-js');
const xlsx = require('xlsx');

//Pull out needed packages from electron
const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  dialog
} = electron;

//Define an environment variable to discern the platform (useful for MAC specific
//crap)
process.env.ISMAC_ENV = process.platform == 'darwin';
process.env.NODE_ENV = 'production';

if (process.env.ISDEV=='true'){
  process.env.NODE_ENV = 'development';
}

//All windows should be managed from this file
//main window variable
let mainWindow;
//Template tool window
let toolWin=null;
//team preview window
let previewWin = null;

// Template file
let templateFile;
if (process.env.NODE_ENV==="production"){
    templateFile = path.join(process.resourcesPath, 'extraResources','Templates.json');
} else{
    templateFile = path.join(__dirname, 'extraResources','Templates.json');
}

//Menus
let mainMenu;
let toolMenu;

//When the app is ready open up the main window
app.whenReady().then(() => {
  //Initialize the main windoow (800x600 by default)
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    title: 'NVC Scheduler' ,
    webPreferences:{
      preload: path.join(__dirname, "src/preload.js")}
  });

  //Now open up the file which displays the main program
  mainWindow.loadFile(path.join(__dirname, "src/mainWindow.html"));

  //MENUS
  toolMenu = Menu.buildFromTemplate(templateToolMenu);
  mainMenu = Menu.buildFromTemplate(menuTemplate);

  //Insert the menu into the main app window
  Menu.setApplicationMenu(mainMenu);
  mainWindow.on('focus',()=>{Menu.setApplicationMenu(mainMenu);mainWindow.show();});

  //Close if the program if the main window is closed
  mainWindow.on('closed', () => {
    app.quit();
  });
});

/*****************************************************************************
 *****                                                                   *****
 *****                       Scheduler Thread Comms                      *****
 *****                                                                   *****
 ***************************************************************************/
//ipcMain.handle('scheduler:launchTeamPreview',(e, channel, teamPreview, teamNum)=>{
ipcMain.handle('scheduler:launchTeamPreview',(e, channel, msg)=>{
  // Pull out data from message
  let teamPreview = msg.teamPreview;
  let teamNum = msg.teamNum;

  if (previewWin===null)
  {
    previewWin = new BrowserWindow({
      title: 'Team Preview',
      menuBarVisibility: "toggle",
      autoHideMenuBar: true,
      webPreferences:{
        preload: path.join(__dirname, "src/preloadPreview.js")
      }
    });

    previewWin.loadURL(url.format({
      pathname: path.join(__dirname, "src/previewTeam.html"),
      protocol: 'file:',
      slashes: true
    }));
    //Send rquired info
    previewWin.webContents.on('did-finish-load',()=>{
      previewWin.webContents.send('preview:initPreview', teamPreview, teamNum);});
    //Cleanup stuff
    previewWin.on('close', ()=> previewWin=null);
  }else{
    //just send an update
    previewWin.webContents.send('preview:updatePreview', teamNum);
  }
});

// Expose team assignment via the hungarian algorithm from node
ipcMain.handle('scheduler:assignTeams', (e, costMatrix) =>{
  return munkres(costMatrix);
});

// Load team info from excel csv
ipcMain.handle('scheduler:importTeamInfo', ()=>{
  let filename = dialog.showOpenDialogSync({
    properties: ['openFile'],
    filters: [{
      name: 'CSV',
      extensions: ['csv']
    }]
  });
console.log(filename);
  //Import the work workbook
  let wb = xlsx.readFile(filename[0], {
    raw: true
  });

  //Read the csv file, hopefully...
  return xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
    range: "A3:C100"
  });
}); 

// Load templates from stored file
ipcMain.handle('scheduler:importTemplates', ()=>{
  // Read the templates from the json file into a raw buffer
  let rawBuffer = fs.readFileSync(templateFile);

  // Parse into JSON objects
  let storedTemplates = JSON.parse(rawBuffer);
  // Sort templates by numTeams
  storedTemplates.sort((a, b) =>{
    return a.numTeams - b.numTeams;
  });
  return storedTemplates;
});

ipcMain.handle('scheduler:saveSchedule', (e, channel, msg)=>{
  // Pull data from message
  console.log(channel);
  console.log(msg);
  let outputData = msg.outputData;
  let byeData = msg.byeData;

  //Open a file dialog to determine the output file
  let filename = dialog.showSaveDialogSync({
    filters: [{
      name: 'CSV',
      extensions: ['csv']
    }]
  });

  if (typeof filename === 'undefined') {
    return;
  }
  //Write all of the data at once
  fs.writeFile(filename, outputData, function(err) {
    if (err) {
      console.log('Some error occured - file either not saved or corrupted file saved.');
      console.log(filename);
      return;
    } else {
      console.log('It\'s saved!');
    }
  });

  filename = filename.replace('.csv', '_ByeTable.csv');
  //Write all of the data at once
  fs.writeFile(filename, byeData, function(err) {
    if (err) {
      console.log('Some error occured - file either not saved or corrupted file saved.');
      console.log(filename);
      return;
    } else {
      console.log('It\'s saved!');
    }
  });
});
/*****************************************************************************
 *****                                                                   *****
 *****                   Template Tool Thread Comms                      *****
 *****                                                                   *****
 ****************************************************************************/
ipcMain.handle('templateTool:writeTemplate',(e, template)=>{
  fs.writeFileSync(templateFile, template);
});

ipcMain.handle('templateTool:readSheet',(e, sheet)=>{
  return xlsx.utils.sheet_to_json(sheet);
});
/*******************************************************************************
 *****                                                                      *****
 *****                               MENUS                                  *****
 *****                                                                      *****
 *******************************************************************************/
const menuTemplate = [{
    label: 'Schedule',
    submenu: [
        {label: 'Initialize',
        submenu: [
          { label: 'Template Schedule',
          submenu: [
            {label:'For Beach',
              click() {mainWindow.webContents.send('start-template-schedule', 'beach');}},
              {label: 'For Indoor',
              click() {mainWindow.send('start-template-schedule', 'indoor');}}
          ]},
          {label: 'Auto-Schedule',
            click() {
              //TODO initialize window for parameter choices then auto generate a
              //schedule
            }
          }
        ]
      },
      {label: 'Load',
        click() {
          //TODO load a previous JSON schedule to continue implementing
        }
      },
      {
        label: 'Quit',
        //need a special case for mac platform
        accelerator: process.env.ISMAC_ENV ? 'Command+Q' : 'Ctrl+Q',
        click() {
          app.quit();
        }
      }
    ]
  },
  {label: 'Tools',
    submenu: [
        {label: 'Template Tool',
        click() {
          //check to see if the template tool is open, and if not then launch it
          if (toolWin==null)
          {
            toolWin = new BrowserWindow({
              title: 'Template Tool',
              webPreferences:{
                preload: path.join(__dirname, "src/templateTool/preload.js")}
            });

            toolWin.loadURL(url.format({
              pathname: path.join(__dirname, "src/templateTool/templateTool.html"),
              protocol: 'file:',
              slashes: true
            }));

            //Hide the main window
            mainWindow.hide();

            //Load the templates when the window is ready
            toolWin.webContents.on('did-finish-load',()=>{
              // Read the templates from the json file into a raw buffer
              let rawBuffer = fs.readFileSync(templateFile);

              // Parse into JSON objects
              let storedTemplates = JSON.parse(rawBuffer);
              // Sort templates by season and then numTeams
              storedTemplates.sort((a, b) =>{
                let diff = a.season.localeCompare(b.season);
                if(diff === 0){
                  diff = a.numTeams - b.numTeams;
                }
                return diff
              });
  
              toolWin.webContents.send('load-Templates', storedTemplates);
            });

            //When the new window is in focus then you set the menu to the tool menu
            toolWin.on('focus',()=>Menu.setApplicationMenu(toolMenu));
            //Cleanup stuff
            toolWin.on('close', ()=> {toolWin=null;Menu.setApplicationMenu(mainMenu);
              mainWindow.show();});
          }
        }
      },
      {label: 'Update Database',
        click() {
          //TODO use nodegit to check repository for new database and download
          //the new one to replace what we have locally
        }
      }
    ]
  }];
  // Add developer tools option if in dev
//if(process.env.NODE_ENV !== "production"){
  menuTemplate.push({
    label: 'Developer Tools',
    submenu:[
      {
        role: 'reload'
      },
      {
        label: 'Toggle DevTools',
        accelerator:process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      }
    ]
  });
//}
//Main menu for the template tool
const templateToolMenu = [
  { label: 'Database',
    submenu: [{
      label: 'Add excel sheet to db',
      click(){
        //Open a file input window to grab the filename to upload
        let filename = dialog.showOpenDialogSync({ properties: [ 'openFile'], filters: [{ name: 'XLSX', extensions: ['xlsx'] }]});
        //Read the workbook from the filename
        let wb = xlsx.readFileSync(filename.toString());

        // msg
        let msg = {
          workbook : wb,
          replace : false
        };

        //send the filename to the tool window
        toolWin.webContents.send('templateTool:importFile', msg);
      },
    },
    {
      label: 'Replace db templates with excel sheet',
      click(){
        //Open a file input window to grab the filename to upload
        let filename = dialog.showOpenDialogSync({ properties: [ 'openFile'], filters: [{ name: 'XLSX', extensions: ['xlsx'] }]});
        
        //Read the workbook from the filename
        let wb = xlsx.readFileSync(filename.toString());

        // msg
        let msg = {
          workbook : wb,
          replace : true
        };

        //send the filename to the tool window
        toolWin.webContents.send('templateTool:importFile', msg);
      },
    },{label: 'Load Template'}]}];
if(process.env.NODE_ENV !== 'production'){
  templateToolMenu.push({
    label: 'Developer Tools',
    submenu:[
      {
        role: 'reload'
      },
      {
        label: 'Toggle DevTools',
        accelerator:process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      }
    ]
  });
}
