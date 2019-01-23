import { HttpClient } from "@angular/common/http";
import { Injectable, } from "@angular/core";

import { AppConfig, } from "@hb42/lib-client";
import {apiOELIST, apiROOT, confGBPRICE, confMWST, FarcTreeNode,} from "@hb42/lib-farc";

import { ConfigService, MainNavService, UserSession, } from "../shared";
import { FarcTreeService, } from "../tree";
import { Observable } from "rxjs";

@Injectable()
export class ListService {

  public navBarHeight = this.configService.navBarHeight;

  public oelist: FarcTreeNode[];
  public index: number;

  public fullsum = 0;
  public fullprice = 0.0;

  private readonly restServer: string;
  private userSession: UserSession;

  private gbprice: number;
  private mwst: number;

  public get sortalpha(): string {
    // radio button versteht nur strings
    return this.userSession.listalphasort ? "label" : "size";
  }
  public set sortalpha(s: string) {
    this.userSession.listalphasort = s === "label";
    this.oeListSort();
  }

  constructor(public farcService: FarcTreeService, private mainNavService: MainNavService,
              private httphandler: HttpClient, private configService: ConfigService) {

    this.restServer = AppConfig.settings.webserviceServer + apiROOT;
    this.userSession = this.configService.getUserConfig();

    this.initList();
  }

  public gotoTree(path: string[]) {
    this.mainNavService.goto(MainNavService.NAV_TREE);
    this.farcService.switchTree(false, path);
  }

  public onAccordionTabOpen(event) {
    this.index = event.index;
    if (this.oelist[this.index]) {
      this.userSession.listaccordion = this.oelist[this.index].label;
    }
  }
  public onAccordionTabClose(event) {
    this.index = undefined;
    this.userSession.listaccordion = "";
  }

  public priceFor(size: number): number {
    return size / 1024 / 1024 / 1024 * this.gbprice * 12 * (1 + this.mwst / 100);
  }

  public async initList() {
    const pr = await this.configService.getConfig(confGBPRICE);
    if (pr) {
      this.gbprice = pr;
    } else {
      this.gbprice = .9;
      console.debug("Fehler beim Lesen von " + confGBPRICE);
    }
    const mw = await this.configService.getConfig(confMWST);
    if (mw) {
      this.mwst = mw;
    } else {
      this.mwst = 19;
      console.debug("Fehler beim Lesen von " + confMWST);
    }
    this.getOElist().subscribe(
      (res) => {
        this.oelist = res;
        this.oeListSort();
        this.fullsum = this.oelist.reduce((prev, curr) => prev += curr.size, 0);
        this.fullprice = this.priceFor(this.fullsum);
      },
      (err) => {
        console.error("error reading OE-List-Data " + err);
      },
      () => {
        //
      }
    );
  }

  private openLastTab() {
    const label = this.userSession.listaccordion;
    if (this.oelist) {
      const lookup = this.oelist.findIndex((oe) => oe.label === label);
      if (lookup >= 0) {
        this.index = lookup;
      } else {
        this.index = undefined;
      }
    } else {
      console.error("LIST: oelist is empty");
    }
  }

  private getOElist(): Observable<FarcTreeNode[]> {
    return this.httphandler.get<FarcTreeNode[]>(this.restServer + apiOELIST);
  }

  private oeListSort() {
    this.sortNodes(this.oelist)
      .forEach((n) => {
        if (n.children) {
          this.sortNodes(n.children);
        }
      });
    this.openLastTab();
  }

  private sortNodes(nodes: FarcTreeNode[]): FarcTreeNode[] {
    if (this.sortalpha === "label") {
      return nodes.sort((nodeA, nodeB) => nodeA.label.localeCompare(nodeB.label));
    } else {
      return nodes.sort((nodeA, nodeB) => nodeB.size - nodeA.size);
    }
  }

}
