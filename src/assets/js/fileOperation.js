const glob = require('glob'),
			path = require('path'),
			fs  = require('fs');

export function classBy(type, currPath){
	let fileExts = [], files = [];
	if(currPath != null){
		switch (type) {
			case "File Extension":
				//Get File's from Current Directory
				fs.readdir(currPath, (err, items) => {
					if (err) {
						console.error('Unable to scan directory: ' + err);
						return;
					}
					let i = 0;
					items.forEach((item) => {
						if (!fs.statSync(currPath + '/' + item).isDirectory()) {
							// file
							files.push({name:item, index:i});
							i++;
						}
					});
				});
	
				//Get File's File Extension
				files.forEach((file) => {
					if(!fileExts.includes(path.extname(file)))
						fileExts.push(path.extname(file));
				});
				fileExts.sort();
	
				
				fileExts.forEach((fileExt) => {
					glob(currPath + `/**/*${fileExt}`, {}, (err, files)=>{
						files.forEach((file) => {
							fs.rename(currPath+'/'+file, currPath+'/'+fileExt+'/'+file)
						})
					})
				})
				break;
		}
	}
	else{
		console.error(this.name+": Parameters not be null!");
	}
};

export function getIconFromExtension(ext){
	const fileExtensions = [
		{
			ext:'.html',
			icon: ''
		},
		{
			ext:'.css',
			icon: ''
		},
		{
			ext:'.vue',
			icon: ''
		},
		{
			ext:'.jsx',
			icon: ''
		},
		{
			ext:'.xls',
			icon: ''
		},
		{
			ext:'.xlsx',
			icon: ''
		},
		{
			ext:'.doc',
			icon: ''
		},
		{
			ext:'docx',
			icon: ''
		},
		{
			ext:'.txt',
			icon: ''
		},
		{
			ext: '.mp3',
			icon: ''
		},
		{
			ext: '.png',
			icon: ''
		},
		{
			ext: '.jpg',
			icon: ''
		},
		{
			ext:null,
			icon:''
		},
	];
	
	fileExtensions.forEach((fileExtension) => {
		if(fileExtension.ext == ext){
			return fileExtension.icon;
		}
	});
}