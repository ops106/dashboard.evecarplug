"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import type { Location } from "@/lib/airtable/mappers";
import { RELOCATION_STATUS_ORDER, RELOCATION_STATUS_REFUSED } from "@/lib/airtable/fields";
import { setRelocationStatusAction } from "@/lib/airtable/relocation-actions";
import { EmptyState } from "@/components/ui/EmptyState";

const SANS_STATUT = "Sans statut";
const COLUMNS: readonly string[] = [...RELOCATION_STATUS_ORDER, RELOCATION_STATUS_REFUSED];

export function RelocationKanban({ locations }: { locations: Location[] }) {
  const [, startTransition] = useTransition();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);

  if (locations.length === 0) {
    return <EmptyState message="Aucune demande de changement d'adresse en cours." />;
  }

  const known = new Set<string>(COLUMNS);
  const columns: { status: string; items: Location[] }[] = COLUMNS.map((status) => ({
    status,
    items: locations.filter((l) => l.relocation.status === status),
  }));
  const other = locations.filter((l) => !l.relocation.status || !known.has(l.relocation.status));
  if (other.length > 0) columns.push({ status: SANS_STATUT, items: other });

  return (
    <div className="kanban-board-wrap">
      <div className="kanban-board">
        {columns.map((column) => {
          const isDropTarget = column.status !== SANS_STATUT;
          return (
            <div
              key={column.status}
              className={`kanban-column ${isDropTarget && overColumn === column.status ? "kanban-column-over" : ""}`}
              onDragOver={(e) => {
                if (!isDropTarget) return;
                e.preventDefault();
                setOverColumn(column.status);
              }}
              onDragLeave={() => setOverColumn((c) => (c === column.status ? null : c))}
              onDrop={(e) => {
                e.preventDefault();
                setOverColumn(null);
                const id = draggingId;
                setDraggingId(null);
                if (!isDropTarget || !id) return;
                startTransition(() => {
                  setRelocationStatusAction(id, column.status);
                });
              }}
            >
              <div className="kanban-column-header">
                <span>{column.status}</span>
                <span className="tag tag-accent">{column.items.length}</span>
              </div>
              <div className="kanban-cards">
                {column.items.length === 0 ? (
                  <div className="kanban-empty">Aucune demande</div>
                ) : (
                  column.items.map((location) => (
                    <div
                      key={location.id}
                      className="kanban-card"
                      draggable
                      onDragStart={() => setDraggingId(location.id)}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setOverColumn(null);
                      }}
                      style={{ opacity: draggingId === location.id ? 0.4 : 1 }}
                    >
                      <Link href={`/locations/${location.id}`} className="kanban-card-title">
                        {location.clientName}
                      </Link>
                      <div className="kanban-card-meta">{location.requesterName}</div>
                      <div className="kanban-card-meta">
                        {location.relocation.newAddress || "—"}
                        {location.relocation.newPostalCode ? ` · ${location.relocation.newPostalCode}` : ""}
                        {location.relocation.newCity ? ` ${location.relocation.newCity}` : ""}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
