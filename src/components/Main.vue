<template>
		<main>
		<section id="sidebar">
			<div class="group">
				<a 
					:class="{active: selectedIndex == i}"
					@click="selectedIndex = i; goDefinedDir(folder.name);"
					v-for="(folder, i) in definedFolder"
					:key="i">
						<span :class="'icon '+folder.icon"></span>{{folder.name}}
				</a>
			</div>
			
			<button id="add" @click="toggleClassMenu()"> <!-- :TODO: sınıfladırma elemanları için menu açılacak -->
				<span class="icon icon-dots"></span>
			</button>
		</section>
		
		<section id="content">
			<header>
				<button id="goBack" @click="this.goBack()"></button>
				<h1 id="appName">{{appName}}</h1>
			</header>

			<input 
				v-model="currPath"
				type="text"
				id="path"
				@blur="getDirsAndFiles(currPath)"
				@keydown.enter="getDirsAndFiles(currPath)"/>

			<div id="breadcrumb">
				<a 
					:path="folder"
					v-for="(folder,i) in pathFolders" :key="i"
					@click="goClickedDir(folder)">
						{{folder}}
				</a>
			</div>
			
			<div id="root">
				<a
					class="dir"
					@click="getDirsAndFiles(dir.path)"
					v-for="(dir,i) in directories"
					:key="i">
						<span>{{dir.name}}</span>
				</a>

				<a
					class="file"
					v-for="file in files" :key="file.index+' '+file.name">
						<span>{{file.name}}</span>
				</a>
			</div>
		</section>
	</main>
</template>

