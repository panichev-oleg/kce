import * as React from "react";
import styled from "styled-components";
import { isInPast, secondsToTime } from "../helpers/utils";
import { Entry } from "../types";

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

  return (
    <>
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
            </StyledTr>
          ))}
        </tbody>
      </StyledTable>
    </>
  );
};
