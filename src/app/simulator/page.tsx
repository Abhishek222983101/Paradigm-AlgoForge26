"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Activity,
  AlertTriangle,
  Keyboard,
  Shield,
  Brain,
  Send,
  Terminal,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface ChatMessage {
  id: number;
  text: string;
  sender: "user" | "contact";
  timestamp: string;
}

interface KinematicDataPoint {
  index: number;
  value: number;
  baseline: number;
}

const FLIGHT_BASELINE = 120;
const DWELL_BASELINE = 100;
const ROLLING_WINDOW = 15;
const CHART_HISTORY = 50;
const SCORE_INITIAL = 95;

const FLIGHT_PENALTY_WEIGHT = 45;
const DWELL_PENALTY_WEIGHT = 40;
const CORRECTION_PENALTY_WEIGHT = 25;

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    text: "Hey Maa! Just checking in on you. How's your morning going?",
    sender: "contact",
    timestamp: "10:30 AM",
  },
  {
    id: 2,
    text: "Did you remember to take your medication today?",
    sender: "contact",
    timestamp: "10:31 AM",
  },
  {
    id: 3,
    text: "Also, Dr. Sharma moved your appointment to Thursday at 2pm. Don't forget!",
    sender: "contact",
    timestamp: "10:32 AM",
  },
];

