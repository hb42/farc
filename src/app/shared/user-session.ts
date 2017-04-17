import {
  EventEmitter,
} from "@angular/core";

import {
  UserData,
} from ".";

export class UserSession {

  // dieses Objekt wird gespeichert
  private userdata: UserData;

  // wird fuer jede Aenderung der Daten aufgerufen
  private changeEvent: EventEmitter<UserData>;

  constructor(event: EventEmitter<UserData>, data: UserData) {
    this.changeEvent = event;
    this.userdata = data;
  }

  // nur fuers Speichern
  public get data() {
    return this.userdata;
  }

  // fuer jedes Element aus userdata einen getter
  // und einen setter definieren, der setter triggert
  // den EventEmitter

  public get treepath(): string[] {
    return this.data.treepath;
  }
  public set treepath(tp: string[]) {
    this.data.treepath = tp;
    this.changeEvent.emit();
  }


}
