import { JSONContent } from "html-to-json-parser/dist/types";
import { Entry, MergedSchedule, TransferType } from "../types";
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
  internalMiddleToFinishTimeMin,
  internalStartStationName,
  internalTablePattern,
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

    if (!result.map(({ number }) => number).includes(entry.number)) {
      result.push(entry);
    }
  });

  return result;
};

const parseInternalData = (
  json: JSONContent,
  isBackSchedule: boolean,
  isWeekend: boolean
) => {
  const resultObj: Record<string, Entry> = {};

  const [startStationId, middleStationId, finishStationId] = !isBackSchedule
    ? [internalStartStationId, internalMiddleStationId, internalFinishStationId]
    : [
        internalBackStartStationId,
        internalBackMiddleStationId,
        internalBackFinishStationId,
      ];

  const workingDaysOnlyColumnNumbers: Array<number> = [];
  const allDaysColumnNumbers: Array<number> = [];

  /* @ts-ignore */
  const weekDaysRow = json.content[1].content[1];

  /* @ts-ignore */
  weekDaysRow.content.forEach((item, idx) => {
    const row = item as JSONContent;
    /* @ts-ignore */
    if (row.type === "td" && row.attributes.class === "s3") {
      if (row.content[0] === "Пн-Пт") {
        workingDaysOnlyColumnNumbers.push(idx + 1); // +1 because for this row one cell is missing
        allDaysColumnNumbers.push(idx + 1);
      }
      if (row.content[0] === "Щоденно") {
        allDaysColumnNumbers.push(idx + 1);
      }
    }
  });

  /* @ts-ignore */
  json.content[1].content.forEach((item, idx) => {
    const row = item as JSONContent;
    /* @ts-ignore */
    const id = row.content[0].attributes.id;
    /* @ts-ignore */
    const name = row.content[1]?.content?.[0];

    /* @ts-ignore */
    if (
      idx < 3 ||
      row.type !== "tr" ||
      !name ||
      ![
        startStationId,
        middleStationId,
        finishStationId,
        /* @ts-ignore */
      ].includes(id)
    ) {
      return;
    }

    /* @ts-ignore */
    row.content.forEach((item, idx) => {
      if (
        /* @ts-ignore */
        item.type !== "td" ||
        /* @ts-ignore */
        !["s5", "s7", "s9"].includes(item.attributes.class) ||
        (isWeekend && workingDaysOnlyColumnNumbers.includes(idx))
      ) {
        return;
      }

      /* @ts-ignore */
      const value = item.content[0];
      const key =
        id === startStationId
          ? "start"
          : id === middleStationId
          ? "middle"
          : "end";

      resultObj[idx] = {
        ...(resultObj[idx] || {}),
        number: `${idx}`,
        // [`${key}Id`]: name,
        [`${key}Id`]: id,
        [`${key}TimeSec`]: timeToSeconds(value),
      };
    });
  });

  const result: Array<Entry> = Object.values(resultObj).map((entry) => entry);

  if (!isBackSchedule) {
    result.forEach((item, idx) => {
      result[idx] = {
        ...item,
        endId: finishStationId,
        endTimeSec: item.middleTimeSec + internalMiddleToFinishTimeMin * 60,
      };
    });
  }

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
  const url = `${process.env.PUBLIC_URL}/static/eltrain_internal.txt`;
  const urlBack = `${process.env.PUBLIC_URL}/static/eltrain_internal_back.txt`;

  const response = await fetch(isBackSchedule ? urlBack : url);
  const html = await response.text();
  const table = html.match(internalTablePattern)?.[0] || "";
  const json = await HTMLToJSON(table);

  const isWeekend = [6, 0].includes(new Date(date).getDay());
  const data = parseInternalData(
    json as JSONContent,
    isBackSchedule,
    isWeekend
  );

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
        ? internalItem.middleTimeSec - externalTimeSec
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
