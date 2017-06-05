/**
 * Created by hb on 03.04.17.
 */

import {
  Inject,
  Injectable,
} from "@angular/core";

@Injectable()
export class StatusService {

  private messages = [];

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
    while (this.messages.length > 100) {
      this.messages.pop();
    }
    this.messages.unshift({ type: typ, text: msg, date: Date.now() });
  }

}
