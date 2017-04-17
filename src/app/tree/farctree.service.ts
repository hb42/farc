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
} from "rxjs";

import {
  environment,
} from "../../environments/environment";
import {
    FarcEntryTypes,
    FarcTreeNode,
} from "../../shared/ext";
import {
  ConfigService,
  UserSession,
} from "../shared";

@Injectable()
export class FarcTreeService {

  public tree: TreeNode[];
  public sortalpha: boolean = true;  // TODO Aenderungsmoeglichkeit fehlt noch
  public selectedNode: FarcTreeNode;  // mit p-tree.selection verknuepft
  public breadcrumbs: MenuItem[] = [];
  public selectedFiles: FarcTreeNode[];

  // public detailEvent: EventEmitter<FarcTreeNode> = new EventEmitter();

  private restServer: string;
  private waitNode: FarcTreeNode = {label: "wird geladen...", type: FarcEntryTypes[FarcEntryTypes.wait]};

  private userSession: UserSession;

  public get files(): FarcTreeNode[] {
    const node = this.selectedNode;
    const wait: boolean = node && node.children && node.children[0] &&
      node.children[0].type === FarcEntryTypes[FarcEntryTypes.wait];
    if (node && !wait) {
      return [...(node.children ? node.children : []),
        ...(node.files ? node.files : []) ];
    } else {
      return [];
    }
  }

  constructor(private httphandler: Http, private configService: ConfigService) {
    console.info("c'tor FarcService");
    this.restServer = environment.webserviceServer + environment.webservicePath;

    this.getTree().subscribe(
        (res) => {
          console.info("load tree");
          this.sortTree(res);
          this.tree = res;
          this.configService.getUserConfig().then( (us) => {
            this.userSession = us;
            this.gotoSelected();
          });
        },
        (err) => { console.error("error reading Tree-Data " + err); },
        () => { console.info("done reading tree"); console.dir(this.tree); },
    );

  }

  public childrenFor(id): Promise<FarcTreeNode[]> {
    return this.httphandler.post(this.restServer + "/children", {entryid: id})
        .map((response: Response) => response.json() ).toPromise();
  }
  public filesFor(id): Promise<FarcTreeNode[]> {
    return this.httphandler.post(this.restServer + "/files", {entryid: id})
        .map((response: Response) => response.json() ).toPromise();
  }
  public getTree() {
    return this.httphandler.get(this.restServer + "/tree")
        .map((response: Response) => response.json() );

  }

  public treeFor(pth: string[]) {
    const p: any = pth ? { path: pth } : { path: [] };
    return this.loadTree(p);
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
  public nodeClick(event: any) {
    console.info("onNodeSelect");
    if (event.node.type === FarcEntryTypes.wait) {
      // der "Warten"-Icon hat keine Funktion
      return false;
    }

    if (!event.node.leaf) {
      // Auf-/Zuklappen bei Klick auf Label
      event.node.expanded = !!event.node.expanded;
      event.node.expanded = !event.node.expanded;
    } else {
      // notwendig, damit .expandTo() funktioniert
      this.selectedNode = event.node;
    }
    // children/files holen und anzeigen
    this.fetchNode(event.node).then( (n) => {
      this.nodeSelect(n);
    });
  }

  /** Lazy loading der Treeknoten (primeNG braucht sehr lange fuer die Darstellung umfangreicher Trees)
   *  -> onNodeExpand
   *
   * Dieser event wird nur fuer Knoten aufgerufen, bei denen leaf == false.
   * Serverseitig wird das entsprechend eingetragen.
   *
   * @param event
   */
  public loadNode(event: any) {
    this.fetchNode(event.node);
  }

  /**
   * filesView updaten
   *
   * @param node
   */
  public nodeSelect(node: FarcTreeNode) {
    // this.detailEvent.emit(node);  // update table etc.
    this.mkBreadcrumbs();
    this.updateBreadcrumbs();
    this.userSession.treepath = node.path;
  }

  /**
   * Baum bis zu einem Verzeichnis oeffnen
   *
   * @param path
   * @returns {Promise<void>}
   */
  public async expandTo(path: string[]) {
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
        console.error("path not found in tree - should not happen!");
      }
    }
    if (pathnode) {
      this.selectedNode = pathnode;
      this.nodeSelect(pathnode);
    }
  }

  /**
   * Wenn die TreeView neu geladen wird, muss die FileView
   * erneut geholt werden -> expandTo(tree.selected.path)
   */
  public gotoSelected() {
    if (this.userSession && this.userSession.treepath && this.userSession.treepath.length > 0) {
      this.expandTo(this.userSession.treepath);
    }
  }

  protected sortNodes(nodes: FarcTreeNode[]) {
    if (this.sortalpha) {
      nodes.sort( (nodeA, nodeB) => nodeA.label.localeCompare(nodeB.label) );
    } else {
      nodes.sort( (nodeA, nodeB) => nodeA.size - nodeB.size );
    }
  }

  protected sortTree(nodes: FarcTreeNode[]) {
    this.sortNodes(nodes);
    nodes.forEach( (n) => {
      if (n.files) {
        this.sortNodes(n.files);
      }
      if (n.children) {
        this.sortTree(n.children);
      }
    });
  }

  /*
   children + files aus DB holen
   */
  private fetchNode(node: FarcTreeNode): Promise<FarcTreeNode> {
    return this.fetchChildren(node).then( (n) => {
      return this.fetchFiles(node).then( (nd) => {
        return nd;
      });
    }).catch( (err) => console.error("fetch error " + err));
  }

  private fetchChildren(node: FarcTreeNode): Promise<FarcTreeNode> {
    if (!node.leaf && node.children === null) {
      this.waitNode.arc = node.arc;
      node.children = [ this.waitNode ];  // "Warten"-Icon anzeigen
      return this.childrenFor(node.entryid).then((ch) => {
        node.children = ch;
        this.sortNodes(node.children);
        return node;
      });
    } else {
      return new Promise<FarcTreeNode>( (resolve) => {
        resolve(node);
      } );
    }
  }
  private fetchFiles(node: FarcTreeNode): Promise<FarcTreeNode> {
    if (node.files === null && node.entrytype !== FarcEntryTypes.strukt) {
      return this.filesFor(node.entryid).then((f) => {
        node.files = f;
        this.sortNodes(node.files);
        return node;
      });
    } else {
      return new Promise<FarcTreeNode>( (resolve) => {
        resolve(node);
      } );
    }
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
  private updateBreadcrumbs() {
    setTimeout( () => {
      const bcs = document.getElementsByClassName("ui-breadcrumb-chevron");
      for (let i = 0; i < bcs.length; i++) {
        bcs.item(i).classList.remove("fa-chevron-right");
        bcs.item(i).classList.add("fa-caret-right");
        bcs.item(i).innerHTML = " ";
      }
    }, 0);
  }

  private loadTree(path: any) {
    return this.httphandler.post(this.restServer + "/subdir", path)
        .map((response: Response) => response.json() );
  }

}
