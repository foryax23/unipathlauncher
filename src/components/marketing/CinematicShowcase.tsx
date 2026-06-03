import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";
import videoAsset from "@/assets/bgc-showcase.mp4.asset.json";
import posterAsset from "@/assets/bgc-showcase-poster.jpg.asset.json";

export function CinematicShowcase() {
  const sectionRef = useReveal<HTMLDivElement>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (reducedMotion) {
      v.pause();
      setPlaying(false);
    } else {
      v.play().catch(() => setPlaying(false));
    }
  }, [reducedMotion]);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-warm">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-amber/25 via-amber/5 to-transparent" />
      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="absolute -left-32 top-20 h-[420px] w-[420px] rounded-full bg-amber/40 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-[360px] w-[360px] rounded-full bg-coral/30 blur-3xl" />
      </div>

      <div
        ref={sectionRef}
        className="reveal mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 lg:py-32"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-coral">
            See it in motion
          </p>
          <h2 className="mt-3 text-display-lg text-foreground">
            A <span className="font-editorial italic">cinematic</span> look at your UK journey.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            From first conversation to first day on campus, our advisers are with you the whole way.
          </p>
        </div>

        <div className="mt-12 lg:mt-16">
          <div className="group relative overflow-hidden rounded-[2.5rem] bg-black shadow-2xl shadow-coral/20 ring-1 ring-white/10 aspect-video lg:aspect-[21/9]">
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              src={videoAsset.url}
              poster={posterAsset.url}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Bridge Gateway Consulting — a look inside our student journey"
            />

            {/* Vignette */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

            {/* Top-left controls */}
            <div className="absolute left-4 top-4 flex gap-2 sm:left-6 sm:top-6">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={playing ? "Pause video" : "Play video"}
                className="tap inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md ring-1 ring-white/20 transition hover:bg-white/20"
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? "Unmute video" : "Mute video"}
                className="tap inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md ring-1 ring-white/20 transition hover:bg-white/20"
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            </div>

            {/* Top-right meta */}
            <div className="absolute right-4 top-4 hidden items-center gap-2 sm:right-6 sm:top-6 sm:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-coral" />
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/80">
                Inside Bridge Gateway · 2026
              </span>
            </div>

            {/* Bottom-left editorial copy */}
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:p-10">
              <div className="max-w-xl">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/70 sm:text-[11px]">
                  A 60-second story
                </p>
                <h3 className="mt-2 text-2xl font-semibold leading-tight text-white sm:text-3xl lg:text-4xl">
                  Your path to a <span className="font-editorial italic text-amber">UK degree</span>, in motion.
                </h3>
                <div className="mt-4 hidden sm:block">
                  <Link
                    to="/onboarding"
                    className="tap inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-foreground shadow-lg transition-transform hover:-translate-y-0.5"
                  >
                    Start your match →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground sm:hidden">
            Tap the speaker icon to unmute.
          </p>
        </div>
      </div>
    </section>
  );
}
