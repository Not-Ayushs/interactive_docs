
export default function AuthBuddy({ mood = 'idle', onCaught }) {
  return (
    <div
      className={`auth-buddy auth-buddy--${mood}`}
      role="img"
      aria-label="A pair of playful eyes"
      onPointerEnter={onCaught}
    >
      <svg viewBox="0 0 180 96" aria-hidden="true" focusable="false">
        <g className="auth-buddy__eyes">
          <ellipse cx="57" cy="47" rx="30" ry="38" className="auth-buddy__eye" />
          <ellipse cx="123" cy="47" rx="30" ry="38" className="auth-buddy__eye" />
          <g className="auth-buddy__pupils">
            <ellipse cx="62" cy="51" rx="12" ry="17" className="auth-buddy__pupil" />
            <ellipse cx="128" cy="51" rx="12" ry="17" className="auth-buddy__pupil" />
            <circle cx="66" cy="44" r="4" className="auth-buddy__glint" />
            <circle cx="132" cy="44" r="4" className="auth-buddy__glint" />
          </g>
        </g>
      </svg>
    </div>
  );
}
