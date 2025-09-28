/// <reference types="vite/client" />
import { PostHogProvider } from "posthog-js/react";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Loader from "@/components/loader";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import indexCss from '../index.css?url'

import { ClerkProvider,
  useAuth } from "@clerk/clerk-react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);
export type RouterAppContext = {};

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        rel: "stylesheet",
        href: indexCss
      },

      {
        title: "Cherry Creek OpenCourseWare",
      },
      {
        name: "description",
        content:
          "Cherry Creek OpenCourseWare is a platform dedicated to bridging socioeconomic gaps in education.",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
});

function RootComponent() {
  const isFetching = useRouterState({
    select: (s) => s.isLoading,
  });

  return (
    <html>
      <HeadContent />
      <PostHogProvider
           apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
           options={{
             api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
             capture_exceptions: true,
             debug: import.meta.env.MODE === "development",
           }}
         >

      <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
        <div className="flex flex-col">
          <div className="grid h-svh grid-rows-[auto_1fr]">
            {isFetching ? <Loader /> : <Outlet />}
          </div>
        </div>
        <Toaster richColors />
      </ThemeProvider>
        </ConvexProviderWithClerk>
      </ClerkProvider>
         </PostHogProvider>
      <TanStackRouterDevtools position="bottom-left" />
    </html>
  );
}
