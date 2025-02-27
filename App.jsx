import React from "react";
import { ApplicationProvider, Layout, Text } from "@ui-kitten/components";
import * as eva from "@eva-design/eva";

export default function App() {
  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <Layout
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text category="h1">Hello UI Kitten</Text>
      </Layout>
    </ApplicationProvider>
  );
}
