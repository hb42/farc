/**
 * Created by hb on 17.07.16.
 */

import {HttpClient, } from "@angular/common/http";
import {Injectable, } from "@angular/core";

import {AppConfig} from "@hb42/lib-client";
import {dateString} from "@hb42/lib-common";
import {
  apiCHILDREN, apiEXECVORM,
  apiFILES, apiROOT,
  apiTREE, apiVORMERKUNG,
  confTREEDATE,
  FarcEntryTypes,
  FarcSelectType,
  FarcTreeNode,
} from "@hb42/lib-farc";
import { MenuItem, SelectItem, TreeNode, } from "primeng/primeng";
import {Table, TableHeaderCheckbox} from "primeng/table";
import {Observable, } from "rxjs";

import {ConfigService, StatusService, UserSession, } from "../shared";

@Injectable()
export class FarcTreeService {

  public readonly INHERIT = "inherit";

  public tree: TreeNode[];
  public selectedNode: FarcTreeNode;  // mit p-tree.selection verknuepft
  public breadcrumbs: MenuItem[] = [];

  // filelist
  //
  // Dateiliste wird nicht vollstaendig angezeigt, sondern bei Bedarf
  // nachgeladen. Die Liste wird vollstaendig vom Server geholt, das
  // ist relativ schnell. Das Problem entsteht bei der Darstellung,
  // hier sind grosse Listen (> ~2000) sehr traege. Daher wird der
  // event onLazyLoad verwendet um jeweils nur einen Ausschnitt der
  // Liste darzustellen.
  // (alpha-Sort mit String.localeCompare() ist eine zusaetzliche Bremse,
  //  da hilft Intl.compare)
  //
  // komplette Dateiliste
  public files_: FarcTreeNode[] = [];
  public get files(): FarcTreeNode[] {
    return this.files_;
  }
  public fileTable: Table;

  public selectedFiles: FarcTreeNode[] = [];
  // context menu select
  public ctxSelect: FarcTreeNode;
  // dargestellter Teil der Dateiliste
  public virtualfiles: FarcTreeNode[] = [];
  // nachzuladende Datensaetze
  public lazyRows = 400;
  public virtualScrollDelay = 200; // default 500
  // Start des angezeigten Ausschnitts
  private virtualbegin = 0;
  // Angezeigte Anzahl
  private virtualcount = this.lazyRows * 2; // immer der doppelte Wert von lazyRows
  // public filteredFiles: FarcTreeNode[] = [];
  public totalRows = 0;
  public loading = false;
  public lastReadDate = "";

  private srcTree: TreeNode[];
  private srcSelectedNode: FarcTreeNode;
  private arcTree: TreeNode[];
  private arcSelectedNode: FarcTreeNode;

  private readonly restServer: string;
  private waitNode: FarcTreeNode = {label: "wird geladen...", type: FarcEntryTypes[FarcEntryTypes.wait]};

  private userSession: UserSession;

  public treeselect = [ {label: "Original", value: false},
                        {label: "Archiv",   value: true},
                      ];

  public sortButtons: SelectItem[];

  public fileContextMenu: MenuItem[];

  // @ts-ignore
  public get isArcTree(): boolean {
    return this.userSession.isArcTree;
  }
  // @ts-ignore
  private set isArcTree(a: boolean) {
    this.userSession.isArcTree = a;
  }

  public get sortalpha(): boolean {
    return this.userSession.treealphasort;
  }

  public set sortalpha(s: boolean) {
    this.userSession.treealphasort = s;
    // this.srcTree.forEach((t) => this.sortTree(t.children));
    // this.arcTree.forEach((t) => this.sortTree(t.children));
    this.sortTree();
  }

  public get sortField(): string {
    return this.userSession.treelistsortField;
  }

  public get sortOrder(): number {
    return this.userSession.treelistsortOrder;
  }

