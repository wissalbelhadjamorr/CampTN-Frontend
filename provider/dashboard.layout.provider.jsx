"use client";
import React from "react";
import Header from "@/components/partials/header";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "@/hooks/use-media-query";
import MobileSidebar from "@/components/partials/sidebar/mobile-sidebar";
import HeaderSearch from "@/components/header-search";
import { useMounted } from "@/hooks/use-mounted";
import LayoutLoader from "@/components/layout-loader";

const DashBoardLayoutProvider = ({ children, trans }) => {
  const [open, setOpen] = React.useState(false);
  const location = usePathname();
  const isMobile = useMediaQuery("(min-width: 768px)");
  const mounted = useMounted();

  if (!mounted) return <LayoutLoader />;

  return (
    <>
      <Header handleOpenSearch={() => setOpen(true)} trans={trans} />
      <LayoutWrapper isMobile={isMobile} setOpen={setOpen} open={open} location={location}>
        {children}
      </LayoutWrapper>
    </>
  );
};

export default DashBoardLayoutProvider;

const LayoutWrapper = ({ children, isMobile, setOpen, open, location }) => {
  return (
    <>
      <motion.div
        key={location}
        initial="pageInitial"
        animate="pageAnimate"
        exit="pageExit"
        variants={{
          pageInitial: { opacity: 0, y: 50 },
          pageAnimate: { opacity: 1, y: 0 },
          pageExit: { opacity: 0, y: -50 },
        }}
        transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
      >
        <main>{children}</main>
      </motion.div>
      <MobileSidebar className="left-[300px]" />
      <HeaderSearch open={open} setOpen={setOpen} />
    </>
  );
};