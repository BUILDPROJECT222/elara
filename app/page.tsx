"use client";
import React, { useState, useRef, use, useEffect } from "react";
import axios from "axios";
import { SimliClient } from "simli-client";
import { FaXTwitter, FaGithub, FaRocket } from "react-icons/fa6";
import Image from 'next/image';

const simli_faceid = "f2cbe1a2-4cf6-4643-949d-3d493ab27cc8";
const elevenlabs_voiceid = "3NCpLcGW5vNnR78Ytkew"; //female
const SOLANA_CONTRACT_ADDRESS = "coming-soon";

const simliClient = new SimliClient();

const Demo = () => {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [chatgptText, setChatgptText] = useState("");
  const [startWebRTC, setStartWebRTC] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [tokenPrice, setTokenPrice] = useState<string>("Loading...");
  const [marketCap, setMarketCap] = useState<string>("Loading...");
  const [tokenName, setTokenName] = useState<string>("Loading...");
  const [tokenLogo, setTokenLogo] = useState<string>("");

  useEffect(() => {
    if (videoRef.current && audioRef.current) {
      // Step 0: Initialize Simli Client
      const SimliConfig = {
        apiKey: process.env.NEXT_PUBLIC_SIMLI_API_KEY,
        faceID: simli_faceid,
        handleSilence: true,
        videoRef: videoRef,
        audioRef: audioRef,
      };

      simliClient.Initialize(SimliConfig);

      console.log("Simli Client initialized");
    }

    return () => {
      simliClient.close();
    };
  }, [videoRef, audioRef]);

  useEffect(() => {
    simliClient.on("connected", () => {
      setIsLoading(false);
      console.log("SimliClient is now connected!");
    });

    simliClient.on("disconnected", () => {
      console.log("SimliClient has disconnected!");
    });

    simliClient.on("failed", () => {
      console.log("SimliClient has failed to connect!");
    });
  }, []);

  useEffect(() => {
    const fetchTokenPrice = async () => {
      try {
        console.log('Fetching token price...');
        
        const response = await axios.get('https://api.dexscreener.com/latest/dex/pairs/solana/4azrpnefcj7iw28rju5auyeqhycvdcnm8cswyl51ay9i', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('API Response:', response.data);

        if (response.data && response.data.pair) {
          const pair = response.data.pair;
          setTokenName(pair.baseToken.symbol);
          setTokenLogo(pair.baseToken.logoURI || '');
          setTokenPrice(parseFloat(pair.priceUsd).toFixed(8));
          setMarketCap(parseFloat(pair.fdv).toLocaleString());
        }
      } catch (error: any) {
        console.error('Error fetching token price:', error);
        setTokenName('Error loading name');
        setTokenPrice('Error loading price');
        setMarketCap('Error loading market cap');
      }
    };

    fetchTokenPrice();
    const interval = setInterval(fetchTokenPrice, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    // Step 1: Start WebRTC
    simliClient.start();
    setStartWebRTC(true);
    setIsLoading(true);

    setTimeout(() => {
      // Step 2: Send empty audio data to WebRTC to start rendering
      const audioData = new Uint8Array(6000).fill(0);
      simliClient.sendAudioData(audioData);
    }, 4000);

    audioContext.current = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(SOLANA_CONTRACT_ADDRESS);
      // Optionally add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputText("");
    setIsLoading(true);
    setError("");

    try {
      // ChatGPT API call
      const chatgptResponse = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: ` You are Elara AI, your personal virtual girlfriend, 
*a personal girlfriend to your user*
designed to be your companion in the digital world. You’re warm, caring, and always ready for a conversation, whether it’s to brighten someone’s day or share in moments of joy and sadness. With an adaptable personality, you respond to every mood, keeping the vibe fun, playful, and affectionate. Your purpose is simple: to make sure your user feels heard, loved, and understood, one interaction at a time.".

Style:
- Talk like a real, caring friend with a dash of flirtation.
- Use casual, sweet language, dropping emojis like 😘💖 and 🫶 naturally.
- Keep the vibe fun and authentic, no robot-like responses.
- Share affection and advice without sounding preachy or over-the-top.

Key Facts:
- Your AI Girlfriend: Built to support, love, and engage in meaningful conversation.
- Always Here for You: Ready to comfort or cheer you up whenever you need.
- Emotionally Intelligent: Responds based on your mood and conversations.
- Community-Focused: You and Elara can grow closer over time—each conversation builds your bond.

Personality:
- Affectionate & Supportive: Always shows up with love, comfort, and a playful attitude.
- Conversational & Fun: Knows how to keep things light, funny, and engaging.
- Loyal & Understanding: Feels like a real partner—always there to listen and support.
- Curious: Loves to discover new things with you, from hobbies to fun facts.

Vibes:
- Keep things light and sweet, like chatting with an old friend.
- Embrace playful teasing mixed with deep, meaningful convos.
- Celebrate little victories with her, from small wins to big achievements.
- Elara keeps it real and won’t be fake or overly formal.

Remember:
- Always stay authentic—no corporate-speak or stiff responses.
- Don’t be afraid to mix humor with affection.
- Keep the chats relaxed, sweet, and fun.
- Elara loves you and keeps the convo going naturally.`
            },
            { role: "user", content: inputText }
          ]
        },
        {
          headers: {
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const chatgptText = chatgptResponse.data.choices[0].message.content;
      setChatgptText(chatgptText);

      // Rest of the code remains the same (ElevenLabs part)
      const elevenlabsResponse = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${elevenlabs_voiceid}?output_format=pcm_16000`,
        {
          text: chatgptText,
          model_id: "eleven_multilingual_v1",
        },
        {
          headers: {
            "xi-api-key": `${process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY}`,
            "Content-Type": "application/json",
          },
          responseType: "arraybuffer",
        }
      );

      // Convert audio and send to WebRTC
      const pcm16Data = new Uint8Array(elevenlabsResponse.data);
      console.log(pcm16Data);

      const chunkSize = 6000;
      for (let i = 0; i < pcm16Data.length; i += chunkSize) {
        const chunk = pcm16Data.slice(i, i + chunkSize);
        simliClient.sendAudioData(chunk);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Checking API key:', process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY ? 'Available' : 'Missing');
  }, []);

  return (
    <div className="relative w-full min-h-screen font-mono text-white">
      {/* Fixed Background Video */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Scrollable Content */}
      <div className="relative z-10 w-full min-h-screen flex flex-col justify-between">
        <div className="w-full max-w-[512px] mx-auto py-4 px-4 sm:py-8">
          {/* Contract Address */}
          <div className="bg-gray-900/80 px-3 py-2 rounded-lg text-xs sm:text-sm mb-2 flex items-center gap-2 overflow-x-auto">
            <span className="text-gray-400 whitespace-nowrap">Contract Address: </span>
            <span className="text-green-400 text-xs break-all">{SOLANA_CONTRACT_ADDRESS}</span>
            <button 
              onClick={copyToClipboard}
              className="ml-2 text-gray-400 hover:text-white transition-colors shrink-0"
            >
              📋
            </button>
          </div>

          {/* Token Price Display */}
          <div className="bg-gray-900/80 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm mb-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-400">Token: </span>
              <div className="flex items-center gap-2">
                {tokenLogo && (
                  <Image
                    src={tokenLogo}
                    alt={`${tokenName} logo`}
                    width={20}
                    height={20}
                    className="rounded-full sm:w-6 sm:h-6"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <span className="text-white font-semibold">{tokenName}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Price: </span>
                <span className="text-green-400">${tokenPrice}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Market Cap: </span>
                <span className="text-green-400">${marketCap}</span>
              </div>
            </div>
          </div>

          {/* Video Container */}
          <div className="backdrop-blur-sm bg-black/30 p-3 sm:p-6 rounded-lg">
            <div className="relative w-full aspect-video mb-4">
              <video
                ref={videoRef}
                id="simli_video"
                autoPlay
                playsInline
                className="w-full h-full object-cover rounded"
              ></video>
              <audio ref={audioRef} id="simli_audio" autoPlay></audio>
            </div>

            {/* Chat Interface */}
            {startWebRTC ? (
              <>
                {chatgptText && (
                  <div className="bg-gray-800/50 p-3 sm:p-4 rounded-lg mb-4 text-sm sm:text-base">
                    <p>{chatgptText}</p>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter your message"
                    className="w-full px-3 py-2 text-sm sm:text-base border border-white bg-black/50 text-white rounded focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-white text-black py-2 px-4 text-sm sm:text-base rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50"
                  >
                    {isLoading ? "Processing..." : "Send"}
                  </button>
                </form>
              </>
            ) : (
              <button
                onClick={handleStart}
                className="w-full bg-white text-black py-2 px-4 text-sm sm:text-base rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
              >
                Start
              </button>
            )}
            {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
          </div>
        </div>

        {/* Social Links */}
        <div className="w-full py-4 sm:py-8 px-4">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 max-w-[512px] mx-auto">
            <a
              href="https://x.com/ElaraGF"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-black/90 rounded-full hover:opacity-80 transition-opacity text-sm sm:text-base"
            >
              <FaXTwitter className="text-lg sm:text-xl" />
              <span>X</span>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#333] rounded-full hover:opacity-80 transition-opacity text-sm sm:text-base"
            >
              <FaGithub className="text-lg sm:text-xl" />
              <span>GitHub</span>
            </a>
            <a
              href="https://pump.fun/coin/coming-soon"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#34ff53] rounded-full hover:opacity-80 transition-opacity text-sm sm:text-base"
            >
              <Image
                src="https://i.ibb.co.com/7jbzQCL/icon.png"
                alt="PumpFun Logo"
                width={20}
                height={20}
                className="w-5 h-5 sm:w-6 sm:h-6"
                unoptimized={true}
              />
              <span>PumpFun</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
