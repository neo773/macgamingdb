"use client";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { UserIcon } from "lucide-react";
import Link from "next/link";


const Acccount = () => {
  const { user, isLoading: isAuthLoading, signIn } = useAuth();

  return (
    <div>
      {user && (
        <Link
          href="/my-reviews"
          className="flex items-center gap-2 text-white hover:text-gray-300 transition"
        >
          <UserIcon size={18} />
          <span>My Reviews</span>
        </Link>
      )}
    </div>
  );
};

export default Acccount;
