"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  type CreateEventPayload,
  createEvent,
  getApiBaseUrl,
} from "../lib/api";

const IMAGE_ACCEPT = "image/jpeg,image/jpg,image/png,image/webp";

function normalizeTime(value: string): string {
  const t = value.trim();
  if (t.length >= 5 && t[2] === ":") {
    return t.slice(0, 5);
  }
  return t;
}

/** Backend expects E.164; help US users who omit +country */
function toE164Phone(raw: string): string {
  const t = raw.trim();
  if (t.startsWith("+")) return t;
  const digits = t.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return t;
}

export default function EventForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [city, setCity] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isTicketed, setIsTicketed] = useState<"yes" | "no" | null>(null);
  const [ticketPrice, setTicketPrice] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  const [submitBusy, setSubmitBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isTicketed === null) {
      toast.error("Choose whether the event is ticketed.");
      return;
    }

    const st = normalizeTime(startTime);
    const et = normalizeTime(endTime);
    const stateNorm = stateCode.trim().toUpperCase();
    const phoneE164 = toE164Phone(phoneNumber);
    if (!/^\+[1-9]\d{1,14}$/.test(phoneE164)) {
      toast.error(
        "Phone must be in E.164 format (e.g. +13478188801 for US numbers).",
      );
      return;
    }

    const payload: CreateEventPayload = {
      title: title.trim(),
      description: description.trim(),
      date,
      startTime: st,
      endTime: et,
      location: {
        city: city.trim(),
        state: stateNorm,
      },
      emailAddress: emailAddress.trim().toLowerCase(),
      phoneNumber: phoneE164,
      isTicketed: isTicketed === "yes",
    };

    if (payload.isTicketed) {
      const n = Number.parseFloat(ticketPrice);
      if (Number.isNaN(n) || n <= 0) {
        toast.error("Enter a valid ticket price for a ticketed event.");
        return;
      }
      payload.ticketPrice = n;
    }

    setSubmitBusy(true);
    const loadingId = toast.loading("Creating event…");
    try {
      await createEvent(
        payload,
        {
          cover: coverFile,
          gallery: galleryFiles.length ? galleryFiles : undefined,
        },
        undefined,
      );
      toast.dismiss(loadingId);
      toast.success("Event created successfully.", {
        description: "Your event is saved on the server.",
        duration: 6000,
      });
    } catch (err) {
      toast.dismiss(loadingId);
      toast.error(
        err instanceof Error ? err.message : "Could not create the event.",
        { duration: 8000 },
      );
    } finally {
      setSubmitBusy(false);
    }
  };

  const inputClass =
    "w-full border border-[#8691A8] rounded px-2 py-1 text-base text-[#2D384C] bg-white h-8 focus:outline-none focus:ring-2 focus:ring-[#2D384C]";

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#2D384C]">
            Event RSVP portal
          </h1>
          <p className="mt-2 text-sm text-[#787776]">
            API: <span className="font-mono">{getApiBaseUrl()}</span>
            {" · "}
            Override with <code className="font-mono">NEXT_PUBLIC_API_URL</code>{" "}
            for a local backend (e.g.{" "}
            <span className="font-mono">http://localhost:3000</span>
            ).
          </p>
          <p className="mt-3 text-sm text-[#2D384C]">
            No account required — submit the form to create an event.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl p-6 shadow-lg"
        >
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-[#2D384C] mb-1"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              className={inputClass}
              placeholder="At least 5 characters"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              minLength={5}
              required
            />
          </div>

          <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label
                htmlFor="date"
                className="block text-sm font-medium text-[#2D384C] mb-1"
              >
                Event date
              </label>
              <input
                id="date"
                type="date"
                className={inputClass}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                htmlFor="startTime"
                className="block text-sm font-medium text-[#2D384C] mb-1"
              >
                Start (24h)
              </label>
              <input
                id="startTime"
                type="time"
                className={inputClass}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                htmlFor="endTime"
                className="block text-sm font-medium text-[#2D384C] mb-1"
              >
                End (24h)
              </label>
              <input
                id="endTime"
                type="time"
                className={inputClass}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-[#2D384C] mb-1"
              >
                City
              </label>
              <input
                id="city"
                type="text"
                className={inputClass}
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                htmlFor="state"
                className="block text-sm font-medium text-[#2D384C] mb-1"
              >
                State (2 letters)
              </label>
              <input
                id="state"
                type="text"
                className={inputClass}
                placeholder="NY"
                value={stateCode}
                onChange={(e) =>
                  setStateCode(e.target.value.slice(0, 2).toUpperCase())
                }
                maxLength={2}
                minLength={2}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="emailAddress"
              className="block text-sm font-medium text-[#2D384C] mb-1"
            >
              Contact email
            </label>
            <input
              id="emailAddress"
              type="email"
              className={inputClass}
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-[#2D384C] mb-1"
            >
              Phone (E.164, e.g. +13478188801)
            </label>
            <input
              id="phoneNumber"
              type="tel"
              className={inputClass}
              placeholder="+13478188801"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <div
              id="ticketed-event-label"
              className="block text-sm font-medium text-[#2D384C] mb-1"
            >
              Ticketed event?
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
                    {isTicketed === "yes" ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#2D384C]" />
                    ) : null}
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
                    {isTicketed === "no" ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#2D384C]" />
                    ) : null}
                  </div>
                </div>
                <span className="text-base text-[#787776] font-normal">No</span>
              </label>
            </div>
          </div>

          {isTicketed === "yes" ? (
            <div className="mb-4">
              <label
                htmlFor="ticketPrice"
                className="block text-sm font-medium text-[#2D384C] mb-1"
              >
                Ticket price (USD)
              </label>
              <input
                id="ticketPrice"
                type="number"
                min={0.01}
                step={0.01}
                className={inputClass}
                value={ticketPrice}
                onChange={(e) => setTicketPrice(e.target.value)}
                required
              />
            </div>
          ) : null}

          <div className="mb-4">
            <label
              htmlFor="cover"
              className="block text-sm font-medium text-[#2D384C] mb-1"
            >
              Cover image (card hero)
            </label>
            <input
              id="cover"
              type="file"
              accept={IMAGE_ACCEPT}
              className="block w-full text-sm text-[#2D384C] file:mr-3 file:rounded file:border-0 file:bg-[#2D384C] file:px-3 file:py-1 file:text-[#FDBD4E]"
              onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
            />
            <p className="mt-1 text-xs text-[#787776]">
              JPEG, PNG, or WebP · up to 5MB
            </p>
          </div>

          <div className="mb-6">
            <label
              htmlFor="gallery"
              className="block text-sm font-medium text-[#2D384C] mb-1"
            >
              Gallery images (optional)
            </label>
            <input
              id="gallery"
              type="file"
              accept={IMAGE_ACCEPT}
              multiple
              className="block w-full text-sm text-[#2D384C] file:mr-3 file:rounded file:border-0 file:bg-[#2D384C] file:px-3 file:py-1 file:text-[#FDBD4E]"
              onChange={(e) =>
                setGalleryFiles(Array.from(e.target.files ?? []))
              }
            />
            <p className="mt-1 text-xs text-[#787776]">
              Multiple images for detail / carousel · up to 5MB each
            </p>
          </div>

          <div className="mb-6">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-[#2D384C] mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              className="w-full border border-[#8691A8] rounded px-2 py-2 text-base text-[#2D384C] bg-white h-28 resize-none focus:outline-none focus:ring-2 focus:ring-[#2D384C]"
              placeholder="At least 20 characters"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minLength={20}
              rows={4}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitBusy}
            className="w-40 h-9 mx-auto block rounded-full bg-[#2D384C] text-[#FDBD4E] text-sm font-medium hover:bg-[#1f2838] transition-colors disabled:opacity-60"
          >
            {submitBusy ? "Submitting…" : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
