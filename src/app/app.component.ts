import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { LoadingController, AlertController } from '@ionic/angular';


import * as faceApi from 'face-api.js';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  // MODEL_URL = 'assets/models';

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public loadingController: LoadingController,
    public alertController: AlertController
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.loadModels();
    });
  }

  async loadModels(){
    const loading = await this.loadingController.create({
      message: 'Loading Modules',

    });
    await loading.present();
   // https://crossorigin.me/
    Promise.all([faceApi.loadSsdMobilenetv1Model(`https://express-it.s3.us-east-2.amazonaws.com/models`),
      faceApi.loadFaceLandmarkModel(`https://express-it.s3.us-east-2.amazonaws.com/models`),
      faceApi.loadFaceExpressionModel(`https://express-it.s3.us-east-2.amazonaws.com/models`)])
      .then( ()=>{
        loading.dismiss();
        
      })
      .catch(async (err)=>{
        console.log(err);
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'Error loading modules.',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary',
              handler: (blah) => {
                console.log('Confirm Cancel: blah');
              }
            }
          ]
        });
    
        await alert.present();
      })
  }
}
