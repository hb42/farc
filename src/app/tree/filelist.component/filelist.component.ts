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
    FarcTreeService,
} from "../";
import {
  FarcEntryTypes,
  FarcTreeNode,
} from "../../../shared/ext";

@Component({
             selector: "farc-file-list",
             host: {
               class: "flex-content-fix flex-col",
             },
             styleUrls: [ "./filelist.component.css" ],
             templateUrl: "./filelist.component.html",
           })
export class FileList implements OnInit {

  private bcHeight: string;
  private tbHeight: string;

  constructor(private farcService: FarcTreeService) {
    console.info("c'tor FileList");
  }

  public ngOnInit(): void {
    this.bcHeight = "34.5px";
    this.tbHeight = "33px";

    console.info("FileList onInit");
    this.farcService.gotoSelected();
  }

  private testExp() {
    const path = ["J:", "ub_produktion", "organisation", "IT", "Bauer"];
    this.farcService.expandTo(path);
  }

}
