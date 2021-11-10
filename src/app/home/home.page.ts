import { Component, ViewChild, OnInit } from '@angular/core';
import { AlertController, IonContent, IonList, NavController } from '@ionic/angular';
import { CheckList } from '../interfaces/checklist';
import { ChecklistService } from '../services/checklist.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  @ViewChild(IonList, {static: false}) slidingList: IonList;
  @ViewChild(IonContent, {static: false}) contentArea: IonContent;

  public checklists: CheckList[] = [];
  constructor(
    private checklistService: ChecklistService, 
    private alertCtrl: AlertController, 
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.checklistService.getChecklists().subscribe((checklists) => {
      this.checklists = checklists;
    })
  }

  async addChecklist():Promise<void> {
    const alert = await this.alertCtrl.create({
      header: "New Checklist",
      message: "Enter the name of your new checklist:",
      inputs: [
        {
          type: "text",
          name: "name",
       },
      ],
      buttons: [
        {
          text: "Cancel"
        },
        {
          text: "Save",
          handler: async (data) => {
            await this.checklistService.createChecklist(data.name);
            this.contentArea.scrollToBottom(300);
          }
        }
      ]
    });
    alert.present();
  }

  async renameChecklist(checklist: CheckList): Promise<void>{
    const alert = await this.alertCtrl.create({
    header: "Rename Checklist",
    message: "Enter the new name of your new checklist:",
    inputs: [
      {
        type: "text",
        name: "name",
     },
    ],
    buttons: [
      {
        text: "Cancel"
      },
      {
        text: "Save",
        handler: async (data) => {
          await this.checklistService.updateChecklist(checklist.id, data.name);
          this.slidingList.closeSlidingItems();
        }
      }
    ]
  });
  alert.present();
}

  async removeChecklist(checklist: CheckList): Promise<void>{
    await this.slidingList.closeSlidingItems();
    this.checklistService.removeChecklist(checklist.id);
  }
}
