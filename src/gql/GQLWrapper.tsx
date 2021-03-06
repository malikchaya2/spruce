import React, { useState, useEffect } from "react";
import { ApolloClient } from "apollo-client";
import { ApolloProvider } from "@apollo/react-hooks";
import { HttpLink } from "apollo-link-http";
import { ApolloLink } from "apollo-link";
import { RetryLink } from "apollo-link-retry";
import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import {
  addMockFunctionsToSchema,
  introspectSchema,
  makeExecutableSchema,
} from "graphql-tools";
import { printSchema } from "graphql/utilities/schemaPrinter";
import { SchemaLink } from "apollo-link-schema";
import { onError } from "apollo-link-error";
import { useAuthDispatchContext, Logout, Dispatch } from "context/auth";
import ApolloLinkTimeout from "apollo-link-timeout";
import { reportError } from "utils/errorReporting";

interface ClientLinkParams {
  credentials?: string;
  gqlURL?: string;
  isDevelopment?: boolean;
  isTest?: boolean;
  schemaString?: string;
  shouldEnableGQLMockServer?: boolean;
  logout?: Logout;
  dispatch?: Dispatch;
}

export const getClientLink = async ({
  credentials,
  gqlURL,
  isDevelopment,
  isTest,
  schemaString,
  shouldEnableGQLMockServer,
}: ClientLinkParams): Promise<HttpLink | SchemaLink> => {
  const httpLink = new HttpLink({
    uri: gqlURL,
    credentials,
  });

  if (
    (isDevelopment || isTest) &&
    (schemaString || shouldEnableGQLMockServer)
  ) {
    try {
      const executableSchema = makeExecutableSchema({
        typeDefs: schemaString || printSchema(await introspectSchema(httpLink)),
      });
      addMockFunctionsToSchema({ schema: executableSchema });
      return new SchemaLink({ schema: executableSchema });
    } catch (e) {
      // unable to initiate mock server
      return new HttpLink();
    }
  }
  return httpLink;
};

const cache = new InMemoryCache();

const authLink = (logout: Logout): ApolloLink =>
  onError(({ networkError }) => {
    if (
      // must perform these checks so that TS does not complain bc typings for network does not include 'statusCode'
      networkError &&
      "statusCode" in networkError &&
      networkError.statusCode === 401
    ) {
      logout();
    }
  });

const logErrorsLink = onError(({ graphQLErrors }) => {
  if (Array.isArray(graphQLErrors)) {
    graphQLErrors.forEach((gqlErr) => {
      reportError(gqlErr).warning();
    });
  }
  // dont track network errors here because they are
  // very common when a user is not authenticated
});

const timeoutLink = new ApolloLinkTimeout(60000);

const authenticateIfSuccessfulLink = (dispatch: Dispatch): ApolloLink =>
  new ApolloLink((operation, forward) =>
    forward(operation).map((response) => {
      if (response && response.data) {
        // if there is data in response then server responded with 200; therefore, is authenticated.
        dispatch({ type: "authenticate" });
      }
      return response;
    })
  );

const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: 3000,
    jitter: true,
  },
  attempts: {
    max: 5,
    retryIf: (error): boolean =>
      error && error.response && error.response.status >= 500,
  },
});

export const getGQLClient = async ({
  credentials,
  gqlURL,
  isDevelopment,
  isTest,
  schemaString,
  shouldEnableGQLMockServer,
  logout,
  dispatch,
}: ClientLinkParams): Promise<ApolloClient<NormalizedCacheObject>> => {
  const link: HttpLink | SchemaLink = await getClientLink({
    credentials,
    gqlURL,
    isDevelopment,
    isTest,
    schemaString,
    shouldEnableGQLMockServer,
  });
  const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
    cache,
    link: authenticateIfSuccessfulLink(dispatch)
      .concat(authLink(logout))
      .concat(logErrorsLink)
      .concat(retryLink)
      .concat(timeoutLink)
      .concat(link),
  });
  return client;
};

const GQLWrapper: React.FC<ClientLinkParams> = ({
  children,
  credentials,
  gqlURL,
  isDevelopment,
  isTest,
  schemaString,
  shouldEnableGQLMockServer,
}) => {
  const [client, setClient] = useState(null);
  const { logout, dispatch } = useAuthDispatchContext();

  useEffect(() => {
    async function getAndSetClient(): Promise<void> {
      const gqlClient = await getGQLClient({
        credentials,
        gqlURL,
        isDevelopment,
        isTest,
        schemaString,
        shouldEnableGQLMockServer,
        logout,
        dispatch,
      });
      setClient(gqlClient);
    }
    getAndSetClient();
  }, [
    credentials,
    gqlURL,
    isDevelopment,
    isTest,
    schemaString,
    shouldEnableGQLMockServer,
    logout,
    dispatch,
  ]);
  return client ? (
    <ApolloProvider client={client}>{children}</ApolloProvider>
  ) : (
    <></>
  );
};

export default GQLWrapper;
