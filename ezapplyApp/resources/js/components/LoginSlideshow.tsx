// LoginSlideshow.tsx
import { useState, useEffect } from "react";

const slides = [
  "/storage/CompanyLogo/Company1.png",
  "/storage/CompanyLogo/Company2.png",
  "/storage/CompanyLogo/Company3.png",
  "/storage/CompanyLogo/Company4.png",
];

export default function LoginSlideshow() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => {const next = (prev + 1) % slides.length;

      // sync gradient each time slide changes
      document.documentElement.style.setProperty(
        "--gradient-pos",
        next % 2 === 0 ? "0%" : "100%"
      );
      return next;
    })
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 h-full w-full bg-cover bg-center transition-opacity duration-1000 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url('${slide}')` }}
        />
      ))}
    </div>
  );
}
