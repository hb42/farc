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
      ADMIN
      </div>
      <div fb-splitter ></div>
      <div class="flex-panel flex-max" [style.width]="centerPaneWidth" [style.min-width]="centerPaneMinWidth" 
       style="background: red">
        <div class="flex-content">{{centerText}}</div>
      </div>
    </div>

    `,
           })
export class AdminView implements OnInit {

  public data: any;

  private leftPaneWidth: string;
  private leftPaneMinWidth: string;
  private centerPaneWidth: string;
  private centerPaneMinWidth: string;

  private centerText: string;

  constructor( @Inject("METADATA") private metadata: any) {
    console.info("c'tor Home");
  }

  public ngOnInit(): void {
    this.leftPaneWidth = "350px";
    this.leftPaneMinWidth = "100px";
    this.centerPaneWidth = "100%";
    this.centerPaneMinWidth = "100px";

    for (let i = 0; i < 100; i++) {
      let s = " " + i;
      for (let j = 0; j < 100; j++) {
        this.centerText += s;
      }
    }

  }

}
