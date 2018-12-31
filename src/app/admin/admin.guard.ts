import { Injectable, } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, } from "@angular/router";
import { Observable, } from "rxjs";

import { ConfigService, } from "../shared";

@Injectable()
export class AdminGuard implements CanActivate {

  constructor(private configService: ConfigService) {
  }

  canActivate(next: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    return this.configService.getUserConfig().isAdmin();

  }
}
