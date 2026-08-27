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
- Built the initial mobile-friendly basic layout editor and viewer, with tables, counters, walls, text, and doors using AI. I added customizations of the UI and table data such as collecting which tables are welcoming new people to sit with them and their interests.
![Layout editor](https://github.com/awesomeosep/friendly-face/blob/master/Screenshot%202026-08-27%20180844.png)
- Added styling: I initially added Neobrutalism components, then realized it would not be easily implemenntable in the layout editor. I wanted the app to have  aconsistent look throughout, so I decided to use basic Shadcn components instead, which also aligned better with the purpose and mood of the site as well.
- Database: Added intiial db, organized into organizations, rooms, periods, and layouts. I had used Drizzle before, so I used that to connect to a Supabase database, starting with a few basic tables. As I added features, I added and modifid tables and fields (such as adding an admins and organzation roles table and modifying the uses of the admin_id field in the organizations table).
- Auth: Added Supabase Auth for admins. I added a login feature, but disabled the signup feature for safety. This allowed me to add the corresponding frontend pages for adding, editing, and deleting rooms, periods, and layouts. I also built the much of backend code to connect to the database at this point.
- To meeet the needs of my school's implementation, I added separate admin account roles for editing and approval. With this, I also added potential for separate staged and published layouts, enabling basic version control for schools.
![Admin view](https://github.com/awesomeosep/friendly-face/blob/master/Screenshot%202026-08-27%20181630.png)

## Features
- Search for an organization by code
- See and select rooms and periods in an organization
- View room layouts and lunch tables who are welcoming new people
- Admin login to edit, add, and delete rooms, periods, and layouts
- Separate editor and approval roles for admins

## AI Usage
AI was used to build the initial version of the layout editor/viewer, which was then edited to meet the needs of the project. AI autocomplete was used for small sections of code.

## Development
Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
