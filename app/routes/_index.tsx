import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import rfidImage from "../assets/rfid.png";
import tagImage from "../assets/tag.png";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-semibold mb-6">RFID Demo</h1>
      <div className="flex gap-4">
        <Link
          to="readers"
          className="border w-40 h-40 rounded-xl hover:bg-accent flex flex-col items-center justify-center gap-2"
        >
          <img src={rfidImage} alt="rfid" className="w-12" />
          <span className="font-semibold">RFID readers</span>
        </Link>
        <Link
          to="devices"
          className="border w-40 h-40 rounded-xl hover:bg-accent flex flex-col items-center justify-center gap-2"
        >
          <img src={tagImage} alt="tag" className="w-12" />
          <span className="font-semibold">Devices</span>
        </Link>
      </div>
    </div>
  );
}
