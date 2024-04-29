import React from "react";
import "./App.css";
import { ScheduleTable } from "./components/ScheduleTable";
import { Entry } from "./types";
import { getExternalData } from "./helpers/data";
import {
  externalFinishStationId,
  externalMiddleStationId,
  // externalStartStationId,
} from "./helpers/constants";

function App() {
  const [data, setData] = React.useState<Array<Entry>>();
  const [dataBack, setDataBack] = React.useState<Array<Entry>>();

  const date = new Date().toISOString().split("T")[0];

  React.useEffect(() => {
    (async () => {
      const data = await getExternalData(
        externalMiddleStationId,
        externalFinishStationId,
        date
      );
      setData(data);

      const dataBack = await getExternalData(
        externalFinishStationId,
        externalMiddleStationId,
        date
      );

      setDataBack(dataBack);
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
      <br />
      <u>В Киев:</u>
      <br />
      <br />
      <ScheduleTable data={dataBack} />
    </div>
  );
}

export default App;
