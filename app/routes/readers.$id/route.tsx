import {
  LoaderFunctionArgs,
  SerializeFrom,
  json,
  redirect,
} from "@remix-run/node";
import { useEffect, useState } from "react";
import { Device, DeviceLocation } from "@prisma/client";
import dayjs from "dayjs";
import isEqual from "lodash.isequal";

import prisma from "../../lib/prisma";
import { useLiveLoader } from "../../utils/sse/use-live-loader";

export async function loader({ params }: LoaderFunctionArgs) {
  const oneMinutesAgo = dayjs().subtract(1, "minute").toDate();
  const reader = await prisma.rfidReader.findUnique({
    where: { id: params.id },
    include: {
      deviceLocation: {
        where: { dateTime: { gte: oneMinutesAgo } },
        include: { device: true },
      },
    },
  });
  if (!reader) {
    return redirect("/readers");
  }
  const devices = await prisma.device.findMany();
  return json({ reader, devices });
}

type DeviceLocationWithDevice = SerializeFrom<DeviceLocation> & {
  device: Device;
};

const filterDevices = (deviceLocations: DeviceLocationWithDevice[]) => {
  return deviceLocations
    .filter(
      (deviceLocation) =>
        new Date().getTime() - new Date(deviceLocation.dateTime).getTime() <
        1000 * 15 // 15 seconds
    )
    .map((deviceLocation) => ({
      ...deviceLocation.device,
      dateTime: deviceLocation.dateTime,
    }));
};

export default function ReaderDetails() {
  const { reader } = useLiveLoader<typeof loader>();
  const [detectedDevices, setDetectedDevices] = useState<
    ReturnType<typeof filterDevices>
  >(() =>
    reader.deviceLocation.map((deviceLocation) => ({
      ...deviceLocation.device,
      dateTime: deviceLocation.dateTime,
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const newFilteredData = filterDevices(reader.deviceLocation);
      if (!isEqual(newFilteredData, detectedDevices)) {
        setDetectedDevices(filterDevices(reader.deviceLocation));
      }
    }, 500);
    return () => clearInterval(interval);
  }, [reader.deviceLocation, detectedDevices]);

  return (
    <div className="flex-1">
      <h3 className="text-lg font-semibold mb-2 mt-2">Detected Devices</h3>

      {detectedDevices.length === 0 && (
        <div className="mt-4 bg-slate-50 rounded-xl h-60 flex items-center justify-center">
          <p className="text-sm font-medium text-slate-600">
            No devices detected
          </p>
        </div>
      )}
      <ul className="mt-4">
        {detectedDevices.map((device) => (
          <li
            key={device.id}
            className="flex gap-4 justify-between items-center border p-2 rounded-xl"
          >
            <div className="flex gap-4 items-center">
              <img
                src={device.photo || "https://placehold.co/400"}
                alt={device.tagId}
                className="object-cover h-24 w-24 rounded-md"
              />
              <div>
                <p className="text-sm font-semibold text-blue-600">
                  {device.tagId}
                </p>
                <p className="text-2xl font-semibold">{device.name}</p>
                <p className="text-slate-600">{device.description}</p>
              </div>
            </div>
            <time dateTime={device.dateTime} className="pr-4 text-slate-700">
              {new Date(device.dateTime).toLocaleString()}
            </time>
          </li>
        ))}
      </ul>
    </div>
  );
}
