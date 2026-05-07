import React, { useRef, useState, useEffect } from "react";

export default function OTPInput({ length = 6, value = "", onChange }) {
  const [digits, setDigits] = useState(() => {
    const arr = Array(length).fill("");
    for (let i = 0; i < Math.min(value.length, length); i++) arr[i] = value[i];
    return arr;
  });
  const inputsRef = useRef([]);

  useEffect(() => {
    onChange && onChange(digits.join(""));
  }, [digits]);

  useEffect(() => {
    // sync external value
    if (value && value.length === length) setDigits(value.split(""));
  }, [value, length]);

  const handleChange = (e, idx) => {
    const ch = e.target.value.replace(/[^0-9]/g, "").slice(0, 1);
    if (!ch) return;
    const next = [...digits];
    next[idx] = ch;
    setDigits(next);
    // move focus
    if (idx < length - 1) inputsRef.current[idx + 1].focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      if (digits[idx]) {
        const next = [...digits];
        next[idx] = "";
        setDigits(next);
      } else if (idx > 0) {
        inputsRef.current[idx - 1].focus();
        const next = [...digits];
        next[idx - 1] = "";
        setDigits(next);
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      inputsRef.current[idx - 1].focus();
    } else if (e.key === "ArrowRight" && idx < length - 1) {
      inputsRef.current[idx + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData)
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (!pasted) return;
    const next = Array(length).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    // focus last filled
    const lastFilled = Math.min(pasted.length, length) - 1;
    if (lastFilled >= 0) inputsRef.current[lastFilled].focus();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          value={d}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          className="w-12 h-12 text-center border rounded-lg text-lg font-mono focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
      ))}
    </div>
  );
}
