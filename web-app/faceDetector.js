const path = require('path');
const fs = require('fs');
const fr = require('face-recognition');
var Regex = require('regex');

var faceDetectorAndClipper = (dirPath,imgSize) => {
	const detector = fr.FaceDetector();
	const allFiles = fs.readdirSync(dirPath);
	allFiles.forEach((picName,i) => {
		const faceImages = detector.detectFaces(
			fr.loadImage(path.join(dirPath, picName)), imgSize);
		faceImages.forEach((img,j) => fr.saveImage(
			path.join(dirPath, `detected_${i}_${j}.png`), img));
	});
}

var learnNewFaces = (dirPath,rollNo,pathToExistingModel) => {
	const recognizer = fr.FaceRecognizer();
	if(fs.existsSync(pathToExistingModel)){ //load the model if it exists
		const modelState = require(pathToExistingModel);
		recognizer.load(modelState);
	}

	var regex = new Regex(/detected(0|1|2|3|4|5|6|7|8|9|_)*.png/);
	const allFiles = fs.readdirSync(dirPath);
	allFiles.forEach((picName) => {
		if(regex.test(picName)){
			var image = [];
			image.push(fr.loadImage(path.join(dirPath, picName)));
			recognizer.addFaces(image, rollNo);	
		}
	});

	const modelState = recognizer.serialize();
	fs.writeFileSync(pathToExistingModel, JSON.stringify(modelState));
}

var learning = (dirPath,pathToExistingModel) => {
	const allRolls = fs.readdirSync(dirPath);
	allRolls.forEach((rollNo) => 
		learnNewFaces(path.join(dirPath, rollNo), rollNo, pathToExistingModel));
}

var recognizeFaces = (recognizer,faceImgPath) => {
	faceImg = fr.loadImage(faceImgPath);
	const bestPrediction = recognizer.predictBest(faceImg);
	console.log(bestPrediction.className);
}

module.exports = {
	faceDetectorAndClipper, 
	learnNewFaces,
	learning,
	recognizeFaces
}


