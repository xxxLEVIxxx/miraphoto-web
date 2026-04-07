"use client";

import { useEffect, useState } from "react";
import {
  type CreateEventPayload,
  createEvent,
  getApiBaseUrl,
  loginPhotographer,
} from "../lib/api";

const TOKEN_KEY = "miraphoto_access_token";

function normalizeTime(value: string): string {
  const t = value.trim();
  if (t.length >= 5 && t[2] === ":") {
    return t.slice(0, 5);
  }
  return t;
}

export default function EventForm() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

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

  const [status, setStatus] = useState<{
    kind: "idle" | "ok" | "err";
    text: string;
  }>({ kind: "idle", text: "" });

  const [submitBusy, setSubmitBusy] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) {
      setAccessToken(t);
    }
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ kind: "idle", text: "" });
    setLoginBusy(true);
    try {
      const token = await loginPhotographer(loginEmail, loginPassword);
      localStorage.setItem(TOKEN_KEY, token);
      setAccessToken(token);
      setStatus({
        kind: "ok",
        text: "Signed in. You can create an event below.",
      });
    } catch (err) {
      setStatus({
        kind: "err",
        text: err instanceof Error ? err.message : "Sign-in failed",
      });
    } finally {
      setLoginBusy(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAccessToken(null);
    setStatus({ kind: "idle", text: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ kind: "idle", text: "" });

    if (!accessToken) {
      setStatus({
        kind: "err",
        text: "Sign in with a photographer account first.",
      });
      return;
    }

    if (isTicketed === null) {
      setStatus({ kind: "err", text: "Choose whether the event is ticketed." });
      return;
    }

    const st = normalizeTime(startTime);
    const et = normalizeTime(endTime);
    const stateNorm = stateCode.trim().toUpperCase();

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
      phoneNumber: phoneNumber.trim(),
      isTicketed: isTicketed === "yes",
    };

    if (payload.isTicketed) {
      const n = Number.parseFloat(ticketPrice);
      if (Number.isNaN(n) || n <= 0) {
        setStatus({
          kind: "err",
          text: "Enter a valid ticket price for a ticketed event.",
        });
        return;
      }
      payload.ticketPrice = n;
    }

    setSubmitBusy(true);
    try {
      await createEvent(accessToken, payload);
      setStatus({
        kind: "ok",
        text: "Event created successfully.",
      });
    } catch (err) {
      setStatus({
        kind: "err",
        text: err instanceof Error ? err.message : "Could not create event",
      });
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
            Set <code className="font-mono">NEXT_PUBLIC_API_URL</code> if your
            backend runs elsewhere (e.g. when Next.js uses port 3000).
          </p>
        </div>

        <section className="mb-8 bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-[#2D384C] mb-3">
            Photographer sign-in
          </h2>
          <p className="text-sm text-[#787776] mb-4">
            Creating events requires a JWT from{" "}
            <span className="font-mono">POST /api/auth/login</span> as a user
            with the photographer role.
          </p>
          {accessToken ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-[#2D384C]">Signed in</span>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full border border-[#8691A8] px-4 py-1.5 text-sm text-[#2D384C] hover:bg-gray-50"
              >
                Sign out
              </button>
            </div>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-3 max-w-md">
              <div>
                <label
                  htmlFor="loginEmail"
                  className="block text-sm font-medium text-[#2D384C] mb-1"
                >
                  Email
                </label>
                <input
                  id="loginEmail"
                  type="email"
                  autoComplete="email"
                  className={inputClass}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="loginPassword"
                  className="block text-sm font-medium text-[#2D384C] mb-1"
                >
                  Password
                </label>
                <input
                  id="loginPassword"
                  type="password"
                  autoComplete="current-password"
                  className={inputClass}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loginBusy}
                className="rounded-full bg-[#2D384C] text-[#FDBD4E] text-sm font-medium px-6 py-2 hover:bg-[#1f2838] disabled:opacity-60"
              >
                {loginBusy ? "Signing in…" : "Sign in"}
              </button>
            </form>
          )}
        </section>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl p-6 shadow-lg"
        >
          {status.text ? (
            <div
              className={`mb-4 rounded-lg px-3 py-2 text-sm ${
                status.kind === "ok"
                  ? "bg-green-50 text-green-900"
                  : status.kind === "err"
                    ? "bg-red-50 text-red-900"
                    : ""
              }`}
              role={status.kind === "err" ? "alert" : "status"}
            >
              {status.text}
            </div>
          ) : null}

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
              Phone (E.164)
            </label>
            <input
              id="phoneNumber"
              type="tel"
              className={inputClass}
              placeholder="+12125551234"
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
