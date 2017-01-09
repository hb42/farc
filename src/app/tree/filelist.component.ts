/**
 * Created by hb on 07.10.16.
 */

import {
    Component,
    // Inject,
    OnInit,
    // ViewContainerRef,
} from "@angular/core";
import {
    MenuItem,
} from "primeng/primeng";

import {
    FarcTreeNode,
} from "@hb42/lib-farc";

import {
    FarcTreeService,
} from "./";

@Component({
             selector: "file-list",
             styles: [
               // verhindert schon mal Umbrueche in Breadcrumbs
               // allerdings laufen sie nach rechts ueber, das sollte rechtsbuendig sein
               ":host /deep/ .ui-breadcrumb { width: 1000%; }",
               // etwas mehr Platz fuer die Icons li+re 6px, top +1 (5px),
               // bottom 3 statt 0 dadurch bekommt Icon gleiche Hoehe wie Text
               ":host /deep/ .ui-breadcrumb ul li.fa { margin: 5px 6px 3px 6px; }",
               // "Home"-Icon entfernen (nicht display:none, damit auch das leere Panel
               // schon die volle Hoehe bekommt)
               ":host /deep/ .ui-breadcrumb ul li.fa-home { width: 1px; margin: 5px 0px 3px 0px; }",
                 // scrolling fkt. nicht ohne header => soweit moeglich ausblenden
                 // -> warten auf Bugfix
               // ":host /deep/ .ui-datatable-header {height: 0; padding: 0; border: none}",
             ],
             host: {
               class: "flex-content-fix flex-col",
             },
             template: `
             <!--<div class="flex-panel flex-content">-->
               <!--<ul>-->
                 <!--<li *ngFor="let item of files">-->
                   <!--{{item.label}} ({{item.size | filesize}})-->
                 <!--</li>-->
               <!--</ul>-->
             <!--</div>-->
             <p-breadcrumb class="flex-panel flex-content-fix"
                  [style.min-height]="bcHeight" [style.height]="bcHeight" [style.max-height]="bcHeight"
                  [model]="breadcrumbs"
                  >
             </p-breadcrumb>
             <!-- damit Scrolling fkt. muss dataTable mit div umgeben werden -->
             <div class="flex-panel flex-content-fix">  
             <p-dataTable [value]="files" [(selection)]="selectedFiles"
               scrollable="true" scrollHeight="100%">
               <!--<header>-->
                 <!--Single Selection-->
               <!--</header>-->
               <p-column [style]="{'width':'38px'}" selectionMode="multiple"></p-column>
               <p-column field="label" header="Name"></p-column>
               <p-column [style]="{'width':'180px'}" field="timestamp" header="Zeit">
                 <template pTemplate let-col let-row="rowData">
                   {{row[col.field] | date:"dd.MM.y, HH:mm:ss"}}
                 </template>
               </p-column>
               <p-column [style]="{'width':'100px'}" field="size" header="Größe">
                 <template pTemplate let-col let-row="rowData">
                   {{row[col.field] | filesize}}
                 </template>
               </p-column>
               <p-column [style]="{'width':'200px'}" field="selected" header="Vormerkung">
                 <template pTemplate let-col let-row="rowData">
                   {{row[col.field]}}  <!-- TODO pipe fuer selectedType, ggf. incl. UID, Date -->
                 </template>
               </p-column>
               <!--<footer>-->
                  <!--<ul>-->
                      <!--<li *ngFor="let f of selectedFiles" style="text-align: left">-->
                      <!--{{f.label}} - {{f.size | filesize }}</li>-->
                  <!--</ul>-->
               <!--</footer>-->
             </p-dataTable>
             </div>
             <p-toolbar class="flex-panel flex-content-fix"
                  [style.min-height]="tbHeight" [style.height]="tbHeight"
                  >
                <div class="ui-toolbar-group-left">
                  <span>Ausgewählte Zeilen: </span>
                  <button class="btn btn-xs btn-warning" ><i class="fa fa-plus"></i> Archivieren</button>
                  <button class="btn btn-xs btn-warning" ><i class="fa fa-trash"></i> Löschen</button>
                  <button class="btn btn-xs btn-warning" [class.disabled]="true" >
                    <i class="fa fa-history"></i> Vormerkung entfernen
                  </button>
            
                  <!--<i class="fa fa-bars"></i>-->
        
                  <!--<button pButton type="button" label="Save" ></button>-->
               </div>   
             </p-toolbar>
             `,
           })
export class FileList implements OnInit {

  protected selectedFiles: FarcTreeNode[];

  private node: FarcTreeNode;
  private bcHeight: string;
  private tbHeight: string;
  private breadcrumbs: MenuItem[] = [];

  private get files(): FarcTreeNode[] {
    return this.node ? this.node.files || [] : [];
  };

  constructor(private farcService: FarcTreeService) {
    console.info("c'tor FileList");
  }

  public ngOnInit(): void {
    this.bcHeight = "38px";
    this.tbHeight = "33px";

    this.farcService.detailEvent.subscribe(
        (node) => {
          this.node = node;
          this.mkBreadcrumbs();
          this.updateBreadcrumbs();
        },
        (err) => {
          console.info("error on detailEvent " + err);
        },
        () => {
          //
        });
  }

  private mkBreadcrumbs() {
    this.breadcrumbs = [];
    if (this.node && this.node.path) {
      this.node.path.forEach(p => {
        this.breadcrumbs.push({ label: p, command: (event) => { this.gotoPath(event.item); } });
      });
    }
  }

  /**
   * solange der Trenner bei primeng-breadcrumbs nicht per Programm
   * anpassbar ist.
   */
  private updateBreadcrumbs() {
    setTimeout( () => {
      let bcs = document.getElementsByClassName("ui-breadcrumb-chevron");
      for (let i = 0; i < bcs.length; i++) {
        bcs.item(i).classList.remove("fa-chevron-right");
        bcs.item(i).classList.add("fa-caret-right");
        bcs.item(i).innerHTML = " ";
      }
    }, 0);
  }
  private gotoPath(item: MenuItem) {
    console.info("goto path " + item.label);
  }
  // protected nodePath() {
  //   return this.node && this.node.path ? this.node.path.join("/") : "[keine]";
  // }

}
