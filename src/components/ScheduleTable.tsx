import * as React from "react";
import {
  externalURL,
  externalStartStationId,
  externalFinishStationId,
} from "../helpers/constants";
// import { content } from "../static/text";/

const { href } = window.location;

export const ScheduleTable = () => {
  const [data, setData] = React.useState("");

  const date = new Date().toISOString().split("T")[0];
  const url = `${href}static/eltrain_from_${externalStartStationId}_to_${externalFinishStationId}_date_${date}.txt`;

  React.useEffect(() => {
    fetch(url)
      .then((data) => data.text())
      .then(setData);
  }, [url]);

  // console.log("content", content);

  return (
    <>
      <div>ScheduleTable {url}</div>
      <div dangerouslySetInnerHTML={{ __html: data }} />
    </>
  );
};
