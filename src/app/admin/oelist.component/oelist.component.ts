/**
 * Created by hb on 05.02.17.
 */

import { Component, HostBinding, OnInit, } from "@angular/core";

import { confROLES, FarcOe, FarcOeDocument, FarcRole, } from "@hb42/lib-farc";
import { ConfirmationService, } from "primeng/primeng";

import { ConfigService, StatusService} from "../../shared";
import { AdminService, } from "../admin.service";

@Component({
             selector   : "farc-oe-list",
             // host: {
             //   class: "flex-content-fix flex-col",
             // },
             templateUrl: "./oelist.component.html",
           })
export class OeListComponent implements OnInit {
  @HostBinding("attr.class") cssClass = "flex-content-fix flex-col";

  public oes: FarcOeDocument[] = [];
  // private oes: FarcOeDocument[];
  private roles: FarcRole[];

  public displayDialog = false;
  public editData: FarcOe;
  private selected: FarcOe;
  public allroles: FarcRole[];
  public oeroles: FarcRole[];

  constructor(private adminService: AdminService,
              private configService: ConfigService,
              private confirmationService: ConfirmationService,
              private statusService: StatusService) {
    console.debug("c'tor OeList");

  }

  public ngOnInit(): void {
    this.adminService.getOEs().subscribe(
      (res: FarcOeDocument[]) => {
        this.oes = res;
        this.sortOes();
      },
      (err) => {
        console.error("Error loading OEs " + err);
        this.statusService.error("Fehler beim Lesen der OEs");
      },
    );

    this.configService.getConfig(confROLES).then(
      (res: FarcRole[]) => {
        this.roles = res;
      },
      (err) => {
        console.error("Error reading roles " + err);
        this.statusService.error("Fehler beim Lesen der Benutzer-Rollen");
      },
    );
  }

  public rowTrackBy(index: number, item: FarcOeDocument) {
    return item._id;
  }

  public newOe() {
    this.selected = null;
    this.editData = {
      name : "",
      roles: [],
    };
    this.oeroles = [];
    this.buildpicklist();
    this.displayDialog = true;
  }

  public editOe(oe: FarcOeDocument) {
    this.selected = oe;
    this.editData = {
      name : oe.name,
      roles: [],
    };
    this.oeroles = [];
    oe.roles.forEach((r) => {
      this.editData.roles.push(r);
      this.oeroles.push(r);
    });
    this.sortOeRoles();
    this.buildpicklist();
    this.displayDialog = true;
  }

  public deleteOe(oe: FarcOeDocument) {
    this.confirmationService.confirm(
      {
        message: "Soll die OE " + oe.name + " gelöscht werden?",
        accept : () => {
          const idx: number = this.oes.findIndex((d) => d._id === oe._id);
          this.adminService.deleteOE(oe).subscribe(
            (res) => {
              this.statusService.info("OE gelöscht");
              this.oes.splice(idx, 1);
            },
            (err) => {
              console.error("error deleting OE " + err);
              this.statusService.error("Fehler beim Löschen der OE");
            },
          );
        },
      });
  }

  public dlgSave() {
    this.displayDialog = false;
    if (this.selected) {
      this.selected.name = this.editData.name;
      this.selected.roles = this.oeroles.map((r) => r);
      this.saveOe(this.selected);
    } else {
      this.editData.roles = this.oeroles.map((r) => r);
      // this.oes.push({name: this.editData.name, roles: this.editData.roles} as FarcOeDocument);
      this.saveOe(this.editData);
    }
  }

  private saveOe(oe: FarcOe) {
    this.adminService.setOE(oe).subscribe(
      (res: FarcOeDocument) => {
        this.statusService.info("OE gespeichert");
        const exist: FarcOeDocument = this.oes.find((o) => res._id === o._id);
        if (exist) {
          exist.name = res.name;
          exist.roles = res.roles;
        } else {
          this.oes = [...this.oes, res];
        }
        this.sortOes();
      },
      (err) => {
        console.error("Error saving OE " + err);
        this.statusService.error("Fehler beim Speichern der OE");
      },
    );
  }

  private sortOes() {
    this.oes.sort((a: FarcOeDocument, b: FarcOeDocument) => a.name.localeCompare(b.name));
  }

  private sortOeRoles() {
    this.oeroles.sort((a: FarcRole, b: FarcRole) => a.name.localeCompare(b.name));
  }

  private sortAllRoles() {
    this.allroles.sort((a: FarcRole, b: FarcRole) => a.name.localeCompare(b.name));
  }

  public onMoveToTarget(evt) {
    this.sortOeRoles();
  }

  public onMoveToSource(evt) {
    this.sortAllRoles();
  }

  private buildpicklist() {
    this.allroles = this.roles.filter((r) => {
      return !this.editData.roles.some((er) => er.name.toLowerCase() === r.name.toLowerCase());
    });
    this.sortAllRoles();
  }

}
