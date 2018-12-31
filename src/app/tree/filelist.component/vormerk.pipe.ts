import { Pipe, PipeTransform } from "@angular/core";

import { FarcSelectType, } from "@hb42/lib-farc";

@Pipe({
        name: "vormerk"
      })
export class VormerkPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    switch (value) {
      case FarcSelectType.none        :
        return "";
      case FarcSelectType.toArchive   :
        return "Archivieren";
      case FarcSelectType.fromArchive :
        return "Zurücksichern";
      case FarcSelectType.del         :
        return "Löschen";
      default                         :
        return "";
    }
  }

}
