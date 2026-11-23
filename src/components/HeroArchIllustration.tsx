export function HeroArchIllustration() {
  return (
    <div className="relative flex items-center justify-center w-full h-full py-6 lg:py-0">
      <svg
        viewBox="0 0 420 440"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[360px] lg:max-w-[400px] h-auto"
        role="img"
        aria-label="Thin champagne architectural line drawing of an arched doorway and family house"
      >
        {/* Ground baseline */}
        <path
          d="M 24 396 L 396 396"
          stroke="#C9B27C"
          strokeWidth="1.25"
          strokeLinecap="round"
          className="hero-arch-stroke"
          style={{ '--dash-length': 380 } as React.CSSProperties}
        />

        {/* Outer residence frame & pitched roofline */}
        <path
          d="M 64 396 L 64 176 L 210 64 L 356 176 L 356 396"
          stroke="#C9B27C"
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="hero-arch-stroke"
          style={{ '--dash-length': 860 } as React.CSSProperties}
        />

        {/* Upper cornice & parapet line */}
        <path
          d="M 88 192 L 332 192"
          stroke="#C9B27C"
          strokeOpacity="0.65"
          strokeWidth="1"
          strokeLinecap="round"
          className="hero-arch-stroke"
          style={{ '--dash-length': 260, animationDelay: '0.15s' } as React.CSSProperties}
        />

        {/* Central arched doorway */}
        <path
          d="M 156 396 L 156 266 A 54 54 0 0 1 264 266 L 264 396"
          stroke="#C9B27C"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="hero-arch-stroke"
          style={{ '--dash-length': 460, animationDelay: '0.2s' } as React.CSSProperties}
        />

        {/* Inner doorway arch detail */}
        <path
          d="M 172 396 L 172 270 A 38 38 0 0 1 248 270 L 248 396"
          stroke="#C9B27C"
          strokeOpacity="0.7"
          strokeWidth="1"
          strokeLinecap="round"
          className="hero-arch-stroke"
          style={{ '--dash-length': 390, animationDelay: '0.3s' } as React.CSSProperties}
        />

        {/* Fanlight transom arch lines */}
        <path
          d="M 172 266 L 248 266 M 210 232 L 210 266"
          stroke="#C9B27C"
          strokeOpacity="0.55"
          strokeWidth="0.9"
          strokeLinecap="round"
          className="hero-arch-stroke"
          style={{ '--dash-length': 140, animationDelay: '0.4s' } as React.CSSProperties}
        />

        {/* Left arched window */}
        <path
          d="M 94 316 L 94 252 A 19 19 0 0 1 132 252 L 132 316 Z"
          stroke="#C9B27C"
          strokeOpacity="0.85"
          strokeWidth="1.15"
          strokeLinejoin="round"
          className="hero-arch-stroke"
          style={{ '--dash-length': 240, animationDelay: '0.35s' } as React.CSSProperties}
        />

        {/* Right arched window */}
        <path
          d="M 288 316 L 288 252 A 19 19 0 0 1 326 252 L 326 316 Z"
          stroke="#C9B27C"
          strokeOpacity="0.85"
          strokeWidth="1.15"
          strokeLinejoin="round"
          className="hero-arch-stroke"
          style={{ '--dash-length': 240, animationDelay: '0.35s' } as React.CSSProperties}
        />

        {/* Upper gable oculus */}
        <circle
          cx="210"
          cy="136"
          r="18"
          stroke="#C9B27C"
          strokeOpacity="0.85"
          strokeWidth="1.15"
          className="hero-arch-stroke"
          style={{ '--dash-length': 120, animationDelay: '0.45s' } as React.CSSProperties}
        />

        {/* Entry steps */}
        <path
          d="M 142 396 L 142 384 L 278 384 L 278 396"
          stroke="#C9B27C"
          strokeOpacity="0.6"
          strokeWidth="1"
          className="hero-arch-stroke"
          style={{ '--dash-length': 170, animationDelay: '0.5s' } as React.CSSProperties}
        />
      </svg>
    </div>
  );
}
