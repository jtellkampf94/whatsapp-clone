import { useState, useCallback } from "react";
import { Point, Area } from "react-easy-crop/types";

export const useImageEditor = () => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const zoomIn = () => {
    setZoom((z) => z + 0.1);
  };

  const zoomOut = () => {
    setZoom((z) => z - 0.1);
  };

  return {
    crop,
    setCrop,
    zoom,
    setZoom,
    zoomIn,
    zoomOut,
    onCropComplete,
    croppedAreaPixels,
  };
};
