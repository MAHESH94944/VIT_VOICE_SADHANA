import React from "react";

export default function SadhanaCard({ card }) {
  if (!card) return null;
  return (
    <div className="border rounded p-4 bg-gray-50 shadow-sm mb-2">
      <div className="font-semibold text-blue-700 mb-1">
        {new Date(card.date).toLocaleDateString()}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <span>
          <span className="font-medium">Wake Up:</span> {card.wakeUp}
        </span>
        <span>
          <span className="font-medium">Japa Completed:</span>{" "}
          {card.japaCompleted}
        </span>
        <span>
          <span className="font-medium">Day Rest:</span> {card.dayRest}
        </span>
        <span>
          <span className="font-medium">Hearing:</span> {card.hearing}
        </span>
        <span>
          <span className="font-medium">Reading:</span> {card.reading}
        </span>
        <span>
          <span className="font-medium">Study:</span> {card.study}
        </span>
        <span>
          <span className="font-medium">Time To Bed:</span> {card.timeToBed}
        </span>
        <span>
          <span className="font-medium">Seva:</span> {card.seva}
        </span>
      </div>
      {card.concern && (
        <div className="mt-2 text-xs text-gray-700">
          <span className="font-medium">Notes:</span> {card.concern}
        </div>
      )}
    </div>
  );
}
