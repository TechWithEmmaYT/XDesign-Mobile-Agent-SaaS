import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { LoadingStatusType, useCanvas } from "@/context/canvas-context";
import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";
import CanvasFloatingToolbar from "./canvas-floating-toolbar";
import { TOOL_MODE_ENUM, ToolModeType } from "@/constant/canvas";
import CanvasControls from "./canvas-controls";
import DeviceFrame from "./device-frame";
import HtmlDialog from "./html-dialog";
import { toast } from "sonner";

const DEMO_HTML = `
<div class=\"flex flex-col w-full min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans pt-12 pb-24 px-6 overflow-y-auto relative\">\n \n <!-- Header -->\n <header class=\"flex justify-between items-center mb-8\">\n <div>\n <p class=\"text-[var(--muted-foreground)] text-xs uppercase tracking-widest font-semibold mb-1\">Welcome Back</p>\n <h1 class=\"text-2xl font-bold tracking-tight text-[var(--foreground)]\">Alex Runner</h1>\n </div>\n <div class=\"h-12 w-12 rounded-full border-2 border-[var(--primary)] p-1 overflow-hidden shadow-[0_0_10px_var(--primary)]\">\n <img src=\"https://i.pravatar.cc/150?img=11\" alt=\"User\" class=\"w-full h-full object-cover rounded-full\" />\n </div>\n </header>\n\n <!-- Central Circular Progress -->\n <div class=\"relative flex items-center justify-center mb-10\">\n <!-- Glow Effect -->\n <div class=\"absolute inset-0 bg-[var(--primary)] opacity-20 blur-3xl rounded-full transform scale-75\"></div>\n \n <div class=\"relative w-64 h-64\">\n <svg class=\"w-full h-full transform -rotate-90\">\n <!-- Background Circle -->\n <circle cx=\"128\" cy=\"128\" r=\"120\" stroke=\"var(--muted)\" stroke-width=\"8\" fill=\"transparent\" />\n <!-- Progress Circle (Steps) -->\n <circle cx=\"128\" cy=\"128\" r=\"120\" stroke=\"var(--primary)\" stroke-width=\"8\" fill=\"transparent\" \n stroke-dasharray=\"753.6\" stroke-dashoffset=\"188\" stroke-linecap=\"round\" \n class=\"drop-shadow-[0_0_8px_var(--primary)]\" />\n <!-- Inner Progress (Calories) -->\n <circle cx=\"128\" cy=\"128\" r=\"100\" stroke=\"var(--muted)\" stroke-width=\"6\" fill=\"transparent\" />\n <circle cx=\"128\" cy=\"128\" r=\"100\" stroke=\"var(--accent)\" stroke-width=\"6\" fill=\"transparent\" \n stroke-dasharray=\"628\" stroke-dashoffset=\"200\" stroke-linecap=\"round\" \n class=\"drop-shadow-[0_0_8px_var(--accent)]\" />\n </svg>\n \n <!-- Center Text -->\n <div class=\"absolute inset-0 flex flex-col items-center justify-center\">\n <iconify-icon icon=\"lucide:footprints\" class=\"text-[var(--primary)] text-3xl mb-1\"></iconify-icon>\n <span class=\"text-5xl font-black italic tracking-tighter text-[var(--foreground)]\">8,432</span>\n <span class=\"text-[var(--muted-foreground)] text-sm font-medium uppercase tracking-widest\">Steps</span>\n <div class=\"mt-2 flex items-center gap-1 text-[var(--accent)]\">\n <iconify-icon icon=\"lucide:flame\" width=\"14\"></iconify-icon>\n <span class=\"text-sm font-bold\">420 kcal</span>\n </div>\n </div>\n </div>\n </div>\n\n <!-- Heart Rate Graph -->\n <div class=\"mb-6\">\n <div class=\"flex justify-between items-end mb-4\">\n <h2 class=\"text-lg font-bold flex items-center gap-2\">\n <iconify-icon icon=\"lucide:activity\" class=\"text-[var(--accent)]\"></iconify-icon>\n Heart Rate\n </h2>\n <span class=\"text-[var(--accent)] font-mono font-bold text-xl drop-shadow-[0_0_5px_var(--accent)]\">112 BPM</span>\n </div>\n <div class=\"h-32 w-full bg-[var(--card)] rounded-[var(--radius)] border border-[var(--muted)] relative overflow-hidden p-4 flex items-end\">\n <!-- Grid Lines -->\n <div class=\"absolute inset-0 grid grid-rows-4 w-full h-full opacity-10 pointer-events-none\">\n <div class=\"border-b border-[var(--foreground)]\"></div>\n <div class=\"border-b border-[var(--foreground)]\"></div>\n <div class=\"border-b border-[var(--foreground)]\"></div>\n </div>\n <!-- Graph Line (SVG representation) -->\n <svg class=\"w-full h-full overflow-visible\" preserveAspectRatio=\"none\">\n <path d=\"M0,80 C20,80 40,50 60,60 S100,20 120,40 S160,80 180,70 S220,10 240,30 S280,60 350,50\" \n fill=\"none\" stroke=\"var(--accent)\" stroke-width=\"3\" \n class=\"drop-shadow-[0_0_6px_var(--accent)]\" />\n <!-- Area under curve -->\n <path d=\"M0,80 C20,80 40,50 60,60 S100,20 120,40 S160,80 180,70 S220,10 240,30 S280,60 350,50 V150 H0 Z\" \n fill=\"var(--accent)\" fill-opacity=\"0.1\" />\n </svg>\n </div>\n </div>\n\n <!-- Metrics Grid -->\n <div class=\"grid grid-cols-2 gap-4\">\n <!-- Sleep Card -->\n <button class=\"bg-[var(--card)] p-5 rounded-[var(--radius)] border border-[var(--muted)] flex flex-col items-start active:scale-95 transition-transform\">\n <div class=\"bg-[var(--muted)] p-2 rounded-full mb-3 text-[var(--primary)]\">\n <iconify-icon icon=\"lucide:moon\" width=\"24\" height=\"24\"></iconify-icon>\n </div>\n <span class=\"text-[var(--muted-foreground)] text-xs font-bold uppercase\">Sleep</span>\n <span class=\"text-xl font-bold text-[var(--foreground)]\">7h 20m</span>\n </button>\n\n <!-- Water Card -->\n <button class=\"bg-[var(--card)] p-5 rounded-[var(--radius)] border border-[var(--muted)] flex flex-col items-start active:scale-95 transition-transform\">\n <div class=\"bg-[var(--muted)] p-2 rounded-full mb-3 text-[var(--accent)]\">\n <iconify-icon icon=\"lucide:droplets\" width=\"24\" height=\"24\"></iconify-icon>\n </div>\n <span class=\"text-[var(--muted-foreground)] text-xs font-bold uppercase\">Water</span>\n <span class=\"text-xl font-bold text-[var(--foreground)]\">1,250ml</span>\n </button>\n\n <!-- SpO2 Card -->\n <button class=\"col-span-2 bg-[var(--card)] p-4 rounded-[var(--radius)] border border-[var(--muted)] flex items-center justify-between active:scale-95 transition-transform\">\n <div class=\"flex items-center gap-4\">\n <div class=\"bg-[var(--muted)] p-2 rounded-full text-white\">\n <iconify-icon icon=\"lucide:wind\" width=\"24\" height=\"24\"></iconify-icon>\n </div>\n <div class=\"flex flex-col text-left\">\n <span class=\"text-[var(--muted-foreground)] text-xs font-bold uppercase\">SpO2 Levels</span>\n <span class=\"text-lg font-bold text-[var(--foreground)]\">98% Normal</span>\n </div>\n </div>\n <div class=\"h-2 w-24 bg-[var(--muted)] rounded-full overflow-hidden\">\n <div class=\"h-full w-[98%] bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]\"></div>\n </div>\n </button>\n </div>\n\n <!-- Bottom Navigation (Fixed) -->\n <nav class=\"mobile-bottom-nav\">\n <a href=\"#\" class=\"mobile-bottom-nav-item active\">\n <iconify-icon icon=\"lucide:home\"></iconify-icon>\n <span>Home</span>\n <div class=\"nav-indicator\"></div>\n </a>\n <a href=\"#\" class=\"mobile-bottom-nav-item\">\n <iconify-icon icon=\"lucide:activity\"></iconify-icon>\n <span>Stats</span>\n <div class=\"nav-indicator\"></div>\n </a>\n <a href=\"#\" class=\"mobile-bottom-nav-item\">\n <iconify-icon icon=\"lucide:dumbbell\"></iconify-icon>\n <span>Gym</span>\n <div class=\"nav-indicator\"></div>\n </a>\n <a href=\"#\" class=\"mobile-bottom-nav-item\">\n <iconify-icon icon=\"lucide:user\"></iconify-icon>\n <span>Profile</span>\n <div class=\"nav-indicator\"></div>\n </a>\n </nav>\n\n</div>

`;

