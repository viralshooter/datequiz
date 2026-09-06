import { customAlphabet } from "nanoid";

// niente caratteri ambigui (0/O, 1/l/I) per link puliti da leggere/digitare
const alphabet = "23456789abcdefghjkmnpqrstuvwxyz";
const generate = customAlphabet(alphabet, 8);

export function generateSlug(): string {
  return generate();
}
