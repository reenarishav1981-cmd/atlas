"use client";

import React, { useState, useEffect } from "react";

interface CountdownBlockProps {
  title?: string;
  endTime?: string;
  bgColor?: string;
}

export default function CountdownBlock({
  title = "Special Offer Ends In",
  endTime,
  bgColor = "#F4F3F0",
}: CountdownBlockProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const target = endTime || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const end = new Date(target).getTime();

    const update = () => {
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div
      style={{ backgroundColor: bgColor }}
      className="rounded-3xl p-8 sm:p-12 text-center border border-[#E8E6E1]"
    >
      {title && (
        <h3 className="text-xl sm:text-2xl font-semibold text-[#0A0A09] mb-6">
          {title}
        </h3>
      )}
      <div className="flex justify-center items-center gap-4 sm:gap-6">
        {[
          { label: "Days", value: timeLeft.days },
          { label: "Hours", value: timeLeft.hours },
          { label: "Mins", value: timeLeft.minutes },
          { label: "Secs", value: timeLeft.seconds },
        ].map((unit, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="min-w-[64px] sm:min-w-[80px] bg-white border border-[#E8E6E1] rounded-2xl p-3 sm:p-4 shadow-sm">
              <span className="text-2xl sm:text-4xl font-semibold text-[#0A0A09] font-mono">
                {String(unit.value).padStart(2, "0")}
              </span>
            </div>
            <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-[#5a5a57] uppercase mt-2">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
