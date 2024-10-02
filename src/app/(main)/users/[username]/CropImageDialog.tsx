"use client";

import { useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Cropper, ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";

export default function CropImageDialog({
  src,
  cropAspectRatio,
  onCrop,
  onClose,
}: {
  src: string;
  cropAspectRatio: number;
  onCrop: (croppedImage: Blob | null) => void;
  onClose: () => void;
}) {
  const cropperRef = useRef<ReactCropperElement>(null);
  function crop() {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    cropper.getCroppedCanvas().toBlob((blob) => onCrop(blob), "image/webp");
    onClose();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crop image</DialogTitle>
        </DialogHeader>
          <Cropper
            src={src}
            initialAspectRatio={cropAspectRatio}
            aspectRatio={cropAspectRatio}
            guides={true}
            zoomable={false}
            responsive={true}
            autoCropArea={1}
            viewMode={1}
            dragMode="move"
            ref={cropperRef}
            className="mx-auto size-fit"
          />
        <DialogFooter>
          <Button variant="outline" onClick={crop}>
            Crop
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