  constructor(private httphandler: HttpClient, private configService: ConfigService, private status: StatusService) {
    console.debug("c'tor FarcService");
    // FIXME primeNG table bekommt select all nicht sauber hin, wenn lazy loading verwendet wird.
    //       Die checkbox wird nur eingeschaltet, wenn die Auswahl, den geladenen Zeilen entspricht.
    //       Hier hilft nur noch die Holzhammer-Methode (fn ueberschreiben), das ist allerdings bei
    //       primeNG-Updates zu beobachten - primeNG v7.0.3
    TableHeaderCheckbox.prototype.updateCheckedState = () => {
      return (this.files_ && this.files_.length > 0 &&
              this.selectedFiles && this.selectedFiles.length > 0 &&
              this.selectedFiles.length === this.files_.length);
    }

    this.sortButtons = [];
    this.sortButtons.push({label: "Name", value: true, icon: "fa fa-fw fa-sort-alpha-asc"});
    this.sortButtons.push({label: "Größe", value: false, icon: "fa fa-fw fa-sort-numeric-desc"});

    this.restServer = AppConfig.settings.webserviceServer + apiROOT;
    this.userSession = this.configService.getUserConfig();
    if (!this.sortField) {
      this.userSession.setFilesort("label", 1);
    }

    this.getTree().subscribe(
      (res) => {
        this.configService.getConfig(confTREEDATE).then((millis: number) => {
          this.lastReadDate = dateString(millis);
          this.status.success("Stand der Daten: " + this.lastReadDate);
        });
        this.srcTree = res.filter((node) => node.arc === false);
        this.arcTree = res.filter((node) => node.arc === true);
        this.switchTree(this.isArcTree);
      },
      (err) => {
        console.error("error reading Tree-Data " + err);
      },
      () => {
        console.debug("done reading tree");
      },
    );

    this.fileContextMenu = [
      { label: "test1", command: (event) => {
                              console.debug("context-menu event:");
                              console.dir(event);
                            }, },
      { label: "test2", },
    ];
  }

  /**
   * Eindeutiger key fuer item
   */
  public rowTrackBy(index: number, item: FarcTreeNode) {
    return item.entryid;
  }

  /**
   * Auswahlbuttons
   *
   * Nur Umschalten, wenn nicht bereits ausgewaehlt
   *
   * @param arc
   */
  public onSwitchTree(arc: boolean) {
    if (this.isArcTree !== arc) {
      this.switchTree(arc);
    }
  }

  /**
   * Zwischen source-tree (arc==false) und archive-tree (arc==true) umschalten.
   *
   * @param arc
   * @param path - fuer Aufruf aus ListService: zu selektierender Pfad
   */
  public switchTree(arc: boolean, path?: string[]) {
    this.isArcTree = arc;
    let userpath: string[];
    if (this.isArcTree) {
      this.tree = this.arcTree;
      this.selectedNode = this.arcSelectedNode;
      userpath = this.userSession.arcTreepath;
    } else {
      this.tree = this.srcTree;
      this.selectedNode = this.srcSelectedNode;
      userpath = this.userSession.srcTreepath;
    }
    this.sortTree();
    if (path) {
      this.expandTo(path);
    } else if (this.selectedNode) {
      this.expandTo(this.selectedNode.path);
    } else if (userpath && userpath.length > 0) {
      this.expandTo(userpath);
    } else {
      this.files_ = [];
      this.virtualfiles = [];
      this.selectedFiles = [];
    }
  }

  /**
   * Vollstaenndiger Pfad fuer einen Eintrag
   * (incl. 'Archiv fuer')
   *
   * @param node
   */
  public fullPath(node: FarcTreeNode): string {
    return node.entrytype === FarcEntryTypes.file
      ? [...node.path, node.label].join("/")
      : node.path.join("/");
  }

