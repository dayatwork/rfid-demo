import { ActionFunctionArgs, json } from "@remix-run/node";
import prisma from "../../lib/prisma";
import { emitter } from "../../utils/sse/emitter.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method === "POST") {
    try {
      const body = await request.json();
      const tagId = body.tagId;
      const rfidReaderId = body.readerId;
      const dateTimeString = body.dateTime;
      const dateTime =
        dateTimeString && typeof dateTimeString === "string"
          ? new Date(dateTimeString)
          : new Date();
      const device = await prisma.device.findUnique({ where: { tagId } });
      if (!device) {
        return json(
          {
            success: false,
            message: `Device with tag ${tagId} not registered`,
          },
          { status: 404 }
        );
      }
      await prisma.deviceLocation.upsert({
        where: { deviceId: device.id },
        create: { dateTime, deviceId: device.id, rfidReaderId },
        update: { rfidReaderId, dateTime },
      });
      emitter.emit(`position-changed`);
      return json({ success: true }, 200);
    } catch (error) {
      console.log("error", error);
      throw new Response("Something went wrong", { status: 500 });
    }
  } else {
    throw new Response("Method not allowed", { status: 405 });
  }
}
