import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import {BehaviorSubject, Observable} from 'rxjs'
import {CheckList} from '../interfaces/checklist'
import {map} from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class ChecklistService {
  private checklists$: BehaviorSubject<CheckList[]> = new BehaviorSubject<CheckList[]>([]);
  private checklists: CheckList[] = [];
  private loaded: boolean = false;

  constructor(private storage: Storage) {

  }

   async load(): Promise<void> {
    if(!this.loaded) {
      await this.storage.create();
      const checklists = await this.storage.get("checklists");
      if(checklists !== null) {
        this.checklists = checklists;
        this.checklists$.next(this.checklists);
      }
      this.loaded = true;
    }
  }

  getChecklists(): Observable<CheckList[]> {
    return this.checklists$;
  }

  getChecklist(checklistId: string): Observable<CheckList> {
    return this.checklists$.pipe(
      map((checklists) => checklists.find((checklist) => checklist.id === checklistId)
      )
    );
  }

  async createChecklist(title: string): Promise<void> {
    await this.load();

    const newChecklist = {
      id: this.generateSlug(title),
      title: title,
      items: [],
    }

    this.checklists = [...this.checklists, newChecklist];
    await this.save();
  }

  async updateChecklist(checklistId: string, newTitle: string): Promise<void> {
    this.checklists = this.checklists.map((checklist) => {
      return checklist.id === checklistId 
      ? {...checklist, title: newTitle} 
      : checklist;
    });

    this.save();
  }

  async removeChecklist(checklistId: string): Promise<void> {
    this.checklists = this.checklists.filter((checklist) => checklist.id !== checklistId);

    this.save()
  }

  async addItemToChecklist(checklistId: string, title: string): Promise<void> {
    const newItem = {
      id: Date.now().toString(),
      title: title,
      checked: false,
    };

    this.checklists = this.checklists.map((checklist) => {
      return checklist.id === checklistId 
      ? {...checklist, items: [...checklist.items, newItem]}
      : checklist;
    });

    this.save()
  }

  removeItemInChecklist(checklistId: string, itemId: string): void {
    this.checklists = this.checklists.map((checklist) => {
      return checklist.id === checklistId
      ? {
        ...checklist,
        items: [...checklist.items.filter((item) => item.id !== itemId)],
      }
      : checklist;
    });

    this.save()
  }

  updateItemInChecklist(checklistId: string, itemId: string, newTitle: string): void {
    this.checklists = this.checklists.map((checklist) => {
      return checklist.id === checklistId 
      ? {
        ...checklist, 
        items:[
          ...checklist.items.map((item) => 
          item.id === itemId ? {...item, title: newTitle}:item
          )
        ]
      }
      : checklist;
    });

    this.save();
  }

  setItemStatus(checklistId: string, itemId: string, checked: boolean): void {
    this.checklists = this.checklists.map((checklist) => {
      return checklist.id === checklistId 
      ? {
        ...checklist, 
        items:[
          ...checklist.items.map((item) => 
          item.id === itemId ? {...item, checked: checked}:item
          )
        ]
      }
      :checklist;
    });

    this.save();
  }

  resetItemStatusForChecklist(checklistId: string): void {
    this.checklists = this.checklists.map((checklist) => {
      return checklist.id === checklistId 
      ? {
        ...checklist, 
        items:[
          ...checklist.items.map((item) => {
            return {...item, checked: false}
          }
          
          )
        ]
      }
      :checklist;
    });

    this.save();
  }

  save():Promise<void> {
    this.checklists$.next(this.checklists);
    return this.storage.set("checklists", this.checklists);
    // return Promise.resolve();
  }

  generateSlug(title: string): string {
    let slug = title.toLowerCase().replace(/\s+/g, '-');
    const matchingSlugs = this.checklists.filter((checklist) => {
      return checklist.id.substring(0, slug.length) === slug;
    })
    if(matchingSlugs.length > 0) {
      slug = slug + Date.now().toString();
    }
    return slug;
  }
}
