import * as React from "react";
import styled from "styled-components";
import { isInPast, secondsToTime } from "../helpers/utils";
import {
  Entry,
  MergedSchedule,
  MergedScheduleItem,
  TransferType,
} from "../types";
import { getExternalStopNames } from "../helpers/data";
import {
  externalInfoUrl,
  fastTransferSec,
  slowTransferSec,
} from "../helpers/constants";

const TransferInfo = styled.span<{ isHighligted?: boolean }>`
  font-size: 0.75rem;
  ${({ isHighligted }) => `${isHighligted && "color: red;"}`};
`;

const renderTimeCell = (timeSec?: number) => {
  if (!timeSec) {
    return "";
  }

  return secondsToTime(timeSec);
};

const renderTransferInfo = (
  row: MergedScheduleItem,
  internalStopType: "middle" | "end"
) => {
  const {
    transferType,
    transferTimeSec,
    externalScheduleRow,
    internalScheduleRow,
  } = row;

  if (!transferTimeSec) {
    return <></>;
  }

  if (
    (transferType === "middleToStart" && internalStopType === "middle") ||
    (transferType === "endToMiddle" && internalStopType === "end")
  ) {
    const isHighlighted =
      transferTimeSec <= fastTransferSec || transferTimeSec >= slowTransferSec;
    return (
      <span>
        →
        <TransferInfo isHighligted={isHighlighted}>
          {transferTimeSec / 60} мин
        </TransferInfo>
      </span>
    );
  }
};

const StyledTr = styled.tr<{ isInPast: boolean }>`
  color: black;
  ${({ isInPast }) => (isInPast ? "opacity: .2" : "opacity: 1")};
`;

const StyledTh = styled.th`
  padding: 1rem 0.25rem;
  text-align: center;
`;

const StyledTd = styled.td`
  padding: 0.25rem 2rem;
`;

const BorderTd = styled.td`
  width: 1px;
  border-left: 1px solid black;
  padding-right: 1rem;
`;

const InfoLink = styled.a`
  color: red;
  text-decoration: none;
`;

type Props = {
  data?: MergedSchedule;
};

export const ScheduleTable: React.FC<Props> = ({ data }) => {
  const { internalScheduleRow } =
    data?.find(({ internalScheduleRow }) => internalScheduleRow) || {};

  if (!data) {
    return <>no data</>;
  }

  const externalStopNames = getExternalStopNames([data[0].externalScheduleRow]);
  const internalStopNames =
    internalScheduleRow && getExternalStopNames([internalScheduleRow]);

  return (
    <>
      <table>
        <thead>
          <StyledTh>Номер</StyledTh>

          <BorderTd />

          <StyledTh>{internalStopNames?.start}</StyledTh>
          <StyledTh>{internalStopNames?.middle}</StyledTh>
          <StyledTh>{internalStopNames?.end}</StyledTh>

          <BorderTd />

          <StyledTh>{externalStopNames.start}</StyledTh>
          <StyledTh>{externalStopNames.middle}</StyledTh>
          <StyledTh>{externalStopNames.end}</StyledTh>
        </thead>
        <tbody>
          {data.map((item) => {
            const {
              externalScheduleRow: external,
              internalScheduleRow: internal,
            } = item;
            return (
              <StyledTr
                isInPast={
                  external.startTimeSec
                    ? isInPast(external.startTimeSec)
                    : isInPast(external.middleTimeSec)
                }
              >
                <StyledTd>
                  {external.infoUrl ? (
                    <InfoLink
                      href={externalInfoUrl.replace(":href", external.infoUrl)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {external.number}
                    </InfoLink>
                  ) : (
                    external.number
                  )}
                </StyledTd>

                <BorderTd />

                <StyledTd>{renderTimeCell(internal?.startTimeSec)} </StyledTd>
                <StyledTd>
                  <>
                    {renderTimeCell(internal?.middleTimeSec)}{" "}
                    {renderTransferInfo(item, "middle")}
                  </>
                </StyledTd>
                <StyledTd>
                  {renderTimeCell(internal?.endTimeSec)}{" "}
                  {renderTransferInfo(item, "end")}
                </StyledTd>

                <BorderTd />

                <StyledTd>{renderTimeCell(external.startTimeSec)}</StyledTd>
                <StyledTd>{renderTimeCell(external.middleTimeSec)}</StyledTd>
                <StyledTd>{renderTimeCell(external.endTimeSec)}</StyledTd>
              </StyledTr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export const ScheduleTableBack: React.FC<Props> = ({ data }) => {
  const { internalScheduleRow } =
    data?.find(({ internalScheduleRow }) => internalScheduleRow) || {};

  if (!data) {
    return <>no data</>;
  }

  const externalStopNames = getExternalStopNames(
    data.map(({ externalScheduleRow }) => externalScheduleRow)
  );
  const internalStopNames =
    internalScheduleRow && getExternalStopNames([internalScheduleRow]);

  return (
    <>
      <table>
        <thead>
          <StyledTh>Номер</StyledTh>

          <BorderTd />

          <StyledTh>{externalStopNames.start}</StyledTh>
          <StyledTh>{externalStopNames.middle}</StyledTh>
          <StyledTh>{externalStopNames.end}</StyledTh>

          <BorderTd />

          <StyledTh>{internalStopNames?.start}</StyledTh>
          <StyledTh>{internalStopNames?.middle}</StyledTh>
          <StyledTh>{internalStopNames?.end}</StyledTh>
        </thead>

        <tbody>
          {data.map((item) => {
            const {
              externalScheduleRow: external,
              internalScheduleRow: internal,
            } = item;
            return (
              <StyledTr
                isInPast={
                  external.startTimeSec
                    ? isInPast(external.startTimeSec)
                    : isInPast(external.middleTimeSec)
                }
              >
                <StyledTd>
                  {external.infoUrl ? (
                    <InfoLink
                      href={externalInfoUrl.replace(":href", external.infoUrl)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {external.number}
                    </InfoLink>
                  ) : (
                    external.number
                  )}
                </StyledTd>

                <BorderTd />

                <StyledTd>{renderTimeCell(external.startTimeSec)} </StyledTd>
                <StyledTd>
                  <>
                    {renderTimeCell(external.middleTimeSec)}{" "}
                    {renderTransferInfo(item, "middle")}
                  </>
                </StyledTd>
                <StyledTd>
                  {renderTimeCell(external.endTimeSec)}{" "}
                  {renderTransferInfo(item, "end")}
                </StyledTd>

                <BorderTd />

                <StyledTd>{renderTimeCell(internal?.startTimeSec)}</StyledTd>
                <StyledTd>{renderTimeCell(internal?.middleTimeSec)}</StyledTd>
                <StyledTd>{renderTimeCell(internal?.endTimeSec)}</StyledTd>
              </StyledTr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

// HERE:

// Make ScheduleTable and (if possible) mergeSchedule() reusable
