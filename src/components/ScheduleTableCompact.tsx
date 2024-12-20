import * as React from "react";
import styled from "styled-components";
import { isInPast, secondsToTime } from "../helpers/utils";
import { MergedSchedule, MergedScheduleItem } from "../types";
import { getExternalStopNames } from "../helpers/data";
import {
  externalInfoUrl,
  fastTransferSec,
  slowTransferSec,
} from "../helpers/constants";

const TransferInfoContainer = styled.span`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TransferInfo = styled.span<{ isHighlighted?: boolean }>`
  font-size: 0.7rem;
  white-space: nowrap;
  ${({ isHighlighted }) => `${isHighlighted && "color: red;"}`};
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
  const { transferType, transferTimeSec } = row;

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
      <TransferInfoContainer>
        ⟶
        <TransferInfo isHighlighted={isHighlighted}>
          {transferTimeSec / 60} мин
        </TransferInfo>
      </TransferInfoContainer>
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
  padding: 0.25rem 0.5rem;
  vertical-align: top;
`;

const TransferContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const InfoLink = styled.a`
  color: red;
  text-decoration: none;
  font-weight: bold;
  white-space: nowrap;
`;

type Props = {
  data?: MergedSchedule;
  date: Date;
};

export const ScheduleTableCompact: React.FC<Props> = ({ data, date }) => {
  const { internalScheduleRow } =
    data?.find(({ internalScheduleRow }) => internalScheduleRow) || {};

  if (!data) {
    return <>Загрузка расписания...</>;
  }

  const externalStopNames = getExternalStopNames([data[0].externalScheduleRow]);
  const internalStopNames =
    internalScheduleRow && getExternalStopNames([internalScheduleRow]);

  return (
    <>
      <table>
        <thead>
          <StyledTh>Номер</StyledTh>

          <StyledTh>{internalStopNames?.start}</StyledTh>
          <StyledTh>{internalStopNames?.middle}</StyledTh>
          <StyledTh>{internalStopNames?.end}</StyledTh>

          <StyledTh>{externalStopNames.end}</StyledTh>
        </thead>
        <tbody>
          {data.map((item) => {
            const {
              externalScheduleRow: external,
              internalScheduleRow: internal,
            } = item;

            const dayStartOfDay = new Date(date.getTime());
            dayStartOfDay.setHours(0, 0, 0, 0);

            const startTimeSec =
              internal?.startTimeSec ||
              external.startTimeSec ||
              external.middleTimeSec;

            const startFullDateSec =
              dayStartOfDay.getTime() + startTimeSec * 1000;

            return (
              <StyledTr isInPast={isInPast(startFullDateSec)}>
                <StyledTd>
                  {external.infoUrl ? (
                    <InfoLink
                      href={externalInfoUrl.replace(":href", external.infoUrl)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {external.number} (!)
                    </InfoLink>
                  ) : (
                    external.number
                  )}
                  {" / "}
                  {internal?.number || "—"}
                </StyledTd>

                <StyledTd>{renderTimeCell(internal?.startTimeSec)} </StyledTd>

                <StyledTd>
                  <TransferContainer>
                    {renderTimeCell(internal?.middleTimeSec)}
                    {!!external.startTimeSec && (
                      <>
                        {renderTransferInfo(item, "middle")}
                        {renderTimeCell(external.startTimeSec)}
                      </>
                    )}
                  </TransferContainer>
                </StyledTd>

                <StyledTd>
                  <TransferContainer>
                    {renderTimeCell(
                      !external.startTimeSec && !!external.middleTimeSec
                        ? internal?.endTimeSec
                        : external.middleTimeSec
                    )}
                    {!external.startTimeSec && !!external.middleTimeSec && (
                      <>
                        {renderTransferInfo(item, "end")}
                        {renderTimeCell(external.middleTimeSec)}
                      </>
                    )}
                  </TransferContainer>
                </StyledTd>

                <StyledTd>{renderTimeCell(external.endTimeSec)}</StyledTd>
              </StyledTr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export const ScheduleTableBackCompact: React.FC<Props> = ({ data, date }) => {
  const { internalScheduleRow } =
    data?.find(({ internalScheduleRow }) => internalScheduleRow) || {};

  if (!data) {
    return <>Загрузка расписания...</>;
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

          <StyledTh>{externalStopNames.start}</StyledTh>
          <StyledTh>{externalStopNames.middle}</StyledTh>
          <StyledTh>{externalStopNames.end}</StyledTh>

          <StyledTh>{internalStopNames?.end}</StyledTh>
        </thead>

        <tbody>
          {data.map((item) => {
            const {
              externalScheduleRow: external,
              internalScheduleRow: internal,
            } = item;

            const dayStartOfDay = new Date(date.getTime());
            dayStartOfDay.setHours(0, 0, 0, 0);

            const startTimeSec = external.startTimeSec;
            const startFullDateSec =
              dayStartOfDay.getTime() + startTimeSec * 1000;

            return (
              <StyledTr isInPast={isInPast(startFullDateSec)}>
                <StyledTd>
                  {external.infoUrl ? (
                    <InfoLink
                      href={externalInfoUrl.replace(":href", external.infoUrl)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {external.number} (!)
                    </InfoLink>
                  ) : (
                    external.number
                  )}
                  {" / "}
                  {internal?.number || "—"}
                </StyledTd>

                <StyledTd>{renderTimeCell(external.startTimeSec)} </StyledTd>

                <StyledTd>
                  <TransferContainer>
                    {renderTimeCell(external.middleTimeSec)}
                    {!!external.middleTimeSec && !external.endTimeSec && (
                      <>
                        {renderTransferInfo(item, "middle")}
                        {renderTimeCell(internal?.startTimeSec)}
                      </>
                    )}
                  </TransferContainer>
                </StyledTd>

                <StyledTd>
                  <TransferContainer>
                    {renderTimeCell(
                      external.endTimeSec || internal?.middleTimeSec
                    )}
                    {!!external.endTimeSec && (
                      <>
                        {renderTransferInfo(item, "end")}
                        {renderTimeCell(internal?.middleTimeSec)}
                      </>
                    )}
                  </TransferContainer>
                </StyledTd>

                <StyledTd>{renderTimeCell(internal?.endTimeSec)}</StyledTd>
              </StyledTr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

// Make ScheduleTable and (if possible) mergeSchedule() reusable
