import React from "react";
import { useQuery } from "@apollo/react-hooks";
import { Subtitle, Body } from "@leafygreen-ui/typography";
import styled from "@emotion/styled";
import { uiColors } from "@leafygreen-ui/palette";
import Button from "@leafygreen-ui/button";
import { Skeleton } from "antd";
import get from "lodash/get";
import { SiderCard, StyledLink } from "components/styles";
import { Accordian } from "components/Accordian";
import { cliDocumentationUrl } from "constants/externalResources";
import { GET_CLIENT_CONFIG } from "gql/queries";
import {
  ClientConfigQuery,
  ClientConfigQueryVariables,
  ClientBinary,
} from "gql/generated/types";

const { gray } = uiColors;

export const DownloadCard = () => {
  const { data, loading } = useQuery<
    ClientConfigQuery,
    ClientConfigQueryVariables
  >(GET_CLIENT_CONFIG);

  if (loading) {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }
  const clientBinaries = get(data, "clientConfig.clientBinaries", []);
  const topBinaries = clientBinaries.filter(filterBinaries);
  const otherBinaries = clientBinaries.filter(
    (binary) => !filterBinaries(binary)
  );
  return (
    <Container>
      <Subtitle>Command-Line Client</Subtitle>
      <CardDescription>
        <Body>
          View the{" "}
          <StyledLink href={cliDocumentationUrl}>documentation</StyledLink> or
          run{" "}
        </Body>
        <InlinePre>evergreen --help or evergreen [command] --help</InlinePre>{" "}
        <Body>for additional assistance.</Body>
      </CardDescription>
      <CardGroup>
        {topBinaries.map((binary) => (
          <CliDownloadBox
            key={`downloadBox_${binary.url}`}
            title={prettyDisplayName[binary.displayName] || binary.displayName}
            link={binary.url}
          />
        ))}
      </CardGroup>
      <Accordian
        title={<StyledLink>Show More</StyledLink>}
        toggledTitle={<StyledLink>Show Less</StyledLink>}
        contents={<ExpandableLinkContents clientBinaries={otherBinaries} />}
        toggleFromBottom
        showCaret={false}
      />
    </Container>
  );
};

interface CliDownloadBoxProps {
  title: string;
  link: string | null;
}
const CliDownloadBox: React.FC<CliDownloadBoxProps> = ({ title, link }) => (
  <CliDownloadCard>
    <CliDownloadTitle>{title}</CliDownloadTitle>
    <CliDownloadButton href={link} disabled={!link} as="a">
      Download
    </CliDownloadButton>
  </CliDownloadCard>
);

interface ExpandableLinkContentsProps {
  clientBinaries: ClientBinary[];
}
const ExpandableLinkContents: React.FC<ExpandableLinkContentsProps> = ({
  clientBinaries,
}) => (
  <LinkContainer>
    {clientBinaries.map((binary) => (
      <StyledLink key={`link_${binary.url}`} href={binary.url}>
        {prettyDisplayName[binary.displayName] || binary.displayName}
      </StyledLink>
    ))}
  </LinkContainer>
);

const prettyDisplayName = {
  "OSX 64-bit": "MacOS",
  "Windows 64-bit": "Windows",
  "Linux 64-bit": "Linux (64-bit)",
};

const filterBinaries = (binary: ClientBinary) => {
  const topBinaries = ["OSX 64-bit", "Windows 64-bit", "Linux 64-bit"];
  return topBinaries.includes(binary.displayName);
};

const Container = styled(SiderCard)`
  padding-left: 20px;
  padding-top: 20px;
  padding-bottom: 20px;
`;
const CardGroup = styled.div`
  display: flex;
`;
const CliDownloadCard = styled(SiderCard)`
  display: flex;
  flex-direction: column;
  width: 180px;
  padding-top: 20px;
  padding-bottom: 20px;
  padding-left: 20px;
  margin-right: 16px;
`;

const CliDownloadButton = styled(Button)`
  align-self: flex-start;
`;

const CliDownloadTitle = styled(Subtitle)`
  font-weight: bold;
  padding-bottom: 45px;
`;
const CardDescription = styled.div`
  font-size: 14px;
  margin-bottom: 40px;
`;

const InlinePre = styled("pre")`
  display: inline-block;
  background-color: ${gray.light3};
  margin-bottom: 0;
  overflow: visible;
`;

const LinkContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`;
