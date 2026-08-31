import React, { useState } from "react";
import Image from "next/image";

const ERROR_IMG_SRC =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==";

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false);

  const handleError = () => {
    setDidError(true);
  };

  const { src, alt, style, className, width, height, ...rest } = props;

  // If we don't have width/height from props, we might need a different strategy,
  // but for a generic img replacement, we'll try to use them if provided or fallback.
  const commonProps = {
    className,
    style,
    unoptimized: true, // Since these could be external URLs
    ...rest,
  };

  if (didError) {
    return (
      <div
        className={`inline-block bg-gray-100 text-center align-middle ${className ?? ""}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          <Image
            src={ERROR_IMG_SRC}
            alt="Error loading image"
            width={Number(width) || 88}
            height={Number(height) || 88}
            unoptimized
          />
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src as string}
      alt={alt ?? ""}
      width={Number(width) || 0}
      height={Number(height) || 0}
      {...commonProps}
      onError={handleError}
      // If width/height are not provided, we should probably use fill if parent is relative
      {...(!width || !height ? { fill: true } : {})}
    />
  );
}