  /**
   * Klick auf Node-Label/ Node-Expand
   *
   * Beim Klick auf das Label/Expand muss die Datei-Liste aktualisiert werden.
   * Ausserdem soll der Knoten auch bei Klick auf den Text auf- bzw. zugeklappt werden.
   *
   * Damit loading sauber gesetzt wird, den Rest mit setTimeout() einen Tick verzoegern.
   *
   * TODO: beobachten wg. moeglicher Seiteneffekte. Aenderungen in primeng koennten sich hier auswirken.
   *       (Dass das Aendern von node.expanded nicht den entsprechenden event triggert (-> UITreeNode.toggle())
   *        duerfte bei der tree-fn expandToPath noch Aerger machen. D.h. da wird es irgendwann einen Bugfix
   *        geben, der auch hier Auswirkungen hat)
   *
   * @param event
   * @param expand
   * @returns {boolean}
   */
  public nodeClick(event: any, expand?: boolean) {
    this.loading = true;
    setTimeout(() => {
      if (expand) {
        if (event.node.type === FarcEntryTypes.wait) {
          // der "Warten"-Icon hat keine Funktion
          this.loading = false;
          return false;
        }

        if (!event.node.leaf) {
          // Auf-/Zuklappen bei Klick auf Label
          event.node.expanded = !!event.node.expanded;
          event.node.expanded = !event.node.expanded;
        }
      }
      // children/files holen und anzeigen
      this.fetchNode(event.node).then((n) => {
        if (expand) {
          this.nodeSelect(n, false);
        } else {
          this.loading = false;
        }
      });
    }, 0);
  }

  /**
   * Baum bis zu einem Verzeichnis oeffnen
   *
   * @param path
   * @returns {Promise<void>}
   */
  public expandTo(path: string[]) {
    this.loading = true;
    setTimeout(() => {
      this.expand([...path], this.tree);
    }, 0);
  }

  // Rekursion ueber den Pfad
  private expand (path: string[], nodes: TreeNode[]) {
    const p: string = path.shift();
    const pn: TreeNode = nodes.find((n) => n.label === p);
    if (pn) {
      this.fetchNode(pn).then( (node: FarcTreeNode) => {
        if (node) {
          if (!node.leaf) {
            (node as TreeNode).expanded = true;
          }
          if (path.length === 0 || node.leaf) {
            this.selectedNode = node;
            // expand aendert die Selektion per Programm, daher ist scrollIntoView noetig (scroll = true)
            this.nodeSelect(node, true);
          } else {
            this.expand(path, node.children);
          }
        }
      });
    } else {
      this.loading = false;
    }
  }

  /** Lazy loading der Treeknoten (primeNG braucht sehr lange fuer die Darstellung umfangreicher Trees)
   *  -> onNodeExpand
   *
   * Dieser event wird nur fuer Knoten aufgerufen, bei denen leaf == false.
   * (leaf wird serverseitig eingetragen)
   *
   * @param node
   */

  private fetchNode(node: FarcTreeNode): Promise<FarcTreeNode> {
    return this.fetchChildren(node).then((n) => {
      return this.fetchFiles(node).then((nd) => {
        return nd;
      });
    }).catch((err) => {
      console.error("fetch error " + err);
      this.loading = false;
      return null;
    });
  }

  private fetchChildren(node: FarcTreeNode): Promise<FarcTreeNode> {
    if (!node.leaf && !node.children) {
      this.waitNode.arc = node.arc;
      node.children = [this.waitNode];  // "Warten"-Icon anzeigen
      return this.childrenFor(node.entryid).then((ch) => {
        node.children = this.sortNodes(ch, this.sortalpha);
        return node;
      });
    }
    return new Promise<FarcTreeNode>((resolve) => {
      resolve(node);
    });
  }

  private fetchFiles(node: FarcTreeNode): Promise<FarcTreeNode> {
    console.debug("fetchFiles");
    if (!node.files) {
      if (node.entrytype !== FarcEntryTypes.strukt) {
        return this.filesFor(node.entryid).then((f) => {
          node.files = node.children ? node.children.concat(f) : f;
          if (node.selected !== FarcSelectType.none) {
            this.inheritVormerk(node);
          }
          return node;
        });
      } else {
        node.files = node.children;
      }
    }
  // DEBUG
    // const files: FarcTreeNode[] = [];
    // for (let i = 0; i < 2000; i++) {
    //   files.push({
    //     arc: false,
    //     entrytype: FarcEntryTypes.file,
    //     label: "" + i,
    //     size: 0,
    //     timestamp: 0,
    //     path: node.path,
    //     leaf: true,
    //     type: "file",
    //              });
    // }
    // node.files = files;
  // DEBUG
    return new Promise<FarcTreeNode>((resolve) => {
      resolve(node);
    });
  }

