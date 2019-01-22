import { Component, OnInit, } from "@angular/core";

import { StatusService, } from "./status.service";

@Component({
             selector   : "farc-status",
             templateUrl: "./status.component.html",
             styleUrls  : ["./status.component.css"],
           })
export class StatusComponent implements OnInit {

  public lines;

  constructor(protected statusService: StatusService) {
    //
  }

  public ngOnInit() {
    this.lines = this.statusService.getFeed();

  }

}