<script>
	const { ipcMain, ipcRenderer, Menu, shell } = require('electron');
	const fs = require('fs');

	const { classBy, getIconFromExtension } = require('../assets/js/fileOperation.js');
	
	export default {
		name: 'Main',
		methods: {
			goDefinedDir(dirType){
				let dir = {
					UserHome: null,
					Desktop: null,
					Downloads: null,
					Documents: null,
					Trash: null,
					Favorites: this.favorites
				};
				const user = require("os").userInfo().username
			
				switch (process.platform) {
					case "linux":
						dir.Desktop = `/home/${user}/Desktop`;
						dir.Documents = `/home/${user}/Documents`;
						dir.Downloads = `/home/${user}/Downloads`;
						dir.UserHome = `/home/${user}`;
						dir.Trash = `/home/${user}/.local/share/Trash`;
						break;

					case "darwin":
						dir.Desktop = `/Users/${user}/Desktop`;
						dir.Documents = `/Users/${user}/Documents`;
						dir.Downloads = `/Users/${user}/Downloads`;
						dir.UserHome = `/Users/${user}`;
						dir.Trash = `/Users/${user}/.Trash`;
			
					case "win32":
						dir.Desktop = `C:\\Users\\${user}\\Desktop`;
						dir.Documents = `C:\\Users\\${user}\\Documents`;
						dir.Downloads = `C:\\Users\\${user}\\Downloads`;
						dir.UserHome = `C:\\Users\\${user}`;
						dir.Trash = `C:\\$Recycle.Bin`;
						break;
				}
			
				switch (dirType) {
					case "Favorite":
						this.directories = [], this.files = [];
						this.directories = this.favorites;
						this.currPath = "/$Favorites";
						this.selectedIndex = 0;
						break;

					case "Desktop":
						this.getDirsAndFiles(dir.Desktop);
						break;
					
					case "Documents":
						this.getDirsAndFiles(dir.Documents);
						break;
			
					case "Downloads":
						this.getDirsAndFiles(dir.Downloads);
						break;

					case "User Home":
						this.getDirsAndFiles(dir.UserHome);
						break;
			
					case "Trash":
						this.getDirsAndFiles(dir.Trash);
						break;
				
					default:
						console.error("Failed to match specified folders");
						break;
				}
			},

			getDirsAndFiles(dirPath, defaultUserFolder="Desktop") {
				this.directories=[], this.files = []; //clear directories and files
				if(dirPath == null){
					const user = require("os").userInfo().username
					switch (process.platform) {
						case "linux":
							dirPath = `/home/${user}/${defaultUserFolder}`;
							break;
					
						case "darwin":
							dirPath = `/Users/${user}/${defaultUserFolder}`;
							break;

						case "win32":
							dirPath = `C:\\Users\\${user}\\${defaultUserFolder}`;
							break;
					}
				}

				fs.readdir(dirPath, (err, items) => {
					if (err) {
						console.error('Unable to scan directory: ' + err);
						return;
					}
					let i = 0;
					items.forEach((item) => {
						if (fs.statSync(dirPath + '/' + item).isDirectory()) {
							// dir
							this.directories.push(
								{
									name:item,
									path:this.currPath+'/'+item
								}
							);
						} 
						else {
							// file
							this.files.push(
								{
									name:item,
									index:i,
									path:this.currPath+'/'+item
								}
							);
							i++;
						}
					});
				});

				this.currPath = dirPath;
			},

			goBack() {
				this.getDirsAndFiles(this.currPath.substring(0, this.currPath.lastIndexOf("/") + 1));
			},

			goClickedDir(folderName){
				let newPath='';
				this.pathFolders.splice(0,this.pathFolders.indexOf(folderName)).forEach((folder) => {
					newPath += `/${folder}`;
				});
				this.getDirsAndFiles(newPath+'/'+folderName)
			},

			toggleClassMenu(){
				ipcRenderer.on('DisplayClassificationMenu', (event,arg) => {
					arg.appMenu.popup(arg.win, this.position.x, this.position.y);
				});
			},

			classBy,
			getIconFromExtension
		},
			
		data() {
			return {
				currPath: '',
				directories: [],
				files: [],
				selectedIndex: 2,
				definedFolder: [
					{
						name: 'Favorite',
						icon: 'icon-star',
					},
					{
						name: 'User Home',
						icon: 'icon-house',
					},
					{
						name: 'Desktop',
						icon: 'icon-computer'
					},
					{
						name: 'Downloads',
						icon: 'icon-download'
					},
					{
						name: 'Documents',
						icon: 'icon-folder'
					},
					{
						name: 'Trash',
						icon: 'icon-trash'
					},
					{
						name: 'Add Folder',
						icon: 'icon-plus'
					}
				],
				appName: 'File Classification App',
				favorites: [
					{
						name: 'stack Folder',
						path: '/mnt/AsimTahir/AsimTahir/Programming/Electron.js/stack'
					}
				]
			}
		},

		mounted(){
			this.goDefinedDir('Favorite');
		},

		computed: {
			pathFolders(){
				if(this.currPath.startsWith('/')){
					return this.currPath.substr(1).split('/');
				}
				else{
					return this.currPath.split('/');
				}
			},
		},
		
		watch: {
			directories: {
				deep: false,
				immediate: true,
				handler: (val, oldVal) => {
					oldVal = val;
				}
			},
			files: {
				deep: false,
				immediate: true,
				handler: (val, oldVal) => {
					oldVal = val;
				}
			},
			currPath: {
				deep: false,
				immediate: true,
				handler: (val, oldVal) => {
					oldVal = val;
					ipcRenderer.send('SendCurrPath', {currPath:val});
				}
			}
		},
	}
</script>

