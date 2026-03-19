export type Entry = {
  id: string; // internal id, used for URL redirection to UZ website
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

export type ScheduleCacheEntry = {
  status: AppStatus;
  data?: MergedSchedule;
  dataBack?: MergedSchedule;
};

export type ScheduleCache = Record<string, ScheduleCacheEntry>;
export type InFlightScheduleRequests = Partial<
  Record<string, Promise<void>>
>;

export type UseScheduleDataResult = {
  data?: MergedSchedule;
  dataBack?: MergedSchedule;
  status: AppStatus;
  viewDate: string;
};

export enum InternalDirection {
  FORWARD = 1,
  BACK = 2,
}

export type InternalScheduleInputCell = {
  text: string;
  tid: string | null;
};

export type ExternalScheduleInputCell = {
  text: string;
  tid: string | null;
  sid: string | null;
  hasAlert: boolean;
};
