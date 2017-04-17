/**
 * Created by hb on 16.10.16.
 */
import {
    Component,
    Inject,
    OnInit,
} from "@angular/core";

@Component({
             selector: "farc-select-view",
             host: {
               class: "flex-panel flex-content-fix",
             },
             templateUrl: "./selectview.component.html",
           })
export class SelectView implements OnInit {

  public data: any;

  protected leftPaneWidth: string;
  protected leftPaneMinWidth: string;
  protected centerPaneWidth: string;
  protected centerPaneMinWidth: string;

  protected centerText: string;

  constructor() {
    console.info("c'tor SelectView");
  }

  public ngOnInit(): void {
    this.leftPaneWidth = "350px";
    this.leftPaneMinWidth = "100px";
    this.centerPaneWidth = "100%";
    this.centerPaneMinWidth = "100px";

    for (let i = 0; i < 100; i++) {
      const s = " " + i;
      for (let j = 0; j < 100; j++) {
        this.centerText += s;
      }
    }

  }

}
