/**
 * TODO:
 *
 * 1. Link from internal route number
 * 2. Link from external route number
 * 3. New parser for external schedule
 */

import React from "react";
import "./App.css";
import { ScheduleTable, ScheduleTableBack } from "./components/ScheduleTable";
import { AppStatus, InternalDirection, MergedSchedule } from "./types";
import {
  getExternalBackSchedule,
  getExternalSchedule,
  getInternalSchedule,
  mergeSchedule,
  mergeScheduleBack,
} from "./helpers/data";
import {
  ScheduleTableBackCompact,
  ScheduleTableCompact,
} from "./components/ScheduleTableCompact";
import { Collapsible } from "./components/Collapsible";
import {
  externalFinishStationId,
  externalFinishStationName,
  externalMiddleStationId,
  externalMiddleStationName,
  externalStartStationId,
  externalStartStationName,
  internalFinishStationName,
  internalStartStationName,
} from "./helpers/constants";
import { getExternalUrl, getInternalUrl } from "./helpers/utils";
import { UnstyledLink, Link, ScheduleList } from "./components/shared";
import { ArrowLeft, ArrowRight } from "./components/Arrow";
import { DatePicker } from "./components/DatePicker";

function App() {
  const [data, setData] = React.useState<MergedSchedule>();
  const [dataBack, setDataBack] = React.useState<MergedSchedule>();
  const [isCompactView, setIsCompactView] = React.useState(true);
  const [date, setDate] = React.useState(new Date());
  const [status, setStatus] = React.useState<AppStatus>("loading");

  const gotoNextDay = (e: React.MouseEvent) => {
    e.preventDefault();
    setDate((date) => new Date(date.getTime() + 24 * 60 * 60 * 1000));
  };

  const gotoPrevDay = (e: React.MouseEvent) => {
    e.preventDefault();
    setDate((date) => new Date(date.getTime() - 24 * 60 * 60 * 1000));
  };

  const viewDate = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

  React.useEffect(() => {
    setStatus("loading");
    (async () => {
      try {
        const externalSchedule = await getExternalSchedule(viewDate);
        const externalScheduleBack = await getExternalBackSchedule(viewDate);

        const internalSchedule = await getInternalSchedule(viewDate, false);
        const internalScheduleBack = await getInternalSchedule(viewDate, true);

        const mergedSchedule = mergeSchedule(
          internalSchedule,
          externalSchedule
        );
        setData(mergedSchedule);

        const mergedScheduleBack = mergeScheduleBack(
          internalScheduleBack,
          externalScheduleBack
        );
        setDataBack(mergedScheduleBack);
        setStatus("loaded");
      } catch (e) {
        setStatus("error");
        setData(undefined);
        setDataBack(undefined);
      }
    })();
  }, [viewDate]);

  const ScheduleTableComponent = isCompactView
    ? ScheduleTableCompact
    : ScheduleTable;
  const ScheduleTableBackComponent = isCompactView
    ? ScheduleTableBackCompact
    : ScheduleTableBack;

  return (
    <div className="App">
      {status === "loading" && (data || dataBack) && (
        <div className="App-loader-overlay">
          <div className="App-loader-spinner" />
        </div>
      )}
      <h2>KCE</h2>
      <UnstyledLink href="#" onClick={gotoPrevDay}>
        <ArrowLeft />
      </UnstyledLink>

      <DatePicker date={date} onChange={setDate} />

      <UnstyledLink href="#" onClick={gotoNextDay}>
        <ArrowRight />
      </UnstyledLink>

      <br />
      <br />
      <label>
        <input
          type="checkbox"
          checked={isCompactView}
          onChange={(e) => setIsCompactView(e.target.checked)}
        />{" "}
        Компактный вид
      </label>
      <br />
      <br />
      <u>Из Киева:</u>
      <br />
      <br />

      {status === "error" ? (
        <>
          {"Не удалось получить данные"}
          <br />
        </>
      ) : (
        <ScheduleTableComponent data={data} date={date} />
      )}

      <br />
      <Collapsible title="Посмотреть полное расписание">
        <ScheduleList>
          <li>
            <Link
              href={getInternalUrl(InternalDirection.FORWARD, viewDate)}
              target="_blank"
              rel="noreferrer"
            >
              Городская электричка ({internalStartStationName} -{" "}
              {internalFinishStationName})
            </Link>
          </li>
          <li>
            <Link
              target="_blank"
              rel="noreferrer"
              href={getExternalUrl(
                externalStartStationId,
                externalFinishStationId,
                viewDate
              )}
            >
              Электричка ({externalStartStationName} -{" "}
              {externalFinishStationName})
            </Link>
          </li>
          <li>
            <Link
              target="_blank"
              rel="noreferrer"
              href={getExternalUrl(
                externalMiddleStationId,
                externalFinishStationId,
                viewDate
              )}
            >
              Электричка ({externalMiddleStationName} -{" "}
              {externalFinishStationName})
            </Link>
          </li>
        </ScheduleList>
      </Collapsible>
      <br />
      <hr />
      <br />
      <u>В Киев:</u>
      <br />
      <br />

      {status === "error" ? (
        <>
          {"Не удалось получить данные"}
          <br />
        </>
      ) : (
        <ScheduleTableBackComponent data={dataBack} date={date} />
      )}

      <br />
      <Collapsible title="Посмотреть полное расписание">
        <ScheduleList>
          <li>
            <Link
              href={getInternalUrl(InternalDirection.BACK, viewDate)}
              target="_blank"
              rel="noreferrer"
            >
              Городская электричка ({internalFinishStationName} -{" "}
              {internalStartStationName})
            </Link>
          </li>
          <li>
            <Link
              target="_blank"
              rel="noreferrer"
              href={getExternalUrl(
                externalFinishStationId,
                externalStartStationId,
                viewDate
              )}
            >
              Электричка ({externalFinishStationName} -{" "}
              {externalStartStationName})
            </Link>
          </li>
          <li>
            <Link
              target="_blank"
              rel="noreferrer"
              href={getExternalUrl(
                externalFinishStationId,
                externalMiddleStationId,
                viewDate
              )}
            >
              Электричка ({externalFinishStationName} -{" "}
              {externalMiddleStationName})
            </Link>
          </li>
        </ScheduleList>
      </Collapsible>
      <br />
    </div>
  );
}

export default App;
