"use client";

import React from "react";
import { useSidebar } from "@/store";

const SidebarLogo = ({ hovered }) => {
  const { collapsed } = useSidebar();

  return (
    <div className="px-4 py-4 flex items-center justify-center">
      
      <img
        src="/images/logo/tunicamp_logo_64.png"
        alt="CampTN"
        className="w-9 h-9 object-contain flex-shrink-0"
      />

      {(!collapsed || hovered) && (
        <span className="ml-3 text-xl text-primary font-semibold whitespace-nowrap">
          CampTN
        </span>
      )}

    </div>
  );
};

export default SidebarLogo;