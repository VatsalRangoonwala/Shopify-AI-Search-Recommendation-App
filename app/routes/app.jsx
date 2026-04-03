import { Outlet, useLoaderData, useRouteError } from "react-router";
import { AppProvider as ShopifyProvider } from "@shopify/shopify-app-react-router/react"; // Alias this
import { AppProvider as PolarisProvider } from "@shopify/polaris"; // Import Polaris provider
import enTranslations from "@shopify/polaris/locales/en.json";
import "@shopify/polaris/build/esm/styles.css";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import AppLayout from "../components/layout/AppLayout.jsx";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <ShopifyProvider embedded apiKey={apiKey}>
      <PolarisProvider i18n={enTranslations}>
        <AppLayout>
          <Outlet />
        </AppLayout>
      </PolarisProvider>
    </ShopifyProvider>
  );
}


// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.

export function ErrorBoundary() {

return boundary.error(useRouteError());

}



export const headers = (headersArgs) => {

return boundary.headers(headersArgs);

};
