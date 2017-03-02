/**
 * Created by hb on 17.01.17.
 */

import {
  Component,
  Inject,
  OnInit,
} from "@angular/core";
import {
  ConfirmationService,
  SelectItem,
} from "primeng/primeng";

import {
  FarcDrive,
  FarcDriveDocument,
  FarcDriveTypes,
} from "@hb42/lib-farc";

import {
  AdminService,
} from ".";

@Component({
             selector: "drive-list",
             host: {
               class: "flex-content-fix flex-col",
             },
             template: `
             <p-dataTable [value]="drives" 
               scrollable="true" scrollHeight="100%">
               <!--<header>-->
                 <!--Single Selection-->
               <!--</header>-->
               <!--<p-column [style]="{'width':'38px'}" selectionMode="single"></p-column>-->
               <p-column [style]="{'width':'100px'}" field="type" header="Typ">
                <template pTemplate let-col let-row="rowData">
                   {{row[col.field] | drivetype}}
                 </template>
               </p-column>
               <p-column [style]="{'width':'100px'}" field="displayname" header="Name">
               </p-column>
               <p-column field="sourcepath" header="Pfad">
               </p-column>
               <p-column field="archivepath" header="Pfad Archiv">
               </p-column>
               <p-column [style]="{'width':'80px'}">
                 <template pTemplate="header">
                   <button type="button" pButton (click)="newDrive()" icon="fa-file-o" class="minibtn"
                           title="Neues Laufwerk"></button>
                 </template>
                 <template let-drv="rowData" pTemplate="body">
                   <button type="button" pButton (click)="editDrive(drv)" icon="fa-edit" class="minibtn"
                           title="Bearbeiten"></button>
                   <button type="button" pButton (click)="deleteDrive(drv)" icon="fa-trash" class="minibtn"
                           title="Löschen"></button>
                 </template>
               </p-column>
             </p-dataTable>
             
             <p-dialog header="Laufwerk" [(visible)]="displayDialog" 
                       [responsive]="true" showEffect="fade" [modal]="true">
               <div *ngIf="editdata">
                  <div class="row">
                      <div class="col-md-4"><label for="dname">Name</label></div>
                      <div class="col-md-8">
                        <input pInputText id="dname" [(ngModel)]="editdata.displayname" />
                      </div>
                  </div>
                  <div class="row">
                      <div class="col-md-4"><label for="source">Pfad</label></div>
                      <div class="col-md-8">
                        <input pInputText id="source" [(ngModel)]="editdata.sourcepath" style="width: 20em"/>
                      </div>
                  </div>
                  <div class="row">
                      <div class="col-md-4"><label for="arc">Pfad Archiv</label></div>
                      <div class="col-md-8">
                        <input pInputText id="arc" [(ngModel)]="editdata.archivepath" style="width: 20em"/>
                      </div>
                  </div>
                  <div class="row">
                      <div class="col-md-4"><label for="type">Typ</label></div>
                      <div class="col-md-8">
                        <p-dropdown [options]="types" [(ngModel)]="editdata.type" id="type" 
                                    [autoWidth]="false" [appendTo]="'body'"></p-dropdown>
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
export class DriveList implements OnInit {

  private drives: FarcDriveDocument[];

  private displayDialog: boolean = false;
  private selectedDrive: FarcDriveDocument;
  private editdata: FarcDrive;
  private types: SelectItem[] = [];

  constructor(private adminService: AdminService, private confirmationService: ConfirmationService) {
    console.info("c'tor DriveList" );
    const cnt = Object.keys(FarcDriveTypes).length / 2;
    for (let i = 0; i < cnt; i++) {
      this.types.push({label: FarcDriveTypes[i].toString(), value: i});
    }
    // options = options.slice(options.length / 2);
    // options.forEach( (o) => {
    //   this.types.push({label: FarcDriveTypes[o].toString(), value: FarcDriveTypes[o]});
    // });
    console.dir(this.types);
  }

  public ngOnInit(): void {
    this.adminService.getDrives().subscribe(
        (res: FarcDriveDocument[]) => {
          this.drives = res;
        },
        (err) => {
          console.error("Error loading drives " + err);
        },
    );
  }

  private editDrive(drv: FarcDriveDocument) {
    this.selectedDrive = drv;
    this.editdata = {
      displayname: drv.displayname,
      sourcepath: drv.sourcepath,
      archivepath: drv.archivepath,
      type: drv.type,
    };
    this.displayDialog = true;
  }
  private newDrive() {
    this.selectedDrive = null;
    this.editdata = {
      displayname: "A:",
      sourcepath: "/",
      archivepath: "/",
      type: FarcDriveTypes.daten,
    };
    this.displayDialog = true;
  }
  private deleteDrive(drv: FarcDriveDocument) {
    this.confirmationService.confirm(
        { message: "Soll das Laufwerk " + drv.displayname + " gelöscht werden?",
          accept: () => {
            const idx: number = this.drives.findIndex( (d) => d._id === drv._id);
            this.adminService.deleteDrive(drv).subscribe(
              (res) => {
                console.dir(res);
                this.drives.splice(idx, 1);
              },
              (err) => {
                console.error("error deleting drive " + err);
              },
            );
          },
        });
  }

  private saveDrive(drv: FarcDrive) {
    this.adminService.setDrive(drv).subscribe(
        (res: FarcDriveDocument) => {
          const exist: FarcDriveDocument[] = this.drives.filter( (d) => res._id === d._id);
          if (exist.length === 1) {
            exist[0].displayname = res.displayname;
            exist[0].sourcepath = res.sourcepath;
            exist[0].archivepath = res.archivepath;
            exist[0].type = res.type;
          } else {
            this.drives.push(res);
          }
        },
        (err) => {
          console.error("Error saving drive " + err);
        },
    );
  }

  private dlgSave() {
    this.displayDialog = false;
    if (this.selectedDrive) {  // edit
      this.selectedDrive.displayname = this.editdata.displayname;
      this.selectedDrive.sourcepath = this.editdata.sourcepath;
      this.selectedDrive.archivepath = this.editdata.archivepath;
      this.selectedDrive.type = this.editdata.type;
      this.saveDrive(this.selectedDrive);
    } else { // new
      this.saveDrive(this.editdata);
    }
  }

}
