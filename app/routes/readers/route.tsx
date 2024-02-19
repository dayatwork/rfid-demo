import { ActionFunctionArgs, json } from "@remix-run/node";
import {
  Form,
  Link,
  Outlet,
  useActionData,
  useFetcher,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PlusIcon, Radio, Trash2 } from "lucide-react";

import rfidImage from "../../assets/rfid.png";
import { cn } from "../../lib/utils";
import prisma from "../../lib/prisma";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const id = formData.get("readerId") as string;
  const name = formData.get("name") as string;
  const location = formData.get("location") as string;
  const intent = formData.get("intent") as string;

  if (intent === "create") {
    try {
      await prisma.rfidReader.create({
        data: { id, name, description: location },
      });
      return json({
        success: true,
        message: "New reader added",
        date: new Date(),
      });
    } catch (error) {
      return json({
        success: false,
        message: "Failed to add a new reader",
        date: new Date(),
      });
    }
  }

  if (intent === "delete") {
    try {
      await prisma.rfidReader.delete({ where: { id } });
      return json({
        success: true,
        message: "Reader deleted",
        date: new Date(),
      });
    } catch (error) {
      return json({
        success: false,
        message: "Failed to delete reader",
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
  const [readers, devices] = await Promise.all([
    prisma.rfidReader.findMany(),
    prisma.device.findMany(),
  ]);
  return json({ readers, devices });
}

export default function Readers() {
  const actionData = useActionData<typeof action>();
  const { readers, devices } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedReader, setSelectedReader] = useState<string>();
  const fetcher = useFetcher();
  const submitting = fetcher.state !== "idle";

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
        <fetcher.Form
          className="flex gap-4"
          method="POST"
          action="/readers/detect"
        >
          <Select name="readerId" required>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a reader" />
            </SelectTrigger>
            <SelectContent>
              {readers.map((reader) => (
                <SelectItem key={reader.id} value={reader.id}>
                  {reader.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select name="tagId" required>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a device" />
            </SelectTrigger>
            <SelectContent>
              {devices.map((device) => (
                <SelectItem key={device.id} value={device.tagId}>
                  {device.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" disabled={submitting}>
            <Radio className="w-4 h-4 mr-2" />
            {submitting ? "Reading..." : "Read"}
          </Button>
        </fetcher.Form>
      </div>
      <Link to="/" className="inline-flex mb-4 hover:underline">
        &larr; Back to home
      </Link>
      <div className="flex gap-10 items-start">
        <div className="w-[300px]">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-lg font-semibold">All RFID Readers</h1>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <PlusIcon className="w-4 h-4 mr-2" /> Reader
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Reader</DialogTitle>
                </DialogHeader>
                <Form method="POST" className="mt-4">
                  <div className="flex flex-col gap-4">
                    <input type="hidden" name="intent" value="create" />
                    <div className="flex flex-col gap-1">
                      <Label>Reader ID</Label>
                      <Input required name="readerId" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label>Reader Name</Label>
                      <Input required name="name" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label>Reader Location</Label>
                      <Input required name="location" />
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
          {readers.length === 0 && (
            <div className="border border-dashed rounded-xl flex items-center justify-center h-32">
              <p className="text-sm font-semibold text-slate-600">No readers</p>
            </div>
          )}
          <ul className="flex flex-col gap-4">
            {readers.map((reader) => (
              <li key={reader.id} className="group relative">
                <Link
                  to={reader.id}
                  className={cn(
                    "flex flex-col items-center border p-4 rounded-2xl hover:bg-accent",
                    pathname.includes(reader.id) &&
                      "bg-slate-100 border-slate-300"
                  )}
                >
                  <img src={rfidImage} alt="RFID" className="w-10" />
                  <p className="text-sm font-semibold">{reader.id}</p>
                  <h2 className="mt-2 font-semibold">{reader.name}</h2>
                  <p className="text-muted-foreground">{reader.description}</p>
                </Link>
                <button
                  type="button"
                  className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 h-8 w-8 text-red-700 border bg-red-100 hover:bg-red-300 transition inline-flex justify-center items-center rounded-md"
                  onClick={(e) => {
                    setSelectedReader(reader.id);
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
                <DialogTitle>Delete Reader {selectedReader}</DialogTitle>
              </DialogHeader>
              <Form method="POST" className="mt-4">
                <p>Are you sure to delete this RFID reader?</p>
                <div className="flex flex-col gap-4">
                  <input type="hidden" name="intent" value="delete" />
                  <input type="hidden" name="readerId" value={selectedReader} />
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
        <Outlet />
      </div>
    </div>
  );
}
