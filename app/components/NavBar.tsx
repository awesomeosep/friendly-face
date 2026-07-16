"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import { cn } from "@/lib/utils";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Alert Dialog",
    href: "https://ui.shadcn.com/docs/primitives/alert-dialog",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Hover Card",
    href: "https://ui.shadcn.com/docs/primitives/hover-card",
    description:
      "For sighted users to preview content available behind a link.",
  },
  {
    title: "Progress",
    href: "https://ui.shadcn.com/docs/primitives/progress",
    description:
      "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
  {
    title: "Scroll-area",
    href: "https://ui.shadcn.com/docs/primitives/scroll-area",
    description: "Visually or semantically separates content.",
  },
  {
    title: "Tabs",
    href: "https://ui.shadcn.com/docs/primitives/tabs",
    description:
      "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },
  {
    title: "Tooltip",
    href: "https://ui.shadcn.com/docs/primitives/tooltip",
    description:
      "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
];

export default function NavigationMenuDemo() {
  const router = useRouter();

  return (
    <div className="absolute pt-4 z-5 w-full flex items-center justify-center drop-shadow-lg">
      <Menubar className="mt-6 bg-white max-w-full absolute z-5">
        <MenubarMenu>
          <MenubarTrigger onClick={() => router.push("/")}>Home</MenubarTrigger>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger onClick={() => router.push("/about")}>About</MenubarTrigger>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger onClick={() => router.push("/location/find")}>Find Location</MenubarTrigger>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger onClick={() => router.push("/login")}>Admin Login</MenubarTrigger>
        </MenubarMenu>
      </Menubar>
      {/* <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            {/* <Link  legacyBehavior passHref> */}
      {/* <NavigationMenuLink href="/" className={navigationMenuTriggerStyle()}>
                Home
              </NavigationMenuLink> */}
      {/* </Link> */}
      {/* </NavigationMenuItem>
          <NavigationMenuItem> */}
      {/* <Link href="/about" legacyBehavior passHref> */}
      {/* <NavigationMenuLink href="/about" className={navigationMenuTriggerStyle()}>
                About
              </NavigationMenuLink> */}
      {/* </Link> */}
      {/* </NavigationMenuItem>
          <NavigationMenuItem> */}
      {/* <Link href="/location/find" legacyBehavior passHref> */}
      {/* <NavigationMenuLink href="/location/find" className={navigationMenuTriggerStyle()}>
                Find Location
              </NavigationMenuLink> */}
      {/* </Link> */}
      {/* </NavigationMenuItem> */}
      {/* </NavigationMenuList> */}
      {/* </NavigationMenu> */}
    </div>
  );
}

// function ListItem({
//   className,
//   title,
//   children,
//   ...props
// }: React.ComponentProps<"a">) {
//   return (
//     <li>
//       <NavigationMenuLink asChild>
//         <a
//           className={cn(
//             "hover:bg-accent block text-main-foreground select-none space-y-1 rounded-base border-2 border-transparent p-3 leading-none no-underline outline-hidden transition-colors hover:border-border",
//             className,
//           )}
//           {...props}
//         >
//           <div className="text-base font-heading leading-none">{title}</div>
//           <p className="font-base line-clamp-2 text-sm leading-snug">
//             {children}
//           </p>
//         </a>
//       </NavigationMenuLink>
//     </li>
//   );
// }
// ListItem.displayName = "ListItem";
