import {
  Pipe,
  PipeTransform
} from "@angular/core";

import {
  FarcSelectType,
} from "../../../shared/ext/lib-farc";

@Pipe({
  name: "vormerk"
})
export class VormerkPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    const sel: FarcSelectType = value;
    switch (sel) {
      case FarcSelectType.none        : return "";
      case FarcSelectType.toArchive   : return "Archivieren";
      case FarcSelectType.fromArchive : return "Zurücksichern";
      case FarcSelectType.del         : return "Löschen";
      default                         : return "";
    }
  }

}
