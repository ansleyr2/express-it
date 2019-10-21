import { Component, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';


import { LoadingController, AlertController, ToastController } from '@ionic/angular';

import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

import { WebView } from '@ionic-native/ionic-webview/ngx';

import { File } from '@ionic-native/file/ngx';



import * as faceApi from 'face-api.js';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  providers: [Camera, WebView, File]
})
export class Tab1Page {
  @ViewChild('image', { static: false }) imageContainer: ElementRef;
  @ViewChild('canvas', { static: false }) canvas: ElementRef;

  // MODEL_URL = 'assets/models';
  myImage: any;
  disableDetectBtn: boolean = true;
  disableNextExpressionBtn: boolean = false;
  nextBtnText: string = "Next Expression";
  detectedExpressionName: string = "";
  toExpressExpressionName: string = "";
  disableCameraBtn : boolean = false;

  expressionsList = ["neutral", "happy", "sad", "angry", "fearful", "disgusted", "surprised"] ;

  constructor(private camera: Camera, 
    public loadingController: LoadingController, 
    public webView: WebView,
    public file: File,
    public alertController: AlertController,
    public toastController: ToastController
    ) { }

  ionViewDidEnter() {
    console.log("in ionViewDidEnter");
    this.disableDetectBtn = true;
    this.disableNextExpressionBtn = true;
    this.toExpressExpressionName =  this.getRandomExpressionName();
  }

  captureImage() {
    console.log("clicked captureImage...");
    this.myImage = null;
    const canvasElt = document.getElementById('canvas') as HTMLCanvasElement;
    canvasElt.getContext("2d").clearRect(0, 0, canvasElt.width, canvasElt.height);

    const options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      cameraDirection: this.camera.Direction.FRONT
    }

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      // alert(imageData)
      // this.myImage=  'data:image/jpeg;base64,' + imageData;
      // this.myImage = url;

