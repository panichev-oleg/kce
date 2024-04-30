import * as React from "react";
import styled from "styled-components";
import { isInPast, secondsToTime } from "../helpers/utils";
import { Entry } from "../types";
import { getStopNames } from "../helpers/data";
import { externalInfoUrl } from "../helpers/constants";

const renderTimeCell = (timeSec: number) => {
  if (!timeSec) {
    return "";
  }

  return secondsToTime(timeSec);
};

const StyledTr = styled.tr<{ isInPast: boolean }>`
  ${({ isInPast }) => (isInPast ? "color: lightgray" : "color: black")}
`;

const StyledTh = styled.th`
  padding: 1rem 0;
`;

const StyledTd = styled.td`
  padding: 0.25rem 2rem;
`;

const InfoTd = styled(StyledTd)`
  padding: 0.25rem 0;

  a {
    color: red;
    text-decoration: none;
  }
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
      <table>
        <thead>
          <StyledTh>Номер</StyledTh>
          <StyledTh>{stopNames.start}</StyledTh>
          <StyledTh>{stopNames.middle}</StyledTh>
          <StyledTh>{stopNames.end}</StyledTh>
          <StyledTh></StyledTh>
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
              <StyledTd>{item.number}</StyledTd>
              <StyledTd>{renderTimeCell(item.startTimeSec)}</StyledTd>
              <StyledTd>{renderTimeCell(item.middleTimeSec)}</StyledTd>
              <StyledTd>{renderTimeCell(item.endTimeSec)}</StyledTd>
              <InfoTd>
                {item.infoUrl && (
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={externalInfoUrl.replace(":href", item.infoUrl)}
                  >
                    !
                  </a>
                )}
              </InfoTd>
            </StyledTr>
          ))}
        </tbody>
      </table>
    </>
  );
};
