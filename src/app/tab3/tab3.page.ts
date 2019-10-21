import { Component, ViewChild, ElementRef } from '@angular/core';

import * as faceApi from 'face-api.js';
import { TinyFaceDetectorOptions } from 'face-api.js';


@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  capturedImage: any = null;
  MODEL_URL = 'assets/models';

  @ViewChild('video', { static: false }) video: ElementRef;
  @ViewChild('canvas', { static: false }) canvas: ElementRef;


  constructor() { }

  captureImage() {
    console.log("clicked captureImage");

    const canvas = document.getElementById('canvas') as HTMLCanvasElement;     
    const video = document.getElementById('my_image') as HTMLVideoElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);  
    canvas.toBlob( (blob) => {
      const img = new Image();
      
      img.src = window.URL.createObjectURL(blob);
      console.log(img);
      this.capturedImage = img;
    });


  }

  ionViewWillEnter() {
    console.log("ionViewWillEnter");
    // this.video.nativeElement.addEventListener('play', this.playHandler.bind(this));
  }

  async playHandler() {
    console.log("video playing...");
    const video: faceApi.TNetInput = document.getElementById("my_image") as HTMLVideoElement;
    // const canvas = faceApi.createCanvasFromMedia(video);
    // document.body.append(canvas);
    //this.canvas.nativeElement = canvas;
    const displaySize = { width: 360, height: 640 };
    console.log(displaySize);
    // setTimeout(() => {
    //   console.log(this.video);
    // }, 100);
    

    faceApi.matchDimensions(this.canvas.nativeElement, displaySize);


    setInterval(async () => {

      const detections = await faceApi.detectAllFaces(video, new faceApi.TinyFaceDetectorOptions())
        .withFaceLandmarks().withFaceExpressions();


      // console.log(detections);
      const resizedDetections: any = faceApi.resizeResults(detections, displaySize);
      this.canvas.nativeElement.getContext('2d').clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

      faceApi.draw.drawDetections(this.canvas.nativeElement, resizedDetections);
    }, 100);


  }
  ionViewDidEnter() {
    // const player = document.getElementById('player');

    const constraints = {
      video: true,
    };

    Promise.all([faceApi.loadTinyFaceDetectorModel(this.MODEL_URL),
    faceApi.loadFaceLandmarkModel(this.MODEL_URL),
    faceApi.loadFaceExpressionModel(this.MODEL_URL)])
      .then(() => {
        console.log("Modules loaded...");
        navigator.mediaDevices.getUserMedia(constraints)
          .then((stream) => {
            console.log("streaming...");
            const video = document.getElementById("my_image") as HTMLVideoElement;
            video.srcObject = stream;
            console.log(video.height);
          });
      })
      .catch((err) => {

      })




  }



  ionViewDidLeave() {
    console.log("Destroy");
    // Stop all video streams.
    this.video.nativeElement.srcObject.getVideoTracks().forEach(track => track.stop());
    // const video = document.getElementById("my_image") as HTMLVideoElement;
    // video.removeEventListener('play', this.playHandler.bind(this), true);
  }

}
