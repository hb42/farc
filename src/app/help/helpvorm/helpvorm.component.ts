import { Component, OnInit } from "@angular/core";
import { HelpService } from "../help.service";

@Component({
  selector: "farc-helpvorm",
  templateUrl: "./helpvorm.component.html",
  styleUrls: ["./helpvorm.component.css"]
})
export class HelpvormComponent implements OnInit {

  constructor(public helpService: HelpService) { }

  ngOnInit() {
  }

}
