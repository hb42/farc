import { HttpClient } from "@angular/common/http";
import { Injectable, } from "@angular/core";

import { AppConfig } from "@hb42/lib-client";
import {
  apiRESULT,
  apiRESULTS, apiROOT,
  apiVORMERKUNG,
  FarcEntryTypes,
  FarcResultDocument,
  FarcSelectType,
  FarcTreeNode,
} from "@hb42/lib-farc";
import { ConfirmationService } from "primeng/api";
import { OverlayPanel } from "primeng/primeng";

import { ConfigService, StatusService, UserSession, } from "../shared";
import { FarcTreeService } from "../tree";

@Injectable()
export class SelectService {

  public selectlist: FarcTreeNode[];
  public selectedFiles: FarcTreeNode[] = [];
  public loading = false;

  public resultlistAll: FarcResultDocument[];
  public resultlist: FarcResultDocument[];
  public resultFiles: FarcResultDocument[] = [];

  public tablestat = true; // true - Vormerkungen, false - Results
  public resultstat = true; // true- success, false - errors
  public logContent = "";
  public userSession: UserSession;

  private restServer: string;

  public get selectTable(): string {
    return this.userSession.selectTable ? this.userSession.selectTable : "vorm";
  }
  public set selectTable(tab: string) {
    if (tab !== this.selectTable) {
      this.userSession.selectTable = tab;
      this.switchTable(tab);
    }
  }
  public get sortField(): string {
    return this.userSession.selectlistsortField;
  }

  public get sortOrder(): number {
    return this.userSession.selectlistsortOrder;
  }

  public get sortResultField(): string {
    return this.userSession.resultlistsortField;
  }

  public get sortResultOrder(): number {
    return this.userSession.resultlistsortOrder;
  }

  constructor(private httphandler: HttpClient,
              private configService: ConfigService,
              private status: StatusService,
              private confirmationService: ConfirmationService,
              public farcService: FarcTreeService) {

    this.restServer = AppConfig.settings.webserviceServer + apiROOT;
    this.userSession = this.configService.getUserConfig();
    if (!this.sortField) {
      this.userSession.setSelectsort("label", 1);
    }
    this.switchTable(this.selectTable);
  }

  /**
   * Eindeutiger key fuer item
   */
  public rowTrackBy(index: number, item: FarcTreeNode) {
    return item.entryid;
  }
  public rowTrackByResult(index: number, item: FarcResultDocument) {
    return item._id;
  }

  public resetList() {
    this.switchTable(this.selectTable);
  }

  public switchTable(tab: string) {
    this.reloadList().then(() => {
      switch (tab) {
        case "vorm":
          this.tablestat = true;
          break;
        case "ok":
          this.filterResult(true);
          this.tablestat = false;
          break;
        case "error":
          this.filterResult(false);
          this.tablestat = false;
          break;
      }
    });
  }

  private reloadList(): Promise<boolean> {
    this.loading = true;
    return this.getSelectList()
      .then((sel) => {
        console.debug("load Select-List");
        this.selectlist = this.sorttable(sel);
        return this.getResultList()
          .then((res) => {
            this.resultlistAll = this.sortresulttable(res);
            this.loading = false;
            return true;
          })
          .catch((err) => {
            console.error("error reading Result-List " + err);
            this.loading = false;
            return false;
          });
      })
      .catch((err) => {
        console.error("error reading Select-List " + err);
        return false;
      });
  }

  private filterResult(succ: boolean) {
    this.resultlist = this.resultlistAll.filter((r) => succ === r.success);
  }

  /**
   * Einzelne Vormerkung entfernen
   *
   * @param node
   */
  public undoSelectionFor(node: FarcTreeNode) {
    this.deleteSelection(node);
    this.removeSelection(node);
    // Tree-View updaten
    this.farcService.switchTree(this.farcService.isArcTree);
  }

  // Vormerkung in farcTreeService.tree und der DB entfernen
  private deleteSelection(node: FarcTreeNode) {
    node.selected = FarcSelectType.none;
    node.selectUid = "";
    node.selectDate = 0;
    this.farcService.undoSelectionForId(node);
  }
  // Vormerkung aus der Vormerkliste entfernen
  private removeSelection(node: FarcTreeNode) {
    const idx: number = this.selectlist.findIndex((d) => d.entryid === node.entryid);
    this.selectlist.splice(idx, 1);
  }

  /**
   * Alle Vormerkungen entfernenn
   *
   */
  public deleteAll() {
    this.confirmationService.confirm(
      {
        message: "Sollen alle Vormerkungen gelöscht werden?",
        accept : () => {
          this.loading = true;
          [...this.selectlist].forEach((node) => {
            this.deleteSelection(node);
          });
          this.selectlist = [];
          this.farcService.switchTree(this.farcService.isArcTree);
          this.loading = false;
        },
      });
  }

  /**
   * Vormerkung sofort ausfuehren
   *
   * @param node
   */
  public execVormerk(node: FarcTreeNode) {
    this.farcService.execVormerk(node).then((rc) => {
      this.resetList();
    });
  }