  private childrenFor(id): Promise<FarcTreeNode[]> {
    return this.httphandler.get<FarcTreeNode[]>(this.restServer + apiCHILDREN + "/" + id)
      .toPromise();
  }

  private filesFor(id): Promise<FarcTreeNode[]> {
    return this.httphandler.get<FarcTreeNode[]>(this.restServer + apiFILES + "/" + id)
      .toPromise();
  }

  private getTree(): Observable<FarcTreeNode[]> {
    return this.httphandler.get<FarcTreeNode[]>(this.restServer + apiTREE);
  }

  /**
   * Prepare new Filelist + save selected path
   *
   * @param node
   * @param scroll
   */
  private nodeSelect(node: FarcTreeNode, scroll: boolean) {
    this.mkBreadcrumbs();
    if (this.isArcTree) {
      this.userSession.arcTreepath = node.path;
    } else {
      this.userSession.srcTreepath = node.path;
    }
    this.selectedFiles = [];
    if (node && node.files) {
      this.totalRows = node.files.length;
      this.files_ = this.sortTable(node.files);
    } else {
      this.totalRows = 0;
      this.files_ = [];
    }
    console.debug("set file");
    // anzuzeigenden Ausschnitt setzen
    this.totalRows = this.files_.length;
    this.virtualbegin = 0;
    this.virtualcount = this.lazyRows;
    this.setVirtualFiles();
    // neue Datei-Liste => virt.scroll. auf Anfang
    this.resetVirtualScroll(50);

    // wenn der Baum per Programm geandert wird (-> expandTo() -> scroll==true) kann es noetig werden,
    // zum ausgewaehlte Knoten zu scrollen. Das wird hier erledigt, die Verzoegerunng ist erforderlich,
    // weil sonst .ui-state-hightlight noch nicht gesetzt ist.
    if (scroll) {
      setTimeout(() => {
        try {
          document.querySelector("farc-tree .ui-state-highlight").scrollIntoView(false);
        } catch (e) {
          console.debug("FarTreeService#nodeSelect: Problem with scrollintoview: " + e.message);
        }
      }, 0)
    }
  }

  /**
   * VirtualScrolling
   *
   * onLazyLoad:
   *   event.first = First row offset
   *   event.rows = Number of rows per page
   *   event.sortField = Field name to sort with
   *   event.sortOrder = Sort order as number, 1 for asc and -1 for dec
   *   event.multiSortMeta: An array of SortMeta objects used in multiple columns sorting. Each SortMeta has field and
   *   order properties. event.filters: FilterMetadata object having field as key and filter value, filter matchMode as
   *   value event.globalFilter: Value of the global filter if available
   *
   * onSort wird mit "lazy" nicht mehr aufgerufen => sort + ggf. filter muss hier erledigt werden
   *
   * @param event
   */
  public loadFilesOnScroll(event: any) {
    let refresh = false;
    const count = event.rows || this.files_.length;
    let first = event.first || 0;
    if (first > this.files_.length) {
      first = 0;
    }
    if (this.sortOrder !== event.sortOrder || this.sortField !== event.sortField) {
      this.userSession.setFilesort(event.sortField, event.sortOrder);
      console.debug("sort start");
      this.files_ = this.sortTable();
      console.debug("sort end");
      refresh = true;
    }
    if (this.virtualbegin !== first || this.virtualcount !== count) {
      this.virtualcount = count;
      this.virtualbegin = first;
      refresh = true;
    }
    if (refresh) {
      this.setVirtualFiles();
    }
  }

  private setVirtualFiles() {
    console.debug("setVirtualFiles first=" + this.virtualbegin + " / count=" + this.virtualcount);
    this.virtualfiles = this.files.slice(this.virtualbegin, this.virtualbegin + this.virtualcount);
    // if (this.virtualbegin === 0 && this.virtualcount >= this.files_.length) {
    //   this.resetVirtualScroll(0);
    // }
  }

