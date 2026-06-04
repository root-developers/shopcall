import React from 'react';

export default function LogoIcon({ size = 32, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      {/* Shopping bag handle */}
      <path d="M8.5 6.5V5C8.5 3.9 9.4 3 10.5 3H13.5C14.6 3 15.5 3.9 15.5 5V6.5" stroke="url(#logo-grad)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Shopping bag base + video frame */}
      <rect x="3.5" y="6" width="17" height="13" rx="3.5" fill="url(#logo-grad)" />
      {/* Inner video camera symbol */}
      <path d="M7.5 10C7.5 9.45 7.95 9 8.5 9H12.5C13.05 9 13.5 9.45 13.5 10V13C13.5 13.55 13.05 14 12.5 14H8.5C7.95 14 7.5 13.5 7.5 13V10Z" fill="white" />
      <path d="M14.5 10.25C14.5 10.02 14.76 9.89 14.93 10.03L16.43 11.28C16.57 11.4 16.57 11.6 16.43 11.72L14.93 12.97C14.76 13.11 14.5 12.98 14.5 12.75V10.25Z" fill="white" />
    </svg>
  );
}
