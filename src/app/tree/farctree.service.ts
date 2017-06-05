/**
 * Created by hb on 17.07.16.
 */

import {
  EventEmitter,
  Inject,
  Injectable,
} from "@angular/core";
import {
  Http,
  Response,
} from "@angular/http";
import {
  MenuItem,
  Tree,
  TreeNode,
} from "primeng/primeng";
import {
  Observable,
} from "rxjs/Observable";

import {
  environment,
} from "../../environments/environment";
import {
  FarcEntryTypes,
  FarcSelectType,
  FarcTreeNode,
} from "../../shared/ext";
import {
  ConfigService,
  StatusService,
  UserSession,
} from "../shared";

@Injectable()
export class FarcTreeService {

  /*
    TODO x Link-Color f. selected
    TODO x Summen-Anzeige
    TODO x Vormerkung-Column
    TODO x btn actions
    TODO   x vormerk änd. + speichern (error handling?) -> srv
    TODO   x update list (evtl. list = list.slice()) + clear selected
    TODO - select-column als Link || dropdown-button -> sofort, del ??
    TODO x Darstellung unterhalb selected dir
    TODO x Sort -> ohne virt. scroll. i.O.
    TODO x Filter -> nur text filter moeglich! => f. date/size warten auf primeng
    TODO x Tree-Sort
    TODO   x button design
    TODO   x 1. drives sort
    TODO   x 2. dir sort
    TODO   - user profile
    TODO - oelist in eigenen listService

   */
  public tree: TreeNode[];
  // public sortalpha = true;  // TODO Aenderungsmoeglichkeit fehlt noch
  public selectedNode: FarcTreeNode;  // mit p-tree.selection verknuepft
  public breadcrumbs: MenuItem[] = [];
  public files: FarcTreeNode[] = [];
  public selectedFiles: FarcTreeNode[] = [];
  public filteredFiles: FarcTreeNode[] = null;
  private sortField = "";
  private sortOrder = 0;
  // lazy load/ virtual scrolling !!! VirtualScrolling fkt. z.Zt. nur im ProdMode !!!
  public lazyRows = 120;  // f. IE11 max. 100
  public totalRows = 0;
  public loading = false;
  // private lazyFiles: FarcTreeNode[] = [];

  private restServer: string;
  private waitNode: FarcTreeNode = {label: "wird geladen...", type: FarcEntryTypes[FarcEntryTypes.wait]};

  private userSession: UserSession;

  private mySortalpha = true;
  public get sortalpha() {
    return this.mySortalpha;
  }
  public set sortalpha(s) {
    this.mySortalpha = s;
    this.tree.forEach( (t) => this.sortTree(t.children));
  }

  public oelist: FarcTreeNode[];

  constructor(private httphandler: Http, private configService: ConfigService, private status: StatusService) {
    console.debug("c'tor FarcService");
    this.restServer = environment.webserviceServer + environment.webservicePath;

    this.getTree().subscribe(
        (res) => {
          console.info("load tree");
          // this.sortTree(res);
          res.forEach( (t) => this.sortTree(t.children));
          this.tree = res;
          this.userSession = this.configService.getUserConfig();
          if (this.userSession && this.userSession.treepath && this.userSession.treepath.length > 0) {
            this.expandTo(this.userSession.treepath);
          }
        },
        (err) => { console.error("error reading Tree-Data " + err); },
        () => { console.info("done reading tree"); console.dir(this.tree); },
    );
    this.getOElist().subscribe(
      (res) => {
        console.info("load OE-List");
        this.oelist = res;
        // sort?
      },
      (err) => { console.error("error reading OE-List-Data " + err); },
      () => { console.info("done reading OE-List"); console.dir(this.oelist); }
    )
  }

  /**
   * Eindeutiger key fuer item
   *
   * Soll ngFor-Schleife in dataTable beschleunigen (?).
   */
  public rowTrackBy(index: number, item: FarcTreeNode) {
    return item.entryid;
  }

