import {
  Pipe,
  PipeTransform,
} from "@angular/core";

import {
  FarcEntryTypes,
  FarcTreeNode,
  FileSizePipe,
} from "../../../shared/ext";

@Pipe({
  name: "filesSum",
})
export class FilesSumPipe implements PipeTransform {

  constructor(private filesizePipe: FileSizePipe) { }

  transform(value: any, args?: any): any {
    const files: FarcTreeNode[] = value;
    const display: string = args; // 'all' = x Verz. (xxkb), x Dat. (xxkb)
                                  // 'sum' = xxkb (x Verz., x Dat.)
    if (!files) {
      return "";
    }
    let d = 0;
    let ds = 0;
    let f = 0;
    let fs = 0;
    let rc = "";
    files.forEach( (file) => {
      if (file.entrytype === FarcEntryTypes.file) {
        f++;
        fs += file.size;
      } else {  // dir
        d++;
        ds += file.size;
      }
    });
    const dirs = "" + d + (d === 1 ? " Verzeichnis" : " Verzeichnisse");
    const dirSize = this.filesizePipe.transform(ds);
    const fls = "" + f + (f === 1 ? " Datei" : " Dateien");
    const flsSize = this.filesizePipe.transform(fs);
    const allSize = this.filesizePipe.transform(ds + fs);
    if (display === "all") {
       if (d) {
         rc += dirs + " (" + dirSize + ")";
       }
       if (f) {
         if (d) {
           rc += ", ";
         }
         rc += fls + " (" + flsSize + ")";
       }
    } else {
      rc += allSize + " (";
      if (d) {
        rc += dirs;
      }
      if (f) {
        if (d) {
          rc += ", ";
        }
        rc += fls;
      }
      rc += ")";
    }
    return rc;
  }

}
