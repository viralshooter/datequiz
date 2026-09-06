import { Nav } from "@/components/Nav";
import { CreateFlow } from "./CreateFlow";

export default function CreatePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-ink text-white">
      <Nav />
      <CreateFlow />
    </div>
  );
}
