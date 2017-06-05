/**
 * Created by hb on 03.04.17.
 */

import {
  Component,
  OnInit,
} from "@angular/core";

import {
  StatusService,
} from "./";

@Component({
             selector: "farc-status",
             templateUrl: "./status.component.html",
             styleUrls: ["./status.component.css"],
           })
export class StatusComponent implements OnInit {

  public lines;

  constructor(protected statusService: StatusService) {
    //
  }

  public ngOnInit() {
    this.lines = this.statusService.getFeed();
  }

  /**
   * css-class fuer die Message-Typen
   *
   * z.Zt. Bootstrap-classes, koennte aber auch in status.component.css definiert werden
   *
   * @param type
   * @returns {any}
   */
  public messageClass(type: string): string[] {
    switch (type) {
      case "success" :
        return ["text-success"];
      case "info" :
        return ["text-info"];
      case "warn" :
        return ["text-warning"];
      case "error" :
        return ["text-danger"];
      default:
        return ["text-info"];
    }
  }

  public latestText() {
    if (this.lines[0]) {
      return this.lines[0].text || "";
    } else {
      return "";
    }
  }
  public latestClass() {
    if (this.lines[0]) {
      return this.messageClass(this.lines[0].type);
    } else {
      return this.messageClass("");
    }
  }
}
