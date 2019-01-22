import { EventEmitter, } from "@angular/core";

import { LogonService, } from "@hb42/lib-client";

import { UserData, } from ".";

/**
 * Benutzerdaten in einem {@link UserData}-Objekt verwalten.
 * Jede Aenderung der Daten loesst einen Event aus. {@link ConfigService}
 * reagiert darauf, indem die Benutzerdaten auf dem Server gespeichert
 * werden.
 */
export class UserSession {

  // dieses Objekt wird gespeichert
  private readonly userdata: UserData;

  // wird fuer jede Aenderung der Daten aufgerufen
  private changeEvent: EventEmitter<UserData>;

  constructor(event: EventEmitter<UserData>, data: UserData, private logonService: LogonService) {
    this.changeEvent = event;
    // defaults
    this.userdata = data ? data : {
      isArcTree           : false,
      srcTreepath         : [],
      arcTreepath         : [],
      nav                 : "/",
      treealphasort       : true,
      treelistsortField   : "",
      treelistsortOrder   : 0,
      selectTable         : "",
      selectlistsortField : "",
      selectlistsortOrder : 0,
      resultlistsortField : "",
      resultlistsortOrder : 0,
      listalphasort       : false,
      listaccordion       : "",
      lastSeenVersion     : "",
    };
  }

  // nur fuers Speichern
  public get data() {
    return this.userdata;
  }

  // fuer jedes Element aus userdata einen getter
  // und einen setter definieren, der setter triggert
  // den EventEmitter

  public get isArcTree(): boolean {
    return this.data.isArcTree;
  }

  public set isArcTree(s: boolean) {
    this.data.isArcTree = s;
    this.changeEvent.emit();
  }

  public get srcTreepath(): string[] {
    return this.data.srcTreepath ? this.data.srcTreepath : [];
  }

  public set srcTreepath(tp: string[]) {
    this.data.srcTreepath = tp;
    this.changeEvent.emit();
  }

  public get arcTreepath(): string[] {
    return this.data.arcTreepath ? this.data.arcTreepath : [];
  }

  public set arcTreepath(tp: string[]) {
    this.data.arcTreepath = tp;
    this.changeEvent.emit();
  }

  public get nav(): string {
    return this.data.nav ? this.data.nav : "/";
  }

  public set nav(n: string) {
    this.data.nav = n;
    this.changeEvent.emit();
  }

  public get treealphasort(): boolean {
    return this.data.treealphasort;
  }

  public set treealphasort(s: boolean) {
    this.data.treealphasort = s;
    this.changeEvent.emit();
  }

  public get treelistsortField(): string {
    return this.data.treelistsortField ? this.data.treelistsortField : "";
  }

  public get treelistsortOrder(): number {
    return this.data.treelistsortOrder;
  }

  public get selectlistsortField(): string {
    return this.data.selectlistsortField ? this.data.selectlistsortField : "";
  }

  public get selectlistsortOrder(): number {
    return this.data.selectlistsortOrder;
  }

  public get resultlistsortField(): string {
    return this.data.resultlistsortField ? this.data.resultlistsortField : "";
  }

  public get resultlistsortOrder(): number {
    return this.data.resultlistsortOrder;
  }

  /**
   * treelistsortOrder + treelistsortField muessen immer zusammen geaendert
   * werden, deshalb eine fn, die beide setzt und den Speichervorgang nur
   * einmal triggert
   *
   * @param field
   * @param order
   */
  public setFilesort(field: string, order: number) {
    this.data.treelistsortField = field;
    this.data.treelistsortOrder = order;
    this.changeEvent.emit();
  }

  public get selectTable(): string {
    return this.data.selectTable;
  }
  public set selectTable(tab: string) {
    this.data.selectTable = tab;
    this.changeEvent.emit();
  }

  /**
   * selectlistsortOrder + selectlistsortField muessen immer zusammen geaendert
   * werden, deshalb eine fn, die beide setzt und den Speichervorgang nur
   * einmal triggert
   *
   * @param field
   * @param order
   */
  public setSelectsort(field: string, order: number) {
    this.data.selectlistsortField = field;
    this.data.selectlistsortOrder = order;
    this.changeEvent.emit();
  }

  public setResultsort(field: string, order: number) {
    this.data.resultlistsortField = field;
    this.data.resultlistsortOrder = order;
    this.changeEvent.emit();
  }

  public get listalphasort(): boolean {
    return this.data.listalphasort;
  }

  public set listalphasort(s: boolean) {
    this.data.listalphasort = s;
    this.changeEvent.emit();
  }

  public get listaccordion(): string {
    return this.data.listaccordion;
  }

  public set listaccordion(s: string) {
    this.data.listaccordion = s;
    this.changeEvent.emit();
  }

  public get lastSeenVersion(): string {
    return this.data.lastSeenVersion;
  }

  public set lastSeenVersion(s: string) {
    this.data.lastSeenVersion = s;
    this.changeEvent.emit();
  }

  // Zugriff auf die Daten, die mit dem JWT vom Server kommen

  public isAdmin(): boolean {
    return this.logonService.getData().admin;
  }

  public get uid(): string {
    return this.logonService.getData().uid;
  }

  public get name(): string {
    return this.logonService.getData().name;
  }

  public get vorname(): string {
    return this.logonService.getData().vorname;
  }

  public get mail(): string {
    return this.logonService.getData().mail;
  }

}
