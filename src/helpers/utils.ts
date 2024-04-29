export const isInPast = (seconds: number) => {
  const now = new Date();
  const secondsNow = now.getHours() * 60 * 60 + now.getMinutes() * 60;
  return seconds < secondsNow;
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
