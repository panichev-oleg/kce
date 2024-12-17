export type Entry = {
  id?: string; // internal id, used for URL redirection to UZ website
  number: string; // route number, used in schedules and shown to user
  startId: string;
  middleId: string;
  endId: string;
  startTimeSec: number;
  middleTimeSec: number;
  endTimeSec: number;
  infoUrl?: string;
};

export type TransferType =
  | "middleToStart"
  | "endToMiddle"
  | "endToMiddle"
  | "middleToStart";

export type MergedScheduleItem = {
  internalScheduleRow?: Entry;
  externalScheduleRow: Entry;
  transferTimeSec?: number;
  transferType?: TransferType;
};

export type MergedSchedule = Array<MergedScheduleItem>;

export type AppStatus = "loading" | "loaded" | "error";

export enum InternalDirection {
  BACK = 1,
  FORWARD = 2,
}

export type InternalScheduleInputCell = {
  text: string;
  tid: string | null;
};
