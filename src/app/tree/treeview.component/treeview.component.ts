/**
 * Created by hb on 10.07.16.
 */

import { Component, HostBinding, OnInit, } from "@angular/core";

@Component({
             selector   : "farc-tree-view",
             templateUrl: "./treeview.component.html",
           })
export class TreeViewComponent implements OnInit {
  @HostBinding("attr.class") cssClass = "flex-panel flex-content-fix";

  public leftPaneWidth: string;
  public leftPaneMinWidth: string;
  public centerPaneWidth: string;
  public centerPaneMinWidth: string;

  constructor() {
    console.debug("c'tor TreeViewComponent");
  }

  public ngOnInit(): void {
    this.leftPaneWidth = "350px";
    this.leftPaneMinWidth = "100px";
    this.centerPaneWidth = "100%";
    this.centerPaneMinWidth = "100px";

  }

}
