# Friendly Face
[friendlyface.app](https://friendlyface.app)

Making lunch what it should be, for everyone—the best period of the day.

## About
FriendlyFace is a web app platform to connect people with similar interest at lunch. With technology and social media, young people are more disconnected in-person than ever. We recognize that it can be difficult to find and connect with like-minded individuals. We strive to create an open, inclusive space where people can fnd each other and build meaningful connections.

## Demo
To demo, use the location code "DEMO123" on the Find Location page. Then select a period and cafeteria to view the layout.

## Technology
- Next.js framework with API
- Drizzle + Supabase database
- Supabase auth
- Shadcn components

## How it was built
- Began with a basic layout editor and viewer, with tables, counters, walls, text, and doors.
![Layout editor](https://github.com/awesomeosep/friendly-face/blob/master/Screenshot%202026-08-27%20180844.png)
- Added Shadcn components and basic home and search page frontend layouts.
- Added basic initial database, organized into organizations, rooms, periods, and layouts.
- Added Supabase auth for admins and corresponding frontend pages for adding, editing, and deleting rooms, periods, and layouts.
- Added separate admin account roles and approval; staged and published layouts
![Admin view](https://github.com/awesomeosep/friendly-face/blob/master/Screenshot%202026-08-27%20181630.png)

## Features
- Search for an organization by code
- See and select rooms and periods in an organization
- View room layouts and lunch tables who are welcoming new people

## AI Usage
AI was used to build the initial version of the layout editor/viewer, which was then edited to meet the needs of the project. AI autocomplete was used for small sections of code.

## Development
Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
