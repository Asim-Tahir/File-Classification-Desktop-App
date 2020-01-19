const {BrowserWindow} = require('electron');
const {join} = require('path');

export class infoWindow {
	constructor(title,desc){
		let infoWindow = new BrowserWindow({
			frame: true,
			width: 250,
			height: 50,
			center: true,
		});

		console.log(__dirname);
		//infoWindow.loadURL(join(__dirname+))
		return infoWindow;
	}
}