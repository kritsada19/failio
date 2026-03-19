import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const { id } = await params;

        const failure = await prisma.failure.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!failure) {
            return NextResponse.json(
                { message: "Failure not found" },
                { status: 404 }
            )
        }

        if (failure.aiStatus === "PROCESSING") {
            return NextResponse.json(
                { message: "Failure is already processing" },
                { status: 400 }
            )
        }

        const user = await prisma.user.findUnique({
            where: {
                id: String(session.user.id),
            },
        });

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            )
        }

        const isOwner = user.id === failure.userId;

        if (!isOwner) {
            return NextResponse.json(
                { message: "Forbidden" },
                { status: 403 }
            )
        }


        await prisma.failure.update({
            where: {
                id: failure.id,
            },
            data: {
                aiStatus: "PROCESSING"
            }
        })

        const mockAiResult = {
            summary: "ผู้ใช้เผชิญกับความผิดพลาดจากการวางแผนที่ไม่ดีและการเริ่มต้นช้า",
            rootCause: "การผัดวันประกันพรุ่งและไม่มีการแบ่งงานเป็นขั้นตอน",
            suggestions: [
                "เริ่มงานล่วงหน้า",
                "แบ่งงานเป็น task ย่อย",
                "ตั้ง deadline ย่อยสำหรับแต่ละส่วน",
            ],
            lesson: "การวางแผนและเริ่มต้นเร็วช่วยลดความเครียดและลดโอกาสเกิดข้อผิดพลาดซ้ำ",
        };

        await prisma.failure.update({
            where: {
                id: failure.id,
            },
            data: {
                aiResult: mockAiResult,
                aiStatus: "COMPLETED",
                aiAnalyzedAt: new Date(),
            }
        })

        return NextResponse.json({
            message: "Failure analyzed successfully",
            status: 200,
        })

    } catch (error) {
        const { id } = await params;

        const failure = await prisma.failure.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!failure) {
            return NextResponse.json(
                { message: "Failure not found" },
                { status: 404 }
            )
        }

        await prisma.failure.update({
            where: {
                id: failure.id,
            },
            data: {
                aiStatus: "FAILED",
            }
        })
        console.log(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}