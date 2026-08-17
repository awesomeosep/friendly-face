import { pgTable, foreignKey, pgPolicy, integer, text, timestamp, uuid, boolean, time, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const organizations = pgTable("organizations", {
	id: integer().primaryKey().notNull(),
	name: text().notNull(),
	code: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	adminId: uuid("admin_id").notNull(),
	isHidden: boolean("is_hidden").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.adminId],
			foreignColumns: [admins.id],
			name: "organizations_admin_id_admins_id_fk"
		}).onDelete("cascade"),
	pgPolicy("allow_select_owner_only", { as: "permissive", for: "select", to: ["authenticated"] }),
]);

export const admins = pgTable("admins", {
	id: uuid().primaryKey().notNull(),
	email: text().notNull(),
	name: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
});

export const periods = pgTable("periods", {
	id: integer().primaryKey().notNull(),
	organizationId: integer("organization_id").notNull(),
	startTime: time("start_time").notNull(),
	endTime: time("end_time").notNull(),
	label: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "periods_organization_id_organizations_id_fk"
		}).onDelete("cascade"),
]);

export const rooms = pgTable("rooms", {
	id: integer().primaryKey().notNull(),
	organizationId: integer("organization_id").notNull(),
	label: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "rooms_organization_id_organizations_id_fk"
		}).onDelete("cascade"),
]);

export const roomLayouts = pgTable("room_layouts", {
	id: integer().primaryKey().notNull(),
	organizationId: integer("organization_id").notNull(),
	timePeriodId: integer("time_period_id").notNull(),
	roomId: integer("room_id").notNull(),
	label: text().notNull(),
	layoutData: jsonb("layout_data").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "room_layouts_organization_id_organizations_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.roomId],
			foreignColumns: [rooms.id],
			name: "room_layouts_room_id_rooms_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.timePeriodId],
			foreignColumns: [periods.id],
			name: "room_layouts_time_period_id_periods_id_fk"
		}).onDelete("cascade"),
]);

export const adminOrgLinks = pgTable("admin_org_links", {
	id: integer().primaryKey().notNull(),
	adminId: uuid("admin_id").notNull(),
	organizationId: integer("organization_id").notNull(),
	adminRole: text("admin_role").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.adminId],
			foreignColumns: [admins.id],
			name: "admin_org_links_admin_id_admins_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "admin_org_links_organization_id_organizations_id_fk"
		}).onDelete("cascade"),
]);
