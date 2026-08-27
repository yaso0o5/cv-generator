import { BuilderLoader } from "@/components/editor/builder";

export default async function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BuilderLoader id={id} />;
}
