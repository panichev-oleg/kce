import React from "react";
import "./App.css";
import { ScheduleTable, ScheduleTableBack } from "./components/ScheduleTable";
import { MergedSchedule } from "./types";
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
  internalBackUrl,
  internalFinishStationName,
  internalStartStationName,
  internalUrl,
} from "./helpers/constants";
import { getExternalUrl } from "./helpers/utils";
import { Link, ScheduleList } from "./components/shared";

function App() {
  const [data, setData] = React.useState<MergedSchedule>();
  const [dataBack, setDataBack] = React.useState<MergedSchedule>();
  const [isCompactView, setIsCompactView] = React.useState(true);

  const date = new Date().toISOString().split("T")[0];

  React.useEffect(() => {
    (async () => {
      const externalSchedule = await getExternalSchedule(date);
      const externalScheduleBack = await getExternalBackSchedule(date);

      const internalSchedule = await getInternalSchedule(date, false);
      const internalScheduleBack = await getInternalSchedule(date, true);

      const mergedSchedule = mergeSchedule(internalSchedule, externalSchedule);
      setData(mergedSchedule);

      const mergedScheduleBack = mergeScheduleBack(
        internalScheduleBack,
        externalScheduleBack
      );
      setDataBack(mergedScheduleBack);
    })();
  }, [date]);

  const ScheduleTableComponent = isCompactView
    ? ScheduleTableCompact
    : ScheduleTable;
  const ScheduleTableBackComponent = isCompactView
    ? ScheduleTableBackCompact
    : ScheduleTableBack;

  return (
    <div className="App">
      <h2>KCE</h2>
      <u>Дата: {date}</u>
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
      <ScheduleTableComponent data={data} />
      <br />
      <Collapsible title="Посмотреть полное расписание">
        <ScheduleList>
          <li>
            <Link href={internalUrl} target="_blank" rel="noreferrer">
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
                date
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
                date
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
      <ScheduleTableBackComponent data={dataBack} />
      <br />
      <Collapsible title="Посмотреть полное расписание">
        <ScheduleList>
          <li>
            <Link href={internalBackUrl} target="_blank" rel="noreferrer">
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
                date
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
                date
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
