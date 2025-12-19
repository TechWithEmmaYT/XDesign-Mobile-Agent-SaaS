import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { helloWorld } from "@/inngest/functions/helloWorld";
import { generateScreens } from "@/inngest/functions/generateScreens";
import { regenerateFrame } from "@/inngest/functions/regenerateFrame";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    /* your functions will be passed here later! */
    helloWorld,
    generateScreens,
    regenerateFrame,
  ],
});