  /**
   * Klick auf Node-Label
   *
   * Beim Klick auf das Label muss die Datei-Liste aktualisiert werden.
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
  public nodeClick(event: any) {
    console.info("onNodeSelect");
    this.loading = true;
    if (event.node.type === FarcEntryTypes.wait) {
      // der "Warten"-Icon hat keine Funktion
      return false;
    }

    if (!event.node.leaf) {
      // Auf-/Zuklappen bei Klick auf Label
      event.node.expanded = !!event.node.expanded;
      event.node.expanded = !event.node.expanded;
    }
    // children/files holen und anzeigen
    this.fetchNode(event.node).then( (n) => {
      this.nodeSelect(n);
    });
    this.loading = false;
  }

  /**
   * Baum bis zu einem Verzeichnis oeffnen
   *
   * @param path
   * @returns {Promise<void>}
   */
  public async expandTo(path: string[]) {
    this.loading = true;
    this.selectedNode = null;
    let nodes: TreeNode[] = this.tree;
    let pathnode: TreeNode;
    for (const p of path) {  // in .forEach() macht await Probleme
      pathnode = nodes.find( (n) => n.label === p );
      if (pathnode) {
        pathnode = await this.fetchNode(pathnode);
        if (!pathnode.leaf) {
          pathnode.expanded = true;
          nodes = pathnode.children;
        }
      } else {
        console.error("FarcTreeService.expandTo: path not found in tree - should not happen!");
      }
    }
    if (pathnode) {
      this.selectedNode = pathnode;
      this.nodeSelect(pathnode);
    }
    this.loading = false;
  }

  /** Lazy loading der Treeknoten (primeNG braucht sehr lange fuer die Darstellung umfangreicher Trees)
   *  -> onNodeExpand
   *
   * Dieser event wird nur fuer Knoten aufgerufen, bei denen leaf == false.
   * (leaf wird serverseitig eingetragen)
   *
   * @param event
   */

  public fetchNode(node: FarcTreeNode): Promise<FarcTreeNode> {
    // this.loading = true;
    return this.fetchChildren(node).then( (n) => {
      return this.fetchFiles(node).then( (nd) => {
        // this.loading = false;
        return nd;
      });
    }).catch( (err) => {
      console.error("fetch error " + err);
      // this.loading = false;
    });
  }

  private fetchChildren(node: FarcTreeNode): Promise<FarcTreeNode> {
    if (!node.leaf && node.children === null) {
      this.waitNode.arc = node.arc;
      node.children = [this.waitNode];  // "Warten"-Icon anzeigen
      return this.childrenFor(node.entryid).then((ch) => {
        node.children = this.sortNodes(ch, this.sortalpha);
        return node;
      });
    }
    return new Promise<FarcTreeNode>( (resolve) => {
      resolve(node);
    } );
  }
  private fetchFiles(node: FarcTreeNode): Promise<FarcTreeNode> {
    if (node.files === null) {
      if (node.entrytype !== FarcEntryTypes.strukt) {
        return this.filesFor(node.entryid).then((f) => {
          // neue Dateiliste immer alpha-Sortieren
          this.sortNodes(f, true);
          if (node.children) {
            node.files = [...node.children];
            node.files = [...this.sortNodes(node.files, true), ...f];
          } else {
            node.files = f;
          }
          // node.files = node.children ? node.children.concat(f) : f;
          // node.files = f;
          this.totalRows = node.files.length;
          if (node.selected !== FarcSelectType.none) {
            this.inheritVormerk(node);
          }
          return node;
        });
      } else {
        node.files = node.children;
        this.totalRows = node.files.length;
      }
    }
    return new Promise<FarcTreeNode>( (resolve) => {
      resolve(node);
    } );
  }

