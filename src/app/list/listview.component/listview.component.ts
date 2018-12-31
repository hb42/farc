/**
 * Created by hb on 03.10.16.
 */

import { Component, HostBinding, OnInit, } from "@angular/core";

import { ListService } from "../list.service";

@Component({
             selector   : "farc-list-view",
             templateUrl: "./listview.component.html",
             styleUrls  : ["./listview.component.css"],
           })
export class ListViewComponent implements OnInit {
  @HostBinding("attr.class") cssClass = "flex-panel flex-content-fix";

  public centerPaneWidth: string;
  public centerPaneMinWidth: string;
  public tbHeight: string;

  constructor(public listService: ListService) {
    console.debug("c'tor List");
  }

  public async ngOnInit() {
    this.centerPaneWidth = "100%";
    this.centerPaneMinWidth = "500px";
    this.tbHeight = "initial";
    await this.listService.initList();
  }

}
