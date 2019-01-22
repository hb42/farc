import { Component, HostBinding, OnInit, ViewChild, } from "@angular/core";
import { Tree, } from "primeng/primeng";

import { ConfigService } from "../../shared";

import { FarcTreeService, } from "../farctree.service";

@Component({
             selector   : "farc-tree",
             templateUrl: "./farctree.component.html",
             styleUrls  : ["./farctree.component.css"],
           })
export class FarcTreeComponent implements OnInit {
  @HostBinding("attr.class") cssClass = "flex-content-fix flex-col";

  @ViewChild("farctree") protected farcTree: Tree;  // f. Zugriff auf Tree-API

  constructor(public farcService: FarcTreeService, public configService: ConfigService) {
    console.debug("c'tor FarcTree");
  }

  public ngOnInit(): void {
  }

}
