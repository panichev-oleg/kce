import * as React from "react";
import {
  externalMiddleStationId,
  externalFinishStationId,
  externalTableParretn,
} from "../helpers/constants";
import { HTMLToJSON } from "html-to-json-parser";
import { JSONContent } from "html-to-json-parser/dist/types";
import styled from "styled-components";

const StyledTable = styled.table`
  th {
    padding: 1rem 0;
  }
  td {
    padding: 0.25rem 2rem;
  }
`;

const StyledTr = styled.tr<{ isInPast: boolean }>`
  ${({ isInPast }) => (isInPast ? "color: lightgray" : "color: black")}
`;

type Entry = {
  number: string;
  start: string;
  middle?: string;
  end: string;
  startTimeSec: number;
  middleTimeSec?: number;
  endTimeSec: number;
};

const isInPast = (seconds: number) => {
  const now = new Date();
  const secondsNow = now.getHours() * 60 * 60 + now.getMinutes() * 60;
  return seconds < secondsNow;
};

const timeToSeconds = (time: string) => {
  const [hours, mins] = time.split(":");
  return +hours * 60 * 60 + +mins * 60;
};

const secondsToTime = (seconds: number) => {
  const hours = Math.floor(seconds / 60 / 60);
  const mins = seconds / 60 - hours * 60;

  const hoursStr = hours.toString().padStart(2, "0");
  const minsStr = mins.toString().padStart(2, "0");

  return `${hoursStr}:${minsStr}`;
};

const parseData = (json: JSONContent) => {
  console.clear();
  const result: Array<Entry> = [];

  json.content.forEach((item, idx) => {
    const row = item as JSONContent;
    if (
      idx < 6 ||
      row.type !== "tr" ||
      /* @ts-ignore */
      !["on", "onx"].includes(row.attributes?.class)
    ) {
      return;
    }

    // console.log("row", row);

    const entry: Entry = {
      /* @ts-ignore */
      number: row.content[1].content[0].content[1].content[0],
      /* @ts-ignore */
      start: row.content[9].content[0].content[0].content[0],
      /* @ts-ignore */
      startTimeSec: timeToSeconds(row.content[11].content[0]),
      /* @ts-ignore */
      end: row.content[15].content[0].content[0].content[0],
      /* @ts-ignore */
      endTimeSec: timeToSeconds(row.content[17].content[0]),
    };
    // console.log("entry", entry);
    result.push(entry);
  });

  return result;
};

export const ScheduleTable = () => {
  const [json, setJson] = React.useState<string | JSONContent>("");
  const [html, setHtml] = React.useState("");
  const [data, setData] = React.useState<Array<Entry>>();

  const date = new Date().toISOString().split("T")[0];
  const url = `${process.env.PUBLIC_URL}/static/eltrain_from_${externalMiddleStationId}_to_${externalFinishStationId}_date_${date}.txt`;

  React.useEffect(() => {
    (async () => {
      const response = await fetch(url);
      const html = await response.text();
      setHtml(html);
      const table = html.match(externalTableParretn)?.[0] || "";
      const json = await HTMLToJSON(table);
      setJson(json);
      const data = parseData(json as JSONContent);
      console.log("data", data);
      setData(data);
    })();
  }, [url]);

  if (!data) {
    return <>no data</>;
  }

  return (
    <>
      Дата: {date}
      <StyledTable>
        <thead>
          <th>Номер</th>
          <th>{data[0].start}</th>
          <th>{data[0].end}</th>
        </thead>
        <tbody>
          {data.map((item) => (
            <StyledTr isInPast={isInPast(item.startTimeSec)}>
              <td>{item.number}</td>
              <td>{secondsToTime(item.startTimeSec)}</td>
              <td>{secondsToTime(item.endTimeSec)}</td>
              <td>{isInPast(item.startTimeSec)}</td>
            </StyledTr>
          ))}
        </tbody>
      </StyledTable>
    </>
  );
};
