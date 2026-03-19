import React from "react";
import {
  getExternalBackSchedule,
  getExternalSchedule,
  getInternalSchedule,
  mergeSchedule,
  mergeScheduleBack,
} from "../helpers/data";
import { schedulePrefetchDaysCount } from "../helpers/constants";
import {
  AppStatus,
  InFlightScheduleRequests,
  ScheduleCache,
  UseScheduleDataResult,
} from "../types";

export const formatScheduleDate = (value: Date) =>
  [
    value.getFullYear(),
    String(value.getMonth() + 1).padStart(2, "0"),
    String(value.getDate()).padStart(2, "0"),
  ].join("-");

const fetchScheduleForDate = async (targetDate: string) => {
  const [
    externalSchedule,
    externalScheduleBack,
    internalSchedule,
    internalScheduleBack,
  ] = await Promise.all([
    getExternalSchedule(targetDate),
    getExternalBackSchedule(targetDate),
    getInternalSchedule(targetDate, false),
    getInternalSchedule(targetDate, true),
  ]);

  return {
    data: mergeSchedule(internalSchedule, externalSchedule),
    dataBack: mergeScheduleBack(internalScheduleBack, externalScheduleBack),
  };
};

export const useScheduleData = (date: Date): UseScheduleDataResult => {
  const [data, setData] = React.useState<UseScheduleDataResult["data"]>();
  const [dataBack, setDataBack] =
    React.useState<UseScheduleDataResult["dataBack"]>();
  const [status, setStatus] = React.useState<AppStatus>("loading");
  const [scheduleCache, setScheduleCache] = React.useState<ScheduleCache>({});
  const scheduleCacheRef = React.useRef<ScheduleCache>(scheduleCache);
  const inFlightRequestsRef = React.useRef<InFlightScheduleRequests>({});
  const viewDate = formatScheduleDate(date);

  React.useEffect(() => {
    scheduleCacheRef.current = scheduleCache;
  }, [scheduleCache]);

  const loadScheduleForDate = React.useCallback((targetDate: string) => {
    const cachedEntry = scheduleCacheRef.current[targetDate];

    if (cachedEntry?.status === "loaded" || cachedEntry?.status === "error") {
      return Promise.resolve();
    }

    if (inFlightRequestsRef.current[targetDate]) {
      return inFlightRequestsRef.current[targetDate];
    }

    setScheduleCache((prev) => ({
      ...prev,
      [targetDate]: {
        ...prev[targetDate],
        status: "loading",
      },
    }));

    const request = fetchScheduleForDate(targetDate)
      .then(({ data, dataBack }) => {
        setScheduleCache((prev) => ({
          ...prev,
          [targetDate]: {
            status: "loaded",
            data,
            dataBack,
          },
        }));
      })
      .catch(() => {
        setScheduleCache((prev) => ({
          ...prev,
          [targetDate]: {
            status: "error",
          },
        }));
      })
      .finally(() => {
        delete inFlightRequestsRef.current[targetDate];
      });

    inFlightRequestsRef.current[targetDate] = request;

    return request;
  }, []);

  React.useEffect(() => {
    const currentDateEntry = scheduleCache[viewDate];

    if (!currentDateEntry) {
      setStatus("loading");
      void loadScheduleForDate(viewDate);
      return;
    }

    if (currentDateEntry.status === "loaded") {
      setData(currentDateEntry.data);
      setDataBack(currentDateEntry.dataBack);
      setStatus("loaded");
      return;
    }

    if (currentDateEntry.status === "error") {
      setData(undefined);
      setDataBack(undefined);
      setStatus("error");
      return;
    }

    setStatus("loading");
    void loadScheduleForDate(viewDate);
  }, [loadScheduleForDate, scheduleCache, viewDate]);

  React.useEffect(() => {
    if (scheduleCache[viewDate]?.status !== "loaded") {
      return;
    }

    Array.from({ length: schedulePrefetchDaysCount }, (_, idx) => idx + 1).forEach(
      (dayOffset) => {
        const prefetchedDate = new Date(date);
        prefetchedDate.setDate(prefetchedDate.getDate() + dayOffset);
        void loadScheduleForDate(formatScheduleDate(prefetchedDate));
      },
    );
  }, [date, loadScheduleForDate, scheduleCache, viewDate]);

  return {
    data,
    dataBack,
    status,
    viewDate,
  };
};
