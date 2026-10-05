export const HEYBACKEND_ENDPOINT = "https://heybackend.com/v1/s/FWgE3Ek1jwoPxc4pYe4dwogi";

export async function submitToHeybackend(payload: Record<string, string>): Promise<void> {
  const response = await fetch(HEYBACKEND_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Heybackend responded with ${response.status}`);
  }
}