import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;

	console.log(id);

	return NextResponse.json({ id }, { status: StatusCodes.OK });
}
