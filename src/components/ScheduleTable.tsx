import * as React from "react";
import styled from "styled-components";
import { isInPast, secondsToTime } from "../helpers/utils";
import { Entry } from "../types";
import { getStopNames } from "../helpers/data";

const renderTimeCell = (timeSec: number) => {
  if (!timeSec) {
    return "";
  }

  return secondsToTime(timeSec);
};

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

type Props = {
  data?: Array<Entry>;
};

export const ScheduleTable: React.FC<Props> = ({ data }) => {
  if (!data) {
    return <>no data</>;
  }

  const stopNames = getStopNames(data);

  return (
    <>
      <StyledTable>
        <thead>
          <th>Номер</th>
          <th>{stopNames.start}</th>
          <th>{stopNames.middle}</th>
          <th>{stopNames.end}</th>
        </thead>
        <tbody>
          {data.map((item) => (
            <StyledTr
              isInPast={
                item.startTimeSec
                  ? isInPast(item.startTimeSec)
                  : isInPast(item.middleTimeSec)
              }
            >
              <td>{item.number}</td>
              <td>{renderTimeCell(item.startTimeSec)}</td>
              <td>{renderTimeCell(item.middleTimeSec)}</td>
              <td>{renderTimeCell(item.endTimeSec)}</td>
            </StyledTr>
          ))}
        </tbody>
      </StyledTable>
    </>
  );
};
