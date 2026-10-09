"use client";
import { useContext } from "react";
import { ChamadosContext } from "../_contexts/ChamadosContext";

export function useChamados() {
  const context = useContext(ChamadosContext);
  if (!context) throw new Error("useChamados deve ser utilizado dentro de ChamadosProvider.");
  return context;
}
