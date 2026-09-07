import { Nav } from "@/components/Nav";
import { PlayfulBackground } from "@/components/PlayfulBackground";
import { CreateFlow } from "./CreateFlow";

export default function CreatePage() {
  return (
    <div className="relative min-h-dvh text-ink">
      <PlayfulBackground />
      <div className="relative z-10 flex min-h-dvh flex-col">
        <Nav />
        <CreateFlow />
      </div>
    </div>
  );
}
