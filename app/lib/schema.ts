import z from "zod";

export const OrgSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  code: z.string(),
  created_at: z.date(),
  admin_id: z.uuid(),
  is_hidden: z.boolean(),
});

export const PeriodSchema = z.object({
  id: z.number().int(),
  organization_id: z.number().int(),
  start_time: z.iso.time(),
  end_time: z.iso.time(),
  label: z.string(),
  created_at: z.date(),
});

export const RoomSchema = z.object({
  id: z.number().int(),
  organization_id: z.number().int(),
  label: z.string(),
});

export const AdminUserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  created_at: z.date(),
});

export const LayoutDataSchema = z.object({
  occupancy: z.number().int(),
  canvasWidth: z.number().int(),
  canvasHeight: z.number().int(),
  fixtures: z.array(
    z.object({
      id: z.string(),
      type: z.enum([
        "table_round",
        "table_rect",
        "door",
        "wall",
        "counter",
        "label",
      ]),
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
      rotation: z.number(),
      label: z.string(),
      meta: z.object().optional(),
    }),
  ),
  tableData: z.array(
    z.object({
      id: z.string(),
      seats: z.number().int(),
      seatsFilled: z.number().int(),
      open: z.boolean(),
      interests: z.string(),
      other: z.object().optional(),
    }),
  ),
});

export const RoomLayoutSchema = z.object({
  id: z.number().int(),
  organization_id: z.number().int(),
  time_period_id: z.number().int(),
  room_id: z.number().int(),
  label: z.string(),
  layout_data: LayoutDataSchema,
  created_at: z.date(),
  updated_at: z.date(),
});

