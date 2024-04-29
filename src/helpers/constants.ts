export const rootUrlFragment = "kce";

export const externalStartStationId = 83; // борщаговка
export const externalMiddleStationId = 85; // святошин
export const externalFinishStationId = 88; // ирпень

export const externalURL = `https://swrailway.gov.ua/timetable/eltrain/?sid1=${externalMiddleStationId}&sid2=${externalFinishStationId}&eventdate=:date`;

export const externalTableParretn = /(<table[^>+]id=geo2g.+?<\/table>)/ms;
