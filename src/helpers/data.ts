// TODO:
// 1. Optimization for internal (parse strings directly to object, don't use react html parser)
// 2. Internal read ID of route instead of just index
// 3. Link to route (both internal and external)

import { JSONContent } from "html-to-json-parser/dist/types";
import {
  Entry,
  InternalDirection,
  InternalScheduleInputCell,
  MergedSchedule,
  TransferType,
} from "../types";
import { HTMLToJSON } from "html-to-json-parser";
import {
  externalFinishStationId,
  externalFinishStationName,
  externalMiddleStationId,
  externalMiddleStationName,
  externalStartStationId,
  externalStartStationName,
  externalTablePattern,
  internalBackFinishStationId,
  internalBackMiddleStationId,
  internalBackStartStationId,
  internalFinishStationId,
  internalFinishStationName,
  internalMiddleStationId,
  internalStartStationId,
  internalMiddleStationName,
  internalStartStationName,
  internalTablePattern,
} from "./constants";
import { hasTimeValue, timeToSeconds } from "./utils";
import { tableToArraysFromHTML } from "./parser";

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
      id: row.content[1].content[0].attributes?.href.split("=")[1],
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

    if (!result.map(({ number }) => number).includes(entry.number)) {
      result.push(entry);
    }
  });

  return result;
};

const parseInternalData = (
  data: Array<Array<InternalScheduleInputCell>>,
  isBackSchedule: boolean
) => {
  const resultObj: Record<string, Entry> = {};

  const [startStationId, middleStationId, finishStationId] = !isBackSchedule
    ? [internalStartStationId, internalMiddleStationId, internalFinishStationId]
    : [
        internalBackStartStationId,
        internalBackMiddleStationId,
        internalBackFinishStationId,
      ];

  let stationId = 0;

  const routeData = data[1]
    .filter(({ text, tid }) => text && tid)
    .map(({ text, tid }) => {
      return {
        tid: tid as string,
        text: text.split(",")[0],
      };
    });

  const textData = data.map((row) => row.map(({ text }) => text));

  textData.forEach((item, idx) => {
    if (idx < 3 || item.length < 2) {
      return;
    }
    stationId++;
    const stationIdStr = `${stationId}`;

    if (
      ![startStationId, middleStationId, finishStationId].includes(stationIdStr)
    ) {
      return;
    }

    let departureItems = item.filter(Boolean);

    departureItems = departureItems.filter((value, idx) => {
      return (
        (!(idx % 2) && !hasTimeValue(departureItems[idx + 1])) ||
        (idx % 2 && hasTimeValue(value))
      );
    });

    departureItems.forEach((value, idx) => {
      const key =
        stationIdStr === startStationId
          ? "start"
          : stationIdStr === middleStationId
          ? "middle"
          : "end";

      resultObj[idx] = {
        ...(resultObj[idx] || {}),
        id: routeData[idx].tid,
        number: routeData[idx].text,
        [`${key}Id`]: stationIdStr,
        [`${key}TimeSec`]: hasTimeValue(value) ? timeToSeconds(value) : -1,
      };
    });
  });

  const result: Array<Entry> = Object.values(resultObj).map((entry) => entry);

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

export const getInternalData = async (
  date: string,
  isBackSchedule: boolean
) => {
  const direction = isBackSchedule
    ? InternalDirection.BACK
    : InternalDirection.FORWARD;
  const url = `${process.env.PUBLIC_URL}/static/internal_direction_${direction}_date_${date}.txt`;

  const response = await fetch(url);
  const html = await response.text();
  const table = html.match(internalTablePattern)?.[0] || "";
  const parsedTable = tableToArraysFromHTML(table);

  const data = parseInternalData(parsedTable, isBackSchedule);

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

    case internalStartStationId:
      return internalStartStationName;

    case internalMiddleStationId:
      return internalMiddleStationName;

    case internalFinishStationId:
      return internalFinishStationName;

    case internalBackFinishStationId:
      return internalStartStationName;

    case internalBackMiddleStationId:
      return internalMiddleStationName;

    case internalBackStartStationId:
      return internalFinishStationName;

    default:
      return stopId;
  }
};

export const getExternalStopNames = (data: Array<Entry>) => {
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

export const getInternalSchedule = async (
  date: string,
  isBackSchedule: boolean
) => {
  const data = await getInternalData(date, isBackSchedule);
  return data;
};

export const mergeSchedule = (
  internalSchedule: Array<Entry>,
  externalSchedule: Array<Entry>
): MergedSchedule => {
  const result = externalSchedule.map((externalItem) => {
    const externalTimeSec =
      externalItem.startTimeSec || externalItem.middleTimeSec;

    const internalScheduleSorted = internalSchedule
      .filter(({ endTimeSec }) => externalTimeSec - endTimeSec > 0)
      .sort(
        (a, b) =>
          externalTimeSec - a.endTimeSec - (externalTimeSec - b.endTimeSec)
      );

    const internalItem = internalScheduleSorted[0];

    const transferType: TransferType | undefined =
      internalItem?.middleTimeSec && externalItem.startTimeSec
        ? "middleToStart"
        : internalItem?.endTimeSec && externalItem.middleTimeSec
        ? "endToMiddle"
        : undefined;

    const transferTimeSec =
      transferType === "middleToStart"
        ? externalTimeSec - internalItem.middleTimeSec
        : transferType === "endToMiddle"
        ? externalTimeSec - internalItem.endTimeSec
        : undefined;

    const res = {
      externalScheduleRow: externalItem,
      internalScheduleRow: internalItem,
      transferType,
      transferTimeSec,
    };
    return res;
  });

  return result;
};

export const mergeScheduleBack = (
  internalSchedule: Array<Entry>,
  externalSchedule: Array<Entry>
): MergedSchedule => {
  const result = externalSchedule.map((externalItem) => {
    const externalTimeSec =
      externalItem.endTimeSec || externalItem.middleTimeSec;

    const internalScheduleSorted = internalSchedule
      .filter(({ startTimeSec }) => startTimeSec - externalTimeSec > 0)
      .sort(
        (a, b) =>
          externalTimeSec - b.endTimeSec - (externalTimeSec - a.endTimeSec)
      );

    const internalItem = internalScheduleSorted[0];

    const transferType: TransferType | undefined =
      internalItem?.middleTimeSec && externalItem.endTimeSec
        ? "endToMiddle"
        : internalItem?.startTimeSec && externalItem.middleTimeSec
        ? "middleToStart"
        : undefined;

    const transferTimeSec =
      transferType === "endToMiddle"
        ? internalItem.middleTimeSec - externalTimeSec
        : transferType === "middleToStart"
        ? internalItem.startTimeSec - externalTimeSec
        : undefined;
    const res = {
      externalScheduleRow: externalItem,
      internalScheduleRow: internalItem,
      transferType,
      transferTimeSec,
    };
    return res;
  });

  return result;
};
