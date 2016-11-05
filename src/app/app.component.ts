/**
 * Start-Component
 */

import {
  Component,
  // HostBinding,
  Inject,
  OnInit,
} from "@angular/core";
import {
  Router,
} from "@angular/router";

@Component({
  selector: "app",
  styles: [
  //   ":host { height: 100%; width: 100%; }",
      ":host { background: black }",
  ],
  // host: {  // klappt nicht fuer main-component
  //   "[class]": "flex-page flex-col",
  // },
  template: `
    <div class="flex-panel" [style.min-height]="headerHeight" [style.height]="headerHeight"
     style="background: white">
      <p-toolbar>  <!-- primeng -->
        <div class="ui-toolbar-group-left">
<ul class="nav nav-pills">  <!-- bootstrap -->
  <li [class.active]="tabactive[0]" >
    <a (click)="tabclick(0)"><span class="fa fa-list"></span> OE-Übersicht</a>
  </li>
  <li [class.active]="tabactive[1]" >
    <a (click)="tabclick(1)"><span class="fa fa-folder-open"></span> Details</a>
  </li>
  <li [class.active]="tabactive[2]" >
    <a (click)="tabclick(2)"><span class="fa fa-check-square"></span> Vormerkungen</a>
  </li>
  <li [class.active]="tabactive[3]" >  <!-- TODO nur fuer Admin sichtbar -->
    <a (click)="tabclick(3)"><span class="fa fa-gears"></span> Admin</a>
  </li>
</ul>      
        </div>
        <div class="ui-toolbar-group-right">
              <a  title="{{metadata.VERSIONSTR}}"
                 class="btn btn-sm">
                {{metadata.DESC}} {{metadata.VERSION}}{{metadata.RELEASE}}
              </a>
              <a href="/doku.html" target="farcdoku" title="Dokumentation"
                 class="btn btn-success ">
                Hilfe
              </a>
        </div>
      </p-toolbar>
    </div> 
        <router-outlet></router-outlet> 
    <!--<div class="flex-row" style="background: purple"> -->
      <!--<div class="flex-panel" [style.width]="leftPaneWidth" [style.min-width]="leftPaneMinWidth"-->
       <!--style="background: green"> -->
      <!--</div>-->
      <!--<div fb-splitter ></div>-->
      <!--<div class="flex-panel flex-max" [style.width]="centerPaneWidth" [style.min-width]="centerPaneMinWidth" -->
       <!--style="background: red">-->
        <!--<div class="flex-content">{{centerText}}</div>-->
      <!--</div>-->
      <!--<div class="flex-panel" [style.width]="rightPaneWidth" [style.min-width]="rightPaneMinWidth"-->
       <!--style="background: yellow">rechts</div>-->
    <!--</div>-->
    <div class="flex-panel" [style.min-height]="footerHeight" [style.height]="footerHeight"
      style="background: deepskyblue">footer</div>
    `,
})
export class AppComponent implements OnInit {

  public sessionData: any;

  // fuer die main-component funktioniert "host: {class: "blah blah"}" nicht
  // also hier eintragen, auch wenn die classes fix sind
  // koennte daran liegen, dass <app></app> in der index.html fest eingetragen ist
  // @HostBinding("class.flex-page") protected fp = true;
  // @HostBinding("class.flex-col") protected fc = true;

  private headerHeight: string;
  private footerHeight: string;
  // private leftPaneWidth: string;
  // private leftPaneMinWidth: string;
  // private rightPaneWidth: string;
  // private rightPaneMinWidth: string;
  // private centerPaneWidth: string;
  // private centerPaneMinWidth: string;
  //
  // private centerText: string;

  private tab: number = 0;
  private tabactive: boolean[] = [true, false, false, false];

  constructor(private router: Router, @Inject("METADATA") private metadata: any) {
    console.info(metadata.DESC);
    console.info(metadata.VERSIONSTR);
  }

  public ngOnInit(): void {
    console.info("App.ngOnInit start");

    this.headerHeight = "46px";
    this.footerHeight = "3em";

    // this.leftPaneWidth = "350px";
    // this.leftPaneMinWidth = "100px";
    // this.rightPaneWidth = "200px";
    // this.rightPaneMinWidth = "100px";
    // this.centerPaneWidth = "100%";
    // this.centerPaneMinWidth = "100px";
    //
    // for (let i = 0; i < 100; i++) {
    //   let s = " " + i;
    //   for (let j = 0; j < 100; j++) {
    //     this.centerText += s;
    //   }
    // }
  }

  protected tabclick(nr: number) {
    console.info("TAB click " + nr);
    if (this.tab === nr) {
      return;
    }
    this.tabactive[this.tab] = false;
    this.tab = nr;
    this.tabactive[this.tab] = true;

    switch (this.tab) {
      case 0:
        this.router.navigate(["/list"]);
        break;
      case 1:
        this.router.navigate(["/tree"]);
        break;
      case 2:
        this.router.navigate(["/select"]);
        break;
      case 3:
        this.router.navigate(["/admin"]);
        break;
      default: break;
    }
    // nav(nr)
  }

}
