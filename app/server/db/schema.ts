import { relations, sql } from "drizzle-orm";
import { boolean, pgPolicy } from "drizzle-orm/pg-core";
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
  created_at: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
}).enableRLS();

export const adminOrgLinkTable = pgTable("admin_org_links", {
  id: integer("id")
    .primaryKey()
    .$defaultFn(() => Math.floor(Math.random() * 1000000)),
  admin_id: uuid("admin_id")
    .notNull()
    .references(() => adminTable.id, { onDelete: "cascade" }),
  organization_id: integer("organization_id")
    .notNull()
    .references(() => organizationTable.id, { onDelete: "cascade" }),
  admin_role: text("admin_role").notNull(),
  created_at: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
}).enableRLS();

export const draftRoomLayoutTable = pgTable("draft_room_layouts", {
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
  approved_at: timestamp("approved_at"),
  submitter_admin_id: uuid("submitter_admin_id")
    .notNull()
    .references(() => adminTable.id, { onDelete: "cascade" }),
  approver_admin_id: uuid("approver_admin_id").references(() => adminTable.id, {
    onDelete: "cascade",
  }),
}).enableRLS();

export const organizationTable = pgTable(
  "organizations",
  {
    id: integer("id")
      .primaryKey()
      .$defaultFn(() => Math.floor(Math.random() * 1000000)),
    name: text("name").notNull(),
    code: text("code").notNull(),
    created_at: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    admin_id: uuid("admin_id")
      .$defaultFn(() => crypto.randomUUID())
      .notNull()
      .references(() => adminTable.id, { onDelete: "cascade" }),
    is_hidden: boolean("is_hidden")
      .notNull()
      .$defaultFn(() => false),
  },
  (table) => [
    // 2. Define the explicit SELECT policy matching record owner
    pgPolicy("allow_select_owner_only", {
      for: "select",
      to: "authenticated",
      using: sql`${table.admin_id} = (auth.uid())`,
    }),
  ],
).enableRLS();

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
}).enableRLS();

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
}).enableRLS();

export const roomTable = pgTable("rooms", {
  id: integer("id")
    .primaryKey()
    .$defaultFn(() => Math.floor(Math.random() * 1000000)),
  organization_id: integer("organization_id")
    .notNull()
    .references(() => organizationTable.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
}).enableRLS();

export const adminRelations = relations(adminTable, ({ many }) => ({
  organizations: many(organizationTable),
  admin_org_links: many(adminOrgLinkTable),
}));

export const adminOrgLinkRelations = relations(
  adminOrgLinkTable,
  ({ one, many }) => ({
    organizations: one(organizationTable, {
      fields: [adminOrgLinkTable.organization_id],
      references: [organizationTable.id],
    }),
    admins: one(adminTable, {
      fields: [adminOrgLinkTable.admin_id],
      references: [adminTable.id],
    }),
  }),
);

export const organizationRelations = relations(
  organizationTable,
  ({ many }) => ({
    periods: many(periodTable),
    rooms: many(roomTable),
    room_layouts: many(roomLayoutTable),
    admin_org_links: many(adminOrgLinkTable),
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
