// TODO: view basic details of org, like name; select room & period to view layout

"use client";

import { orpc } from "@/lib/orpc";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ORPCError } from "@orpc/client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  AlertCircleIcon,
  ExternalLinkIcon,
  ForwardIcon,
  PencilIcon,
  PlusIcon,
  SaveIcon,
  TrashIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ParamsType = {
  org_id: string;
};

export default function ViewOrgPage() {
  const orgId = parseInt(useParams<ParamsType>().org_id);
  const router = useRouter();
  const {
    isPending: orgLoading,
    data: organization,
    refetch,
  } = useQuery(
    orpc.org.findById.queryOptions({
      input: { id: orgId },
      onError: (error: ORPCError<string, unknown>) => {
        console.error("Error fetching organization:", error);
      },
    }),
  );
  const [newRoomName, setNewRoomName] = useState("");
  const [newPeriodLabel, setNewPeriodLabel] = useState("");
  const [newPeriodStartTime, setNewPeriodStartTime] = useState("");
  const [newPeriodEndTime, setNewPeriodEndTime] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [editingStartTime, setEditingStartTime] = useState<string | null>(null);
  const [editingEndTime, setEditingEndTime] = useState<string | null>(null);
  const [loadingAddItem, setLoadingAddItem] = useState(false);
  const [loadingDeleteItem, setLoadingDeleteItem] = useState(false);
  const [loadingSaveItem, setLoadingSaveItem] = useState(false);
  const [loadingConnectLayout, setLoadingConnectLayout] = useState(false);
  const [transferFromId, setTransferFromId] = useState<number | null>(null);
  const [transferToId, setTransferToId] = useState<number | null>(null);
  const [copyTableData, setCopyTableData] = useState<boolean>(false);
  const [loadingTransferLayout, setLoadingTransferLayout] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);

  const addRoom = async (newRoomName: string) => {
    if (newRoomName.trim() === "") {
      toast.error("Room name cannot be empty.");
      return;
    }
    setLoadingAddItem(true);
    const response = await orpc.org.addRoom.call({
      organization_id: orgId,
      label: newRoomName,
    });
    await refetch();
    console.log(response);
    setNewRoomName("");
    toast.success("Room added.");
    setLoadingAddItem(false);
  };

  const updateRoom = async (roomId: number, newRoomName: string) => {
    if (newRoomName.trim() === "") {
      toast.error("Room name cannot be empty.");
      return;
    }
    setLoadingSaveItem(true);
    const response = await orpc.org.updateRoomDetails.call({
      id: roomId,
      label: newRoomName,
      organization_id: orgId,
    });
    await refetch();
    console.log(response);
    setNewRoomName("");
    toast.success("Room updated.");
    setEditingId(null);
    setEditingLabel(null);
    setEditingStartTime(null);
    setEditingEndTime(null);
    setLoadingSaveItem(false);
  };

  const deleteRoom = async (roomId: number) => {
    setLoadingDeleteItem(true);
    const response = await orpc.org.deleteRoom.call({
      id: roomId,
      organization_id: orgId,
    });
    console.log(response);
    toast.success("Room deleted.");
    await refetch();
    setLoadingDeleteItem(false);
  };

  const addPeriod = async (
    newPeriodLabel: string,
    newPeriodStartTime: string,
    newPeriodEndTime: string,
  ) => {
    if (newPeriodLabel.trim() === "") {
      toast.error("Period label cannot be empty.");
      return;
    }
    setLoadingAddItem(true);
    const response = await orpc.org.addPeriod.call({
      organization_id: orgId,
      label: newPeriodLabel,
      start_time: newPeriodStartTime,
      end_time: newPeriodEndTime,
    });
    console.log(response);
    await refetch();
    setNewPeriodLabel("");
    setNewPeriodStartTime("");
    setNewPeriodEndTime("");
    setLoadingAddItem(false);
  };

  const updatePeriod = async (
    periodId: number,
    newPeriodLabel: string,
    newPeriodStartTime: string,
    newPeriodEndTime: string,
  ) => {
    if (
      newPeriodLabel.trim() === "" ||
      newPeriodStartTime.trim() === "" ||
      newPeriodEndTime.trim() === ""
    ) {
      toast.error("Period label, start time, or end time cannot be empty.");
      return;
    }
    setLoadingSaveItem(true);
    const response = await orpc.org.updatePeriodDetails.call({
      id: periodId,
      label: newPeriodLabel,
      start_time: newPeriodStartTime,
      end_time: newPeriodEndTime,
      organization_id: orgId,
    });
    await refetch();
    console.log(response);
    setEditingId(null);
    setEditingLabel(null);
    setEditingStartTime(null);
    setEditingEndTime(null);
    toast.success("Period updated.");
    setLoadingSaveItem(false);
  };

  const deletePeriod = async (periodId: number) => {
    setLoadingDeleteItem(true);
    const response = await orpc.org.deletePeriod.call({
      id: periodId,
      organization_id: orgId,
    });
    console.log(response);
    toast.success("Period deleted.");
    await refetch();
    setLoadingDeleteItem(false);
  };

  const addConnectedLayout = async (
    roomId: number,
    periodId: number,
    label: string,
  ) => {
    setLoadingConnectLayout(true);
    const response = await orpc.org.addConnectedLayout.call({
      organization_id: orgId,
      room_id: roomId,
      time_period_id: periodId,
      label: label,
    });
    toast.success("Connected layout added.");
    await refetch();
    setLoadingConnectLayout(false);
  };

  const updateLayoutDetails = async (
    layoutId: number,
    label: string,
    layoutData: object,
  ) => {
    if (label.trim() === "") {
      toast.error("Layout label cannot be empty.");
      return;
    }
    setLoadingConnectLayout(true);
    const response = await orpc.org.updateRoomLayout.call({
      id: layoutId,
      label: label,
      layout_data: JSON.stringify(layoutData),
      organization_id: orgId,
    });
    toast.success("Layout updated.");
    await refetch();
    setLoadingConnectLayout(false);
  };

  const transferLayout = async (
    fromId: number | null,
    toId: number | null,
    copyTableData: boolean,
  ) => {
    try {
      setLoadingTransferLayout(true);
      if (fromId === null || toId === null) {
        setLoadingTransferLayout(false);
        return;
      }
      const response = await orpc.org.transferLayout.call({
        from_id: fromId,
        to_id: toId,
        copy_table_data: copyTableData,
        organization_id: orgId,
      });
      toast.success("Layout transferred.");
      await refetch();
    } catch (error) {
      console.error("Error transferring layout:", error);
      toast.error("Error transferring layout.");
    } finally {
      setLoadingTransferLayout(false);
    }
  };

  return (
    <div className="flex flex-col w-screen max-w-screen items-center py-16 pb-24 pt-24">
      <div className="flex flex-col w-full gap-4 max-w-md px-8">
        <div className="flex flex-col max-w-full">
          {!orgLoading ? (
            organization ? (
              <div>
                <div className="flex flex-col gap-2 mb-4">
                  <h1 className="text-3xl font-heading">{organization.name}</h1>
                  <p>Code: {organization.code}</p>
                </div>
                <Tabs
                  defaultValue="rooms"
                  onValueChange={(value) => setEditingId(null)}
                >
                  <TabsList className="w-full">
                    <TabsTrigger value="rooms">Rooms</TabsTrigger>
                    <TabsTrigger value="periods">Periods</TabsTrigger>
                    <TabsTrigger value="layouts">Layouts</TabsTrigger>
                  </TabsList>
                  <TabsContent value="rooms">
                    <div className="flex flex-col gap-4 pt-2">
                      {organization.rooms.length === 0 ? (
                        <p className="text-center mt-2 text-muted-foreground">
                          No rooms found.
                        </p>
                      ) : (
                        organization.rooms.map((room) => (
                          <Item key={room.id} variant="outline">
                            <ItemContent>
                              {editingId === room.id ? (
                                <div className="flex flex-row gap-2 items-center">
                                  <Input
                                    type="text"
                                    value={editingLabel ?? ""}
                                    onChange={(e) => {
                                      setEditingLabel(e.target.value);
                                    }}
                                  />
                                </div>
                              ) : (
                                <ItemTitle>{room.label}</ItemTitle>
                              )}
                            </ItemContent>
                            <ItemActions>
                              {editingId === room.id && (
                                <Button
                                  size="icon"
                                  variant="outline"
                                  disabled={
                                    editingLabel?.trim() === "" ||
                                    loadingSaveItem
                                  }
                                  onClick={() => {
                                    updateRoom(room.id, editingLabel ?? "");
                                  }}
                                >
                                  <SaveIcon />
                                </Button>
                              )}
                              {editingId === room.id ? (
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingId(null);
                                  }}
                                >
                                  <XIcon />
                                </Button>
                              ) : (
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingId(room.id);
                                    setEditingLabel(room.label);
                                  }}
                                >
                                  <PencilIcon />
                                </Button>
                              )}
                              <Button
                                size="icon"
                                variant="outline"
                                disabled={loadingDeleteItem}
                                onClick={() => deleteRoom(room.id)}
                              >
                                {loadingDeleteItem && editingId === room.id ? (
                                  <Spinner />
                                ) : (
                                  <TrashIcon />
                                )}
                              </Button>
                            </ItemActions>
                          </Item>
                        ))
                      )}
                    </div>
                    <Card className="mt-8">
                      <CardHeader>
                        <CardTitle>Add room</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Field>
                          <FieldLabel>Room Name</FieldLabel>
                          <Input
                            type="text"
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                          />
                        </Field>
                      </CardContent>
                      <CardFooter>
                        <Button
                          disabled={loadingAddItem || newRoomName.trim() === ""}
                          onClick={() => addRoom(newRoomName)}
                        >
                          {loadingAddItem ? <Spinner /> : <PlusIcon />}
                          Add
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                  <TabsContent value="periods">
                    <div className="flex flex-col gap-4 pt-2">
                      {organization.periods.length === 0 ? (
                        <p className="text-center mt-2 text-muted-foreground">
                          No periods found.
                        </p>
                      ) : (
                        organization.periods.map((period) => (
                          <Item key={period.id} variant="outline">
                            <ItemContent>
                              {editingId === period.id ? (
                                <div className="flex flex-row gap-2 items-center">
                                  <Input
                                    type="text"
                                    value={editingLabel ?? ""}
                                    onChange={(e) => {
                                      setEditingLabel(e.target.value);
                                    }}
                                  />
                                  <Input
                                    type="time"
                                    value={editingStartTime ?? ""}
                                    onChange={(e) => {
                                      setEditingStartTime(e.target.value);
                                    }}
                                  />
                                  <Input
                                    type="time"
                                    value={editingEndTime ?? ""}
                                    onChange={(e) => {
                                      setEditingEndTime(e.target.value);
                                    }}
                                  />
                                </div>
                              ) : (
                                <div>
                                  <ItemTitle>{period.label}</ItemTitle>
                                  <ItemDescription>
                                    {Temporal.PlainTime.from(
                                      period.start_time,
                                    ).toLocaleString()}{" "}
                                    -{" "}
                                    {Temporal.PlainTime.from(
                                      period.end_time,
                                    ).toLocaleString()}
                                  </ItemDescription>
                                </div>
                              )}
                            </ItemContent>
                            <ItemActions>
                              {editingId === period.id && (
                                <Button
                                  size="icon"
                                  variant="outline"
                                  disabled={
                                    editingLabel?.trim() === "" ||
                                    editingStartTime?.trim() === "" ||
                                    editingEndTime?.trim() === "" ||
                                    loadingSaveItem
                                  }
                                  onClick={() => {
                                    updatePeriod(
                                      period.id,
                                      editingLabel ?? "",
                                      editingStartTime ?? "",
                                      editingEndTime ?? "",
                                    );
                                  }}
                                >
                                  <SaveIcon />
                                </Button>
                              )}
                              {editingId === period.id ? (
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingId(null);
                                  }}
                                >
                                  <XIcon />
                                </Button>
                              ) : (
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingId(period.id);
                                    setEditingLabel(period.label);
                                    console.log(
                                      "period.start_time:",
                                      period.start_time
                                        .split(":")
                                        .slice(0, 2)
                                        .join(":"),
                                    );
                                    setEditingStartTime(
                                      period.start_time
                                        .split(":")
                                        .slice(0, 2)
                                        .join(":"),
                                    );
                                    setEditingEndTime(
                                      period.end_time
                                        .split(":")
                                        .slice(0, 2)
                                        .join(":"),
                                    );
                                  }}
                                >
                                  <PencilIcon />
                                </Button>
                              )}
                              <Button
                                size="icon"
                                variant="outline"
                                disabled={loadingDeleteItem}
                                onClick={() => deletePeriod(period.id)}
                              >
                                <TrashIcon />
                              </Button>
                            </ItemActions>
                          </Item>
                        ))
                      )}
                    </div>
                    <Card className="mt-8">
                      <CardHeader>
                        <CardTitle>Add period</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-4">
                        <Field>
                          <FieldLabel>Period Label</FieldLabel>
                          <Input
                            type="text"
                            value={newPeriodLabel}
                            onChange={(e) => setNewPeriodLabel(e.target.value)}
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Start Time</FieldLabel>
                          <Input
                            type="time"
                            id="start-time-picker"
                            value={newPeriodStartTime}
                            onChange={(e) =>
                              setNewPeriodStartTime(e.target.value)
                            }
                            className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                          />
                        </Field>
                        <Field>
                          <FieldLabel>End Time</FieldLabel>
                          <Input
                            type="time"
                            id="end-time-picker"
                            value={newPeriodEndTime}
                            onChange={(e) =>
                              setNewPeriodEndTime(e.target.value)
                            }
                            className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                          />
                        </Field>
                      </CardContent>
                      <CardFooter>
                        <Button
                          disabled={
                            newPeriodLabel.trim() === "" ||
                            newPeriodStartTime.trim() === "" ||
                            newPeriodEndTime.trim() === "" ||
                            loadingAddItem
                          }
                          onClick={() =>
                            addPeriod(
                              newPeriodLabel,
                              newPeriodStartTime,
                              newPeriodEndTime,
                            )
                          }
                        >
                          {loadingAddItem ? <Spinner /> : <PlusIcon />}
                          Add
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                  <TabsContent value="layouts">
                    <div className="flex flex-col gap-4 pt-2">
                      {organization.periods.length === 0 &&
                      organization.rooms.length === 0 ? (
                        <p className="text-center mt-2 text-muted-foreground">
                          No rooms or periods found.
                        </p>
                      ) : (
                        [
                          ...Array(
                            organization.periods.length *
                              organization.rooms.length,
                          ).keys(),
                        ].map((layout_number) => {
                          const possibleLayouts = [
                            ...Array(
                              organization.periods.length *
                                organization.rooms.length,
                            )
                              .keys()
                              .map((item_num) => {
                                const layout_room_id =
                                  organization.rooms[
                                    item_num % organization.rooms.length
                                  ].id;
                                const layout_period_id =
                                  organization.periods[
                                    Math.floor(
                                      item_num / organization.rooms.length,
                                    )
                                  ].id;
                                const found_layout =
                                  organization.room_layouts.filter(
                                    (layout) =>
                                      layout.room_id === layout_room_id &&
                                      layout.time_period_id ===
                                        layout_period_id,
                                  );
                                const existing_layout = found_layout.length > 0;
                                return {
                                  existing: existing_layout,
                                  id: existing_layout
                                    ? found_layout[0].id
                                    : null,
                                  label: existing_layout
                                    ? found_layout[0].label
                                    : null,
                                };
                              }),
                          ];
                          const layout_room_id =
                            organization.rooms[
                              layout_number % organization.rooms.length
                            ].id;
                          const layout_period_id =
                            organization.periods[
                              Math.floor(
                                layout_number / organization.rooms.length,
                              )
                            ].id;
                          const found_layout = organization.room_layouts.filter(
                            (layout) =>
                              layout.room_id === layout_room_id &&
                              layout.time_period_id === layout_period_id,
                          );
                          const existing_layout = found_layout.length > 0;
                          const layout_period =
                            organization.periods[
                              Math.floor(
                                layout_number / organization.rooms.length,
                              )
                            ];
                          const layout_room =
                            organization.rooms[
                              layout_number % organization.rooms.length
                            ];
                          return (
                            <Item
                              key={layout_room_id + "-" + layout_period_id}
                              variant="outline"
                            >
                              {existing_layout &&
                              editingId === found_layout[0].id ? (
                                <div className="flex flex-row gap-2 items-center">
                                  <Input
                                    type="text"
                                    value={editingLabel ?? ""}
                                    onChange={(e) => {
                                      setEditingLabel(e.target.value);
                                    }}
                                  />
                                </div>
                              ) : (
                                <ItemContent>
                                  <ItemTitle>
                                    {layout_room.label} x {layout_period.label}
                                  </ItemTitle>
                                  <ItemDescription>
                                    {existing_layout
                                      ? found_layout[0].label
                                      : "No connected layout"}
                                  </ItemDescription>
                                </ItemContent>
                              )}
                              {existing_layout ? (
                                <ItemActions>
                                  {editingId === found_layout[0].id ? (
                                    <div className="flex flex-row gap-2">
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        disabled={
                                          editingLabel?.trim() === "" ||
                                          loadingSaveItem
                                        }
                                        onClick={() => {
                                          updateLayoutDetails(
                                            found_layout[0].id,
                                            editingLabel ?? "",
                                            JSON.parse(
                                              JSON.stringify(
                                                found_layout[0].layout_data,
                                              ),
                                            ),
                                          );
                                        }}
                                      >
                                        <SaveIcon />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => {
                                          setEditingId(null);
                                        }}
                                      >
                                        <XIcon />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="flex flex-row gap-2">
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => {
                                          setEditingId(found_layout[0].id);
                                          setEditingLabel(
                                            found_layout[0].label,
                                          );
                                        }}
                                      >
                                        <PencilIcon />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => {
                                          router.push(
                                            `/location/${organization.id}/room/${found_layout[0].room_id}/period/${found_layout[0].time_period_id}/edit`,
                                          );
                                        }}
                                      >
                                        <ExternalLinkIcon />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() =>
                                          setTransferDialogOpen(true)
                                        }
                                      >
                                        <ForwardIcon />
                                      </Button>
                                      <Dialog
                                        open={transferDialogOpen}
                                        onOpenChange={setTransferDialogOpen}
                                      >
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>
                                              Transfer Layout
                                            </DialogTitle>
                                            <DialogDescription>
                                              {
                                                "Copy one layout's data into another."
                                              }
                                            </DialogDescription>
                                          </DialogHeader>
                                          <div className="flex flex-col gap-4">
                                            <div className="flex flex-row grid-cols-2 gap-2">
                                              <Field>
                                                <FieldLabel>From</FieldLabel>
                                                <Select
                                                  value={transferFromId}
                                                  onValueChange={(value) =>
                                                    setTransferFromId(value)
                                                  }
                                                  items={organization.room_layouts.map(
                                                    (layout2) => {
                                                      return {
                                                        value: layout2.id,
                                                        label: layout2.label,
                                                      };
                                                    },
                                                  )}
                                                >
                                                  <SelectTrigger id="checkout-exp-month-ts6">
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectGroup>
                                                      {organization.room_layouts
                                                        .map((layout2) => {
                                                          return {
                                                            value: layout2.id,
                                                            label:
                                                              layout2.label,
                                                          };
                                                        })
                                                        .map((item) => (
                                                          <SelectItem
                                                            key={item.value}
                                                            value={item.value}
                                                          >
                                                            {item.label}
                                                          </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                  </SelectContent>
                                                </Select>
                                              </Field>
                                              <Field>
                                                <FieldLabel>To</FieldLabel>
                                                <Select
                                                  value={transferToId}
                                                  onValueChange={(value) =>
                                                    setTransferToId(value)
                                                  }
                                                  items={organization.room_layouts.map(
                                                    (layout2) => {
                                                      return {
                                                        value: layout2.id,
                                                        label: layout2.label,
                                                      };
                                                    },
                                                  )}
                                                >
                                                  <SelectTrigger>
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectGroup>
                                                      {organization.room_layouts
                                                        .map((layout2) => {
                                                          return {
                                                            value: layout2.id,
                                                            label:
                                                              layout2.label,
                                                          };
                                                        })
                                                        .map((item) => (
                                                          <SelectItem
                                                            key={item.value}
                                                            value={item.value}
                                                          >
                                                            {item.label}
                                                          </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                  </SelectContent>
                                                </Select>
                                              </Field>
                                            </div>
                                            <Field orientation="horizontal">
                                              <Checkbox
                                                checked={copyTableData}
                                                onCheckedChange={(checked) =>
                                                  setCopyTableData(
                                                    checked as boolean,
                                                  )
                                                }
                                              />
                                              <FieldLabel className="font-normal">
                                                Copy table data
                                              </FieldLabel>
                                            </Field>
                                            {transferFromId && transferToId && (
                                              <Alert
                                                variant="destructive"
                                                className="max-w-md"
                                              >
                                                <AlertCircleIcon />
                                                <AlertTitle>
                                                  Important
                                                </AlertTitle>
                                                <AlertDescription>
                                                  {`This action will overwrite all layout data (including table data) for the ${organization.room_layouts.filter((layout) => layout.id === transferFromId).length > 0 ? organization.room_layouts.filter((layout) => layout.id === transferToId)[0].label : "Unknown"} layout.`}
                                                </AlertDescription>
                                              </Alert>
                                            )}
                                          </div>
                                          {transferFromId &&
                                            transferToId &&
                                            transferFromId == transferToId && (
                                              <p>
                                                Transfer from and to fields
                                                cannot be equal.
                                              </p>
                                            )}
                                          <DialogFooter>
                                            <Button
                                              disabled={
                                                !transferFromId ||
                                                !transferToId ||
                                                transferFromId ===
                                                  transferToId ||
                                                loadingTransferLayout
                                              }
                                              onClick={async () => {
                                                await transferLayout(
                                                  transferFromId,
                                                  transferToId,
                                                  copyTableData,
                                                );
                                                setTransferDialogOpen(false);
                                              }}
                                            >
                                              {loadingTransferLayout && (
                                                <Spinner />
                                              )}
                                              Transfer
                                            </Button>
                                            <Button
                                              variant="outline"
                                              onClick={() =>
                                                setTransferDialogOpen(false)
                                              }
                                            >
                                              Close
                                            </Button>
                                          </DialogFooter>
                                        </DialogContent>
                                      </Dialog>
                                    </div>
                                  )}
                                </ItemActions>
                              ) : (
                                <ItemActions>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => {
                                      addConnectedLayout(
                                        layout_room_id,
                                        layout_period_id,
                                        layout_room.label +
                                          " - " +
                                          layout_period.label,
                                      );
                                    }}
                                  >
                                    <PlusIcon />
                                  </Button>
                                </ItemActions>
                              )}
                            </Item>
                          );
                        })
                      )}
                    </div>
                    <Card className="mt-8">
                      <CardHeader>
                        <CardTitle>Add period</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-4">
                        <Field>
                          <FieldLabel>Period Label</FieldLabel>
                          <Input
                            type="text"
                            value={newPeriodLabel}
                            onChange={(e) => setNewPeriodLabel(e.target.value)}
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Start Time</FieldLabel>
                          <Input
                            type="time"
                            id="start-time-picker"
                            value={newPeriodStartTime}
                            onChange={(e) =>
                              setNewPeriodStartTime(e.target.value)
                            }
                            className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                          />
                        </Field>
                        <Field>
                          <FieldLabel>End Time</FieldLabel>
                          <Input
                            type="time"
                            id="end-time-picker"
                            value={newPeriodEndTime}
                            onChange={(e) =>
                              setNewPeriodEndTime(e.target.value)
                            }
                            className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                          />
                        </Field>
                      </CardContent>
                      <CardFooter>
                        <Button
                          disabled={
                            newPeriodLabel.trim() === "" ||
                            newPeriodStartTime.trim() === "" ||
                            newPeriodEndTime.trim() === "" ||
                            loadingAddItem
                          }
                          onClick={() =>
                            addPeriod(
                              newPeriodLabel,
                              newPeriodStartTime,
                              newPeriodEndTime,
                            )
                          }
                        >
                          {loadingAddItem ? <Spinner /> : <PlusIcon />}
                          Add
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <p>Organization not found</p>
            )
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
}
