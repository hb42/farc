/**
 * Created by hb on 03.10.16.
 */

import { Component, HostBinding, OnInit, } from "@angular/core";

import { AdminService } from "../admin.service";

@Component({
             selector   : "farc-admin-view",
             templateUrl: "./adminview.component.html",
             styleUrls  : ["./adminview.component.css"],
           })
export class AdminViewComponent implements OnInit {
  @HostBinding("attr.class") cssClass = "flex-panel flex-content-fix";

  public leftPaneWidth: string;
  public leftPaneMinWidth: string;
  public centerPaneWidth: string;
  public centerPaneMinWidth: string;

  constructor(public adminService: AdminService) {
    console.debug("c'tor Admin");
  }

  public ngOnInit(): void {
    this.leftPaneWidth = "230px";
    this.leftPaneMinWidth = "230px";
    this.centerPaneWidth = "100%";
    this.centerPaneMinWidth = "100px";

  }

}
