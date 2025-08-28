import React, { useEffect, useMemo, useRef, useState } from "react";
import { Yarn, InputEnum } from "../screens/Index";
import { PencilSquareIcon, CheckIcon, XCircleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

interface YarnCardProps {
  yarn: Yarn;
  onUpdate: (id: Yarn["id"], data: Partial<Yarn>) => void;
}

// ---------- helpers ----------
const sanitizeColor = (c?: string) => (c ?? "").toLowerCase().trim() || "slate";

const isDarkBg = (bg: string) => {
  const v = bg.toLowerCase().trim();
  if (v === "black") return true;
  // Try to parse #rgb/#rrggbb
  const hex = v.startsWith("#")
    ? v.slice(1)
    : null;
  if (!hex) return false;
  const h = hex.length === 3
    ? hex.split("").map(ch => ch + ch).join("")
    : hex.length === 6
      ? hex
      : null;
  if (!h) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  // Perceived luminance
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L < 128;
};

async function fetchHexByName(name: string, retries = 2): Promise<string | null> {
  const url = `https://api.color.pizza/v1/names/?name=${encodeURIComponent(name)}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(url, { headers: { Accept: "application/json" } });
      if (!resp.ok) {
        if (resp.status === 429 && attempt < retries) {
          // backoff: 300ms, 1200ms, ...
          await new Promise(r => setTimeout(r, 300 * (attempt + 1) ** 2));
          continue;
        }
        console.warn(`color.pizza error: ${resp.status}`);
        return null;
      }
      const json = await resp.json();
      const hex = json?.colors?.[0]?.hex;
      return typeof hex === "string" ? hex : null;
    } catch (e) {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 300 * (attempt + 1) ** 2));
        continue;
      }
      console.error(e);
      return null;
    }
  }
  return null;
}
// --------------------------------

const YarnCard = ({ yarn, onUpdate }: YarnCardProps) => {
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [inputData, setInputData] = useState<Partial<Yarn>>(yarn);

  // Background color for the card. Start with the (sanitized) CSS color name.
  const [bg, setBg] = useState<string>(sanitizeColor(yarn.color));

  // simple in-memory cache for this session
  const cacheRef = useRef(new Map<string, string>());

  // We want the background to reflect the saved yarn.color (not the in-progress edits)
  const savedColorName = useMemo(() => sanitizeColor(yarn.color), [yarn.color]);

  useEffect(() => {
    let cancelled = false;

    // Optimistic: use the CSS color name immediately (browser may support it)
    setBg(savedColorName);

    // If we've looked this up already, use it
    const cached = cacheRef.current.get(savedColorName);
    if (cached) {
      setBg(cached);
      return;
    }

    // Best-effort: resolve to a hex via API
    fetchHexByName(savedColorName).then((hex) => {
      if (cancelled) return;
      if (hex) {
        cacheRef.current.set(savedColorName, hex);
        setBg(hex);
      } else {
        // Stay on the name; cache to avoid repeated calls
        cacheRef.current.set(savedColorName, savedColorName);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [savedColorName]);

  const toggleIsEdit = () => setIsEdit((v) => !v);

  const onClose = () => {
    setIsEdit(false);
    setInputData(yarn);
  };

  const handleInputChange = (field: InputEnum, value: string) => {
    setInputData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = () => {
    setIsEdit(false);
    onUpdate(yarn.id, inputData);
  };

  const dark = isDarkBg(bg);

  const inputClasses = clsx(
    "bg-transparent",
    "border-0",
    "py-2",
    "px-4",
    "rounded-md",
    dark ? "text-white" : "text-black",
    isEdit && "bg-gray-900 cursor-text"
  );

  const cardContainerClasses = clsx(
    "group",
    "relative",
    "rounded-md",
    "flex",
    "flex-col",
    "justify-between",
    "shadow-slate-900",
    "shadow-md",
    "p-4",
    dark ? "text-white" : "text-black"
  );

  return (
    <div
      key={yarn.id}
      className={cardContainerClasses}
      style={{ backgroundColor: bg }}
    >
      <h1 className="font-bold text-xl">Yarn Card</h1>

        <h3 className="font-semibold">Quantity</h3>
        <input
          key={yarn.id + "num"}
          className={clsx(inputClasses, "text-xl mb-2 font-bold")}
          value={inputData.num ?? ""}
          onChange={(e) => handleInputChange(InputEnum.Num, e.target.value)}
        />
        <h3 className="font-semibold">Color</h3>
        <input
          key={yarn.id + "color"}
          className={clsx(inputClasses, "text-xl mb-2 font-bold")}
          value={inputData.color ?? ""}
          onChange={(e) => handleInputChange(InputEnum.Color, e.target.value)}
        />
        <h3 className="font-semibold">Weight</h3>
        <input
          key={yarn.id + "weight"}
          className={clsx(inputClasses, "text-xl mb-2 font-bold")}
          value={inputData.weight ?? ""}
          onChange={(e) => handleInputChange(InputEnum.Weight, e.target.value)}
        />
      
        <h3 className="font-semibold">Length</h3>
        <input
          key={yarn.id + "length"}
          className={clsx(inputClasses, "text-xl mb-2 font-bold")}
          value={inputData.length ?? ""}
          onChange={(e) => handleInputChange(InputEnum.Length, e.target.value)}
        />

      {isEdit ? (
        <>
          <CheckIcon
            onClick={handleUpdate}
            className="h-6 w-6 text-green-500 absolute top-4 right-12 cursor-pointer"
          />
          <XCircleIcon
            onClick={onClose}
            className="h-6 w-6 text-red-900 absolute top-4 right-4 cursor-pointer"
          />
        </>
      ) : (
        <button
          className="btn btn-active btn-ghost hidden group-hover:block absolute top-4 right-4 p-0"
          onClick={toggleIsEdit}
          aria-label="Edit"
        >
          <PencilSquareIcon className="h-6 w-6 text-slate-50 cursor-pointer" />
        </button>
      )}
    </div>
  );
};

export default YarnCard;
