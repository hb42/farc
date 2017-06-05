import {
    Component,
    Inject,
    OnInit,
    ViewChild,
    // ViewContainerRef,
} from "@angular/core";
import {
    Tree,
    TreeNode,
} from "primeng/primeng";

import {
  FarcTreeService,
} from "../";
import {
  FarcEntryTypes,
  FarcTreeNode,
} from "../../../shared/ext";

@Component({
  selector: "farc-tree",
  templateUrl: "./farctree.component.html",
  styleUrls: ["./farctree.component.css"],
           })
export class FarcTreeComponent implements OnInit {

  @ViewChild("farctree") protected farcTree: Tree;  // f. Zugriff auf Tree-API

  constructor(public farcService: FarcTreeService) {
    console.info("c'tor FarcTree" );
  }

  public ngOnInit(): void {
    //
  }

  protected getnodestyle(node) {
    if (node.type === FarcEntryTypes.ep) {
      return {"font-weight": "bold"};  // color nur, wenn selected beruecksichtigt wird
                                       // -> ui-state-hightlight -> selectors!
    }
  }

}
