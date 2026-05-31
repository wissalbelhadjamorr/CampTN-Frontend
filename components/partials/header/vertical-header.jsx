import React from "react";
import { useSidebar, useThemeStore } from "@/store";
import { useMediaQuery } from "@/hooks/use-media-query";

const VerticalHeader = ({ handleOpenSearch }) => {
  const { collapsed, setCollapsed, subMenu, sidebarType } = useSidebar();
  const { layout } = useThemeStore();
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const isMobile = useMediaQuery("(min-width: 768px)");

  return <div></div>;
};

export default VerticalHeader;