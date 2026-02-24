import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Task } from "../../../types";

const DB_PATH = path.join(process.cwd(), "db.json");

function getDb() {
  const data = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(data);
}

function saveDb(data: { tasks: Task[] }) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { id } = await params;
  const updates = await request.json();
  const db = getDb();

  const index = db.tasks.findIndex((t: Task) => t.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  db.tasks[index] = { ...db.tasks[index], ...updates };
  saveDb(db);

  return NextResponse.json(db.tasks[index]);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { id } = await params;
  const db = getDb();

  const initialLength = db.tasks.length;
  db.tasks = db.tasks.filter((t: Task) => t.id !== id);

  if (db.tasks.length === initialLength) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  saveDb(db);
  return new Response(null, { status: 204 });
}
