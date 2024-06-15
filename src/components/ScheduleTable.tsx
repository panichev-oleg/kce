import * as React from "react";
import styled from "styled-components";
import { isInPast, secondsToTime } from "../helpers/utils";
import { Entry } from "../types";
import { getExternalStopNames } from "../helpers/data";
import { externalInfoUrl } from "../helpers/constants";

const renderTimeCell = (timeSec: number) => {
  if (!timeSec) {
    return "";
  }

  return secondsToTime(timeSec);
};

const StyledTr = styled.tr<{ isInPast: boolean }>`
  color: black;
  ${({ isInPast }) => (isInPast ? "opacity: .2" : "opacity: 1")};
`;

const StyledTh = styled.th`
  padding: 1rem 0;
`;

const StyledTd = styled.td`
  padding: 0.25rem 2rem;
`;

const InfoLink = styled.a`
  color: red;
  text-decoration: none;
`;

type Props = {
  data?: Array<Entry>;
};

export const ScheduleTable: React.FC<Props> = ({ data }) => {
  if (!data) {
    return <>no data</>;
  }

  const stopNames = getExternalStopNames(data);

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
              <StyledTd>
                {item.infoUrl ? (
                  <InfoLink
                    href={externalInfoUrl.replace(":href", item.infoUrl)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {item.number}
                  </InfoLink>
                ) : (
                  item.number
                )}
              </StyledTd>

              <StyledTd>{renderTimeCell(item.startTimeSec)}</StyledTd>
              <StyledTd>{renderTimeCell(item.middleTimeSec)}</StyledTd>
              <StyledTd>{renderTimeCell(item.endTimeSec)}</StyledTd>
            </StyledTr>
          ))}
        </tbody>
      </table>
    </>
  );
};
