import { Component, HostBinding, OnInit, } from "@angular/core";

import { FarcDriveDocument, FarcEndpunktDocument, FarcOeDocument, } from "@hb42/lib-farc";
import { SelectItem, } from "primeng/primeng";

import { StatusService, } from "../../shared";
import { AdminService, } from "../admin.service";

interface EpList {
  path: string;
  oe: string;
  ep: FarcEndpunktDocument;
}

@Component({
             selector   : "farc-ep-list",
             templateUrl: "./ep-list.component.html",
             styleUrls  : ["./ep-list.component.css"],
           })
export class EpListComponent implements OnInit {
  @HostBinding("attr.class") cssClass = "flex-content-fix flex-col";

  private eps: FarcEndpunktDocument[] = [];
  private oes: FarcOeDocument[] = [];
  private drives: FarcDriveDocument[] = [];

  private eplistAll: EpList[] = [];
  public eplist: EpList[] = [];
  public oelist: SelectItem[];
  public isFiltered = false;
  public loading = false;

  public displayDialog = false;
  public editData: EpList;
  public editOe;

  constructor(private adminService: AdminService, private statusService: StatusService) {

  }

  public ngOnInit() {
    this.loading = true;
    this.adminService.getOEs().subscribe(
      (res: FarcOeDocument[]) => {
        this.oes = res;
        this.adminService.getEps().subscribe(
          (epres: FarcEndpunktDocument[]) => {
            this.eps = epres;
            this.adminService.getDrives().subscribe(
              (drvres: FarcDriveDocument[]) => {
                this.drives = drvres;
                this.eplistAll = this.eps.map((e) => {
                  return {
                    path: this.pathFor(e),
                    oe  : this.oeForEp(e),
                    ep  : e,
                  } as EpList;
                });
                this.eplistAll.sort((a: EpList, b: EpList) => a.path.localeCompare(b.path));
                this.eplist = this.eplistAll;
                this.oelist = this.oes.map((oe) => {
                  return {
                    label: oe.name,
                    value: oe._id
                  } as SelectItem;
                });
                this.oelist.unshift({label: "---", value: null} as SelectItem);
                this.loading = false;
              },
              (err) => {
                console.error("Error loading drives " + err);
                this.statusService.error("Fehler beim Lesen der Laufwerke");
                this.loading = false;
              },
            );
          },
          (err) => {
            console.error("Error loading EPs " + err);
            this.statusService.error("Fehler beim Lesen der Endpunkte");
            this.loading = false;
          },
        );
        this.sortOes();
      },
      (err) => {
        console.error("Error loading OEs " + err);
        this.statusService.error("Fehler beim Lesen der OEs");
        this.loading = false;
      },
    );
  }

  public rowTrackBy(index: number, item: EpList) {
    return item.ep._id;
  }

  public editEp(ep: EpList) {
    this.editData = ep;
    this.editOe = ep.ep.oe;
    this.displayDialog = true;
  }

  public dlgSave() {
    this.displayDialog = false;
    this.adminService.setEp(this.editData.ep, this.editOe).subscribe(
      (rc: FarcEndpunktDocument) => {
        this.editData.ep.oe = rc.oe;
        this.editData.oe = this.oeForEp(this.editData.ep);
        this.statusService.success("OE geändert für Endpunkt " + this.editData.path);
      },
      (err) => {
        console.error("Error updating EP " + err);
        this.statusService.error("Fehler: OE NICHT geändert für Endpunkt " + this.editData.path);
      });
  }

  protected pathFor(ep: FarcEndpunktDocument): string {
    const drv = this.drives.find((d) => d._id === ep.drive);
    return drv.displayname + "/" + (ep.above ? ep.above + "/" : "") + ep.endpunkt;
  }

  protected oeForEp(ep: FarcEndpunktDocument): string {
    const o = this.oes.find((oe) => oe._id === ep.oe);
    if (o) {
      return o.name;
    } else {
      return "";
    }
  }

  public filterList() {
    if (!this.isFiltered) {
      this.eplist = this.eplistAll.filter((ep) => !ep.ep.oe);
      this.isFiltered = true;
    } else {
      this.eplist = this.eplistAll;
      this.isFiltered = false;
    }
  }

  private sortOes() {
    this.oes.sort((a: FarcOeDocument, b: FarcOeDocument) => a.name.localeCompare(b.name));
  }

}
