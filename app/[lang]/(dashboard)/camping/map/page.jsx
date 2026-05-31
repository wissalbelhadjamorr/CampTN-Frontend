import dynamic from "next/dynamic";

const CampingMap = dynamic(() => import("./CampingMap"), {
  ssr: false,
});

export default function CampingMapPage() {
  return <CampingMap />;
}