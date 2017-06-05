/**
 * Created by hb on 25.04.17.
 */

import {
  EventEmitter,
  Inject,
  Injectable,
} from "@angular/core";
import {
  Router,
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from "@angular/router";


@Injectable()
export class LogonService implements Resolve<String> {

  constructor(private router: Router) {
    console.info("c'tor LogonService");
  }

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<String> {
    console.info("resolve()");
    return new Promise<String>( (resolve) => {
      console.info("promise resolve");
      const s = "TEST";
      resolve(s);
    } );
  }

}
