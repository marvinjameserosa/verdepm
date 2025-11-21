"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const MapPicker = dynamic(() => import("./map-picker"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md flex items-center justify-center text-muted-foreground">
      Loading Map...
    </div>
  ),
});

interface LocationPickerDialogProps {
  onLocationSelect: (address: string) => void;
  children?: React.ReactNode;
}

export function LocationPickerDialog({
  onLocationSelect,
  children,
}: LocationPickerDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (address: string) => {
    onLocationSelect(address);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="outline"
            size="icon"
            title="Pick location from map"
            className="shrink-0"
          >
            <MapPin className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Select Location</DialogTitle>
          <DialogDescription>
            Click on the map to select the warehouse location.
          </DialogDescription>
        </DialogHeader>
        <div className="h-[400px] w-full relative">
          {open && <MapPicker onSelect={handleSelect} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
