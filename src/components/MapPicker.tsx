'use client';

import dynamic from 'next/dynamic';

type Props = {
  lat: number | null;
  lng: number | null;
  onPointChange?: (lat: number, lng: number) => void;
  height?: number | string;
};

const Inner = dynamic(() => import('./MapPickerInner'), { ssr: false });

export default function MapPicker({ lat, lng, onPointChange, height = 340 }: Props) {
  return <Inner lat={lat} lng={lng} onPointChange={onPointChange} height={height} />;
}
