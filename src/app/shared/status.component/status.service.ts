/**
 * Created by hb on 03.04.17.
 */

import { Injectable, } from "@angular/core";
import Timeout = NodeJS.Timeout;

@Injectable()
export class StatusService {

  private messages = [];
  private timer: Timeout;

  constructor() {
    //
  }

  public getFeed() {
    return this.messages;
  }

  public success(msg: string) {
    this.addMessage(msg, "success");
  }

  public info(msg: string) {
    this.addMessage(msg, "info");
  }

  public warn(msg: string) {
    this.addMessage(msg, "warn");
  }

  public error(msg: string) {
    this.addMessage(msg, "error");
  }

  private addMessage(msg: string, typ: string) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    if (this.messages.length && this.messages[0].text === "") {
      this.messages.shift();
    }
    while (this.messages.length > 100) {
      this.messages.pop();
    }
    this.messages.unshift({type: typ, text: msg, date: Date.now()});
    // Nachricht 10 sec. anzeigen
    this.timer = setTimeout(() => {
      this.messages.unshift({type: "info", text: "", date: Date.now()});
    }, 10000);
  }

}
