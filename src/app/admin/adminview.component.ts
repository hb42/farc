/**
 * Created by hb on 03.10.16.
 */

import {
    Component,
    Inject,
    OnInit,
} from "@angular/core";

@Component({
             selector: "admin-view",
             host: {
               class: "flex-panel flex-content-fix",
             },
             template: `
    <div class="flex-row" style="background: purple"> 
      <div class="flex-panel" [style.width]="leftPaneWidth" [style.min-width]="leftPaneMinWidth"
       style="background: green"> 
        <p></p>
        <a [routerLink] = "['./drives']" class="btn btn-block" (click) = "btnClick(0)" 
           [class.btn-default]="!btnActive[0]" [class.btn-primary]="btnActive[0]">Laufwerke</a>
        <a  [routerLink] = "['./oes']" class="btn btn-block" (click) = "btnClick(1)" 
           [class.btn-default]="!btnActive[1]" [class.btn-primary]="btnActive[1]">Organisationseinheiten</a>
      </div>
      <div fb-splitter ></div>
      <div class="flex-panel flex-max" [style.width]="centerPaneWidth" [style.min-width]="centerPaneMinWidth" 
       style="background: red">
      
        <router-outlet></router-outlet>
        
      </div>
    </div>

    `,
           })
export class AdminView implements OnInit {

  public data: any;

  protected btnNr: number;
  protected btnActive: boolean[] = [false, false];

  protected leftPaneWidth: string;
  protected leftPaneMinWidth: string;
  protected centerPaneWidth: string;
  protected centerPaneMinWidth: string;

  protected centerText: string;

  constructor() {
    console.info("c'tor Admin");
  }

  public ngOnInit(): void {
    this.leftPaneWidth = "350px";
    this.leftPaneMinWidth = "100px";
    this.centerPaneWidth = "100%";
    this.centerPaneMinWidth = "100px";

    for (let i = 0; i < 100; i++) {
      const s = " " + i;
      for (let j = 0; j < 100; j++) {
        this.centerText += s;
      }
    }

  }

  private btnClick(nr: number) {
    if (nr === this.btnNr) {
      return;
    }
    this.btnNr = nr;
    for (let i = 0; i < this.btnActive.length; i++) {
      this.btnActive[i] = false;
    }
    this.btnActive[nr] = true;
  }

}
