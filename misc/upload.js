const multer = require('multer');
const fs = require('fs');
const gm = require('gm');
const path = require('path');
const md5 = require('md5');
const request = require('request');

var getExtension = (filename) => {
	var ext = path.extname(filename||'').split('.');
	return ext[ext.length - 1];
}
var makeImageStorageFolder = (hashFilename, folder) => {
	const storageDir = `../parkernel-img-cdn/${folder}`;
	const rootDir = hashFilename.substring(0, 1);
	const subDir = hashFilename.substring(0, 2);
	return new Promise((resolve, reject) => {
		if (!fs.existsSync(`${storageDir}/${rootDir}/`)) {
			fs.mkdir(`${storageDir}/${rootDir}/`, (err) => {
				if (err) {
					reject(err);
				} else {
					if (!fs.existsSync(`${storageDir}/${rootDir}/${subDir}/`)) {
						fs.mkdir(`${storageDir}/${rootDir}/${subDir}/`, (err) => {
							if (err) {
								reject(err);
							} else {
								resolve(`${storageDir}/${rootDir}/${subDir}/`);
							}
						});
					} else {
						resolve(`${storageDir}/${rootDir}/${subDir}/`);
					}
				}
			});
		} else {
			if (!fs.existsSync(`${storageDir}/${rootDir}/${subDir}/`)) {
				fs.mkdir(`${storageDir}/${rootDir}/${subDir}/`, (err) => {
					if (err) {
						reject(err);
					} else {
						resolve(`${storageDir}/${rootDir}/${subDir}/`);
					}
				});
			} else {
				resolve(`${storageDir}/${rootDir}/${subDir}/`);
			}
		}
	});
}
var storage = multer.diskStorage({
	destination: (req, file, callback) => {
		var filename = md5(file.originalname);
		var makeFolderPromise = makeImageStorageFolder(filename, 'parking_pic');
		makeFolderPromise.then((result) => {
			callback(null, result);
		}, (err) => {
			callback(new Error(err));
		});
	},
	filename: (req, file, callback) => {
		callback(null, `${md5(file.originalname)}_${md5(Date.now().toString())}.${getExtension(file.originalname)}`);
	}
});

exports.parkingPhotos = multer({ 
	storage: storage,
	limits: { fileSize: 10000000 },
	fileFilter: (req, file, cb) => {
		if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
			return callback(new Error('Only Images are allowed !'), false);
		}
		cb(null, true);
	}
}).array('parking_images', 20);

exports.imageResizer = (file, cb) => {
	gm(file).autoOrient().resize(2048, 2048).write(file, (err) => {
		if (!err) {
			cb(null);
		} else {
			cb(err);
		}
	});
}

exports.imageProfileDownloader = (user_id, url, type, cb) => {
	var makeFolderPromise = makeImageStorageFolder(user_id, `profile_pic/${type}`);
	makeFolderPromise.then((result) => {
		let filename = `${user_id}_${md5(Date.now().toString())}.jpg`
		gm(request(url)).write(`${result}${filename}`, (err) => {
			if (!err) {
				cb(null, filename);
			} else {
				cb(err, null);
			}
		});
	}, (err) => {
		cb(new Error(err, null));
	});
}