  private resetVirtualScroll(delay: number) {
    // FIXME das Folgende ist von den PrimeNG-Interna abhaengig, wird also irgendwann mal Aerger machen.
    //       Bei Updates beobachten - primeNG v7.0.3
    //       Das Problem ist, dass beim Aendern des Tabellen-Inhalts die Einstellungen fuer das
    //       virtual/lazy scrolling nicht zurueckgesetzt werden. Die fn reset() setzt zwar sort/filter
    //       zurueck, was hier nicht gebraucht wird und abgefangen werden muesste. Die beiden relevanten
    //       Werte fuer virt.scroll. hingegen bleiben und fuehren zu Problemen.
    setTimeout(() => {
      console.debug("RESET virt scroll");
      if (this.fileTable) {
        // FIXME zwei interne Werte der PrimeNG-Table!!
        this.fileTable.first = 0;
        this.fileTable.virtualScrollCallback = null;
      }
      try {
        // damit die Darstellung passt
        const table: HTMLElement = document.querySelector(".ui-table-scrollable-body-table.ui-table-virtual-table");
        // Fenster-Inhalt nach oben ruecken
        table.style.top = "0px";
        // zum Anfang scrollen
        table.scrollIntoView();
      } catch (err) {
        console.debug("FarTreeService#setVirtualFiles: cannot scroll to top - " + err.message);
      }
      // hier sollten alle Daten geladen und alle Hintergrundprozesse erledigt sein
      // !! das ist unabhaengig von den PrimeNG-Problemen
      this.loading = false;
    }, delay);
  }

  /*
   breadcrumb handling
   */
  private mkBreadcrumbs() {
    const node = this.selectedNode;
    this.breadcrumbs = [];
    if (node && node.path) {
      this.breadcrumbs = node.path.map((p, idx) => {
        if (idx === node.path.length - 1) {
          return { label: p, disabled: true }
        } else {
          return { label: p,
                   command: (event) => {
                     this.expandTo(node.path.slice(0, idx + 1));
                   }
          }
        }
      });
      // node.path.forEach((p, idx) => {
      //   this.breadcrumbs.push({
      //                           label  : p,
      //                           command: (event) => {
      //                             this.expandTo(node.path.slice(0, idx + 1));
      //                           }
      //                         });
      // });
    }
  }

  /**
   * HeaderCheckboxToggle
   *
   * FIXME Im Zusammenspiel mit lazy loading wird in der primeNG-table immer nur der geladene
   *       Teil ausgewaehlt. Hier wird die komplette Auswahl der table untergeschoben.
   *       Bei primeNG-Updates beobachten - primeNG v7.0.3
   *
   * @param event - event.checked: State of the header checkbox
   */
  public selectAll(event: any) {
    console.debug("(1) _select = " + Object.keys(this.fileTable._selection).length + " selectionKeys = " +
      Object.keys(this.fileTable.selectionKeys).length);
    if (event.checked) {
      this.selectedFiles = [...this.files_];
      // FIXME direkter Zugriff auf primeNG table
      this.fileTable.selection = this.selectedFiles;
    } else {
      this.selectedFiles = [];
      // FIXME direkter Zugriff auf primeNG table
      this.fileTable.selection = [];

    }
    this.fileTable.updateSelectionKeys();
    console.debug("(2) _select = " + Object.keys(this.fileTable._selection).length + " selectionKeys = " +
      Object.keys(this.fileTable.selectionKeys).length);
  }

  // --- context menu ---

  // event.data -> FarcTreeNode
  public contextMenuSelect(event: any) {
    console.debug("on context menu");
    // console.dir(event.data);
    // console.dir(this.ctxSelect);

    // this.fileContextMenu.push({label: "dynamic"});
  }
  // public showCtx(cm, event) {
  //   console.debug("elipsis click");
  //   console.dir(cm);
  //   console.dir(event);
  //   cm.show(event);
  // }

  // --- Vormerkung ---

