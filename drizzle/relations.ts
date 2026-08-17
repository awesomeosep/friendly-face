import { relations } from "drizzle-orm/relations";
import { admins, organizations, periods, rooms, roomLayouts, adminOrgLinks } from "./schema";

export const organizationsRelations = relations(organizations, ({one, many}) => ({
	admin: one(admins, {
		fields: [organizations.adminId],
		references: [admins.id]
	}),
	periods: many(periods),
	rooms: many(rooms),
	roomLayouts: many(roomLayouts),
	adminOrgLinks: many(adminOrgLinks),
}));

export const adminsRelations = relations(admins, ({many}) => ({
	organizations: many(organizations),
	adminOrgLinks: many(adminOrgLinks),
}));

export const periodsRelations = relations(periods, ({one, many}) => ({
	organization: one(organizations, {
		fields: [periods.organizationId],
		references: [organizations.id]
	}),
	roomLayouts: many(roomLayouts),
}));

export const roomsRelations = relations(rooms, ({one, many}) => ({
	organization: one(organizations, {
		fields: [rooms.organizationId],
		references: [organizations.id]
	}),
	roomLayouts: many(roomLayouts),
}));

export const roomLayoutsRelations = relations(roomLayouts, ({one}) => ({
	organization: one(organizations, {
		fields: [roomLayouts.organizationId],
		references: [organizations.id]
	}),
	room: one(rooms, {
		fields: [roomLayouts.roomId],
		references: [rooms.id]
	}),
	period: one(periods, {
		fields: [roomLayouts.timePeriodId],
		references: [periods.id]
	}),
}));

export const adminOrgLinksRelations = relations(adminOrgLinks, ({one}) => ({
	admin: one(admins, {
		fields: [adminOrgLinks.adminId],
		references: [admins.id]
	}),
	organization: one(organizations, {
		fields: [adminOrgLinks.organizationId],
		references: [organizations.id]
	}),
}));