import { AfterViewChecked, Component, ElementRef, HostBinding, HostListener, OnInit, ViewChild, } from "@angular/core";
import { Table } from "primeng/table";

import { FarcTreeService, } from "../farctree.service";

@Component({
             selector   : "farc-file-list",
             styleUrls  : ["./filelist.component.css"],
             templateUrl: "./filelist.component.html",
           })
export class FileListComponent implements OnInit, AfterViewChecked {
  @HostBinding("attr.class") cssClass = "flex-content-fix flex-col";

  @ViewChild("filetable") protected filetable: Table;

  private tabBody: HTMLElement;
  private tabTable: HTMLElement;
  private tabHeader: HTMLElement;
  private checkTableHeight = false;
  private lastHeight = 0;

  constructor(public farcService: FarcTreeService, private el: ElementRef) {
    console.debug("c'tor FileList");
  }

  public ngOnInit(): void {
    this.checkTableHeight = true;
    this.farcService.fileTable = this.filetable;
  }

  /**
   * Die Berechnung der Hoehe fuer den Scroll-Bereich in p-table passt nicht.
   * Der Seiten-Footer wird nicht beruecksichtigt, ausserdem wird beim Wechsel
   * zwischen den Tabs die Hoehe auf 320px zurueckgesetzt (warum auch immer).
   * Das hier ist ein Hack, bei dem die Hoehe jeweils neu berechnet wird.
   *
   * ngAfterViewChecked wird jeweils mehrfach aufgerufen, deshalb der Check,
   * denn die Neuberechnung braucht nur einmal zu laufen. Resize wird extra erledigt.
   * In AfterViewChecked sind die aktuellen Werte nicht unmittelbar verfuegbar,
   * deshalb die Verzoegerung mit setTimeout() (ohne den Check wuerde der
   * Timeout zudem in Endlosschleife weiterlaufen!?).
   * TODO -> u. a. dieses Issue beobachten:
   *      https://github.com/primefaces/primeng/issues/5235
   *
   */
  public ngAfterViewChecked(): void {
    // beim Start mit Verzoegerung
    if (this.checkTableHeight) {
      this.checkTableHeight = false;
      setTimeout(() => {
        this.setTableHeight();
      }, 10);
    } else {
      setTimeout(() => {
        this.setTableHeight();
      }, 0);
    }
  }

  @HostListener("window:resize", ["$event"]) onResize(event) {
    // console.debug("RESIZE");
    this.setTableHeight(true);
  }

  private setTableHeight(resize?: boolean) {
    if (!this.tabBody || !this.tabTable || !this.tabHeader) {
      this.tabBody = this.el.nativeElement.querySelector(".ui-table-scrollable-body");
      this.tabTable = this.el.nativeElement.querySelector("#filelisttable");  // umgebender DIV
      this.tabHeader = this.el.nativeElement.querySelector(".ui-table-scrollable-header");
    }
    if (this.tabBody && this.tabTable && this.tabHeader) {
      // wg. virtuall scrolling beim Check kein Zugriff auf .offsetHeight oder .getBoundingClientRect()
      // das loesst anscheinend einen zusaetzlichen scroll-event aus, der das virt scrolling stoert
      if (resize ||  this.lastHeight !== parseInt(this.tabBody.style.height, 10)) {
        this.lastHeight = this.tabTable.offsetHeight - this.tabHeader.offsetHeight;
        // console.debug("set table height " + this.lastHeight);
        this.tabBody.style.maxHeight = this.lastHeight + "px";
        this.tabBody.style.height = this.lastHeight + "px";
      }
    }
  }

}