  private childrenFor(id): Promise<FarcTreeNode[]> {
    return this.httphandler.post(this.restServer + "/children", {entryid: id})
      .map((response: Response) => response.json() ).toPromise();
  }
  private filesFor(id): Promise<FarcTreeNode[]> {
    return this.httphandler.post(this.restServer + "/files", {entryid: id})
      .map((response: Response) => response.json() ).toPromise();
  }
  private getTree() {
    return this.httphandler.get(this.restServer + "/tree")
      .map((response: Response) => response.json() );
  }
  private getOElist() {
    return this.httphandler.get(this.restServer + "/oelist")
      .map((response: Response) => response.json() );
  }

  /**
   * Prepare new Filelist + save selected path
   *
   * @param node
   */
  private nodeSelect(node: FarcTreeNode) {
    this.mkBreadcrumbs();
    this.userSession.treepath = node.path;
    this.selectedFiles = [];
    this.filteredFiles = null;
    this.sortField = "";
    this.sortOrder = 0;
    if (node && node.files) {
      this.files = node.files;
    } else {
      this.files = [];
    }
    console.debug("nodeSelect - selectedNode");
    console.dir(this.selectedNode);
    // this.tableReady = true;
  }

  /*
   breadcrumb handling
   */
  private mkBreadcrumbs() {
    const node = this.selectedNode;
    this.breadcrumbs = [];
    if (node && node.path) {
      node.path.forEach( (p, idx) => {
        this.breadcrumbs.push({ label: p,
                                command: (event) => { this.expandTo(node.path.slice(0, idx + 1)); } });
      });
    }
  }
  /**
   * solange der Trenner bei primeng-breadcrumbs nicht per Programm
   * anpassbar ist.
   */
  // private updateBreadcrumbs() {
  //   setTimeout( () => {
  //     const bcs = document.getElementsByClassName("ui-breadcrumb-chevron");
  //     for (let i = 0; i < bcs.length; i++) {
  //       bcs.item(i).classList.remove("fa-chevron-right");
  //       bcs.item(i).classList.add("fa-caret-right");
  //       bcs.item(i).innerHTML = " ";
  //     }
  //   }, 0);
  // }

  // --- Vormerkung ---

  public moveSelected() {
    if (this.selectedFiles.length === 0) {
      return;
    }
    this.setVormerk(this.selectedFiles,
                    this.selectedNode.arc ? FarcSelectType.fromArchive : FarcSelectType.toArchive);
    this.saveVormerk();
  }

  public delSelected() {
    if (this.selectedFiles.length === 0) {
      return;
    }
    this.setVormerk(this.selectedFiles, FarcSelectType.del);
    this.saveVormerk();
  }

  public undoSelection() {
    if (this.selectedFiles.length === 0) {
      return;
    }
    this.setVormerk(this.selectedFiles, FarcSelectType.none);
    this.saveVormerk();
  }

  public undoSelectionFor(node: FarcTreeNode) {
    this.setVormerk([node], FarcSelectType.none);
    this.saveVormerk(node);
  }

  private setVormerk(files: FarcTreeNode[], vorm: FarcSelectType) {
    let uid;
    let now;
    if (vorm === FarcSelectType.none) {
      uid = "";
      now = 0;
    } else {
      uid = this.userSession.UID;
      now = new Date().getTime();
    }
    files.forEach( (f) => {
      f.selected = vorm;
      f.selectUid = uid;
      f.selectDate = now;
      if (f.entrytype === FarcEntryTypes.dir) {
        this.inheritVormerk(f);
      }
    });
  }

