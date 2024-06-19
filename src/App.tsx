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
      <hr />
      <br />
      <u>В Киев:</u>
      <br />
      <br />
      <ScheduleTableBackComponent data={dataBack} />
    </div>
  );
}

export default App;
