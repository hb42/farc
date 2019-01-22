import { Component, HostBinding, OnInit, } from "@angular/core";
import {ConfirmationService, MessageService} from "primeng/primeng";

import { ElectronService, } from "@hb42/lib-client";
import {
  checkCronTime, confADMINMAIL,
  confCRON,
  confEXECVORM,
  confGBPRICE,
  confMAILFROM,
  confMAXERL,
  confMWST,
  confREADTREE,
} from "@hb42/lib-farc";

import {ConfigService, StatusService} from "../../shared";
import { AdminService, } from "../admin.service";

@Component({
             selector   : "farc-config",
             templateUrl: "./config.component.html",
             styleUrls  : ["./config.component.css"]
           })
export class ConfigComponent implements OnInit {
  @HostBinding("attr.class") cssClass = "flex-panel flex-content";

  private _runReadTree: boolean;
  private _runVormerk: boolean;
  private _cron: string;
  public maxerl: string;
  public pricegb: string;
  public mwst: string;
  public senderMail: string;
  public adminMail: string;

  public get runReadTree(): boolean {
    return this._runReadTree;
  }
  public set runReadTree(b: boolean) {
    this.configService.saveConfig(confREADTREE, b).then((rc) => {
      this.status.success("Änderung für 'Dateisystem einlesen' gespeichert.")
    }, (reason) => {
      console.error("readTree-Conf not saved");
      console.dir(reason);
      this.status.error("Fehler: Änderung für 'Dateisystem einlesen' nicht gespeichert: " + reason)
    });
    this._runReadTree = b;
  }
  public get runVormerk(): boolean {
    return this._runVormerk;
  }
  public set runVormerk(b: boolean) {
    this.configService.saveConfig(confEXECVORM, b).then((rc) => {
      this.status.success("Änderung für 'Vormerkungen ausführen' gespeichert.")
    }, (reason) => {
      console.error("execVormerk-Conf not saved");
      console.dir(reason);
      this.status.error("Fehler: Änderung für 'Vormerkungen ausführen' nicht gespeichert: " + reason)
    });
    this._runVormerk = b;
  }
  public get cron(): string {
    return this._cron;
  }
  public set cron(c: string) {
    if (c) {
      this._cron = c;
    } else {
      this._cron = "";
    }
  }

  constructor(public adminService: AdminService,
              public configService: ConfigService,
              private status: StatusService,
              private messageService: MessageService,
              private confirmationService: ConfirmationService) {
  }

  public ngOnInit() {
    // config aus DB holen
    this.configService.getConfig(confREADTREE).then((b: boolean) => {
      this._runReadTree = !!b;
    }, (err) => {
      this._runReadTree = false;
      console.debug("Fehler beim Lesen von " + confREADTREE);
    });
    this.configService.getConfig(confEXECVORM).then((b: boolean) => {
      this._runVormerk = !!b;
    }, (err) => {
      this._runVormerk = false;
      console.debug("Fehler beim Lesen von " + confEXECVORM);
    });
    this.configService.getConfig(confCRON).then((c: string) => {
      this.cron = c;
    }, (err) => {
      this.cron = "";
      console.debug("Fehler beim Lesen von " + confCRON);
    });
    this.configService.getConfig(confMAXERL).then((n) => {
      this.maxerl = n;
    }, (err) => {
      this.maxerl = "0";
      console.debug("Fehler beim Lesen von " + confMAXERL);
    });
    this.configService.getConfig(confGBPRICE).then((g) => {
      this.pricegb = ("" + g).replace(".", ",");
    }, (err) => {
      this.pricegb = "0,90";
      console.debug("Fehler beim Lesen von " + confGBPRICE);
    });
    this.configService.getConfig(confMWST).then((m) => {
      this.mwst = ("" + m).replace(".", ",");
    }, (err) => {
      this.maxerl = "19";
      console.debug("Fehler beim Lesen von " + confMWST);
    });
    this.configService.getConfig(confMAILFROM).then((s: string) => {
      this.senderMail = s;
    }, (err) => {
      this.senderMail = "";
      console.debug("Fehler beim Lesen von " + confMAILFROM);
    });
    this.configService.getConfig(confADMINMAIL).then((s: string) => {
      this.adminMail = s;
    }, (err) => {
      this.adminMail = "";
      console.debug("Fehler beim Lesen von " + confADMINMAIL);
    });

  }

