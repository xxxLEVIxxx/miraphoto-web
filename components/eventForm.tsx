"use client";

import { useState } from "react";

export default function EventForm() {
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventEmail, setEventEmail] = useState("");
  const [eventPhone, setEventPhone] = useState("");
  const [isTicketed, setIsTicketed] = useState<"yes" | "no" | null>(null);
  const [eventPrice, setEventPrice] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle event creation here
    console.log("Event Creation Data:", {
      eventName,
      eventDescription,
      eventDate,
      eventLocation,
      eventEmail,
      eventPhone,
      isTicketed,
      eventPrice,
    });
    // You can add API call here
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#2D384C]">
            Event RSVP portal
          </h1>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl p-6 shadow-lg"
        >
          {/* Event Name Input */}
          <div className="mb-4">
            <label
              htmlFor="eventName"
              className="block text-sm font-medium text-[#2D384C] mb-1"
            >
              Title
            </label>
            <input
              id="eventName"
              type="text"
              className="w-full border border-[#8691A8] rounded px-2 py-1 text-base text-[#2D384C] bg-white h-8 focus:outline-none focus:ring-2 focus:ring-[#2D384C]"
              placeholder="Title"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
          </div>

          {/* Event Date Input */}
          <div className="mb-4">
            <label
              htmlFor="eventDate"
              className="block text-sm font-medium text-[#2D384C] mb-1"
            >
              Event Date
            </label>
            <input
              id="eventDate"
              type="text"
              className="w-full border border-[#8691A8] rounded px-2 py-1 text-base text-[#2D384C] bg-white h-8 focus:outline-none focus:ring-2 focus:ring-[#2D384C]"
              placeholder="MM/DD/YYYY"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>

          {/* Event Location Input */}
          <div className="mb-4">
            <label
              htmlFor="eventLocation"
              className="block text-sm font-medium text-[#2D384C] mb-1"
            >
              Location
            </label>
            <input
              id="eventLocation"
              type="text"
              className="w-full border border-[#8691A8] rounded px-2 py-1 text-base text-[#2D384C] bg-white h-8 focus:outline-none focus:ring-2 focus:ring-[#2D384C]"
              placeholder="Enter event location"
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
            />
          </div>

          {/* Event Email Input */}
          <div className="mb-4">
            <label
              htmlFor="eventEmail"
              className="block text-sm font-medium text-[#2D384C] mb-1"
            >
              Email Address
            </label>
            <input
              id="eventEmail"
              type="email"
              className="w-full border border-[#8691A8] rounded px-2 py-1 text-base text-[#2D384C] bg-white h-8 focus:outline-none focus:ring-2 focus:ring-[#2D384C]"
              placeholder="Enter email address"
              value={eventEmail}
              onChange={(e) => setEventEmail(e.target.value)}
            />
          </div>

          {/* Event Phone Input */}
          <div className="mb-4">
            <label
              htmlFor="eventPhone"
              className="block text-sm font-medium text-[#2D384C] mb-1"
            >
              Phone Number
            </label>
            <input
              id="eventPhone"
              type="tel"
              className="w-full border border-[#8691A8] rounded px-2 py-1 text-base text-[#2D384C] bg-white h-8 focus:outline-none focus:ring-2 focus:ring-[#2D384C]"
              placeholder="Enter phone number"
              value={eventPhone}
              onChange={(e) => setEventPhone(e.target.value)}
            />
          </div>

          {/* Ticketed Event Section */}
          <div className="mb-4">
            <div
              id="ticketed-event-label"
              className="block text-sm font-medium text-[#2D384C] mb-1"
            >
              Ticketed Event?
            </div>
            <div
              className="flex gap-6"
              role="radiogroup"
              aria-labelledby="ticketed-event-label"
            >
              <label
                htmlFor="isTicketed-yes"
                className="flex items-center cursor-pointer"
              >
                <div className="relative mr-2">
                  <input
                    id="isTicketed-yes"
                    type="radio"
                    name="isTicketed"
                    value="yes"
                    checked={isTicketed === "yes"}
                    onChange={() => setIsTicketed("yes")}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                      isTicketed === "yes"
                        ? "border-[#2D384C]"
                        : "border-[#8691A8]"
                    }`}
                  >
                    {isTicketed === "yes" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#2D384C]" />
                    )}
                  </div>
                </div>
                <span className="text-base text-[#787776] font-normal">
                  Yes
                </span>
              </label>
              <label
                htmlFor="isTicketed-no"
                className="flex items-center cursor-pointer"
              >
                <div className="relative mr-2">
                  <input
                    id="isTicketed-no"
                    type="radio"
                    name="isTicketed"
                    value="no"
                    checked={isTicketed === "no"}
                    onChange={() => setIsTicketed("no")}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                      isTicketed === "no"
                        ? "border-[#2D384C]"
                        : "border-[#8691A8]"
                    }`}
                  >
                    {isTicketed === "no" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#2D384C]" />
                    )}
                  </div>
                </div>
                <span className="text-base text-[#787776] font-normal">No</span>
              </label>
            </div>
          </div>

          {/* Conditional Price Input */}
          {isTicketed === "yes" && (
            <div className="mb-4">
              <label
                htmlFor="eventPrice"
                className="block text-sm font-medium text-[#2D384C] mb-1"
              >
                Ticket Price
              </label>
              <input
                id="eventPrice"
                type="text"
                className="w-full border border-[#8691A8] rounded px-2 py-1 text-base text-[#2D384C] bg-white h-8 focus:outline-none focus:ring-2 focus:ring-[#2D384C]"
                placeholder="If marked yes, enter price"
                value={eventPrice}
                onChange={(e) => setEventPrice(e.target.value)}
              />
            </div>
          )}

          {/* Event Description Input */}
          <div className="mb-6">
            <label
              htmlFor="eventDescription"
              className="block text-sm font-medium text-[#2D384C] mb-1"
            >
              Description
            </label>
            <textarea
              id="eventDescription"
              className="w-full border border-[#8691A8] rounded px-2 py-2 text-base text-[#2D384C] bg-white h-20 resize-none focus:outline-none focus:ring-2 focus:ring-[#2D384C]"
              placeholder="Description"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-40 h-9 mx-auto block rounded-full bg-[#2D384C] text-[#FDBD4E] text-sm font-medium hover:bg-[#1f2838] transition-colors"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
