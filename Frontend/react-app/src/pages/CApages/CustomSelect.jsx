import React, { useEffect, useRef, useState } from "react";
import "./CustomSelect.css";

/**
 * A fully styled dropdown that works as a drop-in replacement for a native
 * <select>. It fires onChange / onBlur with a synthetic { target: { name, value } }
 * event, so existing form handlers and validation keep working unchanged.
 *
 * Props:
 *   name, value, onChange, onBlur      – same contract as a native <select>
 *   options   – array of strings/numbers OR array of { value, label }
 *   placeholder, error (bool), disabled, className
 */
export default function CustomSelect({
  name,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = "Select",
  error = false,
  disabled = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);

  const opts = options.map((o) =>
    o !== null && typeof o === "object"
      ? { value: String(o.value), label: String(o.label ?? o.value) }
      : { value: String(o), label: String(o) }
  );

  const current = String(value ?? "");
  const selected = opts.find((o) => o.value === current);

  const emit = (fn, v) => { if (fn) fn({ target: { name, value: v } }); };

  const close = (blur = true) => {
    setOpen(false);
    setActiveIndex(-1);
    if (blur) emit(onBlur, current);
  };

  const choose = (v) => {
    emit(onChange, v);
    setOpen(false);
    setActiveIndex(-1);
    emit(onBlur, v);
  };

  // Close when clicking outside the component.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) close();
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, current]);

  const onKeyDown = (e) => {
    if (disabled) return;
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (!open) {
          setOpen(true);
          setActiveIndex(Math.max(0, opts.findIndex((o) => o.value === current)));
        } else if (activeIndex >= 0 && opts[activeIndex]) {
          choose(opts[activeIndex].value);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!open) setOpen(true);
        setActiveIndex((i) => Math.min(opts.length - 1, i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) setOpen(true);
        setActiveIndex((i) => Math.max(0, i - 1));
        break;
      case "Escape":
        if (open) close();
        break;
      case "Tab":
        if (open) close();
        break;
      default:
        break;
    }
  };

  return (
    <div
      ref={rootRef}
      className={`cs-root ${className} ${error ? "cs-error" : ""} ${disabled ? "cs-disabled" : ""}`}
      data-field={name}
      tabIndex={disabled ? -1 : 0}
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      onKeyDown={onKeyDown}
    >
      <button
        type="button"
        className="cs-control"
        disabled={disabled}
        tabIndex={-1}
        onClick={() => !disabled && setOpen((o) => !o)}
      >
        <span className={`cs-value ${selected ? "" : "cs-placeholder"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <span className={`cs-arrow ${open ? "cs-arrow--open" : ""}`} aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <ul className="cs-panel" role="listbox">
          {opts.length === 0 && <li className="cs-empty">No options</li>}
          {opts.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === current}
              className={
                "cs-option" +
                (o.value === current ? " cs-option--selected" : "") +
                (i === activeIndex ? " cs-option--active" : "")
              }
              onMouseEnter={() => setActiveIndex(i)}
              onMouseDown={(e) => {
                e.preventDefault(); // select before the outside-click handler fires
                choose(o.value);
              }}
            >
              <span>{o.label}</span>
              {o.value === current && <span className="cs-check">✓</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
