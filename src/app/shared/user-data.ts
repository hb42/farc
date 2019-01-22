/**
 * Session-Daten eines Benutzers
 * -> {@link UserSession}
 *
 *  @property {string} nav - letzte Seite (vollstaendiger router-Pfad)
 *  @property {boolean} isArcTree - ist Archive-Tree ausgewaehlt?
 *  @property {string[]} srcTreepath - Pfad im Source-Tree
 *  @property {string[]} arcTreepath - Pfad im Archive-Tree
 *  @property {boolean} treealphasort - Tree-Sort (alpha|size)
 *  @property {string} treelistsortField - Detaillisten-Sort
 *  @property {number} treelistsortOrder - Detaillisten-Sort
 *  @property {string} selectlistsortField - Vormerklisten-Sort
 *  @property {number} selectlistsortOrder - Vormerklisten-Sort
 *  @property {boolean} listalphasort - Uebersichtslisten-Sort (alpha|size)
 *  @property {number} listaccordion - Label der geoeffneten OE
 *  @property {string} lastSeenVersion - Client-Version beim letzten App-Start
 */
export interface UserData {
  nav: string;
  isArcTree: boolean;
  srcTreepath: string[];
  arcTreepath: string[];
  treealphasort: boolean;
  treelistsortField: string;
  treelistsortOrder: number;

  selectTable: string;
  selectlistsortField: string;
  selectlistsortOrder: number;
  resultlistsortField: string;
  resultlistsortOrder: number;

  listalphasort: boolean;
  listaccordion: string;

  lastSeenVersion: string;
}