  private getSelectList(): Promise<FarcTreeNode[]> {
    return this.httphandler.get<FarcTreeNode[]>(this.restServer + apiVORMERKUNG).toPromise();
  }

  private selectListSort() {
    this.selectlist.sort((a: FarcTreeNode, b: FarcTreeNode) =>
                           this.farcService.fullPath(a).localeCompare(this.farcService.fullPath(b)));
  }

  public sort(event) {
    // event.data = Data to sort
    // event.mode = 'single' or 'multiple' sort mode
    // event.multiSortMeta = SortMeta array in multiple sort
    // event.field = Field to sort -> label - timestamp - size
    // event.order = Sort order -> 1 asc, -1 desc

    // debounce
    if (this.sortOrder === event.order && this.sortField === event.field) {
      return;
    }
    this.userSession.setSelectsort(event.field, event.order);
    this.selectlist = this.sorttable(this.selectlist);
  }

  private sorttable(files: FarcTreeNode[]): FarcTreeNode[] {
    return files = [...files.sort((a: FarcTreeNode, b: FarcTreeNode) => {
      let result: number = null;
      if (a.entrytype !== b.entrytype) {
        return a.entrytype === FarcEntryTypes.dir ? -1 : 1;
      } else {
        switch (this.sortField) {
          case "label":
            result = this.farcService.fullPath(a).localeCompare(this.farcService.fullPath(b));
            break;
          case "selectDate":
            result = (a.selectDate < b.selectDate) ? -1 : (a.selectDate > b.selectDate) ? 1 : 0;
            break;
          case "selectUid":
            result = a.selectUid.localeCompare(b.selectUid);
            break;
          default:
            break;
        }
      }
      return this.sortOrder * result;
    })];
  }

  // --- Result ---

  public showLog(event, row: FarcResultDocument, op: OverlayPanel) {
    this.logContent = row.log;
    op.toggle(event);
  }

  public async deleteResult(row: FarcResultDocument): Promise<string> {
    const idx: number = this.resultlist.findIndex((d) => d._id === row._id);
    const rc: string = await this.delResult(row);
    if (rc === "OK") {
      this.status.success("Erledigte Vormerkung gelöscht.");
      // das ist eigentlich redundant, aber nur so klappt der refresh der Anzeige,
      // wenn mehrere Eintraege in einer Schleife geloescht werden (-> deleteAllResults())
      this.resultlist = [...this.resultlist.splice(idx, 1)];
    } else {
      this.status.error("Fehler beim Löschen einer erledigten Vormerkung - " + rc);
    }
    return rc;
  }

  public async deleteAllResults() {
    const del: Promise<string>[] = [...this.resultlist].map((res) => this.deleteResult(res));
    const ok: boolean = await Promise.all(del)
      .then((rc: string[]) => rc.reduce((st, cur) => st && cur === "OK", true));
    if (ok) {
      this.status.success("Alle erledigten Vormerkungen gelöscht.")
    } else {
      this.status.error("Nicht alle Erledigten konnten gelöscht werden.");
    }
  }

  public fullPath(row: FarcResultDocument): string {
    return [...row.path, row.label].join("/");
  }

  public success(s: boolean): string {
    return s ? "OK" : "Fehler";
  }

  public sortResult(event) {
    // event.data = Data to sort
    // event.mode = 'single' or 'multiple' sort mode
    // event.multiSortMeta = SortMeta array in multiple sort
    // event.field = Field to sort -> label - timestamp - size
    // event.order = Sort order -> 1 asc, -1 desc

    // debounce
    if (this.sortResultOrder === event.order && this.sortResultField === event.field) {
      return;
    }
    this.userSession.setResultsort(event.field, event.order);
    this.resultlist = this.sortresulttable(this.resultlist);
  }

  private sortresulttable(files: FarcResultDocument[]): FarcResultDocument[] {
    return files = [...files.sort((a: FarcResultDocument, b: FarcResultDocument) => {
      let result: number = null;
        switch (this.sortResultField) {
          case "success":
            result = (a.success < b.success) ? -1 : (a.success > b.success) ? 1 : 0;
            break;
          case "label":
            result = this.fullPath(a).localeCompare(this.fullPath(b));
            break;
          case "selectUid":
            result = a.selectUid.localeCompare(b.selectUid);
            break;
          case "selectDate":
            result = (a.selectDate < b.selectDate) ? -1 : (a.selectDate > b.selectDate) ? 1 : 0;
            break;
          case "processDate":
            result = (a.processDate < b.processDate) ? -1 : (a.processDate > b.processDate) ? 1 : 0;
            break;
          default:
            break;
        }

      return this.sortResultOrder * result;
    })];
  }

  private getResultList(): Promise<FarcResultDocument[]> {
    return this.httphandler.get<FarcResultDocument[]>(this.restServer + apiRESULTS).toPromise();
  }

  private delResult(result: FarcResultDocument): Promise<any> {
    return this.httphandler.request("delete", this.restServer + apiRESULT + "/" + result._id).toPromise();
  }

}
