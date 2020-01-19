import { ipcMain, ipcRenderer } from 'electron';

const {classBy} = require('../fileOperation.js');

export const classificationTemplate = [
	{
    label: 'File Extension',
    click(){
			ipcRenderer.on('SendCurrPath', (event, arg) => {
				classBy('File Extension', arg.currPath);
			})
		}
  },
];