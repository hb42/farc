/**
 * Created by hb on 10.07.16.
 */

import {
    Component,
    Inject,
    OnInit,
} from "@angular/core";

@Component({
  selector: "tree-view",
  // styles: [
  //   ":host { height: 100%; width: 100%;}",
  // ],
  host: {
    class: "flex-panel flex-content-fix",
  },
  template: `
    <!--<div style="height: 100%; width: 300px; position: absolute;">-->
    <!--</div>    -->
    <div class="flex-row" style="background: purple"> 
      <div class="flex-panel" [style.width]="leftPaneWidth" [style.min-width]="leftPaneMinWidth"
           style="background: green"> 
      <farc-tree></farc-tree>
      </div>
      <div fb-splitter ></div>
      <div class="flex-panel flex-max" [style.width]="centerPaneWidth" [style.min-width]="centerPaneMinWidth" 
           style="background: red">
        <file-list></file-list>
      </div>
    </div>

    `,
           })
export class TreeView implements OnInit {

  public data: any;

  protected leftPaneWidth: string;
  protected leftPaneMinWidth: string;
  protected rightPaneWidth: string;
  protected rightPaneMinWidth: string;
  protected centerPaneWidth: string;
  protected centerPaneMinWidth: string;

  private centerText: string;

  constructor() {
    console.info("c'tor Home");
  }

  public ngOnInit(): void {
    this.leftPaneWidth = "350px";
    this.leftPaneMinWidth = "100px";
    this.rightPaneWidth = "200px";
    this.rightPaneMinWidth = "100px";
    this.centerPaneWidth = "100%";
    this.centerPaneMinWidth = "100px";

    for (let i = 0; i < 100; i++) {
      const s = " " + i;
      for (let j = 0; j < 100; j++) {
        this.centerText += s;
      }
    }

  }

}