<style>
	*, *:before, *:after {
		box-sizing: border-box;
		-webkit-font-smoothing: antialiased;
		outline: none;
		user-select: none;
		-moz-user-select: none;
		-webkit-user-select: none;
		-ms-user-select: none;
	}

	html {
		height: 100%;
		max-height: 100%;
	}

	@font-face {
		font-family: 'Bariol Serif';
		src: url('../assets/fonts/Bariol_Serif_Regular.otf');
	}

	body {
		font-family: 'Bariol Serif';
		font-weight: bold;
		letter-spacing: .5px;
		padding: 0;
		margin: 0;
		height: 100%;
		overflow: hidden;
	}

	a {
		text-decoration: none;
		color: #444;
	}

	main {
		width: 100%;
		height: 100%;
		display: flex;
		background: #fff;
	}

	.icon {
		width: 24px;
		height: 24px;
		display: inline-block;
		vertical-align: middle;
		margin-right: 25px;
		background-repeat: no-repeat;
		background-color: transparent;
		background-position: center;
	}

	.icon.icon-star { background: url('../assets/icons/star.svg'); }
	.icon.icon-computer { background: transparent url('../assets/icons/computer.svg'); }
	.icon.icon-download { background: transparent url('../assets/icons/download.svg'); }
	.icon.icon-folder { background: transparent url('../assets/icons/folder.svg'); }
	.icon.icon-house { background: transparent url('../assets/icons/house.svg'); }
	.icon.icon-trash { background: transparent url('../assets/icons/trash.svg'); }
	.icon.icon-plus { background: transparent url('../assets/icons/plus.svg'); }
	.icon.icon-file { background: transparent url('../assets/icons/fileExtensionIcons/default.svg'); }
	.icon.icon-dots { background: transparent url('../assets/icons/menu/dots.svg'); }

	#sidebar {
		position: relative;
		display: flex;
		align-items: center;
		flex-direction: column;
		width: 100%;
		max-width: 300px;
		height: 50em;
		background: #F7F8FC;
		padding-top: 80px;
		border-right: 1px solid #eee;
	}

	#sidebar .group {
		display: flex;
		flex-direction: column;
		margin-bottom: 40px;
		width: 100%;
	}

	#sidebar .group span {
		text-transform: uppercase;
		font-size: 12px;
		margin-bottom: 5px;
	}

	#sidebar .group a {
		position: relative;
		text-decoration: none;
		color: #1F2E42;
		font-weight: 600;
		line-height: 40px;
		font-size: 15px;
		margin-bottom: 7px;
		padding-left: 50px;
		cursor: pointer;
		transition: all ease-in-out .2s;
    -moz-transition: all ease-in-out .2s;
    -o-transition: all ease-in-out .2s;
    transition: all ease-in-out .2s;
	}

	#sidebar .group a.active {
		color: #00C4FF;
		transition: all ease-in-out .2s;
    -moz-transition: all ease-in-out .2s;
    -o-transition: all ease-in-out .2s;
    transition: all ease-in-out .2s;
	}

	#sidebar .group a.active:before {
		content: "";
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		height: 38px;
		width: 4px;
		background: #00C4FF;
		transition: all ease-in-out .2s;
    -moz-transition: all ease-in-out .2s;
    -o-transition: all ease-in-out .2s;
    transition: all ease-in-out .2s;
	}

	#content {
		display: flex;
		align-items: flex-start;
		flex-direction: column;
		height: 100%;
		padding: 40px;
		width: calc(100% - 300px);
	}

	#content header {
		display: flex;
		align-items: center;
		margin-bottom: 30px;
		width: 100%;
	}

	button#goBack {
		outline: none;
		background: transparent url('../assets/icons/left-arrow.svg') no-repeat;
		background-size: 30px 30px;
		background-position: center;
		width: 50px;
		height: 50px;
		padding: 0;
		cursor: pointer;
		border: none;
		border-radius: 50%;
		transition: all .5s;
	}

	button#goBack:hover {
		box-shadow: 0 3px 15px rgba(0, 0, 0, 0.2);
		color: #fff;
		transition: all .5s;
	}

	#content h1 {
		font-size: 40px;
		margin: 0 0 0 30px;
	}

	input#path{
		width: 50%;
		height: 40px;
		font-family: 'Bariol Serif';
		font-size: 14pt;
		font-weight: bold;
		padding: 0 20px;
		letter-spacing: 1px;
		border: 2px solid #179fc9;
		border-radius: 30px;
		overflow-x: auto;
		box-shadow: 0px 4px #179fc9;
		color: #179fc9;
	}

	input#path::selection{
		background-color: #1aaad6;
		color: white;
	}

	#breadcrumb {
		font-size: 16px;
		font-weight: 300;
		letter-spacing: 0.2px;
		margin-bottom: 30px;
		background: transparent;
		display: flex;
		width: 100%;
		align-items: center;
		padding: 0;
		margin-top: 15px;
	}

	#breadcrumb a {
		position: relative;
		padding-right: 25px;
		margin-right: 15px;
		cursor: pointer;
		background: transparent;
		transition: all .5s;
		padding: 3px 8px;
	}

	#breadcrumb a::before{
		content: "";
		position: absolute;
		left: 5px;
		width: 15px;
		height: 15px;
		transform: translateX(-10px);
		transition: all .3s ease-out;
	}

	#breadcrumb a:hover::before {
		transform: translateX(0px);
		transition: all .4s ease-in;
		background: url('../assets/icons/folder.svg') no-repeat;
		background-color: #ffab35;
	}

	#breadcrumb a:hover {
		background: #FFC067;
		transition: all .3s ease-in;
		border-radius: 8px;
		padding: 3px 12px 3px 24px;
	}

	#breadcrumb a::after {
		content: "";
		position: absolute;
		background: url('../assets/icons/right-arrow.svg') no-repeat;
		right: -12px;
		width: 18px;
		height: 18px;
		margin-left: 3px;
		top: 4px;
		transition: all .5s;
	}

	#breadcrumb a:hover::after{
		right: -16px;
		transition: all .5s;
	}

	#breadcrumb a:last-child::after{
		display: none;
	}

	#root {
		width: 100%;
		overflow-y: auto;
		max-height: 480px;
	}

	/*============== Scrollbar =================*/
		#root::-webkit-scrollbar {
			width: 15px;
		}

		/* Track */
		#root::-webkit-scrollbar-track {
			margin-top: 0;
			margin-bottom: 0;
		}

		/* Thumb */
		#root::-webkit-scrollbar-thumb {
			transition: background-color .5s;
			-webkit-transition: background-color .5s;
			background-color: #999;
			border-width: 10px;
			-webkit-border-radius: 10px;
			border-radius: 10px;
		}

		/* Thumb on hover */
		#root::-webkit-scrollbar-thumb:hover {
			transition: background-color .5s;
			-webkit-transition: background-color .5s;
			background-color: #ADADAD;
			opacity: .9;
		}

		#root::-webkit-scrollbar-corner {
			background-color: transparent;
		}
		/*===========================================*/

	#root a {
		position: relative;
		width: 100%;
		max-width: 200px;
		display: inline-flex;
		background: #fff;
		border-radius: 10px;
		min-height: 60px;
		align-items: center;
		justify-content: flex-start;
		padding-left: 25px;
		text-decoration: none;
		color: #444;
		margin-bottom: 40px;
		margin-right: 40px;
		box-shadow: 0 8px 15px 3px rgba(134, 134, 134, 0.07);
		overflow: hidden;
		transition: all .5s;
	}

	#root a span {
		z-index: 2;
		padding-left: 20px;
		padding: 10px 10px 10px 20px;
	}

	#root a:hover {
		box-shadow: 0 8px 15px 5px rgba(134, 134, 134, 0.2);
		color: #fff;
		transition: all .5s;
	}

	#root a.file::after {
		content: "";
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		height: 100%;
		width: 4px;
		z-index: 1;
		transition: all .5s;
		background: #00C4FF;
	}

	#root a.dir::before{
		content: "";
		position: absolute;
		left: 10px;
		width: 25px;
		height: 25px;
		z-index: 3;
		background: url('../assets/icons/folder.svg') no-repeat;
		transition: all .3s ease-in-out;
		opacity: 0;
		transform: translateX(-10px);
	}

	#root a.dir:hover::before{
		transition: all .5s ease-in-out;
		opacity: 1;
		transform: translateX(0);
		fill: #ffa322;
	}

	#root a.file::before{
		content: "";
		position: absolute;
		left: 10px;
		width: 25px;
		height: 25px;
		z-index: 5;
		background: url('../assets/icons/fileExtensionIcons/default.svg') no-repeat;
		transition: all .3s ease-in-out;
		opacity: 0;
		transform: translateX(-10px);
	}

	#root a.file:hover::before{
		transition: all .5s ease-in-out;
		opacity: 1;
		transform: translateX(0);
		fill: #179fc9;
	}

	#root a.dir::after {
		content: "";
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		height: 100%;
		width: 4px;
		z-index: 1;
		transition: all .5s;
		background: #FFC067;
	}

	#root a.dir:hover{
		cursor: pointer;
	}

	#root a.dir:hover::after,
	#root a.file:hover::after {
		right: 0;
		width: 100%;
		transition: all .5s;
	}

	a.file[format=png]:before,
	a.file[format=jpg]:before,
	a.file[format=jpeg]:before {
		content: "";
		position: absolute;
		top: 0; right: 0; left: 0; bottom: 0;
		width: 100%;
		height: 100%;
	}

	#add {
		position: absolute;
		right: -30px;
		top: 37px;
		width: 60px;
		height: 60px;
		border: none;
		border-radius: 50%;
		background: #00C4FF;
		color: #fff;
		cursor: pointer;
		box-shadow: 0 3px 15px rgba(0, 0, 0, 0.1);
		transition: all .5s;
	}

	#add:hover {
		box-shadow: 0 5px 18px rgba(0, 0, 0, 0.3);
		transition: all .5s;
	}

	#add .icon {
		width: 20px;
		height: 20px;
		margin: 0;
		filter: brightness(0) invert(1);
	}
</style>