  /**
   * Auswahl fuer Vormerkung moeglich?
   */
  public isNodeSelectable(): boolean {
    return this.selectedNode && (this.selectedNode.entrytype === FarcEntryTypes.ep ||
                                 this.selectedNode.entrytype === FarcEntryTypes.dir)
      && !this.selectedNode.selected;  // selected -> Knoten ist vorgemerkt, dann ist die Vormerkung hier vererbt
  }

  public moveSelected() {
    if (this.selectedFiles.length === 0) {
      return;
    }
    this.setVormerk(this.selectedFiles,
                    this.selectedNode.arc ? FarcSelectType.fromArchive : FarcSelectType.toArchive);
    this.saveVormerkForSelected();
  }

  public delSelected() {
    if (this.selectedFiles.length === 0) {
      return;
    }
    this.setVormerk(this.selectedFiles, FarcSelectType.del);
    this.saveVormerkForSelected();
  }

  public undoSelection() {
    if (this.selectedFiles.length === 0) {
      return;
    }
    this.setVormerk(this.selectedFiles, FarcSelectType.none);
    this.saveVormerkForSelected();
  }

  /**
   * Vormerkung fuer einzelnen Eintrag loeschen
   *
   * @param node
   */
  public undoSelectionFor(node: FarcTreeNode) {
    this.setVormerk([node], FarcSelectType.none);
    this.saveVormerk([node]);
  }

  /**
   * Vormerkung aus der Vormerkliste heraus loeschen
   *
   * Zusaetzlich einen ggf. bereits in den Baum geladenen Knoten zuruecksetzen.
   *
   * @param node
   */
  public undoSelectionForId(node: FarcTreeNode) {
    const treenode: FarcTreeNode = this.findNodeById(node.arc ? this.arcTree : this.srcTree, node.entryid);
    if (treenode) {  // Knoten bereits geladen -> Vormerkung im Baum und in der DB loeschen
      this.undoSelectionFor(treenode);
    } else {  // noch nicht geladen, also nur in DB loeschen
      this.saveVormerk([node]);
    }
  }

  // Knoten anhand entryid rekursiv im Baum suchen
  private findNodeById(nodes: FarcTreeNode[], idx: string): FarcTreeNode {
    let search: FarcTreeNode = nodes.find((n) => n.entryid === idx);
    if (search) {
      return search;
    } else {
      nodes.find((nn) => { // Verzeichnisse dursuchen
        if (nn.files) {
          search = nn.files.find((f) => f.entryid === idx);  // Dateien
          if (search) {
            return true;
          }
        }
        if (nn.children) {
          search = this.findNodeById(nn.children, idx);  // Rekursion
          return !!search;
        } else {
          return false;
        }
      });
      return search;
    }

  }

  private setVormerk(files: FarcTreeNode[], vorm: FarcSelectType) {
    let uid;
    let now;
    if (vorm === FarcSelectType.none) {
      uid = "";
      now = 0;
    } else {
      uid = this.userSession.uid;
      now = new Date().getTime();
    }
    files.forEach((f) => {
      f.selected = vorm;
      f.selectUid = uid;
      f.selectDate = now;
      if (f.entrytype === FarcEntryTypes.dir) {
        this.inheritVormerk(f);
      }
    });
  }

  private saveVormerkForSelected() {
    this.saveVormerk(this.selectedFiles).then((rc) => {
      this.selectedFiles = [];
    })

  }

  private saveVormerk(files: FarcTreeNode[]) {
    // nur die Zeile, ohne children, etc. zum Server schicken
    // const files = file ? [file] : this.selectedFiles;
    const selectedfiles: FarcTreeNode[] = files.map((f) => {
      return {
        entryid   : f.entryid,
        label     : f.label,
        timestamp : f.timestamp,
        size      : f.size,
        children  : null,
        files     : null,
        entrytype : f.entrytype,
        arc       : f.arc,
        path      : f.path,
        leaf      : f.leaf,
        selected  : f.selected,
        selectUid : f.selectUid,
        selectDate: f.selectDate,
        type      : f.type,
      } as FarcTreeNode;
    });
    return this.httphandler.post(this.restServer + apiVORMERKUNG, selectedfiles)
      .toPromise().then((rc: string) => {
      if (rc === "OK") {
        if (selectedfiles.length > 0) {
          let msg = "" + selectedfiles.length;
          msg += " Vormerkung";
          msg += selectedfiles.length > 1 ? "en " : " ";
          msg += selectedfiles[0].selected === FarcSelectType.none ? "gelöscht." : "gespeichert.";
          this.status.info(msg);
        }
        return true;
      } else {
        this.status.error(rc);
        this.setVormerk(files, FarcSelectType.none);
        return false;
      }
    });
  }

