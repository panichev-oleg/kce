export type Entry = {
  number: string;
  startId: string;
  middleId: string;
  endId: string;
  startTimeSec: number;
  middleTimeSec: number;
  endTimeSec: number;
  infoUrl?: string;
};

export type TransferType = "middleToStart" | "endToMiddle";

export type MergedScheduleItem = {
  internalScheduleRow?: Entry;
  externalScheduleRow: Entry;
  transferTimeSec?: number;
  transferType?: TransferType;
};

export type MergedSchedule = Array<MergedScheduleItem>;
