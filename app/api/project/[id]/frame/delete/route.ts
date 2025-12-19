import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) throw new Error("Unauthorized");

    const { frameId } = await request.json();

    if (!frameId) throw new Error("FrameId is required");
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Verify frame belongs to project and delete it
    const frame = await prisma.frame.delete({
      where: {
        id: frameId,
        projectId: projectId,
      },
    });

    if (!frame) {
      return NextResponse.json({ error: "Frame not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Frame deleted successfully",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Frame not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete frame" },
      { status: 500 }
    );
  }
}