      const filename = imageData.substring(imageData.lastIndexOf('/') + 1);
      const path = imageData.substring(0, imageData.lastIndexOf('/') + 1);
      // then use the method reasDataURL  btw. var_picture is ur image variable
      this.file.readAsDataURL(path, filename)
        .then(res => {
          this.myImage = res;

          this.disableCameraBtn = true;
          this.disableDetectBtn = false;
          this.disableNextExpressionBtn = true;
        });

    }, (err) => {
      // Handle error
      alert("error " + JSON.stringify(err))
    });

  }

  async detectExpressionsAndDraw() {
    // this.disableNextExpressionBtn = true;
    this.disableCameraBtn = true;

    console.log("clicked detectExpressionsAndDraw...");
    const input: faceApi.TNetInput = document.getElementById("image") as faceApi.TNetInput;

    const loading = await this.loadingController.create({
      message: 'Detecting expressions...',

    });
    await loading.present();

    try {
      /*const fullFaceDescriptions: any = await faceApi.detectAllFaces(input, new faceApi.TinyFaceDetectorOptions({ inputSize: 320 }))
                                             .withFaceLandmarks()
                                              .withFaceExpressions();*/

      const fullFaceDescriptions: any = await faceApi.detectAllFaces(input)
        .withFaceLandmarks()
        .withFaceExpressions();

      loading.dismiss();

      console.log(fullFaceDescriptions);

      // No faces detected
      if (!fullFaceDescriptions.length) {
        // Show some message...
        console.log("No faces detected...");
        const alert = await this.alertController.create({
          header: '',
          message: 'No Faces detected. Please capture a better picture',
          buttons: [
            {
              text: 'Try Again',
              role: 'cancel',
              cssClass: 'secondary',
              handler: (blah) => {
                console.log('Confirm Cancel: blah');
                // Reset buttons...
                this.myImage = null;

                this.disableCameraBtn = false;
                this.disableDetectBtn = true;
                this.disableNextExpressionBtn = true;
              }
            }
          ]
        });
    
        await alert.present();
        return;
      }

      // multiple faces detection
      if(fullFaceDescriptions.length > 1){
        const alert = await this.alertController.create({
          header: '',
          message: 'More than one face detected. Please capture only a single face.',
          buttons: [
            {
              text: 'Try Again',
              role: 'cancel',
              cssClass: 'secondary',
              handler: (blah) => {
                console.log('Confirm Cancel: blah');
                // Reset Buttons...
                this.myImage = null;

                this.disableCameraBtn = false;
                this.disableDetectBtn = true;
                this.disableNextExpressionBtn = true;
              }
            }
          ]
        });
    
        await alert.present();
        return;
      }

      // Finding the expression name with highest value.
      fullFaceDescriptions.forEach(description => {
        const expressions: faceApi.FaceExpressions = description.expressions;

        const expressionNameArray = Object.keys(expressions);
        const expressionValuesArray = Object.values(expressions);

        console.log(expressionNameArray, expressionValuesArray);

        let max = 0.0;
        let index = 0;
        expressionValuesArray.forEach((value, i)=>{
          if(value > max){
            max = value;
            index = i;
          }
        });

        this.detectedExpressionName = expressionNameArray[index];
        console.log(this.detectedExpressionName);
    });


      const displaySize = { width: this.imageContainer.nativeElement.width, height: this.imageContainer.nativeElement.height };

      faceApi.matchDimensions(this.canvas.nativeElement, displaySize);

      const resizedResults = faceApi.resizeResults(fullFaceDescriptions, displaySize);

      faceApi.draw.drawDetections(this.canvas.nativeElement, resizedResults);
      // console.log(resizedResults);

      // draw a textbox displaying the face expressions with minimum probability into the canvas
      const minProbability = 0.05;
      faceApi.draw.drawFaceExpressions(this.canvas.nativeElement, resizedResults, minProbability);

      this.result();
    } catch (err) {
      console.log("face detection error...");
      loading.dismiss();
      this.presentResultToastWithOptions("face detection error...", true);
      console.log(err);
    }

  }

  private init(){
    this.expressionsList = ["neutral", "happy", "sad", "angry", "fearful", "disgusted", "surprised"] ;
    this.myImage =  null;
    this.disableDetectBtn = true;
    this.disableNextExpressionBtn = false;
    this.nextBtnText = "Next Expression";
    this.disableCameraBtn = false;
  }

  private stop(){
    this.expressionsList = ["neutral", "happy", "sad", "angry", "fearful", "disgusted", "surprised"] ;
  }

  private result(){
    this.disableNextExpressionBtn = false;
    this.disableCameraBtn = true;
    this.disableDetectBtn = true;

    if(this.detectedExpressionName === this.toExpressExpressionName){
      console.log("Match");
     /* this.disableNextExpressionBtn = false;

      this.disableCameraBtn = true;
      this.disableDetectBtn = true;*/

      // Update score..
      this.presentResultToastWithOptions('Expression Matched.');
      return true;
    }else{

      this.presentResultToastWithOptions('Expression not Matched.', true);
      return false;

    }
  }
  
  // TO-DO improve this method.
  public getRandomExpressionName(): string {
    if(this.expressionsList && this.expressionsList.length == 0){
      this.init();
      return;
    }
    if(this.expressionsList.length == 1){
      // this.disableNextExpressionBtn = true;
      // this.disableDetectBtn = true;
      this.disableCameraBtn = true;
      this.nextBtnText = "Try Again";
    }
    // if(this.expressionsList.length == 1){
    //   console.log(this.expressionsList[0]);
    //   // this.disableNextExpressionBtn = true;
    //   this.nextBtnText = "Try Again";
    //   return this.expressionsList[0];
    // }
    const item: string = this.expressionsList[Math.floor(Math.random()* this.expressionsList.length)];
    const index = this.expressionsList.indexOf(item);

    this.expressionsList.splice(index, 1);


    console.log(item);
    this.toExpressExpressionName =  item;

    // Getting things ready for the next expression.
    this.myImage = null;
    this.disableCameraBtn = false;
    this.disableDetectBtn = true;
    this.disableNextExpressionBtn = true;

    return item;
  }

  /**
   * Result toast configurations
   * @param message 
   * @param noMatchError 
   */
  async presentResultToastWithOptions(message: string, noMatchError?: boolean) {
    const buttons: any = [
      {
        text: 'ok',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }
    ];

    if(noMatchError){
      buttons.push(
        {
            text: 'Try again',
            handler: () => {
              this.myImage = null;
              this.disableCameraBtn = false;
              this.disableDetectBtn = true;
              this.disableNextExpressionBtn = true;
              this.presentResultToastWithOptions('Please click image and continue...');
            }
        }
      );
    }
    // TODO: change toast color Red | Green
    const toast = await this.toastController.create({
      header: '',
      message,
      position: 'top',
      buttons,
      color: noMatchError ? 'danger' : 'success'
    });
    toast.present();
  }

  /**
   * Info on how to proceed
   */
  public displayInfo(){

  }
}




