import { Component, ViewChild, ElementRef } from '@angular/core';
import { LoadingController } from '@ionic/angular';


import * as faceApi from 'face-api.js';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  MODEL_URL = 'assets/models';
  expressionsList = ["neutral", "happy", "sad", "angry", "fearful", "disgusted", "surprised"] ;


  @ViewChild('image', { static: false }) imageContainer: ElementRef;
  @ViewChild('canvas', { static: false }) canvas: ElementRef;

  constructor(public loadingController: LoadingController) {

  }

  ngAfterViewInit() {
    console.log("in ngAfterViewInit");

  }

  ionViewDidEnter() {
    console.log("in ionViewDidEnter");
    this.getRandomExpressionName();

    this.loadModel();
  }

  async loading() {

  }

  async loadModel() {
    /**
     *  await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
        await faceapi.loadFaceLandmarkModel(MODEL_URL)
        await faceapi.loadFaceRecognitionModel(MODEL_URL)
     * 
     */
    const loading = await this.loadingController.create({
      message: 'Loading Modules',

    });
    await loading.present();

    Promise.all([faceApi.loadSsdMobilenetv1Model(`https://express-it.s3.us-east-2.amazonaws.com/models`),
    faceApi.loadFaceLandmarkModel(`https://express-it.s3.us-east-2.amazonaws.com/models`),
    faceApi.loadFaceExpressionModel(`https://express-it.s3.us-east-2.amazonaws.com/models`)])
      .then(async () => {
        console.log("loaded");
        loading.dismiss();
        const input: any = document.getElementById("image");
        console.log(input);
        console.log(this.imageContainer.nativeElement.height, this.imageContainer.nativeElement.width);
        // faceApi.detectSingleFace(input)
        let fullFaceDescriptions: any = await faceApi.detectAllFaces(input).withFaceLandmarks().withFaceExpressions();
        console.log(fullFaceDescriptions);

        fullFaceDescriptions.forEach(description => {
          const expressions: faceApi.FaceExpressions = description.expressions;

          const expressionNameArray = Object.keys(expressions);
          const expressionValuesArray = Object.values(expressions);

          console.log(expressionNameArray, expressionValuesArray);

          // console.log(expressionValuesArray.sort());
          let max = 0.0;
          let index = 0;
          expressionValuesArray.forEach((value, i)=>{
            if(value > max){
              max = value;
              index = i;
            }
          })

          console.log(expressionNameArray[index]);
          
      });

        //fullFaceDescriptions = faceApi.resizeResults(fullFaceDescriptions)

        const displaySize = { width: this.imageContainer.nativeElement.width, height: this.imageContainer.nativeElement.height };
        // resize the overlay canvas to the input dimensions
        // const canvas = document.getElementById('overlay');
        faceApi.matchDimensions(this.canvas.nativeElement, displaySize);

        const resizedResults = faceApi.resizeResults(fullFaceDescriptions, displaySize);
        faceApi.draw.drawDetections(this.canvas.nativeElement, resizedResults);

        // draw a textbox displaying the face expressions with minimum probability into the canvas
        const minProbability = 0.05;
        faceApi.draw.drawFaceExpressions(this.canvas.nativeElement, resizedResults, minProbability);

      })
      .catch((err) => {
        console.log(err);
      });


    /*await faceApi.loadSsdMobilenetv1Model(this.MODEL_URL)
    .then(async () => {
      console.log("loaded");
      const input: any = document.getElementById("image");
      let fullFaceDescriptions: any = await faceApi.detectAllFaces(input).withFaceLandmarks().withFaceDescriptors();
      console.log(fullFaceDescriptions);
      //fullFaceDescriptions = faceApi.resizeResults(fullFaceDescriptions)

    })
    .catch((err) => {
      console.log(err);
    });*/
  }

  public getRandomExpressionName(): string{
    if(this.expressionsList.length == 1){
      console.log(this.expressionsList[0]);
      // stop btn
      return this.expressionsList[0];
    }
    const item: string = this.expressionsList[Math.floor(Math.random()* this.expressionsList.length)];
    const index = this.expressionsList.indexOf(item);

    this.expressionsList.splice(index, 1);


    console.log(item);

    return item;
  }

}
