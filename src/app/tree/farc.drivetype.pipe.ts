/**
 * Created by hb on 27.01.17.
 */

import {
  Pipe,
  PipeTransform,
} from "@angular/core";

import {
  FarcDriveTypes,
} from "@hb42/lib-farc";

@Pipe({name: "drivetype"})
export class FarcDrivetypePipe implements PipeTransform {

  public transform(value: any[]/*, params: any[]*/): any {
    const item: number = Number(value);
    return FarcDriveTypes[item.toString()].toString();
  }

}
