import { Pipe, PipeTransform, } from "@angular/core";

import { FarcRole, } from "@hb42/lib-farc";

@Pipe({
        name: "rolenames"
})
export class RolesPipe implements PipeTransform {

  public transform(value: any[]/*, params: any[]*/): string {
    const items: FarcRole[] = value;
    let ret: string;
    if (items) {
      items.forEach((role) => {
        if (ret) {
          ret += ", ";
        } else {
          ret = "";
        }
        ret += role.name;
      });
    }
    return ret;
  }

}
