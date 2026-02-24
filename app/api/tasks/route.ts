import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Task } from "../../types";

const DB_PATH = path.join(process.cwd(), "db.json");

function getDb() {
  const data = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(data);
}

function saveDb(data: { tasks: Task[] }) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const column = searchParams.get("column");
  const page = parseInt(searchParams.get("_page") || "1");
  const perPage = parseInt(searchParams.get("_per_page") || "10");

  const db = getDb();
  let tasks: Task[] = db.tasks;

  if (column) {
    tasks = tasks.filter((t) => t.column === column);
  }

  // Simulate json-server v1 pagination response
  const totalItems = tasks.length;
  const totalPages = Math.ceil(totalItems / perPage);
  const start = (page - 1) * perPage;
  const paginatedTasks = tasks.slice(start, start + perPage);

  return NextResponse.json({
    data: paginatedTasks,
    items: totalItems,
    pages: totalPages,
    next: page < totalPages ? page + 1 : null,
    prev: page > 1 ? page - 1 : null,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const db = getDb();

  const newTask = {
    ...body,
    id: Math.random().toString(36).substring(2, 6),
  };

  db.tasks.push(newTask);
  saveDb(db);

  return NextResponse.json(newTask, { status: 201 });
}
