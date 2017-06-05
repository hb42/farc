/**
 * Created by hb on 05.02.17.
 */

import {
  Component,
  HostBinding,
  Inject,
  OnInit,
} from "@angular/core";
import {
  ConfirmationService,
} from "primeng/primeng";

import {
  AdminService,
} from "..";
import {
  confROLES,
  FarcOe,
  FarcOeDocument,
  FarcRole,
} from "../../../shared/ext";
import {
  ConfigService,
} from "../../shared";

@Component({
             selector: "farc-oe-list",
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
              private confirmationService: ConfirmationService) {
    console.info("c'tor OeList");

  }

  public ngOnInit(): void {
    this.adminService.getOEs().subscribe(
        (res: FarcOeDocument[]) => {
          this.oes = res;
          this.sortOes();
        },
        (err) => {
          console.error("Error loading OEs " + err);
        },
    );

    this.configService.getConfig(confROLES).subscribe(
        (res: FarcRole[]) => {
          this.roles = res;
        },
        (err) => {
          console.error("Error reading roles " + err);
        },
    );
  }

  public newOe() {
    this.selected = null;
    this.editData = {
      name: "",
      roles: [],
    };
    this.oeroles = [];
    this.buildpicklist();
    this.displayDialog = true;
  }

  public editOe(oe: FarcOeDocument) {
    this.selected = oe;
    this.editData = {
      name: oe.name,
      roles: [],
    };
    this.oeroles = [];
    oe.roles.forEach( (r) => {
      this.editData.roles.push(r);
      this.oeroles.push(r);
    });
    this.sortOeRoles();
    this.buildpicklist();
    this.displayDialog = true;
  }

  public deleteOe(oe: FarcOeDocument) {
    this.confirmationService.confirm(
        { message: "Soll die OE " + oe.name + " gelöscht werden?",
          accept: () => {
            const idx: number = this.oes.findIndex( (d) => d._id === oe._id);
            this.adminService.deleteOE(oe).subscribe(
                (res) => {
                  console.dir(res);
                  this.oes.splice(idx, 1);
                },
                (err) => {
                  console.error("error deleting OE " + err);
                },
            );
          },
        });
  }

  public dlgSave() {
    this.displayDialog = false;
    if (this.selected) {
      this.selected.name = this.editData.name;
      this.selected.roles = this.oeroles.map( (r) => r );
      this.saveOe(this.selected);
    } else {
      this.editData.roles = this.oeroles.map( (r) => r );
      this.saveOe(this.editData);
    }
  }

  private saveOe(oe: FarcOe) {
    this.adminService.setOE(oe).subscribe(
        (res: FarcOeDocument) => {
          const exist: FarcOeDocument[] = this.oes.filter( (o) => res._id === o._id);
          if (exist.length === 1) {
            exist[0].name = res.name;
            exist[0].roles = res.roles;
          } else {
            this.oes.push(res);
          }
          this.sortOes();
        },
        (err) => {
          console.error("Error saving OE " + err);
        },
    );
  }

  private sortOes() {
    this.oes.sort( (a: FarcOeDocument, b: FarcOeDocument) => a.name.localeCompare(b.name) );
  }
  private sortOeRoles() {
    this.oeroles.sort( (a: FarcRole, b: FarcRole) => a.name.localeCompare(b.name) );
  }
  private sortAllRoles() {
    this.allroles.sort( (a: FarcRole, b: FarcRole) => a.name.localeCompare(b.name) );
  }
  public onMoveToTarget(evt) {
    this.sortOeRoles();
  }
  public onMoveToSource(evt) {
    this.sortAllRoles();
  }
  private buildpicklist() {
    this.allroles = this.roles.filter( (r) => {
      return !this.editData.roles.some((er) => er.name.toLowerCase() === r.name.toLowerCase());
    });
    this.sortAllRoles();
  }

}
