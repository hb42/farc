import { AfterViewChecked, Component, ElementRef, HostBinding, HostListener, OnInit, } from "@angular/core";
import { SelectItem } from "primeng/api";
import { FarcTreeService } from "../../tree";

import { SelectService, } from "../select.service";

@Component({
             selector   : "farc-select-view",
             templateUrl: "./selectview.component.html",
             styleUrls  : ["./selectview.component.css"],
           })
export class SelectViewComponent implements OnInit, AfterViewChecked {
  @HostBinding("attr.class") cssClass = "flex-col flex-content-fix";

  public centerPaneWidth = "100%";
  public centerPaneMinWidth = "500px";
  public footerHeight = "35px";

  public selectButtons: SelectItem[];
  private tabBody: HTMLElement;
  private tabTable: HTMLElement;
  private tabHeader: HTMLElement;
  private checkTableHeight = false;
  private lastHeight = 0;

  constructor(public selectService: SelectService, public farcService: FarcTreeService, private el: ElementRef) {
    console.debug("c'tor SelectView");
  }

  public ngOnInit(): void {
    this.selectService.resetList();
    this.selectButtons = [];
    this.selectButtons.push({ label: "Vorgemerkt",
                              title: "für heute Nacht vorgemerkt",
                              value: "vorm",
                              icon: "fa fa-fw fa-check"});
    this.selectButtons.push({ label: "Erfolgreich",
                              title: "erfolgreich ausgeführte Vormerkungen",
                              value: "ok",
                              icon: "fa fa-fw fa-check-circle"});
    this.selectButtons.push({ label: "Fehlerhaft",
                              title: "mit Fehler beendete Vormerkungen",
                              value: "error",
                              icon: "fa fa-fw fa-minus-circle"});

  }

  public ngAfterViewChecked(): void {
    if (this.checkTableHeight) {
      this.checkTableHeight = false;
      setTimeout(() => {
        this.tabBody = this.el.nativeElement.querySelector(".ui-table-scrollable-body");
        this.tabTable = this.el.nativeElement.querySelector("#selectlisttable");  // umgebender DIV
        this.tabHeader = this.el.nativeElement.querySelector(".ui-table-scrollable-header");
        this.setTableHeight(true);
      }, 20);
    } else {
      this.setTableHeight();
    }
  }

  @HostListener("window:resize", ["$event"]) onResize(event) {
    this.setTableHeight(true);
  }

  private setTableHeight(resize?: boolean) {
    if (this.tabBody && this.tabTable && this.tabHeader) {
        // Vorsicht: bei der Verwendung von virtual scrolling bringt der haeufige Zugriff auf .offsetHeigth
        // die Berechnung des virtuellen Scrollbereichs durcheinander (s. FilelistComponent). Dann ist der
        // Check via .style.height erforderlich. Der funktioniert allerdings hier nicht sauber :-(
        // -> if (resize || this.lastHeight !== parseInt(this.tabBody.style.height, 10)) {
      this.lastHeight = this.tabTable.offsetHeight - this.tabHeader.offsetHeight;
      this.tabBody.style.maxHeight = this.lastHeight + "px";
      this.tabBody.style.height = this.lastHeight + "px";
    }
  }

}
