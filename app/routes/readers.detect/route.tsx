import { ActionFunctionArgs, json } from "@remix-run/node";
import prisma from "../../lib/prisma";
import { emitter } from "../../utils/sse/emitter.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method === "POST") {
    try {
      const formData = await request.formData();
      const deviceId = formData.get("deviceId") as string;
      const rfidReaderId = formData.get("readerId") as string;
      const dateTimeString = formData.get("dateTime");
      const dateTime =
        dateTimeString && typeof dateTimeString === "string"
          ? new Date(dateTimeString)
          : new Date();
      await prisma.deviceLocation.upsert({
        where: { deviceId },
        create: { dateTime, deviceId, rfidReaderId },
        update: { rfidReaderId, dateTime },
      });
      emitter.emit(`position-changed`);
      return json({ success: true }, 200);
    } catch (error) {
      throw new Response("Something went wrong", { status: 500 });
    }
  } else {
    throw new Response("Method not allowed", { status: 405 });
  }
}
