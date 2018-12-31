/**
 * Created by hb on 17.01.17.
 */

import { Component, HostBinding, OnInit, } from "@angular/core";

import { FarcDrive, FarcDriveDocument, FarcDriveTypes, } from "@hb42/lib-farc";
import { ConfirmationService, SelectItem, } from "primeng/primeng";
import { StatusService } from "../../shared";

import { AdminService, } from "../admin.service";

@Component({
             selector   : "farc-drive-list",
             // host: {
             //   class: "flex-content-fix flex-col",
             // },
             templateUrl: "./drivelist.component.html",
           })
export class DriveListComponent implements OnInit {
  @HostBinding("attr.class") cssClass = "flex-content-fix flex-col";

  public drives: FarcDriveDocument[] = [];

  public displayDialog = false;
  private selectedDrive: FarcDriveDocument;
  public editdata: FarcDrive;
  public types: SelectItem[] = [];

  constructor(private adminService: AdminService,
              private confirmationService: ConfirmationService,
              private statusService: StatusService) {
    console.debug("c'tor DriveList");
    const cnt = Object.keys(FarcDriveTypes).length / 2;
    for (let i = 0; i < cnt; i++) {
      this.types.push({label: FarcDriveTypes[i].toString(), value: i});
    }
    // options = options.slice(options.length / 2);
    // options.forEach( (o) => {
    //   this.types.push({label: FarcDriveTypes[o].toString(), value: FarcDriveTypes[o]});
    // });
  }

  public ngOnInit(): void {
    this.adminService.getDrives().subscribe(
      (res: FarcDriveDocument[]) => {
        this.drives = res;
        console.debug("DriveList onInit");
      },
      (err) => {
        console.error("Error loading drives " + err);
        this.statusService.error("Fehler beim Lesen der Laufwerke.");
      },
    );
  }

  public rowTrackBy(index: number, item: FarcDriveDocument) {
    return item._id;
  }

  public editDrive(drv: FarcDriveDocument) {
    this.selectedDrive = drv;
    this.editdata = {
      displayname : drv.displayname,
      source_path : drv.source_path ? drv.source_path.replace(/\\/g, "/") : "",
      archive_path: drv.archive_path ? drv.archive_path.replace(/\\/g, "/") : "",
      type        : drv.type,
      user_s      : drv.user_s,
      pwd_s       : drv.pwd_s,
      user_a      : drv.user_a,
      pwd_a       : drv.pwd_a,
    };
    this.displayDialog = true;
  }

  public newDrive() {
    this.selectedDrive = null;
    this.editdata = {
      displayname : "A:",
      source_path : "/",
      archive_path: "/",
      type        : FarcDriveTypes.daten,
      user_s      : null,
      pwd_s       : null,
      user_a      : null,
      pwd_a       : null,
    };
    this.displayDialog = true;
  }

  public deleteDrive(drv: FarcDriveDocument) {
    this.confirmationService.confirm(
      {
        message: "Soll das Laufwerk " + drv.displayname + " gelöscht werden?",
        accept : () => {
          const idx: number = this.drives.findIndex((d) => d._id === drv._id);
          this.adminService.deleteDrive(drv).subscribe(
            (res) => {
              this.drives.splice(idx, 1);
              this.statusService.info("Laufwerk gelöscht");
            },
            (err) => {
              console.error("error deleting drive " + err);
              this.statusService.error("Fehler beim Löschen des Laufwerks");
            },
          );
        },
      });
  }

  private saveDrive(drv: FarcDrive) {
    this.adminService.setDrive(drv).subscribe(
      (res: FarcDriveDocument) => {
        this.statusService.info("Laufwerk gespeichert");
        const exist: FarcDriveDocument = this.drives.find((d) => res._id === d._id);
        if (exist) {
          exist.displayname = res.displayname;
          exist.source_path = res.source_path;
          exist.archive_path = res.archive_path;
          exist.type = res.type;
          exist.user_s = res.user_s;
          exist.pwd_s = res.pwd_s;
          exist.user_a = res.user_a;
          exist.pwd_a = res.pwd_a;
        } else {
          this.drives = [...this.drives, res];
        }
      },
      (err) => {
        console.error("Error saving drive " + err);
        this.statusService.error("Fehler beim Speichern des Laufwerks");
      },
    );
  }

  public dlgSave() {
    if (this.selectedDrive) {  // edit
      this.selectedDrive.displayname = this.editdata.displayname;
      this.selectedDrive.source_path = this.editdata.source_path.replace(/\\/g, "/");
      this.selectedDrive.archive_path = this.editdata.archive_path.replace(/\\/g, "/");
      this.selectedDrive.type = this.editdata.type;
      this.selectedDrive.user_s = this.editdata.user_s;
      this.selectedDrive.pwd_s = this.editdata.pwd_s;
      this.selectedDrive.user_a = this.editdata.user_a;
      this.selectedDrive.pwd_a = this.editdata.pwd_a;
      this.saveDrive(this.selectedDrive);
    } else { // new
      this.saveDrive(this.editdata);
    }
    this.displayDialog = false;
  }

}
