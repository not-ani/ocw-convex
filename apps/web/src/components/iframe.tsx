"use client";
import { LoaderCircleIcon } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

type EmbedLoaderProps = {
  src: string;
  loaderComponent?: React.ReactNode;
  timeout?: number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  className?: string;
};

const DEFAULT_TIMEOUT = 10_000; // 10 seconds
/*
 * TODO: we have  error managment but if any errors are present it stops the embed from rendering entirely and displays the error message.
 * we need to find a way to only stop the embed when there are breaking errors and not just when there are errors.
 */

export const Embed: React.FC<EmbedLoaderProps> = ({
  src: embedUrl,
  loaderComponent,
  timeout = DEFAULT_TIMEOUT,
  onLoad,
  onError,
  className,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Set a timeout to trigger error if embed takes too long to load.
    timeoutRef.current = setTimeout(() => {
      if (isLoading) {
        setHasError(true);
        setIsLoading(false);
        if (onError) {
          onError(new Error("Embed load timed out"));
        }
      }
    }, timeout);

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [timeout, isLoading, onError]);

  const handleLoad = () => {
    clearTimeout(timeoutRef.current);
    setIsLoading(false);
    if (onLoad) {
      onLoad();
    }
  };

  const handleError = () => {
    clearTimeout(timeoutRef.current);
    setHasError(true);
    setIsLoading(false);
    if (onError) {
      onError(new Error("Failed to load embed"));
    }
  };

  return (
    <div className={className}>
      {isLoading && !hasError ? (
        <div aria-live="assertive" className="loader" role="alert">
          {loaderComponent ?? (
            <div className="flex h-[87vh] w-full flex-col items-center justify-center rounded-xl border-muted shadow-2xl">
              <LoaderCircleIcon className="animate-spin" />
              <div className="text-center">
                Loading...
                <ul className="mt-2 text-gray-600 text-sm">
                  <li>If this takes a long time, try turning off your VPN</li>
                  <li>Click the Open in new Tab button</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      ) : null}

      <iframe
        loading="eager"
        onError={handleError}
        onLoad={handleLoad}
        ref={iframeRef}
        src={embedUrl}
        style={{
          display: isLoading ? "none" : "block",
          width: "100%",
          height: "100%",
        }}
        title="Embedded Content"
      />
    </div>
  );
};
