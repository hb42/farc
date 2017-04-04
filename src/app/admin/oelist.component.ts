/**
 * Created by hb on 05.02.17.
 */

import {
  Component,
  Inject,
  OnInit,
} from "@angular/core";
import {
  ConfirmationService,
} from "primeng/primeng";

import {
  confROLES,
  FarcOe,
  FarcOeDocument,
  FarcRole,
} from "@hb42/lib-farc";

import {
  AdminService,
} from ".";
import {
  ConfigService,
} from "../shared";

@Component({
             selector: "oe-list",
             host: {
               class: "flex-content-fix flex-col",
             },
             template: `
             <p-dataTable [value]="oes" 
               scrollable="true" scrollHeight="100%">
               <!--<header>-->
                 <!--Single Selection-->
               <!--</header>-->
               <!--<p-column [style]="{'width':'38px'}" selectionMode="single"></p-column>-->
               <p-column [style]="{'width':'200px'}" field="name" header="OE">
               </p-column>
               <p-column field="roles" header="Profile">
                 <ng-template pTemplate let-col let-row="rowData">
                   {{ row[col.field] | rolenames }}
                 </ng-template>
               </p-column>
               <p-column [style]="{'width':'80px'}">
                 <ng-template pTemplate="header">
                   <button type="button" pButton (click)="newOe()" icon="fa-file-o" class="minibtn" 
                           title="Neues Laufwerk"></button>
                 </ng-template>
                 <ng-template let-oe="rowData" pTemplate="body">
                   <button type="button" pButton (click)="editOe(oe)" icon="fa-edit" class="minibtn" 
                           title="Bearbeiten"></button>
                   <button type="button" pButton (click)="deleteOe(oe)" icon="fa-trash" class="minibtn" 
                           title="Löschen"></button>
                 </ng-template>
               </p-column>
             </p-dataTable>
             
             <p-dialog header="OE bearbeiten" [(visible)]="displayDialog" 
                       [responsive]="true" showEffect="fade" [modal]="true">
               <div *ngIf="editData">
                  <div class="row">
                      <div class="col-md-3"><label for="oname">OE-Name</label></div>
                  <div class="col-md-12">
                    <input pInputText id="oname" [(ngModel)]="editData.name" style="width: 20em" />
                  </div>
                  </div>
                  <div class="row">
                      <div class="col-md-3"><label for="type">Profile zuordnen</label></div>
                      <div class="col-md-12">
                        <p-pickList [source]="allroles" [target]="oeroles"
                                    sourceHeader="Profile" targetHeader="Profile der OE" 
                                    [showSourceControls]="false" [showTargetControls]="false"
                                    [responsive]="true" 
                                    (onMoveToTarget)="onMoveToTarget($event)"
                                    (onMoveToSource)="onMoveToSource($event)"
                                    >
                          <ng-template let-role pTemplate="item">
                            {{role.name}}
                          </ng-template>
                        </p-pickList>
                      </div>  
                  </div>
               </div>
                                 
               <p-footer> 
                  <div class="ui-dialog-buttonpane ui-widget-content ui-helper-clearfix">
                   <button type="button" pButton icon="fa-check" (click)="dlgSave()" label="Speichern"></button>
                  </div>
               </p-footer>
             </p-dialog>
             
             <p-confirmDialog header="Löschen" icon="fa fa-question-circle" 
                              acceptLabel="OK" rejectLabel="Abbrechen" ></p-confirmDialog>

             `,
           })
export class OeList implements OnInit {

  private oes: FarcOeDocument[] = [];
  // private oes: FarcOeDocument[];
  private roles: FarcRole[];

  private displayDialog: boolean = false;
  private editData: FarcOe;
  private selected: FarcOe;
  private allroles: FarcRole[];
  private oeroles: FarcRole[];

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

  private newOe() {
    this.selected = null;
    this.editData = {
      name: "",
      roles: [],
    };
    this.oeroles = [];
    this.buildpicklist();
    this.displayDialog = true;
  }

  private editOe(oe: FarcOeDocument) {
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

  private deleteOe(oe: FarcOeDocument) {
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

  private dlgSave() {
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
  private onMoveToTarget(evt) {
    this.sortOeRoles();
  }
  private onMoveToSource(evt) {
    this.sortAllRoles();
  }
  private buildpicklist() {
    this.allroles = this.roles.filter( (r) => {
      return !this.editData.roles.some((er) => er.name.toLowerCase() === r.name.toLowerCase());
    });
    this.sortAllRoles();
  }

}
