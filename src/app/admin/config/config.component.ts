import {
  Component,
  OnInit,
} from "@angular/core";

import {
  ElectronService,
} from "../../../shared/ext";

@Component({
  selector: "farc-config",
  templateUrl: "./config.component.html",
  styleUrls: ["./config.component.css"]
})
export class ConfigComponent implements OnInit {

  constructor(public electronService: ElectronService) { }

  public ngOnInit() {
  }

  public testElectron() {
    if (this.electronService.isElectron) {
      console.info("### sync reply " + this.electronService.ipcRenderer.sendSync("synchronous-message", "ping"));

      this.electronService.ipcRenderer.on("asynchronous-reply", (event, arg) => {
        console.info("### async reply " + arg);
      });
      this.electronService.ipcRenderer.send("asynchronous-message", "ping");
    } else {
      console.info("### no electron");
    }
  }

}
