"use client";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navMenuLists = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Profile",
    href: "/profile",
  },
  {
    title: "Notifications",
    href: "/notifications",
  },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <>
      {pathname !== "/auth/login" && pathname !== "/auth/register" && (
        <div className="sticky top-0 z-50 w-full bg-white">
          <NavigationMenu className="mx-auto max-w-md w-full border-b-2 bg-white">
            <NavigationMenuList>
              {navMenuLists.map((menu, index) => (
                <NavigationMenuItem key={index}>
                  <Link href={menu.href} legacyBehavior passHref>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      {menu.title}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      )}
    </>
  );
}
