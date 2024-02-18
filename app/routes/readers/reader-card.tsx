import { Link, useFetcher } from "@remix-run/react";
import { Trash2 } from "lucide-react";

import rfidImage from "../../assets/rfid.png";
import { cn } from "../../lib/utils";
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
import { useState } from "react";

interface Props {
  reader: {
    id: string;
    name: string;
    description: string | null;
  };
  isActive: boolean;
}

export default function ReaderCard({ reader, isActive }: Props) {
  const [open, setOpen] = useState(false);
  const fetcher = useFetcher();

  return (
    <Link
      to={reader.id}
      className={cn(
        "flex flex-col items-center border p-4 rounded-2xl hover:bg-accent group relative",
        isActive && "bg-slate-100 border-slate-300"
      )}
    >
      <img src={rfidImage} alt="RFID" className="w-10" />
      <p className="text-sm font-semibold">{reader.id}</p>
      <h2 className="mt-2 font-semibold">{reader.name}</h2>
      <p className="text-muted-foreground">{reader.description}</p>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="destructive"
            size="icon"
            className="opacity-0 group-hover:opacity-100 absolute top-2 right-2"
          >
            <Trash2 className="w-4 h-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Reader {reader.id}</DialogTitle>
          </DialogHeader>
          <fetcher.Form method="POST" action="/readers" className="mt-4">
            <p>Are you sure to delete this RFID reader?</p>
            <div className="flex flex-col gap-4">
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="readerId" value={reader.id} />
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
          </fetcher.Form>
        </DialogContent>
      </Dialog>
    </Link>
  );
}
