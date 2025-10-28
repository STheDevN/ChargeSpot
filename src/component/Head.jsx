import React from 'react';

export const Head = () => {
  return (
    <>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>ChargeSpot - EV Charging Station Finder</title>
      <meta name="description" content="Find and book EV charging stations with real-time availability" />
      <script dangerouslySetInnerHTML={{
        __html: `
          if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        `
      }} />
    </>
  );
};