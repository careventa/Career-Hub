"use client";

import Script from "next/script";
import { useEffect } from "react";

type AdSensePlaceholderProps = {
  adClient?: string;
  adSlot?: string;
};

export default function AdSensePlaceholder({
  adClient = process.env.NEXT_PUBLIC_GOOGLE_AD_CLIENT,
  adSlot = process.env.NEXT_PUBLIC_GOOGLE_AD_SLOT,
}: AdSensePlaceholderProps) {
  useEffect(() => {
    if (!adClient || !adSlot) return;

    try {
      (window as Window & { adsbygoogle?: unknown[] }).adsbygoogle =
        (window as Window & { adsbygoogle?: unknown[] }).adsbygoogle || [];
      (window as Window & { adsbygoogle?: unknown[] }).adsbygoogle?.push({});
    } catch (error) {
      console.error("AdSense initialization failed:", error);
    }
  }, [adClient, adSlot]);

  if (!adClient || !adSlot) {
    return (
      <div className="border rounded p-4 text-center text-sm text-gray-500">
        Insert your Google AdSense client and slot ID in .env.local to enable ads.
      </div>
    );
  }

  return (
    <>
      <Script
        async
        strategy="afterInteractive"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
        crossOrigin="anonymous"
      />

      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </>
  );
}
