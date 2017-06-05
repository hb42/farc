/**
 * Created by hb on 03.10.16.
 */

import {
    Component,
    HostBinding,
    Inject,
    OnInit,
} from "@angular/core";

import {
    TreeNode,
} from "primeng/primeng";

import {
  StatusService,
} from "../../shared";
import {
  FarcTreeService,
} from "../../tree";

@Component({
             selector: "farc-list-view",
             // host: {
             //   class: "flex-panel flex-content-fix",
             // },
             templateUrl: "./listview.component.html",
             styleUrls: ["./listview.component.css"],
           })
export class ListViewComponent implements OnInit {
  @HostBinding("attr.class") cssClass = "flex-panel flex-content-fix";

  public data: any;

  public tree: TreeNode[] = [ {label: "eins", data: "eins"},
                                 {label: "zwei", data: "zwei"},
                                 {label: "drei", data: "drei"},
                                 {label: "vier", data: "vier", type: "ep"}];

  public leftPaneWidth: string;
  public leftPaneMinWidth: string;
  public centerPaneWidth: string;
  public centerPaneMinWidth: string;

  public centerText: string;

  constructor(public farcService: FarcTreeService, private statusService: StatusService) {
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
