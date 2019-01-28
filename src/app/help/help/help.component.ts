import { Component, HostBinding, OnInit } from "@angular/core";
import { HelpService } from "../help.service";

@Component({
  selector: "farc-help",
  templateUrl: "./help.component.html",
  styleUrls: ["./help.component.css"]
})
export class HelpComponent implements OnInit {
  @HostBinding("attr.class") cssClass = "flex-panel flex-content-fix";

  constructor(public helpService: HelpService) { }

  ngOnInit() {
  }

  public onActivate(event: Event, outlet: HTMLElement) {
    // Hilfeseiten bei der Navigation nach oben scrollen
    outlet.parentElement.scrollTop = 0;
  }

}
