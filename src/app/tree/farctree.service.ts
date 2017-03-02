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
    // Tree,
    TreeNode,
} from "primeng/primeng";
import {
  Observable,
} from "rxjs";

import {
    FarcEntryTypes,
    FarcSession,
    FarcTreeNode,
} from "@hb42/lib-farc";

import {
    saveSessionURL,
} from "@hb42/lib-common";

@Injectable()
export class FarcTreeService {

  public tree: TreeNode[];
  public selectedNode: TreeNode;
  public sortalpha: boolean = true;  // TODO Aenderungsmoeglichkeit fehlt noch

  public detailEvent: EventEmitter<FarcTreeNode> = new EventEmitter();

  private restServer: string;
  private waitNode: FarcTreeNode = {label: "wird geladen...", type: FarcEntryTypes[FarcEntryTypes.wait]};

  constructor(private httphandler: Http, @Inject("CONFIG") private conf: any) {
    console.info("c'tor FarcService");
    this.restServer = conf.webserviceServer + conf.webservicePath;

    this.getTree().subscribe(
        (res) => {
          console.info("load tree");
          this.sortTree(res);
          this.tree = res;
          // if (path) {
          // TODO letzten Pfad aufklappen -> fkt. noch nicht
          // this.expandTo(path);
          // }
        },
        (err) => { console.error("error reading Tree-Data " + err); },
        () => { console.info("done reading tree"); console.dir(this.tree); }
    );

  }

  /* TODO session handling als service
     1. Interface FarcSession um fn fuers Speichern erweitern:
      class sessionhandler implements FarcSession {
        public save() { ...post(url, this) s.u.
    2. Mit @Injectable als Service markieren
    3. Wie und Wo initialisieren? -> muesste bei bootstrap passieren (session kommt von login())
       wie in bootstrap integrierern?
   */
  public saveSession(session: FarcSession): Observable<string> {
    return this.httphandler.post(this.conf.webserviceServer + saveSessionURL, session)
        .map( (response: Response) => response.text());
  }

  public childrenFor(id) {
    return this.httphandler.post(this.restServer + "/children", {entryid: id})
        .map((response: Response) => response.json() );
  }
  public filesFor(id) {
    return this.httphandler.post(this.restServer + "/files", {entryid: id})
        .map((response: Response) => response.json() );
  }
  public getTree() {
    return this.httphandler.get(this.restServer + "/tree")
        .map((response: Response) => response.json() );

  }

  public treeFor(pth: string[]) {
    let p: Object = pth ? { path: pth } : { path: [] };
    return this.loadTree(p);
  }

  /**
   * children fuer Baumknoten vom Server holen (lazy loading)
   *
   * @param node
   */
  public loadNode(node: FarcTreeNode) {
    if (node.children === null) {  // children nur einmal holen
      this.waitNode.arc = node.arc;
      node.children = [ this.waitNode ];  // "Warten"-Icon anzeigen
      console.info("fetch subtree");
      this.childrenFor(node.entryid)
          .subscribe( (c) => {
            node.children = c;
            this.sortNodes(node.children);
          });
    }
  }

  /**
   * files fuer Baumknoten vom Server holen
   *
   * @param node
   */
  public nodeSelect(node: FarcTreeNode) {
    if (node.files === null && node.entrytype !== FarcEntryTypes.strukt) {
      this.filesFor(node.entryid)
          .subscribe( (rc) => {
            node.files = rc;
            this.sortNodes(node.files);
          });
    }
    this.detailEvent.emit(node);  // update table etc.
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

  private loadTree(path: Object) {
    console.info("session treeFor");
    console.dir(path);

    return this.httphandler.post(this.restServer + "/subdir", path)
        .map((response: Response) => response.json() );

    // return this.http.post(REST_SERVER + "/farc/subdir", node ? { path: node.path } : { path: [] })
    //     .map((response: Response) => response.json() )
    //     .catch((response: Response) => this.httperror(response));
  }

}
