"use client";
import dynamic from "next/dynamic";
const MapPicker = dynamic(() => import("./MapPickerInner"), { ssr: false });
export default MapPicker;
