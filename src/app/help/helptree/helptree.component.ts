import { Component, OnInit } from "@angular/core";
import { FarcTreeService } from "../../tree";
import { HelpService } from "../help.service";

@Component({
  selector: "farc-helptree",
  templateUrl: "./helptree.component.html",
  styleUrls: ["./helptree.component.css"]
})
export class HelptreeComponent implements OnInit {

  constructor(public helpService: HelpService, public farcService: FarcTreeService) { }

  ngOnInit() {
  }

}
