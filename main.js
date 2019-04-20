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

//Menus
let mainMenu;
let toolMenu;

//When the app is ready open up the main window
app.on('ready', () => {
  //Initialize the main windoow (800x600 by default)
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    title: 'NVC Scheduler' ,
    webPreferences:{
    nodeIntegration: true}
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

/*****************************************************************************
 *****                                                                   *****
 *****                        Renderer Thread Comms                      *****
 *****                                                                   *****
 ****************************************************************************/
ipcMain.on('launch-team-preview',(e,teamPreview,teamNum)=>{
  if (previewWin==null)
  {
    previewWin = new BrowserWindow({
      title: 'Team Preview',
      menuBarVisibility: "toggle",
      autoHideMenuBar: true,
      webPreferences:{
      nodeIntegration: true}
    });

    previewWin.loadURL(url.format({
      pathname: path.join(__dirname, "src/previewTeam.html"),
      protocol: 'file:',
      slashes: true
    }));
    //Send rquired info
    previewWin.webContents.on('did-finish-load',()=>{
      previewWin.webContents.send('init-team-preview',teamPreview,teamNum);});
    //Cleanup stuff
    previewWin.on('close', ()=> previewWin=null);
  }else{
    //just send an update
    previewWin.webContents.send('update-team-preview',teamNum);
  }
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
              click() {mainWindow.send('start-template-schedule','beach');}},
              {label: 'For Indoor',
              click() {mainWindow.send('start-template-schedule','indoor');}}
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
              nodeIntegration: true}
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
              toolWin.webContents.send('load-Templates');
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
        let filename = dialog.showOpenDialog({ properties: [ 'openFile'], filters: [{ name: 'XLSX', extensions: ['xlsx'] }]});

        //send the filename to the tool window
        toolWin.webContents.send('xlsx-file-input',filename);
      },
    },
    {label: 'Load Template'}]}];
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
