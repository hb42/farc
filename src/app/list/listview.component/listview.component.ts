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
} from "../../shared";

@Component({
             selector: "farc-list-view",
             host: {
               class: "flex-panel flex-content-fix",
             },
             templateUrl: "./listview.component.html",
             styleUrls: ["./listview.component.css"],
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