  private saveVormerk(file?: FarcTreeNode) {
    // nur die Zeile, ohne children, etc. zum Server schicken
    const files = file ? [file] : this.selectedFiles;
    const selectedfiles: FarcTreeNode[] = files.map( (f) => {
      return {
        entryid:    f.entryid,
        label:      f.label,
        timestamp:  f.timestamp,
        size:       f.size,
        children:   null,
        files:      null,
        entrytype:  f.entrytype,
        arc:        f.arc,
        path:       f.path,
        leaf:       f.leaf,
        selected:   f.selected,
        selectUid:  f.selectUid,
        selectDate: f.selectDate,
        type:       f.type,
      } as FarcTreeNode;
    });
    this.httphandler.post(this.restServer + "/vormerkung", selectedfiles)
        .map((response: Response) => response.json() ).toPromise().then( (rc) => {
          if (rc === "OK") {
            this.status.info("Vormerkungen gespeichert.");
          } else {
            this.status.error(rc);
            this.setVormerk(files, FarcSelectType.none);
          }
          if (!file) {
            this.selectedFiles = [];
          }
    });
  }

  public isVormerk() {
    return this.files.find( (f) => f.selected !== FarcSelectType.none );
  }

  public vormerkList(): FarcTreeNode[] {
    return this.files.filter( (f) => f.selected !== FarcSelectType.none );
  }

  private inheritVormerk(node: FarcTreeNode) {
    if (node.files) {
      if (node.selected === FarcSelectType.none) {
        node.files = null;  // reload erzwingen
      } else {
        node.files.forEach((f) => {
          f.selected = node.selected;
          f.selectUid = node.selectUid;
          f.selectDate = node.selectDate;
        });
      }
    }
    if (node.children) {
      if (node.selected === FarcSelectType.none) {
        node.children = null; // reload erzwingen
      } else {
        node.children.forEach((c) => {
          this.inheritVormerk(c);
        });
      }
    }
  }

  public vormerkInSelected(): boolean {
    return this.selectedFiles.reduce( (prev: boolean, curr: FarcTreeNode) => prev ? prev : curr.selected !== FarcSelectType.none, false);
  }

// --- sort ---

  /*
  FIXME custom sort funktioniert zur Zeit nicht mit virt. scroll.
  FIXME -> https://github.com/primefaces/primeng/issues/2687
  FIXME Fallback: p-datatable std sort verwenden (sortiert dirs nicht extra!)
  TODO wird bei Scroll x-fach aufgerufen -> debounce??
   */
  public sort(event) {
    // event.field = Field to sort -> label - timestamp - size
    // event.order = Sort order -> 1 asc, -1 desc
    // debounce
    if (this.sortOrder === event.order && this.sortField === event.field) {
      return;
    }
    console.debug("sortName field=" + event.field + " order=" + event.order);
    this.files = [...this.files.sort( (a: FarcTreeNode, b: FarcTreeNode) => {
      let result: number = null;
      if (a.entrytype !== b.entrytype) {
        return a.entrytype === FarcEntryTypes.dir ? -1 : 1;
      } else {
        switch (event.field) {
          case "label":
            result = a.label.localeCompare(b.label);
            break;
          case "timestamp":
            result = (a.timestamp < b.timestamp) ? -1 : (a.timestamp > b.timestamp) ? 1 : 0;
            break;
          case "size":
            result = (a.size < b.size) ? -1 : (a.size > b.size) ? 1 : 0;
            break;
          default:
            break;
        }
      }
      return event.order * result;
    }) ];
    this.sortField = event.field;
    this.sortOrder = event.order;
  }

  private sortNodes(nodes: FarcTreeNode[], sortalpha: boolean): FarcTreeNode[] {
    if (sortalpha) {
      return nodes.sort( (nodeA, nodeB) => nodeA.label.localeCompare(nodeB.label) );
    } else {
      return nodes.sort( (nodeA, nodeB) => nodeB.size - nodeA.size );
    }
  }

  private sortTree(nodes: FarcTreeNode[]) {
    this.sortNodes(nodes, this.sortalpha)
      .forEach( (n) => {
        if (n.children) {
          this.sortTree(n.children);
        }
      });
  }

  public onFilter(event) {
    console.debug("onFilter");
    console.dir(event);
    this.filteredFiles = event.filteredValue;
  }

}
