import {
  Form,
  Link,
  json,
  useActionData,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { PlusIcon, Trash2 } from "lucide-react";
import { ActionFunctionArgs } from "@remix-run/node";
import { toast } from "sonner";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import prisma from "../../lib/prisma";
import { cn } from "../../lib/utils";
import { Textarea } from "../../components/ui/textarea";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const tagId = formData.get("tagId") as string;
  const deviceId = formData.get("deviceId") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const photo = formData.get("photo") as string;
  const intent = formData.get("intent") as string;

  if (intent === "create") {
    console.log("CREATE");
    try {
      await prisma.device.create({
        data: { name, tagId, description, photo },
      });
      return json({
        success: true,
        message: "New device added",
        date: new Date(),
      });
    } catch (error) {
      return json({
        success: false,
        message: "Failed to add a new device",
        date: new Date(),
      });
    }
  }

  if (intent === "delete") {
    console.log("DELETE");
    try {
      await prisma.device.delete({ where: { id: deviceId } });
      return json({
        success: true,
        message: "Device deleted",
        date: new Date(),
      });
    } catch (error) {
      return json({
        success: false,
        message: "Failed to delete device",
        date: new Date(),
      });
    }
  }

  return json({
    success: false,
    message: "Incorrect intent",
    date: new Date(),
  });
}

export async function loader() {
  const devices = await prisma.device.findMany();
  return json({ devices });
}

export default function Devices() {
  const actionData = useActionData<typeof action>();
  const { devices } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string>();

  console.log({ devices });

  useEffect(() => {
    if (typeof actionData?.success === "boolean") {
      if (actionData.success) {
        toast.success(actionData.message, { description: actionData.date });
      } else {
        toast.error(actionData.message, { description: actionData.date });
      }
      setAddOpen(false);
      setDeleteOpen(false);
    }
  }, [actionData?.success, actionData?.message, actionData?.date]);

  return (
    <div className="max-w-4xl mx-auto py-10 h-full">
      <div className="flex justify-between items-center mb-6">
        <Link to="/" className="font-semibold text-xl inline-block">
          RFID Demo
        </Link>
      </div>
      <Link to="/" className="inline-flex mb-4 hover:underline">
        &larr; Back to home
      </Link>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold">All Devices</h1>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusIcon className="w-4 h-4 mr-2" /> Device
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Device</DialogTitle>
            </DialogHeader>
            <Form method="POST" className="mt-4">
              <div className="flex flex-col gap-4">
                <input type="hidden" name="intent" value="create" />
                <div className="flex flex-col gap-1">
                  <Label>Tag ID</Label>
                  <Input required name="tagId" />
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Name</Label>
                  <Input required name="name" />
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Photo</Label>
                  <Input required name="photo" />
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Description</Label>
                  <Textarea required name="description" />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Close
                  </Button>
                </DialogClose>
                <Button type="submit">Submit</Button>
              </DialogFooter>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      {devices.length === 0 && (
        <div className="border border-dashed rounded-xl flex items-center justify-center h-32">
          <p className="text-sm font-semibold text-slate-600">No devices</p>
        </div>
      )}
      <ul className="flex gap-4">
        {devices.map((device) => (
          <li key={device.id} className="group relative w-[180px]">
            <Link
              to={device.id}
              className={cn(
                "flex flex-col border rounded-2xl hover:bg-accent",
                pathname.includes(device.id) && "bg-slate-100 border-slate-300"
              )}
            >
              <img
                src={device.photo || ""}
                alt="RFID"
                className="h-40 object-cover w-full"
              />
              <div className="py-2 px-4">
                <p className="text-sm font-semibold">{device.tagId}</p>
                <h2 className="mt-2 font-semibold">{device.name}</h2>
                <p className="mt-1 text-muted-foreground text-sm">
                  {device.description}
                </p>
              </div>
            </Link>
            <button
              type="button"
              className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 h-8 w-8 text-red-700 border bg-red-100 hover:bg-red-300 transition inline-flex justify-center items-center rounded-md"
              onClick={(e) => {
                setSelectedDevice(device.id);
                setDeleteOpen(true);
                e.stopPropagation();
              }}
            >
              <Trash2 className="w-4 h-4" />
              <span className="sr-only">Delete</span>
            </button>
          </li>
        ))}
      </ul>
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogTrigger className="sr-only"></DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete Device{" "}
              {devices.find((device) => device.id === selectedDevice)?.name}
            </DialogTitle>
          </DialogHeader>
          <Form method="POST" className="mt-4">
            <p>Are you sure to delete this device?</p>
            <div className="flex flex-col gap-4">
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="deviceId" value={selectedDevice} />
            </div>
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
              <Button type="submit" variant="destructive">
                Yes, Delete
              </Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
