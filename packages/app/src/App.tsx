/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  AlertDisplay,
  createApp,
  createRouteRef,
  LocalStorageFeatureFlags,
  FlatRoutes,
  OAuthRequestDialog,
  SignInPage,
} from '@backstage/core';
import {
  catalogPlugin,
  CatalogIndexPage,
  CatalogEntityPage,
} from '@backstage/plugin-catalog';
import { CatalogImportPage } from '@backstage/plugin-catalog-import';
import { ExplorePage } from '@backstage/plugin-explore';
import { Router as GraphiQLRouter } from '@backstage/plugin-graphiql';
import { Router as LighthouseRouter } from '@backstage/plugin-lighthouse';
import { Router as RegisterComponentRouter } from '@backstage/plugin-register-component';
import { ScaffolderPage, scaffolderPlugin } from '@backstage/plugin-scaffolder';
import { Router as TechRadarRouter } from '@backstage/plugin-tech-radar';
import { Router as DocsRouter } from '@backstage/plugin-techdocs';
import { Router as SettingsRouter } from '@backstage/plugin-user-settings';
import React from 'react';
import { hot } from 'react-hot-loader/root';
import { Navigate, Route } from 'react-router';
import { apis } from './apis';
import { EntityPage } from './components/catalog/EntityPage';
import Root from './components/Root';
import { SearchPage } from './components/search/SearchPage';
import { providers } from './identityProviders';
import * as plugins from './plugins';
import AlarmIcon from '@material-ui/icons/Alarm';

const app = createApp({
  apis,
  plugins: Object.values(plugins),
  icons: {
    // Custom icon example
    alert: AlarmIcon,
  },
  components: {
    SignInPage: props => {
      return (
        <SignInPage
          {...props}
          providers={['guest', 'custom', ...providers]}
          title="Select a sign-in method"
          align="center"
        />
      );
    },
  },
  bindRoutes({ bind }) {
    bind(catalogPlugin.externalRoutes, {
      createComponent: scaffolderPlugin.routes.root,
    });
  },
});

const AppProvider = app.getProvider();
const AppRouter = app.getRouter();
const deprecatedAppRoutes = app.getRoutes();
const featureFlags = new LocalStorageFeatureFlags();
const catalogRouteRef = createRouteRef({
  path: '/catalog',
  title: 'Service Catalog',
});

const routes = (
  <FlatRoutes>
    <Navigate key="/" to="/catalog" />
    <Route path="/catalog" element={<CatalogIndexPage />} />
    <Route
      path="/catalog/:namespace/:kind/:name"
      element={<CatalogEntityPage />}
    >
      <EntityPage />
    </Route>
    <Route path="/catalog-import" element={<CatalogImportPage />} />
    {featureFlags.isActive('use-search-platform') && (
      <Route path="/search" element={<SearchPage />} />
    )}
    <Route path="/docs" element={<DocsRouter />} />
    <Route path="/create" element={<ScaffolderPage />} />
    <Route path="/explore" element={<ExplorePage />} />
    <Route
      path="/tech-radar"
      element={<TechRadarRouter width={1500} height={800} />}
    />
    <Route path="/graphiql" element={<GraphiQLRouter />} />
    <Route path="/lighthouse" element={<LighthouseRouter />} />
    <Route
      path="/register-component"
      element={<RegisterComponentRouter catalogRouteRef={catalogRouteRef} />}
    />
    <Route path="/settings" element={<SettingsRouter />} />
    {...deprecatedAppRoutes}
  </FlatRoutes>
);

const App = () => (
  <AppProvider>
    <AlertDisplay />
    <OAuthRequestDialog />
    <AppRouter>
      <Root>{routes}</Root>
    </AppRouter>
  </AppProvider>
);

export default hot(App);