  public isVormerk() {
    return this.files.find((f) => f.selected !== FarcSelectType.none);
  }

  public vormerkList(): FarcTreeNode[] {
    return this.files.filter((f) => f.selected !== FarcSelectType.none);
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
    return this.selectedFiles
      .reduce((prev: boolean, curr: FarcTreeNode) => prev ? prev : curr.selected !== FarcSelectType.none, false);
  }

  public execVormerk(node: FarcTreeNode): Promise<boolean> {
    return this.httphandler.get<string>(this.restServer + apiEXECVORM + "/" + node.entryid).toPromise()
      .then((res) => {
        if (res.startsWith("Fehler")) {
          this.status.error(res);
          return false;
        } else {
          // Erfolg -> Vormerkung entfernen
          this.undoSelectionForId(node);
          this.status.success(res);
          return true;
        }
      });
  }


// --- sort ---

  // event wird bei lazy loading der Dateiliste nicht ausgeloest
  public onSort(event) {
    // event.data = Data to sort
    // event.mode = 'single' or 'multiple' sort mode
    // event.multiSortMeta = SortMeta array in multiple sort
    // event.field = Field to sort -> label - timestamp - size
    // event.order = Sort order -> 1 asc, -1 desc
    console.debug("sort event");
    // debounce
    if (this.sortOrder === event.order && this.sortField === event.field) {
      return;
    }
    this.userSession.setFilesort(event.field, event.order);
    this.files_ = this.sortTable();
  }

  /* Dateiliste sortieren, liefert neues Array
   */
  private sortTable(f?: FarcTreeNode[]): FarcTreeNode[] {
    // case insensitive alpha sort
    // deutlich schneller als String.localeCompare()
    const collator = new Intl.Collator("de", {
      numeric: true,
      sensitivity: "base"
    });
    const tosort: FarcTreeNode[] = f ? [...f] : [...this.files];
    tosort.sort((a: FarcTreeNode, b: FarcTreeNode) => {
      let result: number = null;
      if (a.entrytype !== b.entrytype && (a.entrytype === FarcEntryTypes.file || b.entrytype === FarcEntryTypes.file)) {
        return a.entrytype === FarcEntryTypes.file ? 1 : -1;
      } else {
        switch (this.sortField) {
          case "label":
            result = collator.compare(a.label, b.label);
            // localCompare ist indiskutabel langsam
            // result = a.label.localeCompare(b.label, "de", {sensitivity: "base"});
            break;
          case "timestamp":
            result = a.timestamp - b.timestamp;
            break;
          case "size":
            result = a.size - b.size;
            break;
          default:
            // console.error("invalid sort field " + this.sortField + " at sorttable()");
            break;
        }
      }
      return this.sortOrder * result;
    });
    return tosort;
  }

  /* aktuellen Baum sortieren, oberste Ebene (Laufwerke) bleibt unveraendert
   */
  private sortTree() {
      this.tree.forEach((t) => this.sortSubTree(t.children));
  }

  /* sort tree node
   */
  private sortNodes(nodes: FarcTreeNode[], sortalpha: boolean): FarcTreeNode[] {
    if (sortalpha) {
      return nodes.sort((nodeA, nodeB) => nodeA.label.localeCompare(nodeB.label, "de", {sensitivity: "base"}));
    } else {
      return nodes.sort((nodeA, nodeB) => nodeB.size - nodeA.size);
    }
  }

  private sortSubTree(nodes: FarcTreeNode[]) {
    this.sortNodes(nodes, this.sortalpha)
      .forEach((n) => {
        if (n.children) {
          this.sortSubTree(n.children);
        }
      });
  }

}
