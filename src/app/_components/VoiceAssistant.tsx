"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface VoiceAssistantProps {
  onNavigate: (section: string) => void;
}

export default function VoiceAssistant({ onNavigate }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [commandFeedback, setCommandFeedback] = useState("");
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition on Mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onstart = () => {
          setIsListening(true);
          setCommandFeedback("Listening for command...");
        };

        rec.onresult = (event: any) => {
          const text = event.results[0][0].transcript.toLowerCase();
          processCommand(text);
        };

        rec.onerror = (err: any) => {
          setIsListening(false);
          if (err.error === "no-speech") {
            setCommandFeedback("No speech detected.");
          } else if (err.error === "not-allowed") {
            setCommandFeedback("Mic permission blocked.");
            toast.error("Microphone access blocked. Please enable it in your address bar/settings.");
          } else {
            setCommandFeedback("Mic error. Try again.");
          }
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  const speak = (msg: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(msg);
      utterance.pitch = 1.05;
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  const processCommand = (text: string) => {
    console.log("Speech recognized:", text);
    
    // Exact match filters
    if (text.includes("dashboard") || text.includes("overview") || text.includes("home")) {
      speak("Opening dashboard overview.");
      setCommandFeedback("Opening Dashboard...");
      onNavigate("Dashboard");
    } else if (text.includes("order") || text.includes("sales") || text.includes("history")) {
      speak("Opening customer orders.");
      setCommandFeedback("Opening Orders...");
      onNavigate("Orders");
    } else if (text.includes("add product") || text.includes("create product") || text.includes("new product")) {
      speak("Opening product creation panel.");
      setCommandFeedback("Opening Add Product Modal...");
      onNavigate("Products");
      setTimeout(() => {
        const btn = document.getElementById("add-product-btn");
        if (btn) btn.click();
      }, 350);
    } else if (text.includes("product") || text.includes("inventory") || text.includes("stock")) {
      speak("Opening products list.");
      setCommandFeedback("Opening Products...");
      onNavigate("Products");
    } else if (text.includes("customer") || text.includes("user")) {
      speak("Displaying customer base.");
      setCommandFeedback("Opening Customers...");
      onNavigate("Customers");
    } else if (text.includes("analytics") || text.includes("report")) {
      speak("Showing analytics report.");
      setCommandFeedback("Opening Analytics...");
      onNavigate("Analytics");
    } else if (text.includes("setting")) {
      speak("Opening settings.");
      setCommandFeedback("Opening Settings...");
      onNavigate("Settings");
    } else {
      speak("Command not recognized. Please try again.");
      setCommandFeedback(`Unknown: "${text}"`);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Web Speech Recognition API is not supported in this browser. Please use Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="flex items-center gap-3 bg-[#FAFAF9] border border-[#E8E6E1] px-4 py-1.5 rounded-2xl shadow-xs">
      <button
        onClick={toggleListening}
        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
          isListening
            ? "bg-red-500 text-white animate-pulse"
            : "bg-[#0E0E0D] text-white hover:bg-[#C4973A]"
        }`}
        title={isListening ? "Listening..." : "Click to speak voice commands"}
      >
        {isListening ? (
          <div className="relative w-4 h-4 flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40" />
            <MicOff size={14} />
          </div>
        ) : (
          <Mic size={14} />
        )}
      </button>

      <div className="text-left min-w-[120px] max-w-[180px]">
        <div className="text-[9px] text-[#C4973A] font-bold uppercase tracking-wider flex items-center gap-1">
          <Sparkles size={8} /> Voice Assistant
        </div>
        <div className="text-xs font-semibold text-[#0E0E0D] truncate leading-tight">
          {isListening ? "Listening..." : commandFeedback || "Click to voice navigate"}
        </div>
      </div>
    </div>
  );
}
