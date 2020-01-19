const { app, dialog, BrowserWindow, ipcMain } = require('electron');
const {classBy} = require('../fileOperation.js');
let win;

let template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open Folder',
        accelerator: 'CmdOrCtrl+O',
        click() {
					dialog.showOpenDialog(
						{
							properties: [
								'openDirectory',
								'multiSelections',
							],
						}
					); 
				},
				role: 'opendirectory'
      },
      {
        label: 'Save Classification',
        accelerator: 'CmdOrCtrl+S',
        click() { saveFile(); }
      }
    ]
  },
	{
		label: 'Classes By',
		submenu: [
			{
				label: 'File Extension',
				click(){
					let currPath = "";
					ipcMain.on('SendCurrPath',(event, currPath) => {
						currPath = currPath;
					});
					console.log(currPath);
					classBy("File Extension", currPath);
				}
			},
		]

	},
	{
		label: 'About',
		submenu: [
			{
				label: 'Version',
				click(){

				}
			},
			{
				label: 'Check for Updates',
				click(){
					require('../popUpWindows/infoWindow.js');
				}
			}
		]
	}
];

if (process.platform == 'darwin') {
  template.unshift({
    label: app.getName(),
    submenu: [
      {
        label: 'Services',
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: 'Hide ' + app.getName(),
        accelerator: 'Command+H',
        role: 'hide'
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Alt+H',
        role: 'hideothers'
      },
      {
        label: 'Show All',
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() { app.quit(); }
      },
    ]
  });
}

if(process.env.NODE_ENV !== 'production'){
	template.push(
		{
			label: 'Dev Tools',
			submenu: [
				{
					label: 'Open Dev Tools',
					accelerator: 'CmdOrCtrl+Shift+I',
					role: 'toggledevtools'
				},
				{role: 'reload'},
				{role: 'forcereload'}
			]
		}
	)
}

module.exports = template;