export const rootUrlFragment = "kce";

export const externalStartStationId = 83; // борщаговка
export const externalMiddleStationId = 85; // святошин
export const externalFinishStationId = 88; // ирпень

export const externalDomain = `https://swrailway.gov.ua/timetable/eltrain/`;
export const externalInfoUrl = `${externalDomain}:href#tabs-notes`;

export const externalTablePattern = /(<table[^>+]id=geo2g.+?<\/table>)/ms;

export const internalUrl =
  "https://docs.google.com/spreadsheets/u/0/d/e/2PACX-1vRXpHpl4haRkvPX3UxrurO7U-Bt0iAjdrAv1adBTEsOryZCcfOxOP809ETCSrdpF88PocTONiRg3ycZ/pubhtml/sheet?headers=false&gid=433390657&range=A1:Z23";
