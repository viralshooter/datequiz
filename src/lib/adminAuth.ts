export const ADMIN_COOKIE_NAME = "dq_admin";

export function isValidAdminCookie(cookieValue: string | undefined): boolean {
  const expected = process.env.ADMIN_DASHBOARD_PASSWORD;
  return Boolean(expected) && cookieValue === expected;
}
