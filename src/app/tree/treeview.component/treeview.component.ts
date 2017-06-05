/**
 * Created by hb on 10.07.16.
 */

import {
    Component,
    HostBinding,
    Inject,
    OnInit,
    ViewChild,
} from "@angular/core";

@Component({
  selector: "farc-tree-view",
  // styles: [
  //   ":host { height: 100%; width: 100%;}",
  // ],
  // host: {
  //   class: "flex-panel flex-content-fix",
  // },
  templateUrl: "./treeview.component.html",
           })
export class TreeViewComponent implements OnInit {
  @HostBinding("attr.class") cssClass = "flex-panel flex-content-fix";

  public leftPaneWidth: string;
  public leftPaneMinWidth: string;
  public centerPaneWidth: string;
  public centerPaneMinWidth: string;

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
