import { Component, OnInit } from "@angular/core";
import { HelpService } from "../help.service";

@Component({
  selector: "farc-helplist",
  templateUrl: "./helplist.component.html",
  styleUrls: ["./helplist.component.css"]
})
export class HelplistComponent implements OnInit {

  constructor(public helpService: HelpService) { }

  ngOnInit() {
  }

}
