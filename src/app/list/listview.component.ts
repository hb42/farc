/**
 * Created by hb on 03.10.16.
 */

import {
    Component,
    Inject,
    OnInit,
} from "@angular/core";

import {
    TreeNode,
} from "primeng/primeng";

import {
  StatusService,
} from "../shared";

@Component({
             selector: "list-view",
             host: {
               class: "flex-panel flex-content-fix",
             },
             template: `
    <div class="flex-row" style="background: purple"> 
      <div class="flex-panel" [style.width]="leftPaneWidth" [style.min-width]="leftPaneMinWidth"
       style="background: green"> 
        <p-tree [value]="tree">
          <ng-template let-node pTemplate="default">
            <span style="color: red" >{{node.label}}</span>
          </ng-template>
          <ng-template let-node pTemplate="ep">
            <span >{{node.label}} *EP*</span>
          </ng-template>
        </p-tree>
      </div>
      <div fb-splitter ></div>
      <div class="flex-panel flex-max" [style.width]="centerPaneWidth" [style.min-width]="centerPaneMinWidth" 
       style="background: red">
        <div class="flex-content">{{centerText}}</div>
      </div>
    </div>

    `,
           })
export class ListView implements OnInit {

  public data: any;

  protected tree: TreeNode[] = [ {label: "eins", data: "eins"},
                                 {label: "zwei", data: "zwei"},
                                 {label: "drei", data: "drei"},
                                 {label: "vier", data: "vier", type: "ep"}];

  protected leftPaneWidth: string;
  protected leftPaneMinWidth: string;
  protected centerPaneWidth: string;
  protected centerPaneMinWidth: string;

  protected centerText: string;

  constructor(private statusService: StatusService) {
    console.info("c'tor Home");
  }

  public ngOnInit(): void {
    this.leftPaneWidth = "350px";
    this.leftPaneMinWidth = "100px";
    this.centerPaneWidth = "100%";
    this.centerPaneMinWidth = "100px";
    this.statusService.error("ListView onInit()");

    for (let i = 0; i < 100; i++) {
      const s = " " + i;
      for (let j = 0; j < 100; j++) {
        this.centerText += s;
      }
    }

  }

}
