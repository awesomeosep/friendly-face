import { pgTable } from "drizzle-orm/pg-core";
import { text, timestamp, time } from "drizzle-orm/pg-core";

export const admin = pgTable("admins", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const organization = pgTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const period = pgTable("periods", {
  id: text("id").primaryKey(),
  organization_id: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  start_time: time("start_time").notNull(),
  end_time: time("end_time").notNull(),
  label: text("label"),
  created_at: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const room_layout = pgTable("room_layouts", {
  id: text("id").primaryKey(),
  organization_id: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  time_period_id: text("time_period_id")
    .notNull()
    .references(() => period.id, { onDelete: "cascade" }),
  room_id: text("room_id")
    .notNull()
    .references(() => room.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  layout_data: text("layout_data").notNull(),
  created_at: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const room = pgTable("rooms", {
  id: text("id").primaryKey(),
  organization_id: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
});