export default function SimulatorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [flightTimes, setFlightTimes] = useState<KinematicDataPoint[]>([]);
  const [dwellTimes, setDwellTimes] = useState<KinematicDataPoint[]>([]);
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [cognitiveScore, setCognitiveScore] = useState(SCORE_INITIAL);
  const [isAnomalyDetected, setIsAnomalyDetected] = useState(false);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);

  const lastKeyUpTimeRef = useRef<number>(0);
  const activeKeysRef = useRef<Map<string, number>>(new Map());
  const keystrokeIndexRef = useRef<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const recentFlightsRef = useRef<number[]>([]);
  const recentDwellsRef = useRef<number[]>([]);

  const calculateScore = useCallback(
    (bsCount: number, totalKs: number): number => {
      const flights = recentFlightsRef.current;
      const dwells = recentDwellsRef.current;

      if (flights.length < 3 && dwells.length < 3) return SCORE_INITIAL;

      let score = 100;

      if (flights.length > 0) {
        const avgFlight = flights.reduce((a, b) => a + b, 0) / flights.length;
        const deviation = Math.max(0, avgFlight - FLIGHT_BASELINE) / FLIGHT_BASELINE;
        score -= deviation * FLIGHT_PENALTY_WEIGHT;
      }

      if (dwells.length > 0) {
        const avgDwell = dwells.reduce((a, b) => a + b, 0) / dwells.length;
        const deviation = Math.max(0, avgDwell - DWELL_BASELINE) / DWELL_BASELINE;
        score -= deviation * DWELL_PENALTY_WEIGHT;
      }

      const bsRatio = bsCount / Math.max(totalKs, 1);
      score -= bsRatio * CORRECTION_PENALTY_WEIGHT;

      return Math.max(0, Math.min(100, Math.round(score)));
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const now = Date.now();
      const key = e.key;

      if (key === "Backspace") {
        setBackspaceCount((p) => p + 1);
      }

      if (["Shift", "Control", "Alt", "Meta", "Tab", "CapsLock"].includes(key)) return;

      if (lastKeyUpTimeRef.current > 0) {
        const flight = Math.min(now - lastKeyUpTimeRef.current, 2000);
        const idx = keystrokeIndexRef.current;

        setFlightTimes((prev) =>
          [...prev, { index: idx, value: flight, baseline: FLIGHT_BASELINE }].slice(-CHART_HISTORY)
        );

        recentFlightsRef.current.push(flight);
        if (recentFlightsRef.current.length > ROLLING_WINDOW)
          recentFlightsRef.current.shift();
      }

      if (!activeKeysRef.current.has(key)) {
        activeKeysRef.current.set(key, now);
      }

      setTotalKeystrokes((p) => p + 1);
      keystrokeIndexRef.current++;
    },
    []
  );

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const now = Date.now();
      const key = e.key;

      lastKeyUpTimeRef.current = now;

      if (["Shift", "Control", "Alt", "Meta", "Tab", "CapsLock"].includes(key)) return;

      const start = activeKeysRef.current.get(key);
      if (start !== undefined) {
        const dwell = Math.min(now - start, 2000);
        const idx = keystrokeIndexRef.current;

        setDwellTimes((prev) =>
          [...prev, { index: idx, value: dwell, baseline: DWELL_BASELINE }].slice(-CHART_HISTORY)
        );

        recentDwellsRef.current.push(dwell);
        if (recentDwellsRef.current.length > ROLLING_WINDOW)
          recentDwellsRef.current.shift();

        activeKeysRef.current.delete(key);
      }
    },
    []
  );

  useEffect(() => {
    const newScore = calculateScore(backspaceCount, totalKeystrokes);
    setCognitiveScore(newScore);
    setIsAnomalyDetected(newScore < 70);
  }, [flightTimes, dwellTimes, backspaceCount, totalKeystrokes, calculateScore]);

  const handleSendMessage = useCallback(() => {
    const text = inputValue.trim();
    if (!text) return;

    const now = new Date();
    const timestamp = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    setMessages((prev) => [...prev, { id: Date.now(), text, sender: "user", timestamp }]);
    setInputValue("");
  }, [inputValue]);

  const handleTextareaKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      handleKeyDown(e);
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleKeyDown, handleSendMessage]
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const scoreColor = useMemo(() => {
    if (cognitiveScore > 85) return "#00A36C";
    if (cognitiveScore > 70) return "#FF5722";
    return "#A52A2A";
  }, [cognitiveScore]);

  const scoreLabel = useMemo(() => {
    if (cognitiveScore > 85) return "OPTIMAL FLUIDITY";
    if (cognitiveScore > 70) return "MILD COGNITIVE FRICTION";
    return "ANOMALY DETECTED";
  }, [cognitiveScore]);

  const avgFlight = useMemo(() => {
    if (flightTimes.length === 0) return null;
    const window = flightTimes.slice(-ROLLING_WINDOW);
    return Math.round(window.reduce((a, b) => a + b.value, 0) / window.length);
  }, [flightTimes]);

  const avgDwell = useMemo(() => {
    if (dwellTimes.length === 0) return null;
    const window = dwellTimes.slice(-ROLLING_WINDOW);
    return Math.round(window.reduce((a, b) => a + b.value, 0) / window.length);
  }, [dwellTimes]);

  return (
    <div className="h-screen flex flex-col bg-paper font-mono bg-grid-clinical overflow-hidden">
      <header className="bg-charcoal text-white px-4 md:px-8 py-3 flex items-center justify-between border-clinical-b shrink-0 z-50">
        <Link href="/" className="flex items-center gap-3 hover:text-cobalt transition-colors">
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
          <span className="font-heading text-lg md:text-2xl font-bold uppercase tracking-tight">CogniStream</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-2 border-2 border-white/30">
            <div className={`w-2.5 h-2.5 rounded-full ${totalKeystrokes > 0 ? "bg-surgical animate-pulse" : "bg-white/30"}`} />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-white/70">
              {totalKeystrokes > 0 ? "MONITORING ACTIVE" : "AWAITING INPUT"}
            </span>
          </div>
          <div className="px-3 py-2 bg-cobalt text-white font-heading font-bold text-sm border-clinical uppercase">Live Demo</div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden min-h-0">
        <div className="flex flex-col bg-cream border-r-0 lg:border-clinical-r overflow-hidden">
          <div className="bg-surgical/15 px-4 md:px-6 py-3 border-clinical-b flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-charcoal border-clinical flex items-center justify-center shrink-0">
                <span className="text-white font-heading font-bold text-sm md:text-lg">SM</span>
              </div>
              <div>
                <h3 className="font-heading font-bold text-base md:text-xl uppercase tracking-tight leading-none">Sita (Maa)</h3>
                <p className="font-mono text-xs font-bold text-charcoal/60">Patient &bull; Active Now</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-charcoal text-surgical border-clinical">
              <Shield className="w-3 h-3" strokeWidth={2} />
              <span className="font-mono text-[10px] font-bold uppercase">Privacy On</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 min-h-0">
            <div className="text-center mb-4">
              <div className="inline-block bg-cobalt/10 px-3 py-1.5 border-clinical font-mono text-[10px] font-bold uppercase text-charcoal/70">
                <Keyboard className="inline w-3 h-3 mr-1 -mt-0.5" strokeWidth={2} />
                CogniStream passively monitoring keystroke dynamics
              </div>
            </div>

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] md:max-w-[75%] p-3 md:p-4 border-clinical ${msg.sender === "user" ? "bg-charcoal text-white shadow-clinical-sm" : "bg-white text-charcoal shadow-clinical-sm"}`}>
                  <p className="font-mono text-sm md:text-base font-medium leading-relaxed">{msg.text}</p>
                  <p className={`font-mono text-[10px] mt-2 uppercase tracking-wider font-bold ${msg.sender === "user" ? "text-cobalt" : "text-charcoal/30"}`}>{msg.timestamp}</p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 md:p-4 bg-white border-clinical-t shrink-0">
            <div className="flex gap-2 md:gap-3">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                onKeyUp={handleKeyUp}
                placeholder="TYPE HERE — YOUR KEYSTROKES ARE BEING ANALYZED..."
                className="flex-1 resize-none p-3 md:p-4 bg-paper border-clinical font-mono text-sm md:text-base font-medium placeholder:text-charcoal/25 placeholder:text-[10px] md:placeholder:text-xs focus:outline-none focus:bg-white transition-colors"
                rows={2}
              />
              <button onClick={handleSendMessage} className="px-4 md:px-6 bg-charcoal text-white border-clinical hover:bg-cobalt transition-colors self-stretch flex items-center justify-center" aria-label="Send message">
                <Send className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col bg-charcoal text-white overflow-hidden">
          <div className="px-4 md:px-6 py-3 flex items-center justify-between bg-charcoal border-clinical-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 md:w-6 md:h-6 text-cobalt" strokeWidth={2} />
              <h2 className="font-heading font-bold text-sm md:text-lg uppercase tracking-tight text-white">Caregiver Dashboard</h2>
            </div>
            <span className="font-mono text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Live Telemetry</span>
          </div>

          {isAnomalyDetected && (
            <div className="bg-iodine text-white px-4 md:px-6 py-3 border-clinical-b flex items-center gap-3 shrink-0">
              <AlertTriangle className="w-6 h-6 md:w-7 md:h-7 shrink-0" strokeWidth={2} />
              <div className="min-w-0">
                <p className="font-heading font-bold text-sm md:text-lg uppercase tracking-tight leading-tight">COGNITIVE ANOMALY DETECTED</p>
                <p className="font-mono text-[10px] md:text-xs font-bold truncate text-white/80">Keystroke dynamics indicate significant cognitive friction. Recommend review.</p>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-5 min-h-0">
            <div className="border-clinical p-6 md:p-8 text-center transition-colors" style={{ borderColor: scoreColor, backgroundColor: isAnomalyDetected ? "rgba(165, 42, 42, 0.15)" : "rgba(0, 163, 108, 0.08)" }}>
              <p className="font-mono text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] mb-3 text-white/40">Cognitive Fluidity Score</p>
              <div className="font-heading font-bold text-[80px] md:text-[120px] lg:text-[140px] leading-none transition-colors tabular-nums" style={{ color: scoreColor }}>{cognitiveScore}</div>
              <div className="mt-3 flex items-center justify-center gap-2">
                <div className="w-3 h-3 border-clinical shrink-0" style={{ backgroundColor: scoreColor, animation: isAnomalyDetected ? "pulse 0.8s ease-in-out infinite" : "none" }} />
                <p className="font-heading font-bold text-base md:text-xl uppercase tracking-tight transition-colors" style={{ color: scoreColor }}>{scoreLabel}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-3">
              <div className="border-clinical border-white/15 p-3 md:p-4 bg-white/[0.03]">
                <p className="font-mono text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-white/35 mb-1">Avg Flight</p>
                <p className="font-heading font-bold text-xl md:text-3xl text-surgical tabular-nums">{avgFlight !== null ? `${avgFlight}` : "\u2014"}{avgFlight !== null && <span className="text-xs md:text-sm text-white/30 ml-0.5">ms</span>}</p>
              </div>
              <div className="border-clinical border-white/15 p-3 md:p-4 bg-white/[0.03]">
                <p className="font-mono text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-white/35 mb-1">Avg Dwell</p>
                <p className="font-heading font-bold text-xl md:text-3xl text-amber-500 tabular-nums">{avgDwell !== null ? `${avgDwell}` : "\u2014"}{avgDwell !== null && <span className="text-xs md:text-sm text-white/30 ml-0.5">ms</span>}</p>
              </div>
              <div className="border-clinical border-white/15 p-3 md:p-4 bg-white/[0.03]">
                <p className="font-mono text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-white/35 mb-1">Corrections</p>
                <p className="font-heading font-bold text-xl md:text-3xl text-iodine tabular-nums">{backspaceCount}</p>
              </div>
            </div>

            <div className="border-clinical border-white/15 p-3 md:p-4 bg-white/[0.03]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-surgical" strokeWidth={2} />
                  <h3 className="font-heading font-bold text-sm md:text-base uppercase tracking-tight">Flight Time</h3>
                </div>
                <div className="flex items-center gap-3 font-mono text-[9px] font-bold">
                  <span className="flex items-center gap-1"><span className="inline-block w-3 h-[3px] bg-surgical" /><span className="text-white/35">LIVE</span></span>
                  <span className="flex items-center gap-1"><span className="inline-block w-3 h-0 border-t-2 border-dashed border-white/40" /><span className="text-white/35">BASELINE</span></span>
                </div>
              </div>
              <div className="h-[130px] md:h-[160px] w-full">
                {flightTimes.length > 2 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={flightTimes} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="none" vertical={false} />
                      <XAxis dataKey="index" stroke="rgba(255,255,255,0.15)" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 9 }} tickLine={false} axisLine={{ strokeWidth: 2 }} />
                      <YAxis stroke="rgba(255,255,255,0.15)" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 9 }} tickLine={false} axisLine={{ strokeWidth: 2 }} domain={[0, "auto"]} />
                      <ReferenceLine y={FLIGHT_BASELINE} stroke="rgba(255,255,255,0.3)" strokeDasharray="8 4" strokeWidth={2} label={{ value: `${FLIGHT_BASELINE}ms`, fill: "rgba(255,255,255,0.35)", fontSize: 9, position: "right" }} />
                      <Line type="stepAfter" dataKey="value" stroke="#00A36C" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#00A36C", stroke: "#0F0F0F", strokeWidth: 2 }} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="font-mono text-[10px] text-white/15 uppercase font-bold tracking-[0.2em]">Start typing to generate flight data...</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-clinical border-white/15 p-3 md:p-4 bg-white/[0.03]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-4 h-4 text-amber-500" strokeWidth={2} />
                  <h3 className="font-heading font-bold text-sm md:text-base uppercase tracking-tight">Dwell Time</h3>
                </div>
                <div className="flex items-center gap-3 font-mono text-[9px] font-bold">
                  <span className="flex items-center gap-1"><span className="inline-block w-3 h-[3px] bg-amber-500" /><span className="text-white/35">LIVE</span></span>
                  <span className="flex items-center gap-1"><span className="inline-block w-3 h-0 border-t-2 border-dashed border-white/40" /><span className="text-white/35">BASELINE</span></span>
                </div>
              </div>
              <div className="h-[130px] md:h-[160px] w-full">
                {dwellTimes.length > 2 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dwellTimes} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="none" vertical={false} />
                      <XAxis dataKey="index" stroke="rgba(255,255,255,0.15)" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 9 }} tickLine={false} axisLine={{ strokeWidth: 2 }} />
                      <YAxis stroke="rgba(255,255,255,0.15)" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 9 }} tickLine={false} axisLine={{ strokeWidth: 2 }} domain={[0, "auto"]} />
                      <ReferenceLine y={DWELL_BASELINE} stroke="rgba(255,255,255,0.3)" strokeDasharray="8 4" strokeWidth={2} label={{ value: `${DWELL_BASELINE}ms`, fill: "rgba(255,255,255,0.35)", fontSize: 9, position: "right" }} />
                      <Line type="stepAfter" dataKey="value" stroke="#FF5722" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#FF5722", stroke: "#0F0F0F", strokeWidth: 2 }} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="font-mono text-[10px] text-white/15 uppercase font-bold tracking-[0.2em]">Start typing to generate dwell data...</p>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center py-3 border-t-2 border-white/10">
              <p className="font-mono text-[10px] text-white/25 uppercase font-bold tracking-[0.3em]">Total Keystrokes Analyzed: <span className="text-white/50">{totalKeystrokes}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
