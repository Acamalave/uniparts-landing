// Usuarios semilla del admin.
// El superadmin se siembra automáticamente cuando se conecte la auth real
// (login por usuario + roles con la cuenta de servicio de Firebase).
// El rol "superadmin" es el máximo: acceso total y no asignable desde la UI.

export type AdminRole = "superadmin" | "owner" | "gerente" | "asesor" | "marketing";

export type AdminUser = {
  email: string;
  nombre: string;
  rol: AdminRole;
  activo: boolean;
};

export const SUPERADMIN: AdminUser = {
  email: "Malave.acacio@gmail.com",
  nombre: "Acacio Malavé",
  rol: "superadmin",
  activo: true,
};

export const ADMIN_USERS: AdminUser[] = [SUPERADMIN];

export const roleBadge: Record<AdminRole, string> = {
  superadmin: "bg-brand-orange/10 text-brand-orange",
  owner: "bg-purple-100 text-purple-700",
  gerente: "bg-blue-100 text-blue-700",
  asesor: "bg-green-100 text-green-700",
  marketing: "bg-pink-100 text-pink-700",
};
