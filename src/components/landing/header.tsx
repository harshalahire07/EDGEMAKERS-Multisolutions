"use client";

import { EdgemakersLogo } from "@/components/edgemakers-logo";
import Link from "next/link";
import { Button } from "../ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";
import SignInDialog from "@/components/auth/sign-in-dialog";
import { LogIn, LogOut, User, Key, LayoutDashboard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChangePasswordDialog } from "@/components/auth/change-password-dialog";

export default function Header() {
  const { user, isAuthenticated, signOut } = useAuth();
  const [signInOpen, setSignInOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center border-b border-border/50 bg-background/80 px-4 backdrop-blur-sm lg:px-6">
      <Link
        href="/"
        className="flex items-center justify-center"
        prefetch={false}
      >
        <EdgemakersLogo className="h-6 w-auto" />
        <span className="ml-3 font-headline text-xl font-semibold text-foreground">
          EDGEMAKERS
        </span>
      </Link>
      <nav className="ml-auto hidden items-center gap-4 sm:flex sm:gap-6">
        <Link
          href="/about"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:text-accent"
          prefetch={false}
        >
          About
        </Link>
        <Link
          href="/#services"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:text-accent"
          prefetch={false}
        >
          Services
        </Link>
        <Link
          href="/careers"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:text-accent"
          prefetch={false}
        >
          Careers
        </Link>
        <Link
          href="/#contact"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:text-accent"
          prefetch={false}
        >
          Contact
        </Link>

        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                {user?.name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user?.isAdmin && (
                <>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin"
                      className="cursor-pointer w-full flex items-center"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={() => setChangePasswordOpen(true)}>
                <Key className="mr-2 h-4 w-4" />
                Change Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSignInOpen(true)}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Login
          </Button>
        )}
      </nav>

      <SignInDialog
        open={signInOpen}
        onOpenChange={setSignInOpen}
        onSuccess={() => setSignInOpen(false)}
      />

      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
    </header>
  );
}
