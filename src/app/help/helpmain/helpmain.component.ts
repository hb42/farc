import { Component, OnInit } from "@angular/core";
import { HelpService } from "../help.service";

@Component({
  selector: "farc-helpmain",
  templateUrl: "./helpmain.component.html",
  styleUrls: ["./helpmain.component.css"]
})
export class HelpmainComponent implements OnInit {

  constructor(public helpService: HelpService) { }

  ngOnInit() {
  }

}
