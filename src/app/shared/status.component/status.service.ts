/**
 * Created by hb on 03.04.17.
 */

import { Injectable, } from "@angular/core";
import Timeout = NodeJS.Timeout;

/**
 * Statuszeile
 *
 * Der Typ der Meldungen entspricht der css-class aus bootstrap
 */
@Injectable()
export class StatusService {

  public defaultType = "text-secondary";
  private messages = [];
  private timer: Timeout;
  private defaultText = {type: this.defaultType, text: "", date: 0};

  constructor() {
    this.messages.push(this.defaultText);
  }

  public setDefault(def: string) {
    this.defaultText.text = def;
  }

  public getFeed() {
    return this.messages;
  }

  public success(msg: string) {
    this.addMessage(msg, "text-success");
  }

  public info(msg: string) {
    this.addMessage(msg, "text-info");
  }

  public warn(msg: string) {
    this.addMessage(msg, "text-warn");
  }

  public error(msg: string) {
    this.addMessage(msg, "text-error");
  }

  private addMessage(msg: string, typ: string) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    if (this.messages.length && this.messages[0].type === this.defaultType) {
      this.messages.shift();
    }
    while (this.messages.length > 100) {
      this.messages.pop();
    }
    this.messages.unshift({type: typ, text: msg, date: Date.now()});
    // Nachricht 10 sec. anzeigen
    this.timer = setTimeout(() => {
      this.messages.unshift(this.defaultText);
    }, 10000);
  }

}
