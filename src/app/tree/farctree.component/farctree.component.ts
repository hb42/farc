import { Component, HostBinding, OnInit, ViewChild, } from "@angular/core";
import { SelectItem, Tree, } from "primeng/primeng";

import { FarcEntryTypes, } from "@hb42/lib-farc";

import { FarcTreeService, } from "../farctree.service";

@Component({
             selector   : "farc-tree",
             templateUrl: "./farctree.component.html",
             styleUrls  : ["./farctree.component.css"],
           })
export class FarcTreeComponent implements OnInit {
  @HostBinding("attr.class") cssClass = "flex-content-fix flex-col";

  @ViewChild("farctree") protected farcTree: Tree;  // f. Zugriff auf Tree-API

  public sortButtons: SelectItem[];

  constructor(public farcService: FarcTreeService) {
    console.debug("c'tor FarcTree");
  }

  public ngOnInit(): void {
    this.sortButtons = [];
    this.sortButtons.push({label: "Name", value: true, icon: "fa fa-fw fa-sort-alpha-asc"});
    this.sortButtons.push({label: "Größe", value: false, icon: "fa fa-fw fa-sort-numeric-desc"});
  }

  protected getnodestyle(node) {
    if (node.type === FarcEntryTypes.ep) {
      return {"font-weight": "bold"};  // color nur, wenn selected beruecksichtigt wird
                                       // -> ui-state-hightlight -> selectors!
    }
  }

}
