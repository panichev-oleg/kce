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

export const internalStartStationId = "433390657R16"; // Видубичі
export const internalMiddleStationId = "433390657R22"; // Борщагівка
export const internalFinishStationId = "433390657R3"; // Святошин

export const internalBackStartStationId = "28169577R3"; // Святошин
export const internalBackMiddleStationId = "28169577R4"; // Борщагівка
export const internalBackFinishStationId = "28169577R10"; // Видубичі

export const internalMiddleToFinishTimeMin = 6;

export const externalDomain = `https://swrailway.gov.ua/timetable/eltrain/`;
export const externalInfoUrl = `${externalDomain}:href#tabs-notes`;

export const externalTablePattern = /(<table[^>+]id=geo2g.+?<\/table>)/ms;
export const internalTablePattern =
  /(<table class="waffle" cellspacing="0" cellpadding="0">.+?<\/table>)/ms;

export const fastTransferSec = 2 * 60;
export const slowTransferSec = 20 * 60;
