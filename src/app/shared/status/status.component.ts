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
             // styleUrls: ["./status.component.css"],
             styles: [
               "p.overlay-anchor { height: 0; width: 0; }",
               "div.statusmessage { cursor: pointer; }",
             ],
           })
export class StatusComponent implements OnInit {

  protected lines;

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
  protected messageClass(type: string): string[] {
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
}
