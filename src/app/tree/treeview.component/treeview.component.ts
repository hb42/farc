/**
 * Created by hb on 10.07.16.
 */

import {
    Component,
    Inject,
    OnInit,
} from "@angular/core";

@Component({
  selector: "farc-tree-view",
  // styles: [
  //   ":host { height: 100%; width: 100%;}",
  // ],
  host: {
    class: "flex-panel flex-content-fix",
  },
  templateUrl: "./treeview.componenrt.html",
           })
export class TreeView implements OnInit {

  protected leftPaneWidth: string;
  protected leftPaneMinWidth: string;
  protected centerPaneWidth: string;
  protected centerPaneMinWidth: string;

  constructor() {
    console.info("c'tor Home");
  }

  public ngOnInit(): void {
    this.leftPaneWidth = "350px";
    this.leftPaneMinWidth = "100px";
    this.centerPaneWidth = "100%";
    this.centerPaneMinWidth = "100px";

  }

}