  public setCronTime() {
    const dt = checkCronTime(this.cron);
    if (dt) {
      this.cron = dt[1] + ":" + dt[2];
      this.configService.saveConfig(confCRON, this.cron).then((rc) => {
        this.status.success("Neue Einlesezeit " + this.cron + "  gespeichert.")
      }, (reason) => {
      console.error("cron-string not saved");
      console.dir(reason);
        this.status.error("Fehler: Einlesezeit wurde nicht gespeichert: " + reason);
      });
    } else {
      console.debug("CRON-String invalid");
      this.status.error("Fehler: Ungültige Zeitangabe, Format 00:00 - 23:59");
      this.messageService.add({severity: "error", summary: "Fehler", detail: "Ungültige Zeitangabe", life: 5000});
    }
  }

  public setMaxerl() {
    const parsed = Number.parseInt(this.maxerl, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      this.maxerl = "0";
      console.debug("MAXERL-Value invalid");
      this.status.error("Fehler: Ungültiger Wert für Anzahl Tage. Die Zahl muss größer Null sein.");
      this.messageService.add({severity: "error", summary: "Fehler", detail: "Ungültiger Wert", life: 5000});
    } else {
      this.maxerl = "" + parsed;
      this.configService.saveConfig(confMAXERL, parsed).then((rc) => {
        this.status.success("Neuer Wert " + parsed + " für Anzahl Tage gespeichert.")
      }, (reason) => {
        console.error("MAXERL not saved");
        console.dir(reason);
        this.status.error("Fehler: Anzahl Tage wurde nicht gespeichert: " + reason);
      });
    }
  }

  public setPrice() {
    const parsed = Number.parseFloat(this.pricegb.replace(",", "."));
    if (Number.isNaN(parsed) || parsed < 0) {
      this.pricegb = "0,90";
      console.debug("PRICE-Value invalid");
      this.status.error("Fehler: Ungültiger Wert für Preis je GB.");
      this.messageService.add({severity: "error", summary: "Fehler", detail: "Ungültiger Wert", life: 5000});
    } else {
      this.pricegb = ("" + parsed).replace(".", ",");
      this.configService.saveConfig(confGBPRICE, parsed).then((rc) => {
        this.status.success("Neuer Wert " + this.pricegb + " für Preis je GB gespeichert.")
      }, (reason) => {
        console.error("PRICE not saved");
        console.dir(reason);
        this.status.error("Fehler: Preis je GB wurde nicht gespeichert: " + reason);
      });
    }
  }

  public setMwst() {
    const parsed = Number.parseFloat(this.mwst.replace(",", "."));
    if (Number.isNaN(parsed) || parsed < 0) {
      this.mwst = "19";
      console.debug("MWST-Value invalid");
      this.status.error("Fehler: Ungültiger Wert für MWSt.");
      this.messageService.add({severity: "error", summary: "Fehler", detail: "Ungültiger Wert", life: 5000});
    } else {
      this.mwst = ("" + parsed).replace(".", ",");
      this.configService.saveConfig(confMWST, parsed).then((rc) => {
        this.status.success("Neuer Wert " + this.mwst + " für MWSt gespeichert.")
      }, (reason) => {
        console.error("MWST not saved");
        console.dir(reason);
        this.status.error("Fehler: MWSt wurde nicht gespeichert: " + reason);
      });
    }
  }

  public setSenderMail() {
    // TODO auf gueltige eMail checken
    this.configService.saveConfig(confMAILFROM, this.senderMail).then((rc) => {
      this.status.success("Absender-E-Mail " + this.senderMail + " gespeichert.")
    }, (reason) => {
      console.error("senderMail not saved");
      console.dir(reason);
      this.status.error("Fehler: Absender-E-Mail wurde nicht gespeichert: " + reason);
    });
  }

  public setAdminMail() {
    // TODO auf gueltige eMail checken
    this.configService.saveConfig(confADMINMAIL, this.adminMail).then((rc) => {
      this.status.success("Admin-E-Mail " + this.adminMail + " gespeichert.")
    }, (reason) => {
      console.error("adminMail not saved");
      console.dir(reason);
      this.status.error("Fehler: Admin-E-Mail wurde nicht gespeichert: " + reason);
    });
  }

  public readAll() {
    this.confirmationService.confirm(
      {
        message: "Sollen wirklich alle Laufwerke neu eingelesen werden?",
        accept : () => {
          this.adminService.execReadAll();
        }
      });
  }

  public vormerkAll() {
    this.confirmationService.confirm(
      {
        message: "Sollen wirklich alle Vormerkungen ausgeführt werden?",
        accept : () => {
          this.adminService.execVormerkAll();
        }
      });
  }

}
