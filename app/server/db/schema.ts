import { relations } from "drizzle-orm";
import { boolean } from "drizzle-orm/pg-core";
import {
  text,
  timestamp,
  time,
  uuid,
  jsonb,
  integer,
  pgTable,
} from "drizzle-orm/pg-core";

export const adminTable = pgTable("admins", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const organizationTable = pgTable("organizations", {
  id: integer("id")
    .primaryKey()
    .$defaultFn(() => Math.floor(Math.random() * 1000000)),
  name: text("name").notNull(),
  code: text("code").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  admin_id: uuid("admin_id")
    .$defaultFn(() => crypto.randomUUID())
    .notNull()
    .references(() => adminTable.id, { onDelete: "cascade" }),
  is_hidden: boolean("is_hidden")
    .notNull()
    .$defaultFn(() => false),
  custom_message_visible: boolean("custom_message_visible"),
  custom_message: text("custom_message"),
  layouts_disabled: boolean("layouts_disabled"),
});

export const periodTable = pgTable("periods", {
  id: integer("id")
    .primaryKey()
    .$defaultFn(() => Math.floor(Math.random() * 1000000)),
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
  id: integer("id")
    .primaryKey()
    .$defaultFn(() => Math.floor(Math.random() * 1000000)),
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
  updated_at: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updated_by: uuid().references(() => adminTable.id, { onDelete: "cascade" }),
  updated_by_ip: text("updated_by_ip"),
  approved_at: timestamp("approved_at"),
  approved_by: uuid().references(() => adminTable.id, { onDelete: "cascade" }),
  approved_by_ip: text("approved_by_ip"),
});

export const roomTable = pgTable("rooms", {
  id: integer("id")
    .primaryKey()
    .$defaultFn(() => Math.floor(Math.random() * 1000000)),
  organization_id: integer("organization_id")
    .notNull()
    .references(() => organizationTable.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
});

export const orgRoleTable = pgTable("org_roles", {
  id: integer("id")
    .primaryKey()
    .$defaultFn(() => Math.floor(Math.random() * 1000000)),
  organization_id: integer("organization_id")
    .notNull()
    .references(() => organizationTable.id, { onDelete: "cascade" }),
  admin_id: uuid("user_id").references(() => adminTable.id, {
    onDelete: "cascade",
  }),
  role: text("role"),
});

// export const adminRelations = relations(adminTable);

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
  updated_by_admin: one(adminTable, {
    fields: [roomLayoutTable.updated_by],
    references: [adminTable.id],
  }),
  approved_by_admin: one(adminTable, {
    fields: [roomLayoutTable.approved_by],
    references: [adminTable.id],
  }),
}));

export const orgRoleRelations = relations(orgRoleTable, ({ one }) => ({
  org: one(organizationTable, {
    fields: [orgRoleTable.organization_id],
    references: [organizationTable.id],
  }),
  admin: one(adminTable, {
    fields: [orgRoleTable.admin_id],
    references: [adminTable.id],
  }),
}));