const Canvas = ({
  projectId,
  isPending,
  projectName,
}: {
  projectId: string;
  isPending: boolean;
  projectName: string | null;
}) => {
  const {
    theme,
    frames,
    selectedFrame,
    setSelectedFrameId,
    loadingStatus,
    setLoadingStatus,
  } = useCanvas();
  const [toolMode, setToolMode] = useState<ToolModeType>(TOOL_MODE_ENUM.SELECT);
  const [zoomPercent, setZoomPercent] = useState<number>(53);
  const [currentScale, setCurrentScale] = useState<number>(0.53);
  const [openHtmlDialog, setOpenHtmlDialog] = useState(false);
  const [isScreenshotting, setIsScreenshotting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const canvasRootRef = useRef<HTMLDivElement>(null);

  const saveThumbnailToProject = useCallback(
    async (projectId: string | null) => {
      try {
        if (!projectId) return null;
        const result = getCanvasHtmlContent();
        if (!result?.html) return null;
        setSelectedFrameId(null);
        setIsSaving(true);
        const response = await axios.post("/api/screenshot", {
          html: result.html,
          width: result.element.scrollWidth,
          height: 700,
          projectId,
        });
        if (response.data) {
          console.log("Thumbnail saved", response.data);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsSaving(false);
      }
    },
    [setSelectedFrameId]
  );

  useEffect(() => {
    if (!projectId) return;
    if (loadingStatus === "completed") {
      saveThumbnailToProject(projectId);
    }
  }, [loadingStatus, projectId, saveThumbnailToProject]);

  const onOpenHtmlDialog = () => {
    setOpenHtmlDialog(true);
  };

  function getCanvasHtmlContent() {
    const el = canvasRootRef.current;
    if (!el) {
      toast.error("Canvas element not found");
      return null;
    }
    let styles = "";
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) styles += rule.cssText;
      } catch {}
    }

    return {
      element: el,
      html: `
         <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>body{margin:0}*{box-sizing:border-box}${styles}</style>
          </head>
          <body>${el.outerHTML}</body>
          </html>
      `,
    };
  }

  const handleCanvasScreenshot = useCallback(async () => {
    try {
      const result = getCanvasHtmlContent();
      if (!result?.html) {
        toast.error("Failed to get canvas content");
        return null;
      }
      setSelectedFrameId(null);
      setIsScreenshotting(true);

      const response = await axios.post(
        "/api/screenshot",
        {
          html: result.html,
          width: result.element.scrollWidth,
          height: 700,
        },
        {
          responseType: "blob",
          validateStatus: (s) => (s >= 200 && s < 300) || s === 304,
        }
      );
      const title = projectName || "Canvas";
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title.replace(/\s+/g, "-").toLowerCase()}
      -${Date.now()}.png`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Screenshot downloaded");
    } catch (error) {
      console.log(error);
      toast.error("Failed to screenshot canvs");
    } finally {
      setIsScreenshotting(false);
    }
  }, [projectName, setSelectedFrameId]);

  const currentStatus = isSaving
    ? "finalizing"
    : isPending && (loadingStatus === null || loadingStatus !== "idle")
    ? "fetching"
    : loadingStatus !== "idle" && loadingStatus !== "completed"
    ? loadingStatus
    : null;
  return (
    <>
      <div className="relative w-full h-full overflow-hidden">
        <CanvasFloatingToolbar
          projectId={projectId}
          isScreenshotting={isScreenshotting}
          onScreenshot={handleCanvasScreenshot}
        />

        {currentStatus && <CanvasLoader status={currentStatus} />}

        <TransformWrapper
          initialScale={0.53}
          initialPositionX={40}
          initialPositionY={5}
          minScale={0.1}
          maxScale={3}
          wheel={{ step: 0.1 }}
          pinch={{ step: 0.1 }}
          doubleClick={{ disabled: true }}
          centerZoomedOut={false}
          centerOnInit={false}
          smooth={true}
          limitToBounds={false}
          panning={{
            disabled: toolMode !== TOOL_MODE_ENUM.HAND,
          }}
          onTransformed={(ref) => {
            setZoomPercent(Math.round(ref.state.scale * 100));
            setCurrentScale(ref.state.scale);
          }}
        >
          {({ zoomIn, zoomOut }) => (
            <>
              <div
                ref={canvasRootRef}
                className={cn(
                  `absolute inset-0 w-full h-full bg-[#eee]
                  dark:bg-[#242423] p-3
              `,
                  toolMode === TOOL_MODE_ENUM.HAND
                    ? "cursor-grab active:cursor-grabbing"
                    : "cursor-default"
                )}
                style={{
                  backgroundImage:
                    "radial-gradient(circle, var(--primary) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              >
                <TransformComponent
                  wrapperStyle={{
                    width: "100%",
                    height: "100%",
                    overflow: "unset",
                  }}
                  contentStyle={{
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <div>
                    {frames?.map((frame, index: number) => {
                      const baseX = 100 + index * 480;
                      const y = 100;

                      // if (frame.isLoading) {
                      //   return (
                      //     <DeviceFrameSkeleton
                      //       key={index}
                      //       style={{
                      //         transform: `translate(${baseX}px, ${y}px)`,
                      //       }}
                      //     />
                      //   );
                      // }
                      return (
                        <DeviceFrame
                          key={frame.id}
                          frameId={frame.id}
                          projectId={projectId}
                          title={frame.title}
                          html={frame.htmlContent}
                          isLoading={frame.isLoading}
                          scale={currentScale}
                          initialPosition={{
                            x: baseX,
                            y,
                          }}
                          toolMode={toolMode}
                          theme_style={theme?.style}
                          onOpenHtmlDialog={onOpenHtmlDialog}
                        />
                      );
                    })}
                  </div>
                  {/* <DeviceFrame
                    frameId="demo"
                    title="Demo Screen"
                    html={DEMO_HTML}
                    scale={currentScale}
                    initialPosition={{
                      x: 1000,
                      y: 100,
                    }}
                    toolMode={toolMode}
                    theme_style={theme?.style}
                    onOpenHtmlDialog={onOpenHtmlDialog}
                  /> */}
                </TransformComponent>
              </div>

              <CanvasControls
                zoomIn={zoomIn}
                zoomOut={zoomOut}
                zoomPercent={zoomPercent}
                toolMode={toolMode}
                setToolMode={setToolMode}
              />
            </>
          )}
        </TransformWrapper>
      </div>

      <HtmlDialog
        html={selectedFrame?.htmlContent || ""}
        title={selectedFrame?.title}
        theme_style={theme?.style}
        open={openHtmlDialog}
        onOpenChange={setOpenHtmlDialog}
      />
    </>
  );
};

function CanvasLoader({
  status,
}: {
  status?: LoadingStatusType | "fetching" | "finalizing";
}) {
  return (
    <div
      className={cn(
        `absolute top-4 left-1/2 -translate-x-1/2 min-w-40
      max-w-full px-4 pt-1.5 pb-2
      rounded-br-xl rounded-bl-xl shadow-md
      flex items-center space-x-2 z-20
    `,
        status === "fetching" && "bg-gray-500 text-white",
        status === "running" && "bg-amber-500 text-white",
        status === "analyzing" && "bg-blue-500 text-white",
        status === "generating" && "bg-purple-500 text-white",
        status === "finalizing" && "bg-purple-500 text-white"
      )}
    >
      <Spinner className="w-4 h-4 stroke-3!" />
      <span className="text-sm font-semibold capitalize">
        {status === "fetching" ? "Loading Project" : status}
      </span>
    </div>
  );
}

export default Canvas;
