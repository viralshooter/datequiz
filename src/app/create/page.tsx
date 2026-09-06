import { Nav } from "@/components/Nav";
import { AmbientBackground } from "@/components/AmbientBackground";
import { CreateFlow } from "./CreateFlow";

export default function CreatePage() {
  return (
    <div className="relative min-h-dvh text-white">
      <AmbientBackground />
      <div className="relative z-10 flex min-h-dvh flex-col">
        <Nav />
        <CreateFlow />
      </div>
    </div>
  );
}
