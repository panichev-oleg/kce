import { JSONContent } from "html-to-json-parser/dist/types";
import { Entry } from "../types";
import { HTMLToJSON } from "html-to-json-parser";
import {
  externalFinishStationId,
  externalFinishStationName,
  externalMiddleStationId,
  externalMiddleStationName,
  externalStartStationId,
  externalStartStationName,
  externalTablePattern,
} from "./constants";
import { timeToSeconds } from "./utils";

const parseExternalData = (json: JSONContent) => {
  const result: Array<Entry> = [];

  json.content.forEach((item, idx) => {
    const row = item as JSONContent;
    if (
      idx < 6 ||
      row.type !== "tr" ||
      /* @ts-ignore */
      !["on", "onx"].includes(row.attributes?.class)
    ) {
      return;
    }

    const entry: Entry = {
      /* @ts-ignore */
      number: row.content[1].content[0].content[1].content[0],
      /* @ts-ignore */
      startId: row.content[9].content[0].attributes.href.split("=")[1],
      /* @ts-ignore */
      startTimeSec: timeToSeconds(row.content[11].content[0]),
      /* @ts-ignore */
      endId: row.content[15].content[0].attributes.href.split("=")[1],
      /* @ts-ignore */
      endTimeSec: timeToSeconds(row.content[13].content[0]),
      /* @ts-ignore */
      infoUrl:
        /* @ts-ignore */
        row.content[1].content[2]?.attributes?.color === "red"
          ? /* @ts-ignore */
            row.content[1].content[0].attributes?.href
          : undefined,
      middleId: "",
      middleTimeSec: 0,
    };

    result.push(entry);
  });

  return result;
};

export const getExternalData = async (
  fromId: string,
  toId: string,
  date: string
) => {
  const url = `${process.env.PUBLIC_URL}/static/eltrain_from_${fromId}_to_${toId}_date_${date}.txt`;

  const response = await fetch(url);
  const html = await response.text();
  const table = html.match(externalTablePattern)?.[0] || "";
  const json = await HTMLToJSON(table);
  const data = parseExternalData(json as JSONContent);

  return data;
};

export const getExternalSchedule = async (date: string) => {
  const dataFromStart = await getExternalData(
    externalStartStationId,
    externalFinishStationId,
    date
  );

  const dataFromMiddle = await getExternalData(
    externalMiddleStationId,
    externalFinishStationId,
    date
  );

  const result: Array<Entry> = dataFromMiddle.map((middleEntry) => {
    const startEntry = dataFromStart.find(
      ({ number }) => number === middleEntry.number
    );

    const mergedEntry: Entry = {
      ...middleEntry,
      startId: "",
      startTimeSec: 0,
      ...startEntry,
      middleId: middleEntry.startId,
      middleTimeSec: middleEntry.startTimeSec,
    };

    return mergedEntry;
  });
  return result;
};

export const getExternalBackSchedule = async (date: string) => {
  const dataToMiddle = await getExternalData(
    externalFinishStationId,
    externalMiddleStationId,
    date
  );

  const dataToFinish = await getExternalData(
    externalFinishStationId,
    externalStartStationId,
    date
  );

  const result: Array<Entry> = dataToMiddle.map((middleEntry) => {
    const finishEntry = dataToFinish.find(
      ({ number }) => number === middleEntry.number
    );

    const mergedEntry: Entry = {
      ...middleEntry,
      endId: "",
      endTimeSec: 0,
      ...finishEntry,
      middleId: middleEntry.endId,
      middleTimeSec: middleEntry.endTimeSec,
    };

    return mergedEntry;
  });
  return result;
};

const getStopNameById = (stopId: string) => {
  switch (stopId) {
    case externalStartStationId:
      return externalStartStationName;

    case externalMiddleStationId:
      return externalMiddleStationName;

    case externalFinishStationId:
      return externalFinishStationName;

    default:
      return stopId;
  }
};

export const getStopNames = (data: Array<Entry>) => {
  const merged = data.reduce((acc, cur) => ({
    ...acc,
    startId: cur.startId || acc.startId,
    middleId: cur.middleId || acc.middleId,
    endId: cur.endId || acc.endId,
  }));

  return {
    start: getStopNameById(merged.startId),
    middle: getStopNameById(merged.middleId),
    end: getStopNameById(merged.endId),
  };
};
