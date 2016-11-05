import {
    Component,
    Inject,
    OnInit,
    ViewChild,
    // ViewContainerRef,
} from "@angular/core";
import {
    Tree,
    // TreeNode,
} from "primeng/primeng";

import {
  FarcEntryTypes,
  FarcSession,
  // FarcTreeNode,
} from "@hb42/lib-farc";

import {
  FarcTreeService,
} from "./";

@Component({
  selector: "farc-tree",
  styles: [
    // ":host { height: 100%; width: 100%;}",
    // "p-tree { height: 100%; width: 100%; overflow: auto; }",
  ],
  template: `
    <p-tree [value]="farcService.tree" 
            (onNodeExpand)="loadNode($event)" 
            (onNodeSelect)="nodeSelect($event)"
            selectionMode="single" 
            [(selection)]="farcService.selectedNode"
            #farctree >
      <template let-node pTemplate type="strukt">
        <span [class.archivenode]="node.arc">{{node.label}}</span>
      </template>
      <template let-node pTemplate type="ep">
        <span [class.archivenode]="node.arc">{{node.label}} ({{node.size | filesize}})</span>
      </template>
      <template let-node pTemplate type="dir">
        <span [class.archivenode]="node.arc">{{node.label}} ({{node.size | filesize}})</span>
      </template>
      <template let-node pTemplate type="wait">
        <span [class.archivenode]="node.arc"><i class="fa fa-spinner fa-spin"></i></span>
      </template>
    </p-tree>
  `,
           })
export class FarcTree implements OnInit {

  // protected tree: TreeNode[];
  // protected selectedNode: TreeNode;
  // protected sortalpha: boolean = true;  // TODO Aenderungsmoeglichkeit fehlt noch

  @ViewChild("farctree") protected farcTree: Tree;  // f. Zugriff auf Tree-API

  constructor(private farcService: FarcTreeService, @Inject("SESSION") private session: FarcSession) {
    console.info("c'tor FarcTree" );
  }

  public ngOnInit(): void {
    // let path = this.session.treepath;
    // this.farcService.treeFor(null).subscribe(
    // this.farcTreeService.getTree().subscribe(
    //     (res) => {
    //       console.info("load tree");
    //       console.dir(res);
    //       this.sortTree(res);
    //       this.tree = this.setTreeIcons(res);
    //       // if (path) {
    //         // TODO letzten Pfad aufklappen -> fkt. noch nicht
    //         // this.expandTo(path);
    //       // }
    //     },
    //     (err) => { console.error("error reading Tree-Data " + err); },
    //     () => { console.info("done reading tree"); }
    // );
  }

  protected expandTo(path: string[]) {
    let nodes = this.farcService.tree;
    let part = [];
    path.forEach(p => {
      if (nodes) {
        part.push(p);
        let res = nodes.reduce((n1, n2) => {
          if (n2.label === p) {
            return n2;
          } else {
            return n1;
          }
        }, null);
        if (res) {
          // res.children =~ treeFor(part) -> async!!
          // TODO wie NodeExpand?
          // nodes = res.children;
          // this.selectedNode =

        } else {
          nodes = null;
        }
      }
    });

  }

  protected getnodestyle(node) {
    if (node.type === FarcEntryTypes.ep) {
      return {"font-weight": "bold"};  // color nur, wenn selected beruecksichtigt wird
                                       // -> ui-state-hightlight -> selectors!
    }
  }

  // // TODO als pipe definieren
  // protected formatSizeTmp(n: number) {
  //   let item: number = Number(n);
  //   if (item < 1024) {
  //     return item + " Bytes";
  //   } else {
  //     item = Math.round(item / 1024);
  //     if (item < 1024) {
  //       return item + " KB";
  //     } else {
  //       item = Math.round(item / 1024);
  //       if (item < 1024) {
  //         return item + " MB";
  //       } else {
  //         item = Math.round(item / 1024);
  //         if (item < 1024) {
  //           return item + " GB";
  //         } else {
  //           item = Math.round(item / 1024);
  //           return item + " TB";
  //         }
  //       }
  //     }
  //   }
  // }

  // protected sortNodes(nodes: FarcTreeNode[]) {
  //   if (this.sortalpha) {
  //     nodes.sort( (nodeA, nodeB) => nodeA.label.localeCompare(nodeB.label) );
  //   } else {
  //     nodes.sort( (nodeA, nodeB) => nodeA.size - nodeB.size );
  //   }
  // }
  //
  // protected sortTree(nodes: FarcTreeNode[]) {
  //   this.sortNodes(nodes);
  //   nodes.forEach( (n) => {
  //     if (n.files) {
  //       this.sortNodes(n.files);
  //     }
  //     if (n.children) {
  //       this.sortTree(n.children);
  //     }
  //   });
  // }

  // protected setTreeIcons(nodes: FarcTreeNode[]) {
  //   // fkt so nicht, weil diese icons zusaetzlich gesetzt werden
  //   // den toggle-icon ueberschreiben ist momentan nicht moeglich
  //   // nodes.forEach(n => {
  //   //   if (n.sub) {
  //   //     n.collapsedIcon = "fa-plus-square-o";
  //   //     n.expandedIcon = "fa-minus-square-o";
  //   //   } else {
  //   //     n.icon = "fa-square-o";
  //   //
  //   //   }
  //   // });
  //   return nodes;
  // }

  /** Lazy loading der Treeknoten (primeNG braucht sehr lange fuer die Darstellung umfangreicher Trees)
   *  -> onNodeExpand
   *
   * Dieser event wird nur fuer Knoten aufgerufen, bei denen leaf == false.
   * Serverseitig wird das entsprechend eingetragen.
   *
   * @param event
   */
  protected loadNode(event: any) {
    console.info("onNodeExpand");
    this.farcService.loadNode(event.node);
  }

  /**
   * Klick auf Node-Label
   *
   * Beim Klick auf das Label muss der event an die Datei-Liste weitergegeben werden.
   * Ausserdem soll der Knoten auch bei Klick auf den Text auf- bzw. zugeklappt werden.
   *
   * TODO: beobachten wg. moeglicher Seiteneffekte. Aenderungen in primeng koennten sich hier auswirken.
   *       (Dass das Aendern von node.expanded nicht den entsprechenden event triggert (-> UITreeNode.toggle())
   *        duerfte bei der tree-fn expandToPath noch Aerger machen. D.h. da wird es irgendwann einen Bugfix
   *        geben, der auch hier Auswirkungen hat)
   *        
   * @param event
   * @returns {boolean}
   */
  protected nodeSelect(event: any) {
    console.info("onNodeSelect");
    if (event.node.type === FarcEntryTypes.wait) {
      // der "Warten"-Icon hat keine Funktion
      return false;
    }
    // TODO save selected in session
      // let path = event.node ? event.node.path : [];
      // this.session.treepath = path;
      // this.farcService.saveSession(this.session)
      //     .subscribe(rc => console.info("save session " + rc));
    this.farcService.nodeSelect(event.node);

    // Auf-/Zuklappen bei Klick auf Label
    event.node.expanded = !!event.node.expanded;
    event.node.expanded = !event.node.expanded;
    // beruecksichtigt lazy loading nicht, also extra anstossen
    if (!event.node.leaf) {
      this.loadNode(event);
    }
  }

}
