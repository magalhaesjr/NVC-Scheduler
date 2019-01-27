/*Import required modules*/
const electron = require('electron');
const path = require('path');
const url = require('url');

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
const ISMAC_ENV = process.platform == 'darwin';

//All windows should be managed from this file
//main window variable
let mainWindow;
//Template tool window
let toolWin=null;

//Menus
let mainMenu;
let toolMenu;

//When the app is ready open up the main window
app.on('ready', () => {
  //Initialize the main windoow (800x600 by default)
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    title: 'NVC Scheduler'
  });

  //Now open up the file which displays the main program
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, "src/mainWindow.html"),
    protocol: 'file:',
    slashes: true
  }));

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
          { label: 'From Template',
            click() {
              //TODO choose template and then initiailize schedule from it
            },
          },
          {label: 'Automatically',
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
        accelerator: ISMAC_ENV ? 'Command+Q' : 'Ctrl+Q',
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
              nodeIntegration: true}
            });

            toolWin.loadURL(url.format({
              pathname: path.join(__dirname, "src/templateTool/templateTool.html"),
              protocol: 'file:',
              slashes: true
            }));

            //Hide the main window
            mainWindow.hide();
            toolWin.openDevTools();
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
//Main menu for the template tool
const templateToolMenu = [
  { label: 'Database',
    submenu: [{
      label: 'Add excel sheet to db',
      click(){
        //Open a file input window to grab the filename to upload
        let filename = dialog.showOpenDialog({ properties: [ 'openFile'], filters: [{ name: 'XLSX', extensions: ['xlsx'] }]});

        //send the filename to the tool window
        toolWin.webContents.send('xlsx-file-input',filename);
      },
    },
    {label: 'Load Template'}]}];
