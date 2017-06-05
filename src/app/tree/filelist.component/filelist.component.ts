/**
 * Created by hb on 07.10.16.
 */

import {
    Component,
    HostBinding,
    // Inject,
    OnInit,
    ViewChild,
    // ViewContainerRef,
    ViewEncapsulation,
} from "@angular/core";

import {
    FarcTreeService,
} from "../";

@Component({
             selector: "farc-file-list",
             // host: {
             //   class: "flex-content-fix flex-col",
             // },
             styleUrls: [ "./filelist.component.css" ],
             templateUrl: "./filelist.component.html",
             // bringt minimale Verbesserung beim IE
             // encapsulation: ViewEncapsulation.None,
           })
export class FileListComponent implements OnInit {
  @HostBinding("attr.class") cssClass = "flex-content-fix flex-col";

  public bcHeight: string;
  public tbHeight: string;

  // @ViewChild("filetable") protected filetable: DatatableComponent;

  constructor(public farcService: FarcTreeService) {
    console.info("c'tor FileList");
  }

  public ngOnInit(): void {
    this.bcHeight = "34.5px";
    this.tbHeight = "40px";

    console.info("FileList onInit");
    // TODO ist das hier sinnvoll?
    // this.farcService.gotoSelected();
  }

  public testExp() {
    const path = ["J:", "ub_produktion", "organisation", "IT", "Bauer"];
    this.farcService.expandTo(path);
  }

}
