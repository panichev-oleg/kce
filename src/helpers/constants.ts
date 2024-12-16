export const rootUrlFragment = "kce";

export const externalStartStationName = "Борщаговка";
export const externalMiddleStationName = "Святошин";
export const externalFinishStationName = "Ирпень";

export const externalStartStationId = "83"; // борщаговка
export const externalMiddleStationId = "85"; // святошин
export const externalFinishStationId = "88"; // ирпень

export const internalStartStationName = "Выдубичи";
export const internalMiddleStationName = "Борщаговка";
export const internalFinishStationName = "Святошин";

export const internalStartStationId = "14"; // Видубичі
export const internalMiddleStationId = "20"; // Борщагівка
export const internalFinishStationId = "21"; // Святошин

export const internalBackStartStationId = "1"; // Святошин
export const internalBackMiddleStationId = "2"; // Борщагівка
export const internalBackFinishStationId = "8"; // Видубичі

export const internalUrl =
  "https://docs.google.com/spreadsheets/u/0/d/e/2PACX-1vRXpHpl4haRkvPX3UxrurO7U-Bt0iAjdrAv1adBTEsOryZCcfOxOP809ETCSrdpF88PocTONiRg3ycZ/pubhtml/sheet?headers=false&gid=433390657&range=A1:Z23";
export const internalBackUrl =
  "https://docs.google.com/spreadsheets/u/0/d/e/2PACX-1vRXpHpl4haRkvPX3UxrurO7U-Bt0iAjdrAv1adBTEsOryZCcfOxOP809ETCSrdpF88PocTONiRg3ycZ/pubhtml/sheet?headers=false&gid=28169577&range=A1:Z23";

export const externalDomain = `https://swrailway.gov.ua/timetable/eltrain/`;
export const externalInfoUrl = `${externalDomain}:href#tabs-notes`;
export const externalScheduleUrl = `${externalDomain}?sid1=:fromId&sid2=:toId&eventdate=:date`;

export const externalTablePattern = /(<table[^>+]id=geo2g.+?<\/table>)/ms;
export const internalTablePattern =
  /(<table class=td_center cellSpacing=0 cellPadding=0 border=0 >.+?<\/table>)/ms;

export const fastTransferSec = 2 * 60;
export const slowTransferSec = 20 * 60;
