import { RefObject, useState } from "react";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MediaCropper({
  src,
  cropperRef,
}: {
  src: string;
  cropperRef: RefObject<ReactCropperElement>;
}) {
  const onAspectRatioChange = (ratio: number | undefined) => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    // Set new aspect ratio
    cropper.setAspectRatio(ratio || NaN);

    // Reset crop box to ensure proper sizing with new ratio
    cropper.reset();
  };
  return (
    <>
      <Tabs defaultValue="origin">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="origin"
            onClick={() => onAspectRatioChange(undefined)}
          >
            Origin
          </TabsTrigger>
          <TabsTrigger value="1:1" onClick={() => onAspectRatioChange(1)}>
            1:1
          </TabsTrigger>
          <TabsTrigger value="3:4" onClick={() => onAspectRatioChange(3 / 4)}>
            3:4
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Cropper
        src={src}
        initialAspectRatio={NaN}
        guides={true}
        zoomable={false}
        responsive={true}
        autoCropArea={1}
        viewMode={1}
        dragMode="move"
        ref={cropperRef}
        className="mx-auto size-fit"
      />
    </>
  );
}
