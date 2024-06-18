import React from "react";
import "./App.css";
import { ScheduleTable, ScheduleTableBack } from "./components/ScheduleTable";
import { Entry, MergedSchedule } from "./types";
import {
  getExternalBackSchedule,
  getExternalSchedule,
  getInternalSchedule,
  mergeSchedule,
  mergeScheduleBack,
} from "./helpers/data";

function App() {
  const [data, setData] = React.useState<MergedSchedule>();
  const [dataBack, setDataBack] = React.useState<MergedSchedule>();

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

  return (
    <div className="App">
      <h2>KCE</h2>
      <u>Дата: {date}</u>
      <br />
      <br />
      <u>Из Киева:</u>
      <br />
      <br />
      <ScheduleTable data={data} />
      <br />
      <a
        href="https://docs.google.com/spreadsheets/u/0/d/e/2PACX-1vRXpHpl4haRkvPX3UxrurO7U-Bt0iAjdrAv1adBTEsOryZCcfOxOP809ETCSrdpF88PocTONiRg3ycZ/pubhtml/sheet?headers=false&gid=433390657&range=A1:Z23"
        target="_blank"
        rel="noreferrer"
      >
        Розклад руху міської електрички. Маршрут: Е2 (за годинниковою стрілкою)
      </a>
      <br />
      <br />
      <hr />
      <br />
      <u>В Киев:</u>
      <br />
      <br />
      <ScheduleTableBack data={dataBack} />
      <br />
      <a
        href="https://docs.google.com/spreadsheets/u/0/d/e/2PACX-1vRXpHpl4haRkvPX3UxrurO7U-Bt0iAjdrAv1adBTEsOryZCcfOxOP809ETCSrdpF88PocTONiRg3ycZ/pubhtml/sheet?headers=false&gid=28169577&range=A1:Z23"
        target="_blank"
        rel="noreferrer"
      >
        Розклад руху міської електрички. Маршрут: Е1 (проти годинникової
        стрілки)
      </a>
      <br />
      <br />
    </div>
  );
}

export default App;
