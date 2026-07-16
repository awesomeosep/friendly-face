import { relations } from "drizzle-orm";
import { integer, pgTable } from "drizzle-orm/pg-core";
import { text, timestamp, time, uuid, jsonb } from "drizzle-orm/pg-core";

export const adminTable = pgTable("admins", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const organizationTable = pgTable("organizations", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  admin_id: uuid("admin_id")
    .$defaultFn(() => crypto.randomUUID())
    .notNull()
    .references(() => adminTable.id, { onDelete: "cascade" }),
});

export const periodTable = pgTable("periods", {
  id: integer("id").primaryKey(),
  organization_id: integer("organization_id")
    .notNull()
    .references(() => organizationTable.id, { onDelete: "cascade" }),
  start_time: time("start_time").notNull(),
  end_time: time("end_time").notNull(),
  label: text("label"),
  created_at: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const roomLayoutTable = pgTable("room_layouts", {
  id: integer("id").primaryKey(),
  organization_id: integer("organization_id")
    .notNull()
    .references(() => organizationTable.id, { onDelete: "cascade" }),
  time_period_id: integer("time_period_id")
    .notNull()
    .references(() => periodTable.id, { onDelete: "cascade" }),
  room_id: integer("room_id")
    .notNull()
    .references(() => roomTable.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  layout_data: jsonb("layout_data").notNull(),
  created_at: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const roomTable = pgTable("rooms", {
  id: integer("id").primaryKey(),
  organization_id: integer("organization_id")
    .notNull()
    .references(() => organizationTable.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
});

export const adminRelations = relations(
  adminTable,
  ({ many }) => ({
    organizations: many(organizationTable),
  }),
);

export const organizationRelations = relations(
  organizationTable,
  ({ many }) => ({
    periods: many(periodTable),
    rooms: many(roomTable),
    room_layouts: many(roomLayoutTable),
  }),
);

export const periodRelations = relations(periodTable, ({ one }) => ({
  org: one(organizationTable, {
    fields: [periodTable.organization_id],
    references: [organizationTable.id],
  }),
}));

export const roomRelations = relations(roomTable, ({ one }) => ({
  org: one(organizationTable, {
    fields: [roomTable.organization_id],
    references: [organizationTable.id],
  }),
}));

export const roomLayoutRelations = relations(roomLayoutTable, ({ one }) => ({
  org: one(organizationTable, {
    fields: [roomLayoutTable.organization_id],
    references: [organizationTable.id],
  }),
  period: one(periodTable, {
    fields: [roomLayoutTable.time_period_id],
    references: [periodTable.id],
  }),
  room: one(roomTable, {
    fields: [roomLayoutTable.room_id],
    references: [roomTable.id],
  }),
}));
