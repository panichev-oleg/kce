import { JSONContent } from "html-to-json-parser/dist/types";
import { Entry } from "../types";
import { HTMLToJSON } from "html-to-json-parser";
import {
  externalFinishStationId,
  externalMiddleStationId,
  externalStartStationId,
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
      start: row.content[9].content[0].content[0].content[0],
      /* @ts-ignore */
      startTimeSec: timeToSeconds(row.content[11].content[0]),
      /* @ts-ignore */
      end: row.content[15].content[0].content[0].content[0],
      /* @ts-ignore */
      endTimeSec: timeToSeconds(row.content[13].content[0]),
      middle: "",
      middleTimeSec: 0,
    };

    result.push(entry);
  });

  return result;
};

export const getExternalData = async (
  fromId: number,
  toId: number,
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
      start: "",
      startTimeSec: 0,
      ...startEntry,
      middle: middleEntry.start,
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
      end: "",
      endTimeSec: 0,
      ...finishEntry,
      middle: middleEntry.end,
      middleTimeSec: middleEntry.endTimeSec,
    };

    return mergedEntry;
  });
  return result;
};

export const getStopNames = (data: Array<Entry>) => {
  const merged = data.reduce((acc, cur) => ({
    ...acc,
    start: cur.start || acc.start,
    middle: cur.middle || acc.middle,
    end: cur.end || acc.end,
  }));

  return { start: merged.start, middle: merged.middle, end: merged.end };
};
