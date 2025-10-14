"use client";

import dynamic from "next/dynamic";

// Render MapPickerInner di client only, tapi tetap dapat tipe props yang rapi
const MapPicker = dynamic(() => import("./MapPickerInner"), { ssr: false });

export default MapPicker;
