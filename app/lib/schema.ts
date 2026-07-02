import z from "zod";

export const OrgSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  code: z.string(),
  created_at: z.date(),
  admin_id: z.uuid(),
});

export const PeriodSchema = z.object({
  id: z.number().int(),
  organization_id: z.number().int(),
  start_time: z.iso.time(),
  end_time: z.iso.time(),
  label: z.string(),
  created_at: z.date(),
});

export const RoomLayoutSchema = z.object({
  id: z.number().int(),
  organization_id: z.number().int(),
  time_period_id: z.number().int(),
  room_id: z.number().int(),
  label: z.string(),
  layout_data: z.json(),
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
