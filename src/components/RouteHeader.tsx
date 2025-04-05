import * as React from "react";
import styled from "styled-components";
import { MergedScheduleItem } from "../types";
import { Link } from "./shared";
import { getSingleRouteUrl } from "../helpers/utils";

const InfoLink = styled.a`
  color: red;
  text-decoration: none;
`;

type Props = {
  route: MergedScheduleItem;
};

export const RouteHeader: React.FC<Props> = ({ route }) => {
  const { externalScheduleRow: external, internalScheduleRow: internal } =
    route;

  const renderExternalRoute = () => {
    if (external.infoUrl) {
      return (
        <>
          <Link href={getSingleRouteUrl(external.id)} target="_blank">
            {external.number}
          </Link>{" "}
          <InfoLink href={external.infoUrl} target="_blank" rel="noreferrer">
            (!)
          </InfoLink>
        </>
      );
    }

    return (
      <Link href={getSingleRouteUrl(external.id)} target="_blank">
        {external.number}
      </Link>
    );
  };

  const renderInternalRoute = () => {
    return internal?.number ? (
      <Link href={getSingleRouteUrl(internal.id)} target="_blank">
        {internal.number}
      </Link>
    ) : (
      "—"
    );
  };

  return (
    <>
      {renderExternalRoute()} / {renderInternalRoute()}
    </>
  );
};
