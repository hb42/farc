/**
 * Created by hb on 17.01.17.
 */

import {
  Component,
  HostBinding,
  Inject,
  OnInit,
} from "@angular/core";
import {
  ConfirmationService,
  SelectItem,
} from "primeng/primeng";

import {
  AdminService,
} from "..";
import {
  FarcDrive,
  FarcDriveDocument,
  FarcDriveTypes,
} from "../../../shared/ext";

@Component({
             selector: "farc-drive-list",
             // host: {
             //   class: "flex-content-fix flex-col",
             // },
             templateUrl: "./drivelist.component.html",
           })
export class DriveListComponent implements OnInit {
  @HostBinding("attr.class") cssClass = "flex-content-fix flex-col";

  public drives: FarcDriveDocument[];

  public displayDialog = false;
  private selectedDrive: FarcDriveDocument;
  public editdata: FarcDrive;
  public types: SelectItem[] = [];

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

  public editDrive(drv: FarcDriveDocument) {
    this.selectedDrive = drv;
    this.editdata = {
      displayname: drv.displayname,
      sourcepath: drv.sourcepath,
      archivepath: drv.archivepath,
      type: drv.type,
    };
    this.displayDialog = true;
  }
  public newDrive() {
    this.selectedDrive = null;
    this.editdata = {
      displayname: "A:",
      sourcepath: "/",
      archivepath: "/",
      type: FarcDriveTypes.daten,
    };
    this.displayDialog = true;
  }
  public deleteDrive(drv: FarcDriveDocument) {
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

  public dlgSave() {
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
