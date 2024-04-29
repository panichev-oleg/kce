import { JSONContent } from "html-to-json-parser/dist/types";
import { Entry } from "../types";
import { HTMLToJSON } from "html-to-json-parser";
import { externalTablePattern } from "./constants";
import { timeToSeconds } from "./utils";

const parseExternalData = (json: JSONContent) => {
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
      endTimeSec: timeToSeconds(row.content[13].content[0]),
    };

    result.push(entry);
  });

  return result;
};

export const getExternalData = async (
  fromId: number,
  toId: number,
  date: string
) => {
  const url = `${process.env.PUBLIC_URL}/static/eltrain_from_${fromId}_to_${toId}_date_${date}.txt`;

  const response = await fetch(url);
  const html = await response.text();
  const table = html.match(externalTablePattern)?.[0] || "";
  const json = await HTMLToJSON(table);
  const data = parseExternalData(json as JSONContent);

  return data;
};
