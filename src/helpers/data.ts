import {
  Entry,
  ExternalScheduleInputCell,
  InternalDirection,
  InternalScheduleInputCell,
  MergedSchedule,
  TransferType,
} from "../types";
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
import { getInfoUrl, hasTimeValue, timeToSeconds } from "./utils";
import {
  tableToArraysFromHTMLExternal,
  tableToArraysFromHTMLInternal,
} from "./parser";

const parseExternalData = (data: Array<Array<ExternalScheduleInputCell>>) => {
  const routeData = data
    .filter((_, idx) => idx > 1) // skip 2 first rows
    .map(([row]) => {
      return {
        tid: row.tid as string,
        text: row.text.split(",")[0],
        hasAlert: row.hasAlert,
      };
    });

  const textData = data.map((row) => row.map(({ text, sid }) => sid || text));

  const result = textData
    .filter((_, idx) => idx > 1) // skip 2 first rows
    .map((item, idx) => {
      const startStationId = item[4];
      const finishStationId = item[7];

      const startStationTime = item[5];
      const finishStationTime = item[6];

      const entry: Entry = {
        id: routeData[idx].tid,
        number: routeData[idx].text,
        startId: startStationId,
        startTimeSec: hasTimeValue(startStationTime)
          ? timeToSeconds(startStationTime)
          : -1,
        endId: finishStationId,
        endTimeSec: hasTimeValue(finishStationTime)
          ? timeToSeconds(finishStationTime)
          : -1,
        middleId: "",
        middleTimeSec: -1,
        infoUrl: routeData[idx].hasAlert
          ? getInfoUrl(routeData[idx].tid)
          : undefined,
      };
      return entry;
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
  const parsedTable = tableToArraysFromHTMLExternal(table);
  const data = parseExternalData(parsedTable);

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

  const parsedTable = tableToArraysFromHTMLInternal(table);

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
