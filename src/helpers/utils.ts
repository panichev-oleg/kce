import { externalScheduleUrl } from "./constants";

export const isInPast = (dateSec: number) => {
  if (!dateSec) {
    return false;
  }

  return dateSec < new Date().getTime();
};

export const timeToSeconds = (time: string) => {
  const [hours, mins] = time.split(":");
  return +hours * 60 * 60 + +mins * 60;
};

export const secondsToTime = (seconds: number) => {
  const hours = Math.floor(seconds / 60 / 60);
  const mins = seconds / 60 - hours * 60;

  const hoursStr = hours.toString().padStart(2, "0");
  const minsStr = mins.toString().padStart(2, "0");

  return `${hoursStr}:${minsStr}`;
};

export const getExternalUrl = (fromId: string, toId: string, date: string) => {
  return externalScheduleUrl
    .replace(":fromId", fromId)
    .replace(":toId", toId)
    .replace(":date", date);
};
